// Renders public/icon.svg to public/icon-192.png and public/icon-512.png (run: node dev/make-icons.mjs).
import { chromium } from 'playwright';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../public/', import.meta.url));
const svg = readFileSync(root + 'icon.svg', 'utf8');
const pre = '/opt/pw-browsers/chromium';
const browser = await chromium.launch(existsSync(pre) ? { executablePath: pre } : {});
for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  await page.screenshot({ path: `${root}icon-${size}.png`, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  await page.close();
}
await browser.close();
