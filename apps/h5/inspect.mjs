import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/tmp/chrome-extract/opt/google/chrome/chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900 },
})
const page = await browser.newPage()
await page.goto('http://localhost:8765/?tab=matrix', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 600))
const sizes = await page.evaluate(() => {
  const root = document.documentElement
  const app = document.querySelector('.gg-app')
  const main = document.querySelector('.gg-main')
  const grid = document.querySelector('.gg-eisenhower-grid')
  const cell = document.querySelector('.gg-eq-cell')
  return {
    viewport: { w: window.innerWidth, h: window.innerHeight },
    body: { w: document.body.offsetWidth },
    html: { w: root.offsetWidth },
    app: app ? { w: app.offsetWidth, maxWidth: getComputedStyle(app).maxWidth } : null,
    main: main ? { w: main.offsetWidth, maxWidth: getComputedStyle(main).maxWidth, ml: getComputedStyle(main).marginLeft } : null,
    grid: grid ? { w: grid.offsetWidth, gridTemplateColumns: getComputedStyle(grid).gridTemplateColumns } : null,
    cell: cell ? { w: cell.offsetWidth, h: cell.offsetHeight } : null,
  }
})
console.log(JSON.stringify(sizes, null, 2))
await browser.close()
