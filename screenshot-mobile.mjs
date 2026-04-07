import puppeteer from 'puppeteer';
import { readdir, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = join(__dirname, 'screenshots', 'claude-screenshots');

const url = process.argv[2] || 'http://localhost:3000';
const sectionId = process.argv[3] || 'forBrokers';
const label = process.argv[4] || 'mobile';

await mkdir(SCREENSHOT_DIR, { recursive: true });

const files = await readdir(SCREENSHOT_DIR).catch(() => []);
const nums = files.map(f => f.match(/^screenshot-(\d+)/)?.[1]).filter(Boolean).map(Number);
const n = nums.length ? Math.max(...nums) + 1 : 1;
const filename = `screenshot-${n}-${label}.png`;
const filepath = join(SCREENSHOT_DIR, filename);

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 1500));

// Kill ScrollSmoother and scroll to section
await page.evaluate((id) => {
  if (typeof ScrollSmoother !== 'undefined') {
    const smoother = ScrollSmoother.get();
    if (smoother) smoother.kill();
  }
  const wrapper = document.getElementById('smooth-wrapper');
  const content = document.getElementById('smooth-content');
  if (wrapper) { wrapper.style.overflow = 'visible'; wrapper.style.height = 'auto'; wrapper.style.position = 'relative'; }
  if (content) { content.style.transform = 'none'; content.style.position = 'relative'; }
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ block: 'start' });
}, sectionId);

await new Promise(r => setTimeout(r, 300));

const section = await page.$(`#${sectionId}`);
if (section) {
  await section.screenshot({ path: filepath });
  console.log(`Screenshot saved: screenshots/claude-screenshots/${filename}`);
} else {
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`Section not found, full page: screenshots/claude-screenshots/${filename}`);
}

await browser.close();
