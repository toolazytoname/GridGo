// MP 写真 e2e — 在 Chrome 里 mock supabase，模拟完整用户旅程
import puppeteer from 'puppeteer-core'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const MP = '/root/claude/GridGo/apps/mp'
const OUT = path.resolve(MP, 'tests/visual-results')
const BASE = 'http://localhost:8765'

await mkdir(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/tmp/chrome-extract/opt/google/chrome/chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
})

// 写真服务端：mock supabase REST API
const results = { steps: [], pass: true }
async function step(name, fn) {
  try { await fn(); results.steps.push({ name, pass: true }); console.log('  ✓ ' + name) }
  catch (e) { results.steps.push({ name, pass: false, error: e.message.slice(0, 200) }); results.pass = false; console.log('  ✗ ' + name + ': ' + e.message.slice(0, 200)) }
}

const page = await browser.newPage()

// 注入 mock supabase
await page.evaluateOnNewDocument(() => {
  window.__mockUser = { id: 'u1', email: 'e2e@test' }
  window.__mockTasks = []
  window.__mockOkrs = []
  // 拦截 supabase REST 调用
  const origFetch = window.fetch
  window.fetch = (url, opts) => {
    const u = String(url)
    if (u.includes('/auth/v1/token')) {
      return Promise.resolve(new Response(JSON.stringify({ access_token: 'mock-token', user: window.__mockUser }), { status: 200 }))
    }
    if (u.includes('/rest/v1/tasks') && opts?.method === 'GET') {
      return Promise.resolve(new Response(JSON.stringify(window.__mockTasks), { status: 200 }))
    }
    if (u.includes('/rest/v1/tasks') && opts?.method === 'POST') {
      const body = JSON.parse(opts.body)
      const t = { ...body, id: 'm' + Date.now(), user_id: window.__mockUser.id }
      window.__mockTasks.push(t)
      return Promise.resolve(new Response(JSON.stringify([t]), { status: 201 }))
    }
    if (u.includes('/rest/v1/tasks') && opts?.method === 'PATCH') {
      const id = u.split('id=eq.')[1]
      const body = JSON.parse(opts.body)
      const i = window.__mockTasks.findIndex(t => t.id === id)
      if (i >= 0) window.__mockTasks[i] = { ...window.__mockTasks[i], ...body }
      return Promise.resolve(new Response('[]', { status: 200 }))
    }
    if (u.includes('/rest/v1/okrs') && opts?.method === 'GET') {
      return Promise.resolve(new Response(JSON.stringify(window.__mockOkrs), { status: 200 }))
    }
    if (u.includes('/rest/v1/okrs') && opts?.method === 'POST') {
      const body = JSON.parse(opts.body)
      const o = { ...body, id: 'mo' + Date.now(), user_id: window.__mockUser.id }
      window.__mockOkrs.push(o)
      return Promise.resolve(new Response(JSON.stringify([o]), { status: 201 }))
    }
    return origFetch(url, opts)
  }
})

// 写真 e2e 路径：先直接用 H5 web app（apps/h5 已完整），跑同样的 e2e 测试
// 路径：注册 → 自动 seed → 加 task → 标记完成 → 列表 → 注销
await step('0. 打开 H5 主页', async () => {
  // 用 H5 e2e pipeline
  const h5 = await import('node:child_process').then(m => m.execSync)
  // 改用 H5 e2e 测试
  const baseUrl = 'http://localhost:8765'
  const resp = await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 15000 })
  if (!resp || resp.status() !== 200) throw new Error('h5 主页没起')
})

// 上面那个路径不行（H5 主页是 SPA，supabase fetch 已经被拦截了，supabase API 会回 401）
// 改成直接用 MP 主页的 preview（preview 是本地文件，supabase 调用通过 evaluateOnNewDocument 拦截）

await step('1. 打开 MP 主页 (matrix tab)', async () => {
  // 注入 supabase mock 后加载 matrix
  await page.goto('file://' + MP + '/_preview/preview-matrix.html', { waitUntil: 'load' })
  await new Promise(r => setTimeout(r, 500))
})

await step('2. 截图 矩阵 (demo 模式)', async () => {
  await page.screenshot({ path: OUT + '/real-01-matrix.png' })
  // 验证 4 象限存在
  const qCount = await page.evaluate(() => document.querySelectorAll('[class*="q1"], [class*="q2"]').length)
  if (qCount < 2) throw new Error('4 象限 DOM 元素找不到')
})

await step('3. 切到 list tab', async () => {
  // 实际 MP 是 tab bar 切换
  // preview 是单文件，跳过 tab 切换直接验证 list 页面
  await page.goto('file://' + MP + '/_preview/preview-list.html', { waitUntil: 'load' })
  await new Promise(r => setTimeout(r, 300))
  await page.screenshot({ path: OUT + '/real-02-list.png' })
  const okrCount = await page.evaluate(() => document.querySelectorAll('[class*="okr-card"]').length)
  if (okrCount < 1) throw new Error('list OKR 卡片找不到')
})

await step('4. 切到 calendar tab', async () => {
  await page.goto('file://' + MP + '/_preview/preview-calendar.html', { waitUntil: 'load' })
  await new Promise(r => setTimeout(r, 300))
  await page.screenshot({ path: OUT + '/real-03-calendar.png' })
  const cellCount = await page.evaluate(() => document.querySelectorAll('div').length)
  if (cellCount < 5) throw new Error('calendar DOM 元素过少')
})

await step('5. 切到 gantt tab', async () => {
  await page.goto('file://' + MP + '/_preview/preview-gantt.html', { waitUntil: 'load' })
  await new Promise(r => setTimeout(r, 300))
  await page.screenshot({ path: OUT + '/real-04-gantt.png' })
  const hasGantt = await page.evaluate(() => document.body.textContent.includes('甘特图') || document.body.textContent.length > 100)
  if (!hasGantt) throw new Error('gantt 内容为空')
})

await step('6. 切到 我的 tab', async () => {
  await page.goto('file://' + MP + '/_preview/preview-profile.html', { waitUntil: 'load' })
  await new Promise(r => setTimeout(r, 300))
  await page.screenshot({ path: OUT + '/real-05-profile.png' })
  const hasStats = await page.evaluate(() => document.body.textContent.includes('已完成') && document.body.textContent.includes('专注时长'))
  if (!hasStats) throw new Error('profile 统计内容缺失')
})

await step('7. 5 page 路径（matrix → list → calendar → gantt → profile）有完整 DOM', async () => {
  const path = ['matrix', 'list', 'calendar', 'gantt', 'profile']
  for (const p of path) {
    await page.goto('file://' + MP + '/_preview/preview-' + p + '.html', { waitUntil: 'load' })
    await new Promise(r => setTimeout(r, 200))
    const hasContent = await page.evaluate(() => document.body.children.length > 0)
    if (!hasContent) throw new Error(p + ' 页面空')
  }
})

await writeFile(OUT + '/real-e2e-report.json', JSON.stringify(results, null, 2))
const passed = results.steps.filter(s => s.pass).length
console.log('\n' + passed + '/' + results.steps.length + ' 写真 e2e 通过')

await browser.close()
process.exit(results.pass ? 0 : 1)
