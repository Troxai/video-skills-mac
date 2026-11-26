// Upload to TikTok Studio with a logged-in Chrome profile. Screenshots every step for debugging.
// usage: node scripts/tiktok_upload.mjs video.mp4 post.json shots_dir
import './load_env.mjs';
import {chromium} from 'playwright';
import fs from 'node:fs'; import path from 'node:path';
const [,, video, postFile, shots] = process.argv;
const post = JSON.parse(fs.readFileSync(postFile, 'utf8')); fs.mkdirSync(shots, {recursive: true});
const caption = ((post.tiktok && post.tiktok.caption) || `${post.title}\n${post.hashtags.join(' ')}`).slice(0, 2000);
const ctx = await chromium.launchPersistentContext(process.env.CHROME_PROFILE, {headless: false, executablePath: process.env.CHROME_PATH || undefined, viewport: {width: 1366, height: 900}});
const page = ctx.pages()[0] || await ctx.newPage();
const shot = async (n) => page.screenshot({path: path.join(shots, `${n}.png`)});
const dismiss = async () => { for (let i = 0; i < 4; i++) { const b = page.getByRole('button', {name: /^(Đã hiểu|Got it|OK|Bỏ qua|Skip)$/i}).first(); if (!(await b.isVisible().catch(() => false))) break; await b.click().catch(() => {}); await page.waitForTimeout(800); } };
try {
  await page.goto('https://www.tiktok.com/tiktokstudio/upload', {waitUntil: 'domcontentloaded'}); await page.waitForTimeout(6000); await shot('01-open');
  if (/login/.test(page.url())) throw new Error('TIKTOK_LOGIN_REQUIRED');
  await page.setInputFiles('input[type=file]', video); await page.waitForTimeout(8000); await shot('02-uploaded'); await dismiss();
  const ed = page.locator('[contenteditable="true"]').first();
  await ed.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace'); await page.keyboard.type(caption, {delay: 15});
  await shot('03-caption');
  // AI-generated content label: channel policy = OFF. Never switch it on; switch it off if TikTok pre-enabled it.
  const more = page.getByText(/Show more|Xem thêm|Hiển thị thêm|Hiện thêm/i).first(); if (await more.isVisible().catch(() => false)) await more.click();
  const ai = page.getByText(/AI-generated content|Nội dung do AI tạo/i).first();
  if (await ai.isVisible().catch(() => false)) {
    const sw = ai.locator('xpath=following::*[@role="switch" or @type="checkbox"][1]').first();
    const on = async () => /true/.test((await sw.getAttribute('aria-checked').catch(() => null)) || String(await sw.isChecked().catch(() => false)));
    if (await on()) { await sw.click({force: true}).catch(() => {}); await page.waitForTimeout(800); }
    console.log('AI_LABEL ' + ((await on()) ? 'STILL_ON' : 'OFF'));
  } else console.log('AI_LABEL NOT_FOUND (off)');
  await dismiss(); await shot('04-settings');
  for (let i = 0; i < 60; i++) { const b = page.getByRole('button', {name: /^(Post|Đăng)$/}); if (await b.isEnabled().catch(() => false)) { await b.click(); break; } await page.waitForTimeout(5000); }
  await page.waitForTimeout(3000);
  const now = page.getByRole('button', {name: /^(Đăng ngay|Post now)$/i}).first();
  if (await now.isVisible().catch(() => false)) await now.click();
  let ok = false;
  for (let i = 0; i < 24; i++) { await page.waitForTimeout(5000); if (!/tiktokstudio\/upload/.test(page.url()) || await page.getByText(/đã được đăng|has been posted|Quản lý bài đăng|Manage posts/i).first().isVisible().catch(() => false)) { ok = true; break; } }
  await shot('05-posted'); if (!ok) throw new Error('TIKTOK_POST_NOT_CONFIRMED url=' + page.url()); console.log('TIKTOK_POSTED ' + page.url());
} catch (e) { await shot('99-error'); console.error(String(e)); process.exitCode = 2; }
await ctx.close();
