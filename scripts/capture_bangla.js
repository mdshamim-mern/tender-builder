import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function main() {
  const screenshotsDir = path.resolve(process.cwd(), 'screenshots');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

  // Find and click language button (which currently says "বাংলা")
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('বাংলা')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));

  console.log('Capturing authentic Bangla language interface...');
  await page.screenshot({
    path: path.join(screenshotsDir, '03_bangla_bilingual_interface.png'),
    fullPage: true
  });

  await browser.close();
  console.log('Bangla screenshot successfully captured!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
