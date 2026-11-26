// Muse (muse.ai) image generation — ALL prompts sent at once, one chat each, results mapped by chat id.
// usage: node scripts/muse_generate.mjs prompts.json out_dir      
// prompts.json: [{"id":"b01","prompt":"..."}, ...]  -> out_dir/<id>_0.jpg
// Env (config/env): MUSE_PROFILE (default ~/.config/chrome-muse), CHROME_PATH, MUSE_TIMEOUT_MIN (default 8)
// Exit 3 = MUSE_LOGIN_REQUIRED. Core page script adapted from CodeMuseTool engine/muse-page.js (vendor/muse-page.cjs).
import './load_env.mjs';
import {chromium} from 'playwright';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const require = createRequire(import.meta.url);
const {PAGE_SCRIPT, parseResult, CHUNK} = require('./vendor/muse-page.cjs');
const [,, promptsFile, outDir] = process.argv;
const HEAD = 'Tạo ảnh · tỷ lệ 9:16 dọc\n';
const TAIL = '\nChỉ tạo đúng 1 ảnh, làm ngay không hỏi lại. Không chữ, không logo, không watermark.';
const prompts = JSON.parse(fs.readFileSync(promptsFile, 'utf8'));
fs.mkdirSync(outDir, {recursive: true});
const PROFILE = process.env.MUSE_PROFILE || path.join(os.homedir(), '.config/chrome-muse');
const LIMIT = Number(process.env.MUSE_TIMEOUT_MIN || 8) * 60e3;
const ctx = await chromium.launchPersistentContext(PROFILE, {
  headless: false, executablePath: process.env.CHROME_PATH || undefined, viewport: {width: 1280, height: 900}});
const page = ctx.pages()[0] || await ctx.newPage();
await page.goto('https://muse.ai/', {waitUntil: 'domcontentloaded'});
const call = (name, ...args) => page.evaluate(`(window.__mss || ${PAGE_SCRIPT})[${JSON.stringify(name)}](...${JSON.stringify(args)})`);
let li = null;
for (let i = 0; i < 12; i++) { await page.waitForTimeout(5000); li = await call('login').catch(() => null); if (li?.loggedIn) break; }
if (!li?.loggedIn) { console.error('MUSE_LOGIN_REQUIRED', JSON.stringify(li)); if (process.env.MUSE_WAIT_LOGIN) await page.waitForTimeout(15 * 60e3); await ctx.close(); process.exit(3); }
if (process.argv.includes('--login-only')) { console.log('MUSE_LOGGED_IN'); await ctx.close(); process.exit(0); }

const todo = prompts.filter((p) => !fs.existsSync(path.join(outDir, `${p.id}_0.jpg`)));
const sids = {};
for (const p of todo) {           // send all first (each its own chat) — Muse works on them in parallel
  let r = null;
  for (let k = 0; k < 2 && !r?.ok; k++) { r = await call('send', HEAD + p.prompt + (p.raw ? '' : TAIL), []).catch((e) => ({ok: false, reason: e.message})); if (!r?.ok) await page.waitForTimeout(5000); }
  if (r?.ok && r.sessionId) { sids[p.id] = r.sessionId; console.log('sent', p.id, r.sessionId); } else console.log('SEND_FAIL', p.id, r?.reason);
  await page.waitForTimeout(1500);
}
const t0 = Date.now(); const pending = new Set(Object.keys(sids)); let failed = todo.length - pending.size;
while (pending.size && Date.now() - t0 < LIMIT) {
  await page.waitForTimeout(5000);
  for (const id of [...pending]) {
    const st = await call('status', sids[id]).catch(() => 'running');
    if (st === 'running' || (!st && Date.now() - t0 < 60e3)) continue;
    pending.delete(id);
    const {files, text} = parseResult(await call('result', sids[id]));
    const img = files.find((f) => f.mime.startsWith('image/'));
    if (!img) { failed++; console.log('NO_IMAGE', id, (text || st || '').slice(0, 200)); continue; }
    const {id: fid, size} = await call('open', img.path); const parts = [];
    for (let i = 0; i * CHUNK < size; i++) parts.push(Buffer.from(await call('slice', fid, i), 'base64'));
    await call('closeFile', fid).catch(() => {});
    const raw = path.join(outDir, `${id}_0.raw`); fs.writeFileSync(raw, Buffer.concat(parts));
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', raw, '-q:v', '2', path.join(outDir, `${id}_0.jpg`)]); fs.unlinkSync(raw);
    console.log('saved', `${id}_0.jpg`, Math.round((Date.now() - t0) / 1000) + 's');
  }
}
for (const id of pending) { failed++; console.log('TIMEOUT', id); await call('cancel', sids[id]).catch(() => {}); }
const q = await call('quota').catch(() => null); if (q?.usage) console.log('QUOTA used', q.usage.percentUsed + '%');
await ctx.close();
console.log(failed ? `DONE with ${failed} failed` : 'DONE all ok'); process.exit(failed ? 2 : 0);
