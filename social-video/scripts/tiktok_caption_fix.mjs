// Kiểm / sửa caption MỘT bài TikTok vừa đăng của kênh (dùng cùng profile với tiktok_upload.mjs).
// usage: node scripts/tiktok_caption_fix.mjs <inspect|save> <chuỗi nhận diện bài> <post.json> <shots_dir>
// inspect: chỉ mở màn sửa và chụp, không gõ, không lưu.
import './load_env.mjs';
import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [,, mode, match, postFile, shots] = process.argv;
if (!['inspect', 'save'].includes(mode) || !match || !postFile || !shots) { console.error('bad args'); process.exit(1); }
const caption = JSON.parse(fs.readFileSync(postFile, 'utf8')).tiktok.caption;
fs.mkdirSync(shots, {recursive: true});
const ctx = await chromium.launchPersistentContext(process.env.CHROME_PROFILE, {headless: false, executablePath: process.env.CHROME_PATH || undefined, viewport: {width: 1366, height: 900}});
const page = ctx.pages()[0] || await ctx.newPage();
const shot = (n) => page.screenshot({path: path.join(shots, `fix-${mode}-${n}.png`)});
const clean = (s) => s.replace(/\s+/g, ' ').trim();
try {
  await page.goto('https://www.tiktok.com/tiktokstudio/content', {waitUntil: 'domcontentloaded'});
  await page.waitForTimeout(9000);
  await shot('1-list');
  const title = page.getByText(match, {exact: false});
  const n = await title.count();
  if (n !== 1) throw new Error(`cần đúng 1 bài khớp, thấy ${n}`);
  const t = await title.boundingBox();
  // nút bút chì = nút đầu tiên của cột "Hành động" trên cùng hàng
  const head = await page.getByText('Hành động', {exact: true}).first().boundingBox();
  // bút chì (tròn ~34 px) nằm ngay mép trái cột; KHÔNG dò nút khác trong hàng vì menu "…" có Xóa
  const row = {x: head.x + 17, y: t.y + 29};   // khối tiêu đề bị cắt dòng → tính từ mép trên
  console.log('PENCIL', JSON.stringify(row));
  if (row.x > 1150 || row.y < 190 || row.y > 860) throw new Error('toạ độ bút chì bất thường → không bấm');
  await page.mouse.click(row.x, row.y);
  await page.waitForTimeout(8000);
  await shot('2-edit');
  console.log('URL', page.url());
  const ed = page.locator('[contenteditable="true"]').first();
  const before = clean(await ed.innerText({timeout: 10000}));
  console.log('BEFORE', before);
  console.log('BUTTONS', JSON.stringify(await page.locator('button:visible').allInnerTexts()));
  if (!before.includes(match)) throw new Error('màn sửa không phải bài cần sửa');
  if (mode === 'save') {
    await ed.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(1000);
    await page.keyboard.insertText(caption);
    await page.waitForTimeout(2500);
    const typed = clean(await ed.innerText());
    console.log('TYPED', typed);
    await shot('3-typed');
    if (typed !== clean(caption)) throw new Error('caption gõ ra không khớp → không lưu');
    await page.getByRole('button', {name: /^(Lưu|Save)$/}).click({timeout: 15000});
    await page.waitForTimeout(7000);
    await shot('4-saved');
    console.log('SAVE_CLICKED', page.url());
  }
} catch (e) {
  await shot('99-error').catch(() => {});
  console.error(String(e));
  process.exitCode = 2;
}
await ctx.close();
