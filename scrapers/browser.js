const puppeteer = require('puppeteer');

let _browser = null;

const LAUNCH_OPTS = {
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--no-first-run',
    '--no-zygote',
    '--window-size=1280,800',
  ],
};

async function getBrowser() {
  if (_browser?.isConnected()) return _browser;
  _browser = await puppeteer.launch(LAUNCH_OPTS);
  _browser.on('disconnected', () => { _browser = null; });
  console.log('[Browser] Chromium lanzado');
  return _browser;
}

async function getHtml(url, waitForSelector = null) {
  const browser = await getBrowser();
  const page    = await browser.newPage();
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'es-CO,es;q=0.9' });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 8000 }).catch(() => {});
    }
    return await page.content();
  } finally {
    await page.close();
  }
}

async function closeBrowser() {
  if (_browser) {
    await _browser.close().catch(() => {});
    _browser = null;
    console.log('[Browser] Chromium cerrado');
  }
}

module.exports = { getHtml, closeBrowser };
