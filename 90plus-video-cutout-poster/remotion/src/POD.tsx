import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import SIZES from './pod_sizes.json';
import '@fontsource/playfair-display/vietnamese-400.css';
import '@fontsource/playfair-display/latin-400.css';
import '@fontsource/playfair-display/vietnamese-700-italic.css';
import '@fontsource/playfair-display/latin-700-italic.css';
import '@fontsource/jetbrains-mono/vietnamese-400.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/vietnamese-700.css';
import '@fontsource/jetbrains-mono/latin-700.css';

// 90+ · MU dưới thời Pochettino: ai sẽ sống sót? (9:16)
const SPD = 1.15;
const T0 = [[0.0, 2.54], [2.86, 5.36], [5.68, 9.24], [9.56, 13.62], [13.94, 19.11], [19.43, 20.48], [20.8, 24.68], [25.0, 26.65], [26.97, 30.14], [30.46, 31.69], [32.01, 38.06], [38.38, 41.34], [41.66, 44.84], [45.16, 48.91], [49.23, 53.56], [53.88, 58.2], [58.52, 60.27], [60.59, 63.33], [63.65, 66.88], [67.2, 69.17], [69.49, 71.11], [71.43, 74.83], [75.15, 78.36], [78.68, 80.74], [81.06, 86.09], [86.41, 89.72], [90.04, 93.38], [93.7, 97.27], [97.59, 103.25], [103.57, 106.0], [106.32, 107.61], [107.93, 112.3], [112.62, 115.98], [116.3, 121.16], [121.48, 125.04], [125.36, 127.73], [128.05, 132.18], [132.5, 134.6], [134.92, 137.06], [137.38, 142.6], [142.92, 144.96], [145.28, 149.03], [149.35, 152.55], [152.87, 154.29], [154.61, 156.16], [156.48, 157.93], [158.25, 161.38], [161.7, 163.92], [164.24, 165.74], [166.06, 172.21], [172.53, 176.07], [176.39, 178.31], [178.63, 181.31], [181.63, 184.16], [184.48, 188.94], [189.26, 194.12], [194.44, 197.22], [197.54, 200.47], [200.79, 203.19], [203.51, 207.37], [207.69, 209.49], [209.81, 215.41], [215.73, 220.33]];
const T = T0.map(([a, b]) => [a / SPD, b / SPD]);
export const POD_DUR = Math.round((220.33 / SPD + 3.6) * 30) / 30;
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
	<Img src={staticFile(`pod/bg_${n}.jpg`)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.38, mixBlendMode: 'multiply', filter: 'contrast(1.1)', transformOrigin: '30% 30%', transform: `scale(${1.16 + 0.06 * (t / Math.max(d, 1))}) translateX(${-20 * t / Math.max(d, 1)}px)`}} />
	<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(233,233,231,.9) 0%, rgba(233,233,231,.25) 45%, transparent 70%)'}} />{children}</Paper>;
const Fig: React.FC<{n: string; x: number; y: number; h: number; t: number; a: number; crop?: number; flip?: boolean; from?: 'left' | 'right' | 'up' | 'none'; out?: number; dim?: number; shake?: number; ghost?: boolean; drop?: number}> = ({n, x, y, h, t, a, crop = 1, flip, from = 'none', out = 1e9, dim = 0, shake = 0, ghost = true, drop}) => {
	const [w0, h0] = SIZE[n]; const w = (w0 / h0) * h;
	const u = E(t, a, a + 0.55);
	const o = 1 - E(t, out, out + 0.35, Easing.in(Easing.cubic));
	const dx = from === 'left' ? -700 * (1 - u) : from === 'right' ? 700 * (1 - u) : 0;
	const dy = from === 'up' ? -300 * (1 - u) : 0;
	const vis = h * crop, g = h * 0.019;
	const rot = drop !== undefined ? 90 * E(t, drop, drop + 0.45, Easing.in(Easing.quad)) : 0;
	const im = (gh: boolean) => <Img src={staticFile(`pod/${n}.png`)} style={{position: 'absolute', left: gh ? -g : 0, top: gh ? g * 0.15 : 0, width: w, height: h, transform: flip ? 'scaleX(-1)' : undefined, filter: gh ? 'grayscale(1) brightness(.35)' : dim ? `brightness(${1 - dim}) grayscale(${dim})` : undefined, opacity: gh ? 0.35 : 1}} />;
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
const DIST = [{n: '…', v: 1290}, {n: '17. ', v: 1215}, {n: '18. ', v: 1205}, {n: '19. MAN UTD · 1.194 KM', v: 1194, c: RED}, {n: '20. ', v: 1180}];

const SHOTS: Shot[] = [
	// 0 Old Trafford
	{i: 0, trans: 'cut', C: (t, R, d) => <Bg n="oldtrafford" t={t} d={d}>
		<Club x={80} y={300} t={t} a={0.2} name="OLD TRAFFORD" />
		<S x={80} y={440} t={t} a={0.5} size={88} w={920}>nơi từng khiến<br />mọi đối thủ<br /><B c={RED}>khiếp sợ</B></S>
	</Bg>},
	// 1-2 1.194 km
	{i: 1, trans: 'left', C: (t, R) => <Paper>
		<S x={540} y={250} t={t} a={0.1} size={60} align="center" w={960}>còn bây giờ</S>
		<Count t={t} a={0.3} to={1194} y={360} dec suffix=" km" />
		<S x={540} y={660} t={t} a={R(2, 0.05)} size={52} align="center" w={960}>quãng đường man utd đã <B c={RED}>chạy</B> mùa này</S>
		<Bars t={t} a={R(2, 0.45)} top={900} max={1300} rows={DIST.map((r0, k) => ({...r0, n: k === 0 ? '1. ĐỘI CHẠY NHIỀU NHẤT' : r0.n || `${k + 16}.`}))} unit="TỔNG QUÃNG ĐƯỜNG · PREMIER LEAGUE 26/27 · OPTA (minh hoạ độ dài thanh)" />
		<Stamp x={600} y={1500} t={t} a={R(2, 0.75)} text="19 / 20" />
	</Paper>},
	// 3 table
	{i: 3, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={260} t={t} a={0.1} size={60} w={920}>sau <B>10</B> trận</S>
		<Stat x={80} y={420} w={920} label="Thắng" val="1" t={t} a={R(3, 0.1)} />
		<Stat x={80} y={560} w={920} label="Hoà" val="5" t={t} a={R(3, 0.2)} />
		<Stat x={80} y={700} w={920} label="Thua" val="4" t={t} a={R(3, 0.3)} c={RED} />
		<Stat x={80} y={880} w={920} label="Vị trí" val="18" t={t} a={R(3, 0.55)} c={RED} />
		<Stamp x={220} y={1120} t={t} a={R(3, 0.75)} text="NHÓM XUỐNG HẠNG" />
		<Fig n="bruno" x={760} y={1920} h={1500} crop={0.42} t={t} a={0.3} dim={0.25} from="right" />
	</Paper>},
	// 4 Carrick -> Poch
	{i: 4, trans: 'left', C: (t, R) => <Paper>
		<Circle x={540} y={1000} r={330} c={RED} t={t} a={R(4, 0.45)} />
		<Ground y={1480} t={t} a={0} />
		<Fig n="carrick" x={540} y={1480} h={1050} t={t} a={0} dim={E(t, R(4, 0.15), R(4, 0.4)) * 0.6} out={R(4, 0.4)} />
		<Fig n="poch_stand" x={540} y={1480} h={1080} t={t} a={R(4, 0.45)} from="up" />
		<S x={80} y={260} t={t} a={0.1} size={56} w={920} out={R(4, 0.4)}>michael carrick<br /><B c="#777">ra đi</B></S>
		<S x={80} y={260} t={t} a={R(4, 0.55)} size={56} w={920}>người kéo con tàu trở lại:<br /><B c={RED}>mauricio pochettino</B></S>
	</Paper>},
	// 5-6 vấn đề
	{i: 5, trans: 'cut', C: (t, R) => <Paper>
		<Ground y={1480} t={t} a={0} />
		<Circle x={680} y={1000} r={300} c={BLUE} t={t} a={0.1} />
		<Fig n="poch_arms" x={700} y={1480} h={1080} t={t} a={0} from="right" />
		<Stamp x={90} y={300} t={t} a={0.15} text="VẤN ĐỀ" />
		<S x={80} y={470} t={t} a={R(6, 0.05)} size={58} w={600}>không đến để<br /><B c={RED}>chiều lòng</B><br />ngôi sao</S>
		<Arrow id="p1" x1={300} y1={720} x2={460} y2={820} bend={0.3} t={t} a={R(6, 0.4)} />
	</Paper>},
	// 7 quote
	{i: 7, trans: 'zoom', C: (t, R) => <Paper>
		<FromCircle t={t} c={RED} x={540} y={1100} r={280} />
		<Ground y={1480} t={t} a={0} /><Fig n="poch_point" x={540} y={1480} h={900} t={t} a={0.2} from="up" />
		<Clip x={90} y={420} w={900} t={t} a={0.25} src="Mauricio Pochettino">“nếu không <B c={RED}>thay đổi</B>,<br />bạn sẽ <B c={RED}>chết</B>.”</Clip>
	</Paper>},
	// 8 who survives
	{i: 8, trans: 'left', C: (t, R) => <Paper>
		<S x={540} y={180} t={t} a={0.1} size={60} align="center" w={980}>ai sẽ phải <B c={BLUE}>thay đổi</B>?</S>
		<S x={540} y={270} t={t} a={R(8, 0.5)} size={84} align="center" w={980}>ai sẽ <B c={RED}>sống sót</B>?</S>
		<Pitch t={t} a={0.2} top={470} tilt={28} dots={team(RED, MU_N).map((d) => ({...d}))} label="MAN UTD · 4-2-3-1" />
		{F4231.map(([x, y], k) => <div key={k} style={{position: 'absolute', left: (W - PW) / 2 + x * PS - 20, top: 470 + PH - y * PS - 100 + (PH - y * PS) * 0, fontFamily: SERIF, fontSize: 54, color: RED, opacity: 0}}>?</div>)}
	</Paper>},
	// 9-11 Tottenham
	{i: 9, trans: 'left', C: (t, R) => <Paper>
		<Club x={80} y={240} t={t} a={0.1} name="TOTTENHAM" c={'#24305e'} />
		<Stat x={80} y={400} w={920} label="Top 3 Premier League" val="3 mùa" t={t} a={R(10, 0.15)} />
		<Stat x={80} y={540} w={920} label="Chung kết Champions League" val="2019" t={t} a={R(10, 0.6)} />
		<div style={{position: 'absolute', inset: 0, opacity: 0.2}}><Fig n="trophy" x={540} y={1500} h={900} t={t} a={R(10, 0.65)} from="up" ghost={false} /></div>
		<Ground y={1540} t={t} a={R(11, 0)} />
		<Fig n="kane" x={240} y={1540} h={760} t={t} a={R(11, 0.05)} from="up" />
		<Fig n="son" x={540} y={1540} h={760} t={t} a={R(11, 0.2)} from="up" />
		<Fig n="alli" x={840} y={1540} h={760} t={t} a={R(11, 0.38)} from="up" />
		{['KANE', 'SON', 'DELE ALLI'].map((n, k) => <div key={k} style={{position: 'absolute', left: 240 + k * 300 - 150, top: 1570, width: 300, textAlign: 'center', fontFamily: MONO, fontSize: 26, letterSpacing: 3, opacity: E(t, R(11, 0.1 + k * 0.17), R(11, 0.3 + k * 0.17))}}>{n}</div>)}
	</Paper>},
	// 12-15 Spurs pitch
	{i: 12, trans: 'up', C: (t, R) => {
		const base = team('#24305e', SP_N, [5, 7, 8, 10]);
		const press = move(base, {7: [56, 80], 8: [36, 76], 9: [14, 80], 10: [34, 88], 5: [44, 58], 6: [26, 56]}, E(t, R(13, 0.05), R(13, 0.5)) * (1 - E(t, R(14, 0), R(14, 0.2))));
		const build = move(press, {5: [34, 16], 2: [52, 22], 3: [16, 22], 1: [64, 56], 4: [4, 56]}, E(t, R(14, 0.1), R(14, 0.5)));
		return <Paper>
			<S x={80} y={170} t={t} a={0.1} size={56} w={920}>công thức: <B c={RED}>pressing</B> quyết liệt</S>
			<Pitch t={t} a={0} top={420} dots={build} label="TOTTENHAM · 4-2-3-1 · sơ đồ minh hoạ">
				<PLine pts={[[34, 78], [34, 88]]} t={t} a={R(13, 0.2)} c={RED} out={R(14, 0)} />
				<PLine pts={[[58, 62], [56, 80]]} t={t} a={R(13, 0.25)} c={RED} out={R(14, 0)} />
				<PLine pts={[[10, 62], [14, 80]]} t={t} a={R(13, 0.3)} c={RED} out={R(14, 0)} />
				<PLine pts={[[42, 41], [34, 17]]} t={t} a={R(14, 0.1)} out={R(15, 0)} />
				<PLine pts={[[60, 28], [64, 54]]} t={t} a={R(14, 0.5)} out={R(15, 0)} />
				<PLine pts={[[8, 28], [4, 54]]} t={t} a={R(14, 0.55)} out={R(15, 0)} />
				<PLine pts={[[34, 16], [34, 50], [34, 86]]} t={t} a={R(15, 0.1)} dash="1 0" w={6} c={RED} />
			</Pitch>
			<Stamp x={600} y={1660} t={t} a={R(14, 0.45)} text="HÀNG 3" c={INK} out={R(15, 0.2)} />
			<Stamp x={560} y={1660} t={t} a={R(15, 0.3)} text="TẤN CÔNG NHANH" />
		</Paper>;
	}},
	// 16-20 MU numbers
	{i: 16, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={200} t={t} a={0.1} size={60} w={920}>bài toán <B c={RED}>đau đầu</B> nhất</S>
		<Club x={80} y={340} t={t} a={R(17, 0)} name="OPTA · MAN UTD" c={INK} size={30} />
		<Stat x={80} y={470} w={920} label="Tổng quãng đường" val="19/20" t={t} a={R(17, 0.3)} c={RED} />
		<Stat x={80} y={610} w={920} label="Số lần nước rút" val="14/20" t={t} a={R(18, 0.1)} />
		<Stat x={80} y={750} w={920} label="Quãng đường nước rút" val="16/20" t={t} a={R(18, 0.55)} />
		<Stat x={80} y={890} w={920} label="Tuổi đội hình" val="già nhất" t={t} a={R(19, 0.1)} />
		<Stat x={80} y={1030} w={920} label="Bàn thua sau 10 trận" val="19" t={t} a={R(20, 0.1)} c={RED} />
		<Fig n="mainoo" x={540} y={1920} h={1400} crop={0.4} t={t} a={0.2} dim={0.3} from="up" />
	</Paper>},
	// 21-23 Poch wake up
	{i: 21, trans: 'left', C: (t, R) => <Paper>
		<Ground y={1480} t={t} a={0} />
		<Circle x={380} y={1050} r={280} c={RED} t={t} a={0.1} />
		<Fig n="poch_point" x={400} y={1480} h={1000} t={t} a={0} from="left" />
		<Fig n="tactics" x={840} y={1480} h={640} t={t} a={0.25} from="right" ghost={false} />
		<S x={80} y={250} t={t} a={0.3} size={58} w={920}>một đội bóng cần<br />được <B c={RED}>đánh thức</B></S>
		<S x={80} y={450} t={t} a={R(22, 0.2)} size={46} w={920}>nhưng triết lý đòi hỏi <B c={RED}>cường độ cực cao</B></S>
		{[0, 1, 2, 3, 4].map((k) => <Arrow key={k} id={`w${k}`} x1={660 + k * 40} y1={1000 + k * 30} x2={940} y2={900 - k * 60} bend={0.3} t={t} a={R(22, 0.4) + k * 0.12} c={RED} />)}
		<S x={80} y={600} t={t} a={R(23, 0.1)} size={52} w={920}>ai chịu nổi? <B>từng tuyến</B></S>
	</Paper>},
	// 24-33 MU lines
	{i: 24, trans: 'up', C: (t, R) => {
		let D = team(RED, MU_N, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		const lbl = t > R(25, 0) - 0.2 ? [2, 4, 5, 6] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		D = D.map((d, k) => ({...d, n: lbl.includes(k) ? MU_N[k] : undefined}));
		const up = E(t, R(25, 0.3), R(25, 0.8));
		D = move(D, {1: [60, 40], 2: [43, 33], 3: [25, 33], 4: [8, 40], 5: [42, 52], 6: [26, 52]}, up);
		const hi = t > R(33, 0) ? [6, 5] : t > R(32, 0) ? [5] : t > R(30, 0) ? [6] : t > R(28, 0) ? [4] : t > R(26, 0) ? [2] : [];
		D = D.map((d, k) => ({...d, hi: hi.includes(k) ? 1 : 0, dim: hi.length && !hi.includes(k) ? 0.6 : 0}));
		D = move(D, {4: [6, 64]}, E(t, R(29, 0), R(29, 0.6)));
		D = move(D, {6: [34, 26], 3: [18, 32], 2: [50, 32]}, E(t, R(33, 0.2), R(33, 0.6)));
		const fig = t < R(28, 0) ? 'yoro' : t < R(30, 0) ? 'dorgu' : t < R(32, 0) ? 'mainoo' : 'tielemans';
		const fa = t < R(28, 0) ? R(26, 0.6) : t < R(30, 0) ? R(28, 0) : t < R(32, 0) ? R(30, 0) : R(32, 0);
		const nm = {yoro: ['Yoro', '20 tuổi · trung vệ bọc lót'], dorgu: ['Dorgu', 'hậu vệ trái · lên xuống'], mainoo: ['Mainoo', 'giữ bóng · thoát pressing'], tielemans: ['Tielemans', 'giữ nhịp']}[fig] as [string, string];
		return <Paper>
			<S x={80} y={150} t={t} a={0.1} size={44} w={920} out={R(25, 0)}>đội hình dự kiến · <B>the independent</B></S>
			<S x={80} y={150} t={t} a={R(25, 0)} size={52} w={920}>hàng thủ phải <B c={RED}>dâng cao</B></S>
			<Pitch t={t} a={0} top={330} tilt={26} dots={D} label="MAN UTD · 4-2-3-1 · minh hoạ">
				<Zone x={34} y={18} r={11} t={t} a={R(25, 0.7)} out={R(28, 0)} />
				<PLine pts={[[43, 33], [40, 22], [34, 14]]} t={t} a={R(27, 0.1)} c={RED} out={R(28, 0)} />
				<PLine pts={[[8, 40], [6, 64]]} t={t} a={R(28, 0.6)} out={R(30, 0)} />
				<PLine pts={[[26, 52], [20, 58], [28, 64]]} t={t} a={R(31, 0.1)} out={R(32, 0)} />
				<PLine pts={[[26, 52], [34, 27]]} t={t} a={R(33, 0.1)} />
			</Pitch>
			{t > R(26, 0.4) && <><Fig key={fig} n={fig} x={840} y={1660} h={900} crop={0.62} t={t} a={fa} from="right" />
				<Name key={fig + 'n'} x={60} y={1500} t={t} a={fa + 0.2} n={nm[0]} sub={nm[1]} /></>}
			<Stamp x={80} y={1400} t={t} a={R(28, 0.2)} text="SHAW CHẤN THƯƠNG" c={INK} out={R(30, 0)} />
			<Stamp x={80} y={1400} t={t} a={R(33, 0.5)} text="HÀNG 3 NHƯ DIER" />
		</Paper>;
	}},
	// 34-36 young
	{i: 34, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={260} t={t} a={0.1} size={60} w={920}>những cái tên <B c={BLUE}>trẻ</B></S>
		{['AYDEN HEAVEN', 'HARRY AMASS', 'SHEA LACEY'].map((n, k) => {const g = k === 1 ? E(t, R(36, 0.4), R(36, 0.7)) : 0; return <div key={k} style={{position: 'absolute', left: 120 + k * 30, top: 470 + k * 200, opacity: E(t, R(34, 0.3 + k * 0.2), R(34, 0.5 + k * 0.2)), filter: `grayscale(${g})`, transform: `rotate(${-2 + k * 1.5}deg)`}}>
			<Club x={0} y={0} t={t} a={R(34, 0.3 + k * 0.2)} name={n} c={g > 0.5 ? '#888' : RED} size={46} />
		</div>;})}
		<Stamp x={600} y={1150} t={t} a={R(35, 0.4)} text="CƠ HỘI" c={BLUE} />
		<S x={80} y={1320} t={t} a={R(36, 0.1)} size={56} w={920}>trẻ ≠ <B c={RED}>chắc suất</B></S>
		<S x={80} y={1440} t={t} a={R(36, 0.5)} size={44} w={920}>kỹ thuật · thể lực · <B>kỷ luật</B></S>
	</Paper>},
	// 37-41 Bruno
	{i: 37, trans: 'up', C: (t, R) => <Paper>
		{t < R(38, 0) && <Pitch t={t} a={0} top={330} tilt={26} zoom={lerp(1, 1.9, E(t, 0.2, R(37, 0.9)))} zy={60} dots={team(RED, MU_N, [8], [8], 0.7)} />}
		{t >= R(38, 0) && <>
			<Circle x={600} y={1000} r={330} c={RED} t={t} a={R(38, 0)} />
			<Ground y={1500} t={t} a={R(38, 0)} />
			<Fig n="alli" x={560} y={1500} h={1000} t={t} a={R(39, 0.05)} out={R(41, 0)} from="left" />
			<div style={{position: 'absolute', inset: 0, transform: `translateX(${340 * E(t, R(39, 0), R(39, 0.15)) * (1 - E(t, R(41, 0), R(41, 0.2)))}px) scale(${1 - 0.3 * E(t, R(39, 0), R(39, 0.15)) * (1 - E(t, R(41, 0), R(41, 0.2)))})`, transformOrigin: '640px 1500px', opacity: 1 - 0.5 * E(t, R(39, 0), R(39, 0.15)) * (1 - E(t, R(41, 0), R(41, 0.2)))}}><Fig n="bruno" x={600} y={1500} h={1250} t={t} a={R(38, 0)} from="up" /></div>
			<Name x={80} y={260} t={t} a={R(38, 0.1)} n="Bruno" sub="32 tuổi · số 10" />
			<S x={80} y={480} t={t} a={R(39, 0.1)} out={R(41, 0)} size={44} w={520}>tottenham: <B>dele alli</B><br />băng vào vòng cấm</S>
			<Arrow id="b1" x1={300} y1={620} x2={440} y2={760} bend={0.3} t={t} a={R(39, 0.4)} out={R(41, 0)} />
			<S x={800} y={180} t={t} a={R(40, 0)} size={220} w={240} c={RED}><B c={RED}>?</B></S>
			<Stamp x={200} y={1560} t={t} a={R(41, 0.4)} text="KHÔNG AI ĐƯỢC MIỄN" />
		</>}
	</Paper>},
	// 42-45 Chelsea twist
	{i: 42, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={240} t={t} a={0.1} size={70} w={920}>nhưng <B c={RED}>khoan</B>.</S>
		<Club x={80} y={420} t={t} a={R(43, 0)} name="CHELSEA · 23/24" c={BLUE} />
		<S x={80} y={560} t={t} a={R(44, 0)} size={52} w={920}>chạy ít <B c={BLUE}>thứ 3</B> giải</S>
		<Bars t={t} a={R(44, 0.2)} top={760} max={1300} rows={[{n: 'ĐỘI CHẠY NHIỀU NHẤT', v: 1290}, {n: 'CHELSEA 23/24 · ÍT THỨ 3', v: 1200, c: BLUE}, {n: 'MAN UTD 26/27 · ÍT THỨ 2', v: 1194, c: RED}]} unit="minh hoạ độ dài thanh · nguồn: Opta qua VnExpress" />
		<S x={80} y={1150} t={t} a={R(45, 0.1)} size={56} w={920}>gần bằng <B c={RED}>man utd</B> bây giờ</S>
	</Paper>},
	// 46-48 Palmer
	{i: 46, trans: 'up', C: (t, R) => <Paper>
		<Circle x={780} y={1000} r={300} c={BLUE} t={t} a={0.1} />
		<Ground y={1500} t={t} a={0} />
		<Fig n="palmer" x={800} y={1500} h={1250} t={t} a={0} from="right" />
		<Name x={80} y={240} t={t} a={0.2} n="Palmer" c={BLUE} sub="Premier League 23/24" />
		<Stat x={80} y={440} w={460} label="Bàn" val="22" t={t} a={R(46, 0.4)} />
		<Stat x={80} y={580} w={460} label="Kiến tạo" val="11" t={t} a={R(46, 0.7)} />
		<S x={80} y={780} t={t} a={R(47, 0)} size={46} w={460}>không bắt chạy như <B>alli</B></S>
		<Strike x={360} y={830} w={130} t={t} a={R(47, 0.5)} />
		<S x={80} y={960} t={t} a={R(48, 0)} size={52} w={460}>xây cả đội <B c={BLUE}>quanh</B> palmer</S>
		{[0, 1, 2, 3].map((k) => <Arrow key={k} id={`pm${k}`} x1={[60, 1000, 60, 1000][k]} y1={[1450, 1400, 1650, 1650][k]} x2={[440, 840, 460, 820][k]} y2={[1150, 1100, 1300, 1300][k]} bend={k % 2 ? -0.2 : 0.2} t={t} a={R(48, 0.2) + k * 0.1} c={BLUE} />)}
	</Paper>},
	// 49 PSG
	{i: 49, trans: 'left', C: (t, R) => <Paper>
		<Club x={80} y={240} t={t} a={0.1} name="PSG · 21/22" c={'#1b2a52'} />
		<S x={80} y={380} t={t} a={R(49, 0.15)} size={46} w={920}>messi · neymar · mbappé: <B c={RED}>không pressing</B></S>
		<Pitch t={t} a={R(49, 0.3)} top={620} tilt={28} dots={[[34, 5], [60, 28], [43, 21], [25, 21], [8, 28], [34, 42], [48, 52], [20, 52], [58, 74], [34, 80], [10, 74]].map(([x, y], k) => ({x, y, c: '#1b2a52', n: k === 8 ? 'Messi' : k === 9 ? 'Mbappé' : k === 10 ? 'Neymar' : undefined}))} label="→ 4-3-3" />
	</Paper>},
	// 50-53 quote returns
	{i: 50, trans: 'zoom', C: (t, R) => <Paper>
		<FromCircle t={t} c={RED} x={540} y={1150} r={300} />
		<Clip x={90} y={260} w={900} t={t} a={0.2} src="Mauricio Pochettino">“nếu không <B c={RED}>thay đổi</B>, bạn sẽ <B c={RED}>chết</B>.”</Clip>
		<S x={90} y={560} t={t} a={R(51, 0.1)} size={56} w={900} out={R(52, 0)}>dành cho cả <B c={RED}>chính ông</B></S>
		{t < R(52, 0) ? <><Ground y={1480} t={t} a={0} /><Fig n="poch_arms" x={540} y={1480} h={780} t={t} a={0.2} from="up" /></>
			: <><Fig n="bruno" x={540} y={1920} h={1600} crop={0.52} t={t} a={R(52, 0)} from="up" />
				<S x={90} y={560} t={t} a={R(52, 0.2)} size={52} w={900}>bruno <B>không bị loại</B>…</S>
				<S x={90} y={660} t={t} a={R(53, 0)} size={60} w={900}>mà là <B c={BLUE}>palmer tiếp theo</B></S>
				{[0, 1, 2, 3].map((k) => <Arrow key={k} id={`bq${k}`} x1={[60, 1020, 60, 1020][k]} y1={[1300, 1300, 1700, 1700][k]} x2={[340, 740, 330, 760][k]} y2={[1150, 1150, 1450, 1450][k]} bend={k % 2 ? -0.2 : 0.2} t={t} a={R(53, 0.3) + k * 0.1} c={RED} />)}</>}
	</Paper>},
	// 54-56 verdict
	{i: 54, trans: 'left', C: (t, R) => {
		const hi = t > R(56, 0) ? [2, 4, 6, 8] : t > R(55, 0.3) ? [2, 4, 6] : [];
		const D = team(RED, MU_N, hi, hi, hi.length ? 0.6 : 0);
		return <Paper>
			<Club x={80} y={170} t={t} a={0.1} name="NHẬN ĐỊNH 90+" c={INK} size={34} />
			<S x={80} y={250} t={t} a={0.3} size={50} w={920}>không bê nguyên <B c={RED}>tottenham</B> về</S>
			<Pitch t={t} a={0.2} top={420} tilt={26} dots={D} />
			<S x={80} y={1640} t={t} a={R(55, 0.4)} size={46} w={920}><B c={RED}>xương sống</B>: yoro · dorgu · mainoo</S>
			<S x={80} y={1720} t={t} a={R(56, 0.2)} size={46} w={920}><B>trung tâm</B>: bruno</S>
		</Paper>;
	}},
	// 57-58 time
	{i: 57, trans: 'up', C: (t, R) => <Paper>
		<Ground y={1600} t={t} a={0} />
		<Fig n="hourglass" x={540} y={1600} h={900} t={t} a={0.1} from="up" ghost={false} />
		<S x={540} y={300} t={t} a={0.2} size={60} align="center" w={960}>ban lãnh đạo có đủ <B c={RED}>kiên nhẫn</B>?</S>
		<S x={540} y={440} t={t} a={R(58, 0.1)} size={52} align="center" w={960}>thời gian: thứ ông <B>không có nhiều</B></S>
	</Paper>},
	// 59-61 Anfield
	{i: 59, trans: 'left', C: (t, R, d) => <Bg n="anfield" t={t} d={d}>
		<Club x={80} y={250} t={t} a={0.1} name="LIVERPOOL – MAN UTD" c={RED} size={40} />
		<S x={80} y={370} t={t} a={0.3} size={56} w={920}>chủ nhật <B>22/11</B> · anfield</S>
		<Stamp x={540} y={500} t={t} a={R(60, 0.2)} text="KHẮC NGHIỆT NHẤT" />
		<Ground y={1480} t={t} a={0} />
		<Fig n="poch_stand" x={540} y={1480} h={700} t={t} a={0.2} from="up" />
		<S x={60} y={760} t={t} a={R(61, 0.05)} size={44} w={420}>cỗ máy<br /><B c={RED}>pressing</B>?</S>
		<Arrow id="an1" x1={240} y1={900} x2={140} y2={1100} bend={0.3} t={t} a={R(61, 0.15)} c={RED} />
		<S x={1020} y={760} t={t} a={R(61, 0.5)} size={44} w={420} align="right">thêm một dự án<br /><B>bị chôn vùi</B>?</S>
		<Arrow id="an2" x1={860} y1={900} x2={960} y2={1100} bend={-0.3} t={t} a={R(61, 0.6)} />
	</Bg>},
	// 62 ask
	{i: 62, trans: 'left', C: (t, R) => <Paper>
		<S x={540} y={200} t={t} a={0.1} size={56} align="center" w={980}>ai hợp nhất với</S>
		<S x={540} y={280} t={t} a={0.3} size={84} align="center" w={980}><B c={RED}>pochettino</B>?</S>
		<Pitch t={t} a={0.2} top={440} tilt={28} dots={team(RED, MU_N, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])} />
		<S x={540} y={1660} t={t} a={R(62, 0.6)} size={46} align="center" w={980}>bình luận cho <B c={RED}>90+</B> biết</S>
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
export const PODVideo: React.FC = () => {
	const f = useCurrentFrame(), t = f / 30, D = POD_DUR;
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
		<div style={{position: 'absolute', right: 30, bottom: 120, fontFamily: MONO, fontSize: 16, color: '#888', opacity: E(t, D - 9, D - 8.5) * (1 - E(t, D - 3.2, D - 3))}}>hình minh hoạ · nguồn: VnExpress, Sky Sports, Opta, The Independent</div>
		<AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'multiply'}}><Img src={staticFile(`tex/noise${Math.floor(f / 3) % 4}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
		<AbsoluteFill style={{background: '#000', opacity: E(t, D - 0.6, D - 0.05)}} />
		<Audio src={staticFile('pod/mix.wav')} />
	</AbsoluteFill>;
};
