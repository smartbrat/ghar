import puppeteer from 'puppeteer';
import { readdir, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = join(__dirname, 'screenshots', 'claude-screenshots');

const url = process.argv[2] || 'http://localhost:3000';
const sectionId = process.argv[3] || 'forBrokers';
const label = process.argv[4] || 'section';

await mkdir(SCREENSHOT_DIR, { recursive: true });

const files = await readdir(SCREENSHOT_DIR).catch(() => []);
const nums = files.map(f => f.match(/^screenshot-(\d+)/)?.[1]).filter(Boolean).map(Number);
const n = nums.length ? Math.max(...nums) + 1 : 1;
const filename = `screenshot-${n}-${label}.png`;
const filepath = join(SCREENSHOT_DIR, filename);

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

// Wait for animations to settle
await new Promise(r => setTimeout(r, 1500));

// Kill ScrollSmoother and reset wrapper styles so we can scroll normally
await page.evaluate((id) => {
  // Kill ScrollSmoother if it exists
  if (typeof ScrollSmoother !== 'undefined') {
    const smoother = ScrollSmoother.get();
    if (smoother) smoother.kill();
  }
  // Reset wrapper styles
  const wrapper = document.getElementById('smooth-wrapper');
  const content = document.getElementById('smooth-content');
  if (wrapper) { wrapper.style.overflow = 'visible'; wrapper.style.height = 'auto'; wrapper.style.position = 'relative'; }
  if (content) { content.style.transform = 'none'; content.style.position = 'relative'; }
  // Refresh ScrollTrigger so it recalculates positions
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  // Scroll to section
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ block: 'start' });
  // Refresh again after scroll
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh(true);
    // Force scroll events so ScrollTrigger detects position
    window.dispatchEvent(new Event('scroll'));
    requestAnimationFrame(() => {
      ScrollTrigger.update();
      window.dispatchEvent(new Event('scroll'));
    });
  }
}, sectionId);

// Wait for scroll + animations to complete
await new Promise(r => setTimeout(r, 3000));

// Force ALL animated elements to final state for screenshot
await page.evaluate(() => {
  // Orbit SVG elements
  var els = document.querySelectorAll('.fb-orb-center, .fb-orb-node, .fb-orb-dot');
  els.forEach(function(el){ el.style.opacity = '1'; el.style.transform = 'scale(1)'; });
  var strokes = document.querySelectorAll('.fb-orb-inner, .fb-orb-outer, .fb-orb-spoke');
  strokes.forEach(function(el){ el.style.strokeDashoffset = '0'; });
  var outer = document.querySelector('.fb-orb-outer');
  if(outer) outer.style.opacity = '1';
  // Section-level animated elements
  var sec = document.getElementById('forBrokers');
  if(sec){
    var animated = sec.querySelectorAll('.fb-anchor, .fb-features, .fb-sp');
    animated.forEach(function(el){ el.style.opacity = '1'; el.style.transform = 'none'; });
  }
});
await new Promise(r => setTimeout(r, 500));

// Screenshot the section element
const section = await page.$(`#${sectionId}`);
if (section) {
  await section.screenshot({ path: filepath });
  console.log(`Screenshot saved: screenshots/claude-screenshots/${filename}`);
} else {
  // Fallback: full page
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`Section not found, full page saved: screenshots/claude-screenshots/${filename}`);
}

await browser.close();
