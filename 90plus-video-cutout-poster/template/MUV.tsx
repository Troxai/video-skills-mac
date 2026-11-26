import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing, random} from 'remotion';
import '@fontsource/playfair-display/vietnamese-400.css';
import '@fontsource/playfair-display/latin-400.css';
import '@fontsource/playfair-display/vietnamese-700-italic.css';
import '@fontsource/playfair-display/latin-700-italic.css';
import '@fontsource/jetbrains-mono/vietnamese-400.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/vietnamese-700.css';
import '@fontsource/jetbrains-mono/latin-700.css';

// Data-viz kit demo (paper & ink). Each block is a reusable component.
export const MUV_DUR = 31;
const SERIF = 'Playfair Display', MONO = 'JetBrains Mono';
const INK = '#141414', RED = '#C62828', BLUE = '#1E4FA8', GREEN = '#2E7D32';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const E = (t: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(t, [a, b], [0, 1], {...cl, easing: e});
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

const Paper: React.FC<{children?: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: '#e9e9e7'}}>
	<Img src={staticFile('mz/paper.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, mixBlendMode: 'multiply'}} />{children}</AbsoluteFill>;
const Title: React.FC<{t: number; kicker: string; children: React.ReactNode}> = ({t, kicker, children}) => <div style={{position: 'absolute', left: 100, top: 80, opacity: E(t, 0.1, 0.5)}}>
	<div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 5, color: '#666'}}>{kicker}</div>
	<div style={{fontFamily: SERIF, fontSize: 66, color: INK, marginTop: 6}}>{children}</div>
</div>;
const B: React.FC<{children: React.ReactNode; c?: string}> = ({children, c = RED}) => <b style={{fontWeight: 700, fontStyle: 'italic', color: c}}>{children}</b>;
const Note: React.FC<{t: number}> = ({t}) => <div style={{position: 'absolute', right: 60, bottom: 40, fontFamily: MONO, fontSize: 18, letterSpacing: 3, color: '#888', opacity: E(t, 0.5, 1)}}>SỐ LIỆU MINH HOẠ</div>;

// ---- 1. Form chart: cumulative points vs. expected ----
const FormChart: React.FC<{t: number}> = ({t}) => {
	const pts = [3, 1, 0, 3, 0, 0, 1, 0, 0, 0]; // illustrative
	const cum = pts.reduce<number[]>((a, p) => [...a, (a[a.length - 1] ?? 0) + p], []);
	const X = (i: number) => 220 + i * 150, Y = (v: number) => 900 - v * 22;
	const u = E(t, 0.6, 3.2, Easing.inOut(Easing.cubic));
	const path = cum.map((v, i) => `${i ? 'L' : 'M'} ${X(i)} ${Y(v)}`).join(' ');
	const pace = `M ${X(0)} ${Y(2)} L ${X(9)} ${Y(20)}`;
	return <Paper>
		<Title t={t} kicker="BIỂU ĐỒ PHONG ĐỘ">điểm tích luỹ sau <B>10 trận</B></Title>
		<svg width={1920} height={1080} style={{position: 'absolute'}}>
			{[0, 5, 10, 15, 20].map((v) => <g key={v}><line x1={200} x2={1700} y1={Y(v)} y2={Y(v)} stroke="#bbb" strokeWidth={2} strokeDasharray="4 8" /><text x={170} y={Y(v) + 8} textAnchor="end" fontFamily={MONO} fontSize={22} fill="#777">{v}</text></g>)}
			<path d={pace} stroke={GREEN} strokeWidth={4} strokeDasharray="12 10" fill="none" pathLength={1} style={{strokeDasharray: `${E(t, 0.4, 2)} 1`}} />
			<text x={X(9) + 20} y={Y(20) + 8} fontFamily={MONO} fontSize={22} fill={GREEN} opacity={E(t, 2, 2.4)}>NHỊP TOP 4</text>
			<path d={path} stroke={RED} strokeWidth={8} fill="none" strokeLinejoin="round" pathLength={1} style={{strokeDasharray: `${u} 1`}} />
			{cum.map((v, i) => {const s = E(t, 0.6 + i * 0.26, 0.85 + i * 0.26, Easing.out(Easing.back(2))); return <g key={i} transform={`translate(${X(i)} ${Y(v)}) scale(${s})`}><circle r={16} fill={pts[i] === 3 ? GREEN : pts[i] === 1 ? '#999' : RED} stroke="#f5f1e8" strokeWidth={4} /></g>;})}
			{cum.map((_, i) => <text key={'x' + i} x={X(i)} y={960} textAnchor="middle" fontFamily={MONO} fontSize={20} fill="#777">{`T${i + 1}`}</text>)}
			<text x={X(9) + 30} y={Y(8) + 10} fontFamily={MONO} fontWeight={700} fontSize={44} fill={RED} opacity={E(t, 3.2, 3.5)}>8</text>
		</svg>
		<Note t={t} />
	</Paper>;
};

// ---- 2. Radar: two players ----
const Radar: React.FC<{t: number}> = ({t}) => {
	const axes = ['Bàn thắng', 'Kiến tạo', 'Chuyền tiến', 'Pressing', 'Rê bóng', 'Tranh chấp'];
	const A = [0.62, 0.85, 0.9, 0.35, 0.55, 0.3], Bv = [0.45, 0.5, 0.6, 0.88, 0.4, 0.8];
	const cx = 1200, cy = 590, R = 330;
	const pt = (i: number, v: number) => {const a = -Math.PI / 2 + i * Math.PI * 2 / 6; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v];};
	const poly = (vals: number[], u: number) => vals.map((v, i) => pt(i, v * u).join(',')).join(' ');
	const ua = E(t, 0.8, 2, Easing.out(Easing.back(1.3))), ub = E(t, 2.0, 3.2, Easing.out(Easing.back(1.3)));
	return <Paper>
		<Title t={t} kicker="RADAR SO SÁNH">hai kiểu <B>tiền vệ</B></Title>
		<svg width={1920} height={1080} style={{position: 'absolute'}}>
			{[0.25, 0.5, 0.75, 1].map((s) => <polygon key={s} points={axes.map((_, i) => pt(i, s).join(',')).join(' ')} fill="none" stroke="#bbb" strokeWidth={2} />)}
			{axes.map((a, i) => {const [x, y] = pt(i, 1.17); return <g key={a}><line x1={cx} y1={cy} x2={pt(i, 1)[0]} y2={pt(i, 1)[1]} stroke="#bbb" strokeWidth={2} /><text x={x} y={y + 8} textAnchor="middle" fontFamily={MONO} fontSize={24} fill="#555">{a.toUpperCase()}</text></g>;})}
			<polygon points={poly(A, ua)} fill="rgba(198,40,40,.25)" stroke={RED} strokeWidth={6} />
			<polygon points={poly(Bv, ub)} fill="rgba(30,79,168,.22)" stroke={BLUE} strokeWidth={6} />
		</svg>
		<div style={{position: 'absolute', left: 100, top: 380, fontFamily: SERIF, fontSize: 52, color: RED, opacity: E(t, 1.0, 1.4)}}>● <B>cầu thủ A</B> · sáng tạo</div>
		<div style={{position: 'absolute', left: 100, top: 470, fontFamily: SERIF, fontSize: 52, color: BLUE, opacity: E(t, 2.2, 2.6)}}>● <B c={BLUE}>cầu thủ B</B> · máy quét</div>
		<Note t={t} />
	</Paper>;
};

// ---- half pitch helper (attacking upward) ----
const HP = {x: 600, y: 250, w: 740, h: 780}; // 68m wide x 52.5m deep
const hx = (m: number) => HP.x + (m / 68) * HP.w, hy = (d: number) => HP.y + (d / 52.5) * HP.h;
const HalfPitch: React.FC = () => <svg width={1920} height={1080} style={{position: 'absolute'}}><g stroke={INK} strokeWidth={4} fill="none" opacity={0.75}>
	<rect x={HP.x} y={HP.y} width={HP.w} height={HP.h} />
	<rect x={hx(34 - 20.16)} y={hy(0)} width={hx(34 + 20.16) - hx(34 - 20.16)} height={hy(16.5) - hy(0)} />
	<rect x={hx(34 - 9.16)} y={hy(0)} width={hx(34 + 9.16) - hx(34 - 9.16)} height={hy(5.5) - hy(0)} />
	<rect x={hx(34 - 3.66)} y={hy(-2)} width={hx(34 + 3.66) - hx(34 - 3.66)} height={hy(0) - hy(-2)} strokeWidth={5} />
	<path d={`M ${hx(34 - 9.15)} ${hy(52.5)} A ${(9.15 / 68) * HP.w} ${(9.15 / 52.5) * HP.h} 0 0 1 ${hx(34 + 9.15)} ${hy(52.5)}`} />
</g><circle cx={hx(34)} cy={hy(11)} r={5} fill={INK} /></svg>;

// ---- 3. Shot map ----
const ShotMap: React.FC<{t: number}> = ({t}) => {
	const shots = Array.from({length: 22}).map((_, i) => {const d = 5 + Math.pow(random('d' + i), 1.3) * 25; const w = 34 + (random('w' + i) - 0.5) * Math.min(40, d * 1.6); const xg = Math.max(0.02, Math.min(0.6, 0.7 / (1 + d / 5))); return {w, d, xg, goal: random('g' + i) < xg * 0.9};});
	const total = shots.reduce((a, s) => a + s.xg, 0), goals = shots.filter((s) => s.goal).length;
	return <Paper>
		<Title t={t} kicker="BẢN ĐỒ CÚ SÚT">to = <B>xG cao</B> · đặc = <B c={INK}>bàn thắng</B></Title>
		<HalfPitch />
		<svg width={1920} height={1080} style={{position: 'absolute'}}>
			{shots.map((s, i) => {const u = E(Math.floor(t * 12) / 12, 0.6 + i * 0.09, 0.9 + i * 0.09, Easing.out(Easing.back(2.2))); return <circle key={i} cx={hx(s.w)} cy={hy(s.d)} r={(10 + s.xg * 70) * u} fill={s.goal ? RED : 'rgba(198,40,40,.12)'} stroke={RED} strokeWidth={4} />;})}
		</svg>
		<div style={{position: 'absolute', left: 1420, top: 420, opacity: E(t, 2.8, 3.2)}}>
			{[['CÚ SÚT', `${shots.length}`], ['TỔNG xG', total.toFixed(2)], ['BÀN THẮNG', `${goals}`]].map(([l, v], i) => <div key={l} style={{width: 400, marginBottom: 26}}><div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, color: INK}}><span style={{fontSize: 24, letterSpacing: 4}}>{l}</span><span style={{fontSize: 52, fontWeight: 700}}>{v}</span></div><div style={{height: 3, background: GREEN, width: `${E(t, 3 + i * 0.15, 3.6 + i * 0.15) * 100}%`}} /></div>)}
		</div>
		<Note t={t} />
	</Paper>;
};

// ---- 4. Pass network (full pitch, horizontal) ----
const PassNet: React.FC<{t: number}> = ({t}) => {
	const PX = (x: number) => 300 + x * 13, PY = (y: number) => 230 + y * 11.8;
	const N: [string, number, number, number][] = [['GK', 6, 34, 30], ['LB', 30, 8, 55], ['CB', 20, 24, 70], ['CB', 20, 44, 72], ['RB', 30, 60, 50], ['DM', 38, 34, 95], ['CM', 50, 22, 60], ['CM', 50, 46, 58], ['LW', 70, 10, 40], ['ST', 80, 34, 30], ['RW', 70, 58, 42]];
	const Ed: [number, number, number][] = [[0, 2, 6], [0, 3, 6], [2, 3, 9], [2, 5, 12], [3, 5, 11], [2, 1, 7], [3, 4, 7], [5, 6, 9], [5, 7, 8], [1, 6, 6], [4, 7, 5], [6, 8, 4], [7, 10, 4], [6, 9, 2], [7, 9, 2], [1, 8, 5], [4, 10, 4]];
	return <Paper>
		<Title t={t} kicker="BẢN ĐỒ CHUYỀN BÓNG">mọi thứ đi qua <B>tiền vệ trụ</B></Title>
		<svg width={1920} height={1080} style={{position: 'absolute'}}>
			<g stroke={INK} strokeWidth={3} fill="none" opacity={0.5}><rect x={PX(0)} y={PY(0)} width={PX(105) - PX(0)} height={PY(68) - PY(0)} /><line x1={PX(52.5)} y1={PY(0)} x2={PX(52.5)} y2={PY(68)} /><circle cx={PX(52.5)} cy={PY(34)} r={9.15 * 13} /></g>
			{Ed.map(([a, b, w], i) => {const u = E(t, 1.0 + i * 0.08, 1.5 + i * 0.08); return <line key={i} x1={PX(N[a][1])} y1={PY(N[a][2])} x2={lerp(PX(N[a][1]), PX(N[b][1]), u)} y2={lerp(PY(N[a][2]), PY(N[b][2]), u)} stroke={w > 8 ? RED : '#777'} strokeWidth={w * 1.6} strokeLinecap="round" opacity={0.75} />;})}
			{N.map(([p, x, y, v], i) => {const s = E(Math.floor(t * 12) / 12, 0.3 + i * 0.06, 0.6 + i * 0.06, Easing.out(Easing.back(2))); const hub = p === 'DM'; return <g key={i} transform={`translate(${PX(x)} ${PY(y)}) scale(${s})`}><circle r={14 + v * 0.32} fill={hub ? RED : '#f5f1e8'} stroke={INK} strokeWidth={5} /><text y={9} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill={hub ? '#fff' : INK}>{p}</text></g>;})}
			{(() => {const u = E(t, 2.8, 3.4); return <circle cx={PX(38)} cy={PY(34)} r={70 + 10 * Math.sin(t * 4)} fill="none" stroke={RED} strokeWidth={5} strokeDasharray="10 10" opacity={u} />;})()}
		</svg>
		<Note t={t} />
	</Paper>;
};

// ---- 5. Heatmap ----
const Heat: React.FC<{t: number}> = ({t}) => {
	const blobs = Array.from({length: 26}).map((_, i) => ({x: 60 + random('hx' + i) * 32 + (i < 8 ? 10 : 0), y: 12 + random('hy' + i) * 30, r: 40 + random('hr' + i) * 70, a: 0.15 + random('ha' + i) * 0.25}));
	const PX = (x: number) => 300 + x * 13, PY = (y: number) => 230 + y * 11.8;
	return <Paper>
		<Title t={t} kicker="HEATMAP">hoạt động dồn về <B>cánh trái</B></Title>
		<svg width={1920} height={1080} style={{position: 'absolute'}}>
			<defs><filter id="hb"><feGaussianBlur stdDeviation="28" /></filter><clipPath id="pc"><rect x={PX(0)} y={PY(0)} width={PX(105) - PX(0)} height={PY(68) - PY(0)} /></clipPath></defs>
			<g filter="url(#hb)" clipPath="url(#pc)">{blobs.map((b, i) => <circle key={i} cx={PX(b.x)} cy={PY(b.y)} r={b.r * E(t, 0.5 + i * 0.05, 1.3 + i * 0.05)} fill={RED} opacity={b.a * 1.6} />)}</g>
			<g stroke={INK} strokeWidth={3} fill="none" opacity={0.6}><rect x={PX(0)} y={PY(0)} width={PX(105) - PX(0)} height={PY(68) - PY(0)} /><line x1={PX(52.5)} y1={PY(0)} x2={PX(52.5)} y2={PY(68)} /><circle cx={PX(52.5)} cy={PY(34)} r={9.15 * 13} /><rect x={PX(105 - 16.5)} y={PY(34 - 20.16)} width={16.5 * 13} height={40.32 * 11.8} /></g>
			<text x={PX(105) + 20} y={PY(34)} fontFamily={MONO} fontSize={22} fill="#666" opacity={E(t, 1, 1.4)}>→ HƯỚNG TẤN CÔNG</text>
		</svg>
		<Note t={t} />
	</Paper>;
};

const SEGS = [FormChart, Radar, ShotMap, PassNet, Heat];
export const MUVVideo: React.FC = () => {
	const f = useCurrentFrame(), t = f / 30;
	const D = 6.2, TD = 0.45;
	const i = Math.min(SEGS.length - 1, Math.floor(t / D));
	const lt = t - i * D;
	const Cur = SEGS[i]; const Nx = i + 1 < SEGS.length ? SEGS[i + 1] : null;
	const u = Nx && lt > D - TD ? E(lt, D - TD, D, Easing.inOut(Easing.cubic)) : 0;
	return <AbsoluteFill style={{background: '#000'}}>
		<AbsoluteFill style={{transform: `translateX(${-u * 1920}px)`, filter: u > 0.05 && u < 0.95 ? `blur(${Math.sin(u * Math.PI) * 8}px)` : undefined}}><Cur t={lt} /></AbsoluteFill>
		{u > 0 && Nx && <AbsoluteFill style={{transform: `translateX(${(1 - u) * 1920}px)`}}><Nx t={0} /></AbsoluteFill>}
		<Img src={staticFile('mu/logo.png')} style={{position: 'absolute', right: 36, top: 30, width: 92, height: 92, borderRadius: '50%', opacity: 0.92}} />
		<AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'multiply'}}><Img src={staticFile(`tex/noise${Math.floor(f / 3) % 4}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
	</AbsoluteFill>;
};
