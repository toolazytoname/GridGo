import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/tmp/chrome-extract/opt/google/chrome/chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900 },
})
const page = await browser.newPage()
page.on('pageerror', (e) => console.log(' PAGEERR:', e.message))
page.on('request', (r) => { if (r.url().includes('supabase')) console.log(' REQ:', r.method(), r.url().slice(0, 100)) })
page.on('response', (r) => { if (r.url().includes('supabase')) console.log(' RES:', r.status(), r.url().slice(0, 100)) })

await page.goto('http://localhost:8765', { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 800))

// 打开 modal
await page.evaluate(() => {
  const el = document.querySelector('.gg-topbar-avatar, .gg-login-cta')
  if (el) el.click()
})
await new Promise(r => setTimeout(r, 500))

// 切到登录
await page.evaluate(() => {
  for (const t of document.querySelectorAll('.gg-subtab')) {
    if (t.textContent?.trim() === '登录') { t.click(); return }
  }
})
await new Promise(r => setTimeout(r, 300))

// 一次性 fill 两个 input
await page.evaluate(() => {
  const inputs = document.querySelectorAll('.gg-modal-body input')
  const setVal = (el, v) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(el, v)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }
  setVal(inputs[0], 'e2e@gridgo.test')
  setVal(inputs[1], 'e2e-test-12345')
})
await new Promise(r => setTimeout(r, 300))

// 看所有 button 在 footer
const before = await page.evaluate(() => {
  const m = document.querySelector('.gg-modal-foot')
  return m ? Array.from(m.querySelectorAll('button')).map(b => b.textContent?.trim()?.slice(0, 30)) : 'no footer'
})
console.log('before click:', before)

// 找 submit button（不是 subtab）
const clicked = await page.evaluate(() => {
  const btns = document.querySelectorAll('.gg-modal-foot button.gg-btn')
  for (const b of btns) {
    if (b.textContent?.trim() === '登录') {
      b.click()
      return 'clicked ' + b.className
    }
  }
  return 'no submit btn'
})
console.log('clicked:', clicked)

await new Promise(r => setTimeout(r, 6000))

// 看 state
const state = await page.evaluate(() => ({
  isAuthed: !!document.querySelector('.gg-topbar-avatar'),
  hasCta: !!document.querySelector('.gg-login-cta'),
  msg: Array.from(document.querySelectorAll('.gg-msg')).map(m => m.textContent?.slice(0, 80)),
}))
console.log('post state:', JSON.stringify(state, null, 2))

await browser.close()
