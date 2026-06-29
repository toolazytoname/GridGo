import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/tmp/chrome-extract/opt/google/chrome/chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900 },
})
const page = await browser.newPage()
page.on('console', (m) => console.log('  console.' + m.type() + ':', m.text()))
page.on('pageerror', (e) => console.log('  pageerror:', e.message))
page.on('requestfailed', (r) => console.log('  reqfail:', r.url(), r.failure()?.errorText))

await page.goto('http://localhost:8765', { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 1000))

// 注入 mock supabase 拦截
await page.evaluateOnNewDocument(() => {
  window.__supabaseCalls = []
  const origFetch = window.fetch
  window.fetch = (url, opts) => {
    const u = String(url)
    if (u.includes('/auth/v1/token') || u.includes('/auth/v1/signup')) {
      window.__supabaseCalls.push({ url: u, method: opts?.method, body: opts?.body?.slice(0, 100) })
      return origFetch(url, opts).then(r => {
        return r.text().then(text => {
          console.log('AUTH RESPONSE:', u.split('?')[1] || u, r.status(), text.slice(0, 200))
          return new Response(text, { status: r.status(), statusText: r.statusText, headers: r.headers })
        })
      })
    }
    return origFetch(url, opts)
  }
})

// 触发登录
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
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('.gg-modal-foot button.gg-btn.gg-btn-primary')) {
      if (b.textContent?.trim() === '登录') { b.click(); return }
    }
  })
  await new Promise(r => setTimeout(r, 5000))
  const calls = await page.evaluate(() => window.__supabaseCalls)
  console.log('supabase calls:', JSON.stringify(calls, null, 2))
  // 看 store
  const state = await page.evaluate(() => {
    return JSON.parse(JSON.stringify({
      isAuthed: window.useTasksStore?.getState?.()?.isAuthed,
    }))
  })
  console.log('store isAuthed:', state)
}

await browser.close()
