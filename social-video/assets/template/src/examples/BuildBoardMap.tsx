import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, random} from 'remotion';

/* Ninh Bình đấu giá đất — thử style bảng xây dần + bản đồ vệ tinh (anh 26/11). */
/* =========================================================================
   STYLE MẪU "BẢNG XÂY DẦN" (anh 26/11/2026) — sao file này cho video mới.
   - Mỗi BẢNG (board) được xây dần qua 2–5 câu: vật/chữ/số/mũi tên lần lượt thêm vào và Ở LẠI,
     thành 1 sơ đồ nhỏ có quan hệ. Camera trong bảng lấy nét vào phần mới thêm, lùi dần ra khi bảng đầy.
   - Các bảng nằm trên 1 không gian lớn; giữa 2 bảng camera lùi ra + lia (nhịp khác nhau). Không cắt cứng,
     không vật bay ra/bay vào, không đường chấm nối.
   - Nền đen hạt nhiễu · timeline năm trên cùng · thẻ báo xé mép + highlight bút dạ · mũi tên vẽ tay · SFX.
   Nội dung: video vàng 19/11 (giọng, số liệu, ảnh giữ nguyên).
   ========================================================================= */
import ST from './2026-11-17-dau-gia-dat.timing.json';
import MAPMETA from '../../public/episodes/2026-11-17-dau-gia-dat/map/meta.json';
import WORDS from '../../public/episodes/2026-11-17-dau-gia-dat/words.json';

const FPS = 30;
const DIR = 'episodes/2026-11-17-dau-gia-dat';
const LINES = ST.lines.map((l, i) => l.dur + 0.25 + (i === ST.lines.length - 1 ? 1.2 : 0));
const START = LINES.reduce<number[]>((a, d, i) => [...a, i ? a[i - 1] + LINES[i - 1] : 0], []);
const SENT: Record<string, number> = {};
ST.lines.forEach((l, i) => l.sentences.forEach((s, k) => { SENT[s] = START[i] + l.sub[k]; }));
export const TOTAL = Math.round((START[START.length - 1] + LINES[LINES.length - 1] + 1.0) * FPS);
const F = (s: number) => Math.round(s * FPS);
const norm = (x: string) => x.toLowerCase().replace(/[.,!?%:;"“”()]/g, '').trim();
const W = (sid: string, phrase?: string) => {
  if (!phrase) return F(SENT[sid]);
  const ws = (WORDS as any)[sid] || [], q = phrase.split(/\s+/).map(norm);
  for (let i = 0; i + q.length <= ws.length; i++) if (q.every((t, k) => norm(ws[i + k].w).startsWith(t))) return Math.max(F(SENT[sid]), F(SENT[sid] + ws[i].t) - 3);
  return F(SENT[sid]);
};

const C = {bg: '#0b0b0b', white: '#f4f1ea', red: '#e0342a', orange: '#f5a623', gold: '#e9c25a', mute: '#9a968e', blue: '#1aa6d8'};
const font = '"Noto Sans Display", "DejaVu Sans", sans-serif';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const out3 = (t: number) => 1 - Math.pow(1 - t, 3);
const back = (t: number) => {const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);};
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const ramp = (f: number, a: number, d: number, e = out3) => interpolate(f, [a, a + d], [0, 1], {...cl, easing: e});

/* ---------- board spec ---------- */
type El = {
  at: string; ph?: string; d?: number; // cue: sentence, phrase, extra frames
  k: 'img' | 'txt' | 'arrow' | 'news' | 'title' | 'tl' | 'map';
  h?: number; z0?: number; z1?: number; zd?: number; pin?: string; pinAt?: [string, string?]; labels?: [string, number, number][];
  x?: number; y?: number; w?: number; hr?: number; // centre position, width, height ratio
  img?: string; drop?: boolean; rot?: number; rotTo?: number; rotAt?: [string, string?];
  t?: string; c?: string; s?: number; count?: boolean; under?: boolean;
  from?: [number, number]; to?: [number, number]; bend?: number;
  news?: [string, string, string]; tl?: number; src?: string;
};
type Board = {id: string; els: El[]};
const TL = ['07/11', '09/11', '17/11'];

const LAT = 20.5458, LON = 106.0236; // khu vực Lý Nhân (cũ), Ninh Bình — minh hoạ khu vực, không phải vị trí lô đất
const BOARDS: Board[] = [
  {id: 'ban-do', els: [
    {k: 'tl', at: 's01', tl: 0},
    {k: 'img', at: 's01', ph: 'phiếu', img: 'c00', x: 540, y: 860, w: 760},
    {k: 'txt', at: 's01', ph: ',468', t: '1,468 TỶ', c: C.red, x: 540, y: 1330, w: 900, s: 1.7, count: true},
    {k: 'txt', at: 's01', ph: 'mỗi', t: 'cho MỖI m² đất', c: C.white, x: 540, y: 1470, w: 900, s: 0.85},
  ]},
  {id: 'gap-160', els: [
    {k: 'img', at: 's02', img: 'c05', x: 290, y: 640, w: 520},
    {k: 'txt', at: 's02', ph: '120', t: 'lô 120 m²', c: C.white, x: 290, y: 950, w: 500, s: 0.95},
    {k: 'arrow', at: 's02', ph: 'tức', from: [565, 650], to: [650, 650], bend: -40},
    {k: 'txt', at: 's02', ph: '176', t: '≈ 176 TỶ', c: C.red, x: 850, y: 620, w: 420, s: 1.25, count: true},
    {k: 'txt', at: 's02', ph: '176', d: 8, t: 'cả lô', c: C.mute, x: 850, y: 720, w: 420, s: 0.6},
    {k: 'txt', at: 's03', ph: '1', t: 'khởi điểm ~1,1 tỷ', c: C.gold, x: 540, y: 1090, w: 900, s: 0.95, src: 'theo Tiền Phong'},
    {k: 'txt', at: 's04', t: 'GẤP ~160 LẦN', c: C.red, x: 540, y: 1220, w: 900, s: 1.5, under: true},
    {k: 'img', at: 's04', ph: 'xã', img: 'c03', x: 330, y: 1500, w: 580},
    {k: 'txt', at: 's04', ph: 'xã', t: 'xã thuần nông', c: C.white, x: 820, y: 1420, w: 400, s: 0.7},
    {k: 'txt', at: 's04', ph: 'biển', t: 'không biển', c: C.mute, x: 820, y: 1500, w: 400, s: 0.6},
    {k: 'txt', at: 's04', ph: 'khu', t: 'không KCN', c: C.mute, x: 820, y: 1570, w: 400, s: 0.6},
  ]},
  {id: 'nham', els: [
    {k: 'img', at: 's05', img: 'c04', x: 540, y: 860, w: 700},
    {k: 'txt', at: 's05', ph: 'nhầm', t: 'NHẦM ĐƠN VỊ?', c: C.orange, x: 540, y: 1330, w: 900, s: 1.5, under: true},
    {k: 'txt', at: 's05', ph: 'sau', t: 'chuyện đáng kể nằm SAU tờ phiếu', c: C.white, x: 540, y: 1470, w: 900, s: 0.75},
  ]},
  {id: 'phien', els: [
    {k: 'tl', at: 's06', tl: 0},
    {k: 'txt', at: 's06', ph: '70', t: '70 LÔ ĐẤT Ở', c: C.gold, x: 540, y: 620, w: 900, s: 1.4, count: true},
    {k: 'txt', at: 's06', ph: '110', t: 'mỗi lô 110 – gần 200 m²', c: C.white, x: 540, y: 760, w: 900, s: 0.8},
    {k: 'img', at: 's06', ph: '70', d: 6, img: 'c11', x: 540, y: 1220, w: 760, hr: 0.75},
  ]},
];
// full-screen satellite background: [frame, map zoom, blur px]; pin visible while sharp
const MK: [number, number, number][] = [
  [W('s01'), 7.6, 0], [W('s01') + 66, 13.6, 0], [W('s01', 'phiếu') - 6, 13.75, 0], [W('s01', 'phiếu') + 14, 13.9, 16],
  [W('s06') - 4, 13.9, 16], [W('s06') + 16, 13.9, 0], [W('s06', 'lý') + 40, 14.7, 0], [W('s06', '70') - 4, 14.75, 0], [W('s06', '70') + 14, 14.8, 14],
];
const PINS: [number, number, string][] = [[W('s01', 'ninh'), W('s01', 'phiếu') + 4, 'LÝ NHÂN · NINH BÌNH'], [W('s06', 'lý'), W('s06', '70') + 4, 'XÃ LÝ NHÂN']];
export const SHORT_FRAMES = Math.round((ST.lines[0].dur + ST.lines[1].dur + ST.lines[2].dur + ST.lines[3].dur + 1.0 + 0.25 * 4) * 30);

/* ---------- timing ---------- */
const EF = BOARDS.map((b) => b.els.map((e) => W(e.at, e.ph) + (e.d || 0)));
const BF = BOARDS.map((b) => F(SENT[b.els[0].at]));
const BE = BF.map((_, i) => (i + 1 < BF.length ? BF[i + 1] : TOTAL));
const POS = BOARDS.map((_, i) => {
  const row = Math.floor(i / 3), c = i % 3, col = row % 2 ? 2 - c : c;
  return {x: col * 1500, y: row * 2400 + (c === 1 ? 300 : 0)};
});

/* ---------- camera: per board, focus on newest element, widen as the board fills ---------- */
type Cam = {x: number; y: number; z: number};
const elBox = (e: El) => ({x: e.k === 'arrow' ? (e.from![0] + e.to![0]) / 2 : e.x ?? 540, y: e.k === 'arrow' ? (e.from![1] + e.to![1]) / 2 : e.y ?? 960});
const fit = (e: El) => Math.min(96 * (e.s || 1), ((e.w || 960) * 1.5) / (e.t || '').length);
const bounds = (e: El) => {
  if (e.k === 'arrow') return {l: Math.min(e.from![0], e.to![0]), r: Math.max(e.from![0], e.to![0]), t: Math.min(e.from![1], e.to![1]), b: Math.max(e.from![1], e.to![1])};
  if (e.k === 'map') return {l: (e.x ?? 540) - (e.w || 960) / 2, r: (e.x ?? 540) + (e.w || 960) / 2, t: (e.y ?? 760) - (e.h || 800) / 2, b: (e.y ?? 760) + (e.h || 800) / 2};
  const w = e.k === 'img' ? e.w || 400 : e.w || 960, x = e.k === 'title' ? 540 : e.x ?? 540;
  const h = e.k === 'img' ? w * (e.hr || 1) : e.k === 'news' ? 420 * w / 820 : e.k === 'title' ? 150 : fit(e) * 1.4;
  const l = e.k === 'txt' ? Math.min(1020 - w, Math.max(60, x - w / 2)) : x - w / 2;
  return {l, r: l + w, t: (e.y ?? 960) - h / 2, b: (e.y ?? 960) + h / 2};
};
// camera keys: zoom toward the newest element, but EVERY element already on the board must stay inside the frame
const KEYS = BOARDS.map((b, bi) => {
  const ks: {f: number; c: Cam}[] = [];
  const seen: El[] = [];
  b.els.forEach((e, j) => {
    if (e.k === 'tl') return;
    seen.push(e);
    const B = seen.map(bounds).reduce((a, q) => ({l: Math.min(a.l, q.l), r: Math.max(a.r, q.r), t: Math.min(a.t, q.t), b: Math.max(a.b, q.b)}));
    const M = 50; // margin
    const zFit = Math.min(1080 / (B.r - B.l + 2 * M), 1920 / (B.b - B.t + 2 * M) * 0.92);
    const z = Math.max(1, Math.min(1.3 - 0.06 * (seen.length - 1), zFit));
    const p = bounds(e), px = (p.l + p.r) / 2, py = (p.t + p.b) / 2;
    const hw = 540 / z, hh = 960 / z;
    let x = px * 0.5 + ((B.l + B.r) / 2) * 0.5, y = py * 0.5 + ((B.t + B.b) / 2) * 0.5;
    x = Math.min(B.l - M + hw, Math.max(B.r + M - hw, x)); y = Math.min(B.t - M + hh, Math.max(B.b + M - hh, y)); // keep bbox in view
    x = Math.min(1080 - hw, Math.max(hw, x)); y = Math.min(1920 - hh, Math.max(hh, y)); // stay on the board
    const f = EF[bi][j];
    if (ks.length && f - ks[ks.length - 1].f < 6) ks[ks.length - 1] = {f: ks[ks.length - 1].f, c: {x, y, z}}; else ks.push({f, c: {x, y, z}});
  });
  return ks;
});
const inBoard = (bi: number, f: number): Cam => {
  const ks = KEYS[bi];
  let j = 0;
  for (let i = 0; i < ks.length; i++) if (f >= ks[i].f) j = i;
  const A = ks[Math.max(0, j - 1)].c, B = ks[j].c;
  const t = j === 0 ? 1 : ramp(f, ks[j].f, 22, inOut);
  const wide = ramp(f, BE[bi] - 45, 40, inOut) * (ks.length > 2 ? 1 : 0);
  const c = {x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t, z: A.z + (B.z - A.z) * t};
  return {x: c.x + (540 - c.x) * wide, y: c.y + (960 - c.y) * wide, z: c.z + (1 - c.z) * wide};
};
const MOVES = BOARDS.map((_, i) => [{d: 34, pull: 1, blur: 0}, {d: 18, pull: 0.4, blur: 14}, {d: 46, pull: 0.25, blur: 0}, {d: 14, pull: 0.15, blur: 26}][(i * 3 + 1) % 4]);
const camAt = (f: number) => {
  let b = 0;
  for (let i = 0; i < BF.length; i++) if (f >= BF[i] - MOVES[i].d / 2) b = i;
  const m = MOVES[b];
  let cx: number, cy: number, z: number, blur = 0;
  const cur = inBoard(b, Math.max(f, BF[b]));
  if (b > 0 && f < BF[b] + m.d / 2) {
    const t = ramp(f, BF[b] - m.d / 2, m.d, inOut);
    const prev = inBoard(b - 1, BF[b] - 1);
    const ax = POS[b - 1].x + prev.x, ay = POS[b - 1].y + prev.y, bx = POS[b].x + cur.x, by = POS[b].y + cur.y;
    cx = ax + (bx - ax) * t; cy = ay + (by - ay) * t;
    const pull = m.pull * 0.55 * Math.sin(Math.PI * t);
    z = (prev.z + (cur.z - prev.z) * t) * (1 - pull);
    blur = m.blur * Math.sin(Math.PI * t);
  } else { cx = POS[b].x + cur.x; cy = POS[b].y + cur.y; z = cur.z; }
  const hx = (random(`hx${Math.floor(f / 3)}`) - 0.5) * 2.5, hy = (random(`hy${Math.floor(f / 3)}`) - 0.5) * 2.5;
  return {x: cx + Math.sin(f / 70) * 8 + hx, y: cy + Math.cos(f / 85) * 6 + hy, z, r: Math.sin(f / 90) * 0.7, b, blur};
};

/* ---------- pieces ---------- */
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill>
    <svg width="1080" height="1920" style={{position: 'absolute', opacity: 0.16}}>
      <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(f / 2) % 50} /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter="url(#g)" />
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.6) 100%)'}} />
  </AbsoluteFill>;
};

const TLEV = (() => {
  const ev: {f: number; i: number}[] = [];
  BOARDS.forEach((b, bi) => {
    const own = b.els.map((e, j) => ({e, f: EF[bi][j]})).filter((x) => x.e.k === 'tl');
    if (!own.length || own[0].f > BF[bi] + 3) ev.push({f: BF[bi], i: -1});
    own.forEach((x) => ev.push({f: x.f, i: x.e.tl!}));
  });
  return ev.sort((a, b) => a.f - b.f);
})();
const Timeline: React.FC = () => {
  const f = useCurrentFrame();
  let cur = -1, prevVis = 0, from = 0, lastVis = 0;
  for (const e of TLEV) { if (e.f > f) break; if (e.i >= 0) { prevVis = lastVis; lastVis = e.i; } cur = e.i; from = e.f; }
  const show = cur >= 0;
  const a = show ? ramp(f, from, 10) : 1 - ramp(f, from, 10);
  const pos = show ? prevVis + (lastVis - prevVis) * ramp(f, from, 20, inOut) : lastVis;
  if (a <= 0) return null;
  return <div style={{position: 'absolute', top: 170, left: 0, width: 1080, height: 140, opacity: a, transform: `translateY(${(1 - a) * -40}px)`}}>
    <div style={{position: 'absolute', top: 86, left: 0, width: 1080, height: 5, background: C.white, boxShadow: '0 0 12px rgba(255,255,255,.4)'}} />
    {TL.map((l, i) => {
      const x = 540 + (i - pos) * 330, on = Math.abs(i - pos) < 0.4;
      return <div key={l} style={{position: 'absolute', left: x, top: 0, transform: 'translateX(-50%)', textAlign: 'center'}}>
        <div style={{fontFamily: font, fontWeight: 900, fontStretch: 'condensed', fontSize: on ? 60 : 38, color: on ? C.white : C.mute, whiteSpace: 'nowrap', height: 72}}>{l === '01/2026' ? '01/2026 · ĐỈNH' : l}</div>
        <div style={{width: on ? 8 : 4, height: on ? 40 : 26, background: on ? C.orange : C.white, margin: '0 auto', marginTop: on ? -4 : 6}} />
      </div>;
    })}
  </div>;
};

const countUp = (txt: string, k: number) => {
  const m = txt.match(/(\d{1,3}(?:\.\d{3})+|\d+(?:,\d+)?)/);
  if (!m) return txt;
  const raw = m[1], dec = raw.includes(',') ? raw.split(',')[1].length : 0;
  const v = parseFloat(raw.replace(/\./g, '').replace(',', '.')) * k;
  return txt.replace(raw, dec ? v.toFixed(dec).replace('.', ',') : Math.round(v).toLocaleString('de-DE'));
};

// hand-drawn line: one continuous wobbly stroke that draws itself
const Hand: React.FC<{d: string; k: number; color: string; width: number}> = ({d, k, color, width}) =>
  <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} />;

const Txt: React.FC<{e: El; at: number}> = ({e, at}) => {
  const f = useCurrentFrame();
  const size = fit(e), w = e.w || 960;
  const txt = e.count ? countUp(e.t!, ramp(f, at, 22)) : e.t!;
  const left = Math.min(1020 - w, Math.max(60, (e.x ?? 540) - w / 2));
  const uk = ramp(f, at + e.t!.length * 1.1 + 4, 12);
  const seed = e.t!.length;
  const ul = Array.from({length: 7}, (_, j) => `${10 + j * 13},${6 + (random(`u${seed}${j}`) - 0.5) * 6}`).join(' L');
  return <div style={{position: 'absolute', left, top: (e.y ?? 960) - size * 0.6, width: w, textAlign: 'center', fontFamily: font, fontWeight: 900, fontStretch: 'condensed', fontSize: size,
    lineHeight: 1.1, color: e.c || C.white, whiteSpace: 'nowrap', textShadow: '0 6px 24px rgba(0,0,0,.9)', perspective: 600}}>
    {txt.split('').map((ch, i) => {
      const k = ramp(f, at + i * 1.1, 9, back);
      return <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: ramp(f, at + i * 1.1, 4), filter: `blur(${(1 - Math.min(1, k)) * 6}px)`,
        transform: `translateY(${(1 - k) * 50}px) rotateX(${(1 - k) * -80}deg)`}}>{ch}</span>;
    })}
    {e.under && <svg viewBox="0 0 100 12" preserveAspectRatio="none" style={{display: 'block', width: '70%', height: 22, margin: '-4px auto 0', overflow: 'visible'}}>
      <Hand d={`M${ul}`} k={uk} color={e.c === C.red ? C.orange : C.red} width={2.4} />
    </svg>}
  </div>;
};

const Typed: React.FC<{e: El; at: number}> = ({e, at}) => {
  const f = useCurrentFrame();
  const t = e.t!, n = Math.max(0, Math.min(t.length, Math.floor(((f - at) / FPS) * 24)));
  const size = Math.min(124, 1700 / t.length);
  return <div style={{position: 'absolute', left: 60, width: 960, top: (e.y ?? 420) - size * 0.6, textAlign: 'center', fontFamily: font, fontWeight: 900, fontStretch: 'condensed', fontSize: size,
    lineHeight: 1.05, color: e.c || C.white, textShadow: '0 6px 24px rgba(0,0,0,.8)', whiteSpace: 'nowrap', opacity: f >= at ? 1 : 0}}>
    {t.slice(0, n)}<span style={{opacity: n < t.length && f % 16 < 10 ? 1 : 0}}>▍</span></div>;
};

const ImgEl: React.FC<{e: El; at: number}> = ({e, at}) => {
  const f = useCurrentFrame();
  const w = e.w || 400, h = w * (e.hr || 1);
  const k = ramp(f, at, 16, back), m = ramp(f, at, 10);
  const tt = (f - at) / FPS;
  const fall = e.drop ? (1 - ramp(f, at, 12, (x) => x * x)) * -700 + Math.abs(Math.sin(tt * 10)) * Math.exp(-tt * 6) * -60 * (f > at + 12 ? 1 : 0) : 0;
  const rot = (e.rot || 0) + (e.rotTo !== undefined ? (e.rotTo - (e.rot || 0)) * ramp(f, W(e.rotAt![0], e.rotAt![1]), 30, back) : 0) + Math.sin((f + w) / 30) * 2.5;
  const ry = Math.sin((f + w) / 45) * 14;
  return <div style={{position: 'absolute', left: (e.x ?? 540) - w / 2, top: (e.y ?? 960) - h / 2, width: w, height: h, perspective: 1000, opacity: e.drop ? 1 : m}}>
    <div style={{width: '100%', height: '100%', transform: `translateY(${fall + Math.sin((f + w) / 28) * 8}px) rotate(${rot}deg) rotateY(${ry}deg) scale(${e.drop ? 1 : 0.6 + 0.4 * k})`,
      filter: `blur(${e.drop ? 0 : (1 - m) * 10}px) drop-shadow(${-ry * 0.8}px 30px 30px rgba(0,0,0,.85))`}}>
      <Img src={staticFile(`${DIR}/img/${e.img}.png`)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
    </div>
  </div>;
};

const Arrow: React.FC<{e: El; at: number}> = ({e, at}) => {
  const f = useCurrentFrame();
  const [x1, y1] = e.from!, [x2, y2] = e.to!;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const b = e.bend ?? 60, cx = mx - (dy / L) * b, cy = my + (dx / L) * b;
  const k = ramp(f, at, 14, inOut);
  const ang = Math.atan2(y2 - cy, x2 - cx);
  const hx = (s: number) => `${x2 - Math.cos(ang + s) * 34},${y2 - Math.sin(ang + s) * 34}`;
  return <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <Hand d={`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`} k={k} color={C.white} width={6} />
    <Hand d={`M${hx(0.5)} L${x2},${y2} L${hx(-0.5)}`} k={ramp(f, at + 12, 6)} color={C.white} width={6} />
  </svg>;
};

const TORN = `polygon(0 0, 100% 0, 100% 93%, ${Array.from({length: 22}, (_, j) => `${100 - (j + 1) * 100 / 22}% ${93 + random(`t${j}`) * 7}%`).join(', ')})`;
const News: React.FC<{e: El; at: number}> = ({e, at}) => {
  const f = useCurrentFrame();
  const [src, head, mark] = e.news!;
  const w = e.w || 820, sc = w / 820;
  const k = ramp(f, at, 16, back), hl = W(e.at, mark.split(' ')[0]) + 4, sweep = ramp(f, hl, 14);
  const i = head.indexOf(mark);
  return <div style={{position: 'absolute', left: (e.x ?? 540) - w / 2, top: (e.y ?? 600) - 200 * sc, width: w, transform: `translateY(${(1 - k) * 80}px) rotate(${-2.5 + (1 - k) * 8}deg) scale(${0.85 + 0.15 * k})`, opacity: ramp(f, at, 6)}}>
    <div style={{background: '#fbfaf6', padding: `${34 * sc}px ${40 * sc}px ${64 * sc}px`, clipPath: TORN, filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.7))'}}>
      <div style={{fontFamily: font, fontWeight: 800, fontSize: 28 * sc, color: C.red, letterSpacing: 2}}>{src}</div>
      <div style={{height: 3, background: '#ddd', margin: `${14 * sc}px 0 ${20 * sc}px`}} />
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 58 * sc, lineHeight: 1.2, color: '#111'}}>
        {head.slice(0, i)}
        <span style={{backgroundImage: 'linear-gradient(100deg, rgba(245,166,35,.95), rgba(245,166,35,.78) 60%, rgba(245,166,35,.95))', backgroundRepeat: 'no-repeat', backgroundSize: `${sweep * 100}% 78%`, backgroundPosition: '0 70%', padding: '0 6px', borderRadius: '3px 14px 5px 12px', WebkitBoxDecorationBreak: 'clone'}}>{mark}</span>
        {head.slice(i + mark.length)}
      </div>
      {[0.92, 0.8].map((ww, j) => <div key={j} style={{height: 14 * sc, width: `${ww * 100}%`, background: '#e4e2dc', borderRadius: 4, marginTop: j ? 12 : 30}} />)}
      <div style={{fontFamily: font, fontSize: 22 * sc, color: '#999', marginTop: 18, fontStyle: 'italic'}}>Tóm tắt nội dung bài báo</div>
    </div>
  </div>;
};

// satellite map panel: continuous zoom z0→z1 across 3 stitched Esri layers (z8, z11, z14), pin + labels
const MAPL = [{n: 'wide', ...MAPMETA.wide}, {n: 'mid', ...MAPMETA.mid}, {n: 'close', ...MAPMETA.close}];
const merc = (lat: number, lon: number, z: number) => {
  const n = 2 ** z * 256, r = (lat * Math.PI) / 180;
  return {x: ((lon + 180) / 360) * n, y: ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n};
};
const mk = (f: number) => {
  let j = 0;
  for (let i = 0; i < MK.length; i++) if (f >= MK[i][0]) j = i;
  const A = MK[j], B = MK[Math.min(MK.length - 1, j + 1)];
  const t = B[0] > A[0] ? interpolate(f, [A[0], B[0]], [0, 1], {...cl, easing: inOut}) : 0;
  return {Z: A[1] + (B[1] - A[1]) * t, blur: A[2] + (B[2] - A[2]) * t};
};
const BgMap: React.FC = () => {
  const f = useCurrentFrame();
  const {Z, blur} = mk(f);
  const T = merc(LAT, LON, Z), w = 1080, h = 1920;
  const drift = Math.sin(f / 120) * 0.05; // slow breathing so the background is never frozen
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    <AbsoluteFill style={{filter: `blur(${blur.toFixed(1)}px) saturate(.7) brightness(${0.85 - blur * 0.022})`, transform: `scale(${1.04 + drift})`}}>
      {MAPL.map((L) => {
        const sc = 2 ** (Z - L.z);
        const op = L.n === 'wide' ? 1 : L.n === 'mid' ? interpolate(Z, [9.6, 10.6], [0, 1], cl) : interpolate(Z, [12.4, 13.4], [0, 1], cl);
        if (op <= 0 || sc > 16 || sc < 0.05) return null;
        return <Img key={L.n} src={staticFile(`${DIR}/map/${L.n}.jpg`)} style={{position: 'absolute', left: w / 2 - L.px * sc, top: h / 2 - L.py * sc, width: L.w * sc, height: L.h * sc, opacity: op}} />;
      })}
    </AbsoluteFill>
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,${0.1 + blur * 0.02}) 30%, rgba(0,0,0,${0.55 + blur * 0.015}) 100%)`}} />
    {[['HÀ NỘI', 21.028, 105.854], ['NINH BÌNH', 20.25, 105.975], ['HẢI PHÒNG', 20.86, 106.68]].map(([t, la, lo]) => {
      const p = merc(la as number, lo as number, Z), op = interpolate(Z, [7.6, 8.6, 9.4, 10], [0, 1, 1, 0], cl);
      return <div key={t as string} style={{position: 'absolute', left: w / 2 + p.x - T.x, top: h / 2 + p.y - T.y, transform: 'translate(-50%,-50%)', fontFamily: font, fontWeight: 800, fontSize: 38, letterSpacing: 4, color: '#fff', opacity: op, textShadow: '0 2px 12px #000'}}>{t}</div>;
    })}
    {PINS.map(([a, b, label]) => {
      if (f < a || f > b + 12) return null;
      const pk = ramp(f, a, 12, back) * (1 - ramp(f, b, 10));
      return <React.Fragment key={label}>
        <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
          {[0, 1].map((r) => {const t = ((f - a) / 40 + r * 0.5) % 1; return <circle key={r} cx={w / 2} cy={h / 2} r={24 + t * 150} fill="none" stroke={C.orange} strokeWidth={5} opacity={(1 - t) * pk} />;})}
          <circle cx={w / 2} cy={h / 2} r={18 * pk} fill={C.red} stroke="#fff" strokeWidth={5} />
        </svg>
        <div style={{position: 'absolute', left: w / 2, top: h / 2 - 95, transform: `translate(-50%,-50%) scale(${pk})`, background: C.bg, color: C.white, padding: '12px 26px', fontFamily: font, fontWeight: 900,
          fontStretch: 'condensed', fontSize: 54, whiteSpace: 'nowrap', borderLeft: `8px solid ${C.orange}`}}>{label}</div>
      </React.Fragment>;
    })}
    <div style={{position: 'absolute', left: 60, bottom: 300, fontFamily: font, fontSize: 22, color: 'rgba(255,255,255,.6)'}}>Ảnh vệ tinh: Esri · vị trí khu vực minh hoạ</div>
  </AbsoluteFill>;
};
const MapEl: React.FC<{e: El; at: number}> = () => null;

const Src: React.FC<{t: string; at: number; x: number; y: number}> = ({t, at, x, y}) => {
  const f = useCurrentFrame();
  return <div style={{position: 'absolute', left: x - 400, width: 800, top: y, textAlign: 'center', background: C.bg, fontFamily: font, fontStyle: 'italic', fontSize: 24, color: C.mute, opacity: ramp(f, at + 14, 10)}}>{t}</div>;
};

const BoardView: React.FC<{bi: number}> = ({bi}) => {
  const f = useCurrentFrame();
  return <>{BOARDS[bi].els.map((e, j) => {
    const at = EF[bi][j];
    if (f < at - 1 || e.k === 'tl') return null;
    const key = `${bi}-${j}`;
    if (e.k === 'img') return <ImgEl key={key} e={e} at={at} />;
    if (e.k === 'map') return <MapEl key={key} e={e} at={at} />;
    if (e.k === 'arrow') return <Arrow key={key} e={e} at={at} />;
    if (e.k === 'news') return <News key={key} e={e} at={at} />;
    if (e.k === 'title') return <Typed key={key} e={e} at={at} />;
    return <React.Fragment key={key}><Txt e={e} at={at} />{e.src && <Src t={e.src} at={at} x={540} y={1730} />}</React.Fragment>;
  })}</>;
};

const World: React.FC = () => {
  const f = useCurrentFrame();
  const c = camAt(f);
  return <AbsoluteFill style={{transformOrigin: '0 0', filter: c.blur > 0.5 ? `blur(${c.blur.toFixed(1)}px)` : undefined,
    transform: `translate(540px, 960px) rotate(${c.r}deg) scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`}}>
    {BOARDS.map((b, j) => (Math.abs(j - c.b) <= 1 && f >= BF[j] - MOVES[j].d)
      ? <div key={b.id} style={{position: 'absolute', left: POS[j].x, top: POS[j].y, width: 1080, height: 1920}}><BoardView bi={j} /></div> : null)}
  </AbsoluteFill>;
};

const Dust: React.FC<{depth: number; n: number}> = ({depth, n}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    {Array.from({length: n}, (_, j) => {
      const x0 = random(`dx${depth}${j}`) * 1080, y0 = random(`dy${depth}${j}`) * 1920, sp = 0.4 + random(`ds${depth}${j}`) * 1.2;
      const y = ((y0 - f * sp * depth) % 1920 + 1920) % 1920, x = x0 + Math.sin((f + j * 30) / 50) * 30 * depth;
      const r = (1 + random(`dr${depth}${j}`) * 3) * depth;
      return <div key={j} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: '50%', background: j % 3 ? 'rgba(233,194,90,.5)' : 'rgba(255,255,255,.3)', filter: depth > 1.5 ? 'blur(2px)' : undefined}} />;
    })}
  </AbsoluteFill>;
};

/* ---------- SFX ---------- */
const SFX = (() => {
  const out: {f: number; src: string; v: number}[] = [];
  BOARDS.forEach((b, bi) => {
    if (bi > 0) out.push({f: BF[bi] - Math.round(MOVES[bi].d / 2), src: MOVES[bi].blur > 15 ? 'whip' : 'whoosh', v: 0.4});
    b.els.forEach((e, j) => {
      const f = EF[bi][j];
      if (e.k === 'img') out.push({f, src: e.drop ? 'thud' : 'whip', v: e.drop ? 0.55 : 0.12});
      if (e.k === 'txt') out.push({f, src: e.count ? 'coin' : 'click', v: e.count ? 0.3 : 0.2});
      if (e.k === 'arrow') out.push({f, src: 'marker', v: 0.35});
      if (e.k === 'news') { out.push({f, src: 'paper', v: 0.55}); out.push({f: W(e.at, e.news![2].split(' ')[0]) + 4, src: 'marker', v: 0.45}); }
      if (e.k === 'title') out.push({f, src: 'thud', v: 0.5});
    });
  });
  return out.filter((x) => x.f >= 0);
})();

export const DauGiaBoard: React.FC = () => {
  return <AbsoluteFill style={{background: C.bg}}>
    <BgMap />
    <Grain />
    <Dust depth={0.6} n={36} />
    <World />
    <Timeline />
    <Dust depth={2} n={12} />
    <div style={{position: 'absolute', bottom: 262, right: 50, fontFamily: font, fontSize: 22, color: 'rgba(255,255,255,.35)'}}>Thông tin tham khảo, không phải khuyến nghị đầu tư</div>
    <div style={{position: 'absolute', top: 70, left: 60, fontFamily: font, fontWeight: 900, fontSize: 30, letterSpacing: 3, color: 'rgba(255,255,255,.55)'}}>GÓC NHÌN ĐA CHIỀU</div>
    <Audio src={staticFile(`${DIR}/music.wav`)} volume={0.8} />
    {SFX.map((x, j) => <Sequence key={`fx${j}`} from={x.f} durationInFrames={30}><Audio src={staticFile(`sfx/${x.src}.wav`)} volume={x.v} /></Sequence>)}
    {ST.lines.map((l, i) => <Sequence key={l.id} from={F(START[i])}><Audio src={staticFile(`${DIR}/${l.id}.wav`)} /></Sequence>)}
  </AbsoluteFill>;
};
