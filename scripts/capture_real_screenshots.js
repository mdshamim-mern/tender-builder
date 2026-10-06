import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function main() {
  const screenshotsDir = path.resolve(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  console.log('Launching Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

  // 1. Initial screenshot showing Missing statuses and blocked generator
  console.log('Saving screenshot 1: initial statuses with blocking panel...');
  await page.screenshot({
    path: path.join(screenshotsDir, '01_initial_checklist_and_missing_statuses.png'),
    fullPage: true
  });

  // 2. Click "Load Sample Pack (Demo)" button
  console.log('Clicking Demo Load Sample Pack button...');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Load Sample Pack')) {
      await btn.click();
      break;
    }
  }

  // Wait for demo pack to load
  await new Promise(r => setTimeout(r, 2500));

  // Screenshot 2: All documents matched and verified with ActionPanel
  console.log('Saving screenshot 2: verified documents dashboard...');
  await page.screenshot({
    path: path.join(screenshotsDir, '02_verified_documents_and_ok_statuses.png'),
    fullPage: true
  });

  // 3. Switch language to Bangla
  console.log('Switching language to Bangla...');
  const newButtons = await page.$$('button');
  for (const btn of newButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('বাংলা')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1200));

  // Screenshot 3: Bangla UI with Bengali titles and statuses
  console.log('Saving screenshot 3: Bangla language interface...');
  await page.screenshot({
    path: path.join(screenshotsDir, '03_bangla_bilingual_interface.png'),
    fullPage: true
  });

  await browser.close();
  console.log('All full-page screenshots successfully updated in screenshots/ directory!');
}

main().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
