import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const distDir = path.resolve(process.cwd(), 'dist');
const screenshotsDir = path.resolve(process.cwd(), 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Simple MIME types
const mimeMap = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  let filePath = path.join(distDir, reqPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = mimeMap[ext] || 'application/octet-stream';

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (err) {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(4173, () => {
  console.log('Static server listening on http://localhost:4173');

  try {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const screenshot1 = path.join(screenshotsDir, '01_document_statuses_checklist.png');
    const screenshot2 = path.join(screenshotsDir, '02_tender_package_builder_dashboard.png');

    console.log('Capturing screenshot 1...');
    execSync(
      `"${chromePath}" --headless --disable-gpu --window-size=1366,900 --virtual-time-budget=4000 --screenshot="${screenshot1}" http://localhost:4173`,
      { stdio: 'inherit' }
    );

    console.log('Capturing screenshot 2...');
    execSync(
      `"${chromePath}" --headless --disable-gpu --window-size=1440,1050 --virtual-time-budget=4000 --screenshot="${screenshot2}" http://localhost:4173`,
      { stdio: 'inherit' }
    );

    console.log('Screenshots captured successfully in screenshots/ directory!');
  } catch (err) {
    console.error('Error taking screenshot:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
