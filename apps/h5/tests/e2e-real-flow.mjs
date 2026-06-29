// 写真真实操作 e2e：登录 → 加载数据 → 加 task → 标记 → 跨 tab → 注销
// 用 e2e@gridgo.test 已确认邮箱账户
import puppeteer from 'puppeteer-core'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE = 'http://localhost:8765'
const OUT = path.resolve('tests/real-flow-results')
const TEST_EMAIL = 'e2e@gridgo.test'
const TEST_PWD = 'e2e-test-12345'
await mkdir(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/tmp/chrome-extract/opt/google/chrome/chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900 },
})

const page = await browser.newPage()
const errs = []
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
page.on('pageerror', (e) => errs.push('PAGE: ' + e.message))

const results = { steps: [], pass: true, consoleErrors: errs, testEmail: TEST_EMAIL }
async function step(name, fn) {
  console.log('\n▶ ' + name)
  try { await fn(); results.steps.push({ name, pass: true }); console.log('  ✓ ' + name) }
  catch (e) { results.steps.push({ name, pass: false, error: String(e).slice(0, 200) }); results.pass = false; console.log('  ✗ ' + name + ': ' + e.message?.slice(0, 200)) }
}
async function shot(n) { await page.screenshot({ path: OUT + '/' + n + '.png' }); console.log('  📸 ' + n + '.png') }

await step('0. 打开主页 (未登录 → demo 数据)', async () => {
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await page.evaluate(() => localStorage.clear())
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 800))
  await shot('00-demo')
})

await step('1. demo 模式显示 ≥6 task', async () => {
  const n = await page.evaluate(() => document.querySelectorAll('.gg-eq-task-title').length)
  if (n < 6) throw new Error('demo task 过少: ' + n)
  console.log('  ✓ ' + n + ' demo task')
})

await step('2. 打开 auth 弹窗 → 切登录', async () => {
  await page.evaluate(() => {
    const el = document.querySelector('.gg-topbar-avatar, .gg-login-cta')
    if (el) el.click()
  })
  await new Promise((r) => setTimeout(r, 400))
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '登录') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 300))
  await shot('02-login')
})

await step('3. 填 email + password → 登录', async () => {
  const inputs = await page.$$('.gg-modal-body input')
  if (inputs.length < 2) throw new Error('期望 2 input，实际 ' + inputs.length)
  await inputs[0].type(TEST_EMAIL)
  await inputs[1].type(TEST_PWD)
  await new Promise((r) => setTimeout(r, 200))
  await shot('03-filled')
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('.gg-modal-foot button.gg-btn.gg-btn-primary')) {
      if (b.textContent?.trim() === '登录') { b.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 6000))
  await shot('04-after-login')
  const hasAvatar = await page.evaluate(() => !!document.querySelector('.gg-topbar-avatar'))
  if (!hasAvatar) throw new Error('登录后没 avatar（auth 没成功）')
})

await step('4. 登录后从 Supabase 拉真账户 task', async () => {
  await page.evaluate(() => document.querySelectorAll('.gg-modal-close').forEach(b => b.click()))
  await new Promise((r) => setTimeout(r, 300))
  await page.goto(BASE + '?tab=matrix', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 1500))
  await shot('05-real-data')
  const n = await page.evaluate(() => document.querySelectorAll('.gg-eq-task-title').length)
  if (n < 6) throw new Error('应 ≥6 真实 task，实际 ' + n)
  console.log('  ✓ ' + n + ' 真实 task')
})

await step('5. 添加新 task（操作真实后端）', async () => {
  const addBtns = await page.$$('.gg-eq-add')
  await addBtns[1].click()  // Q2
  await new Promise((r) => setTimeout(r, 400))
  const newTitle = 'REAL FLOW PIPELINE ' + Date.now()
  await page.type('input[placeholder*="清晰的名字"]', newTitle)
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('.gg-modal-foot button.gg-btn.gg-btn-primary')) {
      if (b.textContent?.trim() === '添加') { b.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 2000))
  const found = await page.evaluate((t) => Array.from(document.querySelectorAll('.gg-eq-task-title')).some(e => e.textContent === t), newTitle)
  if (!found) throw new Error('新 task 没出现')
  console.log('  ✓ ' + newTitle)
  await shot('06-task-added')
})

await step('6. 标记完成（toggle 真实后端）', async () => {
  await page.evaluate(() => document.querySelector('.gg-modal-close')?.click())
  await new Promise((r) => setTimeout(r, 300))
  const newTitle = await page.evaluate(() => {
    const titles = [...document.querySelectorAll('.gg-eq-task-title')]
    const t = titles.find(t => t.textContent?.includes('REAL FLOW PIPELINE'))
    if (t) { t.closest('.gg-eq-task').click(); return t.textContent }
    return null
  })
  if (!newTitle) throw new Error('找不到新加的 task')
  await new Promise((r) => setTimeout(r, 500))
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('.gg-modal-foot button')) {
      const t = b.textContent?.trim()
      if (t === '标记完成' || t === '标记未完成') { b.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 1500))
  await page.evaluate(() => document.querySelector('.gg-modal-close')?.click())
  await new Promise((r) => setTimeout(r, 300))
  await page.goto(BASE + '?tab=list', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 600))
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '已完成') { t.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 500))
  const inDone = await page.evaluate(() => document.body.textContent.includes('REAL FLOW PIPELINE'))
  if (!inDone) throw new Error('标记完成后没在 已完成 列表')
  console.log('  ✓ 标完成 + 切到已完成 → 找到了')
  await shot('07-completed')
})

await step('7. 跨 tab 验证 task 存在 (list/calendar/gantt)', async () => {
  for (const t of ['list', 'calendar', 'gantt']) {
    await page.goto(BASE + '?tab=' + t, { waitUntil: 'networkidle0' })
    await new Promise((r) => setTimeout(r, 600))
    const has = await page.evaluate(() => document.body.textContent.includes('REAL FLOW'))
    if (!has) throw new Error(t + ' 找不到 task')
    console.log('  ✓ ' + t + ' 找到了')
  }
})

await step('8. 注销 → 回到 demo', async () => {
  await page.goto(BASE + '?tab=profile', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 800))
  await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.gg-me-row')]
    for (const r of rows) {
      if (r.textContent?.includes('退出登录')) { r.click(); return }
    }
  })
  await new Promise((r) => setTimeout(r, 2000))
  await page.goto(BASE + '?tab=matrix', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 600))
  const n = await page.evaluate(() => document.querySelectorAll('.gg-eq-task-title').length)
  if (n < 6) throw new Error('注销后应回 demo ' + n)
  console.log('  ✓ 注销后 ' + n + ' demo task')
})

await writeFile(OUT + '/report.json', JSON.stringify(results, null, 2))
const passed = results.steps.filter(s => s.pass).length
console.log('\n' + passed + '/' + results.steps.length + ' 写真 e2e 通过')
if (errs.length > 0) {
  console.log('\n控制台错误:')
  for (const e of errs) console.log('  - ' + e.slice(0, 200))
}

await browser.close()
process.exit(results.pass && errs.length === 0 ? 0 : 1)
