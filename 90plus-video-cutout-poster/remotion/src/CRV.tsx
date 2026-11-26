import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame, Easing, OffthreadVideo, Sequence} from 'remotion';
import SIZES from './crv_sizes.json';
import '@fontsource/playfair-display/vietnamese-400.css';
import '@fontsource/playfair-display/latin-400.css';
import '@fontsource/playfair-display/vietnamese-700-italic.css';
import '@fontsource/playfair-display/latin-700-italic.css';
import '@fontsource/jetbrains-mono/vietnamese-400.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/vietnamese-700.css';
import '@fontsource/jetbrains-mono/latin-700.css';

// 90+ · Ronaldo việt vị (9:16)
const SPD = 1.15;
const T0 = [[0.0, 1.633], [3.793, 11.54], [11.86, 21.329], [21.649, 28.474], [28.794, 33.903999999999996], [34.224000000000004, 40.172], [40.492000000000004, 46.416], [46.736000000000004, 50.81399999999999], [51.134, 56.31999999999999], [56.64, 60.507999999999996], [60.828, 67.667], [67.98700000000001, 75.937], [76.257, 83.08200000000001], [83.402, 90.214], [90.534, 100.06400000000001]];
const T = T0.map(([a, b]) => [a / SPD, b / SPD]);
export const CRV_DUR = Math.round((100.06400000000001 / SPD + 3.6) * 30) / 30;
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
	<Img src={staticFile(`crv/bg_${n}.jpg`)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.38, mixBlendMode: 'multiply', filter: 'contrast(1.1)', transformOrigin: '30% 30%', transform: `scale(${1.16 + 0.06 * (t / Math.max(d, 1))}) translateX(${-20 * t / Math.max(d, 1)}px)`}} />
	<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(233,233,231,.9) 0%, rgba(233,233,231,.25) 45%, transparent 70%)'}} />{children}</Paper>;
const Fig: React.FC<{n: string; x: number; y: number; h: number; t: number; a: number; crop?: number; flip?: boolean; from?: 'left' | 'right' | 'up' | 'none'; out?: number; dim?: number; shake?: number; ghost?: boolean; drop?: number}> = ({n, x, y, h, t, a, crop = 1, flip, from = 'none', out = 1e9, dim = 0, shake = 0, ghost = true, drop}) => {
	const [w0, h0] = SIZE[n]; const w = (w0 / h0) * h;
	const u = E(t, a, a + 0.6, Easing.out(Easing.back(1.4)));
	const o = 1 - E(t, out, out + 0.35, Easing.in(Easing.cubic));
	const dx = (from === 'left' ? -700 * (1 - u) : from === 'right' ? 700 * (1 - u) : 0) + Math.sin(t * 0.7 + x * 0.01) * 14;
	const dy = from === 'up' ? -300 * (1 - u) : from === 'none' ? 60 * (1 - E(t, a, a + 0.5)) : 0;
	const vis = h * crop, g = h * 0.019;
	const rot = drop !== undefined ? 90 * E(t, drop, drop + 0.45, Easing.in(Easing.quad)) : 0;
	const im = (gh: boolean) => <Img src={staticFile(`crv/${n}.png`)} style={{position: 'absolute', left: gh ? -g : 0, top: gh ? g * 0.15 : 0, width: w, height: h, transform: flip ? 'scaleX(-1)' : undefined, filter: gh ? 'grayscale(1) brightness(.35)' : dim ? `brightness(${1 - dim}) grayscale(${dim})` : undefined, opacity: gh ? 0.35 : 1}} />;
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
type Dot = {x: number; y: number; c: string; n?: string; hi?: number; dim?: number; up?: boolean};
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
					{d.n && <div style={{position: 'absolute', left: -110, top: d.up ? -40 : 54, zIndex: 5, width: 268, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 2, color: INK, textTransform: 'uppercase'}}>{d.n}</div>}
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
			{t >= a - 0.05 && <Sequence from={start} layout="none"><OffthreadVideo src={staticFile('crv/clip.mp4')} startFrom={Math.round(s0 * 30)} endAt={Math.round(s1 * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>}
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
const FullVid: React.FC<{t: number; a: number; s0: number; s1: number}> = ({t, a, s0, s1}) => {const f = useCurrentFrame(); const start = f - Math.round((t - a) * 30); return <AbsoluteFill style={{background: '#000'}}>{t >= a - 0.05 && <Sequence from={start} layout="none"><OffthreadVideo src={staticFile('crv/clip.mp4')} startFrom={Math.round(s0 * 30)} endAt={Math.round(s1 * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>}</AbsoluteFill>;};
const VNB_: Dot[] = [[34, 6], [54, 20], [41, 18], [27, 18], [14, 20], [44, 30], [24, 30], [58, 38], [34, 34], [10, 38], [34, 46]].map(([x, y]) => ({x, y, c: RED}));
const BEB_: Dot[] = [[34, 99], [56, 70], [42, 82], [26, 82], [12, 70], [40, 62], [28, 62], [60, 50], [34, 54], [8, 50], [34, 44]].map(([x, y]) => ({x, y, c: INK}));

const Rain: React.FC<{t: number; a: number}> = ({t, a}) => <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: E(t, a, a + 0.4), zIndex: 6, pointerEvents: 'none'}}>{Array.from({length: 70}).map((_, k) => {const x = (k * 157) % W; const sp = 900 + (k * 37) % 500; const y = ((t * sp + k * 211) % (H + 200)) - 100; return <line key={k} x1={x} y1={y} x2={x - 8} y2={y + 46} stroke="#5a6b7a" strokeWidth={3} opacity={0.45} />;})}</svg>;
const Flag: React.FC<{x: number; y: number; w: number; t: number; a: number}> = ({x, y, w, t, a}) => {const u = E(t, a, a + 0.35, Easing.out(Easing.back(2))); const h = w * 2 / 3; const R5 = h * 0.3; const pts = Array.from({length: 10}).map((_, k) => {const ang = -Math.PI / 2 + k * Math.PI / 5; const rr = k % 2 ? R5 * 0.382 : R5; return `${w / 2 + rr * Math.cos(ang)},${h / 2 + rr * Math.sin(ang)}`;}).join(' ');
	return <svg width={w} height={h} style={{position: 'absolute', left: x, top: y, opacity: Math.min(1, u), transform: `scale(${u}) rotate(-3deg)`, filter: 'drop-shadow(6px 8px 0 rgba(0,0,0,.25))', zIndex: 5}}><rect width={w} height={h} fill="#DA251D" /><polygon points={pts} fill="#FFDD00" /></svg>;};
const Tag: React.FC<{x: number; y: number; t: number; a: number; n: string; c?: string; size?: number}> = ({x, y, t, a, n, c = INK, size = 34}) => <Club x={x} y={y} t={t} a={a} name={n} c={c} size={size} />;
const GOALS: (Dot & {t: number})[] = [
	{x: 18, y: 5, c: INK, n: "19' NZ", t: 0}, {x: 34, y: 9, c: INK, n: "52' NZ ↑", t: 1}, {x: 50, y: 5, c: INK, n: "66' NZ ↑", t: 2},
	{x: 50, y: 82, c: RED, n: "49' LỰC", t: 3}, {x: 18, y: 96, c: RED, n: "59' ĐẠI NHÂN", t: 4}, {x: 42, y: 101, c: RED, n: "90+2' DUY KHANG ↑", t: 5},
];
const GoalMap: React.FC<{t: number; a: number; step: number; only?: 'nz' | 'vn'}> = ({t, a, step, only}) => <Pitch t={t} a={a} top={420} dots={GOALS.filter(g => (only !== 'vn' || g.c === RED) && (only !== 'nz' || g.c === INK) && t > a + g.t * step)} label="SƠ ĐỒ MINH HOẠ · 6 BÀN THẮNG" />;
const Coin: React.FC<{t: number; a: number; side?: number}> = ({t, a, side = 0}) => {const u = E(t, a, a + 1.2, Easing.out(Easing.cubic)); const rot = lerp(0, 720 + side * 180, u); return <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `perspective(1600px) rotateY(${rot}deg)`, transformOrigin: '540px 1300px'}}><Fig n="coin" x={540} y={1800} h={950} t={t} a={a} ghost={false} /></div>;};
// offside diagram (sơ đồ minh hoạ)
const OFF_DEF: Dot[] = [[12, 80], [26, 81], [40, 80], [54, 79.5], [20, 70], [38, 69], [50, 72]].map(([x, y]) => ({x, y, c: INK}));
const YEL = '#E3B007';
const BigNum: React.FC<{t: number; a: number; txt: string; y?: number; size?: number; c?: string; roll?: number; to?: string; out?: number}> = ({t, a, txt, y = 520, size = 520, c = RED, roll = 1e9, to, out = 1e9}) => {
	const u = E(t, a, a + 0.7, Easing.out(Easing.cubic)); const o = 1 - E(t, out, out + 0.4);
	const rk = E(t, roll, roll + 0.6, Easing.inOut(Easing.back(1.6)));
	const shake = t > roll && t < roll + 0.6 ? Math.sin(t * 60) * 6 * (1 - rk) : 0;
	const head = txt.slice(0, -1), last = txt.slice(-1), nl = to ? to.slice(-1) : last;
	const st: React.CSSProperties = {fontFamily: SERIF, fontWeight: 900, fontStyle: 'italic', fontSize: size, lineHeight: 1, letterSpacing: -20, WebkitTextStroke: `4px ${INK}`, mixBlendMode: 'multiply'};
	const col = to && rk > 0.5 ? INK : c;
	return <div style={{position: 'absolute', left: 0, top: y, width: W, textAlign: 'center', zIndex: 1, opacity: u * o * 0.92, transform: `scale(${lerp(1.25, 1, u) + 0.04 * Math.max(0, t - a) / 5}) translate(${shake}px, ${-6 * t}px)`}}>
		<span style={{...st, color: col}}>{head}</span>
		<span style={{display: 'inline-block', position: 'relative', height: size * 1.05, overflow: 'hidden', verticalAlign: 'top', paddingRight: size * 0.18, marginRight: -size * 0.18}}>
			<span style={{display: 'block', ...st, color: col, transform: `translateY(${rk * size * 1.4}px)`}}>{last}</span>
			{rk > 0 && <span style={{position: 'absolute', left: 0, top: 0, display: 'block', ...st, color: col, transform: `translateY(${(rk - 1) * size * 1.4}px)`}}>{nl}</span>}
		</span></div>;};
const OffMap: React.FC<{t: number; a: number; pass?: number; line?: number; run?: number; cross?: number; hiA?: boolean; zoom?: number}> = ({t, a, pass = 1e9, line = 1e9, run = 1e9, cross = 1e9, hiA, zoom = 1.2}) => {
	const ru = E(t, run, run + 0.8, Easing.inOut(Easing.cubic));
	const ang: Dot = {x: lerp(57, 55, ru), y: lerp(86, 95, ru), c: YEL, n: 'Angelo', up: true, hi: hiA ? 1 + 0.4 * Math.sin(t * 6) : 0};
	const nas: Dot[] = [{x: 30, y: 52, c: YEL, n: 'Simakan'}, {x: 34, y: lerp(79, 96, E(t, cross - 0.3, cross + 0.4)), c: YEL, n: 'Ronaldo'}, {x: 18, y: 76, c: YEL}, {x: 46, y: 77, c: YEL}, ang];
	const lu = E(t, line, line + 0.5);
	return <Pitch t={t} a={a} top={430} zoom={zoom} zy={78} dots={[...OFF_DEF, ...nas]} label="SƠ ĐỒ MINH HOẠ · PHÚT 35">
		<div style={{position: 'absolute', left: 0, top: PH - 79.5 * PS - 3, width: PW * lu, height: 6, background: `repeating-linear-gradient(90deg, ${RED} 0 22px, transparent 22px 36px)`}} />
		{lu > 0.9 && <div style={{position: 'absolute', left: 8, top: PH - 79.5 * PS - 44, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: RED}}>ĐƯỜNG VIỆT VỊ</div>}
		<PLine pts={[[30, 52], [56, 85]]} t={t} a={pass} c={INK} dash="1 0" w={6} />
		<PLine pts={[[55, 95], [35, 96]]} t={t} a={cross} c={INK} dash="1 0" w={6} />
		{hiA && <Zone x={57} y={86} r={7} t={t} a={line + 0.3} />}
	</Pitch>;
};

const Rewind: React.FC<{t: number; children: React.ReactNode}> = ({t, children}) => {
	const on = t < 0.9;
	return <AbsoluteFill>
		<AbsoluteFill style={{filter: on ? `blur(${1.5}px) contrast(1.2)` : undefined, transform: on ? `translateX(${Math.sin(t * 90) * 6}px)` : undefined}}>{children}</AbsoluteFill>
		{on && <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.08) 0 3px, transparent 3px 7px)', backgroundPositionY: `${t * 900}px`}} />}
		{on && <div style={{position: 'absolute', left: 80, top: 210, fontFamily: MONO, fontWeight: 700, fontSize: 64, letterSpacing: 6, color: RED, opacity: Math.floor(t * 6) % 2 ? 1 : 0.55}}>◀◀ TUA LẠI</div>}
	</AbsoluteFill>;
};
const Freeze: React.FC<{t: number; a: number; b: number}> = ({t, a, b}) => {
	const u = E(t, a, a + 0.15) * (1 - E(t, b, b + 0.25));
	return <>
		<AbsoluteFill style={{background: '#fff', opacity: E(t, a, a + 0.05) * (1 - E(t, a + 0.05, a + 0.3)) * 0.7}} />
		<div style={{position: 'absolute', left: 80, top: 210, fontFamily: MONO, fontWeight: 700, fontSize: 56, letterSpacing: 6, color: INK, opacity: u}}>❚❚ ĐÓNG BĂNG</div>
		<div style={{position: 'absolute', left: 80, top: 290, fontFamily: MONO, fontSize: 30, letterSpacing: 3, color: '#555', opacity: u}}>KHOẢNH KHẮC SIMAKAN CHUYỀN</div>
	</>;
};

const SHOTS: Shot[] = [
	{i: 0, trans: 'cut', C: (t, R) => <Paper>
		<AbsoluteFill style={{transform: `scale(${lerp(1, 2.3, E(t, 0, 1.3, Easing.inOut(Easing.cubic)))})`, transformOrigin: '862px 625px'}}>
			<OffMap t={t} a={-1} pass={-9} hiA />
		</AbsoluteFill>
		<S x={80} y={1380} t={t} a={R(0, 0.05)} size={72} w={920}>Ông này <B c={RED}>đi lạc</B> vào trận đấu hay sao?</S>
	</Paper>},
	{i: 1, trans: 'left', C: (t, R) => <Paper>
		<BigNum t={t} a={0.05} txt="988" to="987" y={380} roll={R(1, 0.3)} />
		<S x={80} y={200} t={t} a={R(1, 0.55)} size={54} w={920}>Thủ phạm: <B c={RED}>đồng đội</B></S>
		<Fig n="cr_shock" x={540} y={1790} h={1150} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 2, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={200} t={t} a={0.1} size={46} w={920}>Phút 13 · phạt đền</S>
		<BigNum t={t} a={0.1} txt="987" y={360} c={INK} out={R(2, 0.6)} />
		<BigNum t={t} a={R(2, 0.6)} txt="-13" y={360} />
		<Fig n="cr_pen" x={540} y={1790} h={1100} t={t} a={0.1} from="right" />
	</Paper>},
	{i: 3, trans: 'up', C: (t, R) => <Paper>
		<Rewind t={t}>
			<OffMap t={t < 0.9 ? 0.9 + (0.9 - t) * 3 : t} a={0.05} pass={1.0} line={1.5} run={Math.max(3.4, R(3, 0.5))} cross={Math.max(4.4, R(3, 0.72))} />
		</Rewind>
		<Freeze t={t} a={1.4} b={3.1} />
	</Paper>},
	{i: 4, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={52} w={920}>Ngon như <B c={RED}>sách giáo khoa</B></S>
		<Fig n="cr_siuu" x={540} y={1790} h={1150} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 5, trans: 'up', C: (t, R) => <Paper>
		<Stamp x={140} y={220} t={t} a={R(5, 0.15)} text="VAR · VIỆT VỊ" />
		<S x={80} y={420} t={t} a={R(5, 0.55)} size={54} w={920}>Không phải Ronaldo. <B c={RED}>Là Angelo.</B></S>
		<Fig n="var_tv" x={540} y={1790} h={1000} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 6, trans: 'left', C: (t, R) => <Paper>
		<OffMap t={t} a={0.05} pass={-9} line={R(6, 0.2)} hiA />
	</Paper>},
	{i: 7, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={50} w={920}>Đứng như <B c={RED}>chờ đi nhậu</B> sau trận</S>
		<Fig n="angelo_bike" x={540} y={1790} h={1100} t={t} a={0.1} from="right" />
	</Paper>},
	{i: 8, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={50} w={920}>Luật việt vị <B c={RED}>không chấm dáng đứng</B></S>
		<Fig n="flag" x={540} y={1790} h={1050} t={t} a={0.15} from="up" />
	</Paper>},
	{i: 9, trans: 'up', C: (t, R) => <Paper>
		<Stamp x={140} y={220} t={t} a={R(9, 0.3)} text="CHẾT TỪ TRƯỚC" />
		<Fig n="net" x={720} y={1600} h={700} t={t} a={0.05} from="none" />
		<Fig n="cr_tap" x={420} y={1790} h={1000} t={t} a={0.15} from="left" />
	</Paper>},
	{i: 10, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={46} w={920}>Chọn chỗ ✓ · Chờ bóng ✓ · Đệm vào ✓</S>
		<S x={80} y={330} t={t} a={R(10, 0.6)} size={46} w={920}>Đồng đội đứng đúng chỗ <B c={RED}>✗</B></S>
		<Fig n="angelo" x={540} y={1790} h={1100} t={t} a={R(10, 0.55)} from="right" />
	</Paper>},
	{i: 11, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={200} t={t} a={0.1} size={48} w={920}>Người cản đường <B c={RED}>mặc chung áo</B></S>
		<BigNum t={t} a={0.1} txt="41" y={420} size={600} c={INK} />
		<Fig n="cr_old" x={540} y={1790} h={1100} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 12, trans: 'left', C: (t, R) => <Paper>
		<Board t={t} a={0.1} y={220} l="AL NASSR" r="AL SADD" mid="2–1" />
		<BigNum t={t} a={R(12, 0.55)} txt="987" y={420} size={420} c={INK} />
		<Fig n="felix" x={540} y={1790} h={1100} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 13, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={50} w={920}>Ghi dư vài bàn <B c={RED}>dự phòng</B></S>
		<BigNum t={t} a={0.05} txt="1000" y={360} size={380} />
		<Fig n="sign1000" x={540} y={1790} h={1050} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 14, trans: 'left', C: (t, R) => <Paper>
		<S x={80} y={220} t={t} a={0.1} size={50} w={920}>Lỗi của Angelo, hay của <B c={RED}>cái thước VAR</B>?</S>
		<Fig n="ruler" x={540} y={1790} h={1000} t={t} a={0.1} from="up" />
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
export const CRVVideo: React.FC = () => {
	const f = useCurrentFrame(), t = f / 30, D = CRV_DUR;
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
		<div style={{position: 'absolute', right: 30, bottom: 120, fontFamily: MONO, fontSize: 16, color: '#888', opacity: E(t, D - 9, D - 8.5) * (1 - E(t, D - 3.2, D - 3))}}>hình minh hoạ · nguồn: AFC, Goal, VAVEL · sơ đồ minh hoạ</div>
		<AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'multiply'}}><Img src={staticFile(`tex/noise${Math.floor(f / 3) % 4}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
		<AbsoluteFill style={{background: '#000', opacity: E(t, D - 0.6, D - 0.05)}} />
		<Audio src={staticFile('crv/mix.wav')} />
	</AbsoluteFill>;
};

// ================= MOTION TEST (15s) =================
type Key = [number, number, number, number]; // t, cx, cy, scale
const camAt = (t: number, K: Key[]) => {
	if (t <= K[0][0]) return K[0];
	for (let k = 0; k < K.length - 1; k++) {
		const [t0, x0, y0, s0] = K[k], [t1, x1, y1, s1] = K[k + 1];
		if (t <= t1) {const u = interpolate(t, [t0, t1], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)}); return [t, lerp(x0, x1, u), lerp(y0, y1, u), s0 * Math.pow(s1 / s0, u)] as Key;}
	}
	return K[K.length - 1];
};
// kinetic word: pops in with overshoot
const Wd: React.FC<{t: number; a: number; children: React.ReactNode; size?: number; c?: string; mono?: boolean; strike?: number; out?: number; rot?: number}> = ({t, a, children, size = 64, c = INK, mono, strike = 1e9, out = 1e9, rot = 0}) => {
	const u = E(t, a, a + 0.35, Easing.out(Easing.back(2.2))), o = 1 - E(t, out, out + 0.25);
	const sk = E(t, strike, strike + 0.25);
	return <span style={{display: 'inline-block', position: 'relative', marginRight: size * 0.25, fontFamily: mono ? MONO : SERIF, fontWeight: mono ? 700 : 400, letterSpacing: mono ? 3 : 0, fontSize: size, color: c, lineHeight: 1.15, opacity: Math.min(1, u * 2) * o, transform: `translateY(${(1 - u) * 40}px) scale(${lerp(0.6, 1, u)}) rotate(${(1 - u) * rot}deg)`, transformOrigin: '50% 80%'}}>
		{children}
		{sk > 0 && <span style={{position: 'absolute', left: -6, top: '52%', height: size * 0.09, width: `calc(${sk * 100}% + 12px)`, background: RED, transform: 'rotate(-3deg)'}} />}
	</span>;
};
// puppet: upper body rotates about a neck pivot, lower body breathes
const Puppet: React.FC<{n: string; x: number; y: number; h: number; t: number; a: number; cut: number; sway: (t: number) => number; lean?: number; from?: 'left' | 'right' | 'up' | 'none'; mask?: string; ghost?: boolean}> = ({n, x, y, h, t, a, cut, sway, lean = 0, from = 'up', mask, ghost = true}) => {
	const [w0, h0] = SIZE[n]; const w = (w0 / h0) * h;
	const u = E(t, a, a + 0.55, Easing.out(Easing.back(1.5)));
	const dx = from === 'left' ? -800 * (1 - u) : from === 'right' ? 800 * (1 - u) : 0, dy = from === 'up' ? -500 * (1 - u) : 0;
	const sq = 1 + 0.12 * Math.max(0, 1 - Math.abs(t - a - 0.45) * 6) * (from === 'up' ? 1 : 0);
	const im = (part: 'top' | 'bot', gh: boolean) => <Img src={staticFile(`crv/${n}.png`)} style={{position: 'absolute', left: gh ? -h * 0.019 : 0, top: gh ? h * 0.003 : 0, width: w, height: h, opacity: gh ? 0.35 : 1, filter: gh ? 'grayscale(1) brightness(.35)' : undefined,
		clipPath: part === 'top' ? `inset(0 -30% ${100 - cut - 2}% -30%)` : `inset(${cut}% -30% -5% -30%)`,
		transformOrigin: `50% ${cut}%`, transform: part === 'top' ? `rotate(${sway(t)}deg)` : `scaleY(${1 + 0.012 * Math.sin(t * 2.2)})`,
		WebkitMaskImage: mask, maskImage: mask}} />;
	return <div style={{position: 'absolute', left: x - w / 2 + dx, top: y - h + dy, width: w, height: h, zIndex: 2, transformOrigin: '50% 100%', transform: `rotate(${lean}deg) scale(${1 / sq}, ${sq})`, opacity: Math.min(1, u * 1.5)}}>
		{ghost && im('bot', true)}{ghost && im('top', true)}{im('bot', false)}{im('top', false)}
	</div>;
};
const Ball: React.FC<{x: number; y: number; r: number; spin: number}> = ({x, y, r: rr, spin}) => <svg width={rr * 2} height={rr * 2} viewBox="-50 -50 100 100" style={{position: 'absolute', left: x - rr, top: y - rr, zIndex: 3, transform: `rotate(${spin}deg)`, overflow: 'visible', filter: 'drop-shadow(-6px 4px 0 rgba(0,0,0,.3))'}}>
	<circle r={48} fill="#f4f1ea" stroke={INK} strokeWidth={5} />
	<polygon points="0,-17 16,-5 10,14 -10,14 -16,-5" fill={INK} />
	{[0, 72, 144, 216, 288].map((d) => <g key={d} transform={`rotate(${d})`}><line x1={0} y1={-17} x2={0} y2={-34} stroke={INK} strokeWidth={4} /><path d="M -12 -44 L 0 -34 L 12 -44" fill="none" stroke={INK} strokeWidth={4} /></g>)}
</svg>;
const qb = (p0: number[], p1: number[], p2: number[], u: number) => [(1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0], (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1]];

export const CRVM_DUR = Math.round((T[2][1] + 0.6) * 30);
export const CRVMotion: React.FC = () => {
	const f = useCurrentFrame(), t = f / 30;
	const L1 = T[1][0], L2 = T[2][0];
	const rl = (i: number, fr: number) => r(i, fr);
	const BY = 2300, CX = 1500; // zone B origin y, zone C origin x (zone C at y=BY)
	const K: Key[] = [[0, 540, 960, 1.0], [1.25, 862, 640, 2.1], [1.75, 760, 1900, 0.62], [2.5, 540, BY + 960, 1.0], [L2 - 0.6, 540, BY + 900, 1.07], [L2 + 0.2, CX + 540, BY + 960, 0.95], [rl(2, 0.5), CX + 520, BY + 1050, 1.08], [rl(2, 0.62), CX + 640, BY + 820, 1.16], [T[2][1] + 0.6, CX + 560, BY + 900, 1.02]];
	const [, cx, cy, sc] = camAt(t, K);
	const world = (par = 1) => `translate(${W / 2 - cx * sc * par}px, ${H / 2 - cy * sc * par}px) scale(${sc})`;
	// ball: rolls from Angelo down to Ronaldo (zone B), later a new ball kicked in zone C
	const P0 = [862, 625], P1 = [1150, 1500], P2 = [700, BY + 1770];
	const bu = E(t, 1.35, 2.45, Easing.inOut(Easing.quad));
	const bp = qb(P0, P1, P2, bu);
	const kick = rl(2, 0.55);
	const ku = E(t, kick, kick + 0.45, Easing.out(Easing.quad));
	const K0 = [CX + 549, BY + 1747], K2 = [CX + 840, BY + 560];
	const kp = qb(K0, [CX + 700, BY + 900], K2, ku);
	const goal = kick + 0.45;
	const flash = E(t, goal, goal + 0.04) * (1 - E(t, goal + 0.04, goal + 0.3));
	const shake = t > goal && t < goal + 0.4 ? Math.sin(t * 70) * 10 * (1 - (t - goal) / 0.4) : 0;
	const tb = t - L1; // zone B local time
	const tc = t - L2; // zone C local time
	const cnt = t < rl(1, 0.3) ? 988 : 987;
	const hud = E(t, rl(1, 0.35), rl(1, 0.45));
	const prog = E(t, rl(2, 0.8), rl(2, 0.95));
	return <AbsoluteFill style={{background: '#e9e9e7', overflow: 'hidden'}}>
		<Img src={staticFile('mz/paper.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, mixBlendMode: 'multiply'}} />
		{/* parallax far layer */}
		<AbsoluteFill style={{transform: world(0.45), transformOrigin: '0 0'}}>
			{[[200, 300, 380], [1300, 1600, 520], [300, 3300, 460], [2400, 2700, 600], [2100, 4200, 420]].map(([x, y, rr], k) => <div key={k} style={{position: 'absolute', left: x - rr, top: y - rr, width: rr * 2, height: rr * 2, borderRadius: '50%', border: `3px dashed rgba(198,40,40,.18)`}} />)}
		</AbsoluteFill>
		<AbsoluteFill style={{transform: `${world()} translate(${shake}px, ${shake * 0.4}px)`, transformOrigin: '0 0'}}>
			{/* zone A: pitch diagram */}
			<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}>
				<OffMap t={t + 5} a={-1} pass={-9} hiA />
				<div style={{position: 'absolute', left: 600, top: 215, width: 480}}>
					<Wd t={t} a={0.05} size={58}>Ông</Wd><Wd t={t} a={0.25} size={58}>này</Wd><br />
					<Wd t={t} a={0.45} size={70} c={RED} rot={-8}><i><b>đi lạc</b></i></Wd><br />
					<Wd t={t} a={0.8} size={40}>vào trận đấu</Wd><Wd t={t} a={1.05} size={40}>hay sao?</Wd>
				</div>
			</div>
			{/* rolling-ball trail */}
			<svg width={3000} height={5000} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
				<path d={`M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="4 22" strokeLinecap="round" pathLength={1000} style={{strokeDashoffset: 0, clipPath: 'none'}} opacity={bu > 0 ? 0.55 : 0} strokeDashoffset={0} />
			</svg>
			{bu > 0 && bu < 1 && <Ball x={bp[0]} y={bp[1]} r={38} spin={bu * 900} />}
			{t >= L2 - 0.7 && t < L2 + 0.5 && <Ball x={lerp(700, CX + 549, E(t, L2 - 0.7, L2 + 0.5, Easing.inOut(Easing.quad)))} y={lerp(BY + 1770, BY + 1747, E(t, L2 - 0.7, L2 + 0.5)) - Math.abs(Math.sin(t * 7)) * 40 * (1 - E(t, L2 - 0.7, L2 + 0.5))} r={lerp(38, 80, E(t, L2 - 0.7, L2 + 0.5))} spin={t * 600} />}
			{/* zone B: 988 */}
			<div style={{position: 'absolute', left: 0, top: BY, width: W, height: H}}>
				<BigNum t={tb} a={0.05} txt="988" to="987" y={360} roll={rl(1, 0.3) - L1} />
				<Puppet n="cr_shock" x={540} y={1790} h={1150} t={tb} a={0.15} cut={30} sway={(tt) => Math.sin(tt * 2.6) * 3 + (tt > rl(1, 0.3) - L1 ? Math.sin(tt * 9) * 2 * Math.max(0, 1 - (tt - (rl(1, 0.3) - L1)) / 1.5) : 0)} />
				{bu >= 1 && t < L2 - 0.7 && <Ball x={700 + Math.sin(tb * 2) * 4} y={1770 - Math.abs(Math.sin(tb * 5)) * 18 * Math.max(0, 1 - (t - 2.45) / 2)} r={38} spin={tb * 40} />}
				<div style={{position: 'absolute', left: 70, top: 170, width: 940}}>
					<Wd t={t} a={rl(1, 0.3)} size={62}>Rồi</Wd><Wd t={t} a={rl(1, 0.36)} size={62} c={RED}><i><b>bị huỷ.</b></i></Wd>
				</div>
				<div style={{position: 'absolute', left: 70, top: 1240, width: 940, zIndex: 4}}>
					<Wd t={t} a={rl(1, 0.47)} size={46} mono>THỦ PHẠM:</Wd><br />
					<Wd t={t} a={rl(1, 0.56)} size={56} strike={rl(1, 0.64)}>hậu vệ</Wd>
					<Wd t={t} a={rl(1, 0.66)} size={56} strike={rl(1, 0.74)}>trọng tài</Wd><br />
					<Wd t={t} a={rl(1, 0.8)} size={96} c={RED} rot={-6}><i><b>đồng đội</b></i></Wd>
				</div>
				<Puppet n="angelo" x={930} y={1820} h={820} t={tb} a={rl(1, 0.8) - L1} cut={24} from="right" sway={(tt) => Math.sin(tt * 1.8) * 4} />
			</div>
			{/* zone C: penalty 987 */}
			<div style={{position: 'absolute', left: CX, top: BY, width: W, height: H}}>
				<div style={{position: 'absolute', left: 60, top: 180, width: 960, opacity: 1 - E(t, rl(2, 0.74), rl(2, 0.78))}}>
					<Wd t={t} a={L2 + 0.05} size={46} mono c={'#8a6d00'}>AL NASSR</Wd><Wd t={t} a={L2 + 0.3} size={46} mono>VS</Wd><Wd t={t} a={L2 + 0.55} size={46} mono>AL SADD</Wd><br />
					<Wd t={t} a={rl(2, 0.2)} size={34} mono c={'#666'}>AFC CHAMPIONS LEAGUE ELITE</Wd><br />
					<Wd t={t} a={rl(2, 0.38)} size={70}>Phút</Wd><Wd t={t} a={rl(2, 0.41)} size={70} c={RED}><b>13'</b></Wd><Wd t={t} a={rl(2, 0.45)} size={70}>· phạt đền</Wd>
				</div>
				<Img src={staticFile('crv/net.png')} style={{position: 'absolute', left: 560, top: 380, width: 520, transform: `translate(${t > goal ? Math.sin(t * 50) * 8 * Math.max(0, 1 - (t - goal) / 0.6) : 0}px, 0) scale(${1 + 0.05 * Math.max(0, 1 - Math.abs(t - goal) * 4)})`, opacity: E(t, L2, L2 + 0.4)}} />
				<Puppet n="cr_pen" x={520} y={1810} h={1150} t={tc} a={-0.55} cut={34} from="left" ghost
					lean={t < kick - 0.6 ? 0 : t < kick ? -4 * E(t, kick - 0.6, kick) : -4 + 10 * E(t, kick, kick + 0.18) - 6 * E(t, kick + 0.3, kick + 1)}
					sway={(tt) => Math.sin(tt * 2) * 1.5}
					mask={t > kick || t < L2 + 0.48 ? 'radial-gradient(circle at 53.5% 94.5%, transparent 0 10%, black 10.5%)' : undefined} />
				{t > kick && ku < 1 && <Ball x={kp[0] - CX} y={kp[1] - BY} r={lerp(80, 30, ku)} spin={ku * 1400} />}
				{t > kick && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, zIndex: 1}}><path d={`M ${K0[0] - CX} ${K0[1] - BY} Q ${CX + 700 - CX} ${BY + 900 - BY} ${kp[0] - CX} ${kp[1] - BY}`} fill="none" stroke={RED} strokeWidth={8} strokeDasharray="2 20" strokeLinecap="round" opacity={0.7 * (1 - E(t, goal + 0.5, goal + 1))} /></svg>}
				{/* progress to 1000 */}
				<div style={{position: 'absolute', left: 70, top: 200, width: 940, zIndex: 4, opacity: E(t, rl(2, 0.78), rl(2, 0.82))}}>
					<div style={{fontFamily: MONO, fontSize: 34, letterSpacing: 3, display: 'flex', justifyContent: 'space-between'}}><span>987</span><span style={{color: RED, fontWeight: 700}}>CÒN {Math.round(lerp(0, 13, prog))} BÀN</span><span>1000</span></div>
					<div style={{height: 22, border: `3px solid ${INK}`, marginTop: 10, position: 'relative', background: 'rgba(255,255,255,.4)'}}>
						<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${98.7 * E(t, rl(2, 0.78), rl(2, 0.86))}%`, background: INK}} />
						<div style={{position: 'absolute', left: '98.7%', top: -8, bottom: -8, width: `${1.3 * prog}%`, background: RED}} />
					</div>
				</div>
			</div>
		</AbsoluteFill>
		{/* sticky HUD counter: carries across scenes */}
		<div style={{position: 'absolute', left: 40, top: 40, padding: '10px 18px', border: `3px solid ${INK}`, background: 'rgba(233,233,231,.9)', fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: 2, opacity: hud * (1 - E(t, rl(2, 0.76), rl(2, 0.8))), transform: `translateY(${(1 - hud) * -80}px) scale(${1 + 0.15 * Math.max(0, 1 - Math.abs(t - goal) * 4)})`, transformOrigin: '0 0'}}>
			BÀN THẮNG: <span style={{color: RED}}>{cnt}</span>
		</div>
		<Img src={staticFile('mu/logo.png')} style={{position: 'absolute', right: 36, top: 30, width: 92, height: 92, borderRadius: '50%', opacity: 0.92}} />
		<AbsoluteFill style={{background: '#fff', opacity: flash * 0.6}} />
		<AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'multiply'}}><Img src={staticFile(`tex/noise${Math.floor(f / 3) % 4}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
		<Audio src={staticFile('crv/mixm.wav')} endAt={CRVM_DUR} volume={(fr) => 1 - E(fr / 30, CRVM_DUR / 30 - 0.5, CRVM_DUR / 30)} />
	</AbsoluteFill>;
};

// ================= FULL MOTION VERSION =================
const ZN: [number, number][] = [[0, 0], [0, 2300], [1500, 2300], [3000, 2300], [3000, 4600], [1500, 4600], [0, 4600], [0, 6900], [1500, 6900], [3000, 6900], [3000, 9200], [1500, 9200], [0, 9200], [0, 11500], [1500, 11500]];
const zc = (i: number): [number, number] => [ZN[i][0] + 540, ZN[i][1] + 960];
const Lw: React.FC<{x: number; y: number; w?: number; z?: number; children: React.ReactNode}> = ({x, y, w = 940, z = 4, children}) => <div style={{position: 'absolute', left: x, top: y, width: w, zIndex: z}}>{children}</div>;
export const CRVF_DUR = Math.round(CRV_DUR * 30);
export const CRVFull: React.FC = () => {
	const f = useCurrentFrame(), t = f / 30, D = CRV_DUR;
	const s0 = (i: number) => T[i][0];
	const rl = (i: number, fr: number) => r(i, fr);
	const L1 = s0(1), L2 = s0(2);
	const BY = 2300, CX = 1500;
	const kick = rl(2, 0.55), goal = kick + 0.45;
	// ---- camera ----
	const K: Key[] = [[0, 540, 960, 1.0], [0.7, 560, 900, 1.05], [2.0, 862, 560, 1.7], [L1 - 0.45, 850, 570, 1.8], [L1 + 0.05, 760, 1900, 0.62], [L1 + 0.8, 540, BY + 960, 1.0], [L2 - 0.6, 540, BY + 900, 1.07], [L2 + 0.2, CX + 540, BY + 960, 0.95], [rl(2, 0.5), CX + 540, BY + 1000, 1.04], [rl(2, 0.62), CX + 580, BY + 900, 1.07], [s0(3) - 0.55, CX + 560, BY + 900, 1.06]];
	for (let i = 3; i < 15; i++) {
		const [px, py] = zc(i - 1), [nx, ny] = zc(i);
		if (i > 3) K.push([s0(i) - 0.55, px, py - 30, 1.07]);
		K.push([s0(i) - 0.1, (px + nx) / 2, (py + ny) / 2, 0.66]);
		K.push([s0(i) + 0.4, nx, ny, 1.0]);
	}
	K.push([D - 3.4, zc(14)[0], zc(14)[1] - 30, 1.07]);
	K.sort((a, b) => a[0] - b[0]);
	const [, cx, cy, sc] = camAt(t, K);
	const world = (par = 1) => `translate(${W / 2 - cx * sc * par}px, ${H / 2 - cy * sc * par}px) scale(${sc})`;
	// ---- balls ----
	const P0 = [862, 625], P1 = [1150, 1500], P2 = [700, BY + 1770];
	const bu = E(t, L1 - 0.35, L1 + 0.75, Easing.inOut(Easing.quad));
	const bp = qb(P0, P1, P2, bu);
	const ku = E(t, kick, kick + 0.45, Easing.out(Easing.quad));
	const K0 = [CX + 549, BY + 1747], K2 = [CX + 840, BY + 560];
	const kp = qb(K0, [CX + 700, BY + 900], K2, ku);
	const BR = (i: number) => [ZN[i][0] + 930, ZN[i][1] + 1800];
	let gball: number[] | null = null, gspin = 0;
	for (let i = 3; i < 15; i++) {
		const a = s0(i) - 0.6, b = s0(i) + 0.35, e = i + 1 < 15 ? s0(i + 1) - 0.6 : D - 3.4;
		const st = i === 3 ? K2 : BR(i - 1), en = BR(i);
		if (t >= a && t < b) {const u = E(t, a, b, Easing.inOut(Easing.quad)); gball = qb(st, [(st[0] + en[0]) / 2, Math.min(st[1], en[1]) - 600], en, u); gspin = t * 700;}
		else if (t >= b && t < e) {const d = t - b; gball = [en[0] + Math.sin(d * 1.5) * 6, en[1] - Math.abs(Math.sin(d * 6)) * 50 * Math.exp(-d * 2.5)]; gspin = d * 30;}
	}
	const flash = E(t, goal, goal + 0.04) * (1 - E(t, goal + 0.04, goal + 0.3));
	const shake = t > goal && t < goal + 0.4 ? Math.sin(t * 70) * 10 * (1 - (t - goal) / 0.4) : 0;
	// ---- HUD counter ----
	const cnt = t < rl(1, 0.3) ? 988 : t < rl(4, 0.35) ? 987 : t < rl(5, 0.15) ? 988 : 987;
	const bump = (x: number) => Math.max(0, 1 - Math.abs(t - x) * 4);
	const hudBump = bump(goal) + bump(rl(4, 0.35)) + bump(rl(5, 0.15));
	const hud = E(t, rl(1, 0.35), rl(1, 0.45)) * (1 - E(t, rl(2, 0.74), rl(2, 0.78)) + E(t, s0(3), s0(3) + 0.3)) * (1 - E(t, D - 3.4, D - 3.1));
	const hudRed = t > rl(5, 0.15) && t < rl(5, 0.15) + 1.2;
	const prog = E(t, rl(2, 0.8), rl(2, 0.95));
	const vis = (i: number) => t > s0(i) - 1.3 && t < (i + 1 < 15 ? s0(i + 1) + 1.0 : D);
	const zone = (i: number, node: (tl: number, R: (fr: number) => number) => React.ReactNode) => vis(i) ? <div key={i} style={{position: 'absolute', left: ZN[i][0], top: ZN[i][1], width: W, height: H}}>{node(t - s0(i), (fr) => rl(i, fr) - s0(i))}</div> : null;
	const w = (a: number, txt: React.ReactNode, o: Partial<React.ComponentProps<typeof Wd>> = {}) => <Wd t={t} a={a} {...o}>{txt}</Wd>;
	const tb = t - L1, tc = t - L2;
	return <AbsoluteFill style={{background: '#e9e9e7', overflow: 'hidden'}}>
		<Img src={staticFile('mz/paper.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, mixBlendMode: 'multiply'}} />
		<AbsoluteFill style={{transform: world(0.45), transformOrigin: '0 0'}}>
			{[[200, 300, 380], [1300, 1600, 520], [300, 3300, 460], [2400, 2700, 600], [2100, 4200, 420], [3600, 5200, 500], [800, 6200, 560], [2900, 7600, 480], [1200, 9000, 520], [300, 10900, 460], [2400, 11200, 540]].map(([x, y, rr], k) => <div key={k} style={{position: 'absolute', left: x - rr, top: y - rr, width: rr * 2, height: rr * 2, borderRadius: '50%', border: `3px dashed rgba(198,40,40,.18)`}} />)}
		</AbsoluteFill>
		<AbsoluteFill style={{transform: `${world()} translate(${shake}px, ${shake * 0.4}px)`, transformOrigin: '0 0'}}>
			{/* A: opening diagram, hold on Angelo */}
			{t < L1 + 1.2 && <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}>
				<OffMap t={t + 5} a={-1} pass={-9} hiA />
			</div>}
			{bu > 0 && bu < 1 && <Ball x={bp[0]} y={bp[1]} r={38} spin={bu * 900} />}
			{/* B: 988 */}
			{zone(1, (tl, R) => <>
				<BigNum t={tl} a={0.05} txt="988" to="987" y={360} roll={R(0.3)} out={R(0.43)} />
				<Puppet n="cr_shock" x={540} y={1790} h={1150} t={tl} a={0.15} cut={30} sway={(tt) => Math.sin(tt * 2.6) * 3 + (tt > R(0.3) ? Math.sin(tt * 9) * 2 * Math.max(0, 1 - (tt - R(0.3)) / 1.5) : 0)} />
				{bu >= 1 && t < L2 - 0.7 && <Ball x={700 + Math.sin(tl * 2) * 4} y={1770 - Math.abs(Math.sin(tl * 5)) * 18 * Math.max(0, 1 - (t - L1 - 0.75) / 2)} r={38} spin={tl * 40} />}
				<Lw x={70} y={170}>{w(rl(1, 0.3), 'Rồi', {size: 62})}{w(rl(1, 0.36), <i><b>bị huỷ.</b></i>, {size: 62, c: RED})}</Lw>
				<Lw x={70} y={330}>{w(rl(1, 0.47), 'THỦ PHẠM:', {size: 46, mono: true})}<br />{w(rl(1, 0.56), 'hậu vệ', {size: 56, strike: rl(1, 0.64)})}{w(rl(1, 0.66), 'trọng tài', {size: 56, strike: rl(1, 0.74)})}<br />{w(rl(1, 0.8), <i><b>đồng đội</b></i>, {size: 96, c: RED, rot: -6})}</Lw>
				<Puppet n="angelo" x={930} y={1820} h={820} t={tl} a={R(0.8)} cut={24} from="right" sway={(tt) => Math.sin(tt * 1.8) * 4} />
			</>)}
			{t >= L2 - 0.7 && t < L2 + 0.5 && <Ball x={lerp(700, CX + 549, E(t, L2 - 0.7, L2 + 0.5, Easing.inOut(Easing.quad)))} y={lerp(BY + 1770, BY + 1747, E(t, L2 - 0.7, L2 + 0.5)) - Math.abs(Math.sin(t * 7)) * 40 * (1 - E(t, L2 - 0.7, L2 + 0.5))} r={lerp(38, 80, E(t, L2 - 0.7, L2 + 0.5))} spin={t * 600} />}
			{/* C: penalty 987 */}
			{zone(2, (tl, R) => <>
				<div style={{position: 'absolute', left: 60, top: 180, width: 960, opacity: 1 - E(t, rl(2, 0.74), rl(2, 0.78))}}>
					{w(L2 + 0.05, 'AL NASSR', {size: 46, mono: true, c: '#8a6d00'})}{w(L2 + 0.3, 'VS', {size: 46, mono: true})}{w(L2 + 0.55, 'AL SADD', {size: 46, mono: true})}<br />
					{w(rl(2, 0.2), 'AFC CHAMPIONS LEAGUE ELITE', {size: 34, mono: true, c: '#666'})}<br />
					{w(rl(2, 0.38), 'Phút', {size: 70})}{w(rl(2, 0.41), <b>13'</b>, {size: 70, c: RED})}{w(rl(2, 0.45), '· phạt đền', {size: 70})}
				</div>
				<Img src={staticFile('crv/net.png')} style={{position: 'absolute', left: 560, top: 380, width: 520, transform: `translate(${t > goal ? Math.sin(t * 50) * 8 * Math.max(0, 1 - (t - goal) / 0.6) : 0}px, 0) scale(${1 + 0.05 * bump(goal)})`, opacity: E(t, L2, L2 + 0.4)}} />
				<Puppet n="cr_pen" x={520} y={1810} h={1150} t={tc} a={-0.55} cut={34} from="left"
					lean={t < kick - 0.6 ? 0 : t < kick ? -4 * E(t, kick - 0.6, kick) : -4 + 10 * E(t, kick, kick + 0.18) - 6 * E(t, kick + 0.3, kick + 1)}
					sway={(tt) => Math.sin(tt * 2) * 1.5}
					mask={t > kick || t < L2 + 0.48 ? 'radial-gradient(circle at 53.5% 94.5%, transparent 0 10%, black 10.5%)' : undefined} />
				{t > kick && ku < 1 && <Ball x={kp[0] - CX} y={kp[1] - BY} r={lerp(80, 30, ku)} spin={ku * 1400} />}
				{t > kick && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, zIndex: 1}}><path d={`M ${K0[0] - CX} ${K0[1] - BY} Q 700 900 ${kp[0] - CX} ${kp[1] - BY}`} fill="none" stroke={RED} strokeWidth={8} strokeDasharray="2 20" strokeLinecap="round" opacity={0.7 * (1 - E(t, goal + 0.5, goal + 1))} /></svg>}
				<div style={{position: 'absolute', left: 70, top: 200, width: 940, zIndex: 4, opacity: E(t, rl(2, 0.78), rl(2, 0.82))}}>
					<div style={{fontFamily: MONO, fontSize: 34, letterSpacing: 3, display: 'flex', justifyContent: 'space-between'}}><span>987</span><span style={{color: RED, fontWeight: 700}}>CÒN {Math.round(lerp(0, 13, prog))} BÀN</span><span>1000</span></div>
					<div style={{height: 22, border: `3px solid ${INK}`, marginTop: 10, position: 'relative', background: 'rgba(255,255,255,.4)'}}>
						<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${98.7 * E(t, rl(2, 0.78), rl(2, 0.86))}%`, background: INK}} />
						<div style={{position: 'absolute', left: '98.7%', top: -8, bottom: -8, width: `${1.3 * prog}%`, background: RED}} />
					</div>
				</div>
			</>)}
			{/* D: rewind + freeze */}
			{zone(3, (tl, R) => <>
				<Rewind t={tl}><OffMap t={tl < 0.9 ? 0.9 + (0.9 - tl) * 3 : tl} a={0.05} pass={1.0} line={1.5} run={Math.max(3.4, R(0.5))} cross={Math.max(4.4, R(0.72))} /></Rewind>
				<Freeze t={tl} a={1.4} b={3.1} />
			</>)}
			{/* E: textbook goal */}
			{zone(4, (tl, R) => <>
				<Lw x={70} y={190}>{w(rl(4, 0.02), 'Ngon như', {size: 60})}{w(rl(4, 0.12), <i><b>sách giáo khoa</b></i>, {size: 66, c: RED, rot: -5})}</Lw>
				<Lw x={70} y={340}>{w(rl(4, 0.35), 'RONALDO +1 BÀN', {size: 40, mono: true})}<br />{w(rl(4, 0.55), 'ANGELO +1 KIẾN TẠO', {size: 40, mono: true, c: '#8a6d00'})}<br />{w(rl(4, 0.78), <i><b>Siuuu…</b></i>, {size: 96, c: RED, rot: 8})}</Lw>
				<Puppet n="cr_siuu" x={560} y={1790} h={1120} t={tl} a={0.1} cut={32} from="up" sway={(tt) => Math.sin(tt * 3) * 2} lean={tl > R(0.78) ? -2 * Math.sin((tl - R(0.78)) * 8) * Math.exp(-(tl - R(0.78)) * 2) : 0} />
			</>)}
			{/* F: VAR */}
			{zone(5, (tl, R) => <>
				<Stamp x={140} y={200} t={tl} a={R(0.12)} text="VAR · VIỆT VỊ" />
				<Lw x={70} y={420}>{w(rl(5, 0.4), 'Không phải', {size: 56})}{w(rl(5, 0.47), 'Ronaldo.', {size: 56, strike: rl(5, 0.58)})}<br />{w(rl(5, 0.62), 'Là', {size: 80})}{w(rl(5, 0.66), <i><b>Angelo.</b></i>, {size: 80, c: RED, rot: -6})}<br />{w(rl(5, 0.85), 'LÚC SIMAKAN CHUYỀN', {size: 34, mono: true, c: '#666'})}</Lw>
				<Puppet n="var_tv" x={540} y={1800} h={980} t={tl} a={0.05} cut={100} from="up" sway={(tt) => Math.sin(tt * 4) * 1.5} />
			</>)}
			{/* G: offside diagram */}
			{zone(6, (tl, R) => <>
				<OffMap t={tl} a={0.05} pass={-9} line={R(0.15)} hiA />
				<div style={{position: 'absolute', left: 70, top: 150, width: 940}}>{w(rl(6, 0.25), 'Cả đám', {size: 50})}{w(rl(6, 0.32), <b>dồn một cục</b>, {size: 50})}<br />{w(rl(6, 0.6), 'Angelo:', {size: 50})}{w(rl(6, 0.68), <i><b>một mình một góc</b></i>, {size: 54, c: RED, rot: -5})}</div>
			</>)}
			{/* H: parking lot */}
			{zone(7, (tl, R) => <>
				<Lw x={70} y={190}>{w(rl(7, 0.05), 'Không giống', {size: 56})}{w(rl(7, 0.15), 'đá bóng.', {size: 56, strike: rl(7, 0.35)})}<br />{w(rl(7, 0.4), 'Giống', {size: 60})}{w(rl(7, 0.5), <i><b>chờ đi nhậu</b></i>, {size: 76, c: RED, rot: -6})}</Lw>
				<Stamp x={560} y={560} t={tl} a={R(0.45)} text="P · BÃI GỬI XE" c={INK} />
				<Puppet n="angelo_bike" x={540} y={1800} h={1080} t={tl} a={0.1} cut={100} from="right" sway={(tt) => Math.sin(tt * 1.6) * 3} />
			</>)}
			{/* I: offside law */}
			{zone(8, (tl, R) => <>
				<Lw x={70} y={190}>{w(rl(8, 0.02), 'Luật việt vị', {size: 56})}{w(rl(8, 0.1), 'không chấm', {size: 56})}<br />{w(rl(8, 0.18), <i><b>dáng đứng</b></i>, {size: 76, c: RED, rot: -5})}</Lw>
				<Lw x={70} y={480}>{w(rl(8, 0.45), '① ĐỨNG SAI LÚC CHUYỀN', {size: 38, mono: true})}<br />{w(rl(8, 0.72), '② CHẠM BÓNG', {size: 38, mono: true})}<br />{w(rl(8, 0.88), <b>= XONG</b>, {size: 90, c: RED, rot: 6})}</Lw>
				<Puppet n="flag" x={700} y={1820} h={1000} t={tl} a={0.1} cut={100} from="up" sway={(tt) => Math.sin(tt * 5) * 2.5} />
			</>)}
			{/* J: dead before touch */}
			{zone(9, (tl, R) => <>
				<BigNum t={tl} a={0.05} txt="988" y={380} c="#9a9a9a" />
				<Stamp x={140} y={150} t={tl} a={R(0.3)} text="CHẾT TỪ TRƯỚC" />
				<Img src={staticFile('crv/net.png')} style={{position: 'absolute', left: 420, top: 900, width: 620, opacity: E(tl, 0, 0.4)}} />
				<Puppet n="cr_tap" x={420} y={1820} h={760} t={tl} a={0.15} cut={100} from="left" sway={(tt) => Math.sin(tt * 2.4) * 2} />
			</>)}
			{/* K: did everything right */}
			{zone(10, (tl, R) => <>
				<Lw x={70} y={190}>{w(rl(10, 0.2), 'Chọn chỗ ✓', {size: 54})}<br />{w(rl(10, 0.3), 'Chờ bóng ✓', {size: 54})}<br />{w(rl(10, 0.4), 'Đệm vào ✓', {size: 54})}<br />{w(rl(10, 0.62), <>Đồng đội đứng đúng chỗ <b style={{color: RED}}>✗</b></>, {size: 54})}</Lw>
				<Puppet n="cr_siuu" x={330} y={1820} h={900} t={tl} a={0.1} cut={32} from="left" sway={(tt) => Math.sin(tt * 2) * 2} />
				<Puppet n="angelo" x={820} y={1820} h={820} t={tl} a={R(0.6)} cut={24} from="right" sway={(tt) => Math.sin(tt * 1.8) * 4} />
			</>)}
			{/* L: lifelong obstacles */}
			{zone(11, (tl, R) => <>
				<Lw x={70} y={190}>{w(rl(11, 0.1), 'hậu vệ', {size: 52})}{w(rl(11, 0.18), 'thủ môn', {size: 52})}{w(rl(11, 0.27), 'trọng tài', {size: 52})}<br />{w(rl(11, 0.45), '41 TUỔI', {size: 44, mono: true, c: '#666'})}<br />{w(rl(11, 0.75), 'người cản đường:', {size: 50})}<br />{w(rl(11, 0.85), <i><b>chung màu áo</b></i>, {size: 80, c: RED, rot: -5})}</Lw>
				<Puppet n="cr_old" x={360} y={1820} h={1050} t={tl} a={0.1} cut={28} from="up" sway={(tt) => Math.sin(tt * 1.5) * 2} />
				<Puppet n="angelo" x={830} y={1820} h={800} t={tl} a={R(0.83)} cut={24} from="right" sway={(tt) => Math.sin(tt * 1.8) * 4} />
			</>)}
			{/* M: Felix wins it */}
			{zone(12, (tl, R) => <>
				<Board t={tl} a={0.05} y={200} l="AL NASSR" r="AL SADD" mid="2–1" />
				<Lw x={70} y={420}>{w(rl(12, 0.3), 'Félix', {size: 60})}{w(rl(12, 0.38), <i><b>móc bóng</b></i>, {size: 72, c: RED, rot: -5})}</Lw>
				<BigNum t={tl} a={R(0.7)} txt="987" y={560} c={INK} />
				<Puppet n="felix" x={540} y={1820} h={900} t={tl} a={0.1} cut={100} from="up" sway={(tt) => Math.sin(tt * 3) * 2} />
			</>)}
			{/* N: keep going */}
			{zone(13, (tl, R) => <>
				<Lw x={70} y={190}>{w(rl(13, 0.03), 'Mất thì', {size: 56})}{w(rl(13, 0.12), 'đã mất.', {size: 56, strike: rl(13, 0.25)})}<br />{w(rl(13, 0.3), 'CÒN', {size: 46, mono: true})}{w(rl(13, 0.34), <b>13 BÀN</b>, {size: 46, mono: true, c: RED})}<br />{w(rl(13, 0.6), 'Cán mốc', {size: 60})}{w(rl(13, 0.75), <i><b>ngay mùa này?</b></i>, {size: 74, c: RED, rot: -5})}</Lw>
				<div style={{position: 'absolute', left: 70, top: 640, width: 940, opacity: E(tl, R(0.3), R(0.36))}}>
					<div style={{fontFamily: MONO, fontSize: 32, letterSpacing: 3, display: 'flex', justifyContent: 'space-between'}}><span>987</span><span>1000</span></div>
					<div style={{height: 22, border: `3px solid ${INK}`, marginTop: 8, position: 'relative', background: 'rgba(255,255,255,.4)'}}>
						<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${lerp(98.7, 100, E(tl, R(0.55), R(0.95)))}%`, background: INK}} />
					</div>
				</div>
				<Puppet n="sign1000" x={540} y={1800} h={900} t={tl} a={0.1} cut={100} from="up" sway={(tt) => Math.sin(tt * 2) * 1.5} />
				<div style={{position: 'absolute', left: 370, top: 1230, width: 260, textAlign: 'center', zIndex: 3, fontFamily: SERIF, fontWeight: 900, fontSize: 92, color: RED, mixBlendMode: 'multiply', opacity: E(tl, 0.6, 0.9), transform: `rotate(-2deg) translateY(${(1 - E(tl, 0.1, 0.65, Easing.out(Easing.back(1.5)))) * -500}px)`}}>1000</div>
			</>)}
			{/* O: first ever + question */}
			{zone(14, (tl, R) => <>
				<Lw x={70} y={170}>{w(rl(14, 0.04), 'NGƯỜI ĐẦU TIÊN', {size: 44, mono: true})}<br />{w(rl(14, 0.1), <i><b>1000 bàn chính thức</b></i>, {size: 70, c: RED, rot: -4})}</Lw>
				<Lw x={70} y={420}>{w(rl(14, 0.3), 'PELÉ · ROMÁRIO: 1000+', {size: 36, mono: true, c: '#666'})}<br />{w(rl(14, 0.45), '(tính cả giao hữu)', {size: 44, c: '#666'})}</Lw>
				<Lw x={70} y={640}>{w(rl(14, 0.68), 'Làm được', {size: 60})}{w(rl(14, 0.8), <i><b>ngay mùa này?</b></i>, {size: 70, c: RED, rot: -5})}</Lw>
				<Puppet n="cr_siuu" x={540} y={1820} h={1000} t={tl} a={0.1} cut={32} from="up" sway={(tt) => Math.sin(tt * 2.5) * 2.5} />
			</>)}
			{gball && <Ball x={gball[0]} y={gball[1]} r={36} spin={gspin} />}
		</AbsoluteFill>
		{t < L1 + 0.2 && <div style={{position: 'absolute', left: 0, top: 150, width: W, padding: '28px 60px 34px', boxSizing: 'border-box', textAlign: 'center', background: 'rgba(233,233,231,.94)', borderBottom: `4px solid ${INK}`, opacity: 1 - E(t, L1 - 0.3, L1 + 0.1), transform: `translateY(${-30 * E(t, L1 - 0.3, L1 + 0.1)}px)`}}>
			{w(0.05, 'Ông', {size: 74})}{w(0.25, 'này', {size: 74})}{w(0.45, <i><b>đi lạc</b></i>, {size: 90, c: RED, rot: -8})}<br />
			{w(0.8, 'vào trận đấu', {size: 58})}{w(1.05, 'hay sao?', {size: 58})}
		</div>}
		<div style={{position: 'absolute', left: 40, top: 40, padding: '10px 18px', border: `3px solid ${hudRed ? RED : INK}`, background: 'rgba(233,233,231,.9)', fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: 2, opacity: Math.min(1, hud), transform: `translateY(${(1 - Math.min(1, hud)) * -80}px) scale(${1 + 0.15 * Math.min(1, hudBump)})`, transformOrigin: '0 0'}}>
			BÀN THẮNG: <span style={{color: RED}}>{cnt}</span>
		</div>
		<Img src={staticFile('mu/logo.png')} style={{position: 'absolute', right: 36, top: 30, width: 92, height: 92, borderRadius: '50%', opacity: 0.92 * (1 - E(t, D - 3.2, D - 2.9))}} />
		<AbsoluteFill style={{background: '#fff', opacity: flash * 0.6}} />
		<AbsoluteFill style={{opacity: E(t, D - 3.2, D - 2.8)}}><Paper>
			<Img src={staticFile('mu/logo.png')} style={{position: 'absolute', left: 540 - 230, top: 960 - 330, width: 460, height: 460, borderRadius: '50%', transform: `scale(${lerp(0.6, 1, E(t, D - 3.0, D - 2.3, Easing.out(Easing.back(1.6))))}) rotate(${lerp(-8, 0, E(t, D - 3.0, D - 2.3))}deg)`, filter: 'drop-shadow(10px 14px 0 rgba(0,0,0,.25))'}} />
			<div style={{position: 'absolute', top: 1220, width: 1080, textAlign: 'center', fontFamily: SERIF, fontSize: 44, color: INK, opacity: E(t, D - 2.2, D - 1.8)}}>Đăng ký để không bỏ lỡ <b style={{fontStyle: 'italic', color: RED}}>bên kia bảng tỷ số</b></div>
		</Paper></AbsoluteFill>
		<div style={{position: 'absolute', right: 30, bottom: 120, fontFamily: MONO, fontSize: 16, color: '#888', opacity: E(t, D - 9, D - 8.5) * (1 - E(t, D - 3.2, D - 3))}}>hình minh hoạ · nguồn: AFC, Goal, VAVEL · sơ đồ minh hoạ</div>
		<AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'multiply'}}><Img src={staticFile(`tex/noise${Math.floor(f / 3) % 4}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
		<AbsoluteFill style={{background: '#000', opacity: E(t, D - 0.6, D - 0.05)}} />
		<Audio src={staticFile('crv/mixf.wav')} />
	</AbsoluteFill>;
};
