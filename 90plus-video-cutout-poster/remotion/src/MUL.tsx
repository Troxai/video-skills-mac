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

// 16:9 long version
const SPD = 1.15;
const T0 = [[0,2.14],[2.46,5.84],[6.16,10.69],[11.01,12.82],[13.14,17.38],[17.7,23.09],[23.41,26.23],[26.55,28.61],[28.93,30.88],[31.2,35.82],[36.14,39.69],[40.01,42.11],[42.43,45.18],[45.5,48.25],[48.57,55.73],[56.05,57.27],[57.59,61.06],[61.38,66.54],[66.86,70.02],[70.34,73.66],[73.98,76.34],[76.66,79.51],[79.83,81.31],[81.63,85.65],[85.97,90.42],[90.74,95.96],[96.28,100.8],[101.12,104.46],[104.78,110.37],[110.69,115.38],[115.7,117.19],[117.51,121.32],[121.64,124.44],[124.76,131.27],[131.59,136.55],[136.87,139.7],[140.02,142.72],[143.04,148.7],[149.02,153.9],[154.22,159.76],[160.08,165.61],[165.93,173.33],[173.65,176.76],[177.08,180.14],[180.46,184.59],[184.91,187.03],[187.35,190.66]];
const T = T0.map(([a, b]) => [a / SPD, b / SPD]);
export const MUL_DUR = Math.round(190.66 / SPD + 3.2) + 3;
const W = 1920, H = 1080;
const SERIF = 'Playfair Display', MONO = 'JetBrains Mono';
const INK = '#141414', RED = '#C62828', BLUE = '#1E4FA8', GREEN = '#2E7D32';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const E = (t: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(t, [a, b], [0, 1], {...cl, easing: e});
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const SIZE: Record<string, [number, number]> = {carrick: [744, 2480], bruno: [1010, 2461], martinez: [975, 2464], wilcox: [704, 2471], neville: [866, 2515], chair: [1116, 1758], tactics: [1019, 2050], money: [1311, 1954], contract: [1394, 1576], armband: [1417, 1069], solskjaer: [760, 2353], ratcliffe: [809, 2469]};
const r = (i: number, f = 0) => T[i][0] + (T[i][1] - T[i][0]) * f; // absolute time inside line i

// ---------- blocks ----------
const Paper: React.FC<{children?: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: '#e9e9e7'}}>
	<Img src={staticFile('mz/paper.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, mixBlendMode: 'multiply'}} />{children}</AbsoluteFill>;
const Dark: React.FC<{children?: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: '#0b0b0b'}}>
	<AbsoluteFill style={{backgroundImage: 'radial-gradient(#2a2a2a 1.4px, transparent 1.6px)', backgroundSize: '16px 16px', opacity: 0.8}} />
	<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(0,0,0,.7))'}} />{children}</AbsoluteFill>;
const Bg: React.FC<{n: string; t: number; d: number; dim?: number; children?: React.ReactNode}> = ({n, t, d, children}) => <Paper>
	<Img src={staticFile(`mu/bg_${n}.jpg`)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.38, mixBlendMode: 'multiply', filter: 'contrast(1.1)', transformOrigin: '30% 30%', transform: `scale(${1.16 + 0.06 * (t / Math.max(d, 1))}) translateX(${-20 * t / Math.max(d, 1)}px)`}} />
	<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(233,233,231,.85) 0%, rgba(233,233,231,.2) 55%, transparent)'}} />{children}</Paper>;
const Fig: React.FC<{n: string; x: number; y: number; h: number; t: number; a: number; crop?: number; flip?: boolean; from?: 'left' | 'right' | 'up' | 'none'; out?: number; dim?: number; shake?: number; ghost?: boolean; drop?: number}> = ({n, x, y, h, t, a, crop = 1, flip, from = 'none', out = 1e9, dim = 0, shake = 0, ghost = true, drop}) => {
	const [w0, h0] = SIZE[n]; const w = (w0 / h0) * h;
	const u = E(t, a, a + 0.55);
	const o = 1 - E(t, out, out + 0.35, Easing.in(Easing.cubic));
	const dx = from === 'left' ? -700 * (1 - u) : from === 'right' ? 700 * (1 - u) : 0;
	const dy = from === 'up' ? -300 * (1 - u) : 0;
	const vis = h * crop, g = h * 0.019;
	const rot = drop !== undefined ? 90 * E(t, drop, drop + 0.45, Easing.in(Easing.quad)) : 0;
	const im = (gh: boolean) => <Img src={staticFile(`mu/${n}.png`)} style={{position: 'absolute', left: gh ? -g : 0, top: gh ? g * 0.15 : 0, width: w, height: h, transform: flip ? 'scaleX(-1)' : undefined, filter: gh ? 'grayscale(1) brightness(.35)' : dim ? `brightness(${1 - dim}) grayscale(${dim})` : undefined, opacity: gh ? 0.35 : 1}} />;
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

// suspects page (16:9)
const CIRC = [{x: 560, y: 520, c: RED}, {x: 960, y: 520, c: BLUE}, {x: 1360, y: 520, c: RED}];
const Suspects: React.FC<{t: number; fill: number[]; chair?: number; ask?: number}> = ({t, fill, chair, ask}) => {
	const figs = [['carrick'], ['bruno', 'martinez'], ['wilcox']];
	return <Paper>
		<S x={960} y={90} t={t} a={0.1} size={48} align="center" w={1200}>ai có lỗi?</S>
		<S x={960} y={150} t={t} a={0.4} size={80} align="center" w={1200}><B>ba</B> nghi phạm</S>
		{CIRC.map((c, i) => <React.Fragment key={i}>
			<Circle x={c.x} y={c.y} r={150} c={c.c} t={t} a={0.6 + i * 0.2} />
			{fill[i] < 0 ? <div style={{position: 'absolute', left: c.x - 150, top: c.y - 150, width: 300, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 170, color: '#fff', opacity: E(t, 0.8 + i * 0.2, 1.1 + i * 0.2)}}>?</div>
				: figs[i].map((n, j) => <Fig key={n} n={n} x={c.x + (figs[i].length > 1 ? (j - 0.5) * 120 : 0)} y={c.y + 150} h={figs[i].length > 1 ? 600 : 680} crop={0.52} t={t} a={fill[i]} from="up" />)}
			<div style={{position: 'absolute', left: c.x - 160, top: c.y + 175, width: 320, textAlign: 'center', fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: INK, opacity: E(t, 1.0 + i * 0.2, 1.4 + i * 0.2)}}>{['HLV', 'CẦU THỦ', 'BAN LÃNH ĐẠO'][i]}</div>
		</React.Fragment>)}
		{chair !== undefined && <><Ground y={1010} t={t} a={chair - 0.2} /><Fig n="chair" x={960} y={1010} h={220} t={t} a={chair} from="up" shake={E(t, chair + 0.5, chair + 0.8) * 0.8} /></>}
		{ask !== undefined && <S x={1350} y={780} t={t} a={ask} size={56} align="left" w={560}>ai đáng bị<br /><B c={RED}>gọi tên</B>?</S>}
	</Paper>;
};
const zoomInto = (k: number, t: number, a: number) => {const u = E(t, a, a + 0.6, Easing.in(Easing.cubic)); const c = CIRC[k]; return {transformOrigin: `${c.x}px ${c.y}px`, transform: `scale(${lerp(1, 9, u)})`};};
const FromCircle: React.FC<{t: number; c: string; x: number; y: number; r: number}> = ({t, c, x, y, r: rr}) => {const u = E(t, 0, 0.6); const R = lerp(1300, rr, u); return <div style={{position: 'absolute', left: lerp(960, x, u) - R, top: lerp(540, y, u) - R, width: R * 2, height: R * 2, borderRadius: '50%', background: c, filter: 'url(#rough)'}} />;};

// ---------- shots: start line, trans, render(t = seconds since shot start, a = absolute->relative helper) ----------
type Shot = {i: number; trans: 'left' | 'up' | 'cut' | 'zoom'; C: (t: number, R: (i: number, f?: number) => number, d: number) => React.ReactNode};
const TEAMS = ['Arsenal', 'Man City', 'Liverpool', 'Chelsea', 'Aston Villa', 'Newcastle', 'Brighton', 'Tottenham', 'Bournemouth', 'Fulham', 'Brentford', 'Everton', 'Forest', 'Leeds', 'Sunderland', 'West Ham', 'Palace', 'MAN UTD', 'Burnley', 'Wolves'];
const CHAIRS = ['Moyes', 'Van Gaal', 'Mourinho', 'Solskjaer', 'Ten Hag', 'Amorim', 'Carrick'];
const ChairRow: React.FC<{t: number; a: number; drops: (number | undefined)[]; dark?: boolean}> = ({t, a, drops, dark}) => <>
	{CHAIRS.map((n, k) => <React.Fragment key={n}>
		<Fig n="chair" x={250 + k * 237} y={820} h={300} t={t} a={a + k * 0.08} from="up" drop={drops[k]} ghost={false} />
		<div style={{position: 'absolute', left: 250 + k * 237 - 110, top: 850, width: 220, textAlign: 'center', fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: INK, opacity: E(t, a + 0.3 + k * 0.08, a + 0.6 + k * 0.08)}}>{k + 1}. {n.toUpperCase()}</div>
	</React.Fragment>)}
	<Ground y={820} t={t} a={a} c={INK} />
</>;

const SHOTS: Shot[] = [
	{i: 0, trans: 'cut', C: (t, R) => <Paper>
		<Club x={120} y={220} t={t} a={0.1} size={44} />
		<S x={120} y={330} t={t} a={0.2} size={92} c={INK} w={800}>nhóm<br /><B c={RED}>xuống hạng</B></S>
		<div style={{position: 'absolute', left: 1180, top: 60}}>
			{TEAMS.map((n, k) => {const isMU = n === 'MAN UTD'; return <div key={n} style={{width: 560, height: 44, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 20, padding: '0 16px', fontFamily: MONO, fontSize: 22, color: isMU ? '#fff' : '#555', background: isMU ? `rgba(198,40,40,${0.35 + 0.6 * E(t, 1.2, 1.6)})` : k >= 17 ? 'rgba(198,40,40,.18)' : 'rgba(0,0,0,.05)', opacity: E(t, 0.1 + k * 0.03, 0.3 + k * 0.03), transform: isMU ? `translateY(${-(1 - E(t, 0.6, 1.4, Easing.out(Easing.bounce))) * 400}px)` : undefined, fontWeight: isMU ? 700 : 400}}><span style={{width: 40}}>{k + 1}</span>{n}</div>;})}
		</div>
	</Paper>},
	{i: 1, trans: 'left', C: (t, R) => <Paper>
		<Stat x={120} y={300} label="Điểm sau 10 trận" val="8" t={t} a={0.4} w={820} />
		<Stat x={120} y={470} label="Khởi đầu tệ nhất kể từ" val="1986" t={t} a={R(1, 0.45)} w={820} c={RED} />
		<Fig n="carrick" x={1420} y={1080} h={1700} crop={0.62} t={t} a={0.1} from="right" />
	</Paper>},
	{i: 2, trans: 'up', C: (t, R, d) => <Bg n="crowd" t={t} d={d} dim={0.6}>
		<Circle x={480} y={640} r={300} c={BLUE} t={t} a={0.2} />
		<Circle x={1440} y={640} r={330} c={RED} t={t} a={R(3, 0)} />
		<Fig n="carrick" x={480} y={1080} h={1000} t={t} a={0.1} from="left" />
		<Fig n="bruno" x={1330} y={1080} h={1000} t={t} a={R(3, 0) - 0.1} from="right" />
		<Fig n="martinez" x={1580} y={1090} h={980} t={t} a={R(3, 0)} from="right" />
		<S x={720} y={150} t={t} a={R(2, 0.6)} size={64} c={INK} w={500}><B c={BLUE}>vỗ tay</B></S>
		<Arrow id="h1" x1={760} y1={240} x2={580} y2={330} bend={0.3} t={t} a={R(2, 0.65)} c={INK} />
		<S x={1000} y={150} t={t} a={R(3, 0.1)} size={64} c={INK} w={400} align="right"><B c={RED}>la ó</B></S>
		<Arrow id="h2" x1={1300} y1={240} x2={1380} y2={330} bend={-0.3} t={t} a={R(3, 0.15)} c={INK} />
	</Bg>},
	{i: 4, trans: 'left', C: (t, R) => <Paper>
		<Circle x={960} y={600} r={360} c={RED} t={t} a={0} out={R(4, 0.55)} />
		<Ground y={1000} t={t} a={0} />
		<Fig n="chair" x={960} y={1000} h={760} t={t} a={0} from="up" shake={E(t, 1.0, 1.3) * (1 - E(t, R(4, 0.55), R(4, 0.6)))} out={R(4, 0.55)} />
		<S x={120} y={240} t={t} a={0.3} size={70} w={560}>chiếc ghế<br /><B c={RED}>nóng nhất</B><br />nước Anh</S>
		<Arrow id="c1" x1={480} y1={520} x2={640} y2={600} bend={-0.25} t={t} a={0.8} out={R(4, 0.55)} />
		{CIRC.map((c, k) => <React.Fragment key={k}><Circle x={c.x} y={c.y} r={150} c={c.c} t={t} a={R(4, 0.6) + k * 0.15} /><div style={{position: 'absolute', left: c.x - 150, top: c.y - 150, width: 300, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 170, color: '#fff', opacity: E(t, R(4, 0.65) + k * 0.15, R(4, 0.75) + k * 0.15)}}>?</div></React.Fragment>)}
	</Paper>},
	{i: 5, trans: 'left', C: (t, R, d) => <Bg n="stadium" t={t} d={d} dim={0.75}>
		<S x={960} y={120} t={t} a={0.3} size={60} c={INK} align="center" w={1400}>từ 2013: <B c={RED}>7</B> huấn luyện viên chính thức</S>
		<Club x={120} y={250} t={t} a={R(5, 0.35)} size={36} />
		<ChairRow t={t} a={R(5, 0.5)} drops={[R(6, 0.02), R(6, 0.17), R(6, 0.33), R(6, 0.5), R(6, 0.66), R(6, 0.82), undefined]} dark />
		<Fig n="carrick" x={1700} y={1080} h={900} t={t} a={R(7, 0.1)} from="right" />
		<Arrow id="c7" x1={1520} y1={330} x2={1680} y2={560} bend={-0.2} t={t} a={R(7, 0.35)} c={INK} />
		<S x={1250} y={250} t={t} a={R(7, 0.3)} size={48} c={INK} w={400}>người thứ <B c={RED}>7</B></S>
	</Bg>},
	{i: 8, trans: 'left', C: (t, R) => <Paper>
		<Circle x={1350} y={560} r={330} c={BLUE} t={t} a={0.1} />
		<Ground y={1020} t={t} a={0} />
		<Fig n="carrick" x={1350} y={1020} h={920} t={t} a={0} from="right" />
		<S x={120} y={200} t={t} a={0.3} size={62} w={700}>bắt đầu như<br /><B c={BLUE}>một giấc mơ</B></S>
		<Clip x={140} y={520} t={t} a={R(9, 0.1)} src="05/01/2026">amorim <B c={RED}>bị sa thải</B></Clip>
		<Clip x={240} y={720} t={t} a={R(9, 0.55)} src="13/01/2026" rot={2}>carrick <B c={BLUE}>tạm quyền</B> đến hết mùa</Clip>
	</Paper>},
	{i: 10, trans: 'up', C: (t, R) => <Paper>
		<Src x={120} y={260} t={t} a={0.2} c="#666">Trận đầu tiên · Premier League</Src>
		<Club x={120} y={430} t={t} a={R(10, 0.35)} size={34} />
		<Club x={420} y={430} t={t} a={R(10, 0.45)} name="MAN CITY" c="#6CABDD" size={34} rot={2} />
		<Stat x={120} y={310} label="Man Utd – Man City" val="2–0" t={t} a={R(10, 0.4)} w={820} c={BLUE} />
		<Fig n="carrick" x={1400} y={1080} h={1700} crop={0.62} t={t} a={0.1} from="right" />
		<S x={120} y={560} t={t} a={R(11, 0.1)} size={56} c={INK} w={600}>cầu thủ <B c={BLUE}>thích ông</B></S>
		<S x={120} y={660} t={t} a={R(11, 0.5)} size={56} c={INK} w={700}>khán giả <B c={BLUE}>hát tên ông</B></S>
		<Arrow id="g1" x1={720} y1={700} x2={1130} y2={520} bend={-0.25} t={t} a={R(11, 0.6)} c={INK} />
	</Paper>},
	{i: 12, trans: 'left', C: (t, R) => <Paper>
		<Stat x={120} y={220} label="Premier League 2025/26" val="Hạng 3" t={t} a={0.3} w={760} c={INK} />
		<Stat x={120} y={380} label="Champions League" val="Trở lại" t={t} a={R(12, 0.55)} w={760} c={INK} />
		<Fig n="contract" x={1300} y={990} h={700} t={t} a={R(13, 0)} from="up" />
		<Stamp x={1180} y={560} t={t} a={R(13, 0.45)} text="2 NĂM · CHÍNH THỨC" />
		<Ground y={990} t={t} a={R(13, 0)} />
	</Paper>},
	{i: 14, trans: 'left', C: (t, R) => <Paper>
		<Circle x={1380} y={560} r={330} c={RED} t={t} a={0.1} />
		<Circle x={540} y={560} r={330} c="#9e9e9e" t={t} a={R(14, 0.62)} />
		<Ground y={1020} t={t} a={0} />
		<Fig n="carrick" x={1380} y={1020} h={920} t={t} a={0} from="right" />
		<Fig n="solskjaer" x={540} y={1020} h={920} t={t} a={R(14, 0.6)} from="left" dim={0.25} />
		<S x={720} y={120} t={t} a={0.3} size={60} align="center" w={1000}>nghe <B c={RED}>quen</B> không?</S>
		<S x={760} y={300} t={t} a={R(14, 0.25)} size={40} w={420} align="center">cựu cầu thủ thời ferguson,<br />chọn vì <B c={RED}>tình cảm</B></S>
		<Src x={430} y={1036} t={t} a={R(14, 0.65)} c={INK}>Solskjaer · 2019</Src>
		<Src x={1250} y={1036} t={t} a={R(14, 0.65)} c={INK}>Carrick · 2026</Src>
		<Arrow id="s19" x1={760} y1={600} x2={1160} y2={600} bend={-0.15} t={t} a={R(14, 0.75)} />
	</Paper>},
	{i: 15, trans: 'left', C: (t, R) => <Paper>
		<Club x={640} y={100} t={t} a={0.3} size={34} />
		<S x={120} y={90} t={t} a={0.2} size={56} c={INK} w={1000}>mùa giải <B c={RED}>2026/27</B></S>
		<Stat x={120} y={230} label="Atlético – Man Utd · phút 1" val="2–0" t={t} a={R(16, 0.1)} w={880} c={RED} />
		<Stat x={120} y={360} label="Leeds – Man Utd" val="1–1" t={t} a={R(17, 0.05)} w={880} />
		<Stat x={120} y={490} label="Como – Man Utd" val="4–1" t={t} a={R(17, 0.5)} w={880} c={RED} />
		<Stat x={120} y={620} label="Man Utd – Bournemouth" val="0–3" t={t} a={R(18, 0.1)} w={880} c={RED} />
		<Stat x={120} y={750} label="Chelsea – Man Utd" val="2–0" t={t} a={R(19, 0.05)} w={880} c={RED} />
		<Stat x={120} y={880} label="Man Utd – Aston Villa" val="4–4" t={t} a={R(19, 0.45)} w={880} />
		<Fig n="bruno" x={1450} y={1080} h={1750} crop={0.6} t={t} a={R(15, 0.2)} dim={0.2} from="right" />
		<Stamp x={900} y={950} t={t} a={R(20, 0.2)} text="0 TRẬN THẮNG PL TỪ THÁNG 8" />
	</Paper>},
	{i: 21, trans: 'left', C: (t, R) => <AbsoluteFill style={zoomInto(0, t, R(21, 0.85))}><Suspects t={t} fill={[-1, -1, -1]} chair={R(21, 0.2)} /></AbsoluteFill>},
	{i: 22, trans: 'zoom', C: (t, R) => <Paper>
		<FromCircle t={t} c={RED} x={960} y={560} r={360} />
		<Ground y={1040} t={t} a={0.3} />
		<Fig n="carrick" x={960} y={1040} h={1000} t={t} a={0.2} from="up" />
		<S x={120} y={150} t={t} a={0.4} size={40}>nghi phạm #1</S>
		<S x={120} y={200} t={t} a={0.6} size={80} w={700}><B>huấn luyện viên</B></S>
	</Paper>},
	{i: 23, trans: 'left', C: (t, R, d) => <Bg n="press" t={t} d={d} dim={0.6}>
		<Circle x={1420} y={600} r={360} c={RED} t={t} a={0.1} />
		<Fig n="bruno" x={1420} y={1080} h={1050} t={t} a={0} from="right" />
		<Src x={120} y={150} t={t} a={0.3} c="#666">Sau trận thua Como · 21/10</Src>
		<S x={120} y={200} t={t} a={0.5} size={60} c={INK} w={800}>"không dám <B c={RED}>pressing</B>"</S>
		<S x={120} y={330} t={t} a={R(24, 0.4)} size={52} c={INK} w={700}>cần <B c={RED}>dũng cảm</B> hơn</S>
		<Arrow id="b1" x1={620} y1={400} x2={1180} y2={300} bend={-0.2} t={t} a={R(24, 0.55)} c={INK} />
		<Clip x={140} y={560} t={t} a={R(25, 0.45)} src="Bruno Fernandes · TNT Sports">"đó là việc của HLV, <B c={RED}>không phải tôi</B>"</Clip>
		<Fig n="carrick" x={560} y={1080} h={1000} t={t} a={R(26, 0)} from="left" out={99} />
		<Clip x={820} y={140} w={560} t={t} a={R(26, 0.2)} src="Carrick · họp báo" rot={1.5}>"không chạy lên, không chạy về thì <B c={RED}>không thể thắng</B>"</Clip>
	</Bg>},
	{i: 27, trans: 'left', C: (t, R) => <Paper>
		<Ground y={900} t={t} a={0} />
		<Fig n="armband" x={760} y={900} h={600} t={t} a={0} from="up" />
		<S x={1250} y={300} t={t} a={0.5} size={64} w={600}>trận sau:<br /><B c={RED}>bruno ngồi ngoài</B></S>
		<Arrow id="ab" x1={1240} y1={420} x2={1000} y2={560} bend={0.25} t={t} a={0.9} />
		<Stamp x={1280} y={640} t={t} a={R(27, 0.6)} text="0–3 BOURNEMOUTH" />
	</Paper>},
	{i: 28, trans: 'left', C: (t, R) => <Paper>
		<Circle x={600} y={580} r={320} c={BLUE} t={t} a={0.1} />
		<Circle x={1340} y={580} r={320} c={RED} t={t} a={0.2} />
		<Ground y={1040} t={t} a={0} />
		<Fig n="carrick" x={600} y={1040} h={960} t={t} a={0} from="left" dim={E(t, R(29, 0.3), R(29, 0.6)) * 0.35} />
		<Fig n="bruno" x={1340} y={1040} h={980} t={t} a={0.1} from="right" />
		<S x={1100} y={90} t={t} a={R(28, 0.45)} size={44} w={760} align="left">giúp bruno thành<br /><B c={BLUE}>cầu thủ hay nhất mùa</B></S>
		<Arrow id="hn" x1={1350} y1={210} x2={1380} y2={330} bend={0.2} t={t} a={R(28, 0.6)} />
		<S x={90} y={90} t={t} a={R(29, 0.2)} size={48} w={640}>điềm tĩnh → <B c={RED}>thụ động</B>?</S>
		<Arrow id="td" x1={330} y1={170} x2={520} y2={300} bend={-0.2} t={t} a={R(29, 0.45)} c={RED} />
	</Paper>},
	{i: 30, trans: 'left', C: (t, R) => <AbsoluteFill style={zoomInto(1, t, R(30, 0.6))}><Suspects t={t + 3} fill={[0, -1, -1]} /></AbsoluteFill>},
	{i: 31, trans: 'zoom', C: (t, R) => <Paper>
		<FromCircle t={t} c={BLUE} x={1350} y={620} r={380} />
		<Fig n="martinez" x={1350} y={1080} h={1750} crop={0.6} t={t} a={0.2} from="up" />
		<S x={120} y={150} t={t} a={0.4} size={40} c="#444">nghi phạm #2</S>
		<S x={120} y={200} t={t} a={0.6} size={80} c={INK} w={700}><B>các cầu thủ</B></S>
		<Src x={120} y={420} t={t} a={R(31, 0.4)} c="#666">Lisandro Martínez · sau trận Atlético</Src>
		<Clip x={120} y={470} t={t} a={R(32, 0.1)} src="Amazon Prime · 13/10">"tôi mong đợi nhiều hơn từ <B c={RED}>giám đốc kỹ thuật</B>"</Clip>
		<Arrow id="mk" x1={760} y1={560} x2={1000} y2={460} bend={-0.2} t={t} a={R(32, 0.4)} c={INK} />
	</Paper>},
	{i: 33, trans: 'left', C: (t, R, d) => <Bg n="dressing" t={t} d={d} dim={0.5}>
		<Clip x={160} y={160} w={700} t={t} a={0.4} src="Sports Illustrated">phòng thay đồ <B c={RED}>"mất kiểm soát"</B>, đầy cầu thủ <B>"nói quá nhiều"</B></Clip>
		<S x={1150} y={140} t={t} a={R(34, 0.1)} size={52} c={INK} w={700}>không phải <B c={RED}>lần đầu</B></S>
		{['Mourinho', 'Solskjaer', 'Ten Hag'].map((n, k) => <React.Fragment key={n}>
			<Fig n="chair" x={1150 + k * 260} y={900} h={320} t={t} a={R(34, 0.2) + k * 0.2} from="up" ghost={false} dim={0.3} />
			<div style={{position: 'absolute', left: 1150 + k * 260 - 120, top: 920, width: 240, textAlign: 'center', fontFamily: MONO, fontSize: 22, color: '#888', letterSpacing: 2, opacity: E(t, R(34, 0.3) + k * 0.2, R(34, 0.4) + k * 0.2)}}>{n.toUpperCase()}</div>
		</React.Fragment>)}
	</Bg>},
	{i: 35, trans: 'left', C: (t, R) => <Paper>
		<Circle x={1350} y={560} r={330} c={BLUE} t={t} a={0.1} />
		<Ground y={1030} t={t} a={0} />
		<Fig n="carrick" x={1350} y={1030} h={960} t={t} a={0} from="right" />
		<Src x={140} y={360} t={t} a={0.3} c="#666">Carrick · 23/10</Src>
		<S x={140} y={400} t={t} a={0.5} size={72} w={900}>"<B>không hề</B> chia rẽ."</S>
	</Paper>},
	{i: 36, trans: 'left', C: (t, R) => <AbsoluteFill style={zoomInto(2, t, R(36, 0.7))}><Suspects t={t + 3} fill={[0, 0, -1]} /></AbsoluteFill>},
	{i: 37, trans: 'zoom', C: (t, R, d) => <Bg n="boardroom" t={t} d={d} dim={0.55}>
		<FromCircle t={t} c={RED} x={1450} y={620} r={360} />
		<Fig n="wilcox" x={1450} y={1080} h={1000} t={t} a={0.2} from="up" />
		<S x={120} y={110} t={t} a={0.4} size={40} c="#444">nghi phạm #3</S>
		<S x={120} y={160} t={t} a={0.6} size={80} c={INK} w={700}><B>ban lãnh đạo</B></S>
		{['Elliot Anderson', 'Sandro Tonali', 'Mateus Fernandes'].map((n, k) => <div key={n} style={{position: 'absolute', left: 140, top: 380 + k * 100, fontFamily: SERIF, fontSize: 48, color: INK, opacity: E(t, R(37, 0.35) + k * 0.25, R(37, 0.45) + k * 0.25) * (1 - E(t, R(38, 0), R(38, 0.05)))}}>{n}<div style={{position: 'absolute', left: -10, top: 30, height: 6, background: RED, width: `${E(t, R(37, 0.55) + k * 0.25, R(37, 0.65) + k * 0.25) * 110}%`}} /></div>)}
		<Fig n="money" x={520} y={1040} h={560} t={t} a={R(38, 0)} from="up" />
		<div style={{position: 'absolute', left: 690, top: 760, transform: 'rotate(-12deg)', fontFamily: MONO, fontWeight: 700, fontSize: 44, color: INK, opacity: E(t, R(38, 0.5), R(38, 0.6)), zIndex: 5}}>£150m</div>
		<S x={140} y={360} t={t} a={R(38, 0.2)} size={42} c={INK} w={800}>Baleba · Tielemans · Andrey Santos</S>
	</Bg>},
	{i: 39, trans: 'left', C: (t, R) => <Paper>
		<S x={120} y={120} t={t} a={0.2} size={60} c={INK} w={700}>cả ba đều là<br /><B c="#B8860B">tiền vệ</B></S>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<rect x={980} y={120} width={820} height={860} fill="none" stroke="#999" strokeWidth={3} />
			<line x1={980} y1={550} x2={1800} y2={550} stroke="#999" strokeWidth={3} />
			<circle cx={1390} cy={550} r={90} fill="none" stroke="#999" strokeWidth={3} />
			{[[1390, 920, 'GK'], [1150, 780, 'LB'], [1310, 800, 'CB'], [1470, 800, 'CB'], [1630, 780, 'RB'], [1240, 600, 'CM'], [1390, 560, 'CM'], [1540, 600, 'CM'], [1150, 340, 'LW'], [1390, 270, 'ST'], [1630, 340, 'RW']].map(([x, y, p], k) => {const empty = p === 'LB' || p === 'ST'; const blink = empty ? 0.4 + 0.6 * Math.abs(Math.sin(t * 4)) : 1; return <g key={k} opacity={E(t, 0.3 + k * 0.05, 0.5 + k * 0.05)}><circle cx={x as number} cy={y as number} r={34} fill={empty ? 'none' : p === 'CM' ? '#ffd54f' : '#888'} stroke={empty ? RED : 'none'} strokeWidth={5} strokeDasharray={empty ? '8 8' : undefined} opacity={empty ? blink * E(t, R(39, 0.4), R(39, 0.5)) + (1 - E(t, R(39, 0.4), R(39, 0.5))) : 1} /><text x={x as number} y={(y as number) + 70} textAnchor="middle" fill={empty ? RED : '#aaa'} fontFamily={MONO} fontSize={22}>{p}</text></g>;})}
		</svg>
		<S x={120} y={420} t={t} a={R(39, 0.45)} size={44} c="#444" w={760}>ở madrid: không <B c={RED}>hậu vệ trái</B>,<br />không <B c={RED}>tiền đạo</B> đúng nghĩa</S>
	</Paper>},
	{i: 40, trans: 'left', C: (t, R) => <Paper>
		<Circle x={560} y={580} r={320} c={BLUE} t={t} a={0.1} />
		<Circle x={1360} y={580} r={320} c={RED} t={t} a={R(40, 0.5)} />
		<Ground y={1040} t={t} a={0} />
		<Fig n="carrick" x={560} y={1040} h={960} t={t} a={0} from="left" />
		<Fig n="wilcox" x={1360} y={1040} h={960} t={t} a={R(40, 0.48)} from="right" />
		<Src x={820} y={120} t={t} a={0.2} c="#666">Roundtable · 14/10</Src>
		<S x={820} y={160} t={t} a={0.4} size={44} w={500}>cầu thủ <B c={BLUE}>ủng hộ</B></S>
		<Arrow id="u1" x1={830} y1={240} x2={720} y2={320} bend={0.2} t={t} a={0.7} c={BLUE} />
		<S x={820} y={380} t={t} a={R(40, 0.55)} size={44} w={600}>cấp trên: ông đã<br /><B c={RED}>mất phòng thay đồ</B></S>
		<Arrow id="u2" x1={1100} y1={500} x2={760} y2={560} bend={-0.25} t={t} a={R(40, 0.7)} c={RED} />
	</Paper>},
	{i: 41, trans: 'left', C: (t, R) => <Paper>
		<Circle x={1400} y={600} r={360} c={RED} t={t} a={0.1} />
		<Fig n="ratcliffe" x={1400} y={1080} h={1050} t={t} a={0} from="right" />
		<S x={120} y={150} t={t} a={0.3} size={52} c={INK} w={800}>những người chủ</S>
		<Club x={520} y={160} t={t} a={0.5} size={32} />
		<S x={120} y={230} t={t} a={0.6} size={44} c="#444" w={800}>gia đình <B>glazer</B> · <B>jim ratcliffe</B></S>
		<Src x={120} y={340} t={t} a={R(41, 0.35)} c="#666">cắt giảm chi phí · tăng giá vé</Src>
		<Stat x={120} y={520} label="Nợ của câu lạc bộ" val="> £1,1 tỷ" t={t} a={R(41, 0.7)} w={820} c={RED} />
	</Paper>},
	{i: 42, trans: 'up', C: (t, R) => <Paper>
		<Circle x={1380} y={580} r={330} c={RED} t={t} a={0.1} />
		<Ground y={1040} t={t} a={0} />
		<Fig n="neville" x={1380} y={1040} h={980} t={t} a={0} from="right" />
		<Src x={140} y={330} t={t} a={0.3} c="#666">Gary Neville · Sky Sports</Src>
		<S x={140} y={370} t={t} a={0.5} size={66} w={860}>"không thể lại <B c={RED}>chỉ</B> là lỗi của huấn luyện viên"</S>
	</Paper>},
	{i: 43, trans: 'left', C: (t, R) => <Paper>
		<S x={960} y={150} t={t} a={0.2} size={60} c={INK} align="center" w={1600}><B c={RED}>7</B> huấn luyện viên · <B c={RED}>13</B> năm</S>
		<ChairRow t={t} a={0.1} drops={[1.0, 1.25, 1.5, 1.75, 2.0, 2.25, undefined]} dark />
		<S x={960} y={950} t={t} a={R(43, 0.6)} size={44} c="#444" align="center" w={1600}>kịch bản <B>chưa bao giờ</B> thay đổi</S>
	</Paper>},
	{i: 44, trans: 'left', C: (t, R) => <Paper>
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 60%, rgba(255,230,180,${0.35 * E(t, R(45, 0), R(45, 0.4))}), transparent 45%)`}} />
		<Ground y={1000} t={t} a={0} />
		<Fig n="chair" x={960} y={1000} h={760} t={t} a={0} from="up" shake={E(t, R(44, 0.5), R(44, 0.6)) * (1 - E(t, R(45, 0), R(45, 0.1))) * 1.2} />
		<S x={100} y={200} t={t} a={0.3} size={52} w={560}>sa thải HLV là<br /><B c={RED}>cách dễ nhất</B></S>
		<S x={1300} y={420} t={t} a={R(45, 0.1)} size={56} w={560}>người <B c={RED}>thứ tám</B><br />sẽ ngồi đúng chỗ đó</S>
		<Arrow id="t8" x1={1290} y1={520} x2={1140} y2={600} bend={0.25} t={t} a={R(45, 0.4)} />
	</Paper>},
	{i: 46, trans: 'left', C: (t, R) => <Suspects t={t + 3} fill={[-9, -9, -9].map(() => -99) as number[]} chair={3.6} ask={5.0} />},
];
// final suspects show faces: replace fill with figures (use 0 = start time already passed)
SHOTS[SHOTS.length - 1].C = (t) => <Suspects t={t + 3} fill={[0, 0, 0]} chair={3.4} ask={4.6} />;

const Trans: React.FC<{kind: Shot['trans']; u: number; isIn: boolean; children: React.ReactNode}> = ({kind, u, isIn, children}) => {
	let tr = '';
	if (kind === 'left') tr = isIn ? `translateX(${(1 - u) * W}px)` : `translateX(${-u * W}px)`;
	if (kind === 'up') tr = isIn ? `translateY(${(1 - u) * H}px)` : `translateY(${-u * H}px)`;
	const blur = (kind === 'left' || kind === 'up') ? Math.sin(u * Math.PI) * 10 : 0;
	return <AbsoluteFill style={{transform: tr, filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>;
};

export const MULVideo: React.FC = () => {
	const f = useCurrentFrame(), t = f / 30;
	const TD = 0.45;
	const starts = SHOTS.map((s) => (s.i === 0 ? 0 : T[s.i][0] - 0.12));
	let k = 0; while (k < SHOTS.length - 1 && t >= starts[k + 1]) k++;
	const cur = SHOTS[k], nxt = SHOTS[k + 1];
	const a0 = starts[k], a1 = nxt ? starts[k + 1] : MUL_DUR - 3;
	const inTrans = nxt && (nxt.trans === 'left' || nxt.trans === 'up') && t > a1 - TD;
	const u = inTrans ? E(t, a1 - TD, a1, Easing.inOut(Easing.cubic)) : 0;
	const mk = (sh: Shot, s0: number, s1: number) => sh.C(t - s0, (i, fr = 0) => r(i, fr) - s0, s1 - s0);
	const s2 = nxt && k + 2 < SHOTS.length ? starts[k + 2] : MUL_DUR;
	return <AbsoluteFill style={{background: '#000'}}>
		<svg width={0} height={0} style={{position: 'absolute'}}><defs><filter id="rough"><feTurbulence baseFrequency="0.03" numOctaves="2" seed="4" /><feDisplacementMap in="SourceGraphic" scale="10" /></filter></defs></svg>
		<AbsoluteFill style={{transform: `translate(${Math.sin(t * 1.2) * 4}px,${Math.cos(t * 0.9) * 4}px) scale(${1.012 + 0.01 * ((t - a0) / Math.max(1, a1 - a0))})`}}>
			<Trans kind={nxt?.trans ?? 'cut'} u={u} isIn={false}>{mk(cur, a0, a1)}</Trans>
			{inTrans && nxt && <Trans kind={nxt.trans} u={u} isIn>{mk(nxt, a1, s2)}</Trans>}
		</AbsoluteFill>
		<Img src={staticFile('mu/logo.png')} style={{position: 'absolute', right: 36, top: 30, width: 92, height: 92, borderRadius: '50%', opacity: 0.92 * (1 - E(t, MUL_DUR - 3.2, MUL_DUR - 2.9)), filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.35))'}} />
		<AbsoluteFill style={{opacity: E(t, MUL_DUR - 3.2, MUL_DUR - 2.8)}}><Paper>
			<Img src={staticFile('mu/logo.png')} style={{position: 'absolute', left: 960 - 230, top: 540 - 270, width: 460, height: 460, borderRadius: '50%', transform: `scale(${lerp(0.6, 1, E(t, MUL_DUR - 3.0, MUL_DUR - 2.3, Easing.out(Easing.back(1.6))))}) rotate(${lerp(-8, 0, E(t, MUL_DUR - 3.0, MUL_DUR - 2.3))}deg)`, filter: 'drop-shadow(10px 14px 0 rgba(0,0,0,.25))'}} />
			<div style={{position: 'absolute', top: 760, width: 1920, textAlign: 'center', fontFamily: SERIF, fontSize: 44, color: INK, opacity: E(t, MUL_DUR - 2.2, MUL_DUR - 1.8)}}>đăng ký để không bỏ lỡ <b style={{fontStyle: 'italic', color: RED}}>bên kia bảng tỷ số</b></div>
		</Paper></AbsoluteFill>
		<div style={{position: 'absolute', right: 40, bottom: 30, fontFamily: MONO, fontSize: 16, color: '#888', mixBlendMode: 'difference', opacity: E(t, MUL_DUR - 9, MUL_DUR - 8.5) * (1 - E(t, MUL_DUR - 3.2, MUL_DUR - 3))}}>hình minh hoạ · nguồn: Malay Mail/AFP, Al Jazeera, SI, NBC, Football365, Roundtable, Sky Sports</div>
		<AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'multiply'}}><Img src={staticFile(`tex/noise${Math.floor(f / 3) % 4}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
		<AbsoluteFill style={{background: '#000', opacity: E(t, MUL_DUR - 0.6, MUL_DUR - 0.05)}} />
		<Audio src={staticFile('mu/mixL.wav')} />
	</AbsoluteFill>;
};
