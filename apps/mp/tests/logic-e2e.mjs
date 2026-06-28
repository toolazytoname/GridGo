// MP 逻辑 e2e — 用 new Function 跑每个 page + puppeteer 视觉回归
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const MP = '/root/claude/GridGo/apps/mp'
const OUT = path.resolve(MP, 'tests/visual-results')

function stripImports(src) {
  return src.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"][^'"]+['"];?/g, 'const $1 = MOCK_API;')
    .replace(/import\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?/g, '')
    .replace(/import\s+\w+\s+from\s+['"][^'"]+['"];?/g, '')
}

function extractPageBlock(src) {
  const idx = src.indexOf('Page(')
  if (idx < 0) return null
  const start = idx + 5
  let i = start, depth = 0, s = -1, e = -1
  for (; i < src.length; i++) {
    if (src[i] === '{') { if (s < 0) s = i; depth++ }
    else if (src[i] === '}') { depth--; if (depth === 0) { e = i; break } }
  }
  if (s < 0 || e < 0) return null
  return { prefix: src.slice(0, idx), block: src.slice(s, e + 1) }
}

function runPage(pageName) {
  return readFile(`${MP}/pages/${pageName}/${pageName}.js`, 'utf-8').then((src) => {
    const cleaned = stripImports(src)
    const parts = extractPageBlock(cleaned)
    if (!parts) throw new Error('Page 块没找到')
    const { prefix, block } = parts
    const fnSrc = `${prefix}
var __captured = null;
var wx = { getStorageSync: () => '', setStorageSync: () => {}, removeStorageSync: () => {}, showToast: () => {}, showModal: async () => ({confirm: true}), navigateTo: () => {}, navigateBack: () => {}, request: () => ({success:()=>{}, fail:()=>{}}) };
var Page = function(o) { __captured = o; };
Page${block.startsWith('{') ? '('+block+')' : block};
// 用 __captured 当 this 调 onShow（避免 strict mode this=undefined）
if (__captured) {
  __captured.setData = (p) => Object.assign(__captured.data, p);
  if (typeof __captured.onShow === 'function') __captured.onShow.call(__captured);
  if (typeof __captured.loadDemo === 'function') __captured.loadDemo.call(__captured);
  if (typeof __captured.loadData === 'function') __captured.loadData.call(__captured, '');
}
return __captured;`
    const MOCK_API = {
      listTasks: async () => [],
      listOkrs: async () => [],
      toggleTask: async () => ({}),
      signIn: async () => ({ access_token: 'mock' }),
      signUp: async () => ({}),
      createTask: async (t) => ({ ...t, id: 'n', user_id: 'u' }),
      updateTask: async () => ({}),
      deleteTask: async () => ({}),
      createOkr: async () => ({}),
      deleteOkr: async () => ({}),
    }
    const fn = new Function('MOCK_API', fnSrc)
    return fn(MOCK_API)
  })
}

const results = { steps: [], pass: true }
const PAGES = ['matrix', 'list', 'calendar', 'gantt', 'profile']
;(async () => {
  for (const p of PAGES) {
    try {
      const d = await runPage(p)
      if (!d) throw new Error('Page object 拿不到')
      const data = (typeof d.data === 'function') ? d.data() : (d.data || {})
      if (p === 'matrix') {
        if (!Array.isArray(data.quadrants) || data.quadrants.length !== 4) throw new Error('matrix 应 4 象限')
        if (data.isDemo !== true) throw new Error('未登录应 isDemo=true')
      } else if (p === 'list') {
        if (!Array.isArray(data.okrs)) throw new Error('list 应 okrs 数组')
      } else if (p === 'gantt') {
        if (!Array.isArray(data.rows)) throw new Error('gantt 应 rows')
      } else if (p === 'calendar') {
        if (!data.monthLabel) throw new Error('calendar 应 monthLabel')
      } else if (p === 'profile') {
        if (!('isAuthed' in data)) throw new Error('profile 应 isAuthed')
      }
      results.steps.push({ name: p, pass: true, keys: Object.keys(data) })
      console.log('  ✓ ' + p + ' (keys: ' + Object.keys(data).slice(0, 5).join(',') + ')')
    } catch (e) {
      results.steps.push({ name: p, pass: false, error: e.message.slice(0, 120) })
      results.pass = false
      console.log('  ✗ ' + p + ': ' + e.message.slice(0, 120))
    }
  }

  // 视觉 e2e：puppeteer 截 preview-{p}.html
  const visual = { steps: [], pass: true }
  let puppeteer
  try { puppeteer = (await import('puppeteer-core')).default } catch (e) { visual.steps.push({ name: 'puppeteer', pass: false, error: 'puppeteer-core 找不到' }); visual.pass = false }
  if (puppeteer) {
    const CHROME = '/tmp/chrome-extract/opt/google/chrome/chrome'
    const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'], defaultViewport: { width: 390, height: 844 } })
    const page = await browser.newPage()
    for (const p of PAGES) {
      try {
        await page.goto('file://' + MP + '/_preview/preview-' + p + '.html', { waitUntil: 'networkidle0', timeout: 8000 })
        await new Promise((r) => setTimeout(r, 150))
        await page.screenshot({ path: OUT + '/' + p + '.png' })
        visual.steps.push({ name: p, pass: true })
        console.log('  📸 ' + p + '.png')
      } catch (e) {
        visual.steps.push({ name: p, pass: false, error: e.message })
        visual.pass = false
        console.log('  ✗ ' + p + ': ' + e.message)
      }
    }
    await browser.close()
  }

  await mkdir(OUT, { recursive: true })
  await writeFile(OUT + '/test-report.json', JSON.stringify({ logic: results, visual }, null, 2))
  const lp = results.steps.filter((s) => s.pass).length
  const vp = visual.steps.filter((s) => s.pass).length
  console.log('\n逻辑 e2e: ' + lp + '/' + results.steps.length)
  console.log('视觉 e2e: ' + vp + '/' + visual.steps.length)
})()
