import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame, Easing, OffthreadVideo, Sequence} from 'remotion';
import SIZES from './kvara_sizes.json';
import '@fontsource/playfair-display/vietnamese-400.css';
import '@fontsource/playfair-display/latin-400.css';
import '@fontsource/playfair-display/vietnamese-700-italic.css';
import '@fontsource/playfair-display/latin-700-italic.css';
import '@fontsource/jetbrains-mono/vietnamese-400.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/vietnamese-700.css';
import '@fontsource/jetbrains-mono/latin-700.css';

// 90+ · U17 VN vs NZ (9:16)
const SPD = 1.15;
const T0 = [[0,  2.945],  [3.265,  7.712],  [8.032,  11.279],  [11.599,  15.282],  [15.602,  21.236],  [21.556,  28.646],  [28.966,  35.738],  [36.058,  37.501],  [37.821,  45.409],  [45.729,  50.84],  [51.16,  54.556],  [54.876,  64.0],  [64.32,  68.011],  [68.331,  75.341],  [75.661,  78.653],  [78.973,  86.11],  [86.43,  90.945],  [91.265,  96.274],  [96.594,  103.416],  [103.736,  107.774],  [108.094,  114.94],  [115.26,  120.458],  [120.778,  124.74],  [125.06,  131.9],  [132.22,  142.427],  [142.747,  145.547],  [145.867,  147.885],  [148.205,  155.819],  [156.139,  162.406],  [162.726,  165.038],  [165.358,  170.091],  [170.412,  175.48],  [175.8,  177.047],  [177.367,  187.473],  [187.793,  196.195],  [196.515,  197.78],  [198.1,  207.913],  [208.233,  213.134],  [213.454,  218.615]];
const T = T0.map(([a, b]) => [a / SPD, b / SPD]);
export const KVARA_DUR = Math.round((218.615 / SPD + 3.6) * 30) / 30;
const W = 1080, H = 1920;
const SERIF = 'Playfair Display', MONO = 'JetBrains Mono';
const INK = '#141414', RED = '#C62828', BLUE = '#1E4FA8', GREEN = '#2E7D32';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const E = (t: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(t, [a, b], [0, 1], {...cl, easing: e});
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const SIZE: Record<string, [number, number]> = SIZES as unknown as Record<string, [number, number]>;
const r = (i: number, f = 0) => T[i][0] + (T[i][1] - T[i][0]) * f; // absolute time inside line i

// ---------- blocks ----------
const Paper: React.FC<{children?: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: '#e9e9e7'}}>
	<Img src={staticFile('mz/paper.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, mixBlendMode: 'multiply'}} />{children}</AbsoluteFill>;
const Dark: React.FC<{children?: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: '#0b0b0b'}}>
	<AbsoluteFill style={{backgroundImage: 'radial-gradient(#2a2a2a 1.4px, transparent 1.6px)', backgroundSize: '16px 16px', opacity: 0.8}} />
	<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(0,0,0,.7))'}} />{children}</AbsoluteFill>;
const Bg: React.FC<{n: string; t: number; d: number; dim?: number; children?: React.ReactNode}> = ({n, t, d, children}) => <Paper>
	<Img src={staticFile(`kvara/bg_${n}.jpg`)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.38, mixBlendMode: 'multiply', filter: 'contrast(1.1)', transformOrigin: '30% 30%', transform: `scale(${1.16 + 0.06 * (t / Math.max(d, 1))}) translateX(${-20 * t / Math.max(d, 1)}px)`}} />
	<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(233,233,231,.9) 0%, rgba(233,233,231,.25) 45%, transparent 70%)'}} />{children}</Paper>;
const Fig: React.FC<{n: string; x: number; y: number; h: number; t: number; a: number; crop?: number; flip?: boolean; from?: 'left' | 'right' | 'up' | 'none'; out?: number; dim?: number; shake?: number; ghost?: boolean; drop?: number}> = ({n, x, y, h, t, a, crop = 1, flip, from = 'none', out = 1e9, dim = 0, shake = 0, ghost = true, drop}) => {
	const [w0, h0] = SIZE[n]; const w = (w0 / h0) * h;
	const u = E(t, a, a + 0.6, Easing.out(Easing.back(1.4)));
	const o = 1 - E(t, out, out + 0.35, Easing.in(Easing.cubic));
	const dx = (from === 'left' ? -700 * (1 - u) : from === 'right' ? 700 * (1 - u) : 0) + Math.sin(t * 0.7 + x * 0.01) * 14;
	const dy = from === 'up' ? -300 * (1 - u) : from === 'none' ? 60 * (1 - E(t, a, a + 0.5)) : 0;
	const vis = h * crop, g = h * 0.019;
	const rot = drop !== undefined ? 90 * E(t, drop, drop + 0.45, Easing.in(Easing.quad)) : 0;
	const im = (gh: boolean) => <Img src={staticFile(`kvara/${n}.png`)} style={{position: 'absolute', left: gh ? -g : 0, top: gh ? g * 0.15 : 0, width: w, height: h, transform: flip ? 'scaleX(-1)' : undefined, filter: gh ? 'grayscale(1) brightness(.35)' : dim ? `brightness(${1 - dim}) grayscale(${dim})` : undefined, opacity: gh ? 0.35 : 1}} />;
	const breathe = (1 + 0.012 * Math.sin(t * 1.3 + x)) * (1 + Math.min(0.07, Math.max(0, t - a) * 0.012));
	return <div style={{position: 'absolute', left: x - w / 2 + dx, top: y - vis + dy, width: w, height: vis, overflow: crop < 1 ? 'hidden' : 'visible', zIndex: 2, transformOrigin: '50% 100%', transform: `${shake ? `rotate(${Math.sin(t * 31) * shake * 2.2}deg) translateX(${Math.sin(t * 47) * shake * 7}px)` : ''} rotate(${rot}deg) scale(${breathe})`, opacity: Math.min(1, u * 1.4) * o, WebkitMaskImage: crop < 1 ? 'linear-gradient(to bottom, #000 82%, transparent)' : undefined}}>
		{ghost && im(true)}{im(false)}
	</div>;
};
const Circle: React.FC<{x: number; y: number; r: number; c: string; t: number; a: number; out?: number}> = ({x, y, r: rr, c, t, a, out = 1e9}) => {const u = E(t, a, a + 0.5, Easing.out(Easing.back(1.4))) * (1 - E(t, out, out + 0.3)); return <div style={{position: 'absolute', left: x - rr, top: y - rr, width: 2 * rr, height: 2 * rr, borderRadius: '50%', background: c, transform: `scale(${u})`, filter: 'url(#rough)'}} />;};
const Ground: React.FC<{y: number; t: number; a: number; c?: string}> = () => null;
const S: React.FC<{x: number; y: number; t: number; a: number; size?: number; c?: string; out?: number; align?: 'left' | 'center' | 'right'; w?: number; children: React.ReactNode}> = ({x, y, t, a, size = 60, c = INK, out = 1e9, align = 'left', w = 800, children}) => {
	const u = E(t, a, a + 0.45), o = 1 - E(t, out, out + 0.3);
	const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
	return <div style={{position: 'absolute', left, top: y, width: w, textAlign: align, fontFamily: SERIF, fontSize: size, color: c, lineHeight: 1.2, opacity: o * Math.min(1, u * 2), clipPath: `inset(-20% ${(1 - u) * 100}% -20% 0)`, transform: `translateX(${(1 - u) * -40}px) scale(${lerp(1.06, 1, u)})`, transformOrigin: '0 50%'}}>{children}</div>;
};
const B: React.FC<{children: React.ReactNode; c?: string}> = ({children, c}) => <b style={{fontWeight: 700, fontStyle: 'italic', color: c}}>{children}</b>;
const Src: React.FC<{x: number; y: number; t: number; a: number; c?: string; out?: number; children: React.ReactNode}> = ({x, y, t, a, c = '#777', out = 1e9, children}) => <div style={{position: 'absolute', left: x, top: y, fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: c, textTransform: 'uppercase', opacity: E(t, a, a + 0.4) * (1 - E(t, out, out + 0.3))}}>{children}</div>;
const Stat: React.FC<{x: number; y: number; label: string; val: string; t: number; a: number; w?: number; c?: string; out?: number}> = ({x, y, label, val, t, a, w = 860, c = INK, out = 1e9}) => {
	const u = E(t, a, a + 0.4), o = 1 - E(t, out, out + 0.3);
	return <div style={{position: 'absolute', left: x, top: y, width: w, opacity: u * o, transform: `translateX(${(1 - u) * -30}px)`}}>
		<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: MONO, color: c}}>
			<span style={{fontSize: 34, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.85}}>{label}</span>
			<span style={{fontSize: 76, fontWeight: 700}}>{val}</span>
		</div>
		<div style={{height: 3, background: GREEN, width: `${E(t, a + 0.2, a + 0.8) * 100}%`, marginTop: 8}} />
	</div>;
};
const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; bend?: number; t: number; a: number; c?: string; out?: number; id: string}> = ({x1, y1, x2, y2, bend = 0.25, t, a, c = INK, out = 1e9, id}) => {
	const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
	const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
	const u = E(t, a, a + 0.6, Easing.inOut(Easing.cubic)), o = 1 - E(t, out, out + 0.3);
	const ang = Math.atan2(y2 - my, x2 - mx) * 180 / Math.PI;
	return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: o, zIndex: 3}}>
		<defs><mask id={`m${id}`}><path d={d} stroke="#fff" strokeWidth={14} fill="none" pathLength={1} strokeDasharray={`${u} 1`} /></mask></defs>
		<path d={d} stroke={c} strokeWidth={5} fill="none" strokeDasharray="2 11" strokeLinecap="round" mask={`url(#m${id})`} />
		{u > 0.97 && <path d="M -16 -10 L 0 0 L -16 10" transform={`translate(${x2} ${y2}) rotate(${ang})`} stroke={c} strokeWidth={5} fill="none" strokeLinecap="round" />}
	</svg>;
};
const Clip: React.FC<{x: number; y: number; w?: number; t: number; a: number; src: string; rot?: number; out?: number; children: React.ReactNode}> = ({x, y, w = 620, t, a, src, rot = -1.5, out = 1e9, children}) => {
	const u = E(Math.floor(t * 12) / 12, a, a + 0.3, Easing.out(Easing.back(2))), o = 1 - E(t, out, out + 0.3);
	return <div style={{position: 'absolute', left: x, top: y, width: w, transform: `scale(${u}) rotate(${rot}deg)`, transformOrigin: '0 0', opacity: Math.min(1, u) * o, background: '#faf8f2', padding: '22px 28px', boxShadow: '10px 14px 0 rgba(0,0,0,.25)', borderTop: `7px solid ${INK}`, zIndex: 3}}>
		<div style={{fontFamily: MONO, fontSize: 18, letterSpacing: 3, color: '#777', textTransform: 'uppercase', marginBottom: 8}}>{src}</div>
		<div style={{fontFamily: SERIF, fontSize: 40, lineHeight: 1.25, color: INK}}>{children}</div>
	</div>;
};
const Stamp: React.FC<{x: number; y: number; t: number; a: number; text: string; c?: string; out?: number}> = ({x, y, t, a, text, c = RED, out = 1e9}) => {const u = E(Math.floor(t * 12) / 12, a, a + 0.25, Easing.out(Easing.back(2.5))) * (1 - E(t, out, out + 0.25)); return <div style={{position: 'absolute', left: x, top: y, transform: `rotate(-10deg) scale(${lerp(1.6, 1, u)})`, opacity: u, border: `6px solid ${c}`, color: c, fontFamily: MONO, fontWeight: 700, fontSize: 40, padding: '6px 18px', letterSpacing: 3, zIndex: 4}}>{text}</div>;};

const Club: React.FC<{x: number; y: number; t: number; a: number; name?: string; c?: string; rot?: number; size?: number; out?: number}> = ({x, y, t, a, name = 'MAN UTD', c = RED, rot = -3, size = 40, out = 1e9}) => {
	const u = E(Math.floor(t * 12) / 12, a, a + 0.3, Easing.out(Easing.back(2.4))), o = 1 - E(t, out, out + 0.25);
	return <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) scale(${u})`, transformOrigin: '0 50%', opacity: Math.min(1, u) * o, zIndex: 4, background: c, padding: `${size * 0.28}px ${size * 0.6}px`, boxShadow: '7px 9px 0 rgba(0,0,0,.28)', overflow: 'hidden'}}>
		<div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,0,0,.28) 1.2px, transparent 1.5px)', backgroundSize: '6px 6px'}} />
		<span style={{position: 'relative', fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.18, color: '#f5f1e8'}}>{name}</span>
	</div>;
};

// ---------- hub: 4 phiên bản ----------
const HUB = [{x: 330, y: 540, c: RED, n: 'SOUTHAMPTON · SPURS', k: 'người xây dựng'}, {x: 750, y: 540, c: BLUE, n: 'PSG', k: 'quản lý ngôi sao'}, {x: 1170, y: 540, c: RED, n: 'CHELSEA', k: 'dọn đổ nát'}, {x: 1590, y: 540, c: BLUE, n: 'TUYỂN MỸ', k: 'vòng 16 đội'}];
const Hub: React.FC<{t: number; show?: number[]; title?: React.ReactNode}> = ({t, show = [1, 1, 1, 1], title}) => <Paper>
	<S x={960} y={90} t={t} a={0.1} size={60} align="center" w={1600}>{title ?? <><B c={RED}>bốn</B> phiên bản pochettino</>}</S>
	{HUB.map((h, i) => <React.Fragment key={i}>
		<Circle x={h.x} y={h.y} r={170} c={show[i] ? h.c : '#bdbdbd'} t={t} a={0.3 + i * 0.15} />
		<div style={{position: 'absolute', left: h.x - 170, top: h.y - 170, width: 340, height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 130, color: '#fff', opacity: E(t, 0.5 + i * 0.15, 0.8 + i * 0.15)}}>{i + 1}</div>
		<div style={{position: 'absolute', left: h.x - 200, top: h.y + 200, width: 400, textAlign: 'center', fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: INK, opacity: E(t, 0.7 + i * 0.15, 1 + i * 0.15)}}>{h.n}</div>
		<div style={{position: 'absolute', left: h.x - 200, top: h.y + 240, width: 400, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 36, color: show[i] ? h.c : '#999', opacity: E(t, 0.8 + i * 0.15, 1.1 + i * 0.15)}}>{h.k}</div>
	</React.Fragment>)}
</Paper>;
const zoomHub = (k: number, t: number, a: number) => {const u = E(t, a, a + 0.6, Easing.in(Easing.cubic)); const c = HUB[k]; return {transformOrigin: `${c.x}px ${c.y}px`, transform: `scale(${lerp(1, 9, u)})`};};
const FromCircle: React.FC<{t: number; c: string; x: number; y: number; r: number}> = ({t, c, x, y, r: rr}) => {const u = E(t, 0, 0.6); const R = lerp(1300, rr, u); return <div style={{position: 'absolute', left: lerp(960, x, u) - R, top: lerp(540, y, u) - R, width: R * 2, height: R * 2, borderRadius: '50%', background: c, filter: 'url(#rough)'}} />;};
const Big: React.FC<{n: string; t: number; a: number; x?: number; c?: string}> = ({n, t, a, x = 120, c = RED}) => <div style={{position: 'absolute', left: x, top: 60, fontFamily: SERIF, fontWeight: 700, fontStyle: 'italic', fontSize: 340, lineHeight: 1, color: c, opacity: E(t, a, a + 0.3) * 0.9, transform: `scale(${lerp(1.4, 1, E(t, a, a + 0.4))})`, transformOrigin: '0 0'}}>{n}</div>;
const Strike: React.FC<{x: number; y: number; w: number; t: number; a: number}> = ({x, y, w, t, a}) => <div style={{position: 'absolute', left: x, top: y, height: 8, background: RED, width: w * E(t, a, a + 0.35), zIndex: 5}} />;
const Dots: React.FC<{t: number; a: number; b: number}> = ({t, a, b}) => <div style={{position: 'absolute', left: 1000, top: 250, width: 820, display: 'flex', flexWrap: 'wrap', gap: 22}}>
	{Array.from({length: 41}).map((_, k) => <div key={k} style={{width: 70, height: 70, borderRadius: '50%', background: k < 17 && t > b + k * 0.04 ? RED : '#b0b0ae', opacity: E(t, a + k * 0.02, a + 0.2 + k * 0.02), transform: `scale(${E(t, a + k * 0.02, a + 0.3 + k * 0.02, Easing.out(Easing.back(2)))})`}} />)}
</div>;
const Card: React.FC<{x: number; y: number; t: number; a: number; top: string; main: string; c?: string}> = ({x, y, t, a, top, main, c = INK}) => {const u = E(t, a, a + 0.35, Easing.out(Easing.back(1.8))); return <div style={{position: 'absolute', left: x, top: y, width: 520, padding: '16px 24px', background: '#faf8f2', borderLeft: `10px solid ${c}`, boxShadow: '8px 10px 0 rgba(0,0,0,.2)', opacity: Math.min(1, u), transform: `translateX(${(1 - u) * 60}px)`}}>
	<div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: '#777'}}>{top}</div><div style={{fontFamily: SERIF, fontSize: 40, color: INK}}>{main}</div></div>;};
const CHAIRS = ['Moyes', 'Van Gaal', 'Mourinho', 'Solskjaer', 'Ten Hag', 'Amorim', 'Carrick', 'Pochettino'];
const ChairRow: React.FC<{t: number; a: number; n?: number; hi?: number}> = ({t, a, n = 8, hi = 7}) => <>
	{CHAIRS.concat(['?']).slice(0, n).map((c, k) => <React.Fragment key={k}>
		<Fig n="chair" x={170 + k * 200} y={820} h={260} t={t} a={a + k * 0.08} from="up" ghost={false} dim={k === hi ? 0 : 0.45} />
		<div style={{position: 'absolute', left: 170 + k * 200 - 100, top: 845, width: 200, textAlign: 'center', fontFamily: MONO, fontSize: 19, letterSpacing: 1, color: k === hi ? RED : INK, fontWeight: k === hi ? 700 : 400, opacity: E(t, a + 0.3 + k * 0.08, a + 0.6 + k * 0.08)}}>{k + 1}. {c.toUpperCase()}</div>
	</React.Fragment>)}
	<Ground y={820} t={t} a={a} />
</>;
const OldPitch: React.FC<{t: number; a: number; children?: React.ReactNode}> = ({t, a, children}) => <svg width={W} height={H} style={{position: 'absolute', opacity: E(t, a, a + 0.4)}}>
	<rect x={960} y={200} width={840} height={560} fill="none" stroke={INK} strokeWidth={4} /><line x1={1380} y1={200} x2={1380} y2={760} stroke={INK} strokeWidth={3} /><circle cx={1380} cy={480} r={70} fill="none" stroke={INK} strokeWidth={3} />
	<rect x={960} y={340} width={120} height={280} fill="none" stroke={INK} strokeWidth={3} /><rect x={1680} y={340} width={120} height={280} fill="none" stroke={INK} strokeWidth={3} />{children}</svg>;

// ---------- vertical pitch (68 x 105 m), attack upward ----------
type Dot = {x: number; y: number; c: string; n?: string; hi?: number; dim?: number};
const PS = 11, PW = 68 * PS, PH = 105 * PS;
const Pitch: React.FC<{t: number; a: number; dots: Dot[]; top?: number; tilt?: number; zoom?: number; zy?: number; children?: React.ReactNode; label?: string}> = ({t, a, dots, top = 330, tilt = 24, zoom = 1, zy = 52.5, children, label}) => {
	const u = E(t, a, a + 0.6);
	const ln = '#2b2b2b';
	return <div style={{position: 'absolute', left: (W - PW) / 2, top, width: PW, height: PH, perspective: 2200, opacity: u}}>
		{label && <div style={{position: 'absolute', left: 0, top: -64, fontFamily: MONO, fontSize: 30, letterSpacing: 4, color: INK, opacity: E(t, a + 0.3, a + 0.7)}}>{label}</div>}
		<div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateX(${tilt}deg) scale(${zoom})`, transformOrigin: `50% ${(1 - zy / 105) * 100}%`}}>
			<svg width={PW} height={PH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
				<rect x={0} y={0} width={PW} height={PH} fill="rgba(255,255,255,.25)" stroke={ln} strokeWidth={4} />
				<line x1={0} y1={PH / 2} x2={PW} y2={PH / 2} stroke={ln} strokeWidth={3} />
				<circle cx={PW / 2} cy={PH / 2} r={9.15 * PS} fill="none" stroke={ln} strokeWidth={3} />
				{[0, 1].map((k) => <g key={k} transform={k ? `translate(0 ${PH}) scale(1 -1)` : undefined}>
					<rect x={(34 - 20.15) * PS} y={0} width={40.3 * PS} height={16.5 * PS} fill="none" stroke={ln} strokeWidth={3} />
					<rect x={(34 - 9.16) * PS} y={0} width={18.32 * PS} height={5.5 * PS} fill="none" stroke={ln} strokeWidth={3} />
				</g>)}
			</svg>
			{children}
			{dots.map((d, k) => {
				const px = d.x * PS, py = PH - d.y * PS, s = 1 + 0.35 * (d.hi ?? 0);
				const pu = E(t, a + 0.3 + k * 0.04, a + 0.6 + k * 0.04, Easing.out(Easing.back(2)));
				return <div key={k} style={{position: 'absolute', left: px - 24, top: py - 24, width: 48, height: 48, transform: `scale(${pu * s})`, opacity: 1 - (d.dim ?? 0) * 0.7}}>
					<div style={{position: 'absolute', left: -4, top: 4, width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,0,0,.3)'}} />
					<div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: d.c, border: '4px solid #f5f1e8', boxShadow: d.hi ? `0 0 0 ${6 * (d.hi ?? 0)}px rgba(198,40,40,.35)` : undefined}} />
					{d.n && <div style={{position: 'absolute', left: -110, top: 54, width: 268, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 2, color: INK, textTransform: 'uppercase'}}>{d.n}</div>}
				</div>;
			})}
		</div>
	</div>;
};
// pitch-space dotted path (meters)
const PLine: React.FC<{pts: [number, number][]; t: number; a: number; c?: string; dash?: string; w?: number; out?: number}> = ({pts, t, a, c = INK, dash = '2 12', w = 5, out = 1e9}) => {
	const d = pts.map(([x, y], k) => `${k ? 'L' : 'M'} ${x * PS} ${PH - y * PS}`).join(' ');
	const u = E(t, a, a + 0.6, Easing.inOut(Easing.cubic)), o = 1 - E(t, out, out + 0.3);
	const [x1, y1] = pts[pts.length - 2], [x2, y2] = pts[pts.length - 1];
	const ang = Math.atan2(-(y2 - y1), x2 - x1) * 180 / Math.PI;
	const id = `pl${Math.round(pts[0][0] * 7 + pts[0][1] * 13 + a * 100)}`;
	return <svg width={PW} height={PH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: o}}>
		<defs><mask id={id}><path d={d} stroke="#fff" strokeWidth={16} fill="none" pathLength={1} strokeDasharray={`${u} 1`} /></mask></defs>
		<path d={d} stroke={c} strokeWidth={w} fill="none" strokeDasharray={dash} strokeLinecap="round" mask={`url(#${id})`} />
		{u > 0.97 && <path d="M -18 -11 L 0 0 L -18 11" transform={`translate(${x2 * PS} ${PH - y2 * PS}) rotate(${ang})`} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" />}
	</svg>;
};
const Zone: React.FC<{x: number; y: number; r: number; t: number; a: number; out?: number}> = ({x, y, r: rr, t, a, out = 1e9}) => {const u = E(t, a, a + 0.4, Easing.out(Easing.back(1.6))) * (1 - E(t, out, out + 0.3)); return <div style={{position: 'absolute', left: (x - rr) * PS, top: PH - (y + rr) * PS, width: 2 * rr * PS, height: 2 * rr * PS, borderRadius: '50%', border: `5px dashed ${RED}`, background: 'rgba(198,40,40,.16)', transform: `scale(${u})`}} />;};
const mix = (A: Dot[], Bd: Dot[], u: number): Dot[] => A.map((d, k) => ({...Bd[k], x: lerp(d.x, Bd[k].x, u), y: lerp(d.y, Bd[k].y, u)}));
const F4231: [number, number][] = [[34, 5], [60, 28], [43, 21], [25, 21], [8, 28], [42, 41], [26, 41], [58, 62], [34, 59], [10, 62], [34, 78]];
const MU_N = ['Lammens', 'Dalot', 'Yoro', 'Maguire', 'Dorgu', 'Tielemans', 'Mainoo', 'Diallo', 'Bruno', 'Cunha', 'Mbeumo'];
const SP_N = ['', '', '', '', '', 'Dier', '', 'Son', 'Alli', '', 'Kane'];
const team = (c: string, names: string[], show: number[] = [], hi: number[] = [], dim = 0): Dot[] => F4231.map(([x, y], k) => ({x, y, c, n: show.includes(k) ? names[k] : undefined, hi: hi.includes(k) ? 1 : 0, dim: dim && !hi.includes(k) ? dim : 0}));
const move = (D: Dot[], m: Record<number, [number, number]>, u: number): Dot[] => D.map((d, k) => m[k] ? {...d, x: lerp(d.x, m[k][0], u), y: lerp(d.y, m[k][1], u)} : d);
// horizontal bars ranking
const Bars: React.FC<{t: number; a: number; top: number; rows: {n: string; v: number; c?: string}[]; max: number; unit?: string}> = ({t, a, top, rows, max, unit = ''}) => <>
	{rows.map((r0, k) => {const u = E(t, a + k * 0.12, a + 0.7 + k * 0.12); return <div key={k} style={{position: 'absolute', left: 80, top: top + k * 92, width: 920, opacity: Math.min(1, u * 2)}}>
		<div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 3, color: r0.c ?? '#666', fontWeight: r0.c ? 700 : 400}}>{r0.n}</div>
		<div style={{height: 34, marginTop: 6, width: `${(r0.v / max) * 100 * u}%`, background: r0.c ?? '#9a9a98'}} />
	</div>;})}
	{unit && <div style={{position: 'absolute', left: 80, top: top + rows.length * 92 + 10, fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: '#888', opacity: E(t, a + 0.8, a + 1.2)}}>{unit}</div>}
</>;
const Count: React.FC<{t: number; a: number; to: number; y: number; size?: number; c?: string; suffix?: string; dec?: boolean}> = ({t, a, to, y, size = 230, c = RED, suffix = '', dec}) => {
	const v = Math.round(to * E(t, a, a + 1.4, Easing.out(Easing.quad)));
	const s = dec ? v.toLocaleString('de-DE') : String(v);
	return <div style={{position: 'absolute', left: 0, top: y, width: W, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: size, color: c, opacity: E(t, a, a + 0.2), letterSpacing: -4}}>{s}<span style={{fontSize: size * 0.35, letterSpacing: 2}}>{suffix}</span></div>;
};
const Name: React.FC<{x: number; y: number; t: number; a: number; n: string; sub?: string; c?: string; out?: number}> = ({x, y, t, a, n, sub, c = RED, out = 1e9}) => {const u = E(t, a, a + 0.35, Easing.out(Easing.back(1.8))) * (1 - E(t, out, out + 0.3)); return <div style={{position: 'absolute', left: x, top: y, zIndex: 4, opacity: Math.min(1, u), transform: `translateY(${(1 - u) * 30}px)`}}>
	<div style={{fontFamily: SERIF, fontWeight: 700, fontStyle: 'italic', fontSize: 76, color: c, lineHeight: 1}}>{n}</div>
	{sub && <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: INK, marginTop: 10, textTransform: 'uppercase'}}>{sub}</div>}</div>;};

type Shot = {i: number; trans: 'left' | 'up' | 'cut' | 'zoom'; C: (t: number, R: (i: number, f?: number) => number, d: number) => React.ReactNode};


// clip thật (anh cung cấp): khung giấy, cắt đoạn [s0,s1] giây
const Vid: React.FC<{t: number; a: number; s0: number; s1: number; x?: number; y?: number; w?: number; out?: number; cap?: string}> = ({t, a, s0, s1, x = 160, y = 330, w = 760, out = 1e9, cap}) => {
	const f = useCurrentFrame();
	const start = f - Math.round((t - a) * 30);
	const u = E(t, a, a + 0.35, Easing.out(Easing.back(1.5))), o = 1 - E(t, out, out + 0.25);
	const h = w * 16 / 9;
	return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(-1.2deg) scale(${lerp(0.9, 1, u)})`, opacity: Math.min(1, u * 1.5) * o, background: '#faf8f2', padding: 14, boxShadow: '14px 18px 0 rgba(0,0,0,.25)', zIndex: 3}}>
		<div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#000'}}>
			{t >= a - 0.05 && <Sequence from={start} layout="none"><OffthreadVideo src={staticFile('kvara/clip.mp4')} startFrom={Math.round(s0 * 30)} endAt={Math.round(s1 * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>}
		</div>
		{cap && <div style={{position: 'absolute', left: 14, bottom: -70, fontFamily: MONO, fontSize: 26, letterSpacing: 3, color: INK}}>{cap}</div>}
	</div>;
};
const Score: React.FC<{t: number; a: number; y?: number}> = ({t, a, y = 260}) => {const u = E(t, a, a + 0.35, Easing.out(Easing.back(1.8))); return <div style={{position: 'absolute', left: 80, top: y, width: 920, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf8f2', borderTop: `8px solid ${INK}`, padding: '20px 30px', boxShadow: '10px 12px 0 rgba(0,0,0,.2)', opacity: Math.min(1, u), transform: `scale(${lerp(0.9, 1, u)})`, zIndex: 4}}>
	<span style={{fontFamily: MONO, fontSize: 34, letterSpacing: 4, fontWeight: 700, color: '#2b7bbf'}}>ARGENTINA</span>
	<span style={{fontFamily: MONO, fontSize: 84, fontWeight: 700, color: INK}}>7–0</span>
	<span style={{fontFamily: MONO, fontSize: 34, letterSpacing: 4, color: '#777'}}>COSTA RICA</span></div>;};
const PRICE = (v: number[]) => [{n: '€9M · ĐIỀU KHOẢN MUA LẠI', v: 9, c: RED}, {n: '€60M · GIÁ BÁN LẠI (THEO BÁO TÂY BAN NHA)', v: 60}, {n: '€80M · GIÁ MUA LẠI MỚI (THEO BÁO CHÍ)', v: 80, c: SKY}].filter((_, k) => v.includes(k));

// 23 chấm: n = số chấm còn sáng (từ cuối tắt), grp = nhóm sáng
const Dots23: React.FC<{t: number; a: number; on?: number; y?: number; hi?: number[]; spread?: number; gather?: number}> = ({t, a, on = 23, y = 700, hi = [], spread = 0, gather = 0}) => <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}>
	{Array.from({length: 23}).map((_, k) => {const col = k % 6, row = Math.floor(k / 6); const bx = 165 + col * 150, by = y + row * 150;
		const ang = k * 2.39, sx = 540 + Math.cos(ang) * 470, sy = 1000 + Math.sin(ang) * 520;
		const gx = 540 + Math.cos(ang) * 120, gy = 960 + Math.sin(ang) * 120;
		let x = lerp(bx, sx, spread), yy = lerp(by, sy, spread); x = lerp(x, gx, gather); yy = lerp(yy, gy, gather);
		const u = E(t, a + k * 0.03, a + k * 0.03 + 0.3, Easing.out(Easing.back(2)));
		const lit = k < on; const h = hi.length ? hi.includes(k) : true;
		return <div key={k} style={{position: 'absolute', left: x - 42, top: yy - 42, width: 84, height: 84, borderRadius: '50%', background: lit ? (h ? RED : '#c9a9a5') : '#b9b9b6', border: '5px solid #faf8f2', boxShadow: '4px 6px 0 rgba(0,0,0,.2)', transform: `scale(${u})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 26, color: '#faf8f2'}}>{k + 1}</div>;})}
</div>;
const Minute: React.FC<{t: number; a: number; y?: number}> = ({t, a, y = 300}) => <div style={{position: 'absolute', left: 0, top: y, width: W, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 300, color: RED, opacity: E(t, a, a + 0.3), letterSpacing: -6}}>{Math.round(lerp(90, 116, E(t, a, a + 1.2, Easing.out(Easing.quad))))}'</div>;
const Pin: React.FC<{x: number; y: number; t: number; a: number; n: string; c?: string}> = ({x, y, t, a, n, c = RED}) => {const u = E(t, a, a + 0.35, Easing.out(Easing.back(2))); return <div style={{position: 'absolute', left: x - 30, top: y - 30, opacity: Math.min(1, u), transform: `scale(${u})`, zIndex: 4}}>
	<div style={{width: 60, height: 60, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: c, border: '5px solid #faf8f2', boxShadow: '4px 6px 0 rgba(0,0,0,.25)'}} />
	<div style={{fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: INK, marginTop: 14, whiteSpace: 'nowrap'}}>{n}</div></div>;};
const Gray: React.FC<{x: number; y: number; t: number; a: number; n: string}> = ({x, y, t, a, n}) => {const u = E(t, a, a + 0.35, Easing.out(Easing.back(1.8))); return <div style={{position: 'absolute', left: x, top: y, width: 420, padding: '20px 24px', background: '#d6d6d3', borderLeft: '10px solid #888', opacity: Math.min(1, u), transform: `translateY(${(1 - u) * 40}px)`, zIndex: 4}}>
	<div style={{fontFamily: SERIF, fontWeight: 700, fontStyle: 'italic', fontSize: 58, color: INK}}>{n}</div>
	<div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 3, color: '#555', marginTop: 6}}>CHƯA CÓ CLB</div></div>;};
const Trophy: React.FC<{o?: number}> = ({o = 0.2}) => <Img src={staticFile('tbn/trophy.png')} style={{position: 'absolute', left: 540 - 330, top: 520, width: 660, opacity: o}} />;

const GOLD = '#e0a800', SKY = '#2b7bbf';
const Board: React.FC<{t: number; a: number; y?: number; l: string; r: string; mid: string; blink?: boolean}> = ({t, a, y = 260, l, r: rr, mid, blink}) => {const u = E(t, a, a + 0.35, Easing.out(Easing.back(1.8))); const o = blink ? 0.55 + 0.45 * Math.abs(Math.sin(t * 4)) : 1; return <div style={{position: 'absolute', left: 60, top: y, width: 960, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf8f2', borderTop: `8px solid ${INK}`, padding: '22px 30px', boxShadow: '10px 12px 0 rgba(0,0,0,.2)', opacity: Math.min(1, u), transform: `scale(${lerp(0.9, 1, u)})`, zIndex: 4}}>
	<span style={{fontFamily: MONO, fontSize: 40, letterSpacing: 4, fontWeight: 700, color: RED}}>{l}</span>
	<span style={{fontFamily: MONO, fontSize: 90, fontWeight: 700, color: INK, opacity: o}}>{mid}</span>
	<span style={{fontFamily: MONO, fontSize: 40, letterSpacing: 4, fontWeight: 700, color: INK}}>{rr}</span></div>;};
const FullVid: React.FC<{t: number; a: number; s0: number; s1: number}> = ({t, a, s0, s1}) => {const f = useCurrentFrame(); const start = f - Math.round((t - a) * 30); return <AbsoluteFill style={{background: '#000'}}>{t >= a - 0.05 && <Sequence from={start} layout="none"><OffthreadVideo src={staticFile('kvara/clip.mp4')} startFrom={Math.round(s0 * 30)} endAt={Math.round(s1 * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>}</AbsoluteFill>;};
const VNB_: Dot[] = [[34, 6], [54, 20], [41, 18], [27, 18], [14, 20], [44, 30], [24, 30], [58, 38], [34, 34], [10, 38], [34, 46]].map(([x, y]) => ({x, y, c: RED}));
const BEB_: Dot[] = [[34, 99], [56, 70], [42, 82], [26, 82], [12, 70], [40, 62], [28, 62], [60, 50], [34, 54], [8, 50], [34, 44]].map(([x, y]) => ({x, y, c: INK}));

const GeoFlag: React.FC<{x: number; y: number; w: number; t: number; a: number}> = ({x, y, w, t, a}) => {const u = E(t, a, a + 0.35, Easing.out(Easing.back(2))); const h = w * 2 / 3; const c = (cx: number, cy: number, s: number) => <g key={cx + '-' + cy}><rect x={cx - s * 0.12} y={cy - s / 2} width={s * 0.24} height={s} fill="#E8112D" /><rect x={cx - s / 2} y={cy - s * 0.12} width={s} height={s * 0.24} fill="#E8112D" /></g>;
	return <svg width={w} height={h} style={{position: 'absolute', left: x, top: y, opacity: Math.min(1, u), transform: `scale(${u}) rotate(-3deg)`, filter: 'drop-shadow(6px 8px 0 rgba(0,0,0,.25))', zIndex: 5}}><rect width={w} height={h} fill="#fff" /><rect x={w * 0.43} width={w * 0.14} height={h} fill="#E8112D" /><rect y={h * 0.4} width={w} height={h * 0.2} fill="#E8112D" />{[[w * 0.215, h * 0.2], [w * 0.785, h * 0.2], [w * 0.215, h * 0.8], [w * 0.785, h * 0.8]].map(([cx, cy]) => c(cx, cy, h * 0.22))}</svg>;};
const Tag: React.FC<{x: number; y: number; t: number; a: number; n: string; c?: string; size?: number}> = ({x, y, t, a, n, c = INK, size = 34}) => <Club x={x} y={y} t={t} a={a} name={n} c={c} size={size} />;
const Magnifier: React.FC<{x: number; y: number; s?: number; t: number; a: number}> = ({x, y, s = 1, t, a}) => {const u = E(t, a, a + 0.8, Easing.inOut(Easing.cubic)); return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', zIndex: 7}}><g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={INK} strokeLinecap="round"><circle r={110} strokeWidth={14} pathLength={1} strokeDasharray={`${u} 1`} transform="rotate(-90)" /><path d="M 78 78 L 190 190" strokeWidth={28} pathLength={1} strokeDasharray={`${E(t, a + 0.5, a + 0.9)} 1`} /></g></svg>;};
const XRay: React.FC<{x: number; y: number; R: number; t: number; a: number; pulse: number}> = ({x, y, R, t, a, pulse}) => {const u = E(t, a, a + 0.5, Easing.out(Easing.back(1.4))); return <div style={{position: 'absolute', left: x - R, top: y - R, width: 2 * R, height: 2 * R, borderRadius: '50%', overflow: 'hidden', background: '#000', transform: `scale(${u})`, zIndex: 4, boxShadow: '8px 10px 0 rgba(0,0,0,.25)'}}><Img src={staticFile('kvara/knee_bones.jpg')} style={{position: 'absolute', width: 2 * R, height: 2 * R, objectFit: 'cover'}} /><svg width={2 * R} height={2 * R} style={{position: 'absolute', left: 0, top: 0}}><path d={`M ${R * 0.8} ${R * 0.8} L ${R * 1.2} ${R * 1.2}`} stroke={RED} strokeWidth={16} fill="none" strokeLinecap="round" opacity={E(t, pulse, pulse + 0.2) * (0.55 + 0.45 * Math.sin(t * 8))} /></svg></div>;};
const KH = 550, KX = 545, KY = 1350;
const Lens: React.FC<{t: number; a: number; pulse: number}> = ({t, a, pulse}) => {
	const u = E(t, a, a + 1.1, Easing.inOut(Easing.cubic)); if (t < a - 0.05) return null;
	const x = lerp(1250, KX, u), y = lerp(500, KY, u), Rr = 190, z = 2.2;
	return <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, zIndex: 6}}>
		<div style={{position: 'absolute', left: x - Rr, top: y - Rr, width: 2 * Rr, height: 2 * Rr, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(0.5px)'}}>
			<Img src={staticFile('kvara/kv_injury.png')} style={{position: 'absolute', width: KH * 1407 / 768 * z, height: KH * z, left: Rr - (x - (585 - KH * 1407 / 768 / 2)) * z, top: Rr - (y - (1700 - KH)) * z, opacity: 0.55}} />
			<Img src={staticFile('kvara/knee_bones.jpg')} style={{position: 'absolute', left: 0, top: 0, width: 2 * Rr, height: 2 * Rr, objectFit: 'cover', mixBlendMode: 'multiply', filter: 'invert(1) contrast(1.3)', opacity: E(t, a + 0.7, a + 1.2) * 0.85}} />
			<svg width={2 * Rr} height={2 * Rr} style={{position: 'absolute', left: 0, top: 0}}><path d={`M ${Rr * 0.82} ${Rr * 0.82} L ${Rr * 1.18} ${Rr * 1.18}`} stroke={RED} strokeWidth={16} strokeLinecap="round" opacity={E(t, pulse, pulse + 0.2) * (0.55 + 0.45 * Math.sin(t * 8))} /><path d={`M ${Rr * 0.45} ${Rr * 0.35} A ${Rr * 0.8} ${Rr * 0.8} 0 0 1 ${Rr * 1.0} ${Rr * 0.2}`} stroke="rgba(255,255,255,.7)" strokeWidth={12} fill="none" strokeLinecap="round" /></svg>
		</div>
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><circle cx={x} cy={y} r={Rr} stroke={INK} strokeWidth={16} fill="none" /><path d={`M ${x + Rr * 0.72} ${y + Rr * 0.72} L ${x + Rr * 1.6} ${y + Rr * 1.6}`} stroke={INK} strokeWidth={34} strokeLinecap="round" /></svg>
	</div>;};
const NAP = '#2b7bbf', PSGC = '#1a2a4f';
const SHOTS: Shot[] = [
	{i: 0, trans: 'cut', C: (t, R) => <Paper>
		<S x={80} y={240} t={t} a={0.1} size={60} w={920}>Có người được nhớ vì <B c={RED}>bàn thắng</B></S>
		<Fig n="kv_goal" x={540} y={1860} h={1150} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 1, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={56} w={920}>Có người cầm bóng là hậu vệ <B c={RED}>xin thay người</B></S>
		<Fig n="defender_dizzy" x={300} y={1820} h={850} t={t} a={0.15} from="left" />
		<Fig n="kv_dribble" x={760} y={1860} h={1050} t={t} a={R(1, 0.4)} from="right" />
	</Paper>},
	{i: 2, trans: 'up', C: (t, R) => <Paper>
		<Name x={80} y={240} t={t} a={0.1} n="KHVICHA KVARATSKHELIA" sub="PSG · GEORGIA" />
		<Fig n="kv_psg" x={540} y={1880} h={1200} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 3, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={64} w={920}>Kva·rats·khe·lia</S>
		<S x={80} y={330} t={t} a={R(3, 0.5)} size={48} w={920} c={RED}>(bình luận viên: <B>lấy hơi lần 2</B>)</S>
		<Fig n="kv_psg" x={540} y={1880} h={1050} t={t} a={0.1} />
	</Paper>},
	{i: 4, trans: 'left', C: (t, R) => <Paper>
		<Stamp x={80} y={240} t={t} a={0.1} text="HÀNH LANG TRÁI" />
		<S x={80} y={380} t={t} a={R(4, 0.5)} size={52} w={920}>Hậu vệ: <B c={RED}>một ngày rất dài</B></S>
		<Fig n="defender_dizzy" x={540} y={1860} h={1050} t={t} a={0.2} from="up" />
	</Paper>},
	{i: 5, trans: 'up', C: (t, R) => <Paper>
		<GeoFlag x={80} y={220} w={220} t={t} a={0.1} />
		<S x={340} y={240} t={t} a={0.2} size={56} w={680}>Sinh 2001, <B c={RED}>Georgia</B></S>
		<S x={80} y={420} t={t} a={R(5, 0.5)} size={46} w={920}>Không phải thần đồng ai cũng săn</S>
		<Fig n="kv_young" x={540} y={1880} h={1050} t={t} a={0.15} from="up" />
	</Paper>},
	{i: 6, trans: 'left', C: (t, R) => <Paper>
		<Tag x={80} y={240} t={t} a={R(6, 0.35)} n="RUBIN KAZAN" />
		<Tag x={420} y={340} t={t} a={R(6, 0.55)} n="DINAMO BATUMI" c={BLUE} />
		<Fig n="kv_young" x={540} y={1880} h={1000} t={t} a={0.1} />
	</Paper>},
	{i: 7, trans: 'up', C: (t, R) => <Paper>
		<Tag x={80} y={300} t={t} a={0.1} n="NAPOLI" c={NAP} size={60} />
		<Fig n="kv_napoli" x={540} y={1880} h={1150} t={t} a={0.15} from="up" />
	</Paper>},
	{i: 8, trans: 'left', C: (t, R) => <Paper>
		<Stamp x={80} y={240} t={t} a={0.1} text="HÈ 2022 · ITALIA" />
		<S x={80} y={400} t={t} a={R(8, 0.55)} size={56} w={920}>Một <B c={RED}>cơn địa chấn</B></S>
		<Fig n="kv_napoli" x={540} y={1880} h={1050} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 9, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={170} t={t} a={0.1} size={50} w={920}>Cơn ác mộng của <B c={RED}>Serie A</B></S>
		<Vid t={t} a={0.15} s0={5.7} s1={10.3} y={290} cap="NAPOLI · KVARA SỐ 77" />
	</Paper>},
	{i: 10, trans: 'up', C: (t, R) => <Paper>
		<Card x={80} y={240} t={t} a={0.1} top="OSIMHEN" main="Chạy như xe đua" c={INK} />
		<Card x={480} y={420} t={t} a={R(10, 0.5)} top="KVARA" main="Bóng dính nam châm" c={RED} />
		<Fig n="osimhen" x={300} y={1860} h={1000} t={t} a={0.1} />
		<Fig n="kv_dribble" x={780} y={1880} h={1050} t={t} a={R(10, 0.5)} from="right" />
	</Paper>},
	{i: 11, trans: 'left', C: (t, R) => <Paper>
		<Count t={t} a={0.2} to={33} y={200} suffix=" năm" />
		<Stamp x={80} y={520} t={t} a={R(11, 0.5)} text="VÔ ĐỊCH SERIE A" />
		<Card x={460} y={640} t={t} a={R(11, 0.75)} top="SERIE A 2022-23" main="Cầu thủ hay nhất" c={NAP} />
		<Fig n="kv_scudetto" x={540} y={1880} h={1000} t={t} a={0.15} from="up" />
	</Paper>},
	{i: 12, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={260} t={t} a={R(12, 0.55)} size={110} w={920} c={RED}><B>Kvaradona</B></S>
		<Fig n="kv_scudetto" x={540} y={1880} h={1150} t={t} a={0.1} />
	</Paper>},
	{i: 13, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Đứng cạnh <B c={RED}>Maradona</B>?</S>
		<S x={80} y={340} t={t} a={R(13, 0.6)} size={44} w={920}>Mặc áo Napoli <B>chưa đủ</B> đâu</S>
		<Fig n="kv_napoli" x={540} y={1880} h={1050} t={t} a={0.1} />
	</Paper>},
	{i: 14, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={240} t={t} a={0.1} size={58} w={920}>Không chỉ là <B c={RED}>tốc độ</B></S>
		<Fig n="kv_dribble" x={540} y={1880} h={1150} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 15, trans: 'left', C: (t, R) => <Paper>
		<Vid t={t} a={0.1} s0={0} s1={5.5} y={260} out={5.35} cap="NHẤP NHẢ · LẮC VAI · TĂNG TỐC" />
		<Stamp x={560} y={140} t={t} a={R(15, 0.75)} text="TĂNG TỐC!" />
	</Paper>},
	{i: 16, trans: 'up', C: (t, R) => <Paper>
		<Pitch t={t} a={0.1} top={380} dots={[{x: 14, y: 60, c: RED, n: 'KVARA'}, {x: 20, y: 66, c: INK}]} label="MINH HOẠ · HÀNH LANG TRÁI">
			<PLine pts={[[14, 60], [24, 64], [20, 72]]} t={t} a={R(16, 0.15)} c={RED} dash="4 10" w={6} />
			<PLine pts={[[20, 72], [8, 80]]} t={t} a={R(16, 0.4)} c={RED} dash="4 10" w={6} />
			<PLine pts={[[8, 80], [12, 86], [26, 92]]} t={t} a={R(16, 0.7)} c={RED} dash="4 10" w={6} />
		</Pitch>
		<S x={80} y={220} t={t} a={0.1} size={50} w={920}>Vào trong? <B c={RED}>Ra ngoài</B>. Ra biên? <B c={RED}>Cắt vào</B></S>
	</Paper>},
	{i: 17, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Phòng ngự… hay <B c={RED}>học nhảy hiện đại</B>?</S>
		<Fig n="defender_dizzy" x={540} y={1880} h={1150} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 18, trans: 'up', C: (t, R) => <Paper>
		<Stamp x={80} y={240} t={t} a={0.1} text="THUẬN CẢ 2 CHÂN" />
		<S x={80} y={400} t={t} a={R(18, 0.55)} size={50} w={920}>Đoán xem <B c={RED}>chân nào</B>?</S>
		<Fig n="kv_dribble" x={540} y={1880} h={1100} t={t} a={0.1} />
	</Paper>},
	{i: 19, trans: 'left', C: (t, R) => <Paper>
		<Stamp x={80} y={240} t={t} a={0.1} text="THÁNG 1/2025" />
		<Tag x={80} y={400} t={t} a={R(19, 0.4)} n="PARIS SAINT-GERMAIN" c={PSGC} size={44} />
		<Fig n="kv_psg" x={540} y={1880} h={1150} t={t} a={0.15} from="up" />
	</Paper>},
	{i: 20, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Đội hình toàn sao: <B c={RED}>có lọt nổi?</B></S>
		<Fig n="kv_psg" x={540} y={1880} h={1100} t={t} a={0.1} />
	</Paper>},
	{i: 21, trans: 'up', C: (t, R) => <Paper>
		<Stamp x={80} y={240} t={t} a={0.1} text="CÚ ĂN BA" />
		<S x={80} y={400} t={t} a={R(21, 0.55)} size={50} w={920}>Vô địch <B c={RED}>Champions League</B></S>
		<Fig n="kv_ucl" x={540} y={1880} h={1150} t={t} a={0.15} from="up" />
	</Paper>},
	{i: 22, trans: 'left', C: (t, R) => <Paper>
		<Board t={t} a={0.1} y={240} l="PSG" r="INTER" mid="5–0" />
		<Stamp x={300} y={460} t={t} a={R(22, 0.55)} text="KVARA GHI BÀN" />
		<Fig n="kv_goal" x={540} y={1880} h={1050} t={t} a={0.2} from="up" />
	</Paper>},
	{i: 23, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={200} t={t} a={0.1} size={48} w={920}>Champions League 2025-26</S>
		<Stat x={80} y={320} w={920} label="Bàn thắng" val="10" t={t} a={R(23, 0.35)} />
		<Stat x={80} y={470} w={920} label="Kiến tạo" val="6" t={t} a={R(23, 0.5)} c={RED} />
		<Fig n="kv_ucl" x={540} y={1880} h={950} t={t} a={R(23, 0.75)} from="up" />
	</Paper>},
	{i: 24, trans: 'left', C: (t, R) => <Paper>
		<Card x={80} y={220} t={t} a={0.1} top="UEFA · 2025-26" main="Cầu thủ hay nhất C1" c={RED} />
		<Card x={80} y={400} t={t} a={R(24, 0.6)} top="QUẢ BÓNG VÀNG 2026" main="Hạng 6" c={GOLD} />
		<Fig n="kv_psg" x={700} y={1880} h={1050} t={t} a={0.1} from="right" />
	</Paper>},
	{i: 25, trans: 'up', C: (t, R) => <Paper>
		<Count t={t} a={0.1} to={25} y={220} suffix=" tuổi" />
		<S x={80} y={520} t={t} a={R(25, 0.5)} size={52} w={920}>Như <B c={GREEN}>diều gặp gió</B></S>
		<Fig n="kv_goal" x={540} y={1880} h={1000} t={t} a={0.1} />
	</Paper>},
	{i: 26, trans: 'cut', C: (t, R) => <Paper>
		<S x={80} y={700} t={t} a={0.1} size={72} w={920}>Nhưng bóng đá <B c={RED}>nghiệt ngã</B>…</S>
	</Paper>},
	{i: 27, trans: 'left', C: (t, R) => <Paper>
		<Board t={t} a={0.1} y={220} l="PSG" r="BARCELONA" mid="4–2" />
		<Stamp x={80} y={440} t={t} a={R(27, 0.6)} text="20/10/2026" />
		<Fig n="kv_injury" x={540} y={1800} h={700} t={t} a={R(27, 0.6)} from="up" />
	</Paper>},
	{i: 28, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={200} t={t} a={0.1} size={48} w={920} out={R(29, 0)}>Không va chạm. <B>Không triệt hạ.</B></S>
		<S x={80} y={300} t={t} a={R(28, 0.6)} size={56} w={920} out={R(29, 0)}>Chỉ một cú <B c={RED}>xoay người</B></S>
		<Stat x={80} y={420} w={920} label="Ca đứt dây chằng không va chạm / va chạm gián tiếp" val="~85%" t={t} a={R(28, 0.75)} c={RED} out={R(29, 0)} />
		<Src x={80} y={600} t={t} a={R(28, 0.75)} out={R(29, 0)}>Waldén và cs. · British Journal of Sports Medicine 2015</Src>
		<S x={80} y={220} t={t} a={R(29, 0.1)} size={60} w={920} c={RED}><B>Đứt dây chằng chéo trước</B></S>
		<S x={80} y={310} t={t} a={R(29, 0.45)} size={44} w={920}>sợi dây giữ khớp gối khỏi xoay trượt</S>
		<Vid t={t} a={0.1} s0={26.7} s1={31.3} y={700} w={560} x={260} out={R(28, 0.72)} cap="PSG – BARCELONA · 20/10" />
		<Fig n="kv_injury" x={585} y={1700} h={KH} t={t} a={R(28, 0.72)} from="up" />
		<Lens t={t} a={R(29, 0)} pulse={R(29, 0.4)} />
	</Paper>},
	{i: 30, trans: 'left', C: (t, R) => <Paper>
		<Card x={80} y={240} t={t} a={0.1} top="27/10 · DOHA" main="Phẫu thuật thành công" c={GREEN} />
		<Fig n="kv_rehab" x={540} y={1880} h={1100} t={t} a={0.2} from="up" />
	</Paper>},
	{i: 31, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Học lại <B c={RED}>từng bước chạy</B></S>
		<Fig n="kv_rehab" x={540} y={1880} h={1150} t={t} a={0.1} />
	</Paper>},
	{i: 32, trans: 'cut', C: (t, R) => <Paper>
		<S x={80} y={700} t={t} a={0.1} size={70} w={920}>Đây mới là điều <B c={RED}>đáng sợ nhất</B></S>
	</Paper>},
	{i: 33, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={R(33, 0.45)} size={52} w={920}>Như con chim <B c={RED}>không được bay</B></S>
		<Fig n="kv_rehab" x={540} y={1880} h={1050} t={t} a={0.1} dim={0.2} />
	</Paper>},
	{i: 34, trans: 'up', C: (t, R) => <Paper>
		<GeoFlag x={80} y={220} w={160} t={t} a={0.1} />
		<S x={280} y={230} t={t} a={0.2} size={48} w={740}>→ <B c={RED}>đỉnh châu Âu</B></S>
		<Fig n="kv_young" x={250} y={1860} h={650} t={t} a={0.1} from="left" />
		<Fig n="kv_ucl" x={660} y={1880} h={1350} t={t} a={R(34, 0.4)} from="right" />
	</Paper>},
	{i: 35, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={260} t={t} a={0.1} size={60} w={920}>Câu chuyện <B c={GREEN}>chưa kết thúc</B></S>
		<Stat x={80} y={460} w={920} label="Cầu thủ vẫn đá đỉnh cao 3 năm sau ca đứt dây chằng" val="2/3" t={t} a={0.3} c={GREEN} />
		<Src x={80} y={700} t={t} a={0.3}>Waldén và cs. · BJSM 2016 · 78 CLB châu Âu</Src>
		<Fig n="kv_rehab" x={540} y={1880} h={950} t={t} a={0.2} from="up" />
	</Paper>},
	{i: 36, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={R(36, 0.5)} size={56} w={920}>Kvaradona <B c={RED}>trở lại</B>?</S>
		<Fig n="kv_dribble" x={540} y={1880} h={1100} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 37, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={54} w={920}>Trở lại <B c={GREEN}>đỉnh cao</B>…</S>
		<Fig n="kv_goal" x={540} y={1880} h={1050} t={t} a={0.1} />
	</Paper>},
	{i: 38, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={54} w={920}>…hay <B c={RED}>rẽ sang hướng khác</B>?</S>
		<Stamp x={300} y={420} t={t} a={R(38, 0.6)} text="BÌNH LUẬN NHÉ" />
		<Fig n="kv_rehab" x={540} y={1880} h={1050} t={t} a={0.1} />
	</Paper>},
];

const Trans: React.FC<{kind: Shot['trans']; u: number; isIn: boolean; children: React.ReactNode}> = ({kind, u, isIn, children}) => {
	let tr = '';
	if (kind === 'left') tr = isIn ? `translateX(${(1 - u) * W}px)` : `translateX(${-u * W}px)`;
	if (kind === 'up') tr = isIn ? `translateY(${(1 - u) * H}px)` : `translateY(${-u * H}px)`;
	const blur = (kind === 'left' || kind === 'up') ? Math.sin(u * Math.PI) * 10 : 0;
	return <AbsoluteFill style={{transform: tr, filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>;
};
export const SHOT_STARTS = SHOTS.map((s) => [s.i, s.trans] as const);
export const KVARAVideo: React.FC = () => {
	const f = useCurrentFrame(), t = f / 30, D = KVARA_DUR;
	const TD = 0.45;
	const starts = SHOTS.map((s) => (s.i === 0 ? 0 : T[s.i][0] - 0.12));
	let k = 0; while (k < SHOTS.length - 1 && t >= starts[k + 1]) k++;
	const cur = SHOTS[k], nxt = SHOTS[k + 1];
	const a0 = starts[k], a1 = nxt ? starts[k + 1] : D - 3;
	const inTrans = nxt && (nxt.trans === 'left' || nxt.trans === 'up') && t > a1 - TD;
	const u = inTrans ? E(t, a1 - TD, a1, Easing.inOut(Easing.cubic)) : 0;
	const mk = (sh: Shot, s0: number, s1: number) => sh.C(t - s0, (i, fr = 0) => r(i, fr) - s0, s1 - s0);
	const s2 = nxt && k + 2 < SHOTS.length ? starts[k + 2] : D;
	return <AbsoluteFill style={{background: '#e9e9e7'}}>
		<svg width={0} height={0} style={{position: 'absolute'}}><defs><filter id="rough"><feTurbulence baseFrequency="0.03" numOctaves="2" seed="4" /><feDisplacementMap in="SourceGraphic" scale="10" /></filter></defs></svg>
		<AbsoluteFill style={{transform: `translate(${Math.sin(t * 1.2) * 4 + (k % 2 ? 1 : -1) * (((t - a0) / Math.max(1, a1 - a0)) - 0.5) * 50}px,${Math.cos(t * 0.9) * 4 + (k % 3 === 0 ? -1 : 0) * ((t - a0) / Math.max(1, a1 - a0)) * 30}px) scale(${1.02 + 0.06 * ((t - a0) / Math.max(1, a1 - a0))})`}}>
			<Trans kind={nxt?.trans ?? 'cut'} u={u} isIn={false}>{mk(cur, a0, a1)}</Trans>
			{inTrans && nxt && <Trans kind={nxt.trans} u={u} isIn>{mk(nxt, a1, s2)}</Trans>}
		</AbsoluteFill>
		<Img src={staticFile('mu/logo.png')} style={{position: 'absolute', right: 36, top: 30, width: 92, height: 92, borderRadius: '50%', opacity: 0.92 * (1 - E(t, D - 3.2, D - 2.9)), filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.35))'}} />
		<AbsoluteFill style={{opacity: E(t, D - 3.2, D - 2.8)}}><Paper>
			<Img src={staticFile('mu/logo.png')} style={{position: 'absolute', left: 540 - 230, top: 960 - 330, width: 460, height: 460, borderRadius: '50%', transform: `scale(${lerp(0.6, 1, E(t, D - 3.0, D - 2.3, Easing.out(Easing.back(1.6))))}) rotate(${lerp(-8, 0, E(t, D - 3.0, D - 2.3))}deg)`, filter: 'drop-shadow(10px 14px 0 rgba(0,0,0,.25))'}} />
			<div style={{position: 'absolute', top: 1220, width: 1080, textAlign: 'center', fontFamily: SERIF, fontSize: 44, color: INK, opacity: E(t, D - 2.2, D - 1.8)}}>Đăng ký để không bỏ lỡ <b style={{fontStyle: 'italic', color: RED}}>bên kia bảng tỷ số</b></div>
		</Paper></AbsoluteFill>
		<div style={{position: 'absolute', right: 30, bottom: 120, fontFamily: MONO, fontSize: 16, color: '#888', opacity: E(t, D - 9, D - 8.5) * (1 - E(t, D - 3.2, D - 3))}}>hình minh hoạ · nguồn: UEFA, Reuters, PSG, BJSM</div>
		<AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'multiply'}}><Img src={staticFile(`tex/noise${Math.floor(f / 3) % 4}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
		<AbsoluteFill style={{background: '#000', opacity: E(t, D - 0.6, D - 0.05)}} />
		<Audio src={staticFile('kvara/mix.wav')} />
	</AbsoluteFill>;
};
