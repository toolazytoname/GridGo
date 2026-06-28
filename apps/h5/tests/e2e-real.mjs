// 真实浏览器 e2e — 用 puppeteer-core + 本地 google-chrome
// 跑：node tests/e2e-real.mjs
//
// 流程：登录 mock → 加任务 → 跨 Tab 看到 → 勾选 → 切到我的看 stats
// 不依赖 mock（除了 auth 走 Supabase 真实接口，先用 anon key 测试未登录态）
//
// 输出：tests/e2e-results/*.png 每步截图 + tests/e2e-results/report.json

import puppeteer from 'puppeteer-core'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const CHROME = '/tmp/chrome-extract/opt/google/chrome/chrome'
const BASE = 'http://localhost:8765'
const OUT = path.resolve(import.meta.dirname, '../e2e-results')

await mkdir(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
  ],
  defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
})

const page = await browser.newPage()
const results = { steps: [], pass: true }

async function step(name, fn) {
  console.log(`\n▶ ${name}`)
  try {
    await fn()
    results.steps.push({ name, pass: true })
    console.log(`  ✓ ${name}`)
  } catch (e) {
    results.steps.push({ name, pass: false, error: String(e) })
    results.pass = false
    console.log(`  ✗ ${name}: ${e}`)
  }
}

async function shot(name) {
  const p = path.join(OUT, name + '.png')
  await page.screenshot({ path: p, fullPage: false })
  console.log(`  📸 ${p}`)
}

// 1. 打开主页 — 默认 Matrix Tab
await step('打开主页 → 默认在 Matrix Tab', async () => {
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 15000 })
  await new Promise((r) => setTimeout(r, 800))
  await shot('01-matrix-default')

  // 断言：4 个象限标题存在
  const titles = await page.$$eval('.gg-eq-label', (els) => els.map((e) => e.textContent))
  if (titles.length !== 4) throw new Error(`期望 4 个象限，实际 ${titles.length}: ${titles.join(',')}`)
  console.log(`  4 象限: ${titles.join(' | ')}`)
})

// 2. 加任务
let addedTaskTitle = ''
await step('点 Q2 添加任务 → 填标题 → 提交', async () => {
  // 点 Q2 (index 1) 的 + 添加任务
  const addBtns = await page.$$('.gg-eq-add')
  await addBtns[1].click()
  await new Promise((r) => setTimeout(r, 300))
  await shot('02-task-modal-open')

  addedTaskTitle = `E2E 任务 ${Date.now()}`
  await page.type('input[placeholder*="清晰的名字"]', addedTaskTitle)
  await shot('03-task-modal-typed')

  // 提交
  const submitBtns = await page.$$('button.gg-btn.gg-btn-primary')
  // 提交按钮文字是 "添加"
  for (const b of submitBtns) {
    const t = await page.evaluate((el) => el.textContent, b)
    if (t.trim() === '添加') {
      await b.click()
      break
    }
  }
  await new Promise((r) => setTimeout(r, 600))
  await shot('04-task-added')
})

// 3. 任务出现在 Q2
await step('Q2 应该看到新任务', async () => {
  const found = await page.evaluate((title) => {
    return Array.from(document.querySelectorAll('.gg-eq-task-title')).some((e) => e.textContent?.includes(title))
  }, addedTaskTitle)
  if (!found) throw new Error('新任务没出现在 Q2')
})

// 4. 切到 List Tab
async function switchTab(label) {
  await page.evaluate((l) => {
    const tabs = document.querySelectorAll('.gg-tab')
    for (const t of tabs) {
      if (t.textContent?.trim() === l) {
        t.click()
        return true
      }
    }
    return false
  }, label)
  await new Promise((r) => setTimeout(r, 500))
}

await step('切到 List Tab', async () => {
  const ok = await page.evaluate(() => {
    const tabs = document.querySelectorAll('.gg-tab')
    for (const t of tabs) {
      if (t.textContent?.trim() === '列表') { t.click(); return true }
    }
    return false
  })
  if (!ok) throw new Error('找不到列表 tab')
  await new Promise((r) => setTimeout(r, 500))
  await shot('05-list-tab')
})

// 5. 切到 Calendar Tab
await step('切到 Calendar Tab', async () => {
  await page.evaluate(() => {
    const tabs = document.querySelectorAll('.gg-tab')
    for (const t of tabs) {
      if (t.textContent?.trim() === '日历') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 500))
  await shot('06-calendar-tab')
  const subs = await page.$$eval('.gg-subtab', (els) => els.map((e) => e.textContent))
  if (subs.length < 3) throw new Error(`期望 ≥3 子 Tab，实际 ${subs.length}`)
})

// 6. 切到 Gantt Tab
await step('切到 Gantt Tab', async () => {
  await page.evaluate(() => {
    const tabs = document.querySelectorAll('.gg-tab')
    for (const t of tabs) {
      if (t.textContent?.trim() === '甘特图') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 500))
  await shot('07-gantt-tab')
  const subs = await page.$$eval('.gg-subtab', (els) => els.map((e) => e.textContent))
  if (subs.length < 3) throw new Error(`期望 ≥3 子 Tab，实际 ${subs.length}`)
})

// 7. 切到我的 (profile)
await step('切到 我的 Tab', async () => {
  await page.evaluate(() => {
    const tabs = document.querySelectorAll('.gg-tab')
    for (const t of tabs) {
      if (t.textContent?.trim() === '我的') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 500))
  await shot('08-profile-tab')

  // 验证 profile 关键元素
  const avatar = await page.$('.gg-me-avatar')
  if (!avatar) throw new Error('profile avatar 缺失')
  const stats = await page.$$eval('.gg-me-stat-num', (els) => els.length)
  if (stats !== 3) throw new Error(`stats 应=3，实际 ${stats}`)
  const quickCards = await page.$$eval('.gg-me-quick-card', (els) => els.length)
  if (quickCards !== 2) throw new Error(`quick cards 应=2，实际 ${quickCards}`)
  const sectionTitles = await page.$$eval('.gg-me-section-title', (els) => els.map((e) => e.textContent))
  if (!sectionTitles.includes('偏好')) throw new Error('偏好 section 缺失')
  if (!sectionTitles.includes('账号')) throw new Error('账号 section 缺失')
  console.log(`  ✓ avatar + ${stats} stats + ${quickCards} 快捷 + 2 sections`)
})

// 8. 切回 Matrix 验证任务还在
await step('切回 Matrix 验证任务持久', async () => {
  await page.evaluate(() => {
    const tabs = document.querySelectorAll('.gg-tab')
    for (const t of tabs) {
      if (t.textContent?.trim() === '四象限') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 500))
  await shot('09-back-to-matrix')

  const found = await page.evaluate((title) => {
    return Array.from(document.querySelectorAll('.gg-eq-task-title')).some((e) => e.textContent?.includes(title))
  }, addedTaskTitle)
  if (!found) throw new Error('回到 Matrix 后任务丢了')
})

// 写报告
await writeFile(path.join(OUT, 'report.json'), JSON.stringify(results, null, 2))
console.log(`\n${'='.repeat(50)}`)
console.log(results.pass ? '✅ 全部 8 步通过' : '❌ 有失败')
const passed = results.steps.filter((s) => s.pass).length
console.log(`通过: ${passed}/${results.steps.length}`)
console.log(`截图: ${OUT}/`)
console.log(`报告: ${OUT}/report.json`)

await browser.close()
process.exit(results.pass ? 0 : 1)
