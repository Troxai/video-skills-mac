import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame, Easing, OffthreadVideo, Sequence} from 'remotion';
import SIZES from './tbn_sizes.json';
import '@fontsource/playfair-display/vietnamese-400.css';
import '@fontsource/playfair-display/latin-400.css';
import '@fontsource/playfair-display/vietnamese-700-italic.css';
import '@fontsource/playfair-display/latin-700-italic.css';
import '@fontsource/jetbrains-mono/vietnamese-400.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/vietnamese-700.css';
import '@fontsource/jetbrains-mono/latin-700.css';

// 90+ · 23 nhà vô địch 2010 (9:16)
const SPD = 1.15;
const T0 = [[0, 8.093], [8.413, 16.409], [16.729, 22.176], [22.496, 27.011], [27.331, 31.982], [32.302, 33.87], [34.19, 42.321], [42.641, 49.839], [50.159, 56.995], [57.315, 61.626], [61.946, 67.78], [68.1, 73.454], [73.774, 81.318], [81.638, 86.203], [86.523, 92.739], [93.059, 97.159], [97.479, 100.786], [101.106, 106.518], [106.838, 113.873], [114.193, 117.447], [117.767, 123.979], [124.299, 126.16], [126.48, 130.101], [130.421, 136.785], [137.105, 140.637], [140.957, 144.287], [144.607, 150.408], [150.728, 153.45], [153.77, 157.101], [157.421, 159.675], [159.995, 161.68], [162.0, 168.689]];
const T = T0.map(([a, b]) => [a / SPD, b / SPD]);
export const TBN_DUR = Math.round((168.689 / SPD + 3.6) * 30) / 30;
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
	<Img src={staticFile(`tbn/bg_${n}.jpg`)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.38, mixBlendMode: 'multiply', filter: 'contrast(1.1)', transformOrigin: '30% 30%', transform: `scale(${1.16 + 0.06 * (t / Math.max(d, 1))}) translateX(${-20 * t / Math.max(d, 1)}px)`}} />
	<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(233,233,231,.9) 0%, rgba(233,233,231,.25) 45%, transparent 70%)'}} />{children}</Paper>;
const Fig: React.FC<{n: string; x: number; y: number; h: number; t: number; a: number; crop?: number; flip?: boolean; from?: 'left' | 'right' | 'up' | 'none'; out?: number; dim?: number; shake?: number; ghost?: boolean; drop?: number}> = ({n, x, y, h, t, a, crop = 1, flip, from = 'none', out = 1e9, dim = 0, shake = 0, ghost = true, drop}) => {
	const [w0, h0] = SIZE[n]; const w = (w0 / h0) * h;
	const u = E(t, a, a + 0.55);
	const o = 1 - E(t, out, out + 0.35, Easing.in(Easing.cubic));
	const dx = from === 'left' ? -700 * (1 - u) : from === 'right' ? 700 * (1 - u) : 0;
	const dy = from === 'up' ? -300 * (1 - u) : 0;
	const vis = h * crop, g = h * 0.019;
	const rot = drop !== undefined ? 90 * E(t, drop, drop + 0.45, Easing.in(Easing.quad)) : 0;
	const im = (gh: boolean) => <Img src={staticFile(`tbn/${n}.png`)} style={{position: 'absolute', left: gh ? -g : 0, top: gh ? g * 0.15 : 0, width: w, height: h, transform: flip ? 'scaleX(-1)' : undefined, filter: gh ? 'grayscale(1) brightness(.35)' : dim ? `brightness(${1 - dim}) grayscale(${dim})` : undefined, opacity: gh ? 0.35 : 1}} />;
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
			{t >= a - 0.05 && <Sequence from={start} layout="none"><OffthreadVideo src={staticFile('tbn/clip.mp4')} startFrom={Math.round(s0 * 30)} endAt={Math.round(s1 * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>}
		</div>
		{cap && <div style={{position: 'absolute', left: 14, bottom: -70, fontFamily: MONO, fontSize: 26, letterSpacing: 3, color: INK}}>{cap}</div>}
	</div>;
};
const Score: React.FC<{t: number; a: number; y?: number}> = ({t, a, y = 260}) => {const u = E(t, a, a + 0.35, Easing.out(Easing.back(1.8))); return <div style={{position: 'absolute', left: 80, top: y, width: 920, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf8f2', borderTop: `8px solid ${INK}`, padding: '20px 30px', boxShadow: '10px 12px 0 rgba(0,0,0,.2)', opacity: Math.min(1, u), transform: `scale(${lerp(0.9, 1, u)})`, zIndex: 4}}>
	<span style={{fontFamily: MONO, fontSize: 34, letterSpacing: 4, fontWeight: 700, color: '#2b7bbf'}}>ARGENTINA</span>
	<span style={{fontFamily: MONO, fontSize: 84, fontWeight: 700, color: INK}}>7–0</span>
	<span style={{fontFamily: MONO, fontSize: 34, letterSpacing: 4, color: '#777'}}>COSTA RICA</span></div>;};
const PRICE = (v: number[]) => [{n: '€9M · ĐIỀU KHOẢN MUA LẠI', v: 9, c: RED}, {n: '€60M · GIÁ BÁN LẠI (THEO BÁO TÂY BAN NHA)', v: 60}, {n: '€80M · GIÁ MUA LẠI MỚI (THEO BÁO CHÍ)', v: 80, c: SKY}].filter((_, k) => v.includes(k));

const GOLD = '#b8860b', SKY = '#2b7bbf';
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

const SHOTS: Shot[] = [
	{i: 0, trans: 'cut', C: (t, R, d) => <Bg n="soccercity" t={t} d={d}>
		<div style={{opacity: 1 - E(t, R(0, 0.42), R(0, 0.5))}}><Minute t={t} a={0.05} y={330} />
		<S x={540} y={700} t={t} a={0.6} size={54} align="center" w={980}>Johannesburg · 11/7/2010</S></div>
		<Vid t={t} a={R(0, 0.45)} s0={0} s1={11.9} x={130} y={200} w={820} />
		<S x={540} y={1720} t={t} a={R(1, 0.4)} size={54} align="center" w={980}>Tây Ban Nha <B c={RED}>vô địch thế giới</B></S>
	</Bg>},
	{i: 2, trans: 'left', C: (t, R) => <Paper>
		<Clip x={80} y={240} w={920} t={t} a={0.1} src="16 năm sau">18/11/2026: Juan Mata <B c={RED}>giải nghệ</B></Clip>
		<Fig n="mata" x={540} y={1800} h={1200} t={t} a={0.3} from="up" />
	</Paper>},
	{i: 3, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={240} t={t} a={0.1} size={56} w={920}>23 nhà vô địch, <B c={RED}>0</B> người còn đá</S>
		<Dots23 t={t} a={0.3} y={620} on={23 - Math.round(E(t, R(3, 0.6), R(3, 0.8)))} />
	</Paper>},
	{i: 4, trans: 'cut', C: (t, R) => <Paper>
		<Trophy o={0.2} />
		<S x={540} y={300} t={t} a={0.1} size={60} align="center" w={980}>Kỷ nguyên vàng <B c={RED}>khép lại</B></S>
		<S x={540} y={1450} t={t} a={R(4, 0.5)} size={70} align="center" w={980}>Họ <B c={RED}>giờ ở đâu</B>?</S>
		<Dots23 t={t} a={0} y={700} on={22} />
	</Paper>},
	{i: 5, trans: 'left', C: (t) => <Paper>
		<S x={80} y={240} t={t} a={0.1} size={60} w={920}>Treo giày <B c={RED}>sớm nhất</B></S>
		<Dots23 t={t} a={0} y={620} on={22} hi={[0, 1, 2]} />
	</Paper>},
	{i: 6, trans: 'left', C: (t, R) => <Paper>
		<Name x={80} y={220} t={t} a={0.1} n="Carles Puyol" sub="bàn đầu, bán kết với Đức" />
		<Stat x={80} y={420} w={920} label="Giải nghệ · tuổi" val="2014 · 36" t={t} a={R(6, 0.55)} />
		<Fig n="puyol" x={540} y={1820} h={1150} t={t} a={0.2} from="right" />
	</Paper>},
	{i: 7, trans: 'left', C: (t, R) => <Paper>
		<Name x={80} y={220} t={t} a={0.1} n="Iker Casillas" sub="đội trưởng nâng cúp" />
		<Fig n="casillas" x={540} y={1820} h={1150} t={t} a={0.2} from="up" />
		<Stamp x={120} y={460} t={t} a={R(7, 0.6)} text="2020 · ĐAU TIM" />
	</Paper>},
	{i: 8, trans: 'left', C: (t, R) => <Paper>
		<Name x={80} y={220} t={t} a={0.1} n="David Villa" sub="vua phá lưới của Tây Ban Nha" />
		<Stat x={80} y={420} w={920} label="Bàn thắng tại World Cup 2010" val="5" t={t} a={R(8, 0.3)} />
		<Stat x={80} y={560} w={920} label="Giải nghệ" val="2019 · Nhật Bản" t={t} a={R(8, 0.7)} />
		<Fig n="villa" x={540} y={1820} h={1100} t={t} a={0.2} from="right" />
	</Paper>},
	{i: 9, trans: 'up', C: (t, R, d) => <Bg n="bench" t={t} d={d}>
		<S x={80} y={240} t={t} a={0.1} size={60} w={920}>Quay lại, trên <B c={RED}>băng ghế</B></S>
		<Dots23 t={t} a={0} y={700} on={22} hi={[3, 4, 5, 6, 7]} />
	</Bg>},
	{i: 10, trans: 'left', C: (t, R) => <Paper>
		<Name x={80} y={220} t={t} a={0.1} n="Xavi" sub="bộ não tuyến giữa" />
		<Club x={80} y={430} t={t} a={R(10, 0.4)} name="BARCELONA" c={'#7a1f3d'} />
		<Stat x={80} y={560} w={920} label="Vô địch La Liga" val="2023" t={t} a={R(10, 0.7)} />
		<Fig n="xavi" x={560} y={1820} h={1100} t={t} a={0.2} from="right" />
	</Paper>},
	{i: 11, trans: 'left', C: (t, R) => <Paper>
		<Name x={80} y={220} t={t} a={0.1} n="Xabi Alonso" out={R(12, 0.55)} />
		<Club x={80} y={360} t={t} a={R(11, 0.1)} name="LEVERKUSEN · BẤT BẠI" c={RED} size={34} />
		<Club x={80} y={470} t={t} a={R(11, 0.7)} name="REAL MADRID" c={INK} size={34} />
		<Fig n="alonso" x={560} y={1820} h={1150} t={t} a={0.2} from="up" out={R(12, 0.55)} />
		<S x={80} y={600} t={t} a={R(12, 0.05)} size={56} w={920}><B c={RED}>7 tháng</B> sau: rời Bernabéu</S>
		<Fig n="arbeloa" x={560} y={1820} h={1150} t={t} a={R(12, 0.6)} from="right" />
		<Name x={80} y={720} t={t} a={R(12, 0.75)} n="Álvaro Arbeloa" sub="đồng đội cũ năm 2010" c={INK} />
	</Paper>},
	{i: 13, trans: 'left', C: (t, R) => <Paper>
		<Name x={80} y={220} t={t} a={0.1} n="Fernando Torres" />
		<Club x={80} y={380} t={t} a={0.4} name="ATLÉTICO · ĐỘI TRẺ" c={RED} size={34} />
		<Fig n="torres" x={540} y={1820} h={1150} t={t} a={0.2} from="right" />
	</Paper>},
	{i: 14, trans: 'left', C: (t, R) => <Paper>
		<Name x={80} y={220} t={t} a={0.1} n="Cesc Fàbregas" sub="kiến tạo bàn thắng lịch sử" />
		<Club x={80} y={460} t={t} a={R(14, 0.45)} name="COMO · SERIE B" c={'#888'} size={32} />
		<Arrow id="como" x1={330} y1={560} x2={560} y2={680} t={t} a={R(14, 0.6)} />
		<Club x={480} y={690} t={t} a={R(14, 0.8)} name="CHAMPIONS LEAGUE" c={SKY} size={32} />
		<Fig n="fabregas" x={540} y={1820} h={1000} t={t} a={0.2} from="up" />
		<Card x={500} y={940} t={t} a={R(15, 0.4)} top="HỌC TRÒ SỐ 10" main="Nico Paz" c={SKY} />
	</Paper>},
	{i: 16, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={240} t={t} a={0.1} size={60} w={920}>Đi rất <B c={RED}>xa</B> để chơi tiếp</S>
		<div style={{position: 'absolute', left: 60, top: 520, width: 960, height: 600, border: `4px dashed ${INK}`, opacity: 0.25 * E(t, 0.2, 0.6)}} />
		<Src x={80} y={1140} t={t} a={0.4}>bản đồ minh hoạ</Src>
		<Pin x={300} y={720} t={t} a={0.5} n="MỸ" />
		<Pin x={240} y={880} t={t} a={0.7} n="MEXICO" />
		<Pin x={620} y={660} t={t} a={0.9} n="Ý" />
	</Paper>},
	{i: 17, trans: 'left', C: (t, R) => <Paper>
		<Name x={80} y={220} t={t} a={0.1} n="Sergio Busquets" />
		<Club x={80} y={360} t={t} a={0.4} name="INTER MIAMI · CÙNG MESSI" c={'#d0608f'} size={32} />
		<Stat x={80} y={480} w={920} label="Giải nghệ" val="Cuối 2025" t={t} a={R(17, 0.65)} />
		<Fig n="busquets" x={540} y={1820} h={1150} t={t} a={0.2} from="right" />
	</Paper>},
	{i: 18, trans: 'left', C: (t, R) => <Paper>
		<Name x={80} y={220} t={t} a={0.1} n="Pedro" sub="vô địch mọi giải đấu lớn" />
		<Club x={80} y={420} t={t} a={R(18, 0.5)} name="LAZIO" c={SKY} />
		<Stat x={80} y={540} w={920} label="Chơi đến" val="39 tuổi" t={t} a={R(18, 0.55)} />
		<Stamp x={140} y={700} t={t} a={R(18, 0.85)} text="GIẢI NGHỆ 10/2026" />
		<Fig n="pedro" x={560} y={1820} h={1050} t={t} a={0.2} from="up" />
	</Paper>},
	{i: 19, trans: 'left', C: (t, R) => <Paper>
		<Name x={80} y={220} t={t} a={0.1} n="Sergio Ramos" />
		<Club x={80} y={380} t={t} a={0.5} name="MONTERREY · MEXICO" c={'#1b2a52'} size={34} />
		<Fig n="ramos" x={540} y={1820} h={1150} t={t} a={0.2} from="right" />
	</Paper>},
	{i: 20, trans: 'up', C: (t, R) => <Paper>
		<S x={80} y={240} t={t} a={0.1} size={56} w={920}>Không có CLB, nhưng <B c={RED}>chưa giải nghệ</B></S>
		<Gray x={80} y={480} t={t} a={0.3} n="Ramos" />
		<Gray x={580} y={480} t={t} a={0.6} n="Albiol" />
		<Fig n="albiol" x={540} y={1820} h={1000} t={t} a={0.5} from="up" dim={0.35} />
	</Paper>},
	{i: 21, trans: 'zoom', C: (t, R) => <Paper>
		<Circle x={540} y={1150} r={420} c={RED} t={t} a={0.1} />
		<S x={80} y={240} t={t} a={0.1} size={60} w={920}>Người <B c={RED}>cuối cùng</B></S>
		<Fig n="mata" x={540} y={1820} h={1300} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 22, trans: 'left', C: (t, R) => <Paper>
		<Name x={80} y={220} t={t} a={0.1} n="Juan Mata" sub="World Cup 2010" />
		<Stat x={80} y={420} w={920} label="Tuổi năm 2010" val="22" t={t} a={R(22, 0.2)} />
		<S x={80} y={580} t={t} a={R(22, 0.6)} size={50} w={920}>Một trong những cái tên <B c={RED}>trẻ nhất</B></S>
		<Card x={80} y={860} t={t} a={R(23, 0.05)} top="CHELSEA · 2012" main="Champions League" c={BLUE} />
		<Card x={80} y={1060} t={t} a={R(23, 0.6)} top="MAN UTD" main="8 năm rưỡi" c={RED} />
		<Fig n="mata" x={800} y={1820} h={1000} t={t} a={0.2} from="right" />
	</Paper>},
	{i: 24, trans: 'up', C: (t, R) => <Paper>
		<div style={{position: 'absolute', left: 60, top: 420, width: 960, height: 720, border: `4px dashed ${INK}`, opacity: 0.25}} />
		<Src x={80} y={1160} t={t} a={0.1}>bản đồ minh hoạ</Src>
		<Pin x={300} y={560} t={t} a={0.1} n="THỔ NHĨ KỲ" />
		<Pin x={780} y={620} t={t} a={0.6} n="NHẬT BẢN" />
		<Pin x={700} y={960} t={t} a={1.1} n="ÚC" c={BLUE} />
		<Arrow id="m1" x1={330} y1={600} x2={760} y2={640} t={t} a={0.4} />
		<Arrow id="m2" x1={790} y1={680} x2={720} y2={930} t={t} a={0.9} />
	</Paper>},
	{i: 25, trans: 'left', C: (t, R) => <Paper>
		<Clip x={80} y={420} w={920} t={t} a={R(25, 0.45)} src="Juan Mata · lời chia tay">“Yêu, đôi khi là <B c={RED}>buông tay</B>.”</Clip>
		<Fig n="mata" x={540} y={1820} h={1050} t={t} a={0.1} from="up" />
	</Paper>},
	{i: 26, trans: 'left', C: (t, R, d) => <Bg n="melbourne" t={t} d={d}>
		<Club x={80} y={260} t={t} a={0.2} name="MELBOURNE VICTORY" c={'#1b2a52'} size={36} />
		<S x={80} y={390} t={t} a={R(26, 0.6)} size={60} w={920}>vai trò <B c={RED}>cổ đông</B></S>
		<Fig n="mata" x={540} y={1820} h={1100} t={t} a={0.1} from="right" />
	</Bg>},
	{i: 27, trans: 'up', C: (t, R) => <Paper>
		<Trophy o={0.2} />
		<S x={540} y={240} t={t} a={0.1} size={56} align="center" w={980}>23 cầu thủ · 1 cúp vàng · 16 năm</S>
		<Dots23 t={t} a={0} y={700} spread={E(t, R(28, 0.1), R(28, 0.7))} gather={E(t, R(29, 0.2), R(29, 0.9))} />
		<S x={540} y={1700} t={t} a={R(28, 0.3)} out={R(29, 0)} size={44} align="center" w={980}>người dẫn dắt · người kinh doanh · người nghỉ ngơi</S>
		<S x={540} y={1700} t={t} a={R(29, 0.3)} size={50} align="center" w={980}>Cùng một <B c={RED}>khoảnh khắc</B></S>
	</Paper>},
	{i: 30, trans: 'cut', C: (t, R) => {const end = 5.6; return <Paper>
		<Vid t={t} a={0} s0={6.3} s1={11.9} x={130} y={200} w={820} out={end - 0.2} />
		<S x={540} y={1720} t={t} a={0.2} out={end - 0.2} size={60} align="center" w={980}>Phút <B c={RED}>116</B>. Johannesburg.</S>
		<S x={540} y={240} t={t} a={end} size={56} align="center" w={980}>Bạn ở đâu khi</S>
		<S x={540} y={320} t={t} a={end + 0.2} size={84} align="center" w={980}><B c={RED}>Iniesta</B> ghi bàn?</S>
		<Fig n="iniesta" x={540} y={1650} h={1100} t={t} a={end} from="up" />
		<S x={540} y={1700} t={t} a={R(31, 0.6)} size={46} align="center" w={980}>Kể cho <B c={RED}>90+</B> nghe nhé.</S>
	</Paper>;}},
];

const Trans: React.FC<{kind: Shot['trans']; u: number; isIn: boolean; children: React.ReactNode}> = ({kind, u, isIn, children}) => {
	let tr = '';
	if (kind === 'left') tr = isIn ? `translateX(${(1 - u) * W}px)` : `translateX(${-u * W}px)`;
	if (kind === 'up') tr = isIn ? `translateY(${(1 - u) * H}px)` : `translateY(${-u * H}px)`;
	const blur = (kind === 'left' || kind === 'up') ? Math.sin(u * Math.PI) * 10 : 0;
	return <AbsoluteFill style={{transform: tr, filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>;
};
export const SHOT_STARTS = SHOTS.map((s) => [s.i, s.trans] as const);
export const TBNVideo: React.FC = () => {
	const f = useCurrentFrame(), t = f / 30, D = TBN_DUR;
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
			<div style={{position: 'absolute', top: 1220, width: 1080, textAlign: 'center', fontFamily: SERIF, fontSize: 44, color: INK, opacity: E(t, D - 2.2, D - 1.8)}}>Đăng ký để không bỏ lỡ <b style={{fontStyle: 'italic', color: RED}}>bên kia bảng tỷ số</b></div>
		</Paper></AbsoluteFill>
		<div style={{position: 'absolute', right: 30, bottom: 120, fontFamily: MONO, fontSize: 16, color: '#888', opacity: E(t, D - 9, D - 8.5) * (1 - E(t, D - 3.2, D - 3))}}>hình minh hoạ · nguồn: ESPN, AP, beIN Sports, Sky, Wikipedia</div>
		<AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'multiply'}}><Img src={staticFile(`tex/noise${Math.floor(f / 3) % 4}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
		<AbsoluteFill style={{background: '#000', opacity: E(t, D - 0.6, D - 0.05)}} />
		<Audio src={staticFile('tbn/mix.wav')} />
	</AbsoluteFill>;
};
