import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/tmp/chrome-extract/opt/google/chrome/chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  defaultViewport: { width: 720, height: 900 },
})
const page = await browser.newPage()
await page.goto('http://localhost:8765/?tab=profile', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 800))
const found = await page.evaluate(() => {
  const cards = document.querySelectorAll('.gg-me-quick-card')
  for (const c of cards) {
    if (c.textContent?.includes('分享')) { c.click(); return true }
  }
  return false
})
console.log('clicked share:', found)
await new Promise((r) => setTimeout(r, 600))
await page.screenshot({ path: '/root/claude/GridGo/screenshots/share-modal.png' })
await browser.close()
console.log('done')
