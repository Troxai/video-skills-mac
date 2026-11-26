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

// Tactical module demo: "Vì sao Man United không pressing được trước Como?"
const SPD = 1.15;
const T0 = [[0, 4.25], [4.65, 6.36], [6.76, 12.88], [13.28, 14.8], [15.2, 18.43], [18.83, 21.41], [21.81, 25.89], [26.29, 31.38], [31.78, 35.62]];
const T = T0.map(([a, b]) => [a / SPD, b / SPD]);
export const MUT_DUR = Math.round(35.62 / SPD + 2.5);
const r = (i: number, f = 0) => T[i][0] + (T[i][1] - T[i][0]) * f;

const SERIF = 'Playfair Display', MONO = 'JetBrains Mono';
const INK = '#141414', RED = '#C62828', BLUE = '#1E4FA8', GREEN = '#2E7D32';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const E = (t: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(t, [a, b], [0, 1], {...cl, easing: e});
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const st = (t: number) => Math.floor(t * 12) / 12;
const pop = (t: number, a: number) => E(st(t), a, a + 0.3, Easing.out(Easing.back(2.2)));

// pitch geometry (metres -> px)
const S = 15, PW = 105 * S, PH = 68 * S;
const P = (x: number, y: number) => [x * S, y * S];
const TILT = 34;

// players: [x,y] metres. Como attacks →, United attacks ←
const COMO: Record<string, [number, number]> = {GK: [5, 34], RAMON: [15, 24], CB2: [15, 44], LB: [28, 8], RB: [28, 60], P1: [27, 30], P2: [33, 42], LW: [45, 9], RW: [45, 59], PAZ: [42, 30], ST: [58, 36]};
const MU: Record<string, [number, number]> = {GK: [100, 34], LB: [80, 58], MAGUIRE: [80, 27], CB2: [80, 41], RB: [80, 10], CUNHA: [66, 28], DM2: [66, 41], LW: [52, 56], BRUNO: [50, 34], RW: [52, 12], ST: [40, 36]};

const Paper: React.FC<{children?: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: '#e9e9e7'}}>
	<Img src={staticFile('mz/paper.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, mixBlendMode: 'multiply'}} />{children}</AbsoluteFill>;
const B: React.FC<{children: React.ReactNode; c?: string}> = ({children, c}) => <b style={{fontWeight: 700, fontStyle: 'italic', color: c}}>{children}</b>;
const Txt: React.FC<{x: number; y: number; t: number; a: number; size?: number; w?: number; out?: number; children: React.ReactNode; align?: 'left' | 'right'}> = ({x, y, t, a, size = 56, w = 700, out = 1e9, children, align = 'left'}) => {
	const u = E(t, a, a + 0.45), o = 1 - E(t, out, out + 0.3);
	return <div style={{position: 'absolute', left: align === 'left' ? x : x - w, top: y, width: w, textAlign: align, fontFamily: SERIF, fontSize: size, color: INK, lineHeight: 1.2, opacity: u * o, transform: `translateY(${(1 - u) * 16}px)`, zIndex: 10}}>{children}</div>;
};
const Club: React.FC<{x: number; y: number; t: number; a: number; name: string; c: string; rot?: number; out?: number}> = ({x, y, t, a, name, c, rot = -3, out = 1e9}) => {
	const u = pop(t, a), o = 1 - E(t, out, out + 0.25);
	return <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) scale(${u})`, transformOrigin: '0 50%', opacity: Math.min(1, u) * o, zIndex: 10, background: c, padding: '9px 20px', boxShadow: '7px 9px 0 rgba(0,0,0,.28)', overflow: 'hidden'}}>
		<div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,0,0,.28) 1.2px, transparent 1.5px)', backgroundSize: '6px 6px'}} />
		<span style={{position: 'relative', fontFamily: MONO, fontWeight: 700, fontSize: 32, letterSpacing: 6, color: '#f5f1e8'}}>{name}</span>
	</div>;
};
const Stamp: React.FC<{x: number; y: number; t: number; a: number; text: string; out?: number}> = ({x, y, t, a, text, out = 1e9}) => {const u = E(st(t), a, a + 0.25, Easing.out(Easing.back(2.5))); return <div style={{position: 'absolute', left: x, top: y, transform: `rotate(-8deg) scale(${lerp(1.6, 1, u)})`, opacity: u * (1 - E(t, out, out + 0.3)), border: `6px solid ${RED}`, color: RED, fontFamily: MONO, fontWeight: 700, fontSize: 38, padding: '6px 18px', letterSpacing: 3, zIndex: 11, background: 'rgba(233,233,231,.7)'}}>{text}</div>;};
const Stat: React.FC<{x: number; y: number; label: string; val: string; t: number; a: number; c?: string}> = ({x, y, label, val, t, a, c = INK}) => {
	const u = E(t, a, a + 0.4);
	return <div style={{position: 'absolute', left: x, top: y, width: 620, opacity: u, transform: `translateX(${(1 - u) * -30}px)`, zIndex: 10}}>
		<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: MONO, color: c}}><span style={{fontSize: 26, letterSpacing: 4, textTransform: 'uppercase'}}>{label}</span><span style={{fontSize: 62, fontWeight: 700}}>{val}</span></div>
		<div style={{height: 3, background: GREEN, width: `${E(t, a + 0.2, a + 0.8) * 100}%`, marginTop: 8}} />
	</div>;
};

// ----- pitch layers (inside tilted plane) -----
const PitchLines: React.FC = () => <svg width={PW} height={PH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
	<g stroke={INK} strokeWidth={4} fill="none" opacity={0.75}>
		<rect x={0} y={0} width={PW} height={PH} />
		<line x1={PW / 2} y1={0} x2={PW / 2} y2={PH} />
		<circle cx={PW / 2} cy={PH / 2} r={9.15 * S} />
		<rect x={0} y={(34 - 20.16) * S} width={16.5 * S} height={40.32 * S} />
		<rect x={PW - 16.5 * S} y={(34 - 20.16) * S} width={16.5 * S} height={40.32 * S} />
		<rect x={0} y={(34 - 9.16) * S} width={5.5 * S} height={18.32 * S} />
		<rect x={PW - 5.5 * S} y={(34 - 9.16) * S} width={5.5 * S} height={18.32 * S} />
		<rect x={-2 * S} y={(34 - 3.66) * S} width={2 * S} height={7.32 * S} strokeWidth={5} />
		<rect x={PW} y={(34 - 3.66) * S} width={2 * S} height={7.32 * S} strokeWidth={5} />
	</g>
	<circle cx={PW / 2} cy={PH / 2} r={6} fill={INK} />
</svg>;

const Dot: React.FC<{x: number; y: number; c: string; t: number; a: number; dim?: number; label?: string; ring?: boolean}> = ({x, y, c, t, a, dim = 0, label, ring}) => {
	const u = pop(t, a); const [px, py] = P(x, y);
	return <div style={{position: 'absolute', left: px - 22, top: py - 22, width: 44, height: 44, transform: `scale(${u})`, opacity: 1 - dim * 0.7}}>
		<div style={{width: 44, height: 44, borderRadius: '50%', background: c, border: '4px solid #f5f1e8', boxShadow: '4px 6px 0 rgba(0,0,0,.25)'}} />
		{ring && <div style={{position: 'absolute', left: -14, top: -14, width: 72, height: 72, borderRadius: '50%', border: `4px dashed ${c}`}} />}
		{label && <div style={{position: 'absolute', left: 52, top: 6, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: c, whiteSpace: 'nowrap'}}>{label}</div>}
	</div>;
};
// line between two pitch points (solid pass / dotted run / thin lane)
const Line: React.FC<{a: [number, number]; b: [number, number]; t: number; at: number; dur?: number; kind: 'pass' | 'run' | 'lane'; c?: string; out?: number; id: string; bend?: number}> = ({a, b, t, at, dur = 0.5, kind, c = INK, out = 1e9, id, bend = 0}) => {
	const [x1, y1] = P(...a), [x2, y2] = P(...b);
	const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
	const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
	const u = E(t, at, at + dur, Easing.inOut(Easing.cubic)), o = 1 - E(t, out, out + 0.3);
	const ang = Math.atan2(y2 - my, x2 - mx) * 180 / Math.PI;
	const sw = kind === 'lane' ? 3 : 6;
	return <svg width={PW} height={PH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: o * (kind === 'lane' ? 0.55 + 0.35 * Math.sin(t * 5) : 1)}}>
		<defs><mask id={`k${id}`}><path d={d} stroke="#fff" strokeWidth={16} fill="none" pathLength={1} strokeDasharray={`${u} 1`} /></mask></defs>
		<path d={d} stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeDasharray={kind === 'run' ? '2 12' : kind === 'lane' ? '14 10' : undefined} mask={`url(#k${id})`} />
		{kind !== 'lane' && u > 0.96 && <path d="M -18 -11 L 0 0 L -18 11" transform={`translate(${x2} ${y2}) rotate(${ang})`} stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" />}
	</svg>;
};
// billboard cutout standing on pitch
const Stand: React.FC<{n: string; w0: number; h0: number; x: number; y: number; h: number; t: number; a: number; out?: number; dim?: number}> = ({n, w0, h0, x, y, h, t, a, out = 1e9, dim = 0}) => {
	const [px, py] = P(x, y); const w = (w0 / h0) * h;
	const u = E(t, a, a + 0.4, Easing.out(Easing.back(1.6))), o = 1 - E(t, out, out + 0.3);
	return <div style={{position: 'absolute', left: px - w / 2, top: py - h, width: w, height: h, transformOrigin: '50% 100%', transform: `rotateX(${-TILT}deg) scale(${u})`, opacity: o}}>
		<Img src={staticFile(`mu/${n}.png`)} style={{position: 'absolute', left: -h * 0.019, top: 0, width: w, height: h, filter: 'grayscale(1) brightness(.3)', opacity: 0.35}} />
		<Img src={staticFile(`mu/${n}.png`)} style={{position: 'absolute', left: 0, top: 0, width: w, height: h, filter: dim ? `grayscale(${dim}) brightness(${1 - dim * 0.4})` : undefined}} />
	</div>;
};

const at = (p: [number, number], q: [number, number], u: number): [number, number] => [lerp(p[0], q[0], u), lerp(p[1], q[1], u)];

export const MUTVideo: React.FC = () => {
	const f = useCurrentFrame(), t = f / 30;
	// camera keyframes [t, cx(m), cy(m), scale]
	const K: [number, number, number, number][] = [[0, 52, 34, 0.82], [r(1, 0.6), 52, 34, 0.85], [r(2, 0.2), 30, 34, 1.35], [r(3, 0.6), 28, 27, 1.3], [r(4, 1), 30, 27, 1.35], [r(5, 0.6), 46, 32, 1.2], [r(6, 0.2), 76, 32, 1.45], [r(6, 1), 80, 32, 1.5], [r(7, 0.15), 52, 34, 0.78], [MUT_DUR, 52, 34, 0.78]];
	let k = 0; while (k < K.length - 2 && t > K[k + 1][0]) k++;
	const u = Easing.inOut(Easing.cubic)(interpolate(t, [K[k][0], K[k + 1][0]], [0, 1], cl));
	const cx = lerp(K[k][1], K[k + 1][1], u), cy = lerp(K[k][2], K[k + 1][2], u), cs = Math.exp(lerp(Math.log(K[k][3]), Math.log(K[k + 1][3]), u));

	// movements
	const drop = E(t, r(2, 0.15), r(2, 0.45), Easing.inOut(Easing.cubic));
	const como = {...COMO};
	como.P1 = at(COMO.P1, [19, 34], drop); como.RAMON = at(COMO.RAMON, [13, 20], drop); como.CB2 = at(COMO.CB2, [13, 48], drop);
	const lbUp = E(t, r(2, 0.5), r(2, 0.75)); como.LB = at(COMO.LB, [38, 6], lbUp);
	const brunoRun = E(t, r(3, 0), r(3, 0.9), Easing.inOut(Easing.cubic));
	const mu = {...MU}; mu.BRUNO = at(MU.BRUNO, [18, 22], brunoRun);
	const pazRun = E(t, r(6, 0.1), r(6, 0.6), Easing.inOut(Easing.quad));
	como.PAZ = r(6, 0.1) < t ? at([42, 30], [88, 31], pazRun) : COMO.PAZ;
	// ball
	const p1 = E(t, r(5, 0.05), r(5, 0.3)), p2 = E(t, r(5, 0.35), r(5, 0.6));
	let ball: [number, number] = [como.RAMON[0] + 1.5, como.RAMON[1] + 1];
	if (t > r(5, 0.05)) ball = at(ball, [como.P1[0] + 1.2, como.P1[1]], p1);
	if (t > r(5, 0.35)) ball = at([como.P1[0] + 1.2, como.P1[1]], [43.5, 30], p2);
	if (t > r(6, 0.1)) ball = [como.PAZ[0] + 1.3, como.PAZ[1] + 0.5];
	const shot = E(t, r(6, 0.62), r(6, 0.75), Easing.in(Easing.quad));
	if (t > r(6, 0.62)) ball = at([89.3, 31.5], [105, 32.5], shot);
	const dimMU = E(t, r(4, 0), r(4, 0.2)) * (1 - E(t, r(5, 0.8), r(5, 1)));
	const pitchDim = E(t, r(7, 0.1), r(7, 0.4)) * 0.6 + E(t, r(8, 0), r(8, 0.3)) * 0.35;

	const plane = <div style={{position: 'absolute', left: 0, top: 0, width: PW, height: PH, transformStyle: 'preserve-3d', transform: `rotateX(${TILT}deg)`, transformOrigin: '50% 50%'}}>
		<PitchLines />
		{/* lanes from ball holder */}
		<Line id="l1" a={como.RAMON} b={como.P1} t={t} at={r(2, 0.5)} kind="lane" c={BLUE} out={r(5, 0.05)} />
		<Line id="l2" a={como.RAMON} b={como.LB} t={t} at={r(2, 0.6)} kind="lane" c={BLUE} out={r(5, 0.05)} />
		<Line id="l3" a={como.RAMON} b={COMO.GK} t={t} at={r(2, 0.7)} kind="lane" c={BLUE} out={r(5, 0.05)} />
		<Line id="r1" a={COMO.P1} b={[19, 34]} t={t} at={r(2, 0.1)} kind="run" c={BLUE} out={r(3, 0)} />
		<Line id="r2" a={COMO.LB} b={[38, 6]} t={t} at={r(2, 0.45)} kind="run" c={BLUE} out={r(3, 0)} />
		<Line id="rb" a={MU.BRUNO} b={[19, 23]} t={t} at={r(3, 0)} dur={0.7} kind="run" c={RED} out={r(5, 0.9)} bend={0.1} />
		{/* empty zone behind Bruno */}
		{(() => {const [zx, zy] = P(31, 30); const zu = E(t, r(4, 0.1), r(4, 0.4)) * (1 - E(t, r(5, 0.9), r(5, 1))); return <div style={{position: 'absolute', left: zx - 13 * S, top: zy - 13 * S, width: 26 * S, height: 26 * S, borderRadius: '50%', border: `5px dashed ${RED}`, background: 'rgba(198,40,40,.08)', transform: `scale(${zu})`, opacity: zu}} />;})()}
		<Line id="pa" a={[como.RAMON[0] + 1.5, como.RAMON[1] + 1]} b={[20, 34]} t={t} at={r(5, 0.05)} dur={0.3} kind="pass" c={BLUE} out={r(6, 0.2)} />
		<Line id="pb" a={[20, 34]} b={[42, 30]} t={t} at={r(5, 0.35)} dur={0.3} kind="pass" c={BLUE} out={r(6, 0.2)} />
		<Line id="pz" a={[42, 30]} b={[88, 31]} t={t} at={r(6, 0.1)} dur={0.9} kind="run" c={BLUE} out={r(7, 0.1)} bend={-0.05} />
		<Line id="sh" a={[89, 31]} b={[105, 32.5]} t={t} at={r(6, 0.62)} dur={0.15} kind="pass" c={RED} out={r(7, 0.1)} />
		{/* gap between Cunha & Maguire */}
		{(() => {const [gx, gy] = P(73, 28); const gu = E(t, r(6, 0.05), r(6, 0.25)) * (1 - E(t, r(7, 0.05), r(7, 0.2))); return <svg width={PW} height={PH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: gu}}><line x1={P(...MU.CUNHA)[0]} y1={P(...MU.CUNHA)[1]} x2={P(...MU.MAGUIRE)[0]} y2={P(...MU.MAGUIRE)[1]} stroke={RED} strokeWidth={5} strokeDasharray="10 10" /><text x={gx} y={gy - 30} fill={RED} fontFamily={MONO} fontSize={28} fontWeight={700} textAnchor="middle">KHOẢNG TRỐNG</text></svg>;})()}
		{/* dots */}
		{Object.entries(como).map(([n, p], i) => <Dot key={'c' + n} x={p[0]} y={p[1]} c={BLUE} t={t} a={r(1, 0) + i * 0.04} label={n === 'RAMON' && t < r(6, 0) ? 'RAMÓN' : n === 'PAZ' && t > r(5, 0.3) ? 'PAZ' : undefined} ring={n === 'RAMON' && t > r(2, 0.5) && t < r(5, 0.1)} />)}
		{Object.entries(mu).map(([n, p], i) => <Dot key={'m' + n} x={p[0]} y={p[1]} c={RED} t={t} a={r(1, 0.3) + i * 0.04} dim={n === 'BRUNO' ? 0 : dimMU} label={n === 'CUNHA' && t > r(6, 0) ? 'CUNHA' : n === 'MAGUIRE' && t > r(6, 0) ? 'MAGUIRE' : undefined} />)}
		{/* ball */}
		{t > r(1, 0.5) && (() => {const [bx, by] = P(...ball); return <div style={{position: 'absolute', left: bx - 12, top: by - 12, width: 24, height: 24, borderRadius: '50%', background: '#fff', border: `4px solid ${INK}`}} />;})()}
		{/* Bruno cutout standing on pitch */}
		<Stand n="bruno" w0={1010} h0={2461} x={mu.BRUNO[0]} y={mu.BRUNO[1]} h={430} t={t} a={r(3, 0.75)} out={r(6, 0)} dim={E(t, r(5, 0.4), r(5, 0.7)) * 0.6} />
	</div>;

	const goalFlash = 1 - E(t, r(6, 0.75), r(6, 0.95));
	return <AbsoluteFill style={{background: '#000'}}>
		<Paper>
			<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, perspective: 2200, perspectiveOrigin: '50% 30%'}}>
				<div style={{position: 'absolute', left: 960 - cx * S * cs, top: 600 - cy * S * cs, width: PW, height: PH, transformOrigin: '0 0', transform: `scale(${cs})`, transformStyle: 'preserve-3d'}}>{plane}</div>
			</div>
			<AbsoluteFill style={{background: `rgba(233,233,231,${pitchDim * 0.7})`}} />
			{/* overlays */}
			<Txt x={90} y={80} t={t} a={0.2} size={60} out={r(1, 0.5)}>một kèm một,<br />hay <B c={RED}>không pressing</B>?</Txt>
			<Club x={90} y={270} t={t} a={0.8} name="COMO" c={BLUE} out={r(1, 0.5)} />
			<Club x={300} y={270} t={t} a={1.0} name="MAN UTD" c={RED} rot={2} out={r(1, 0.5)} />
			<div style={{position: 'absolute', left: 90, top: 90, fontFamily: MONO, fontSize: 30, letterSpacing: 4, color: BLUE, opacity: E(t, r(1, 0.2), r(1, 0.5)) * (1 - E(t, r(2, 0.1), r(2, 0.3)))}}>COMO · 4-2-3-1</div>
			<div style={{position: 'absolute', right: 160, top: 90, fontFamily: MONO, fontSize: 30, letterSpacing: 4, color: RED, opacity: E(t, r(1, 0.4), r(1, 0.7)) * (1 - E(t, r(2, 0.1), r(2, 0.3)))}}>MAN UTD · 4-2-3-1</div>
			<Txt x={90} y={80} t={t} a={r(2, 0.3)} size={48} w={760} out={r(3, 0)}>tiền vệ trụ <B c={BLUE}>lùi xuống</B>,<br />luôn có <B c={BLUE}>nhiều lựa chọn</B></Txt>
			<Txt x={1800} y={170} align="right" t={t} a={r(3, 0.5)} size={52} w={700} out={r(4, 0)}>bruno <B c={RED}>lao lên</B> một mình</Txt>
			<Txt x={1800} y={170} align="right" t={t} a={r(4, 0.25)} size={52} w={760} out={r(5, 0)}>phía sau: <B c={RED}>không ai đi theo</B></Txt>
			<Stamp x={1250} y={120} t={t} a={r(5, 0.55)} text="1 ĐƯỜNG CHUYỀN" out={r(6, 0.2)} />
			<Stamp x={1300} y={140} t={t} a={r(6, 0.75)} text="1–0 · PHÚT 2" out={r(7, 0.1)} />
			<AbsoluteFill style={{background: '#fff', opacity: t > r(6, 0.74) ? 0.5 * goalFlash : 0}} />
			<div style={{position: 'absolute', left: 90, top: 140, opacity: E(t, r(7, 0.1), r(7, 0.3)) * (1 - E(t, r(8, 0), r(8, 0.15)))}}>
				<div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: '#666', marginBottom: 30}}>HIỆP 1 · NGUỒN: SQUAWKA</div>
			</div>
			<div style={{opacity: 1 - E(t, r(8, 0), r(8, 0.15))}}>
				<Stat x={90} y={200} label="Kiểm soát bóng Como" val="64%" t={t} a={r(7, 0.2)} c={BLUE} />
				<Stat x={90} y={340} label="Cú sút Man Utd" val="3" t={t} a={r(7, 0.5)} c={RED} />
				<Stat x={90} y={480} label="xG Man Utd" val="0.10" t={t} a={r(7, 0.75)} c={RED} />
			</div>
			{/* final: Bruno alone */}
			<div style={{opacity: E(t, r(8, 0), r(8, 0.15))}}>
				<AbsoluteFill style={{background: 'rgba(233,233,231,.82)'}} />
				<div style={{position: 'absolute', left: 1180, top: 120, width: 640, height: 640, borderRadius: '50%', background: RED, filter: 'url(#rough)', transform: `scale(${pop(t, r(8, 0.05))})`}} />
				<Img src={staticFile('mu/bruno.png')} style={{position: 'absolute', left: 1500 - (1010 / 2461) * 1650 / 2, top: 1080 - 1650 * 0.62, width: (1010 / 2461) * 1650, height: 1650, opacity: E(t, r(8, 0.05), r(8, 0.2)), transform: `translateY(${(1 - E(t, r(8, 0.05), r(8, 0.3))) * 80}px)`}} />
				<Txt x={110} y={330} t={t} a={r(8, 0.1)} size={70} w={900}>pressing không phải<br />việc của <B c={RED}>một người</B></Txt>
				<Txt x={110} y={560} t={t} a={r(8, 0.55)} size={48} w={900}>một người chạy, cả đội <B c={RED}>bị xuyên thủng</B></Txt>
			</div>
		</Paper>
		<svg width={0} height={0} style={{position: 'absolute'}}><defs><filter id="rough"><feTurbulence baseFrequency="0.03" numOctaves="2" seed="4" /><feDisplacementMap in="SourceGraphic" scale="10" /></filter></defs></svg>
		<Img src={staticFile('mu/logo.png')} style={{position: 'absolute', right: 36, top: 30, width: 92, height: 92, borderRadius: '50%', opacity: 0.92}} />
		<AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'multiply'}}><Img src={staticFile(`tex/noise${Math.floor(f / 3) % 4}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
		<AbsoluteFill style={{background: '#000', opacity: E(t, MUT_DUR - 0.6, MUT_DUR - 0.05)}} />
		<Audio src={staticFile('mu/mixT.wav')} />
	</AbsoluteFill>;
};
