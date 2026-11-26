import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame, Easing, OffthreadVideo, Sequence} from 'remotion';
import SIZES from './npz_sizes.json';
import '@fontsource/playfair-display/vietnamese-400.css';
import '@fontsource/playfair-display/latin-400.css';
import '@fontsource/playfair-display/vietnamese-700-italic.css';
import '@fontsource/playfair-display/latin-700-italic.css';
import '@fontsource/jetbrains-mono/vietnamese-400.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/vietnamese-700.css';
import '@fontsource/jetbrains-mono/latin-700.css';

// 90+ · Nico Paz: 9 triệu hay 80 triệu? (9:16)
const SPD = 1.15;
const T0 = [[0.0, 0.87], [1.19, 4.96], [5.28, 6.15], [6.47, 10.47], [10.79, 15.25], [15.57, 20.91], [21.23, 25.0], [25.32, 28.63], [28.95, 33.01], [33.33, 38.01], [38.33, 41.08], [41.4, 46.2], [46.52, 50.99], [51.31, 54.21], [54.53, 58.02], [58.34, 60.86], [61.18, 63.08], [63.4, 64.36], [64.68, 67.68], [68.0, 71.12], [71.44, 73.32], [73.64, 76.02], [76.34, 79.47], [79.79, 81.56], [81.88, 85.98], [86.3, 90.81], [91.13, 93.27], [93.59, 95.26], [95.58, 97.5], [97.82, 102.23], [102.55, 107.26], [107.58, 110.34], [110.66, 115.38], [115.7, 117.71], [118.03, 122.13], [122.45, 127.22], [127.54, 130.8], [131.12, 133.2], [133.52, 135.34], [135.66, 137.02], [137.34, 140.21], [140.53, 142.41], [142.73, 147.4], [147.72, 152.47], [152.79, 156.23], [156.55, 164.37]];
const T = T0.map(([a, b]) => [a / SPD, b / SPD]);
export const NPZ_DUR = Math.round((164.37 / SPD + 3.6) * 30) / 30;
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
	<Img src={staticFile(`npz/bg_${n}.jpg`)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.38, mixBlendMode: 'multiply', filter: 'contrast(1.1)', transformOrigin: '30% 30%', transform: `scale(${1.16 + 0.06 * (t / Math.max(d, 1))}) translateX(${-20 * t / Math.max(d, 1)}px)`}} />
	<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(233,233,231,.9) 0%, rgba(233,233,231,.25) 45%, transparent 70%)'}} />{children}</Paper>;
const Fig: React.FC<{n: string; x: number; y: number; h: number; t: number; a: number; crop?: number; flip?: boolean; from?: 'left' | 'right' | 'up' | 'none'; out?: number; dim?: number; shake?: number; ghost?: boolean; drop?: number}> = ({n, x, y, h, t, a, crop = 1, flip, from = 'none', out = 1e9, dim = 0, shake = 0, ghost = true, drop}) => {
	const [w0, h0] = SIZE[n]; const w = (w0 / h0) * h;
	const u = E(t, a, a + 0.55);
	const o = 1 - E(t, out, out + 0.35, Easing.in(Easing.cubic));
	const dx = from === 'left' ? -700 * (1 - u) : from === 'right' ? 700 * (1 - u) : 0;
	const dy = from === 'up' ? -300 * (1 - u) : 0;
	const vis = h * crop, g = h * 0.019;
	const rot = drop !== undefined ? 90 * E(t, drop, drop + 0.45, Easing.in(Easing.quad)) : 0;
	const im = (gh: boolean) => <Img src={staticFile(`npz/${n}.png`)} style={{position: 'absolute', left: gh ? -g : 0, top: gh ? g * 0.15 : 0, width: w, height: h, transform: flip ? 'scaleX(-1)' : undefined, filter: gh ? 'grayscale(1) brightness(.35)' : dim ? `brightness(${1 - dim}) grayscale(${dim})` : undefined, opacity: gh ? 0.35 : 1}} />;
	const breathe = 1 + 0.008 * Math.sin(t * 1.3 + x);
	return <div style={{position: 'absolute', left: x - w / 2 + dx, top: y - vis + dy, width: w, height: vis, overflow: crop < 1 ? 'hidden' : 'visible', zIndex: 2, transformOrigin: '50% 100%', transform: `${shake ? `rotate(${Math.sin(t * 31) * shake * 2.2}deg) translateX(${Math.sin(t * 47) * shake * 7}px)` : ''} rotate(${rot}deg) scale(${breathe})`, opacity: Math.min(1, u * 1.4) * o, WebkitMaskImage: crop < 1 ? 'linear-gradient(to bottom, #000 82%, transparent)' : undefined}}>
		{ghost && im(true)}{im(false)}
	</div>;
};
const Circle: React.FC<{x: number; y: number; r: number; c: string; t: number; a: number; out?: number}> = ({x, y, r: rr, c, t, a, out = 1e9}) => {const u = E(t, a, a + 0.5, Easing.out(Easing.back(1.4))) * (1 - E(t, out, out + 0.3)); return <div style={{position: 'absolute', left: x - rr, top: y - rr, width: 2 * rr, height: 2 * rr, borderRadius: '50%', background: c, transform: `scale(${u})`, filter: 'url(#rough)'}} />;};
const Ground: React.FC<{y: number; t: number; a: number; c?: string}> = () => null;
const S: React.FC<{x: number; y: number; t: number; a: number; size?: number; c?: string; out?: number; align?: 'left' | 'center' | 'right'; w?: number; children: React.ReactNode}> = ({x, y, t, a, size = 60, c = INK, out = 1e9, align = 'left', w = 800, children}) => {
	const u = E(t, a, a + 0.45), o = 1 - E(t, out, out + 0.3);
	const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
	return <div style={{position: 'absolute', left, top: y, width: w, textAlign: align, fontFamily: SERIF, fontSize: size, color: c, lineHeight: 1.2, opacity: u * o, transform: `translateY(${(1 - u) * 18}px)`}}>{children}</div>;
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
			{t >= a - 0.05 && <Sequence from={start} layout="none"><OffthreadVideo src={staticFile('npz/clip.mp4')} startFrom={Math.round(s0 * 30)} endAt={Math.round(s1 * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>}
		</div>
		{cap && <div style={{position: 'absolute', left: 14, bottom: -70, fontFamily: MONO, fontSize: 26, letterSpacing: 3, color: INK}}>{cap}</div>}
	</div>;
};
const Score: React.FC<{t: number; a: number; y?: number}> = ({t, a, y = 260}) => {const u = E(t, a, a + 0.35, Easing.out(Easing.back(1.8))); return <div style={{position: 'absolute', left: 80, top: y, width: 920, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf8f2', borderTop: `8px solid ${INK}`, padding: '20px 30px', boxShadow: '10px 12px 0 rgba(0,0,0,.2)', opacity: Math.min(1, u), transform: `scale(${lerp(0.9, 1, u)})`, zIndex: 4}}>
	<span style={{fontFamily: MONO, fontSize: 34, letterSpacing: 4, fontWeight: 700, color: '#2b7bbf'}}>ARGENTINA</span>
	<span style={{fontFamily: MONO, fontSize: 84, fontWeight: 700, color: INK}}>7–0</span>
	<span style={{fontFamily: MONO, fontSize: 34, letterSpacing: 4, color: '#777'}}>COSTA RICA</span></div>;};
const SKY = '#2b7bbf', NAVY = '#1b2a52';
const PRICE = (v: number[]) => [{n: '€9M · ĐIỀU KHOẢN MUA LẠI', v: 9, c: RED}, {n: '€60M · GIÁ BÁN LẠI (THEO BÁO TÂY BAN NHA)', v: 60}, {n: '€80M · GIÁ MUA LẠI MỚI (THEO BÁO CHÍ)', v: 80, c: SKY}].filter((_, k) => v.includes(k));

const SHOTS: Shot[] = [
	{i: 0, trans: 'cut', C: (t) => <Paper>
		<Count t={t} a={0.05} to={9} y={640} size={300} suffix=" triệu €" />
		<S x={540} y={1150} t={t} a={0.4} size={50} align="center" w={960}>Nico Paz</S>
	</Paper>},
	{i: 1, trans: 'left', C: (t, R, d) => <Bg n="bernabeu" t={t} d={d}>
		<Club x={80} y={260} t={t} a={0.1} name="REAL MADRID" c={INK} />
		<S x={80} y={390} t={t} a={0.3} size={56} w={920}>Có thể <B c={RED}>mua lại</B> với €9M</S>
		<Fig n="paz_real" x={620} y={1500} h={1050} t={t} a={0.2} from="right" />
		<Stamp x={140} y={1300} t={t} a={R(2, 0.1)} text="KHÔNG MUA" />
	</Bg>},
	{i: 3, trans: 'up', C: (t, R, d) => <Bg n="cordoba" t={t} d={d}>
		<Score t={t} a={R(4, 0)} y={240} />
		<Stat x={80} y={240} w={920} label="Bàn 1" val="phút 8" t={t} a={0.3} out={R(4, 0) - 0.3} />
		<Stat x={80} y={380} w={920} label="Bàn 2" val="phút 38" t={t} a={0.9} out={R(4, 0) - 0.3} />
		<Fig n="paz_arg" x={540} y={1500} h={900} t={t} a={0.2} from="up" />
		<S x={80} y={470} t={t} a={R(4, 0.5)} size={50} w={920}>Trận đầu thời <B c={SKY}>hậu Messi</B></S>
	</Bg>},
	{i: 5, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={240} t={t} a={0.1} size={60} w={920}>Nico Paz là <B c={RED}>ai</B>?</S>
		<Bars t={t} a={R(5, 0.5)} top={500} max={85} rows={[PRICE([0])[0], PRICE([2])[0]]} unit="22 TUỔI" />
		<S x={80} y={800} t={t} a={R(5, 0.6)} size={120} w={920}><B c={RED}>9</B> → <B c={SKY}>80</B></S>
		<Fig n="paz_como" x={760} y={1560} h={700} t={t} a={0.3} from="right" />
	</Paper>},
	{i: 6, trans: 'left', C: (t, R, d) => <Bg n="tenerife" t={t} d={d}>
		<Club x={80} y={260} t={t} a={0.1} name="TENERIFE · QUẦN ĐẢO CANARY" c={RED} size={34} />
		<Name x={80} y={420} t={t} a={R(7, 0)} n="Nico Paz" sub="sinh 8/9/2004 · mẹ người Tây Ban Nha" />
		<Fig n="paz_real" x={720} y={1500} h={900} t={t} a={R(7, 0.1)} from="up" dim={0.1} />
	</Bg>},
	{i: 8, trans: 'up', C: (t, R) => <Paper>
		<Clip x={90} y={260} w={900} t={t} a={0.1} src="bố: Pablo Paz">Trung vệ <B c={SKY}>Argentina</B><br />World Cup <B>1998</B></Clip>
		<S x={80} y={620} t={t} a={R(9, 0)} size={56} w={920}>Hai lựa chọn</S>
		{(['TÂY BAN NHA', 'ARGENTINA'] as const).map((n, k) => {const on = k === 1 ? E(t, R(9, 0.6), R(9, 0.8)) : 1 - E(t, R(9, 0.6), R(9, 0.8)) * 0.6; return <div key={k} style={{position: 'absolute', left: 100 + k * 470, top: 780, width: 440, whiteSpace: 'nowrap', opacity: on, transform: `scale(${1 + 0.15 * (k === 1 ? on : 0)})`}}><Club x={0} y={0} t={t} a={R(9, 0.1 + k * 0.15)} name={n} c={k ? SKY : '#9a9a98'} /></div>;})}
		<Fig n="paz_arg" x={540} y={1560} h={600} t={t} a={R(9, 0.7)} from="up" />
	</Paper>},
	{i: 10, trans: 'left', C: (t, R, d) => <Bg n="bernabeu" t={t} d={d}>
		<Club x={80} y={260} t={t} a={0.1} name="REAL MADRID · 2016" c={INK} size={36} />
		<S x={80} y={390} t={t} a={R(11, 0)} size={52} w={920}>Đội một <B>23/24</B></S>
		<S x={80} y={480} t={t} a={R(11, 0.5)} size={50} w={920}>Chỗ cho số 10 trẻ: <B c={RED}>gần như không</B></S>
		<Fig n="paz_real" x={540} y={1500} h={lerp(1000, 760, E(t, R(11, 0.5), R(11, 0.9)))} t={t} a={0.2} dim={E(t, R(11, 0.5), R(11, 0.9)) * 0.4} from="up" />
		<Club x={80} y={640} t={t} a={R(12, 0.2)} name="→ COMO · 8/2024" c={NAVY} size={40} />
	</Bg>},
	{i: 13, trans: 'up', C: (t, R) => <Paper>
		<Fig n="contract" x={540} y={1560} h={1000} t={t} a={0.1} from="up" ghost={false} />
		<Clip x={90} y={280} w={900} t={t} a={0.3} src="real madrid → como">Điều khoản <B c={RED}>mua lại</B><br />giá rất rẻ</Clip>
		<Arrow id="ct" x1={300} y1={560} x2={520} y2={900} bend={0.3} t={t} a={0.8} c={RED} />
	</Paper>},
	{i: 14, trans: 'left', C: (t, R, d) => <Bg n="como" t={t} d={d}>
		<Club x={80} y={240} t={t} a={0.1} name="COMO" c={NAVY} />
		<Stamp x={600} y={260} t={t} a={R(14, 0.6)} text="SỐ 10" c={NAVY} />
		<Stat x={80} y={400} w={920} label="Mùa 1 · bàn / kiến tạo" val="6 / 9" t={t} a={R(15, 0.1)} />
		<Stat x={80} y={540} w={920} label="Mùa 2 · bàn" val="12" t={t} a={R(16, 0.1)} c={RED} />
		<Stamp x={640} y={680} t={t} a={R(16, 0.6)} text="× 2" />
		<Fig n="paz_como" x={540} y={1520} h={760} t={t} a={0.2} from="up" />
	</Bg>},
	{i: 17, trans: 'up', C: (t, R) => {
		const seg = [[0, 3], [3, 6], [6, 8.5], [10, 12.5]];
		const caps = ['RÊ BÓNG SÁT BIÊN', 'QUAY NGƯỜI · LAO LÊN', 'QUA NGƯỜI', 'TÌ ĐÈ'];
		const k = t < R(19, 0) ? 0 : t < R(20, 0) ? 1 : t < R(21, 0) ? 2 : 3;
		const a = [R(18, 0) - 0.1, R(19, 0), R(20, 0), R(21, 0)][k];
		return <Paper>
			<S x={80} y={180} t={t} a={0} size={58} w={920} out={R(18, 0) - 0.2}>Và đây là <B c={RED}>lý do</B></S>
			{t > R(18, 0) - 0.15 && <Vid key={k} t={t} a={a} s0={seg[k][0]} s1={seg[k][1]} y={200} w={720} x={180} cap={`${k + 1}/4 · ${caps[k]}`} />}
			<div style={{position: 'absolute', right: 30, bottom: 70, fontFamily: MONO, fontSize: 18, color: '#888'}}>clip minh hoạ</div>
		</Paper>;
	}},
	{i: 22, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={58} w={920}>Một số 10 <B c={RED}>hiện đại</B></S>
		<Bars t={t} a={0.4} top={420} max={10} rows={[{n: 'SÁNG TẠO', v: 9, c: RED}, {n: 'DẪN BÓNG', v: 8.5, c: RED}, {n: 'DỨT ĐIỂM', v: 8, c: RED}]} unit="MINH HOẠ · KHÔNG PHẢI SỐ LIỆU" />
		<Fig n="paz_dribble" x={540} y={1560} h={620} t={t} a={0.3} from="left" />
	</Paper>},
	{i: 23, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={58} w={920}>Con số <B c={RED}>leo thang</B></S>
		<Bars t={t} a={R(24, 0.2)} top={420} max={85} rows={PRICE(t > R(25, 0) ? [0, 1] : [0])} />
		<S x={80} y={720} t={t} a={R(25, 0.2)} size={46} w={920}>Mua về rồi <B>bán lại</B></S>
		<Stamp x={520} y={860} t={t} a={R(26, 0.3)} text="+€51M" />
		<S x={80} y={1100} t={t} a={R(27, 0.1)} size={64} w={920}>Nhưng rồi… <B c={RED}>bất ngờ</B></S>
	</Paper>},
	{i: 28, trans: 'zoom', C: (t, R) => <Paper>
		<FromCircle t={t} c={NAVY} x={600} y={1050} r={330} />
		<Fig n="paz_como" x={600} y={1520} h={1000} t={t} a={0.2} from="up" />
		<S x={80} y={230} t={t} a={0.3} size={58} w={920} out={R(29, 0)}>Chính Paz xin <B c={NAVY}>ở lại</B></S>
		<Clip x={80} y={220} w={920} t={t} a={R(29, 0)} src="Real Madrid · 30/6/2026" out={R(30, 0)}>Ở lại mùa <B>26/27</B><br />theo <B c={NAVY}>nguyện vọng cầu thủ</B></Clip>
		<Bars t={t} a={R(30, 0.3)} top={240} max={85} rows={PRICE([2])} />
		<Stamp x={120} y={1300} t={t} a={R(31, 0.3)} text="TỪ CHỐI BERNABÉU" />
	</Paper>},
	{i: 32, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={200} t={t} a={0.1} size={58} w={920}>Vì <B>sao</B>?</S>
		<div style={{position: 'absolute', left: 60, top: 380, width: 600, height: 900, opacity: E(t, 0.2, 0.5)}}><Club x={0} y={0} t={t} a={0.2} name="COMO · TRUNG TÂM" c={NAVY} size={34} /></div>
		<Fig n="paz_como" x={330} y={1450} h={950} t={t} a={0.3} from="left" />
		<div style={{position: 'absolute', left: 620, top: 760, width: 420, whiteSpace: 'nowrap', opacity: E(t, R(32, 0.5), R(32, 0.7))}}><Club x={0} y={0} t={t} a={R(32, 0.5)} name="MADRID · DỰ BỊ" c="#888" size={26} /></div>
		<Fig n="paz_real" x={820} y={1450} h={560} t={t} a={R(32, 0.5)} dim={0.5} from="right" />
	</Paper>},
	{i: 33, trans: 'up', C: (t, R) => <Paper>
		<Club x={80} y={240} t={t} a={0.1} name="WORLD CUP 2026" c={SKY} />
		<S x={80} y={380} t={t} a={R(34, 0)} size={50} w={920}>Số trận được vào sân</S>
		{['ALG', 'JOR', 'BẢNG', 'R32', 'R16', 'TK', 'BK', 'CK'].map((n, k) => <div key={k} style={{position: 'absolute', left: 80 + k * 116, top: 500, width: 96, textAlign: 'center', opacity: E(t, R(34, 0.2) + k * 0.06, R(34, 0.4) + k * 0.06)}}>
			<div style={{width: 80, height: 80, margin: '0 auto', borderRadius: '50%', background: k < 2 ? SKY : '#c8c8c6'}} />
			<div style={{fontFamily: MONO, fontSize: 20, marginTop: 8}}>{n}</div></div>)}
		<Stat x={80} y={700} w={920} label="Phút ở vòng knock-out" val="0" t={t} a={R(35, 0.4)} c={RED} />
		<S x={80} y={880} t={t} a={R(35, 0.1)} size={42} w={920}>Chung kết: thua <B>Tây Ban Nha</B> 0–1</S>
		<S x={80} y={1020} t={t} a={R(36, 0.1)} size={52} w={920}>Đá chính cho tuyển = <B c={NAVY}>đá chính mỗi tuần</B></S>
		<Fig n="paz_real" x={800} y={1560} h={430} t={t} a={R(34, 0)} dim={0.3} ghost={false} />
	</Paper>},
	{i: 37, trans: 'left', C: (t, R, d) => <Bg n="cordoba" t={t} d={d}>
		<Score t={t} a={0.1} y={180} />
		{t < R(40, 0) ? <Vid t={t} a={R(38, 0) - 0.1} s0={12.5} s1={16.5} x={250} y={360} w={580} cap="CLIP MINH HOẠ" />
			: <Fig n="paz_arg" x={540} y={1500} h={900} t={t} a={R(40, 0)} from="up" />}
		<Stamp x={600} y={420} t={t} a={R(38, 0.4)} text="PHÚT 8" out={R(40, 0)} />
		<Stamp x={520} y={560} t={t} a={R(39, 0.3)} text="PHÚT 38 · CÚ ĐÚP" out={R(40, 0)} />
		<Stat x={80} y={380} w={920} label="Bàn / trận giao hữu gần nhất" val="5/5" t={t} a={R(40, 0.2)} />
		<Stat x={80} y={520} w={920} label="Trận · bàn cho đội tuyển" val="16 · 6" t={t} a={R(41, 0.1)} />
	</Bg>},
	{i: 42, trans: 'up', C: (t, R) => <Paper>
		<Fig n="shirt10" x={540} y={1450} h={900} t={t} a={0.2} from="up" ghost={false} />
		<S x={80} y={240} t={t} a={0.3} size={56} w={920}>Messi <B c="#888">vắng mặt</B></S>
		<S x={80} y={340} t={t} a={R(42, 0.5)} size={56} w={920}>Áo số 10 chờ <B c={SKY}>người mới</B></S>
		<S x={820} y={440} t={t} a={R(42, 0.7)} size={200} w={220} c={RED}><B c={RED}>?</B></S>
	</Paper>},
	{i: 43, trans: 'left', C: (t, R) => <Paper>
		<Club x={80} y={200} t={t} a={0.1} name="NHẬN ĐỊNH 90+" c={INK} size={34} />
		<S x={80} y={310} t={t} a={0.3} size={50} w={920}>€9M: hợp đồng hời nhất mà Real <B c={RED}>đã không dùng</B></S>
		<S x={80} y={520} t={t} a={R(44, 0.1)} size={54} w={920}>Paz chọn <B c={NAVY}>được chơi</B>, không chọn <B c="#888">cái tên</B></S>
		<Circle x={540} y={1150} r={320} c={RED} t={t} a={R(44, 0)} />
		<Fig n="paz_arg" x={540} y={1520} h={820} t={t} a={R(44, 0)} from="up" />
	</Paper>},
	{i: 45, trans: 'left', C: (t, R) => <Paper>
		<S x={540} y={220} t={t} a={0.1} size={56} align="center" w={980}>Số 10 tiếp theo của</S>
		<S x={540} y={300} t={t} a={0.3} size={84} align="center" w={980}><B c={SKY}>Argentina</B>?</S>
		<S x={540} y={440} t={t} a={R(45, 0.4)} size={46} align="center" w={980}>Real có nên trả <B c={RED}>€80M</B>?</S>
		<Fig n="paz_shoot" x={540} y={1450} h={780} t={t} a={0.2} from="up" />
		<S x={540} y={1560} t={t} a={R(45, 0.7)} size={46} align="center" w={980}>Bình luận cho <B c={RED}>90+</B> biết.</S>
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
export const NPZVideo: React.FC = () => {
	const f = useCurrentFrame(), t = f / 30, D = NPZ_DUR;
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
		<AbsoluteFill style={{transform: `translate(${Math.sin(t * 1.2) * 4}px,${Math.cos(t * 0.9) * 4}px) scale(${1.012 + 0.01 * ((t - a0) / Math.max(1, a1 - a0))})`}}>
			<Trans kind={nxt?.trans ?? 'cut'} u={u} isIn={false}>{mk(cur, a0, a1)}</Trans>
			{inTrans && nxt && <Trans kind={nxt.trans} u={u} isIn>{mk(nxt, a1, s2)}</Trans>}
		</AbsoluteFill>
		<Img src={staticFile('mu/logo.png')} style={{position: 'absolute', right: 36, top: 30, width: 92, height: 92, borderRadius: '50%', opacity: 0.92 * (1 - E(t, D - 3.2, D - 2.9)), filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.35))'}} />
		<AbsoluteFill style={{opacity: E(t, D - 3.2, D - 2.8)}}><Paper>
			<Img src={staticFile('mu/logo.png')} style={{position: 'absolute', left: 540 - 230, top: 960 - 330, width: 460, height: 460, borderRadius: '50%', transform: `scale(${lerp(0.6, 1, E(t, D - 3.0, D - 2.3, Easing.out(Easing.back(1.6))))}) rotate(${lerp(-8, 0, E(t, D - 3.0, D - 2.3))}deg)`, filter: 'drop-shadow(10px 14px 0 rgba(0,0,0,.25))'}} />
			<div style={{position: 'absolute', top: 1220, width: 1080, textAlign: 'center', fontFamily: SERIF, fontSize: 44, color: INK, opacity: E(t, D - 2.2, D - 1.8)}}>đăng ký để không bỏ lỡ <b style={{fontStyle: 'italic', color: RED}}>bên kia bảng tỷ số</b></div>
		</Paper></AbsoluteFill>
		<div style={{position: 'absolute', right: 30, bottom: 120, fontFamily: MONO, fontSize: 16, color: '#888', opacity: E(t, D - 9, D - 8.5) * (1 - E(t, D - 3.2, D - 3))}}>hình minh hoạ · nguồn: ESPN, Goal, Wikipedia, Football España, beIN Sports, SI</div>
		<AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'multiply'}}><Img src={staticFile(`tex/noise${Math.floor(f / 3) % 4}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
		<AbsoluteFill style={{background: '#000', opacity: E(t, D - 0.6, D - 0.05)}} />
		<Audio src={staticFile('npz/mix.wav')} />
	</AbsoluteFill>;
};
