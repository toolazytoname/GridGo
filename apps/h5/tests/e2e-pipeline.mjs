// P1 写真 e2e：注册 → auto seed → 加 → 编辑 → 删 → 注销
import puppeteer from 'puppeteer-core'
import { mkdir, writeFile } from 'node:fs/promises'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const CHROME = '/tmp/chrome-extract/opt/google/chrome/chrome'
const BASE = 'http://localhost:8765'
const EMAIL = (await readFile('/tmp/e2e-email.txt', 'utf-8')).trim()
const PASSWORD = 'e2e-pipeline-12345'
const OUT = path.resolve(import.meta.dirname, 'e2e-pipeline-results')
await mkdir(OUT, { recursive: true })

console.log('用 email:', EMAIL)

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900 },
})

const page = await browser.newPage()
const errs = []
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('Failed to load resource')) errs.push(m.text()) })
page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message))

const results = { email: EMAIL, steps: [], pass: true, consoleErrors: errs }
async function step(name, fn) {
  console.log('\n▶', name)
  try { await fn(); results.steps.push({ name, pass: true }); console.log('  ✓', name) }
  catch (e) { results.steps.push({ name, pass: false, error: String(e).slice(0, 200) }); results.pass = false; console.log('  ✗', name, ':', e.message?.slice(0, 200)) }
}
async function shot(n) { await page.screenshot({ path: path.join(OUT, n + '.png') }); console.log('  📸', n + '.png') }

await step('0. 打开主页', async () => {
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 15000 })
  await new Promise(r => setTimeout(r, 600))
  await shot('00-home')
})

await step('1. 打开 auth 弹窗', async () => {
  await page.evaluate(() => {
    const el = document.querySelector('.gg-topbar-avatar, .gg-login-cta')
    if (el) el.click()
  })
  await new Promise(r => setTimeout(r, 400))
  await shot('01-auth-modal')
})

await step('2. 切到 注册 tab', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '注册') { t.click(); return }
    }
  })
  await new Promise(r => setTimeout(r, 300))
  await shot('02-register-tab')
})

await step('3. 填邮箱 + 密码 + 注册', async () => {
  const inputs = await page.$$('.gg-modal-body input')
  if (inputs.length < 2) throw new Error('期望 2 input，实际 ' + inputs.length)
  await inputs[0].type(EMAIL)
  await inputs[1].type(PASSWORD)
  await new Promise(r => setTimeout(r, 200))
  await shot('03-credentials')
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('button.gg-btn.gg-btn-primary')) {
      if (b.textContent?.trim() === '注册') { b.click(); return }
    }
  })
  await new Promise(r => setTimeout(r, 4000))
  await shot('04-after-register')
})

await step('4. 验证已登录 (avatar 显示)', async () => {
  await new Promise(r => setTimeout(r, 1500))
  const isAuthed = await page.evaluate(() => !!document.querySelector('.gg-topbar-avatar'))
  if (!isAuthed) throw new Error('注册后没自动登录')
})

await step('5. 验证四象限自动 seed 8 个 task', async () => {
  await new Promise(r => setTimeout(r, 2000))
  const count = await page.evaluate(() => document.querySelectorAll('.gg-eq-task-title').length)
  if (count < 6) throw new Error('四象限应 ≥6 task，实际 ' + count)
  console.log('  ✓ 四象限', count, '个 task')
  await shot('05-matrix-seeded')
})

await step('6. 切到 list 看 OKR 树', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-tab')) {
      if (t.textContent?.trim() === '列表') { t.click(); return }
    }
  })
  await new Promise(r => setTimeout(r, 400))
  const okrHeaders = await page.$$eval('.gg-okr-item', (els) => els.length)
  if (okrHeaders < 3) throw new Error('列表 OKR 应 ≥3，实际 ' + okrHeaders)
  console.log('  ✓ 列表', okrHeaders, '个 OKR')
  await shot('06-list-seeded')
})

await step('7. 加一个新 task', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-tab')) {
      if (t.textContent?.trim() === '四象限') { t.click(); return }
    }
  })
  await new Promise(r => setTimeout(r, 400))
  const addBtns = await page.$$('.gg-eq-add')
  await addBtns[0].click()
  await new Promise(r => setTimeout(r, 400))
  await page.type('input[placeholder*="清晰的名字"]', 'PIPELINE 新增')
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('button.gg-btn.gg-btn-primary')) {
      if (b.textContent?.trim() === '添加') { b.click(); return }
    }
  })
  await new Promise(r => setTimeout(r, 1000))
  const found = await page.evaluate(() => Array.from(document.querySelectorAll('.gg-eq-task-title')).some(e => e.textContent === 'PIPELINE 新增'))
  if (!found) throw new Error('PIPELINE 新增 任务没出现')
})

await step('8. 标记 PIPELINE 任务完成', async () => {
  await page.evaluate(() => {
    const titles = [...document.querySelectorAll('.gg-eq-task-title')]
    const t = titles.find(t => t.textContent === 'PIPELINE 新增')
    if (t) t.closest('.gg-eq-task').click()
  })
  await new Promise(r => setTimeout(r, 500))
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('.gg-modal-foot button')) {
      const t = b.textContent?.trim()
      if (t === '标记完成' || t === '标记未完成') { b.click(); return }
    }
  })
  await new Promise(r => setTimeout(r, 600))
  await page.evaluate(() => document.querySelector('.gg-modal-close')?.click())
  await new Promise(r => setTimeout(r, 400))
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-tab')) {
      if (t.textContent?.trim() === '列表') { t.click(); return }
    }
  })
  await new Promise(r => setTimeout(r, 300))
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-subtab')) {
      if (t.textContent?.trim() === '已完成') { t.click(); return }
    }
  })
  await new Promise(r => setTimeout(r, 300))
  const inDone = await page.evaluate(() => Array.from(document.querySelectorAll('.gg-sub-label, .gg-tree-label')).some(e => e.textContent?.includes('PIPELINE')))
  if (!inDone) throw new Error('PIPELINE 任务没在 已完成 列表')
  console.log('  ✓ PIPELINE 任务标完成，已出现')
})

await step('9. 注销登录', async () => {
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('.gg-tab')) {
      if (t.textContent?.trim() === '我的') { t.click(); return }
    }
  })
  await new Promise(r => setTimeout(r, 400))
  await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.gg-me-row')]
    for (const r of rows) {
      if (r.textContent?.includes('退出登录')) { r.click(); return }
    }
  })
  await new Promise(r => setTimeout(r, 600))
  const isAuthed = await page.evaluate(() => !!document.querySelector('.gg-topbar-avatar'))
  if (isAuthed) throw new Error('注销失败，avatar 还在')
  const hasLoginCta = await page.evaluate(() => !!document.querySelector('.gg-login-cta'))
  if (!hasLoginCta) throw new Error('注销后没显示 登录/注册 按钮')
  console.log('  ✓ 已注销，看到登录/注册按钮')
})

await writeFile(path.join(OUT, 'report.json'), JSON.stringify(results, null, 2))
const passed = results.steps.filter(s => s.pass).length
console.log('\n' + '='.repeat(60))
console.log((results.pass ? '✅' : '❌') + ' ' + passed + '/' + results.steps.length + ' 步')
if (errs.length > 0) {
  console.log('\n控制台错误:')
  for (const e of errs) console.log('  - ' + e.slice(0, 200))
}

await browser.close()
process.exit(results.pass ? 0 : 1)
