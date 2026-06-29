import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/tmp/chrome-extract/opt/google/chrome/chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900 },
})
const page = await browser.newPage()
page.on('console', (m) => console.log('  ' + m.type() + ':', m.text()))
page.on('pageerror', (e) => console.log('  PAGEERR:', e.message))
page.on('request', (r) => {
  if (r.url().includes('supabase')) console.log('  REQ:', r.method(), r.url().slice(0, 80))
})
page.on('response', (r) => {
  if (r.url().includes('supabase')) console.log('  RES:', r.status(), r.url().slice(0, 80))
})

await page.goto('http://localhost:8765', { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 1000))

// 登录
await page.evaluate(() => {
  const el = document.querySelector('.gg-topbar-avatar, .gg-login-cta')
  if (el) el.click()
})
await new Promise(r => setTimeout(r, 500))
const inputs = await page.$$('.gg-modal-body input')
console.log('inputs found:', inputs.length)
if (inputs.length >= 2) {
  await inputs[0].type('e2e@gridgo.test')
  await inputs[1].type('e2e-test-12345')
  // 等 keypress
  await new Promise(r => setTimeout(r, 200))
  // 找到登录按钮
  const btnInfo = await page.evaluate(() => {
    const btns = document.querySelectorAll('.gg-modal-foot button.gg-btn.gg-btn-primary')
    for (const b of btns) {
      if (b.textContent?.trim() === '登录') {
        return { found: true, disabled: b.disabled, busy: b.getAttribute('data-busy') }
      }
    }
    return { found: false }
  })
  console.log('login button:', JSON.stringify(btnInfo))
  // 点击
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('.gg-modal-foot button.gg-btn.gg-btn-primary')) {
      if (b.textContent?.trim() === '登录') { b.click(); return }
    }
  })
  // 等 supabase 调用
  await new Promise(r => setTimeout(r, 6000))
  // 看 store
  const state = await page.evaluate(() => {
    // 找 store - 从 react fiber 拿不到，直接看 localStorage
    const ss = localStorage.getItem('sb-' + (new URL('https://etecmcnuxochcydednky.supabase.co').host) + '-auth-token')
    return { session: ss ? JSON.parse(ss).access_token?.slice(0, 30) + '...' : null, isAuthed: !!document.querySelector('.gg-topbar-avatar') }
  })
  console.log('post-login state:', JSON.stringify(state))
}

await browser.close()
