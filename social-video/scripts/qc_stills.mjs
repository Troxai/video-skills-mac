// QC stills for a board episode: bundle once, render many stills, then a contact sheet.
// usage: node scripts/qc_stills.mjs <compId> <run_dir> [frames_csv]
//   default frames: arrival of each station, middle + end of every sentence, summary card, outro
//   (from <run_dir>/timing.json + <run_dir>/voice/timing.json)
import {createRequire} from 'node:module';
import fs from 'node:fs'; import path from 'node:path'; import {execFileSync} from 'node:child_process';
const TPL = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'template');
const require = createRequire(path.join(TPL, 'package.json'));
const {bundle} = require('@remotion/bundler');
const {selectComposition, renderStill} = require('@remotion/renderer');
const [,, comp, runDir, csv] = process.argv;
const FPS = 30;
const out = path.join(runDir, 'qc'); fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(TPL, 'src/index.ts')});
const composition = await selectComposition({serveUrl, id: comp});
let frames = [];
if (csv) frames = csv.split(',').map((s) => ({f: +s, tag: `f${s}`}));
else {
  const st = JSON.parse(fs.readFileSync(path.join(runDir, 'timing.json'), 'utf8'));
  const sd = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(runDir, 'voice/timing.json'), 'utf8')).lines.map((l) => [l.id, l.dur]));
  let t = 0;
  st.lines.forEach((L, i) => {
    frames.push({f: Math.round((t + 0.5) * FPS), tag: `st${i}_arrive`});
    L.sentences.forEach((sid, k) => {
      const s0 = t + L.sub[k], d = sd[sid];
      frames.push({f: Math.round((s0 + d / 2) * FPS), tag: `${sid}_mid`});
      frames.push({f: Math.round((s0 + d - 0.1) * FPS), tag: `${sid}_end`});
    });
    t += L.dur + st.gap;
  });
  frames.push({f: composition.durationInFrames - 75, tag: 'summary'});
  frames.push({f: composition.durationInFrames - 8, tag: 'outro'});
}
frames = frames.filter((x) => x.f < composition.durationInFrames);
let n = 0;
for (const x of frames) {
  const file = path.join(out, `${String(n).padStart(3, '0')}.png`);
  await renderStill({composition, serveUrl, frame: x.f, output: file, imageFormat: 'png'});
  console.log(String(n).padStart(3, '0'), x.f, x.tag); n++;
}
fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(frames, null, 1));
// contact sheets: 6 x 2 per sheet, 360 px wide tiles
const per = 12;
for (let s = 0; s * per < n; s++) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-start_number', String(s * per), '-i', path.join(out, '%03d.png'), '-frames:v', '1',
    '-vf', `scale=360:-1,tile=6x2:padding=6:color=white`, path.join(out, `sheet_${s}.png`)]);
  console.log('sheet', s);
}
