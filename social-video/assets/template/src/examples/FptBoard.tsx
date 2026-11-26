import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {D, fmt} from './data';

/* =========================================================================
   FPT 9T/2026 — "infinite board" template
   One dark textured board. Every fact is a station; dotted threads connect
   them and the camera travels along the thread. Timing comes from LINES
   (seconds per narration line) so real voice durations can be dropped in.
   ========================================================================= */

export const FPS = 30;
// Narration line durations in seconds (replace with real voice durations).
// Real VieNeu 'Thanh Bình' durations + 0.25s breath; last line keeps a tail for the outro.
// n1..n8, then the 'Mặt khác' counterpoint, then the closing question (n9).
export const LINES = [7.3, 4.2, 8.8, 5.0, 5.8, 8.6, 5.3, 5.1, 15.9, 9.2];
export const VOICE = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'mk', 'n9'];
const NL = LINES.length;
const START = LINES.reduce<number[]>((a, d, i) => [...a, i ? a[i - 1] + LINES[i - 1] : 0], []);
export const OUTRO = 1.8; // channel sign-off after the last line
export const TOTAL = Math.round((START[NL - 1] + LINES[NL - 1] + OUTRO) * FPS);
const F = (s: number) => Math.round(s * FPS);
const T = (line: number, s = 0) => F(START[line] + s); // frame of "s seconds into line"

/* ---------- design tokens ---------- */
const C = {bg: '#121110', cream: '#efe2c4', red: '#d6362b', orange: '#f28a1e', green: '#48d597', mute: '#a59c8a', line: 'rgba(239,226,196,.55)'};
const font = 'Inter, "DejaVu Sans", sans-serif';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const out3 = (t: number) => 1 - Math.pow(1 - t, 3);
const back = (t: number) => {const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);};
const ramp = (f: number, a: number, d: number, e = out3) => interpolate(f, [a, a + d], [0, 1], {...cl, easing: e});
const SEPIA = 'grayscale(1) sepia(.55) contrast(1.15) brightness(.92)';
const BW = 'grayscale(1) contrast(1.2) brightness(.95)';

/* ---------- stations (world coordinates) ---------- */
const P = [
  {x: 0, y: 0}, {x: -150, y: 1900}, {x: 250, y: 3800}, {x: -200, y: 6000}, {x: 200, y: 7900},
  {x: -150, y: 9800}, {x: 200, y: 11800}, {x: -150, y: 13700}, {x: 150, y: 15600}, {x: 0, y: 17500},
];

/* ---------- camera: monotone spline through keys, zoom in log space ---------- */
type Key = {f: number; x: number; y: number; z: number};
const KEYS: Key[] = (() => {
  const k: Key[] = [{f: 0, x: P[0].x, y: P[0].y + 120, z: 0.86}];
  for (let i = 0; i < NL; i++) {
    const s = T(i), e = T(i) + F(LINES[i]);
    if (i > 0) k.push({f: s + 4, x: P[i].x, y: P[i].y, z: 1.0});
    if (i === 2) {k.push({f: T(2, 4.2), x: P[2].x, y: P[2].y + 40, z: 1.04}); k.push({f: T(2, 4.9), x: P[2].x, y: P[2].y + 520, z: 1.0});}
    if (i === 0) {k.push({f: T(0, 5.0), x: 18, y: 140, z: 1.0}); k.push({f: T(0, 5.8), x: 0, y: 1020, z: 1.08}); k.push({f: e - 10, x: 10, y: 1040, z: 1.14}); continue;}
    if (i === 9) {k.push({f: T(9, 4.8), x: P[9].x, y: P[9].y + 30, z: 1.07}); k.push({f: T(9, 5.8), x: P[9].x, y: P[9].y + 1450, z: 1.0}); k.push({f: TOTAL, x: P[9].x + 10, y: P[9].y + 1490, z: 1.08}); break;}
    k.push({f: e - 14, x: P[i].x + (i % 2 ? -18 : 18), y: (i === 2 ? P[2].y + 540 : P[i].y + 26), z: 1.06});
  }
  return k;
})();
const spline = (f: number, ks: Key[], ax: 'x' | 'y' | 'z') => {
  const n = ks.length, v = (k: Key) => (ax === 'z' ? Math.log(k.z) : k[ax]);
  if (f <= ks[0].f) return v(ks[0]);
  if (f >= ks[n - 1].f) return v(ks[n - 1]);
  const d = ks.slice(0, -1).map((k, i) => (v(ks[i + 1]) - v(k)) / (ks[i + 1].f - k.f));
  const m = ks.map((_, i) => (i === 0 || i === n - 1 ? 0 : d[i - 1] * d[i] <= 0 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i])));
  let i = 0; while (f > ks[i + 1].f) i++;
  const h = ks[i + 1].f - ks[i].f, t = (f - ks[i].f) / h, t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * v(ks[i]) + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * v(ks[i + 1]) + (t3 - t2) * h * m[i + 1];
};
const camAt = (f: number) => ({x: spline(f, KEYS, 'x'), y: spline(f, KEYS, 'y'), z: Math.exp(spline(f, KEYS, 'z'))});

/* ---------- primitives ---------- */
// Positioned element in world space, revealed at frame `at`.
const El: React.FC<{x: number; y: number; at: number; w?: number; h?: number; kind?: 'pop' | 'up' | 'left' | 'fade'; rot?: number; children: React.ReactNode; z?: number}> = ({x, y, at, w, h, kind = 'up', rot = 0, children, z = 1}) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, 9, kind === 'pop' ? back : out3);
  if (f < at) return null;
  const tr = kind === 'pop' ? `scale(${0.6 + 0.4 * p})` : kind === 'up' ? `translateY(${(1 - p) * 60}px)` : kind === 'left' ? `translateX(${(1 - p) * -80}px)` : '';
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, zIndex: z, opacity: Math.min(1, p * 1.4),
      transform: `translate(-50%,-50%) rotate(${rot}deg) ${tr}`, transformOrigin: 'center'}}>{children}</div>
  );
};
const Txt: React.FC<{s: number; c?: string; w?: number; it?: boolean; ls?: number; children: React.ReactNode; up?: boolean; lh?: number}> = ({s, c = C.cream, w = 900, it, ls = -1, children, up = true, lh = 1}) => (
  <div style={{fontFamily: font, fontSize: s, fontWeight: w, color: c, fontStyle: it ? 'italic' : 'normal', letterSpacing: ls, lineHeight: lh,
    textTransform: up ? 'uppercase' : 'none', whiteSpace: 'nowrap', textShadow: '0 6px 24px rgba(0,0,0,.45)'}}>{children}</div>
);
let uid = 0;
// Dotted line that draws itself from start to end over [at, at+dur].
const Dots: React.FC<{d: string; at: number; dur?: number; color?: string; w?: number; vb?: string}> = ({d, at, dur = 14, color = C.line, w = 5}) => {
  const f = useCurrentFrame();
  const id = React.useMemo(() => `m${uid++}`, []);
  const p = ramp(f, at, dur, (t) => t);
  if (p <= 0) return null;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}} width={1} height={1}>
      <defs><mask id={id} maskUnits="userSpaceOnUse" x={-20000} y={-20000} width={40000} height={40000}>
        <path d={d} fill="none" stroke="#fff" strokeWidth={w * 4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
      </mask></defs>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray={`${w * 0.2} ${w * 2.6}`} strokeLinecap="round" mask={`url(#${id})`} />
    </svg>
  );
};
const Count: React.FC<{to: number; at: number; dur?: number; dec?: number}> = ({to, at, dur = 22, dec = 0}) => {
  const f = useCurrentFrame();
  const v = to * ramp(f, at, dur);
  return <>{dec ? v.toLocaleString('de-DE', {minimumFractionDigits: dec, maximumFractionDigits: dec}) : fmt(v)}</>;
};
// Sepia/BW cutout with an optional colour fill rising from the bottom (shows a share).
const Cut: React.FC<{src: string; w: number; h: number; tone?: string; fill?: number; fillColor?: string}> = ({src, w, h, tone = SEPIA, fill = 0, fillColor = C.red}) => (
  <div style={{position: 'relative', width: w, height: h}}>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom', filter: tone}} />
    {fill > 0 && <div style={{position: 'absolute', inset: 0, background: fillColor, opacity: 0.86, mixBlendMode: 'hard-light',
      WebkitMaskImage: `url(${staticFile(src)})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'bottom',
      clipPath: `inset(${(1 - fill) * 100}% 0 0 0)`}} />}
  </div>
);
const Tag: React.FC<{children: React.ReactNode; bg?: string; s?: number}> = ({children, bg = C.red, s = 44}) => (
  <div style={{background: bg, padding: '6px 18px', fontFamily: font, fontWeight: 900, fontSize: s, color: '#fff', fontStyle: 'italic', whiteSpace: 'nowrap'}}>{children}</div>
);
const Bar: React.FC<{at: number; w: number; h?: number; color: string}> = ({at, w, h = 34, color}) => {
  const f = useCurrentFrame();
  return <div style={{width: w * ramp(f, at, 16), height: h, background: color}} />;
};

/* ---------- board texture (parallax, screen space) ---------- */
const lines = (() => {
  let d = '';
  for (let i = 0; i < 46; i++) {
    const y0 = i * 44;
    d += `M0 ${y0} `;
    for (let x = 0; x <= 1200; x += 40) d += `L${x} ${(y0 + 26 * Math.sin(x / 170 + i * 0.35) + 14 * Math.sin(x / 61 + i)).toFixed(1)} `;
  }
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='2024'><path d='${d}' fill='none' stroke='rgba(255,255,255,0.055)' stroke-width='2'/></svg>`)}")`;
})();
// Chapter tint of the board: charcoal -> burgundy (Japan) -> warm paper-brown (contracts) -> moss (AI).
const TINT = ['#1d1b19', '#1d1b19', '#1e1c18', '#1c1a17', '#3b1715', '#2a2118', '#10291d', '#1e1b17', '#2e0f0f', '#13261d'];
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const tintAt = (f: number) => {
  let i = 0; while (i < NL - 1 && f >= T(i + 1)) i++;
  const k = i > 0 ? ramp(f, T(i) - 6, 24, (t) => t) : 1;
  const a = hex(TINT[Math.max(0, i - 1)]), b = hex(TINT[i]);
  const c = a.map((v, j) => Math.round(v + (b[j] - v) * k));
  return {mid: `rgb(${c})`, edge: `rgb(${c.map((v) => Math.round(v * 0.55))})`};
};
const Board: React.FC<{cam: {x: number; y: number; z: number}}> = ({cam}) => {
  const f = useCurrentFrame();
  const t = tintAt(f);
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${t.mid}, ${t.edge} 75%)`}} />
      <AbsoluteFill style={{backgroundImage: lines, backgroundSize: `${1200 * Math.max(0.5, cam.z)}px ${2024 * Math.max(0.5, cam.z)}px`,
        backgroundPosition: `${-cam.x * 0.35 * cam.z}px ${-cam.y * 0.35 * cam.z}px`}} />
      <AbsoluteFill style={{opacity: 0.09, mixBlendMode: 'screen'}}>
        <svg width="1080" height="1920"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 30} /></filter>
          <rect width="1080" height="1920" filter="url(#g)" /></svg>
      </AbsoluteFill>
    </>
  );
};

/* ---------- material layer: faint newsprint, tape, crop marks ---------- */
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const News: React.FC<{seed: number}> = ({seed}) => (
  <div style={{width: 620, height: 820, background: 'rgba(239,226,196,.05)', padding: 34, boxSizing: 'border-box'}}>
    <div style={{height: 46, width: '70%', background: 'rgba(239,226,196,.16)'}} />
    <div style={{height: 3, background: 'rgba(239,226,196,.14)', margin: '18px 0 22px'}} />
    <div style={{display: 'flex', gap: 22}}>
      {[0, 1, 2].map((c) => (
        <div key={c} style={{flex: 1}}>
          {Array.from({length: 26}, (_, r) => (
            <div key={r} style={{height: 7, margin: '0 0 11px', width: `${60 + rnd(seed * 97 + c * 31 + r) * 40}%`, background: 'rgba(239,226,196,.12)'}} />
          ))}
          {c === 1 && <div style={{height: 120, margin: '10px 0', border: '2px solid rgba(239,226,196,.13)'}} />}
        </div>
      ))}
    </div>
  </div>
);
const Tape: React.FC<{x: number; y: number; r: number; w?: number}> = ({x, y, r, w = 180}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - 24, width: w, height: 48, transform: `rotate(${r}deg)`, zIndex: 8,
    background: 'linear-gradient(90deg, rgba(236,224,196,.55), rgba(236,224,196,.42))', boxShadow: '0 2px 6px rgba(0,0,0,.25)',
    clipPath: 'polygon(2% 0, 98% 6%, 100% 50%, 97% 100%, 3% 94%, 0 50%)'}} />
);
const Crop: React.FC<{x: number; y: number}> = ({x, y}) => (
  <>
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], k) => (
      <div key={k} style={{position: 'absolute', left: x + sx * 480 - (sx > 0 ? 50 : 0), top: y + sy * 860 - (sy > 0 ? 50 : 0), width: 50, height: 50,
        borderLeft: sx < 0 ? '3px solid rgba(239,226,196,.28)' : undefined, borderRight: sx > 0 ? '3px solid rgba(239,226,196,.28)' : undefined,
        borderTop: sy < 0 ? '3px solid rgba(239,226,196,.28)' : undefined, borderBottom: sy > 0 ? '3px solid rgba(239,226,196,.28)' : undefined}} />
    ))}
  </>
);
const Material: React.FC = () => (
  <>
    {P.map((q, i) => (
      <React.Fragment key={i}>
        <div style={{position: 'absolute', left: q.x + (i % 2 ? 160 : -780), top: q.y - 700 + (i % 3) * 120, transform: `rotate(${(rnd(i) - 0.5) * 10}deg)`}}><News seed={i} /></div>
        <div style={{position: 'absolute', left: q.x + (i % 2 ? -820 : 260), top: q.y + 260, transform: `rotate(${(rnd(i + 9) - 0.5) * 12}deg) scale(.8)`}}><News seed={i + 20} /></div>
        <Crop x={q.x} y={q.y} />
        <div style={{position: 'absolute', left: q.x + 420, top: q.y - 820, fontFamily: font, fontSize: 22, fontWeight: 700, letterSpacing: 4, color: 'rgba(239,226,196,.3)'}}>{`${String(i + 1).padStart(2, "0")}/${String(P.length).padStart(2, "0")}`}</div>
      </React.Fragment>
    ))}
    {/* tape on the cut-outs */}
    <Tape x={P[0].x - 120} y={P[0].y - 380} r={-6} />
    <Tape x={P[3].x + 250} y={P[3].y - 470} r={5} w={150} />
    <Tape x={P[5].x + 330} y={P[5].y - 40} r={-4} w={150} />
    <Tape x={P[6].x + 220} y={P[6].y - 290} r={7} w={150} />
  </>
);
// Foreground drift layer: moves faster than the board (parallax), soft focus.
const FG = Array.from({length: 46}, (_, i) => ({
  x: (rnd(i * 3) - 0.5) * 1600, y: -900 + i * 380 + rnd(i * 5) * 200, r: (rnd(i * 7) - 0.5) * 60,
  k: i % 3, w: 60 + rnd(i * 11) * 140, txt: ['+12,4%', '40.023', '+17%', '8.770', '89%', '+23%', '1,4 TỶ USD', '+55%', '2.915', '16'][i % 10],
}));
const Foreground: React.FC<{cam: {x: number; y: number; z: number}}> = ({cam}) => {
  const k = 1.55;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(540px, 960px) scale(${cam.z * 1.25}) translate(${-cam.x * k}px, ${-cam.y * k}px)`,
      transformOrigin: '0 0', filter: 'blur(5px)', opacity: 0.55, pointerEvents: 'none'}}>
      {FG.map((e, i) => (
        <div key={i} style={{position: 'absolute', left: e.x, top: e.y * k, transform: `rotate(${e.r}deg)`}}>
          {e.k === 0 && <div style={{width: e.w, height: e.w * 1.3, background: 'rgba(236,226,206,.18)'}} />}
          {e.k === 1 && <div style={{fontFamily: font, fontWeight: 900, fontStyle: 'italic', fontSize: 70 + e.w / 3, color: 'rgba(239,226,196,.16)'}}>{e.txt}</div>}
          {e.k === 2 && <div style={{width: 14, height: 14, borderRadius: 7, background: 'rgba(255,220,170,.35)', boxShadow: '0 0 30px rgba(255,200,140,.4)'}} />}
        </div>
      ))}
    </div>
  );
};

/* ---------- full-screen colour slam ---------- */
const Slam: React.FC<{from: number; to: number; bg: string; children: React.ReactNode}> = ({from, to, bg, children}) => {
  const f = useCurrentFrame();
  if (f < from || f > to) return null;
  const i = ramp(f, from, 4), o = 1 - ramp(f, to - 5, 5);
  const s = 1.25 - 0.25 * ramp(f, from, 10, back);
  return (
    <AbsoluteFill style={{background: bg, opacity: Math.min(i, o), zIndex: 50}}>
      <AbsoluteFill style={{backgroundImage: lines, backgroundSize: '1200px 2024px', opacity: 0.8, mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- the board content ---------- */
const World: React.FC = () => {
  const f = useCurrentFrame();
  const p = P;
  const thread = (a: number, b: number, mid = 0) =>
    `M${p[a].x} ${p[a].y + 640} C ${p[a].x + mid} ${p[a].y + 900}, ${p[b].x - mid} ${p[b].y - 900}, ${p[b].x} ${p[b].y - 560}`;
  return (
    <>
      <Material />
      {/* threads between stations: drawn while the camera travels */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Dots key={i} d={i === 0 ? `M${p[0].x} ${p[0].y + 1300} C ${p[0].x} ${p[0].y + 1500}, ${p[1].x} ${p[1].y - 900}, ${p[1].x} ${p[1].y - 560}` : i === 2 ? `M${p[2].x} ${p[2].y + 1080} C ${p[2].x} ${p[2].y + 1300}, ${p[3].x} ${p[3].y - 900}, ${p[3].x} ${p[3].y - 560}` : thread(i, i + 1, i % 2 ? -260 : 260)}
          at={T(i + 1) - 18} dur={22} />
      ))}
      {/* faint crosshair guides through every station */}
      {p.map((q, i) => (
        <React.Fragment key={i}>
          <div style={{position: 'absolute', left: q.x - 2000, top: q.y, width: 4000, height: 2, background: 'rgba(239,226,196,.08)'}} />
          <div style={{position: 'absolute', left: q.x - 470, top: q.y - 1100, width: 2, height: 2200, background: 'rgba(239,226,196,.06)'}} />
        </React.Fragment>
      ))}

      {/* 1 — HOOK: tower, profit, "but the number that matters is 55%" */}
      <El x={p[0].x - 120} y={p[0].y + 60} at={0} kind="fade">
        <Cut src="library/tower.png" w={520} h={924} fill={ramp(f, T(0, 1.6), 40)} fillColor={C.orange} />
      </El>
      <El x={p[0].x + 270} y={p[0].y - 40} at={F(0.3)} kind="up" rot={90}><Txt s={118}>FPT · 9 THÁNG</Txt></El>
      <Dots d={`M${p[0].x + 160} ${p[0].y - 400} H ${p[0].x + 200} V ${p[0].y + 520} H ${p[0].x + 160}`} at={F(0.5)} dur={18} />
      <El x={p[0].x - 110} y={p[0].y + 60} at={T(0, 1.6)} kind="pop"><Txt s={104} it><Count to={D.pbt.v} at={T(0, 1.6)} /> TỶ</Txt></El>
      <El x={p[0].x - 110} y={p[0].y + 150} at={T(0, 2.0)}><Txt s={30} w={700} ls={2}>lợi nhuận trước thuế</Txt></El>
      <El x={p[0].x} y={p[0].y + 660} at={T(0, 4.4)} kind="left"><div style={{textAlign: 'center'}}><Txt s={56} it c={C.mute}>NHƯNG CON SỐ</Txt><Txt s={56} it c={C.cream}>ĐÁNG CHÚ Ý NHẤT…</Txt></div></El>

      <Dots d={`M${p[0].x - 60} ${p[0].y + 700} V ${p[0].y + 800}`} at={T(0, 5.0)} dur={8} />
      <El x={p[0].x} y={p[0].y + 1010} at={T(0, 5.75)} kind="fade" z={0}>
        <div style={{width: 720, height: 150, background: C.red, transform: `skewX(-12deg) scaleX(${ramp(f, T(0, 5.75), 8)})`, transformOrigin: 'left'}} />
      </El>
      <El x={p[0].x} y={p[0].y + 1000} at={T(0, 5.8)} kind="pop"><Txt s={300} it ls={-12}>55%</Txt></El>
      <Dots d={`M${p[0].x - 400} ${p[0].y + 1000} a 400 230 0 1 0 800 0 a 400 230 0 1 0 -800 0`} at={T(0, 6.0)} dur={14} color={C.cream} w={6} />
      <El x={p[0].x + 250} y={p[0].y + 780} at={T(0, 6.3)} kind="pop" rot={-4}><Tag bg={C.cream} s={40}><span style={{color: C.bg}}>TĂNG Ở MẢNG NÀO?</span></Tag></El>

      {/* 2 — revenue */}
      <El x={p[1].x} y={p[1].y - 330} at={T(1, 0.2)} kind="left"><Txt s={46} w={800} ls={6} c={C.mute}>DOANH THU 9 THÁNG</Txt></El>
      <El x={p[1].x} y={p[1].y - 200} at={T(1, 0.3)} kind="pop"><Txt s={190} it><Count to={D.revenue.v} at={T(1, 0.3)} /></Txt></El>
      <El x={p[1].x + 360} y={p[1].y - 60} at={T(1, 0.6)} kind="up"><Txt s={56} w={800}>TỶ ĐỒNG</Txt></El>
      <El x={p[1].x - 230} y={p[1].y + 60} at={T(1, 2.0)} kind="pop"><Tag bg={C.red} s={64}>+12,4%</Tag></El>
      <Dots d={`M${p[1].x - 420} ${p[1].y + 160} H ${p[1].x + 420}`} at={T(1, 2.2)} dur={10} />
      {[[35608, '9T/2025', '#6f685c'], [D.revenue.v, '9T/2026', C.orange]].map(([v, t, c], k) => (
        <El key={k} x={p[1].x - 120 + k * 260} y={p[1].y + 400} at={T(1, 2.4 + k * 0.25)} kind="fade">
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
            <Txt s={34} w={800} it>{fmt(v as number)}</Txt>
            <div style={{width: 150, height: 360 * ((v as number) / D.revenue.v) * ramp(f, T(1, 2.4 + k * 0.25), 16), background: c as string}} />
            <Txt s={28} w={700} c={C.mute}>{t as string}</Txt>
          </div>
        </El>
      ))}

      {/* 3 — profit grows faster: ladder with leaders (like the reference) */}
      <El x={p[2].x} y={p[2].y - 470} at={T(2, 0.2)} kind="left"><Txt s={64} it>LỢI NHUẬN</Txt></El>
      <El x={p[2].x + 40} y={p[2].y - 390} at={T(2, 0.4)} kind="left"><Txt s={64} it c={C.red}>TĂNG NHANH HƠN</Txt></El>
      <Dots d={`M${p[2].x - 380} ${p[2].y - 290} V ${p[2].y + 1050}`} at={T(2, 0.5)} dur={60} />
      {[
        {y: -180, l: 'Doanh thu', g: '+12,4%', w: 12.4, c: '#8a8273', at: 1.0},
        {y: 40, l: 'Lợi nhuận trước thuế', g: '+17%', w: 17, c: C.orange, at: 1.8},
      ].map((r) => (
        <React.Fragment key={r.l}>
          <Dots d={`M${p[2].x - 380} ${p[2].y + r.y} H ${p[2].x - 330}`} at={T(2, r.at)} dur={6} />
          <El x={p[2].x - 330} y={p[2].y + r.y - 50} at={T(2, r.at)} kind="left"><div style={{transform: 'translateX(50%)'}}><Txt s={40} w={800} up={false}>{r.l}</Txt></div></El>
          <El x={p[2].x - 330} y={p[2].y + r.y + 20} at={T(2, r.at)} kind="fade"><div style={{transform: 'translateX(50%)', display: 'flex', alignItems: 'center', gap: 20}}>
            <Bar at={T(2, r.at)} w={r.w * 34} color={r.c} /><Txt s={56} it c={r.c}>{r.g}</Txt></div></El>
        </React.Fragment>
      ))}
      {[
        {y: 520, v: D.pbt.v, l: 'Lợi nhuận trước thuế', at: 5.0, c: C.cream},
        {y: 820, v: D.npat.v, l: 'Lãi ròng cổ đông mẹ', at: 6.6, c: C.cream},
      ].map((r) => (
        <React.Fragment key={r.l}>
          <Dots d={`M${p[2].x - 380} ${p[2].y + r.y} H ${p[2].x - 300}`} at={T(2, r.at)} dur={6} />
          <El x={p[2].x - 300} y={p[2].y + r.y} at={T(2, r.at)} kind="pop"><div style={{transform: 'translateX(50%)'}}>
            <Txt s={140} it c={r.c}><Count to={r.v} at={T(2, r.at)} /> <span style={{fontSize: 60}}>TỶ</span></Txt>
            <Txt s={34} w={700} up={false} c={C.mute}>{r.l}</Txt></div></El>
        </React.Fragment>
      ))}

      {/* 4 — 9 in 10 from technology, mostly abroad */}
      <El x={p[3].x + 250} y={p[3].y + 80} at={T(3, 0)} kind="fade"><Cut src="library/exec.png" w={420} h={1117} tone={BW} /></El>
      <El x={p[3].x - 170} y={p[3].y - 120} at={T(3, 0.2)} kind="fade">
        <svg width={460} height={460} viewBox="0 0 460 460">
          <circle cx={230} cy={230} r={180} fill="none" stroke="rgba(239,226,196,.15)" strokeWidth={60} />
          <circle cx={230} cy={230} r={180} fill="none" stroke={C.orange} strokeWidth={60} pathLength={100}
            strokeDasharray={`${89 * ramp(f, T(3, 0.3), 30)} 100`} transform="rotate(-90 230 230)" />
        </svg>
      </El>
      <El x={p[3].x - 170} y={p[3].y - 120} at={T(3, 0.4)} kind="pop"><Txt s={150} it>9/10</Txt></El>
      <El x={p[3].x - 150} y={p[3].y + 200} at={T(3, 0.9)} kind="left"><Txt s={52} w={900}>ĐẾN TỪ CÔNG NGHỆ</Txt></El>
      <Dots d={`M${p[3].x - 170} ${p[3].y + 250} V ${p[3].y + 420} H ${p[3].x + 20}`} at={T(3, 2.6)} dur={10} color={C.orange} />
      <El x={p[3].x - 180} y={p[3].y + 500} at={T(3, 2.8)} kind="left"><div style={{transform: 'translateX(40%)'}}>
        <Txt s={44} w={800} c={C.orange}>NƯỚC NGOÀI</Txt><Txt s={96} it><Count to={28538} at={T(3, 2.8)} /> TỶ</Txt></div></El>

      {/* 5 — Japan */}
      <El x={p[4].x + 60} y={p[4].y - 160} at={T(4, 0)} kind="fade">
        <div style={{width: 520, height: 520, borderRadius: '50%', background: C.red, opacity: 0.92, transform: `scale(${0.8 + 0.2 * ramp(f, T(4, 0), 14)})`}} />
      </El>
      <El x={p[4].x - 330} y={p[4].y - 160} at={T(4, 0.2)} kind="up" rot={-90}><Txt s={110}>NHẬT BẢN</Txt></El>
      <El x={p[4].x + 60} y={p[4].y - 170} at={T(4, 0.6)} kind="pop"><Txt s={140} it c="#fff">+<Count to={D.japanG} at={T(4, 0.6)} dec={1} />%</Txt></El>
      <Dots d={`M${p[4].x - 250} ${p[4].y + 620} Q ${p[4].x} ${p[4].y + 200}, ${p[4].x + 300} ${p[4].y + 360}`} at={T(4, 1.4)} dur={24} color={C.cream} w={6} />
      <El x={p[4].x - 250} y={p[4].y + 640} at={T(4, 1.3)} kind="pop"><div style={{display: 'flex', alignItems: 'center', gap: 14}}><div style={{width: 26, height: 26, borderRadius: 13, background: C.orange}} /><Txt s={36} w={800}>HÀ NỘI</Txt></div></El>
      <El x={p[4].x + 330} y={p[4].y + 330} at={T(4, 2.1)} kind="pop"><div style={{display: 'flex', alignItems: 'center', gap: 14}}><div style={{width: 26, height: 26, borderRadius: 13, background: '#fff'}} /><Txt s={36} w={800}>TOKYO</Txt></div></El>
      <El x={p[4].x + 40} y={p[4].y + 820} at={T(4, 3.2)} kind="left"><Txt s={60} it>+25,2% <span style={{color: C.mute, fontSize: 38}}>THEO ĐỒNG YÊN</span></Txt></El>

      {/* 6 — new contracts: 1.4bn USD, 16 big deals */}
      <El x={p[5].x - 230} y={p[5].y + 300} at={T(5, 0)} kind="fade"><Cut src="library/engineers.png" w={520} h={950} tone={BW} /></El>
      <El x={p[5].x} y={p[5].y - 560} at={T(5, 0.2)} kind="left"><Txt s={40} w={800} ls={4} c={C.mute}>DOANH THU KÝ MỚI · NƯỚC NGOÀI</Txt></El>
      <El x={p[5].x + 40} y={p[5].y - 400} at={T(5, 1.2)} kind="pop"><Txt s={200} it><Count to={1.4} at={T(5, 1.2)} dec={1} /> <span style={{fontSize: 90}}>TỶ USD</span></Txt></El>
      <El x={p[5].x + 300} y={p[5].y - 230} at={T(5, 2.6)} kind="pop"><Tag bg={C.orange} s={70}>+23%</Tag></El>
      {Array.from({length: 16}, (_, k) => {
        const at = T(5, 4.2 + k * 0.12);
        const dy = (1 - ramp(f, at, 8)) * -500;
        return f < at ? null : (
          <div key={k} style={{position: 'absolute', left: p[5].x + 180 + (k % 2) * 8 - 170, top: p[5].y + 360 - k * 14 + dy, width: 340, height: 440,
            background: '#ece4d2', boxShadow: '0 10px 30px rgba(0,0,0,.5)', transform: `rotate(${((k * 37) % 9) - 4}deg)`, zIndex: 2 + k}}>
            <div style={{margin: '40px 30px', height: 22, width: 200, background: '#3b3730'}} />
            {[0, 1, 2, 3, 4, 5, 6].map((j) => <div key={j} style={{margin: '14px 30px', height: 8, width: 280 - (j % 3) * 50, background: '#b8af9c'}} />)}
          </div>
        );
      })}
      <El x={p[5].x + 180} y={p[5].y + 760} at={T(5, 6.4)} kind="pop"><Txt s={140} it c={C.orange}><Count to={16} at={T(5, 6.4)} dur={12} /></Txt></El>
      <El x={p[5].x + 180} y={p[5].y + 870} at={T(5, 6.6)} kind="up"><Txt s={40} w={800}>HỢP ĐỒNG &gt; 10 TRIỆU USD</Txt></El>

      {/* 7 — AI +55% breaking the frame */}
      <El x={p[6].x + 220} y={p[6].y + 260} at={T(6, 0)} kind="fade"><Cut src="library/ai-engineer.png" w={480} h={1132} tone={SEPIA} /></El>
      <El x={p[6].x + 250} y={p[6].y - 380} at={T(6, 0.3)} kind="left"><Txt s={56} w={900} c={C.green}>AI & DỮ LIỆU</Txt></El>
      {[[1881, 0, '#6f685c'], [D.ai.v, 1, C.green]].map(([v, k, c]) => {
        const at = T(6, 1.6 + (k as number) * 0.4);
        const hgt = (k ? 1020 : 1020 / 1.55) * ramp(f, at, k ? 26 : 16);
        return (
          <div key={k as number} style={{position: 'absolute', left: p[6].x - 380 + (k as number) * 220, top: p[6].y + 700 - hgt, width: 170, height: hgt, background: c as string}}>
            <div style={{position: 'absolute', top: -60, width: '100%', textAlign: 'center'}}><Txt s={40} w={800} it>{f > at ? fmt(v as number) : ''}</Txt></div>
          </div>
        );
      })}
      <El x={p[6].x - 160} y={p[6].y + 780} at={T(6, 1.6)} kind="fade"><Txt s={30} w={700} c={C.mute}>9T/2025 · 9T/2026 · tỷ đồng</Txt></El>
      <Dots d={`M${p[6].x - 295} ${p[6].y + 20} C ${p[6].x - 295} ${p[6].y - 400}, ${p[6].x - 290} ${p[6].y - 560}, ${p[6].x - 320} ${p[6].y - 600}`} at={T(6, 2.6)} dur={12} color={C.green} w={7} />
      <El x={p[6].x - 75} y={p[6].y - 600} at={T(6, 3.0)} kind="pop"><Txt s={170} it c={C.green} ls={-6}>+55%</Txt></El>
      <Dots d={`M${p[6].x - 330} ${p[6].y - 505} H ${p[6].x + 180}`} at={T(6, 3.2)} dur={8} color={C.green} w={6} />
      <El x={p[6].x - 75} y={p[6].y - 460} at={T(6, 3.4)} kind="up"><Txt s={36} w={900}>TĂNG NHANH NHẤT</Txt></El>

      {/* 8 — orders outpace revenue */}
      <El x={p[7].x} y={p[7].y - 560} at={T(7, 0)} kind="left"><Txt s={72} it>ĐƠN KÝ MỚI</Txt></El>
      <El x={p[7].x + 60} y={p[7].y - 470} at={T(7, 0.2)} kind="left"><Txt s={72} it c={C.orange}>GẤP ĐÔI DOANH THU</Txt></El>
      {[{g: 23.1, c: C.orange, l: 'Ký mới +23,1%', at: 0.8}, {g: 11.6, c: '#8a8273', l: 'Doanh thu +11,6%', at: 1.2}].map((r, k) => (
        <React.Fragment key={k}>
          <Dots d={`M${p[7].x - 400} ${p[7].y + 400} L ${p[7].x + 380} ${p[7].y + 400 - r.g * 32}`} at={T(7, r.at)} dur={22} color={r.c} w={12} />
          <El x={p[7].x + 330} y={p[7].y + 400 - r.g * 32 - 60} at={T(7, r.at + 0.7)} kind="pop"><Txt s={40} w={800} up={false} c={r.c}>{r.l}</Txt></El>
        </React.Fragment>
      ))}
      <El x={p[7].x} y={p[7].y + 640} at={T(7, 3.0)} kind="up"><div style={{textAlign: 'center'}}>
        <Txt s={58} it>ĐƠN KÝ HÔM NAY</Txt><Txt s={58} it c={C.orange}>= DOANH THU NGÀY MAI</Txt></div></El>

      {/* 8b — MẶT KHÁC: the counterpoint chapter every video carries */}
      <El x={p[8].x - 360} y={p[8].y - 120} at={T(8, 0)} kind="up" rot={-90}><Txt s={150} c={C.red}>MẶT KHÁC</Txt></El>
      <Dots d={`M${p[8].x - 250} ${p[8].y - 700} V ${p[8].y + 820}`} at={T(8, 0.2)} dur={30} color={C.red} />
      {/* 1. a segment shrinking */}
      <El x={p[8].x + 60} y={p[8].y - 600} at={T(8, 2.0)} kind="left"><Txt s={40} w={800} up={false} c={C.mute}>Giáo dục, đầu tư & khác</Txt></El>
      <El x={p[8].x - 20} y={p[8].y - 470} at={T(8, 3.6)} kind="pop"><Txt s={150} it c={C.red}>−3,1%</Txt></El>
      <El x={p[8].x + 330} y={p[8].y - 480} at={T(8, 3.9)} kind="fade">
        <svg width={120} height={160} viewBox="0 0 120 160"><path d="M60 0 V130 M20 95 L60 140 L100 95" stroke={C.red} strokeWidth={14} fill="none" strokeLinecap="round" /></svg></El>
      {/* 2. FPT Telecom accounting change */}
      <Dots d={`M${p[8].x - 250} ${p[8].y - 150} H ${p[8].x - 200}`} at={T(8, 5.8)} dur={5} color={C.red} />
      <El x={p[8].x + 100} y={p[8].y - 150} at={T(8, 5.8)} kind="left"><div style={{border: `3px dashed ${C.cream}`, padding: '26px 30px', width: 560}}>
        <Txt s={54} w={900}>FPT TELECOM</Txt>
        <div style={{fontFamily: font, fontSize: 34, color: C.cream, marginTop: 12, lineHeight: 1.3}}>chỉ ghi nhận theo <b style={{color: C.orange}}>tỷ lệ sở hữu</b></div>
        <div style={{fontFamily: font, fontSize: 30, color: C.mute, marginTop: 8, lineHeight: 1.3}}>→ doanh thu không so sánh trọn vẹn với năm trước</div>
      </div></El>
      {/* 3. yen risk */}
      <Dots d={`M${p[8].x - 250} ${p[8].y + 420} H ${p[8].x - 200}`} at={T(8, 11.6)} dur={5} color={C.red} />
      <El x={p[8].x - 40} y={p[8].y + 420} at={T(8, 11.6)} kind="pop">
        <div style={{width: 260, height: 260, borderRadius: '50%', border: `8px solid ${C.cream}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Txt s={170} it>¥</Txt></div></El>
      <El x={p[8].x + 360} y={p[8].y + 380} at={T(8, 12.0)} kind="left"><Txt s={56} w={900} c={C.red}>RỦI RO</Txt></El>
      <El x={p[8].x + 380} y={p[8].y + 455} at={T(8, 12.3)} kind="left"><Txt s={56} w={900}>TỶ GIÁ YÊN</Txt></El>

      {/* 9 — the question */}
      <El x={p[9].x} y={p[9].y - 220} at={T(9, 0.1)} kind="pop"><Txt s={160} it c={C.green}>AI</Txt></El>
      <El x={p[9].x} y={p[9].y - 40} at={T(9, 0.4)} kind="up"><Txt s={64} w={900}>CÓ TRỞ THÀNH</Txt></El>
      <El x={p[9].x} y={p[9].y + 70} at={T(9, 0.7)} kind="up"><Txt s={64} w={900} c={C.orange}>ĐỘNG CƠ TĂNG TRƯỞNG</Txt></El>
      <El x={p[9].x} y={p[9].y + 180} at={T(9, 1.0)} kind="up"><Txt s={64} w={900}>TIẾP THEO CỦA FPT?</Txt></El>
      <Dots d={`M${p[9].x - 150} ${p[9].y - 220} a 150 110 0 1 0 300 0 a 150 110 0 1 0 -300 0`} at={T(9, 1.6)} dur={14} color={C.green} w={6} />
      <Dots d={`M${p[9].x} ${p[9].y + 260} C ${p[9].x + 260} ${p[9].y + 600}, ${p[9].x - 260} ${p[9].y + 800}, ${p[9].x} ${p[9].y + 1040}`} at={T(9, 4.8)} dur={20} />
      <El x={p[9].x} y={p[9].y + 1110} at={T(9, 5.6)} kind="left"><Txt s={40} w={800} ls={8} c={C.orange}>FPT · 9 THÁNG 2026</Txt></El>
      <Dots d={`M${p[9].x - 400} ${p[9].y + 1170} V ${p[9].y + 1800}`} at={T(9, 5.7)} dur={20} />
      {[
        {y: 1270, v: '8.770 TỶ', l: 'Lợi nhuận trước thuế', g: '+17%', c: C.cream, gc: C.red},
        {y: 1480, v: '1,4 TỶ USD', l: 'Doanh thu ký mới nước ngoài', g: '+23%', c: C.orange, gc: C.orange},
        {y: 1690, v: '2.915 TỶ', l: 'AI & dữ liệu', g: '+55%', c: C.green, gc: C.green},
      ].map((r, k) => (
        <React.Fragment key={k}>
          <Dots d={`M${p[9].x - 400} ${p[9].y + r.y} H ${p[9].x - 350}`} at={T(9, 5.9 + k * 0.35)} dur={5} />
          <El x={p[9].x - 340} y={p[9].y + r.y} at={T(9, 5.9 + k * 0.35)} kind="left"><div style={{transform: 'translateX(50%)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 22}}><Txt s={104} it c={r.c}>{r.v}</Txt><Tag bg={r.gc} s={42}>{r.g}</Tag></div>
            <Txt s={32} w={700} up={false} c={C.mute}>{r.l}</Txt></div></El>
        </React.Fragment>
      ))}
      <El x={p[9].x} y={p[9].y + 1900} at={T(9, 7.2)} kind="fade"><div style={{width: 900, fontFamily: font, fontSize: 24, color: C.mute, textAlign: 'center', lineHeight: 1.5}}>
        Nguồn: FPT công bố 21/10/2026, qua VnEconomy, Mekong ASEAN · lũy kế 9 tháng<br />Không phải khuyến nghị đầu tư</div></El>
    </>
  );
};

/* ---------- channel identity: Góc nhìn đa chiều ---------- */
// Official channel logo (cut out from the brand file). Dark-board variant: black parts recoloured cream.
export const Logo: React.FC<{size?: number}> = ({size = 1}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16 * size}}>
    <Img src={staticFile('brand/logo-icon-dark.png')} style={{height: 92 * size}} />
    <Img src={staticFile('brand/logo-wordline-dark.png')} style={{height: 26 * size}} />
  </div>
);
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const a = TOTAL - F(OUTRO);
  if (f < a) return null;
  const k = ramp(f, a, 8), p = ramp(f, a + 2, 18);
  const shine = interpolate(f, [a + 10, a + 34], [-40, 140], cl);
  return (
    <AbsoluteFill style={{background: '#f7f6f4', clipPath: `circle(${k * 120}% at 50% 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
      <div style={{position: 'relative', width: 820, opacity: p, transform: `scale(${0.92 + 0.08 * p})`}}>
        <Img src={staticFile('brand/logo-full.png')} style={{width: '100%', display: 'block'}} />
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, transparent ${shine - 12}%, rgba(255,255,255,.7) ${shine}%, transparent ${shine + 12}%)`,
          WebkitMaskImage: `url(${staticFile('brand/logo-full.png')})`, WebkitMaskSize: '100% 100%', WebkitMaskRepeat: 'no-repeat'}} />
      </div>
      <div style={{marginTop: 70, opacity: ramp(f, a + 20, 10), fontFamily: font, fontSize: 30, fontWeight: 700, letterSpacing: 6, color: '#55504a'}}>THEO DÕI ĐỂ XEM PHÂN TÍCH TIẾP</div>
    </AbsoluteFill>
  );
};

/* ---------- composition ---------- */
export const FptBoard: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <Board cam={cam} />
      <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(540px, 960px) scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)`, transformOrigin: '0 0'}}>
        <World />
      </div>
      <Foreground cam={cam} />
      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.6))'}} />
      <div style={{position: 'absolute', top: 50, left: 50, opacity: 0.9 * (1 - ramp(f, TOTAL - F(OUTRO) - 6, 6))}}><Logo size={1} /></div>
      <Outro />
      <Audio src={staticFile('board-music.m4a')} />
      {VOICE.map((v, i) => <Sequence key={v} from={T(i)}><Audio src={staticFile(`voice/${v}.wav`)} /></Sequence>)}
    </AbsoluteFill>
  );
};
