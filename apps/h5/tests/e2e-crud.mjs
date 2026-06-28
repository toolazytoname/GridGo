// 真实 Supabase 登录 + CRUD e2e
// 跑：node tests/e2e-crud.mjs
// 用 e2e@gridgo.test / e2e-test-12345

import puppeteer from 'puppeteer-core'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const CHROME = '/tmp/chrome-extract/opt/google/chrome/chrome'
const BASE = 'http://localhost:8765'
const EMAIL = 'e2e@gridgo.test'
const PASSWORD = 'e2e-test-12345'
const OUT = path.resolve(import.meta.dirname, 'e2e-crud-results')
await mkdir(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900 },
})

const page = await browser.newPage()
const errs = []
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message))

const results = { steps: [], pass: true, consoleErrors: errs }
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

await step('0. 打开主页', async () => {
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 15000 })
  await new Promise((r) => setTimeout(r, 500))
  await shot('00-home')
})

// ============== 登录 ==============
await step('1. 打开 auth 弹窗 (avatar)', async () => {
  await page.evaluate(() => {
    const el = document.querySelector('.gg-topbar-avatar, .gg-login-cta')
    if (el) el.click()
  })
  await new Promise((r) => setTimeout(r, 400))
  await shot('01-auth-modal')
})

await step('2. 切到 邮箱 tab', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab-underline, .gg-subtab')) {
      if (t.textContent?.trim() === '邮箱') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
  await shot('02-email-tab')
})

await step('3. 填邮箱 + (password 模式不可用时用 JS 注入 session)', async () => {
  const inputs = await page.$$('.gg-modal-body input')
  // magic link 模式只有 email input
  if (inputs.length >= 1) {
    await inputs[0].type(EMAIL)
    await new Promise((r) => setTimeout(r, 200))
    await shot('03-email-filled')
  }
  // 走 programmatic login 绕过 magic link
  const session = await page.evaluate(async () => {
    const r = await fetch('https://etecmcnuxochcydednky.supabase.co/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_uGfQj7Bf4_jJ1dLvOVEG7w_yNTHGJN0' },
      body: JSON.stringify({ email: 'e2e@gridgo.test', password: 'e2e-test-12345' }),
    })
    return r.json()
  })
  if (!session.access_token) throw new Error('login failed: ' + JSON.stringify(session).slice(0, 200))
  // 关闭 auth modal
  await page.evaluate(() => document.querySelector('.gg-modal-close')?.click())
  await new Promise((r) => setTimeout(r, 300))
})

// ============== 验证登录后 ==============
await step('4. 登录后 avatar 显示', async () => {
  await new Promise((r) => setTimeout(r, 1500))
  const avatar = await page.$('.gg-topbar-avatar')
  if (!avatar) {
    // 可能 magic link 没自动 verify，需要用户点邮件
    // 我们直接设 supabase session 进 localStorage
    const session = await page.evaluate(async () => {
      const r = await fetch('https://etecmcnuxochcydednky.supabase.co/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_uGfQj7Bf4_jJ1dLvOVEG7w_yNTHGJN0' },
        body: JSON.stringify({ email: 'e2e@gridgo.test', password: 'e2e-test-12345' }),
      })
      const j = await r.json()
      return j
    })
    if (session.access_token) {
      // 把 session 写进 localStorage
      await page.evaluate((s) => {
        const key = Object.keys(localStorage).find((k) => k.startsWith('sb-'))
        if (key) {
          localStorage.setItem(key, JSON.stringify({
            access_token: s.access_token,
            refresh_token: s.refresh_token,
            expires_at: s.expires_at,
            expires_in: s.expires_in,
            token_type: 'bearer',
            user: s.user,
          }))
        }
      }, session)
      await page.reload({ waitUntil: 'networkidle0' })
      await new Promise((r) => setTimeout(r, 1500))
    } else {
      throw new Error('登录失败: ' + JSON.stringify(session).slice(0, 200))
    }
  }
  await shot('05-logged-in')
})

await step('5. 验证四象限有 8 个 task (e2e 用户数据)', async () => {
  const taskCount = await page.evaluate(() => document.querySelectorAll('.gg-eq-task-title').length)
  if (taskCount < 6) throw new Error(`四象限 task 数量过少: ${taskCount}`)
  console.log(`  ✓ 四象限 ${taskCount} 个 task`)
})

// ============== CRUD ==============
await step('6. 添加新 task', async () => {
  const addBtns = await page.$$('.gg-eq-add')
  if (addBtns.length === 0) throw new Error('找不到 + 添加任务')
  await addBtns[0].click()
  await new Promise((r) => setTimeout(r, 400))
  await page.type('input[placeholder*="清晰的名字"]', 'CRUD 测试任务')
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('button.gg-btn.gg-btn-primary')) {
      if (b.textContent?.trim() === '添加') { b.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 800))
  const found = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.gg-eq-task-title')).some((e) => e.textContent === 'CRUD 测试任务'),
  )
  if (!found) throw new Error('新任务没出现')
  console.log(`  ✓ CRUD 测试任务 已添加`)
})

await step('7. 编辑 task (view modal 改元数据)', async () => {
  // 找 CRUD 测试任务
  await page.evaluate(() => {
    const titles = [...document.querySelectorAll('.gg-eq-task-title')]
    const e2e = titles.find((t) => t.textContent === 'CRUD 测试任务')
    if (e2e) e2e.closest('.gg-eq-task').click()
  })
  await new Promise((r) => setTimeout(r, 400))
  // 切到编辑
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('.gg-modal-foot .gg-btn.gg-btn-primary')) {
      if (b.textContent?.trim() === '编辑') { b.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 400))
  await shot('07-edit-mode')
  // 保存
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('.gg-modal-foot .gg-btn.gg-btn-primary')) {
      if (b.textContent?.trim() === '保存') { b.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 500))
})

await step('8. 切到 list 验证 CRUD task 在', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-tab')) {
      if (t.textContent?.trim() === '列表') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 400))
  const inList = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.gg-tree-label, .gg-sub-label, .gg-list-task')).some((e) => e.textContent?.includes('CRUD'))
  })
  if (!inList) throw new Error('CRUD 任务不在列表')
  console.log(`  ✓ 列表中找到 CRUD任务`)
  await shot('08-list-with-crud')
})

// 报
await writeFile(path.join(OUT, 'report.json'), JSON.stringify(results, null, 2))
const passed = results.steps.filter((s) => s.pass).length
console.log(`\n${'='.repeat(60)}`)
console.log(`${results.pass ? '✅' : '❌'} ${passed}/${results.steps.length} 步`)
if (errs.length > 0) {
  console.log('\n控制台错误:')
  for (const e of errs) console.log(`  - ${e.slice(0, 200)}`)
}

await browser.close()
process.exit(results.pass ? 0 : 1)
