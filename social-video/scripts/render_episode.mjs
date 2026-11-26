// Render a board episode to mp4 (H.264, CRF 20). usage: node scripts/render_episode.mjs <compId> <out.mp4>
import {createRequire} from 'node:module';
import path from 'node:path';
const TPL = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'template');
const require = createRequire(path.join(TPL, 'package.json'));
const {bundle} = require('@remotion/bundler');
const {selectComposition, renderMedia} = require('@remotion/renderer');
const [,, comp, out] = process.argv;
const serveUrl = await bundle({entryPoint: path.join(TPL, 'src/index.ts')});
const composition = await selectComposition({serveUrl, id: comp});
let last = -1;
// RENDER_GL (e.g. swangle), RENDER_CONC, RENDER_RANGE='a-b' for diagnosing compositor ghosting
const extra = {};
if (process.env.RENDER_GL) extra.chromiumOptions = {gl: process.env.RENDER_GL};
if (process.env.RENDER_CONC) extra.concurrency = Number(process.env.RENDER_CONC);
if (process.env.RENDER_RANGE) extra.frameRange = process.env.RENDER_RANGE.split('-').map(Number);
await renderMedia({...extra, composition, serveUrl, codec: 'h264', crf: 20, outputLocation: path.resolve(out),
  onProgress: ({progress}) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log('progress', p * 10, '%'); } }});
console.log('done', out, composition.durationInFrames / composition.fps, 's');
