// 写真真实操作 e2e：模拟真实用户从打开 → 登录 → 加 task → 标记 → 跨 tab → 注销
// 用 puppeteer + 拦截 supabase fetch 写真后端响应
import puppeteer from 'puppeteer-core'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE = 'http://localhost:8765'
const OUT = path.resolve('tests/real-flow-results')
await mkdir(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/tmp/chrome-extract/opt/google/chrome/chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900 },
})

const page = await browser.newPage()
const consoleErrs = []
page.on('console', (m) => { if (m.type() === 'error') consoleErrs.push(m.text()) })
page.on('pageerror', (e) => consoleErrs.push('PAGE: ' + e.message))

const results = { steps: [], pass: true, consoleErrors: consoleErrs }
async function step(name, fn) {
  console.log('\n▶ ' + name)
  try { await fn(); results.steps.push({ name, pass: true }); console.log('  ✓ ' + name) }
  catch (e) { results.steps.push({ name, pass: false, error: String(e).slice(0, 150) }); results.pass = false; console.log('  ✗ ' + name + ': ' + e.message?.slice(0, 150)) }
}
async function shot(n) { await page.screenshot({ path: OUT + '/' + n + '.png' }); console.log('  📸 ' + n + '.png') }

await step('0. 打开主页 (空 demo 数据)', async () => {
  // 清 localStorage 确保是未登录
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await page.evaluate(() => localStorage.clear())
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 600))
  await shot('00-home-demo')
})

// 写真：用户没登录 → 显示 demo 数据（我刚修的）
await step('1. 未登录 → 显示 demo 数据 + 8 个 task', async () => {
  const taskCount = await page.evaluate(() => document.querySelectorAll('.gg-eq-task-title').length)
  if (taskCount < 6) throw new Error('demo task 数量过少: ' + taskCount)
  console.log('  ✓ ' + taskCount + ' demo task 显示')
})

// 写真：注册新用户
const TEST_EMAIL = 'e2e-real-' + Date.now() + '@gridgo.test'
const TEST_PWD = 'real-flow-12345'

await step('2. 打开 auth 弹窗 + 注册', async () => {
  await page.evaluate(() => {
    const el = document.querySelector('.gg-topbar-avatar, .gg-login-cta')
    if (el) el.click()
  })
  await new Promise((r) => setTimeout(r, 500))
  await shot('02-auth-modal')

  // 切到注册
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '注册') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
  // 填表
  const inputs = await page.$$('.gg-modal-body input')
  await inputs[0].type(TEST_EMAIL)
  await inputs[1].type(TEST_PWD)
  await inputs[2].type(TEST_PWD)
  await new Promise((r) => setTimeout(r, 200))
  // 点注册
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('.gg-modal-foot button.gg-btn.gg-btn-primary')) {
      if (b.textContent?.trim() === '注册') { b.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 7000))
  await shot('03-after-register')
})

await step('3. 注册成功 → 提示"去邮箱验证"', async () => {
  const hasMsg = await page.evaluate(() => {
    const msgs = document.querySelectorAll('.gg-msg-ok')
    return Array.from(msgs).some(m => m.textContent?.includes('请去邮箱'))
  })
  if (!hasMsg) throw new Error('注册后应显示"去邮箱"提示')
})

await step('4. 邮箱密码直接登录 (autoconfirm 应该开)', async () => {
  // 关弹窗
  await page.evaluate(() => document.querySelector('.gg-modal-close')?.click())
  await new Promise((r) => setTimeout(r, 300))
  // 重开 + 切登录
  await page.evaluate(() => {
    const el = document.querySelector('.gg-topbar-avatar, .gg-login-cta')
    if (el) el.click()
  })
  await new Promise((r) => setTimeout(r, 1500))
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '登录') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
  const inputs = await page.$$('.gg-modal-body input')
  await inputs[0].type(TEST_EMAIL)
  await inputs[1].type(TEST_PWD)
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('.gg-modal-foot button.gg-btn.gg-btn-primary')) {
      if (b.textContent?.trim() === '登录') { b.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 6000))
  await shot('04-after-login')
  const hasAvatar = await page.evaluate(() => !!document.querySelector('.gg-topbar-avatar'))
  if (!hasAvatar) throw new Error('登录后没显示 avatar')
})

await step('5. 登录后 → 真账户空 (不自动 seed)', async () => {
  // 关可能残留弹窗
  await page.evaluate(() => document.querySelectorAll('.gg-modal-close').forEach(b => b.click()))
  await new Promise((r) => setTimeout(r, 300))
  await page.goto(BASE + '?tab=matrix', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 800))
  await shot('05-real-empty')
  const taskCount = await page.evaluate(() => document.querySelectorAll('.gg-eq-task-title').length)
  if (taskCount !== 0) throw new Error('真新账户应 0 task，实际 ' + taskCount)
})

await step('6. 点 + 添加第一个任务 → 写真入库', async () => {
  const addBtns = await page.$$('.gg-eq-add')
  if (addBtns.length === 0) throw new Error('没找到 + 添加任务')
  await addBtns[0].click()
  await new Promise((r) => setTimeout(r, 1500))
  await page.type('input[placeholder*="清晰的名字"]', 'E2E REAL FLOW')
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('.gg-modal-foot button.gg-btn.gg-btn-primary')) {
      if (b.textContent?.trim() === '添加') { b.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 1500))
  const found = await page.evaluate(() => Array.from(document.querySelectorAll('.gg-eq-task-title')).some(t => t.textContent === 'E2E REAL FLOW'))
  if (!found) throw new Error('新 task 没出现')
  await shot('06-task-added')
})

await step('7. 跨 tab 验证 task 存在', async () => {
  for (const t of ['list', 'calendar', 'gantt']) {
    await page.goto(BASE + '?tab=' + t, { waitUntil: 'networkidle0' })
    await new Promise((r) => setTimeout(r, 500))
    const has = await page.evaluate(() => document.body.textContent.includes('E2E REAL FLOW'))
    if (!has) throw new Error(t + ' 找不到 E2E REAL FLOW')
    console.log('  ✓ ' + t + ' 含 E2E REAL FLOW')
  }
})

await step('8. 注销 → 回到 demo 模式', async () => {
  await page.goto(BASE + '?tab=profile', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 600))
  // 点退出登录
  page.on('dialog', async (d) => { await d.accept() })
  await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.gg-me-row')]
    for (const r of rows) {
      if (r.textContent?.includes('退出登录')) { r.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 1500))
  // 切回 matrix 看 demo 数据
  await page.goto(BASE + '?tab=matrix', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 600))
  const demoCount = await page.evaluate(() => document.querySelectorAll('.gg-eq-task-title').length)
  if (demoCount < 6) throw new Error('注销后应回 demo ' + demoCount)
  console.log('  ✓ 注销后 ' + demoCount + ' demo task 出现')
})

await writeFile(OUT + '/report.json', JSON.stringify({ ...results, testEmail: TEST_EMAIL }, null, 2))
const passed = results.steps.filter(s => s.pass).length
console.log('\n' + passed + '/' + results.steps.length + ' 写真 e2e 通过')
if (consoleErrs.length > 0) {
  console.log('\n控制台错误:')
  for (const e of consoleErrs) console.log('  - ' + e.slice(0, 150))
}

await browser.close()
process.exit(results.pass && consoleErrs.length === 0 ? 0 : 1)
