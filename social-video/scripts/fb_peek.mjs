// Screenshot + text of a FB page using logged-in profile: node fb_peek.mjs <url> <outdir>
import './load_env.mjs'; import {chromium} from 'playwright'; import fs from 'node:fs';
const [,, url, out] = process.argv;
const ctx = await chromium.launchPersistentContext(process.env.CHROME_PROFILE, {headless: false, executablePath: process.env.CHROME_PATH || undefined, viewport: {width: 1280, height: 1000}});
const p = await ctx.newPage(); await p.goto(url, {waitUntil: 'domcontentloaded', timeout: 60000}); await p.waitForTimeout(6000);
await p.screenshot({path: `${out}/0.png`});
for (let i = 1; i <= 4; i++) { await p.mouse.wheel(0, 1800); await p.waitForTimeout(3000); await p.screenshot({path: `${out}/${i}.png`}); }
fs.writeFileSync(`${out}/text.txt`, await p.evaluate(() => document.body.innerText));
await ctx.close();
