import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/playfair-display/vietnamese-400.css';
import '@fontsource/playfair-display/latin-400.css';
import '@fontsource/playfair-display/vietnamese-700-italic.css';
import '@fontsource/playfair-display/latin-700-italic.css';
import '@fontsource/jetbrains-mono/vietnamese-400.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/vietnamese-700.css';
import '@fontsource/jetbrains-mono/latin-700.css';

// 90+ · Pochettino — phiên bản nào? (16:9)
const SPD = 1.15;
const T0 = [[0.0, 1.48], [1.8, 4.37], [4.69, 10.56], [10.88, 14.04], [14.36, 17.97], [18.29, 20.67], [20.99, 23.33], [23.65, 26.38], [26.7, 29.04], [29.36, 33.58], [33.9, 38.75], [39.07, 42.21], [42.53, 45.5], [45.82, 49.8], [50.12, 51.51], [51.83, 56.66], [56.98, 60.77], [61.09, 63.29], [63.61, 67.23], [67.55, 69.92], [70.24, 72.22], [72.54, 75.04], [75.36, 77.07], [77.39, 80.5], [80.82, 83.82], [84.14, 86.07], [86.39, 89.49], [89.81, 91.01], [91.33, 96.52], [96.84, 98.26], [98.58, 102.89], [103.21, 104.9], [105.22, 106.54], [106.86, 110.32], [110.64, 116.49], [116.81, 118.23], [118.55, 121.1], [121.42, 124.23], [124.55, 128.51], [128.83, 130.96], [131.28, 132.83], [133.15, 139.27], [139.59, 143.18], [143.5, 145.93], [146.25, 150.33], [150.65, 155.09], [155.41, 156.72], [157.04, 158.67], [158.99, 162.35], [162.67, 168.14], [168.46, 171.11], [171.43, 173.33], [173.65, 176.63], [176.95, 182.55], [182.87, 184.16], [184.48, 187.33], [187.65, 189.0], [189.32, 191.57], [191.89, 193.54], [193.86, 198.44], [198.76, 203.54], [203.86, 206.18], [206.5, 209.18], [209.5, 212.65], [212.97, 216.49], [216.81, 219.92], [220.24, 222.59], [222.91, 225.34], [225.66, 229.45], [229.77, 232.87], [233.19, 234.94], [235.26, 237.22]];
const T = T0.map(([a, b]) => [a / SPD, b / SPD]);
export const POCH_DUR = Math.round(237.22 / SPD + 3.2) + 3;
const W = 1920, H = 1080;
const SERIF = 'Playfair Display', MONO = 'JetBrains Mono';
const INK = '#141414', RED = '#C62828', BLUE = '#1E4FA8', GREEN = '#2E7D32';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const E = (t: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(t, [a, b], [0, 1], {...cl, easing: e});
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const SIZE: Record<string, [number, number]> = {"poch_stand": [830, 2369], "poch_arms": [713, 2416], "poch_point": [1140, 2406], "poch_clap": [741, 2442], "hourglass": [724, 1265], "trophy": [746, 986], "carrick": [744, 2480], "bruno": [1010, 2461], "martinez": [975, 2464], "chair": [1116, 1758], "armband": [1417, 1069], "money": [1311, 1954], "contract": [1394, 1576], "tactics": [1019, 2050]};
const r = (i: number, f = 0) => T[i][0] + (T[i][1] - T[i][0]) * f; // absolute time inside line i

// ---------- blocks ----------
const Paper: React.FC<{children?: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: '#e9e9e7'}}>
	<Img src={staticFile('mz/paper.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, mixBlendMode: 'multiply'}} />{children}</AbsoluteFill>;
const Dark: React.FC<{children?: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: '#0b0b0b'}}>
	<AbsoluteFill style={{backgroundImage: 'radial-gradient(#2a2a2a 1.4px, transparent 1.6px)', backgroundSize: '16px 16px', opacity: 0.8}} />
	<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(0,0,0,.7))'}} />{children}</AbsoluteFill>;
const Bg: React.FC<{n: string; t: number; d: number; dim?: number; children?: React.ReactNode}> = ({n, t, d, children}) => <Paper>
	<Img src={staticFile(`poch/bg_${n}.jpg`)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.38, mixBlendMode: 'multiply', filter: 'contrast(1.1)', transformOrigin: '30% 30%', transform: `scale(${1.16 + 0.06 * (t / Math.max(d, 1))}) translateX(${-20 * t / Math.max(d, 1)}px)`}} />
	<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(233,233,231,.85) 0%, rgba(233,233,231,.2) 55%, transparent)'}} />{children}</Paper>;
const Fig: React.FC<{n: string; x: number; y: number; h: number; t: number; a: number; crop?: number; flip?: boolean; from?: 'left' | 'right' | 'up' | 'none'; out?: number; dim?: number; shake?: number; ghost?: boolean; drop?: number}> = ({n, x, y, h, t, a, crop = 1, flip, from = 'none', out = 1e9, dim = 0, shake = 0, ghost = true, drop}) => {
	const [w0, h0] = SIZE[n]; const w = (w0 / h0) * h;
	const u = E(t, a, a + 0.55);
	const o = 1 - E(t, out, out + 0.35, Easing.in(Easing.cubic));
	const dx = from === 'left' ? -700 * (1 - u) : from === 'right' ? 700 * (1 - u) : 0;
	const dy = from === 'up' ? -300 * (1 - u) : 0;
	const vis = h * crop, g = h * 0.019;
	const rot = drop !== undefined ? 90 * E(t, drop, drop + 0.45, Easing.in(Easing.quad)) : 0;
	const im = (gh: boolean) => <Img src={staticFile(`poch/${n}.png`)} style={{position: 'absolute', left: gh ? -g : 0, top: gh ? g * 0.15 : 0, width: w, height: h, transform: flip ? 'scaleX(-1)' : undefined, filter: gh ? 'grayscale(1) brightness(.35)' : dim ? `brightness(${1 - dim}) grayscale(${dim})` : undefined, opacity: gh ? 0.35 : 1}} />;
	const breathe = 1 + 0.008 * Math.sin(t * 1.3 + x);
	return <div style={{position: 'absolute', left: x - w / 2 + dx, top: y - vis + dy, width: w, height: vis, overflow: crop < 1 ? 'hidden' : 'visible', zIndex: 2, transformOrigin: '50% 100%', transform: `${shake ? `rotate(${Math.sin(t * 31) * shake * 2.2}deg) translateX(${Math.sin(t * 47) * shake * 7}px)` : ''} rotate(${rot}deg) scale(${breathe})`, opacity: Math.min(1, u * 1.4) * o, WebkitMaskImage: crop < 1 ? 'linear-gradient(to bottom, #000 82%, transparent)' : undefined}}>
		{ghost && im(true)}{im(false)}
	</div>;
};
const Circle: React.FC<{x: number; y: number; r: number; c: string; t: number; a: number; out?: number}> = ({x, y, r: rr, c, t, a, out = 1e9}) => {const u = E(t, a, a + 0.5, Easing.out(Easing.back(1.4))) * (1 - E(t, out, out + 0.3)); return <div style={{position: 'absolute', left: x - rr, top: y - rr, width: 2 * rr, height: 2 * rr, borderRadius: '50%', background: c, transform: `scale(${u})`, filter: 'url(#rough)'}} />;};
const Ground: React.FC<{y: number; t: number; a: number; c?: string}> = ({y, t, a, c = INK}) => <div style={{position: 'absolute', left: 0, top: y, height: 4, width: W * E(t, a, a + 0.6), background: c}} />;
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
			<span style={{fontSize: 28, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.85}}>{label}</span>
			<span style={{fontSize: 64, fontWeight: 700}}>{val}</span>
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
const Stamp: React.FC<{x: number; y: number; t: number; a: number; text: string; c?: string}> = ({x, y, t, a, text, c = RED}) => {const u = E(Math.floor(t * 12) / 12, a, a + 0.25, Easing.out(Easing.back(2.5))); return <div style={{position: 'absolute', left: x, top: y, transform: `rotate(-10deg) scale(${lerp(1.6, 1, u)})`, opacity: u, border: `6px solid ${c}`, color: c, fontFamily: MONO, fontWeight: 700, fontSize: 40, padding: '6px 18px', letterSpacing: 3, zIndex: 4}}>{text}</div>;};

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
const Pitch: React.FC<{t: number; a: number; children?: React.ReactNode}> = ({t, a, children}) => <svg width={W} height={H} style={{position: 'absolute', opacity: E(t, a, a + 0.4)}}>
	<rect x={960} y={200} width={840} height={560} fill="none" stroke={INK} strokeWidth={4} /><line x1={1380} y1={200} x2={1380} y2={760} stroke={INK} strokeWidth={3} /><circle cx={1380} cy={480} r={70} fill="none" stroke={INK} strokeWidth={3} />
	<rect x={960} y={340} width={120} height={280} fill="none" stroke={INK} strokeWidth={3} /><rect x={1680} y={340} width={120} height={280} fill="none" stroke={INK} strokeWidth={3} />{children}</svg>;

type Shot = {i: number; trans: 'left' | 'up' | 'cut' | 'zoom'; C: (t: number, R: (i: number, f?: number) => number, d: number) => React.ReactNode};
const TEAMS = ['Arsenal', 'Man City', 'Liverpool', 'Chelsea', 'Aston Villa', 'Newcastle', 'Brighton', 'Tottenham', 'Bournemouth', 'Fulham', 'Brentford', 'Everton', 'Forest', 'Leeds', 'Sunderland', 'West Ham', 'Palace', 'MAN UTD', 'Burnley', 'Wolves'];
const SHOTS: Shot[] = [
	{i: 0, trans: 'cut', C: (t, R) => <Paper>
		<Stat x={120} y={300} label="Điểm sau 10 trận" val="8" t={t} a={0.2} w={820} c={RED} />
		<Stat x={120} y={460} label="Khởi đầu tệ nhất trong" val="40 NĂM" t={t} a={R(1, 0.4)} w={820} />
		<Club x={120} y={160} t={t} a={0.1} size={40} />
		<div style={{position: 'absolute', left: 1180, top: 60}}>
			{TEAMS.map((n, k) => {const mu = n === 'MAN UTD'; return <div key={n} style={{width: 560, height: 44, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 20, padding: '0 16px', fontFamily: MONO, fontSize: 22, color: mu ? '#fff' : '#555', background: mu ? `rgba(198,40,40,${0.35 + 0.6 * E(t, 1.2, 1.6)})` : k >= 17 ? 'rgba(198,40,40,.18)' : 'rgba(0,0,0,.05)', opacity: E(t, 0.1 + k * 0.03, 0.3 + k * 0.03), fontWeight: mu ? 700 : 400}}><span style={{width: 40}}>{k + 1}</span>{n}</div>;})}
		</div>
		<Src x={1180} y={1020} t={t} a={1} c="#888">BXH minh hoạ · MU hạng 18 (Nova News)</Src>
	</Paper>},
	{i: 2, trans: 'left', C: (t, R) => <Paper>
		<S x={120} y={260} t={t} a={0.2} size={70} w={800}><B>41</B> đội từng có<br />8 điểm sau 10 trận</S>
		<S x={120} y={520} t={t} a={R(2, 0.6)} size={70} w={800}><B c={RED}>17</B> đội<br /><B c={RED}>xuống hạng</B></S>
		<Dots t={t} a={0.3} b={R(2, 0.6)} />
		<Src x={120} y={1000} t={t} a={0.5}>nguồn: Nova News / BBC Sport</Src>
	</Paper>},
	{i: 3, trans: 'left', C: (t, R) => <Paper>
		<Circle x={1350} y={560} r={360} c={RED} t={t} a={0.1} />
		<Ground y={1030} t={t} a={0} />
		<Fig n="poch_arms" x={1350} y={1030} h={950} t={t} a={0.1} from="right" />
		<S x={120} y={220} t={t} a={0.3} size={48} w={700}>người được gọi đến</S>
		<S x={120} y={290} t={t} a={0.6} size={92} w={800}><B c={RED}>pochettino</B></S>
		<Club x={140} y={620} t={t} a={R(4, 0.5)} name="LIVERPOOL (A) · 22/11" c={RED} size={36} />
		<Arrow id="lv" x1={1050} y1={500} x2={720} y2={620} bend={0.25} t={t} a={R(4, 0.55)} />
		<Stamp x={200} y={760} t={t} a={R(4, 0.8)} text="TRẬN ĐẦU · ANFIELD" />
	</Paper>},
	{i: 5, trans: 'left', C: (t, R) => <Paper>
		<S x={960} y={260} t={t} a={0.2} size={80} align="center" w={1600}>pochettino <B>có giỏi không?</B></S>
		<Strike x={560} y={320} w={800} t={t} a={R(5, 0.85)} />
		{[-1, 0, 1].map((k) => <Fig key={k} n="poch_arms" x={960 + k * 420} y={1080} h={560} t={t} a={R(6, 0.2) + Math.abs(k) * 0.15} from="up" dim={k ? 0.55 : 0} ghost={!k} />)}
		<S x={960} y={420} t={t} a={R(6, 0.4)} size={84} align="center" w={1600}>man utd nhận <B c={RED}>phiên bản nào?</B></S>
	</Paper>},
	{i: 7, trans: 'up', C: (t, R) => <Paper>
		<Ground y={1000} t={t} a={0} />
		<Fig n="chair" x={1300} y={1000} h={560} t={t} a={0} from="up" />
		<Fig n="carrick" x={760} y={1000} h={900} t={t} a={0.1} from="none" out={R(8, 0.6)} />
		<Src x={120} y={150} t={t} a={0.2} c="#666">12/11/2026</Src>
		<S x={120} y={190} t={t} a={0.3} size={64} w={900}>carrick <B c={RED}>bị sa thải</B></S>
		<Stat x={1000} y={200} label="Carrick dẫn dắt" val="01→11/2026" t={t} a={R(8, 0.2)} w={820} />
	</Paper>},
	{i: 9, trans: 'left', C: (t, R) => <Paper>
		<Fig n="contract" x={520} y={980} h={620} t={t} a={0} from="up" />
		<Stamp x={340} y={300} t={t} a={R(9, 0.6)} text="ĐẾN 6/2029" />
		<Ground y={980} t={t} a={0} />
		<Fig n="money" x={1450} y={980} h={560} t={t} a={R(10, 0)} from="up" />
		<Stat x={1000} y={160} label="Phí giải phóng (Sky)" val="£7,4 TR" t={t} a={R(10, 0.5)} w={820} c={RED} />
		<Src x={1000} y={280} t={t} a={R(10, 0.7)}>báo khác: ~10 triệu USD</Src>
	</Paper>},
	{i: 11, trans: 'left', C: (t, R, d) => <Bg n="stadium" t={t} d={d}>
		<S x={960} y={110} t={t} a={0.2} size={60} align="center" w={1600}>hậu ferguson: <B c={RED}>8</B> huấn luyện viên chính thức</S>
		<ChairRow t={t} a={0.4} />
		<Stat x={560} y={940} label="13 năm" val="8 HLV" t={t} a={R(12, 0.1)} w={800} c={RED} />
	</Bg>},
	{i: 13, trans: 'left', C: (t, R) => <AbsoluteFill style={zoomHub(0, t, R(14, 0.3))}><Hub t={t} /></AbsoluteFill>},
	{i: 15, trans: 'zoom', C: (t, R) => <Paper>
		<FromCircle t={t} c={RED} x={1380} y={560} r={360} />
		<Fig n="poch_arms" x={1380} y={1040} h={960} t={t} a={0.2} from="up" />
		<Ground y={1040} t={t} a={0.2} />
		<S x={120} y={120} t={t} a={0.3} size={40}>phiên bản #1</S>
		<S x={120} y={170} t={t} a={0.4} size={84} w={800}><B c={RED}>người xây dựng</B></S>
		<Club x={120} y={320} t={t} a={R(15, 0.3)} name="SOUTHAMPTON · SPURS" c={INK} size={32} />
		<Stat x={120} y={440} label="5 mùa trọn vẹn · thấp nhất" val="HẠNG 5" t={t} a={R(15, 0.6)} w={800} />
		<Stamp x={180} y={600} t={t} a={R(16, 0.4)} text="CHUNG KẾT C1 · 2019" />
		<S x={120} y={760} t={t} a={R(17, 0.1)} size={44} w={800}>quỹ lương <B c={RED}>thấp hơn hẳn</B> nhóm đầu</S>
	</Paper>},
	{i: 18, trans: 'left', C: (t, R) => <Paper>
		<S x={120} y={200} t={t} a={0.2} size={64} w={760}><B c={RED}>pressing</B> cường độ cao</S>
		<S x={120} y={330} t={t} a={R(18, 0.6)} size={52} w={760}>+ cầu thủ <B>trẻ</B></S>
		<Pitch t={t} a={0.1}>
			{[[1560, 330], [1640, 480], [1520, 600], [1700, 400]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={110 * E(t, 0.5 + k * 0.15, 1 + k * 0.15)} fill={RED} opacity={0.35} style={{filter: 'blur(20px)'}} />)}
		</Pitch>
		<Src x={960} y={780} t={t} a={0.6}>sơ đồ minh hoạ</Src>
		<Fig n="hourglass" x={480} y={1040} h={480} t={t} a={R(19, 0)} from="up" />
		<S x={720} y={880} t={t} a={R(19, 0.4)} size={56} w={700}>cần: <B c={RED}>nhiều năm</B></S>
	</Paper>},
	{i: 20, trans: 'left', C: (t, R) => <AbsoluteFill style={zoomHub(1, t, R(20, 0.5))}><Hub t={t + 3} /></AbsoluteFill>},
	{i: 21, trans: 'zoom', C: (t, R) => <Paper>
		<FromCircle t={t} c={BLUE} x={960} y={600} r={330} />
		<S x={120} y={110} t={t} a={0.3} size={40}>phiên bản #2</S>
		<S x={120} y={160} t={t} a={0.4} size={76} w={900}><B c={BLUE}>quản lý ngôi sao</B></S>
		{['MESSI', 'NEYMAR', 'MBAPPÉ'].map((n, k) => <Club key={n} x={1260} y={160 + k * 110} t={t} a={R(21, 0.3) + k * 0.2} name={n} c={BLUE} size={34} rot={k - 1} />)}
		<Fig n="poch_arms" x={960} y={1080} h={560} t={t} a={0.2} from="up" />
		<Stat x={120} y={360} label="Paris" val="LIGUE 1 + CÚP PHÁP" t={t} a={R(22, 0.2)} w={820} />
		<Stamp x={1300} y={620} t={t} a={R(23, 0.5)} text="SA THẢI · 1,5 MÙA" />
		<S x={120} y={520} t={t} a={R(24, 0.1)} size={46} w={640}>không xây — chỉ giữ<br />các ngôi sao <B c={BLUE}>vui</B></S>
		<Arrow id="ps" x1={600} y1={680} x2={860} y2={820} bend={0.2} t={t} a={R(24, 0.4)} />
	</Paper>},
	{i: 25, trans: 'left', C: (t, R) => <AbsoluteFill style={zoomHub(2, t, R(25, 0.6))}><Hub t={t + 3} /></AbsoluteFill>},
	{i: 26, trans: 'zoom', C: (t, R) => <Paper>
		<FromCircle t={t} c={RED} x={1400} y={600} r={330} />
		<S x={120} y={110} t={t} a={0.3} size={40}>phiên bản #3</S>
		<S x={120} y={160} t={t} a={0.4} size={76} w={900}><B c={RED}>dọn đống đổ nát</B></S>
		<Club x={120} y={300} t={t} a={0.6} name="CHELSEA" c={BLUE} size={34} />
		<Fig n="contract" x={1250} y={900} h={380} t={t} a={0.3} from="up" />
		<Fig n="money" x={1560} y={900} h={380} t={t} a={0.45} from="up" />
		<Ground y={900} t={t} a={0.3} />
		<S x={120} y={420} t={t} a={R(26, 0.4)} size={46} w={800}>đội hình <B>đắt đỏ</B>, toàn người mới</S>
		<Stamp x={200} y={620} t={t} a={R(27, 0.3)} text="1 MÙA · HẠNG 6" />
		<Src x={120} y={800} t={t} a={R(27, 0.5)}>chia tay 21/5/2024 · Sky Sports</Src>
	</Paper>},
	{i: 28, trans: 'left', C: (t, R) => <Paper>
		<Circle x={1380} y={560} r={340} c={BLUE} t={t} a={0.1} />
		<Ground y={1030} t={t} a={0} />
		<Fig n="poch_clap" x={1380} y={1030} h={980} t={t} a={0.1} from="right" />
		<S x={120} y={150} t={t} a={0.3} size={40}>phiên bản #4</S>
		<Club x={120} y={230} t={t} a={0.4} name="TUYỂN MỸ" c={BLUE} size={40} />
		<S x={120} y={360} t={t} a={0.6} size={60} w={800}>world cup <B c={BLUE}>trên sân nhà</B></S>
		<Stamp x={180} y={540} t={t} a={R(28, 0.6)} text="VÒNG 16 ĐỘI" />
	</Paper>},
	{i: 29, trans: 'left', C: (t, R) => <Paper>
		<AbsoluteFill style={{transform: `scale(${lerp(1, 0.78, E(t, R(30, 0), R(30, 0.5)))}) translateY(${-180 * E(t, R(30, 0), R(30, 0.5))}px)`}}><Hub t={t} title={<>bốn phiên bản, <B c={RED}>một điểm chung</B></>} /></AbsoluteFill>
		{['thời gian', 'quyền lực', 'cầu thủ chịu chạy'].map((w, k) => <S key={w} x={260 + k * 520} y={840} t={t} a={R(30, 0.2) + k * 0.35} size={58} w={520} align="center"><B c={k === 1 ? BLUE : RED}>{w}</B></S>)}
		<S x={960} y={960} t={t} a={R(31, 0.1)} size={48} align="center" w={1600}>man utd lúc này có đủ <B>ba thứ</B> đó không?</S>
	</Paper>},
	// ===== PHẦN 2 =====
	{i: 32, trans: 'up', C: (t, R) => <Paper>
		<Big n="1" t={t} a={0.1} />
		<S x={380} y={150} t={t} a={0.3} size={44}>mảnh ghép</S>
		<S x={380} y={210} t={t} a={0.4} size={96} w={800}><B c={RED}>thời gian</B></S>
		<Fig n="hourglass" x={1500} y={1000} h={760} t={t} a={0.2} from="up" />
		<Ground y={1000} t={t} a={0.2} />
		<Card x={140} y={480} t={t} a={R(33, 0.1)} top="POCHETTINO CẦN" main="nhiều năm" c={BLUE} />
		<Card x={140} y={640} t={t} a={R(33, 0.55)} top="MAN UTD CẦN" main="điểm · ngay tuần này" c={RED} />
	</Paper>},
	{i: 34, trans: 'left', C: (t, R) => <Paper>
		<S x={120} y={110} t={t} a={0.1} size={56} w={800}>lịch <B c={RED}>17 ngày</B> đầu</S>
		{[['22/11 · PL', 'Liverpool (sân khách)'], ['25/11 · C1', 'Sporting (sân khách)'], ['28/11 · PL', 'Brentford (sân nhà)'], ['02/12 · PL', 'Newcastle (sân khách)'], ['05/12 · PL', 'Coventry (sân nhà)'], ['08/12 · C1', 'RB Leipzig (sân nhà)']].map(([a, b], k) => <Card key={k} x={k < 3 ? 120 : 700} y={230 + (k % 3) * 150} t={t} a={0.3 + k * 0.35} top={a} main={b} c={k % 2 ? BLUE : RED} />)}
		<Src x={120} y={700} t={t} a={1.5}>nguồn: Sky Sports</Src>
		<Stat x={1300} y={240} label="Số trận" val="6" t={t} a={R(35, 0.1)} w={520} c={RED} />
		<Fig n="tactics" x={1560} y={1040} h={560} t={t} a={R(36, 0)} from="up" />
		<Stamp x={1250} y={460} t={t} a={R(36, 0.5)} text="3 BUỔI TẬP" />
	</Paper>},
	{i: 37, trans: 'left', C: (t, R) => <Paper>
		<S x={120} y={150} t={t} a={0.2} size={64} w={800}>không có <B>tiền mùa giải</B></S>
		<S x={120} y={260} t={t} a={0.6} size={64} w={800}>không kịp cài <B c={RED}>pressing</B></S>
		<Strike x={540} y={310} w={330} t={t} a={R(37, 0.8)} />
		<Fig n="poch_arms" x={480} y={1080} h={560} t={t} a={R(38, 0)} from="left" dim={E(t, R(38, 0.4), R(38, 0.8)) * 0.6} />
		<S x={120} y={420} t={t} a={R(39, 0.1)} size={56} w={800}>mà là: <B c={RED}>đừng thua trước</B></S>
		<Pitch t={t} a={R(39, 0)}>
			{[1060, 1090, 1090, 1060].map((x, k) => <circle key={k} cx={x + 60} cy={280 + k * 130} r={22} fill={RED} stroke="#f5f1e8" strokeWidth={4} />)}
			{[0, 1, 2, 3].map((k) => <circle key={'m' + k} cx={1220} cy={280 + k * 130} r={22} fill={RED} stroke="#f5f1e8" strokeWidth={4} />)}
			<circle cx={1330} cy={480} r={22} fill={RED} stroke="#f5f1e8" strokeWidth={4} /><circle cx={1360} cy={400} r={22} fill={RED} stroke="#f5f1e8" strokeWidth={4} />
		</Pitch>
		<Src x={960} y={780} t={t} a={R(39, 0.2)}>khối thấp · sơ đồ minh hoạ</Src>
	</Paper>},
	{i: 40, trans: 'up', C: (t, R, d) => <Bg n="dressing" t={t} d={d}>
		<Big n="2" t={t} a={0.1} />
		<S x={380} y={150} t={t} a={0.3} size={44}>mảnh ghép</S>
		<S x={380} y={210} t={t} a={0.4} size={90} w={900}><B c={RED}>phòng thay đồ</B></S>
		<Fig n="bruno" x={1300} y={1080} h={900} t={t} a={R(41, 0)} from="right" />
		<Fig n="martinez" x={1650} y={1080} h={880} t={t} a={R(42, 0)} from="right" />
		<Clip x={120} y={430} w={640} t={t} a={R(41, 0.3)} src="báo chí Anh · tháng 10">bruno <B c={RED}>bị gạt</B> sau khi chê chiến thuật của carrick</Clip>
		<Clip x={180} y={680} w={640} t={t} a={R(42, 0.2)} src="Lisandro Martínez" rot={1.5}>phê bình ban lãnh đạo về <B c={RED}>đầu tư</B></Clip>
	</Bg>},
	{i: 43, trans: 'left', C: (t, R) => <Paper>
		<S x={120} y={150} t={t} a={0.2} size={60} w={900}>đã lên tiếng thì<br /><B c={RED}>khó im lặng</B></S>
		<Fig n="armband" x={500} y={900} h={340} t={t} a={0.3} from="up" />
		<Ground y={900} t={t} a={0.3} />
		<Circle x={1450} y={420} r={220} c={BLUE} t={t} a={R(44, 0)} />
		<div style={{position: 'absolute', left: 1230, top: 390, width: 440, textAlign: 'center', fontFamily: MONO, fontSize: 40, color: '#fff', letterSpacing: 4, opacity: E(t, R(44, 0.2), R(44, 0.4))}}>PSG</div>
		<Arrow id="bk" x1={900} y1={520} x2={1240} y2={440} bend={-0.2} t={t} a={R(44, 0.3)} />
		<S x={1180} y={680} t={t} a={R(45, 0.1)} size={44} w={600} align="center">ngôi sao <B>không nổi loạn</B><br />đội <B c={RED}>không tiến lên</B></S>
		<Stamp x={1300} y={880} t={t} a={R(46, 0.2)} text="Ở MU: CẦN CẢ HAI" />
	</Paper>},
	{i: 47, trans: 'up', C: (t, R) => <Paper>
		<Big n="3" t={t} a={0.1} />
		<S x={380} y={150} t={t} a={0.3} size={44}>mảnh ghép</S>
		<S x={380} y={210} t={t} a={0.4} size={90} w={900}><B c={RED}>tiền & quyền</B></S>
		<Fig n="money" x={1500} y={760} h={480} t={t} a={0.3} from="up" />
		<Clip x={120} y={430} w={620} t={t} a={R(48, 0.2)} src="Sky Sports · Rob Dorsett">sẽ được <B c={RED}>hậu thuẫn mạnh</B> tháng 1</Clip>
		{['MAGUIRE', 'BRUNO', 'SHAW'].map((n, k) => <Club key={n} x={140 + k * 300} y={720} t={t} a={R(49, 0.2) + k * 0.25} name={n} size={32} rot={k - 1} />)}
		<Src x={140} y={830} t={t} a={R(49, 0.6)}>hết hợp đồng hè 2027 · CLB có quyền +1 năm</Src>
		<S x={1100} y={860} t={t} a={R(50, 0.2)} size={46} w={760}>làm lại đội hình <B c={RED}>theo ý mình</B></S>
	</Paper>},
	{i: 51, trans: 'left', C: (t, R, d) => <Bg n="stadium" t={t} d={d}>
		<S x={960} y={110} t={t} a={0.2} size={60} align="center" w={1600}>nhưng tiền <B c={RED}>chưa bao giờ</B> là vấn đề</S>
		<ChairRow t={t} a={R(52, 0)} />
		<Clip x={1200} y={300} w={600} t={t} a={R(53, 0.2)} src="Manchester United Supporters' Trust">khoản nợ từ thương vụ <B c={RED}>glazer 2005</B> vẫn đè nặng CLB</Clip>
	</Bg>},
	// ===== CÚ LẬT =====
	{i: 54, trans: 'up', C: (t, R) => <Paper>
		<AbsoluteFill style={{background: `rgba(20,20,20,${0.12 * E(t, 0, 0.5)})`}} />
		<S x={960} y={160} t={t} a={0.1} size={56} align="center" w={1600}>điều <B>ít ai nói</B></S>
		<Stat x={120} y={360} label="Danh hiệu lớn ở Anh" val="0" t={t} a={R(55, 0.2)} w={780} c={RED} />
		<S x={120} y={520} t={t} a={R(56, 0.1)} size={56} w={780}>điểm yếu<B c={RED}>?</B></S>
		<Fig n="trophy" x={1400} y={980} h={640} t={t} a={R(57, 0)} from="up" />
		<Ground y={980} t={t} a={R(57, 0)} />
		<svg width={W} height={H} style={{position: 'absolute', zIndex: 4}}><path d="M 1150 380 L 1650 940" stroke={RED} strokeWidth={18} strokeLinecap="round" pathLength={1} strokeDasharray={`${E(t, R(57, 0.4), R(57, 0.7))} 1`} /></svg>
	</Paper>},
	{i: 58, trans: 'left', C: (t, R) => <Paper>
		<Circle x={960} y={540} r={380} c={RED} t={t} a={0.1} />
		<Ground y={1040} t={t} a={0} />
		<Fig n="poch_stand" x={960} y={1040} h={980} t={t} a={0.1} from="up" />
		<S x={100} y={200} t={t} a={0.3} size={60} w={560}>một người<br />giữ đội <B c={RED}>không vỡ</B></S>
		<S x={1340} y={220} t={t} a={R(59, 0.1)} size={44} w={520}>spurs: <B>5 năm</B>,<br />ít tiền, ít ngôi sao</S>
		<Arrow id="sp" x1={1440} y1={360} x2={1180} y2={480} bend={0.25} t={t} a={R(59, 0.4)} />
		<S x={100} y={760} t={t} a={R(60, 0.2)} size={64} w={600}>người họ <B c={RED}>cần</B></S>
		<S x={1340} y={760} t={t} a={R(60, 0.55)} size={64} w={560}>không phải<br />người họ <B c={BLUE}>muốn</B></S>
	</Paper>},
	// ===== NHẬN ĐỊNH =====
	{i: 61, trans: 'left', C: (t, R) => <Paper>
		<S x={960} y={100} t={t} a={0.1} size={60} align="center" w={1600}>pochettino có <B c={RED}>cứu được</B> man utd?</S>
		{['thời gian', 'phòng thay đồ', 'tiền & quyền'].map((w, k) => <React.Fragment key={w}><Circle x={460 + k * 500} y={480} r={170} c={k === 1 ? BLUE : RED} t={t} a={0.3 + k * 0.15} /><div style={{position: 'absolute', left: 460 + k * 500 - 170, top: 400, width: 340, textAlign: 'center', fontFamily: SERIF, fontSize: 120, color: '#fff', opacity: E(t, 0.5 + k * 0.15, 0.8 + k * 0.15)}}>{k + 1}</div><div style={{position: 'absolute', left: 460 + k * 500 - 200, top: 680, width: 400, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 42, color: INK, opacity: E(t, 0.7, 1)}}>{w}</div></React.Fragment>)}
		<S x={960} y={820} t={t} a={R(62, 0.1)} size={48} align="center" w={1600}>theo 90+: ba tuần đầu <B>chưa nói lên nhiều</B></S>
	</Paper>},
	{i: 63, trans: 'left', C: (t, R) => <Paper>
		<Stat x={120} y={220} label="Mốc mở chợ" val="01/2027 → ?" t={t} a={0.2} w={860} c={RED} />
		<Card x={120} y={420} t={t} a={R(64, 0.2)} top="RA KHỎI NHÓM XUỐNG HẠNG" main="có được thời gian" c={'#2E7D32'} />
		<Card x={120} y={580} t={t} a={R(65, 0.2)} top="KHÔNG" main="câu hỏi cũ · lần thứ 9" c={RED} />
		<Fig n="hourglass" x={1500} y={1000} h={700} t={t} a={0.1} from="up" />
		<Ground y={1000} t={t} a={0.1} />
	</Paper>},
	{i: 66, trans: 'left', C: (t, R) => <Paper>
		<Circle x={600} y={560} r={330} c={RED} t={t} a={0.1} />
		<Ground y={1030} t={t} a={0} />
		<Fig n="poch_point" x={600} y={1030} h={960} t={t} a={0.1} from="left" />
		<Fig n="chair" x={1500} y={1030} h={460} t={t} a={R(67, 0)} from="up" />
		<Src x={1360} y={1050} t={t} a={R(67, 0.2)} c={INK}>BAN LÃNH ĐẠO</Src>
		<S x={1000} y={160} t={t} a={0.3} size={50} w={860}>mảnh ghép quan trọng nhất<br /><B>không nằm ở pochettino</B></S>
		<S x={1000} y={360} t={t} a={R(67, 0.2)} size={56} w={860}>mà ở sự <B c={RED}>kiên nhẫn</B></S>
		<Arrow id="bl" x1={1250} y1={480} x2={1480} y2={600} bend={-0.2} t={t} a={R(67, 0.5)} />
	</Paper>},
	{i: 68, trans: 'up', C: (t, R) => <Paper>
		<S x={960} y={120} t={t} a={0.1} size={64} align="center" w={1700}>pochettino sẽ trụ được <B c={RED}>bao lâu</B>?</S>
		<Circle x={600} y={560} r={230} c={BLUE} t={t} a={R(69, 0)} />
		<Circle x={1320} y={560} r={230} c={RED} t={t} a={R(69, 0.5)} />
		<div style={{position: 'absolute', left: 370, top: 500, width: 460, textAlign: 'center', fontFamily: SERIF, fontSize: 80, color: '#fff', opacity: E(t, R(69, 0.1), R(69, 0.3))}}>1 mùa</div>
		<div style={{position: 'absolute', left: 1090, top: 500, width: 460, textAlign: 'center', fontFamily: SERIF, fontSize: 80, color: '#fff', opacity: E(t, R(69, 0.6), R(69, 0.8))}}>5 năm</div>
		<Src x={500} y={820} t={t} a={R(69, 0.2)} c={INK}>như ở Chelsea</Src>
		<Src x={1200} y={820} t={t} a={R(69, 0.7)} c={INK}>như ở Tottenham</Src>
		<S x={960} y={900} t={t} a={R(70, 0.1)} size={48} align="center" w={1600}>để lại <B c={RED}>dự đoán</B> ở phần bình luận</S>
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
export const POCHVideo: React.FC = () => {
	const f = useCurrentFrame(), t = f / 30, D = POCH_DUR;
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
			<Img src={staticFile('mu/logo.png')} style={{position: 'absolute', left: 960 - 230, top: 540 - 270, width: 460, height: 460, borderRadius: '50%', transform: `scale(${lerp(0.6, 1, E(t, D - 3.0, D - 2.3, Easing.out(Easing.back(1.6))))}) rotate(${lerp(-8, 0, E(t, D - 3.0, D - 2.3))}deg)`, filter: 'drop-shadow(10px 14px 0 rgba(0,0,0,.25))'}} />
			<div style={{position: 'absolute', top: 760, width: 1920, textAlign: 'center', fontFamily: SERIF, fontSize: 44, color: INK, opacity: E(t, D - 2.2, D - 1.8)}}>đăng ký để không bỏ lỡ <b style={{fontStyle: 'italic', color: RED}}>bên kia bảng tỷ số</b></div>
		</Paper></AbsoluteFill>
		<div style={{position: 'absolute', right: 40, bottom: 30, fontFamily: MONO, fontSize: 16, color: '#888', opacity: E(t, D - 9, D - 8.5) * (1 - E(t, D - 3.2, D - 3))}}>hình minh hoạ · nguồn: Sky Sports, BBC Sport, CNN, Al Jazeera, Nova News</div>
		<AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'multiply'}}><Img src={staticFile(`tex/noise${Math.floor(f / 3) % 4}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
		<AbsoluteFill style={{background: '#000', opacity: E(t, D - 0.6, D - 0.05)}} />
		<Audio src={staticFile('poch/mix.wav')} />
	</AbsoluteFill>;
};
