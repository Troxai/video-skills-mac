import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
const fmt = (n: number) => Math.round(n).toLocaleString('de-DE');

/* =========================================================================
   FPT 9T/2026 — "infinite board" template
   One dark textured board. Every fact is a station; dotted threads connect
   them and the camera travels along the thread. Timing comes from LINES
   (seconds per narration line) so real voice durations can be dropped in.
   ========================================================================= */

export const FPS = 30;
// Narration line durations in seconds (replace with real voice durations).
// Real VieNeu 'Thanh Bình' durations + 0.25s breath; last line keeps a tail for the outro.
// Episode: Hà Nội đặt trần 120 triệu USD/km metro ngầm (VnExpress, 4/11/2026). Durations = voice + 0.25 s.
export const LINES = [8.57,  5.13,  4.57,  4.73,  6.01,  7.93,  6.89,  9.05,  6.81,  6.73,  6.17,  2.33,  9.21,  5.93,  7.69,  7.45,  9.04];
export const VOICE = ['h1', 'c1', 'c2', 'c3', 'd1', 'd2', 'd3', 'd4', 'r1', 'r2', 'r3', 'm1', 'm2', 'm3', 'm4', 'i1', 'q1'];
const NL = LINES.length;
const START = LINES.reduce<number[]>((a, d, i) => [...a, i ? a[i - 1] + LINES[i - 1] : 0], []);
export const OUTRO = 1.8; // channel sign-off after the last line
export const TOTAL = Math.round((START[NL - 1] + LINES[NL - 1] + OUTRO) * FPS);
const F = (s: number) => Math.round(s * FPS);
const T = (line: number, s = 0) => F(START[line] + s); // frame of "s seconds into line"

/* ---------- design tokens ---------- */
const C = {bg: '#121110', cream: '#efe2c4', red: '#d6362b', orange: '#e0703a', green: '#48d597', mute: '#a59c8a', line: 'rgba(239,226,196,.55)'};
const font = 'Inter, "DejaVu Sans", sans-serif';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const out3 = (t: number) => 1 - Math.pow(1 - t, 3);
const back = (t: number) => {const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);};
const ramp = (f: number, a: number, d: number, e = out3) => interpolate(f, [a, a + d], [0, 1], {...cl, easing: e});
const SEPIA = 'grayscale(1) sepia(.55) contrast(1.15) brightness(.92)';
const BW = 'grayscale(1) contrast(1.2) brightness(.95)';

/* ---------- stations (world coordinates) ---------- */
const P = Array.from({length: 17}, (_, i) => ({x: i === 6 || i === 7 ? 0 : [0, -160, 180, -120, 160][i % 5], y: i * 1900}));

/* ---------- camera: monotone spline through keys, zoom in log space ---------- */
type Key = {f: number; x: number; y: number; z: number};
const KEYS: Key[] = (() => {
  const k: Key[] = [{f: 0, x: P[0].x, y: P[0].y + 120, z: 0.86}];
  for (let i = 0; i < NL; i++) {
    const s = T(i), e = T(i) + F(LINES[i]);
    if (i > 0) k.push({f: s + 4, x: P[i].x, y: P[i].y, z: 1.0});
    if (i === NL - 1) {k.push({f: T(i, 4.4), x: P[i].x, y: P[i].y + 30, z: 1.07}); k.push({f: T(i, 5.3), x: P[i].x, y: P[i].y + 1450, z: 1.0}); k.push({f: TOTAL, x: P[i].x + 10, y: P[i].y + 1490, z: 1.08}); break;}
    k.push({f: e - 14, x: P[i].x + (i % 2 ? -18 : 18), y: P[i].y + 26, z: 1.06});
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
const TINT = ['#1d1b19', '#1d1b19', '#1d1b19', '#1d1b19', '#1f1c18', '#1f1c18', '#1f1c18', '#1f1c18', '#2a2118', '#2a2118', '#2a2118', '#2e0f0f', '#2e0f0f', '#2e0f0f', '#2e0f0f', '#1c1b19', '#14231c'];
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
        {!(i >= 5 && i <= 7) && <>
        <div style={{position: 'absolute', left: q.x + (i % 2 ? 160 : -780), top: q.y - 700 + (i % 3) * 120, transform: `rotate(${(rnd(i) - 0.5) * 10}deg)`}}><News seed={i} /></div>
        <div style={{position: 'absolute', left: q.x + (i % 2 ? -820 : 260), top: q.y + 260, transform: `rotate(${(rnd(i + 9) - 0.5) * 12}deg) scale(.8)`}}><News seed={i + 20} /></div>
        </>}
        <Crop x={q.x} y={q.y} />
        <div style={{position: 'absolute', left: q.x + 420, top: q.y - 820, fontFamily: font, fontSize: 22, fontWeight: 700, letterSpacing: 4, color: 'rgba(239,226,196,.3)'}}>{`${String(i + 1).padStart(2, "0")}/${String(P.length).padStart(2, "0")}`}</div>
      </React.Fragment>
    ))}
    {/* tape on the cut-outs */}
    <Tape x={P[0].x - 60} y={P[0].y - 300} r={-5} />
    <Tape x={P[9].x + 260} y={P[9].y - 330} r={6} w={150} />
    <Tape x={P[15].x - 200} y={P[15].y - 80} r={-4} />
  </>
);
// Foreground drift layer: moves faster than the board (parallax), soft focus.
const FG = Array.from({length: 46}, (_, i) => ({
  x: (rnd(i * 3) - 0.5) * 1600, y: -900 + i * 380 + rnd(i * 5) * 200, r: (rnd(i * 7) - 0.5) * 60,
  k: i % 3, w: 60 + rnd(i * 11) * 140, txt: ['120', '252 KM', '2030', '136,5', '208', '188', '141,3', '60.000 TỶ', '5 TUYẾN', '1 LIÊN DANH'][i % 10],
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
// Comparison as rail lines: each city is a track that a small train drives along to its cost per km.
const SC = 3.55; // px per million USD (208 -> ~800 px)
const Rail: React.FC<{x: number; y: number; l: string; v: number; at: number; hi?: boolean}> = ({x, y, l, v, at, hi}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const k = ramp(f, at, 22);
  const w = v * SC * k, col = hi ? C.orange : C.cream;
  const delta = Math.round(((v - 120) / v) * 100);
  return (
    <div style={{position: 'absolute', left: x - 480, top: y, width: 1000, height: 260}}>
      <div style={{position: 'absolute', left: 0, top: -24, fontFamily: font, fontSize: 44, fontWeight: 800, color: col, opacity: ramp(f, at, 8)}}>{l}</div>
      {/* track: rails + sleepers */}
      <div style={{position: 'absolute', left: 0, top: 120, width: w, height: 34,
        background: `repeating-linear-gradient(90deg, ${hi ? 'rgba(224,112,58,.55)' : 'rgba(239,226,196,.28)'} 0 6px, transparent 6px 26px)`}} />
      <div style={{position: 'absolute', left: 0, top: 120, width: w, height: 6, background: col}} />
      <div style={{position: 'absolute', left: 0, top: 148, width: w, height: 6, background: col}} />
      {/* station dot + train at the tip */}
      <div style={{position: 'absolute', left: w - 18, top: 119, width: 36, height: 36, borderRadius: 18, background: C.bg, border: `6px solid ${col}`}} />
      <Img src={staticFile('library/train.png')} style={{position: 'absolute', left: w - 120, top: 52, height: 76, filter: hi ? 'grayscale(1) sepia(1) saturate(3) hue-rotate(-20deg) brightness(.9)' : BW, opacity: k < 1 ? 1 : 0.95}} />
      <div style={{position: 'absolute', left: w + 34, top: 92, fontFamily: font, fontWeight: 900, fontStyle: 'italic', fontSize: 84, color: col, opacity: ramp(f, at + 14, 8), whiteSpace: 'nowrap'}}>{v.toLocaleString('de-DE')}</div>
      {!hi && <div style={{position: 'absolute', left: 0, top: 186, opacity: ramp(f, at + 22, 8), transform: `translateX(${(1 - ramp(f, at + 22, 8)) * -30}px)`}}>
        <Tag bg={C.orange} s={30}>Hà Nội thấp hơn {delta}%</Tag></div>}
    </div>
  );
};
const World: React.FC = () => {
  const f = useCurrentFrame();
  const p = P;
  return (
    <>
      <Material />
      {Array.from({length: NL - 1}, (_, i) => (
        <Dots key={i} d={`M${p[i].x} ${p[i].y + 620} C ${p[i].x + (i % 2 ? -260 : 260)} ${p[i].y + 900}, ${p[i + 1].x - (i % 2 ? -260 : 260)} ${p[i + 1].y - 900}, ${p[i + 1].x} ${p[i + 1].y - 560}`} at={T(i + 1) - 18} dur={22} />
      ))}
      {p.map((q, i) => (
        <React.Fragment key={i}>
          <div style={{position: 'absolute', left: q.x - 2000, top: q.y, width: 4000, height: 2, background: 'rgba(239,226,196,.08)'}} />
          <div style={{position: 'absolute', left: q.x - 470, top: q.y - 1100, width: 2, height: 2200, background: 'rgba(239,226,196,.06)'}} />
        </React.Fragment>
      ))}

      {/* 0 — HOOK */}
      <El x={p[0].x + 330} y={p[0].y - 330} at={F(0.2)} kind="up" rot={90}><Txt s={96}>METRO NGẦM</Txt></El>
      <El x={p[0].x - 40} y={p[0].y + 330} at={0} kind="fade"><Cut src="library/train.png" w={760} h={634} tone={BW} /></El>
      <El x={p[0].x - 60} y={p[0].y - 260} at={F(0.6)} kind="fade" z={0}>
        <div style={{width: 760, height: 170, background: C.red, transform: `skewX(-12deg) scaleX(${ramp(f, F(0.6), 8)})`, transformOrigin: 'left'}} /></El>
      <El x={p[0].x - 60} y={p[0].y - 280} at={F(0.7)} kind="pop"><Txt s={250} it ls={-10}>120</Txt></El>
      <El x={p[0].x - 60} y={p[0].y - 120} at={F(1.1)} kind="up"><Txt s={64} w={900}>TRIỆU USD / KM</Txt></El>
      <El x={p[0].x + 120} y={p[0].y - 560} at={T(0, 5.4)} kind="pop" rot={-4}><Tag bg={C.cream} s={38}><span style={{color: C.bg}}>THẤP NHẤT BẢNG SO SÁNH?</span></Tag></El>

      {/* 1 — the resolution */}
      <El x={p[1].x - 40} y={p[1].y - 60} at={T(1, 0)} kind="fade">
        <div style={{position: 'relative', width: 520, height: 680}}>
          {[0, 1, 2].map((k) => <div key={k} style={{position: 'absolute', inset: 0, background: '#ece4d2', transform: `rotate(${(k - 1) * 3}deg) translate(${k * 8}px, ${k * 6}px)`, boxShadow: '0 12px 30px rgba(0,0,0,.45)'}}>
            <div style={{margin: '46px 40px 0', height: 26, width: 300, background: '#3b3730'}} />
            {Array.from({length: 11}, (_, j) => <div key={j} style={{margin: '20px 40px 0', height: 9, width: 420 - (j % 3) * 70, background: '#b8af9c'}} />)}
          </div>)}
        </div></El>
      <El x={p[1].x - 40} y={p[1].y - 540} at={T(1, 0.3)} kind="left"><Txt s={54} w={900}>HĐND HÀ NỘI</Txt></El>
      <El x={p[1].x + 170} y={p[1].y + 220} at={T(1, 2.0)} kind="pop" rot={-12}>
        <div style={{border: `8px solid ${C.red}`, padding: '14px 28px', color: C.red, fontFamily: font, fontWeight: 900, fontSize: 64, opacity: 0.92, whiteSpace: 'nowrap', mixBlendMode: 'multiply', background: 'rgba(236,228,210,.2)'}}>THÔNG QUA<div style={{fontSize: 34, textAlign: 'center'}}>4/11/2026</div></div></El>
      <El x={p[1].x - 40} y={p[1].y + 520} at={T(1, 2.8)} kind="up"><Txt s={40} w={800} up={false} c={C.mute}>Thí điểm cơ chế đặc biệt cho đường sắt đô thị</Txt></El>

      {/* 2 — network size and money */}
      <svg style={{position: 'absolute', left: p[2].x - 460, top: p[2].y - 640, overflow: 'visible'}} width={920} height={700}>
        {['#e0703a', '#d6362b', '#48d597', '#efe2c4', '#7aa7d9'].map((c, k) => {
          const d = [`M40 ${120 + k * 40} C 300 ${80 + k * 90}, 560 ${640 - k * 70}, 880 ${200 + k * 80}`, `M${120 + k * 160} 20 C ${200 + k * 120} 300, ${520 - k * 60} 420, ${700 - k * 100} 690`][k % 2];
          return <path key={k} d={d} fill="none" stroke={c} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ramp(f, T(2, 0.1 + k * 0.15), 24)} opacity={0.85} />;
        })}
      </svg>
      <El x={p[2].x} y={p[2].y + 200} at={T(2, 0.6)} kind="pop"><Txt s={200} it>~<Count to={252} at={T(2, 0.6)} /> KM</Txt></El>
      <El x={p[2].x} y={p[2].y + 400} at={T(2, 2.2)} kind="up"><Txt s={90} it c={C.orange}>~1 TRIỆU TỶ ĐỒNG</Txt></El>
      <El x={p[2].x} y={p[2].y + 490} at={T(2, 2.4)} kind="fade"><Txt s={34} w={700} up={false} c={C.mute}>tổng vốn dự kiến</Txt></El>

      {/* 3 — timeline to 2030 */}
      <Dots d={`M${p[3].x - 420} ${p[3].y} H ${p[3].x + 420}`} at={T(3, 0)} dur={20} color={C.cream} w={8} />
      {[2026, 2027, 2028, 2029, 2030].map((y, k) => (
        <El key={y} x={p[3].x - 420 + k * 210} y={p[3].y + 70} at={T(3, 0.2 + k * 0.15)} kind="up"><Txt s={36} w={800} c={k === 4 ? C.orange : C.mute}>{y}</Txt></El>
      ))}
      <El x={p[3].x + 420} y={p[3].y} at={T(3, 1.0)} kind="pop"><div style={{width: 46, height: 46, borderRadius: 23, background: C.orange}} /></El>
      <El x={p[3].x - 80} y={p[3].y - 260} at={T(3, 0.4)} kind="pop"><Txt s={170} it>~5 NĂM</Txt></El>
      {['Tuyến 1', 'Tuyến 2', 'Tuyến 8', 'Tuyến 10', 'Tuyến 14'].map((t, k) => (
        <El key={t} x={p[3].x + 250} y={p[3].y + 230 + k * 74} at={T(3, 2.4 + k * 0.2)} kind="left"><div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{width: 34, height: 10, background: ['#e0703a', '#d6362b', '#48d597', '#efe2c4', '#7aa7d9'][k]}} /><Txt s={40} w={800} up={false}>{t}</Txt></div></El>
      ))}
      <El x={p[3].x - 220} y={p[3].y + 380} at={T(3, 2.2)} kind="pop"><Txt s={110} it c={C.orange}>5 TUYẾN</Txt></El>

      {/* 4 — the cap */}
      <El x={p[4].x + 200} y={p[4].y + 440} at={T(4, 0)} kind="fade"><Cut src="library/tbm.png" w={560} h={566} tone={SEPIA} /></El>
      <El x={p[4].x - 120} y={p[4].y - 380} at={T(4, 0.3)} kind="left"><Txt s={46} w={800} ls={4} c={C.mute}>MỨC TRẦN · ĐI NGẦM</Txt></El>
      <El x={p[4].x - 60} y={p[4].y - 220} at={T(4, 1.0)} kind="pop"><Txt s={210} it>≤ 120</Txt></El>
      <El x={p[4].x - 60} y={p[4].y - 70} at={T(4, 1.3)} kind="up"><Txt s={60} w={900} c={C.orange}>TRIỆU USD MỖI KM</Txt></El>
      <El x={p[4].x - 160} y={p[4].y + 60} at={T(4, 2.4)} kind="up"><Txt s={34} w={700} up={false} c={C.mute}>giá trị hợp đồng trung bình</Txt></El>

      {/* 5–7 — the comparison: one chart split over three stations, the 120 line runs through all */}
      <El x={p[5].x} y={p[5].y - 680} at={T(5, 0.1)} kind="left"><Txt s={64} w={900}>SO VỚI THẾ GIỚI</Txt></El>
      <El x={p[5].x} y={p[5].y - 600} at={T(5, 0.3)} kind="fade"><Txt s={30} w={700} c={C.mute} up={false}>triệu USD mỗi km đi ngầm</Txt></El>
      {/* dashed 120 reference running down the whole comparison */}
      <div style={{position: 'absolute', left: p[5].x - 480 + 120 * SC - 2, top: p[5].y - 520, width: 4, height: 4400, background: `repeating-linear-gradient(${C.orange} 0 14px, transparent 14px 30px)`, opacity: 0.75}} />
      <El x={p[5].x - 480 + 120 * SC} y={p[5].y - 545} at={T(5, 0.3)} kind="fade"><Txt s={30} w={800} c={C.orange}>MỨC TRẦN 120</Txt></El>
      <Rail x={p[5].x} y={p[5].y - 430} l="Hà Nội · mức trần" v={120} at={T(5, 0.5)} hi />
      <Rail x={p[5].x} y={p[5].y - 60} l="Quảng Châu · tuyến 1" v={136.5} at={T(5, 2.4)} />
      <Rail x={p[5].x} y={p[5].y + 330} l="Mumbai · tuyến 3" v={131} at={T(5, 5.4)} />
      <Rail x={p[5].x} y={p[6].y - 330} l="Grand Paris Express" v={199} at={T(6, 0.3)} />
      <Rail x={p[5].x} y={p[6].y + 80} l="Thượng Hải · tuyến 14" v={208} at={T(6, 2.4)} />
      <Rail x={p[5].x} y={p[7].y - 330} l="TP.HCM · metro số 2" v={188} at={T(7, 0.6)} />
      <Rail x={p[5].x} y={p[7].y + 80} l="Hà Nội · tuyến 3 (ước tính)" v={141.3} at={T(7, 4.6)} />

      {/* 8 — five lines, one turnkey contract */}
      {[0, 1, 2, 3, 4].map((k) => (
        <Dots key={k} d={`M${p[8].x - 440} ${p[8].y - 420 + k * 120} C ${p[8].x - 100} ${p[8].y - 420 + k * 120}, ${p[8].x - 60} ${p[8].y + 60}, ${p[8].x + 40} ${p[8].y + 60}`} at={T(8, 2.4 + k * 0.12)} dur={16} color={['#e0703a', '#d6362b', '#48d597', '#efe2c4', '#7aa7d9'][k]} w={7} />
      ))}
      <El x={p[8].x} y={p[8].y - 640} at={T(8, 0.2)} kind="left"><Txt s={56} it>VÌ SAO RẺ HƠN?</Txt></El>
      <El x={p[8].x + 190} y={p[8].y + 60} at={T(8, 3.2)} kind="pop"><div style={{border: `4px solid ${C.cream}`, padding: '24px 30px', background: 'rgba(18,17,16,.6)'}}>
        <Txt s={60} w={900}>5 TUYẾN</Txt><Txt s={60} w={900} c={C.orange}>1 GÓI THẦU</Txt><Txt s={30} w={700} up={false} c={C.mute}>hợp đồng trọn gói</Txt></div></El>
      <El x={p[8].x} y={p[8].y + 520} at={T(8, 4.8)} kind="up"><Txt s={44} w={800} up={false} c={C.mute}>thay vì làm từng tuyến một</Txt></El>

      {/* 9 — contractor requirements */}
      <El x={p[9].x + 260} y={p[9].y + 120} at={T(9, 0)} kind="fade"><Cut src="library/engineers2.png" w={440} h={688} tone={BW} /></El>
      <El x={p[9].x - 60} y={p[9].y - 520} at={T(9, 0.2)} kind="left"><Txt s={36} w={800} ls={4} c={C.mute}>NĂNG LỰC TÀI CHÍNH TỐI THIỂU</Txt></El>
      <El x={p[9].x - 150} y={p[9].y - 380} at={T(9, 0.8)} kind="pop"><Txt s={150} it><Count to={60000} at={T(9, 0.8)} /></Txt></El>
      <El x={p[9].x - 150} y={p[9].y - 260} at={T(9, 1.1)} kind="up"><Txt s={56} w={900} c={C.orange}>TỶ ĐỒNG</Txt></El>
      {['Chất lượng', 'Tiến độ', 'Chuyển giao công nghệ'].map((t, k) => (
        <El key={t} x={p[9].x - 230} y={p[9].y - 40 + k * 110} at={T(9, 3.0 + k * 0.6)} kind="left"><div style={{display: 'flex', alignItems: 'center', gap: 20, transform: 'translateX(20%)'}}>
          <div style={{width: 52, height: 52, border: `4px solid ${C.cream}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.green, fontSize: 44, fontWeight: 900}}>✓</div><Txt s={46} w={800} up={false}>{t}</Txt></div></El>
      ))}

      {/* 10 — penalties and exemptions */}
      <El x={p[10].x} y={p[10].y - 420} at={T(10, 0.2)} kind="left"><Txt s={90} it>CHẬM TIẾN ĐỘ</Txt></El>
      <El x={p[10].x} y={p[10].y - 280} at={T(10, 1.2)} kind="pop"><Tag bg={C.red} s={60}>→ BỒI THƯỜNG</Tag></El>
      <El x={p[10].x} y={p[10].y + 120} at={T(10, 3.0)} kind="up"><div style={{border: `4px dashed ${C.cream}`, padding: '26px 34px', width: 700}}>
        <Txt s={44} w={900}>TRỪ KHI CHẬM DO</Txt>
        <div style={{display: 'flex', gap: 18, marginTop: 18}}>{['Giao mặt bằng', 'Vốn', 'Bất khả kháng'].map((t) => <Tag key={t} bg="#3b3730" s={34}>{t}</Tag>)}</div></div></El>

      {/* 11 — MẶT KHÁC */}
      <El x={p[11].x} y={p[11].y} at={T(11, 0)} kind="pop" rot={-90}><Txt s={190} c={C.red}>MẶT KHÁC</Txt></El>
      <Dots d={`M${p[11].x + 180} ${p[11].y - 600} V ${p[11].y + 600}`} at={T(11, 0.1)} dur={20} color={C.red} />

      {/* 12 — what the cap leaves out */}
      <El x={p[12].x - 60} y={p[12].y - 560} at={T(12, 0.2)} kind="left"><Txt s={56} w={900}>120 TRIỆU USD/KM</Txt></El>
      <El x={p[12].x - 60} y={p[12].y - 470} at={T(12, 0.5)} kind="left"><Txt s={56} w={900} c={C.red}>CHƯA GỒM</Txt></El>
      {['Thuế VAT', 'Bồi thường, giải phóng mặt bằng', 'Di dời hạ tầng kỹ thuật', 'Tư vấn, quản lý dự án', 'Dự phòng'].map((t, k) => (
        <React.Fragment key={t}>
          <El x={p[12].x - 380} y={p[12].y - 300 + k * 120} at={T(12, 1.2 + k * 0.7)} kind="left"><div style={{transform: 'translateX(50%)', position: 'relative'}}>
            <Txt s={46} w={800} up={false}>{t}</Txt>
            <div style={{position: 'absolute', left: -10, right: -10, top: '52%', height: 6, background: C.red, transform: `scaleX(${ramp(f, T(12, 1.5 + k * 0.7), 8)})`, transformOrigin: 'left'}} /></div></El>
        </React.Fragment>
      ))}
      <El x={p[12].x + 60} y={p[12].y + 420} at={T(12, 6.2)} kind="pop"><Txt s={76} it c={C.red}>CHI PHÍ THẬT &gt; 120</Txt></El>

      {/* 13 — one bidder */}
      <El x={p[13].x} y={p[13].y - 300} at={T(13, 0.3)} kind="pop"><Txt s={260} it c={C.red}>1</Txt></El>
      <El x={p[13].x} y={p[13].y - 80} at={T(13, 0.6)} kind="up"><Txt s={70} w={900}>LIÊN DANH ĐỀ XUẤT</Txt></El>
      <Dots d={`M${p[13].x - 300} ${p[13].y + 60} H ${p[13].x + 300}`} at={T(13, 2.6)} dur={8} color={C.red} />
      <El x={p[13].x} y={p[13].y + 220} at={T(13, 3.0)} kind="up"><div style={{textAlign: 'center'}}>
        <Txt s={44} w={800} up={false} c={C.mute}>cũng là bên đưa ra</Txt><Txt s={70} it c={C.cream}>MỨC 120 TRIỆU USD</Txt></div></El>

      {/* 14 — no precedent; exemptions sit with the city */}
      <El x={p[14].x} y={p[14].y - 420} at={T(14, 0.2)} kind="pop" rot={-8}>
        <div style={{border: `8px solid ${C.red}`, padding: '18px 34px', color: C.red, fontFamily: font, fontWeight: 900, fontSize: 80, whiteSpace: 'nowrap'}}>CHƯA CÓ TIỀN LỆ</div></El>
      <El x={p[14].x} y={p[14].y + 60} at={T(14, 2.6)} kind="left"><div style={{textAlign: 'center'}}><Txt s={40} w={800} up={false} c={C.mute}>miễn trách nhiệm khi chậm</Txt>
        <div style={{display: 'flex', gap: 14, marginTop: 14, justifyContent: 'center'}}><Tag bg="#3b3730" s={36}>Mặt bằng</Tag><Tag bg="#3b3730" s={36}>Vốn</Tag></div></div></El>
      <Dots d={`M${p[14].x} ${p[14].y + 170} V ${p[14].y + 270}`} at={T(14, 4.6)} dur={8} color={C.red} w={7} />
      <El x={p[14].x} y={p[14].y + 330} at={T(14, 5.0)} kind="pop"><Txt s={64} w={900} c={C.red}>VIỆC CỦA THÀNH PHỐ</Txt></El>

      {/* 15 — what to watch */}
      <El x={p[15].x - 170} y={p[15].y + 330} at={T(15, 0)} kind="fade"><Cut src="library/commuters.png" w={640} h={630} tone={BW} /></El>
      <El x={p[15].x} y={p[15].y - 560} at={T(15, 0.2)} kind="left"><Txt s={60} it c={C.orange}>CẦN THEO DÕI</Txt></El>
      {['Mặt bằng giao đúng hẹn?', 'Tổng chi phí khi cộng đủ?'].map((t, k) => (
        <El key={t} x={p[15].x} y={p[15].y - 400 + k * 140} at={T(15, 2.2 + k * 2.4)} kind="left"><div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <Txt s={80} it c={C.orange}>{k + 1}</Txt><Txt s={52} w={900} up={false}>{t}</Txt></div></El>
      ))}

      {/* 16 — question + summary card */}
      <El x={p[16].x} y={p[16].y - 250} at={T(16, 0.1)} kind="pop"><Txt s={130} it c={C.green}>ĐỘT PHÁ</Txt></El>
      <El x={p[16].x} y={p[16].y - 110} at={T(16, 0.7)} kind="up"><Txt s={60} w={900}>HAY LÀ</Txt></El>
      <El x={p[16].x} y={p[16].y + 10} at={T(16, 1.1)} kind="up"><Txt s={84} it c={C.red}>CON SỐ CÒN THIẾU?</Txt></El>
      <Dots d={`M${p[16].x} ${p[16].y + 160} C ${p[16].x + 260} ${p[16].y + 500}, ${p[16].x - 260} ${p[16].y + 800}, ${p[16].x} ${p[16].y + 1040}`} at={T(16, 4.2)} dur={20} />
      <El x={p[16].x} y={p[16].y + 1110} at={T(16, 5.1)} kind="left"><Txt s={38} w={800} ls={6} c={C.orange}>METRO NGẦM HÀ NỘI · 4/11/2026</Txt></El>
      <Dots d={`M${p[16].x - 400} ${p[16].y + 1170} V ${p[16].y + 1800}`} at={T(16, 5.2)} dur={20} />
      {[
        {y: 1270, v: '≤ 120 TRIỆU USD', l: 'mỗi km đi ngầm · chưa gồm VAT, GPMB…', c: C.cream},
        {y: 1480, v: '252 KM', l: '~1 triệu tỷ đồng · 5 tuyến xong 2030', c: C.orange},
        {y: 1690, v: '1 LIÊN DANH', l: 'đề xuất tham gia', c: C.red},
      ].map((r, k) => (
        <React.Fragment key={k}>
          <Dots d={`M${p[16].x - 400} ${p[16].y + r.y} H ${p[16].x - 350}`} at={T(16, 5.4 + k * 0.35)} dur={5} />
          <El x={p[16].x - 340} y={p[16].y + r.y} at={T(16, 5.4 + k * 0.35)} kind="left"><div style={{transform: 'translateX(50%)'}}>
            <Txt s={88} it c={r.c}>{r.v}</Txt><Txt s={32} w={700} up={false} c={C.mute}>{r.l}</Txt></div></El>
        </React.Fragment>
      ))}
      <El x={p[16].x} y={p[16].y + 1900} at={T(16, 6.6)} kind="fade"><div style={{width: 900, fontFamily: font, fontSize: 24, color: C.mute, textAlign: 'center', lineHeight: 1.5}}>
        Không phải khuyến nghị đầu tư</div></El>
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
export const MetroBoard: React.FC = () => {
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
