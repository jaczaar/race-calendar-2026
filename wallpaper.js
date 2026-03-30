const puppeteer = require('puppeteer');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

const HTML_PATH = path.join(__dirname, 'index.html');
const PATH_A = path.join(__dirname, 'wallpaper.png');
const PATH_B = path.join(__dirname, 'wallpaper2.png');
const STATE_FILE = path.join(__dirname, '.wallpaper-last');

(async () => {
  // Alternate between two paths so macOS sees a "new" file each time
  let last = '';
  try { last = fs.readFileSync(STATE_FILE, 'utf8').trim(); } catch {}
  const target = last === PATH_A ? PATH_B : PATH_A;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1248, deviceScaleFactor: 2 });
  await page.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0' });

  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: target, type: 'png' });
  await browser.close();

  execSync(`osascript -e 'tell application "System Events" to tell every desktop to set picture to "${target}"'`);
  fs.writeFileSync(STATE_FILE, target);

  console.log(`Wallpaper set: ${target}`);
})();
