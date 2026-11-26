import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame, Easing, OffthreadVideo, Sequence} from 'remotion';
import SIZES from './siralex_sizes.json';
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
const T0 = [[0,  5.051],  [5.371,  7.884],  [8.204,  13.15],  [13.47,  24.406],  [24.726,  26.774],  [27.094,  29.462],  [29.782,  38.372],  [38.692,  48.423],  [48.743,  54.902],  [55.222,  56.6],  [56.92,  65.592],  [65.912,  68.177],  [68.497,  70.097],  [70.417,  74.895],  [75.215,  85.613],  [85.933,  91.132],  [91.452,  95.439],  [95.759,  101.445],  [101.765,  104.879],  [105.199,  106.941],  [107.261,  118.315],  [118.635,  121.546],  [121.866,  125.27],  [125.59,  128.692],  [129.012,  129.895],  [130.215,  140.21],  [140.53,  146.008],  [146.328,  148.688],  [149.008,  150.575],  [150.895,  153.273],  [153.593,  155.9],  [156.22,  158.384],  [158.704,  161.15],  [161.47,  168.049],  [168.369,  173.194],  [173.514,  177.452],  [177.772,  181.574],  [181.894,  190.03],  [190.35,  191.617],  [191.937,  196.452],  [196.772,  204.376],  [204.696,  209.239],  [209.559,  213.64],  [213.96,  218.652],  [218.972,  223.01],  [223.33,  225.948],  [226.268,  227.805],  [228.125,  234.744],  [235.064,  239.605],  [239.925,  245.27],  [245.59,  247.258],  [247.578,  251.223],  [251.543,  255.53],  [255.85,  261.205],  [261.525,  265.185],  [265.505,  268.98],  [269.3,  273.279]];
const T = T0.map(([a, b]) => [a / SPD, b / SPD]);
export const SIRALEX_DUR = Math.round((273.279 / SPD + 3.6) * 30) / 30;
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
	<Img src={staticFile(`siralex/bg_${n}.jpg`)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.38, mixBlendMode: 'multiply', filter: 'contrast(1.1)', transformOrigin: '30% 30%', transform: `scale(${1.16 + 0.06 * (t / Math.max(d, 1))}) translateX(${-20 * t / Math.max(d, 1)}px)`}} />
	<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(233,233,231,.9) 0%, rgba(233,233,231,.25) 45%, transparent 70%)'}} />{children}</Paper>;
const Fig: React.FC<{n: string; x: number; y: number; h: number; t: number; a: number; crop?: number; flip?: boolean; from?: 'left' | 'right' | 'up' | 'none'; out?: number; dim?: number; shake?: number; ghost?: boolean; drop?: number}> = ({n, x, y, h, t, a, crop = 1, flip, from = 'none', out = 1e9, dim = 0, shake = 0, ghost = true, drop}) => {
	const [w0, h0] = SIZE[n]; const w = (w0 / h0) * h;
	const u = E(t, a, a + 0.6, Easing.out(Easing.back(1.4)));
	const o = 1 - E(t, out, out + 0.35, Easing.in(Easing.cubic));
	const dx = (from === 'left' ? -700 * (1 - u) : from === 'right' ? 700 * (1 - u) : 0) + Math.sin(t * 0.7 + x * 0.01) * 14;
	const dy = from === 'up' ? -300 * (1 - u) : from === 'none' ? 60 * (1 - E(t, a, a + 0.5)) : 0;
	const vis = h * crop, g = h * 0.019;
	const rot = drop !== undefined ? 90 * E(t, drop, drop + 0.45, Easing.in(Easing.quad)) : 0;
	const im = (gh: boolean) => <Img src={staticFile(`siralex/${n}.png`)} style={{position: 'absolute', left: gh ? -g : 0, top: gh ? g * 0.15 : 0, width: w, height: h, transform: flip ? 'scaleX(-1)' : undefined, filter: gh ? 'grayscale(1) brightness(.35)' : dim ? `brightness(${1 - dim}) grayscale(${dim})` : undefined, opacity: gh ? 0.35 : 1}} />;
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
			{t >= a - 0.05 && <Sequence from={start} layout="none"><OffthreadVideo src={staticFile('siralex/clip.mp4')} startFrom={Math.round(s0 * 30)} endAt={Math.round(s1 * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>}
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
const FullVid: React.FC<{t: number; a: number; s0: number; s1: number}> = ({t, a, s0, s1}) => {const f = useCurrentFrame(); const start = f - Math.round((t - a) * 30); return <AbsoluteFill style={{background: '#000'}}>{t >= a - 0.05 && <Sequence from={start} layout="none"><OffthreadVideo src={staticFile('siralex/clip.mp4')} startFrom={Math.round(s0 * 30)} endAt={Math.round(s1 * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>}</AbsoluteFill>;};
const VNB_: Dot[] = [[34, 6], [54, 20], [41, 18], [27, 18], [14, 20], [44, 30], [24, 30], [58, 38], [34, 34], [10, 38], [34, 46]].map(([x, y]) => ({x, y, c: RED}));
const BEB_: Dot[] = [[34, 99], [56, 70], [42, 82], [26, 82], [12, 70], [40, 62], [28, 62], [60, 50], [34, 54], [8, 50], [34, 44]].map(([x, y]) => ({x, y, c: INK}));

const Logo: React.FC<{n: string; x: number; y: number; w: number; t: number; a: number}> = ({n, x, y, w, t, a}) => {const u = E(t, a, a + 0.4, Easing.out(Easing.back(2))); return <Img src={staticFile(`siralex/${n}.png`)} style={{position: 'absolute', left: x - w / 2, top: y, width: w, opacity: Math.min(1, u), transform: `scale(${u}) rotate(-4deg)`, filter: 'drop-shadow(6px 8px 0 rgba(0,0,0,.25))', zIndex: 5}} />;};
const ChairSpin: React.FC<{t: number; a0: number; a1: number; n?: number}> = ({t, a0, a1, n = 8}) => {const st = (a1 - a0) / n; const k = Math.max(0, Math.min(n - 1, Math.floor((t - a0) / st))); const p = (t - a0 - k * st) / st; const kick = E(p, 0.75, 1); const spin = kick * 360;
	return <>
		
		{t >= a0 && (() => {const drop = E(p, 0, 0.18, Easing.out(Easing.back(1.6))); return <Img src={staticFile(`siralex/${MSEAT[k]}.png`)} style={{position: 'absolute', left: 540 - (SIZE[MSEAT[k]][0] / SIZE[MSEAT[k]][1]) * 550, top: 620, height: 1100, opacity: 1 - kick, transform: `translate(${kick * 900}px, ${(1 - drop) * -900 - kick * 350}px) rotate(${spin}deg)`, transformOrigin: '50% 60%', filter: 'drop-shadow(-18px 4px 0 rgba(0,0,0,.3))', zIndex: 5}} />;})()}
		<div style={{position: 'absolute', left: 80, top: 330, display: 'flex', gap: 14, flexWrap: 'wrap', width: 920}}>{MGRS.map((m, j) => <div key={m} style={{fontFamily: MONO, fontSize: 26, padding: '4px 10px', border: `3px solid ${j < k || (j === k && kick > 0.5) ? RED : '#bbb'}`, color: j < k || (j === k && kick > 0.5) ? RED : '#bbb', textDecoration: j < k ? 'line-through' : undefined}}>{m}</div>)}</div>
	</>;};
const Rain: React.FC<{t: number; a: number}> = ({t, a}) => <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: E(t, a, a + 0.4), zIndex: 6, pointerEvents: 'none'}}>{Array.from({length: 70}).map((_, k) => {const x = (k * 157) % W; const sp = 900 + (k * 37) % 500; const y = ((t * sp + k * 211) % (H + 200)) - 100; return <line key={k} x1={x} y1={y} x2={x - 8} y2={y + 46} stroke="#5a6b7a" strokeWidth={3} opacity={0.45} />;})}</svg>;
const RULES = ['HLV có quyền quyết định', 'Học viện cung cấp tương lai', 'Kỷ luật không mặc cả', 'Tin đến tiếng còi cuối'];
const Rules: React.FC<{t: number; a: number; step?: number; broken?: number; bstep?: number; y?: number}> = ({t, a, step = 0.25, broken = 1e9, bstep = 0.3, y = 300}) => <>{RULES.map((r, k) => <Rule key={r} x={80} y={y + k * 190} t={t} a={a + k * step} k={k + 1} txt={r} broken={broken + k * bstep} />)}</>;
const MSEAT = ['m_moyes', 'm_vangaal', 'm_mourinho', 'm_ole', 'm_tenhag', 'm_amorim'];
const MGRS = ['MOYES', 'VAN GAAL', 'MOURINHO', 'SOLSKJAER', 'TEN HAG', 'AMORIM', 'CARRICK', 'POCHETTINO'];
const MgrList: React.FC<{t: number; a: number; step: number; strike?: boolean}> = ({t, a, step, strike}) => <>{MGRS.map((m, k) => {const s = a + k * step; const u = E(t, s, s + 0.25, Easing.out(Easing.back(2))); return <div key={m} style={{position: 'absolute', left: 80, top: 330 + k * 82, fontFamily: MONO, fontWeight: 700, fontSize: 46, letterSpacing: 3, color: k === 7 ? RED : INK, opacity: Math.min(1, u), transform: `translateX(${(1 - u) * -60}px)`, zIndex: 4}}>{k + 1}. {m}{strike && k < 7 && <div style={{position: 'absolute', left: -6, right: -6, top: 28, height: 6, background: RED, transform: `scaleX(${E(t, s + 0.2, s + 0.4)})`, transformOrigin: 'left'}} />}</div>;})}</>;
const Rule: React.FC<{x: number; y: number; t: number; a: number; k: number; txt: string; broken?: number}> = ({x, y, t, a, k, txt, broken = 1e9}) => {const u = E(t, a, a + 0.35, Easing.out(Easing.back(1.8))); const b = E(t, broken, broken + 0.3); return <div style={{position: 'absolute', left: x, top: y, width: 920, padding: '18px 26px', background: '#faf8f2', borderLeft: `12px solid ${b > 0.5 ? INK : RED}`, boxShadow: '8px 10px 0 rgba(0,0,0,.2)', opacity: Math.min(1, u), transform: `translateX(${(1 - u) * 60}px) rotate(${b * -4}deg)`, zIndex: 4, filter: b > 0.5 ? 'grayscale(1)' : undefined}}>
	<div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: '#777'}}>LUẬT {k}</div>
	<div style={{fontFamily: SERIF, fontSize: 52, fontWeight: 700, color: INK, textDecoration: b > 0.5 ? 'line-through' : undefined, textDecorationColor: RED, textDecorationThickness: 6}}>{txt}</div></div>;};
const SHOTS: Shot[] = [
	{i: 0, trans: 'cut', C: (t, R) => <Paper>
		<Stamp x={80} y={220} t={t} a={0.1} text="27 NĂM ĐỂ XÂY" c={INK} />
		<Stamp x={420} y={380} t={t} a={R(0, 0.55)} text="10+ NĂM ĐỂ PHÁ" c={RED} />
		<Fig n="sa_1986" x={540} y={1790} h={1150} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 1, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Có người đến để <B c={RED}>huấn luyện</B> một đội bóng</S>
		<Fig n="sa_watch" x={540} y={1790} h={1100} t={t} a={0.1} from="up" dim={0.35} />
	</Paper>},
	{i: 2, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Có người đến để xây <B c={RED}>đế chế</B></S>
		<Fig n="sa_bricks" x={540} y={1790} h={1150} t={t} a={0.05} from="up" />
	</Paper>},
	{i: 3, trans: 'up', C: (t, R) => <Paper>
		<Stamp x={80} y={220} t={t} a={0.1} text="11/1986 · OLD TRAFFORD" c={INK} />
		<Card x={80} y={380} t={t} a={R(3, 0.45)} top="MAN UTD KHI ẤY" main="Sa sút · thiếu kỷ luật" c={RED} />
		<Fig n="drunk_80s" x={540} y={1790} h={1000} t={t} a={0.2} from="up" />
	</Paper>},
	{i: 4, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Chưa có <B c={RED}>danh hiệu nào</B> ngay</S>
		<Fig n="sa_whistle" x={540} y={1790} h={1050} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 5, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Việc khó hơn: <B c={RED}>thay đổi con người</B></S>
		<Fig n="sa_angry" x={540} y={1790} h={1100} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 6, trans: 'left', C: (t, R) => <Paper>
		<Rule x={80} y={240} t={t} a={R(6, 0.7)} k={1} txt="Không ai lớn hơn CLB" />
		<S x={80} y={460} t={t} a={0.1} size={40} w={920}>Kỷ luật · đào tạo trẻ · tiêu chuẩn chung</S>
		<Fig n="sa_point" x={540} y={1790} h={1000} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 7, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={40} w={920}>Beckham · Cantona · Keane · Van Nistelrooy</S>
		<Fig n="door" x={540} y={1800} h={1350} t={t} a={0.05} from="none" />
		<Fig n="cantona" x={540} y={1790} h={1150} t={t} a={0.15} from="up" />
	</Paper>},
	{i: 8, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Không phải chỗ <B c={RED}>đánh bóng tên tuổi</B></S>
		<Fig n="sa_arms" x={540} y={1790} h={1100} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 9, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={700} t={t} a={0.1} size={64} w={920}>Không chỉ xây <B c={RED}>một đội hình</B></S>

	</Paper>},
	{i: 10, trans: 'left', C: (t, R) => <Paper>
		<Stamp x={80} y={220} t={t} a={0.1} text="1995" c={INK} />
		<Fig n="class92" x={540} y={1790} h={1050} t={t} a={0.15} from="up" />
	</Paper>},
	{i: 11, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>"Không thể vô địch bằng <B c={RED}>một đám trẻ</B>"</S>
		<Fig n="tv_pundit" x={540} y={1790} h={1000} t={t} a={0.1} from="up" dim={0.2} />
	</Paper>},
	{i: 12, trans: 'left', C: (t, R) => <Paper>
		<Board t={t} a={0.1} y={220} l="MAN UTD" r="BAYERN" mid="2–1" />
		<Stamp x={240} y={440} t={t} a={R(12, 0.4)} text="ĐỈNH CHÂU ÂU 1999" c={RED} />
		<Fig n="trophy_ribbon" x={540} y={1500} h={1150} t={t} a={0.35} from="up" ghost={false} />
		<Fig n="class92" x={540} y={1840} h={820} t={t} a={0.1} from="none" />
	</Paper>},
	{i: 13, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={700} t={t} a={0.1} size={64} w={920}>Không chỉ <B c={RED}>một thế hệ</B></S>
	</Paper>},
	{i: 14, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Lứa 92 qua đỉnh → <B c={RED}>tái thiết</B></S>
		<Fig n="class92" x={300} y={1700} h={850} t={t} a={0.05} from="up" dim={0.4} />
		<Fig n="ronaldo_mu" x={780} y={1790} h={1000} t={t} a={R(14, 0.5)} from="up" />
	</Paper>},
	{i: 15, trans: 'up', C: (t, R) => <Paper>
		<Card x={80} y={220} t={t} a={0.1} top="TỪ" main="Cantona → Ronaldo" c={INK} />
		<Card x={80} y={380} t={t} a={R(15, 0.5)} top="RỒI" main="Rooney · Ronaldo · Tevez" c={RED} />
		<Fig n="trio" x={540} y={1790} h={1000} t={t} a={R(15, 0.5)} from="up" />
	</Paper>},
	{i: 16, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Đổi người, đổi lối chơi. <B c={RED}>Không đổi khát vọng.</B></S>
		<Fig n="sa_1999" x={540} y={1790} h={1100} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 17, trans: 'up', C: (t, R) => <Paper>
		<Count t={t} a={0.1} to={13} y={200} suffix=" PL" />
		<Stamp x={560} y={480} t={t} a={R(17, 0.5)} text="+2 C1" />
		<Fig n="trophy_shelf" x={540} y={1790} h={1000} t={t} a={0.2} from="up" />
	</Paper>},
	{i: 18, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={700} t={t} a={0.1} size={60} w={920}>Nhưng cúp <B c={RED}>chưa phải thứ quý nhất</B></S>
	</Paper>},
	{i: 19, trans: 'up', C: (t, R) => <Paper>
		<Stamp x={120} y={700} t={t} a={0.1} text="MỘT HỆ THỐNG VẬN HÀNH" c={RED} />
	</Paper>},
	{i: 20, trans: 'left', C: (t, R) => <Paper>
		<Rules t={t} a={R(20, 0.05)} step={(T[20][1] - T[20][0]) / 4.6} />
	</Paper>},
	{i: 21, trans: 'left', C: (t, R) => <Paper>
		<Stamp x={80} y={220} t={t} a={0.1} text="5/2013" c={INK} />
		<Fig n="sa_mic" x={540} y={1790} h={1150} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 22, trans: 'up', C: (t, R) => <Paper>
		<Count t={t} a={0.1} to={20} y={200} suffix=" lần" />
		<S x={80} y={500} t={t} a={0.3} size={48} w={920}>vô địch nước Anh</S>
		<Fig n="sa_wave" x={540} y={1790} h={1000} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 23, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={700} t={t} a={0.1} size={60} w={920}>MU đã chuẩn bị gì cho ngày <B c={RED}>không còn ông</B>?</S>
	</Paper>},
	{i: 24, trans: 'cut', C: (t, R) => <Paper>
		<Stamp x={160} y={800} t={t} a={0.1} text="GẦN NHƯ KHÔNG ĐỦ" c={RED} />
	</Paper>},
	{i: 25, trans: 'left', C: (t, R) => <Paper>
		<Card x={80} y={220} t={t} a={0.1} top="HÈ 2013" main="David Gill rời đi" c={INK} />
		<Card x={80} y={380} t={t} a={R(25, 0.55)} top="MOYES ĐẾN" main="Thay cả ban huấn luyện" c={RED} />
		<Fig n="gill" x={300} y={1790} h={1000} t={t} a={0.1} from="up" out={R(25, 0.5)} />
		<Fig n="moyes" x={700} y={1790} h={1050} t={t} a={R(25, 0.55)} from="up" />
	</Paper>},
	{i: 26, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Chuyển giao = <B c={RED}>thay quá nhiều thứ</B></S>
		<Fig n="blueprint" x={540} y={1790} h={1100} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 27, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={200} t={t} a={0.1} size={48} w={920}>Vòng <B c={RED}>luẩn quẩn</B></S>
		<ChairSpin t={t} a0={R(28, 0)} a1={R(33, 1)} n={6} />
	</Paper>},
	{i: 34, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Mỗi HLV một triết lý. <B c={RED}>Đi là bỏ lại.</B></S>
		<Fig n="blueprint_torn" x={540} y={1790} h={1100} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 35, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Mua cầu thủ cho hệ thống… <B c={RED}>hệ thống biến mất</B></S>
		<Fig n="barber_chair" x={540} y={1790} h={1000} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 36, trans: 'cut', C: (t, R) => <Paper>
		<Stamp x={160} y={700} t={t} a={0.1} text="BẮT ĐẦU LẠI TỪ ĐẦU" c={RED} />
	</Paper>},
	{i: 37, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Hàng trăm triệu bảng, <B c={RED}>không có móng</B></S>
		<Fig n="money_skip" x={540} y={1790} h={1100} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 38, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={700} t={t} a={0.1} size={64} w={920}>Đây mới là điều <B c={RED}>đáng châm biếm</B></S>
	</Paper>},
	{i: 39, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Ngày xưa: <B c={GREEN}>cầu thủ thích nghi với CLB</B></S>
		<Fig n="sa_angry" x={540} y={1790} h={1100} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 40, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Giờ: <B c={RED}>CLB thích nghi với từng HLV</B></S>
		<Fig n="star_throne" x={540} y={1790} h={1000} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 41, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Ngày trước: thay cả đội hình <B c={GREEN}>vẫn thắng</B></S>
		<Fig n="conveyor" x={540} y={1790} h={1000} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 42, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Ngày nay: thay 1 HLV là <B c={RED}>làm lại từ đầu</B></S>
		<Fig n="domino" x={540} y={1790} h={1050} t={t} a={0.1} from="up" dim={0.2} />
	</Paper>},
	{i: 43, trans: 'up', C: (t, R) => <Paper>
		<Card x={80} y={220} t={t} a={R(43, 0.1)} top="VẪN CÓ" main="Tiền" c={INK} />
		<Card x={80} y={370} t={t} a={R(43, 0.35)} top="VẪN CÓ" main="Thương hiệu" c={INK} />
		<Card x={80} y={520} t={t} a={R(43, 0.6)} top="VẪN CÓ" main="Nhà hát của những giấc mơ" c={RED} />
		<Fig n="theatre" x={540} y={1790} h={1000} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 44, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Vở diễn đã kết thúc <B c={RED}>hơn mười năm</B></S>
		<Fig n="leaky_stand" x={540} y={1790} h={1150} t={t} a={0.1} from="up" />
		<Rain t={t} a={0.2} />
	</Paper>},
	{i: 45, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Không ai ở đó <B c={RED}>mãi mãi</B></S>
		<Fig n="sa_old" x={540} y={1790} h={1050} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 46, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Đó <B>không phải lỗi của ông</B></S>
		<Fig n="sa_stands" x={540} y={1790} h={1050} t={t} a={0.05} from="up" />
	</Paper>},
	{i: 47, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Tìm một HLV đủ giỏi = <B c={RED}>tái tạo đế chế</B>?</S>
		<Fig n="contract" x={540} y={1790} h={1000} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 48, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Sir Alex không đến từ <B c={RED}>một bản hợp đồng</B></S>
		<Fig n="copier" x={300} y={1800} h={900} t={t} a={0.05} from="up" dim={0.3} />
		<Fig n="sa_1986" x={760} y={1790} h={1100} t={t} a={R(48, 0.4)} from="up" />
	</Paper>},
	{i: 49, trans: 'up', C: (t, R) => <Paper>
		<Rules t={t} a={0.05} step={0.12} />
		<S x={80} y={1120} t={t} a={R(49, 0.5)} size={38} w={920}>27 năm: con người · nguyên tắc · văn hoá · bộ máy</S>
	</Paper>},
	{i: 50, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={200} t={t} a={0.1} size={48} w={920}>Không thiếu <B c={RED}>người đến sau</B></S>
		<MgrList t={t} a={0.1} step={0.08} strike />
	</Paper>},
	{i: 51, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Thiếu một <B c={RED}>kế hoạch đủ dài</B></S>
		<Fig n="road_short" x={540} y={1600} h={700} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 52, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>27 năm để thành <B c={RED}>biểu tượng</B></S>
		<Fig n="statue" x={540} y={1790} h={1150} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 53, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Tiếc nhất không phải <B>chưa có Sir Alex mới</B>…</S>
		<Fig n="empty_seat" x={540} y={1790} h={1050} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 54, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={140} t={t} a={0.1} size={46} w={920}>…mà là <B c={RED}>đánh mất</B> những gì ông dạy</S>
		<Rules t={t} a={0} step={0.05} broken={R(54, 0.2)} bstep={0.25} y={300} />
	</Paper>},
	{i: 55, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={700} t={t} a={0.1} size={56} w={920}>Không phải cần HLV <B>giỏi đến mức nào</B>…</S>
	</Paper>},
	{i: 56, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>MU còn nhớ mình <B c={RED}>được xây thế nào</B>?</S>
		<Stamp x={300} y={420} t={t} a={R(56, 0.6)} text="BÌNH LUẬN NHÉ" c={RED} />
		<Fig n="statue_rain" x={540} y={1790} h={1100} t={t} a={0.1} from="up" />
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
export const SIRALEXVideo: React.FC = () => {
	const f = useCurrentFrame(), t = f / 30, D = SIRALEX_DUR;
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
		<div style={{position: 'absolute', right: 30, bottom: 120, fontFamily: MONO, fontSize: 16, color: '#888', opacity: E(t, D - 9, D - 8.5) * (1 - E(t, D - 3.2, D - 3))}}>hình minh hoạ · nguồn: BBC, Manchester United, The Athletic, Sky Sports</div>
		<AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'multiply'}}><Img src={staticFile(`tex/noise${Math.floor(f / 3) % 4}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
		<AbsoluteFill style={{background: '#000', opacity: E(t, D - 0.6, D - 0.05)}} />
		<Audio src={staticFile('siralex/mix.wav')} />
	</AbsoluteFill>;
};
