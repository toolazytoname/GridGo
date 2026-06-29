import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/tmp/chrome-extract/opt/google/chrome/chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900 },
})
const page = await browser.newPage()
page.on('console', (m) => console.log(' ' + m.type() + ':', m.text()))
page.on('pageerror', (e) => console.log(' PAGEERR:', e.message))
page.on('request', (r) => { if (r.url().includes('supabase')) console.log(' REQ:', r.method(), r.url().slice(0, 100)) })
page.on('response', (r) => { if (r.url().includes('supabase')) console.log(' RES:', r.status(), r.url().slice(0, 100)) })

await page.goto('http://localhost:8765', { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 800))

await page.evaluate(() => {
  const el = document.querySelector('.gg-topbar-avatar, .gg-login-cta')
  if (el) el.click()
})
await new Promise(r => setTimeout(r, 500))

// 看所有 footer 按钮
const buttons = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('.gg-modal-foot button, .gg-modal button')).map(b => ({
    text: b.textContent?.trim(),
    cls: b.className,
    disabled: b.disabled,
  }))
})
console.log('modal buttons:', JSON.stringify(buttons, null, 2))

// 切到登录 tab
await page.evaluate(() => {
  for (const t of document.querySelectorAll('.gg-subtab')) {
    if (t.textContent?.trim() === '登录') { t.click(); return }
  }
})
await new Promise(r => setTimeout(r, 300))

const inputs = await page.$$('.gg-modal-body input')
if (inputs.length >= 2) {
  await inputs[0].type('e2e@gridgo.test')
  await inputs[1].type('e2e-test-12345')
  await new Promise(r => setTimeout(r, 200))
  const buttons2 = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.gg-modal-foot button, .gg-modal button')).map(b => ({
      text: b.textContent?.trim()?.slice(0, 30),
      cls: b.className,
      disabled: b.disabled,
    }))
  })
  console.log('after fill, modal buttons:', JSON.stringify(buttons2, null, 2))
  // 找 登录 按钮
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('button')) {
      if (b.textContent?.trim() === '登录') { b.click(); return }
    }
  })
  await new Promise(r => setTimeout(r, 6000))
}
await browser.close()
