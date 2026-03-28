const puppeteer = require('puppeteer');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

const HTML_PATH = path.join(__dirname, 'index.html');
const OUTPUT_PATH = path.join(__dirname, 'wallpaper.png');
// macOS caches wallpaper by file path — using a second path forces a refresh
const SWAP_PATH = path.join(__dirname, 'wallpaper2.png');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1512, height: 982, deviceScaleFactor: 2 });
  await page.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0' });

  // Wait for fonts and animations to finish
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: OUTPUT_PATH, type: 'png' });
  await browser.close();

  // macOS caches wallpaper by filename. To force it to re-read the image:
  // 1. Copy to a swap file (new path = cache miss)
  // 2. Set wallpaper to the swap file
  fs.copyFileSync(OUTPUT_PATH, SWAP_PATH);
  execSync(`osascript -e 'tell application "System Events" to tell every desktop to set picture to "${SWAP_PATH}"'`);

  console.log(`Wallpaper set: ${SWAP_PATH}`);
})();
