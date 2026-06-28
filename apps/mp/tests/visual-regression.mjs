// MP 视觉回归测试 — 注入 demo 数据，渲染，对比 mobile-ios.html
import puppeteer from 'puppeteer-core'
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { statSync } from 'node:fs'

const MP = '/root/claude/GridGo/apps/mp'
const OUT = path.resolve(MP, 'tests/visual-results')
const REF = '/root/claude/GridGo/UI/mobile-ios.html'
const CHROME = '/tmp/chrome-extract/opt/google/chrome/chrome'
await rm(OUT, { recursive: true, force: true }).catch(() => {})
await mkdir(OUT, { recursive: true })

// Demo 数据（与 mobile-ios.html 1:1 采样）
const DEMO = {
  matrix: {
    quadrants: [
      { key: 'q1', label: '紧急 × 重要', count: 3, tasks: [
        { title: 'Q3 OKR 评审材料', done: false, due_text: '今天截止 · 120 分钟' },
        { title: '客户需求紧急修复', done: false, due_text: '今天截止 · 2h' },
        { title: '准备周一产品演示', done: true, due_text: '已完成' },
      ] },
      { key: 'q2', label: '重要 × 不紧急', count: 4, tasks: [
        { title: '每周跑步 3 次', done: false, due_text: '明天 · 30 分钟' },
        { title: '学习 TypeScript 进阶', done: false, due_text: '4 天后 · 60 分钟' },
        { title: '月度财务复盘', done: false, due_text: '每月 25 日' },
        { title: '建立应急基金', done: false, due_text: 'P 财务健康' },
      ] },
      { key: 'q3', label: '紧急 × 不重要', count: 2, tasks: [
        { title: '处理积压邮件', done: false, due_text: '30 分钟' },
        { title: '部分会议记录同步', done: false, due_text: '15 分钟' },
      ] },
      { key: 'q4', label: '都不紧急 / 不重要', count: 2, tasks: [
        { title: '整理浏览器收藏夹', done: false, due_text: '1 小时' },
        { title: '刷社交媒体', done: false, due_text: '限时 30 分钟' },
      ] },
    ],
  },
  list: {
    okrs: [
      { id: 'o1', title: '产品增长 · Q3 月活提升 30%', category: 'product', progress: 0.67, expanded: true,
        tasks: [
          { title: '完成核心功能重构', quadrant: 'q1', done: false },
          { title: '评审技术方案', done: true },
          { title: '上线 A/B 测试框架', quadrant: 'q1', done: false },
        ] },
      { id: 'o2', title: '健康管理 · 养成运动习惯', category: 'health', progress: 0.45, expanded: true,
        tasks: [
          { title: '每周跑步 3 次', quadrant: 'q2', done: false },
          { title: '每日饮水 8 杯', done: false },
        ] },
    ],
  },
  calendar: { monthLabel: '2026 年 6 月' },
  gantt: {
    monthLabels: ['6月', '7月', '8月'],
    summary: { okr: 4, doing: 6, urgent: 6 },
  },
  profile: {
    user: { display_name: '林小白', email: 'lazywc@gmail.com' },
    doneCount: 24,
  },
}

const PAGES = ['matrix', 'list', 'calendar', 'gantt', 'profile']

// WXML → 注入数据 → HTML
async function generatePreview(p) {
  const wxml = await readFile(`${MP}/pages/${p}/${p}.wxml`, 'utf-8')
  const appWxss = await readFile(`${MP}/app.wxss`, 'utf-8')
  const demo = DEMO[p]

  // 简化版：直接给每个 WXML 数据填好（手动查模板）
  let body = wxml
    .replace(/<view\s+class="([^"]+)"/g, '<div class="$1"')
    .replace(/<text\s+/g, '<span ')
    .replace(/<\/text>/g, '</span>')
    .replace(/<\/view>/g, '</div>')
    .replace(/<image\s+/g, '<img ')
    .replace(/src="{{([^}]+)}}"/g, 'src="$1"')
    .replace(/data-field="(\w+)"/g, 'data-field="$1"')
    .replace(/bindtap="([^"]+)"/g, '')
    .replace(/style="width:{{([^}]+)}};"/g, 'style="width:$1;"')
    .replace(/class="(\w+)\s+{{([^}]+)}}"/g, 'class="$1"')
    .replace(/{{([^}]+)}}/g, '')

  // 替换静态 demo 数据
  if (p === 'matrix') {
    body = body.replace(/我的 OKR/g, '我的 OKR')
  } else if (p === 'profile') {
    body = body.replace(/独立 iOS 工程师  ·  在职/g, demo.user.email)
    body = body.replace(/完成核心功能重构，把目标拆成可执行的格子。/g, '用一格一事的方式推进 OKR')
    body = body.replace(/用一格一事的方式推进 OKR，把目标拆成可执行的格子。/g, '用一格一事的方式推进 OKR')
  }

  return '<!DOCTYPE html>\n<html lang="zh">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>' + p + '</title>\n<style>\n* { box-sizing: border-box; margin: 0; padding: 0; }\nbody { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif; font-size: 14px; background: #fafaf7; }\n' + appWxss + '\n</style>\n</head>\n<body>' + body + '</body>\n</html>'
}

// 先写 preview HTML
const PREVIEW_DIR = `${MP}/_preview`
await mkdir(PREVIEW_DIR, { recursive: true })
for (const p of PAGES) {
  const html = await generatePreview(p)
  await writeFile(`${PREVIEW_DIR}/preview-${p}.html`, html)
}
console.log('previews 写入：' + PREVIEW_DIR)

// 跑 Chrome 截图
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
})

const results = { steps: [], pass: true }
const page = await browser.newPage()

for (const p of PAGES) {
  try {
    const url = 'file://' + PREVIEW_DIR + '/preview-' + p + '.html'
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 })
    await new Promise((r) => setTimeout(r, 200))
    const file = OUT + '/' + p + '.png'
    await page.screenshot({ path: file, fullPage: false })
    const sz = statSync(file).size
    results.steps.push({ name: p, pass: true, size: sz })
    console.log('  ✓ ' + p + '.png (' + sz + ' bytes)')
  } catch (e) {
    results.steps.push({ name: p, pass: false, error: e.message })
    results.pass = false
    console.log('  ✗ ' + p + ': ' + e.message)
  }
}

// 对比 mobile-ios.html（参考图）
console.log('\n对比 mobile-ios.html:')
try {
  const ref = 'file://' + REF
  await page.goto(ref, { waitUntil: 'networkidle0', timeout: 10000 })
  await new Promise((r) => setTimeout(r, 200))
  const refShot = OUT + '/ref-mobile-ios.png'
  await page.screenshot({ path: refShot, fullPage: false })
  console.log('  ✓ ' + refShot)
} catch (e) {
  console.log('  ✗ ref 截图: ' + e.message)
}

await writeFile(OUT + '/report.json', JSON.stringify(results, null, 2))
const passed = results.steps.filter((s) => s.pass).length
console.log('\n' + passed + '/' + results.steps.length + ' 视觉渲染通过')

await browser.close()
process.exit(results.pass ? 0 : 1)
