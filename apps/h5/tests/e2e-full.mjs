// 综合 e2e — 5 Tab × 子 Tab × 4 Modal × 增删改查
// 跑：node tests/e2e-full.mjs
// 输出：tests/e2e-full-results/*.png + report.json

import puppeteer from 'puppeteer-core'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const CHROME = '/tmp/chrome-extract/opt/google/chrome/chrome'
const BASE = 'http://localhost:8765'
const OUT = path.resolve(import.meta.dirname, 'e2e-full-results')
await mkdir(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900 },
})

const page = await browser.newPage()
const consoleErrs = []
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrs.push(m.text())
})
page.on('pageerror', (e) => consoleErrs.push('PAGEERR: ' + e.message))

const results = { steps: [], pass: true, consoleErrors: consoleErrs }

async function step(name, fn) {
  console.log(`\n▶ ${name}`)
  try {
    await fn()
    results.steps.push({ name, pass: true })
    console.log(`  ✓ ${name}`)
  } catch (e) {
    results.steps.push({ name, pass: false, error: String(e).slice(0, 200) })
    results.pass = false
    console.log(`  ✗ ${name}: ${e.message?.slice(0, 200)}`)
  }
}

async function shot(name) {
  await page.screenshot({ path: path.join(OUT, name + '.png') })
  console.log(`  📸 ${name}.png`)
}

async function clickByText(text) {
  return page.evaluate((t) => {
    const els = [...document.querySelectorAll('button, .gg-tab, .gg-subtab, .gg-me-row-title, .gg-me-quick-card, .gg-eq-add')]
    for (const e of els) {
      if (e.textContent?.trim() === t || e.textContent?.includes(t)) { e.click(); return true }
    }
    return false
  }, text)
}

async function clickBySelector(sel) {
  return page.evaluate((s) => {
    const el = document.querySelector(s)
    if (el) { el.click(); return true }
    return false
  }, sel)
}

// 0. 打开主页
await step('打开主页', async () => {
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 15000 })
  await new Promise((r) => setTimeout(r, 800))
  await shot('00-home')
})

// ==================== Matrix Tab ====================
await step('1. Matrix Tab 默认显示 + 4 子 Tab', async () => {
  // 默认就是 matrix
  const subs = await page.$$eval('.gg-subtab', (els) => els.map((e) => e.textContent?.trim()))
  if (subs.length < 3) throw new Error(`期望 ≥3 子 Tab，实际 ${subs.length}: ${subs.join(',')}`)
  console.log(`  子 Tab: ${subs.join(', ')}`)
  await shot('01-matrix')
})

await step('1a. Matrix 切换到 今日 子 Tab', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '今日') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
  await shot('01a-matrix-today')
})

await step('1b. Matrix 切回 全部', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '全部') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
})

await step('1c. Matrix 切换 本周 子 Tab', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '本周') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
  await shot('01c-matrix-week')
})

await step('1d. Matrix 切回 全部', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '全部') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
})

await step('2. 打开 OKR Manager (topbar 我的 OKR)', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-okr-selector, button')) {
      if (t.textContent?.trim() === '我的 OKR') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 400))
  await shot('02-okr-mgr')
  // 关闭
  const closed = await page.evaluate(() => {
    const closeBtns = document.querySelectorAll('.gg-modal-close')
    for (const b of closeBtns) { b.click(); return true }
    return false
  })
  if (!closed) console.log('  ⚠ 没找到关闭按钮')
  await new Promise((r) => setTimeout(r, 300))
})

await step('3. 点 + 添加任务 → 提交 → 任务出现', async () => {
  const addBtns = await page.$$('.gg-eq-add')
  if (addBtns.length === 0) throw new Error('没找到 + 添加任务 按钮')
  await addBtns[0].click()
  await new Promise((r) => setTimeout(r, 300))
  await page.type('input[placeholder*="清晰的名字"]', 'E2E 测试任务')
  await new Promise((r) => setTimeout(r, 200))
  await shot('03-task-modal')
  // 提交
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button.gg-btn.gg-btn-primary')
    for (const b of btns) {
      if (b.textContent?.trim() === '添加') { b.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 400))
  const found = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.gg-eq-task-title')).some((e) => e.textContent === 'E2E 测试任务'),
  )
  if (!found) throw new Error('新任务没出现')
})

await step('4. 点 task → 打开 view modal → 点 标记完成', async () => {
  // 找 e2e 任务
  const found = await page.evaluate(() => {
    const titles = [...document.querySelectorAll('.gg-eq-task-title')]
    const e2e = titles.find((t) => t.textContent === 'E2E 测试任务')
    if (!e2e) return null
    e2e.closest('.gg-eq-task').click()
    return true
  })
  if (!found) throw new Error('找不到 E2E 任务')
  await new Promise((r) => setTimeout(r, 400))
  // 弹窗里点 标记完成
  const toggled = await page.evaluate(() => {
    const btns = document.querySelectorAll('.gg-modal-foot .gg-btn')
    for (const b of btns) {
      const t = b.textContent?.trim()
      if (t === '标记完成' || t === '标记未完成') { b.click(); return t }
    }
    return null
  })
  if (!toggled) throw new Error('找不到 标记完成/未完成 按钮')
  console.log(`  ✓ 点了 ${toggled}`)
  // 关弹窗
  await page.evaluate(() => document.querySelector('.gg-modal-close')?.click())
  await new Promise((r) => setTimeout(r, 300))
  // 切到已完成 验证
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-tab')) {
      if (t.textContent?.trim() === '列表') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '已完成') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
  const inDone = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.gg-sub-label.done, .gg-tree-label.done, .gg-list-task')).some((e) => e.textContent?.includes('E2E'))
  })
  if (!inDone) throw new Error('E2E 任务没在 已完成 列表')
  console.log(`  ✓ 任务出现在 已完成`)
})

// ==================== List Tab ====================
await step('5. 切换到 列表 Tab', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-tab')) {
      if (t.textContent?.trim() === '列表') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 400))
  await shot('05-list')
})

await step('5a. 列表 切换 进行中 子 Tab', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '进行中') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
  await shot('05a-list-progress')
})

await step('5b. 列表 切换 已完成 子 Tab', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '已完成') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
  await shot('05b-list-done')
})

await step('5c. 列表 切回 全部', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '全部') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
})

// ==================== Calendar Tab ====================
await step('6. 切换到 日历 Tab', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-tab')) {
      if (t.textContent?.trim() === '日历') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 400))
  await shot('06-calendar-month')
})

await step('6a. 日历 切换 周 子 Tab', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '周') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
  await shot('06a-calendar-week')
})

await step('6b. 日历 切换 日 子 Tab', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '日') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
  await shot('06b-calendar-day')
})

// ==================== Gantt Tab ====================
await step('7. 切换到 甘特图 Tab', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-tab')) {
      if (t.textContent?.trim() === '甘特图') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 400))
  await shot('07-gantt-quarter')
})

await step('7a. 甘特图 切换 本月 子 Tab', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '本月') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
  await shot('07a-gantt-month')
})

await step('7b. 甘特图 切换 全年 子 Tab', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '全年') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
  await shot('07b-gantt-year')
})

// ==================== Profile Tab ====================
await step('8. 切换到 我的 Tab', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-tab')) {
      if (t.textContent?.trim() === '我的') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 400))
  await shot('08-profile')
})

await step('8a. 验证 profile 关键元素', async () => {
  const stats = await page.$$eval('.gg-me-stat-num', (els) => els.length)
  if (stats !== 3) throw new Error(`stats 应=3，实际 ${stats}`)
  const sections = await page.$$eval('.gg-me-section-title', (els) => els.map((e) => e.textContent))
  if (!sections.includes('偏好')) throw new Error('缺 偏好 section')
  if (!sections.includes('账号')) throw new Error('缺 账号 section')
  const quickCards = await page.$$eval('.gg-me-quick-card', (els) => els.length)
  if (quickCards !== 2) throw new Error(`quick cards 应=2，实际 ${quickCards}`)
  console.log(`  ✓ stats=${stats}, sections=[${sections.join(',')}], quickCards=${quickCards}`)
})

// ==================== Modals ====================
await step('9. 打开 OKR Manager 弹窗', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-okr-selector, button')) {
      if (t.textContent?.trim() === '我的 OKR') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 400))
  const title = await page.$eval('.gg-modal-title', (e) => e.textContent)
  if (title !== 'OKR 管理') throw new Error(`弹窗标题错: ${title}`)
  await shot('09-okr-modal')
  // 关闭
  await page.evaluate(() => document.querySelector('.gg-modal-close')?.click())
  await new Promise((r) => setTimeout(r, 300))
})

await step('10. 打开 Auth 弹窗 (avatar)', async () => {
  await page.evaluate(() => {
    // avatar 可能是 .gg-topbar-avatar 或 .gg-login-cta
    const el = document.querySelector('.gg-topbar-avatar, .gg-login-cta')
    if (el) el.click()
  })
  await new Promise((r) => setTimeout(r, 400))
  await shot('10-auth-modal')
  // 关闭
  const closed = await page.evaluate(() => {
    const closeBtns = document.querySelectorAll('.gg-modal-close')
    for (const b of closeBtns) { b.click(); return true }
    return false
  })
  await new Promise((r) => setTimeout(r, 300))
})

await step('11. 打开 Share 弹窗 (topbar share btn)', async () => {
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('.gg-topbar-share')) { b.click(); return }
  })
  await new Promise((r) => setTimeout(r, 400))
  await shot('11-share-modal')
  await page.evaluate(() => document.querySelector('.gg-modal-close')?.click())
  await new Promise((r) => setTimeout(r, 300))
})

await step('12. 打开 Task view modal (点 task)', async () => {
  // 先到 matrix
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-tab')) {
      if (t.textContent?.trim() === '四象限') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 400))
  // 点第一个 task
  await page.evaluate(() => {
    const t = document.querySelector('.gg-eq-task')
    if (t) t.click()
  })
  await new Promise((r) => setTimeout(r, 400))
  await shot('12-task-view')
  // 关闭
  await page.evaluate(() => document.querySelector('.gg-modal-close')?.click())
  await new Promise((r) => setTimeout(r, 300))
})

// ==================== 报 ====================
await writeFile(path.join(OUT, 'report.json'), JSON.stringify(results, null, 2))
const passed = results.steps.filter((s) => s.pass).length
const failed = results.steps.filter((s) => !s.pass)
console.log(`\n${'='.repeat(60)}`)
console.log(`${results.pass ? '✅ 全部' : '❌ 有失败'}  ${passed}/${results.steps.length} 步通过`)
if (failed.length > 0) {
  console.log('\n失败步:')
  for (const f of failed) console.log(`  - ${f.name}: ${f.error}`)
}
if (consoleErrs.length > 0) {
  console.log('\n控制台错误:')
  for (const e of consoleErrs) console.log(`  - ${e.slice(0, 200)}`)
}
console.log(`\n截图: ${OUT}/`)
console.log(`报告: ${OUT}/report.json`)

await browser.close()
process.exit(results.pass && consoleErrs.length === 0 ? 0 : 1)
