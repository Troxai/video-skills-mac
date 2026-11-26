// Google Flow image generation — v2 (12/11/2026): submits several prompts in parallel and matches
// every result to its prompt from Flow's own network response (prompt text + image URLs), not from the screen.
// usage: node scripts/flow_generate.mjs prompts.json out_dir
// prompts.json: [{"id":"tower","prompt":"..."}, ...]   (the shared frame is prepended automatically)
// Env (config/env): FLOW_PROFILE or CHROME_PROFILE, CHROME_PATH, FLOW_PROJECT_URL,
//   FLOW_RATIO=9:16|16:9 (default 9:16), FLOW_CONC (parallel prompts, default 3, max 4),
//   FLOW_GAP_MIN/FLOW_GAP_MAX (seconds between two submits, default 4–8), FLOW_TIMEOUT_S (per prompt, default 240)
// Exit: 0 all done · 2 some prompts failed (re-run the same command: done ids are skipped) · 3 Google login needed · 4 Flow page broken
import './load_env.mjs';
import {chromium} from 'playwright';
import fs from 'node:fs'; import path from 'node:path';
const [,, promptsFile, outDir] = process.argv;
if (!promptsFile || !outDir) { console.error('usage: flow_generate.mjs prompts.json out_dir'); process.exit(1); }
const E = process.env;
const RATIO = E.FLOW_RATIO || '9:16', WIDE = RATIO === '16:9';
const CONC = Math.min(Math.max(parseInt(E.FLOW_CONC || '3', 10) || 3, 1), 4);
const GAP_MIN = +(E.FLOW_GAP_MIN || 4), GAP_MAX = +(E.FLOW_GAP_MAX || 8);
const TIMEOUT = +(E.FLOW_TIMEOUT_S || 240) * 1000;
const FRAME = (WIDE ? 'Horizontal 16:9 widescreen' : 'Vertical 9:16') + ' cinematic editorial documentary photograph, 35mm lens, natural realism, subtle film grain. No readable text, no letters, no numbers, no logos, no signage, no watermark. ';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const gap = () => (GAP_MIN + Math.random() * Math.max(0, GAP_MAX - GAP_MIN)) * 1000;
const log = (...a) => console.log(new Date().toTimeString().slice(0, 8), ...a);

const all = JSON.parse(fs.readFileSync(promptsFile, 'utf8'));
fs.mkdirSync(outDir, {recursive: true});
const todo = all.filter((p) => !fs.existsSync(path.join(outDir, `${p.id}_0.jpg`)));
all.filter((p) => !todo.includes(p)).forEach((p) => log('skip', p.id));
if (!todo.length) { log('nothing to do'); process.exit(0); }
// Flow echoes the prompt text back; identical texts would be ambiguous → make each one unique
const seen = new Map();
for (const p of todo) {
  let t = (FRAME + p.prompt).replace(/\s+/g, ' ').trim();
  const n = seen.get(t) || 0; seen.set(t, n + 1);
  if (n) t += ` (variation ${n + 1})`;
  p._text = t;
}

// shared lock: only one Flow run at a time across GNDC / BMD / 90P (same Google account)
{ const L = '/tmp/flow_account.lock'; const t0 = Date.now();
  const alive = (p) => { try { process.kill(p, 0); return true; } catch { return false; } };
  for (;;) {
    try { fs.writeFileSync(L, String(process.pid), {flag: 'wx'}); break; }
    catch { const o = parseInt(fs.readFileSync(L, 'utf8')) || 0;
      if (!o || !alive(o)) { try { fs.unlinkSync(L); } catch {} continue; }
      if (Date.now() - t0 > 90 * 60000) { console.error('FLOW_BUSY: kênh khác dùng Flow quá 90 phút'); process.exit(5); }
      if ((Date.now() - t0) % 300000 < 15000) console.log('chờ kênh khác dùng xong Flow (pid ' + o + ')');
      await new Promise((r) => setTimeout(r, 15000)); } }
  const rel = () => { try { if (fs.readFileSync(L, 'utf8') === String(process.pid)) fs.unlinkSync(L); } catch {} };
  process.on('exit', rel); }
const ctx = await chromium.launchPersistentContext(E.FLOW_PROFILE || E.CHROME_PROFILE, {
  headless: false, executablePath: E.CHROME_PATH || undefined, viewport: {width: 1280, height: 900}});
const page = ctx.pages()[0] || await ctx.newPage();
const finish = async (code) => { await ctx.close().catch(() => {}); process.exit(code); };

// ---- network: every generate call (rpc ogiZ0b) answers with the prompt text + image URLs ----
const inflight = new Map();   // text → {p, t0, tries}
const results = new Map();    // id → [urls]
const failed = new Map();     // id → reason
const strings = (v, out = []) => {
  if (typeof v === 'string') {
    out.push(v);
    if (v.length > 1 && (v[0] === '[' || v[0] === '{')) { try { strings(JSON.parse(v), out); } catch {} }
  } else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out));
  return out;
};
page.on('response', async (r) => {
  if (!r.url().includes('batchexecute') || !r.url().includes('ogiZ0b')) return;
  let body = ''; try { body = await r.text(); } catch { return; }
  const strs = [];
  for (const line of body.split('\n')) if (line.startsWith('[')) { try { strings(JSON.parse(line), strs); } catch {} }
  const sent = decodeURIComponent((r.request().postData() || '').replace(/\+/g, ' '));
  const hit = [...inflight.keys()].find((t) => strs.includes(t)) || [...inflight.keys()].find((t) => sent.includes(JSON.stringify(t).slice(1, -1)));
  if (!hit) return;
  const job = inflight.get(hit); inflight.delete(hit);
  const urls = [...new Map(strs.filter((s) => s.startsWith('https://flow-content.google/image/'))
    .map((u) => [u.split('?')[0], u])).values()];
  if (urls.length) results.set(job.p.id, urls);
  else {
    const why = strs.find((s) => /policy|unsafe|quota|limit|error|blocked|violat/i.test(s)) || `HTTP ${r.status()} không có ảnh`;
    failed.set(job.p.id, why.slice(0, 160));
  }
});

await page.goto(E.FLOW_PROJECT_URL, {waitUntil: 'domcontentloaded'});
await page.waitForTimeout(8000);
if (page.url().includes('accounts.google.com')) { console.error('FLOW_LOGIN_REQUIRED'); await finish(3); }
const box = page.locator('[contenteditable="true"], textarea').first();
const send = page.locator('button:has-text("arrow_forward")').last();
try { await box.waitFor({timeout: 45000}); await send.waitFor({timeout: 15000}); } catch {}
if (!(await box.count()) || !(await send.count())) { await page.screenshot({path: path.join(outDir, '_flow_error.png')}).catch(() => {}); console.error('FLOW_PAGE_CHANGED (không thấy ô nhập/nút gửi)'); await finish(4); }
// image mode + aspect ratio + x2, set explicitly every run (project settings are remembered by Flow)
try {
  const tag = 'crop_' + RATIO.replace(':', '_');
  const settings = page.locator('button:has-text("crop_")').last();
  if (!(await settings.innerText()).includes(tag)) {
    await settings.click(); await page.waitForTimeout(1200);
    await page.locator(`button:has-text("${tag}")`).first().click(); await page.waitForTimeout(800);
    await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  }
  log('settings', (await settings.innerText()).replace(/\s+/g, ' '));
} catch (e) { console.error('FLOW_RATIO_WARN', String(e).slice(0, 120)); }

const submit = async (p) => {
  await box.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace');
  await page.keyboard.insertText(p._text); await page.waitForTimeout(600 + Math.random() * 600);
  inflight.set(p._text, {p, t0: Date.now()});
  await send.click();
  log('sent', p.id, `(đang chạy ${inflight.size})`);
};
const save = async (id, urls) => {
  let k = 0;
  for (const u of urls.slice(0, 2)) {
    try {
      const b64 = await page.evaluate(async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(r.status); const b = new Uint8Array(await r.arrayBuffer());
        let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(s); }, u);
      const tmp = path.join(outDir, `.${id}_${k}.part`);
      fs.writeFileSync(tmp, Buffer.from(b64, 'base64')); fs.renameSync(tmp, path.join(outDir, `${id}_${k}.jpg`)); k++;
    } catch (e) { console.error('download lỗi', id, String(e).slice(0, 80)); }
  }
  if (k) log('saved', id, `${k} ảnh`); else failed.set(id, 'tải ảnh lỗi');
};

// ---- main loop: keep CONC prompts in flight, back off when Flow starts refusing ----
const queue = [...todo]; const retried = new Set();
let conc = CONC, streak = 0, lastSend = 0, done = 0, wait = 0;
const t0 = Date.now();
while (queue.length || inflight.size || results.size || failed.size) {
  for (const [id, urls] of results) { results.delete(id); await save(id, urls); done++; streak = 0; }
  for (const [id, why] of failed) {
    failed.delete(id);
    const p = todo.find((x) => x.id === id);
    if (!retried.has(id)) { retried.add(id); queue.push(p); log('lỗi', id, '→ thử lại sau:', why); }
    else { console.error(`FLOW_NO_RESULT ${id}: ${why}`); p._dead = true; }
    if (++streak >= 2 && conc > 1) { conc = 1; log('Flow từ chối liên tiếp → giảm còn 1 luồng, nghỉ 60s'); await sleep(60000); }
  }
  for (const [t, job] of inflight) if (Date.now() - job.t0 > TIMEOUT) { inflight.delete(t); failed.set(job.p.id, 'quá thời gian chờ'); }
  if (queue.length && inflight.size < conc && Date.now() - lastSend > wait) {
    const p = queue.shift();
    try { await submit(p); lastSend = Date.now(); wait = gap(); }
    catch (e) { inflight.delete(p._text); failed.set(p.id, 'không gửi được: ' + String(e).slice(0, 80)); }
  }
  await sleep(1000);
}
const dead = todo.filter((p) => p._dead).map((p) => p.id);
log(`xong ${done}/${todo.length} prompt trong ${Math.round((Date.now() - t0) / 1000)}s (${conc} luồng)`);
if (dead.length) console.error(`FLOW_FAILED_${dead.length}_OF_${todo.length}: ${dead.join(',')}`);
await finish(dead.length ? 2 : 0);
