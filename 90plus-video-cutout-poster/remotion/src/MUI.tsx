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

// Injury explainer module: "Vì sao cổ chân là điểm yếu của cầu thủ?"
const SPD = 1.15;
const T0 = [[0, 3.27], [3.67, 4.84], [5.24, 11.02], [11.42, 14.24], [14.64, 16.68], [17.08, 19.5], [19.91, 23.47], [23.87, 30.32], [30.72, 34.11], [34.51, 36.96]];
const T = T0.map(([a, b]) => [a / SPD, b / SPD]);
export const MUI_DUR = Math.round(36.96 / SPD + 2.5);
const r = (i: number, f = 0) => T[i][0] + (T[i][1] - T[i][0]) * f;

const SERIF = 'Playfair Display', MONO = 'JetBrains Mono';
const INK = '#141414', RED = '#C62828', RUST = '#8E2F1B', GREEN = '#2E7D32';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const E = (t: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(t, [a, b], [0, 1], {...cl, easing: e});
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const st = (t: number) => Math.floor(t * 12) / 12;
const pop = (t: number, a: number) => E(st(t), a, a + 0.3, Easing.out(Easing.back(2.2)));

const Paper: React.FC<{children?: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: '#e9e9e7'}}>
	<Img src={staticFile('mz/paper.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, mixBlendMode: 'multiply'}} />{children}</AbsoluteFill>;
const B: React.FC<{children: React.ReactNode; c?: string}> = ({children, c = INK}) => <b style={{fontWeight: 700, fontStyle: 'italic', color: c}}>{children}</b>;
const Txt: React.FC<{x: number; y: number; t: number; a: number; size?: number; w?: number; c?: string; out?: number; align?: 'left' | 'center' | 'right'; children: React.ReactNode}> = ({x, y, t, a, size = 60, w = 900, c = INK, out = 1e9, align = 'left', children}) => {
	const u = E(t, a, a + 0.45), o = 1 - E(t, out, out + 0.3);
	const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
	return <div style={{position: 'absolute', left, top: y, width: w, textAlign: align, fontFamily: SERIF, fontSize: size, color: c, lineHeight: 1.2, opacity: u * o, transform: `translateY(${(1 - u) * 16}px)`, zIndex: 5}}>{children}</div>;
};
const Ground: React.FC<{y: number; t: number; a: number}> = ({y, t, a}) => <div style={{position: 'absolute', left: 0, top: y, height: 4, width: 1920 * E(t, a, a + 0.6), background: INK}} />;
const Cut: React.FC<{n: string; w0: number; h0: number; x: number; y: number; h: number; t: number; a: number; out?: number; from?: 'left' | 'right' | 'up' | 'none'}> = ({n, w0, h0, x, y, h, t, a, out = 1e9, from = 'none'}) => {
	const w = (w0 / h0) * h, u = E(t, a, a + 0.5), o = 1 - E(t, out, out + 0.3);
	const dx = from === 'left' ? -600 * (1 - u) : from === 'right' ? 600 * (1 - u) : 0, dy = from === 'up' ? -200 * (1 - u) : 0;
	const g = h * 0.019;
	return <div style={{position: 'absolute', left: x - w / 2 + dx, top: y - h + dy, width: w, height: h, opacity: Math.min(1, u * 1.4) * o, zIndex: 3}}>
		<Img src={staticFile(`mu/${n}.png`)} style={{position: 'absolute', left: -g, top: g * 0.15, width: w, height: h, filter: 'grayscale(1) brightness(.35)', opacity: 0.35}} />
		<Img src={staticFile(`mu/${n}.png`)} style={{position: 'absolute', left: 0, top: 0, width: w, height: h}} />
		<div style={{position: 'absolute', left: '10%', bottom: -14, width: '80%', height: 26, borderRadius: '50%', background: 'radial-gradient(rgba(0,0,0,.28), transparent 70%)'}} />
	</div>;
};
const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; bend?: number; t: number; a: number; c?: string; out?: number; id: string}> = ({x1, y1, x2, y2, bend = 0.25, t, a, c = INK, out = 1e9, id}) => {
	const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
	const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
	const u = E(t, a, a + 0.6, Easing.inOut(Easing.cubic)), o = 1 - E(t, out, out + 0.3);
	const ang = Math.atan2(y2 - my, x2 - mx) * 180 / Math.PI;
	return <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: o, zIndex: 6}}>
		<defs><mask id={`m${id}`}><path d={d} stroke="#fff" strokeWidth={14} fill="none" pathLength={1} strokeDasharray={`${u} 1`} /></mask></defs>
		<path d={d} stroke={c} strokeWidth={5} fill="none" strokeDasharray="2 11" strokeLinecap="round" mask={`url(#m${id})`} />
		{u > 0.97 && <path d="M -16 -10 L 0 0 L -16 10" transform={`translate(${x2} ${y2}) rotate(${ang})`} stroke={c} strokeWidth={5} fill="none" strokeLinecap="round" />}
	</svg>;
};
const Magnifier: React.FC<{x: number; y: number; s?: number; t: number; a: number; c?: string; out?: number}> = ({x, y, s = 1, t, a, c = INK, out = 1e9}) => {
	const u = E(t, a, a + 0.8, Easing.inOut(Easing.cubic)), o = 1 - E(t, out, out + 0.3);
	return <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: o, zIndex: 7}}>
		<g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={c} strokeLinecap="round">
			<circle r={120} strokeWidth={14} pathLength={1} strokeDasharray={`${u} 1`} transform="rotate(-90)" />
			<circle r={96} strokeWidth={5} pathLength={1} strokeDasharray={`${E(t, a + 0.3, a + 0.9)} 1`} opacity={0.6} />
			<path d="M 85 85 L 210 210" strokeWidth={30} pathLength={1} strokeDasharray={`${E(t, a + 0.5, a + 0.9)} 1`} />
			<path d="M 85 85 L 210 210" strokeWidth={14} stroke="#e9e9e7" pathLength={1} strokeDasharray={`${E(t, a + 0.5, a + 0.9)} 1`} />
		</g>
	</svg>;
};
const Stat: React.FC<{x: number; y: number; label: string; val: string; t: number; a: number; c?: string; w?: number}> = ({x, y, label, val, t, a, c = INK, w = 700}) => {
	const u = E(t, a, a + 0.4);
	return <div style={{position: 'absolute', left: x, top: y, width: w, opacity: u, transform: `translateX(${(1 - u) * -30}px)`, zIndex: 5}}>
		<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: MONO, color: c}}><span style={{fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', maxWidth: w - 220}}>{label}</span><span style={{fontSize: 72, fontWeight: 700}}>{val}</span></div>
		<div style={{height: 3, background: GREEN, width: `${E(t, a + 0.2, a + 0.8) * 100}%`, marginTop: 8}} />
	</div>;
};

// legs close-up layout (shared by scene 3 and 5)
const LEGS = {x: 760, y: 1010, h: 1450}; // cutout 1187x2634, crop shows thigh->boots
const legW = (1187 / 2634) * LEGS.h;
const plantAnkle = {x: LEGS.x - legW / 2 + legW * 0.22, y: LEGS.y - LEGS.h * 0.12}; // planted leg ankle (screen)

export const MUIVideo: React.FC = () => {
	const f = useCurrentFrame(), t = f / 30;
	// scene windows
	const sc = [0, r(2, 0) - 0.12, r(4, 0) - 0.12, r(5, 0) - 0.12, r(7, 0) - 0.12, r(8, 0) - 0.12, r(9, 0) - 0.12, MUI_DUR];
	const k = sc.findIndex((s, i) => t >= s && t < sc[i + 1]);
	const TD = 0.45;
	const slide = (i: number) => {const s = sc[i + 1]; return t > s - TD && t < s ? E(t, s - TD, s, Easing.inOut(Easing.cubic)) : 0;};

	const scenes: React.ReactNode[] = [
		// 0: sitting player
		<Paper key={0}>
			<Ground y={900} t={t} a={0} />
			<Cut n="inj_sitting" w0={1419} h0={1251} x={960} y={915} h={560} t={t} a={0.05} from="up" />
			<Txt x={960} y={140} t={t} a={r(1, 0)} size={96} w={1400} align="center">tình hình <B>nghiêm trọng</B>?</Txt>
		</Paper>,
		// 1: journal + stats
		<Paper key={1}>
			<div style={{position: 'absolute', left: 60, top: 40, fontFamily: SERIF, fontWeight: 700, fontStyle: 'italic', fontSize: 64, color: INK, opacity: E(t, sc[1], sc[1] + 0.4)}}>British Journal of Sports Medicine</div>
			<div style={{position: 'absolute', left: 0, top: 140, height: 4, width: 1920 * E(t, sc[1] + 0.1, sc[1] + 0.7), background: INK}} />
			<Txt x={90} y={190} t={t} a={sc[1] + 0.5} size={30} w={900} c="#333">UEFA Champions League Injury Study · 27 CLB châu Âu · 1.743 cầu thủ · 2001–2012</Txt>
			<Ground y={980} t={t} a={sc[1]} />
			<Cut n="inj_sitting" w0={1419} h0={1251} x={1450} y={995} h={520} t={t} a={sc[1]} />
			<Stat x={90} y={380} label="Chấn thương cổ chân / mọi chấn thương" val="13%" t={t} a={r(2, 0.55)} c={RED} w={900} />
			<Stat x={90} y={560} label="Mỗi đội 25 cầu thủ, mỗi mùa" val="≈7 ca" t={t} a={r(3, 0.2)} w={900} />
		</Paper>,
		// 2: legs close-up + red circle + magnifier
		<Paper key={2}>
			<div style={{position: 'absolute', left: 1250, top: -380, width: 900, height: 900, borderRadius: '50%', background: RUST, transform: `scale(${pop(t, sc[2] + 0.1)})`}} />
			<Txt x={1840} y={150} t={t} a={sc[2] + 0.3} size={86} w={700} c="#f5f1e8" align="right">vì sao lại<br /><B c="#f5f1e8">chấn thương?</B></Txt>
			<Ground y={LEGS.y - 6} t={t} a={sc[2]} />
			<Cut n="inj_legs" w0={1187} h0={2634} x={LEGS.x} y={LEGS.y} h={LEGS.h} t={t} a={sc[2]} from="left" />
			<Magnifier x={1500} y={700} s={1} t={t} a={sc[2] + 0.6} c="#777" />
		</Paper>,
		// 3: dribble + arrows
		<Paper key={3}>
			<div style={{position: 'absolute', left: 60, top: 40, fontFamily: SERIF, fontWeight: 700, fontStyle: 'italic', fontSize: 52, color: INK, opacity: E(t, sc[3], sc[3] + 0.4)}}>cơ học của một pha đổi hướng</div>
			<div style={{position: 'absolute', left: 0, top: 120, height: 4, width: 1920 * E(t, sc[3] + 0.1, sc[3] + 0.7), background: INK}} />
			<Cut n="inj_dribble" w0={1287} h0={1879} x={1150} y={1040} h={880} t={t} a={sc[3]} from="right" />
			<Arrow id="cg" x1={780} y1={380} x2={780} y2={650} bend={0} t={t} a={r(5, 0.3)} />
			<Txt x={780} y={680} t={t} a={r(5, 0.45)} size={58} w={600} align="center">hạ <B>trọng tâm</B></Txt>
			<Txt x={1460} y={430} t={t} a={r(6, 0.05)} size={50} w={420}>áp lực lên <B>chân trụ</B></Txt>
			<Arrow id="ct" x1={1540} y1={570} x2={1330} y2={760} bend={-0.15} t={t} a={r(6, 0.15)} />
			<Txt x={1420} y={860} t={t} a={r(6, 0.5)} size={46} w={430}><B>mắt cá</B> gánh phần lớn trọng lượng</Txt>
			<Arrow id="mc" x1={1410} y1={890} x2={1310} y2={985} bend={0.3} t={t} a={r(6, 0.55)} c={RED} />
		</Paper>,
		// 4: X-ray reveal on planted ankle
		<Paper key={4}>
			<Ground y={LEGS.y - 6} t={t} a={sc[4] - 1} />
			<Cut n="inj_legs" w0={1187} h0={2634} x={LEGS.x} y={LEGS.y} h={LEGS.h} t={t} a={sc[4] - 1} />
			{(() => {const u = E(t, sc[4] + 0.6, sc[4] + 1.1, Easing.out(Easing.back(1.4))); const R = 170; return <div style={{position: 'absolute', left: plantAnkle.x - R, top: plantAnkle.y - R, width: 2 * R, height: 2 * R, borderRadius: '50%', overflow: 'hidden', background: '#000', transform: `scale(${u})`, zIndex: 4, boxShadow: '8px 10px 0 rgba(0,0,0,.25)'}}>
				<Img src={staticFile('mu/inj_bones.jpg')} style={{position: 'absolute', width: 2 * R * 1.5, left: -2 * R * 0.25, top: -2 * R * 1.25}} />
				<svg width={2 * R} height={2 * R} style={{position: 'absolute', left: 0, top: 0}}><path d={`M ${R * 0.62} ${R * 0.95} Q ${R * 0.45} ${R * 1.25} ${R * 0.6} ${R * 1.45}`} stroke={RED} strokeWidth={14} fill="none" strokeLinecap="round" opacity={E(t, r(7, 0.25), r(7, 0.35)) * (0.6 + 0.4 * Math.sin(t * 8))} /></svg>
			</div>;})()}
			<Magnifier x={plantAnkle.x + 620} y={plantAnkle.y - 330} s={1} t={t} a={sc[4]} />
			<Arrow id="xr" x1={plantAnkle.x + 520} y1={plantAnkle.y - 230} x2={plantAnkle.x + 190} y2={plantAnkle.y - 20} bend={0.2} t={t} a={sc[4] + 0.5} />
			<Txt x={1840} y={140} t={t} a={r(7, 0.2)} size={66} w={760} align="right">bàn chân <B c={RED}>lật vào trong</B></Txt>
			<Txt x={1840} y={240} t={t} a={r(7, 0.35)} size={50} w={760} align="right">dây chằng <B c={RED}>phía ngoài</B> bị kéo giãn</Txt>
			<Stat x={1140} y={430} label="Bong gân cổ chân ở dây chằng ngoài" val="> 3/4" t={t} a={r(7, 0.6)} c={RED} />
		</Paper>,
		// 5: foul play 40%
		<Paper key={5}>
			<Ground y={980} t={t} a={sc[5]} />
			<Cut n="inj_sitting" w0={1419} h0={1251} x={1420} y={995} h={600} t={t} a={sc[5]} from="right" />
			<div style={{position: 'absolute', left: 120, top: 260, fontFamily: MONO, fontWeight: 700, fontSize: 260, color: RED, opacity: E(t, sc[5] + 0.2, sc[5] + 0.5), zIndex: 5}}>{Math.round(40 * E(t, sc[5] + 0.2, sc[5] + 1.2))}%</div>
			<Txt x={130} y={600} t={t} a={sc[5] + 0.5} size={56} w={800}>ca bong gân trong trận đến từ <B c={RED}>một pha phạm lỗi</B></Txt>
			<div style={{position: 'absolute', left: 130, top: 780, fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: '#666', opacity: E(t, sc[5] + 0.8, sc[5] + 1.2)}}>THEO TRỌNG TÀI · BJSM 2013</div>
		</Paper>,
		// 6: ending
		<Paper key={6}>
			<div style={{position: 'absolute', left: 1180, top: 120, width: 700, height: 700, borderRadius: '50%', background: RED, transform: `scale(${pop(t, sc[6])})`}} />
			<Ground y={900} t={t} a={sc[6]} />
			<Cut n="inj_dribble" w0={1287} h0={1879} x={1520} y={910} h={760} t={t} a={sc[6] + 0.1} from="up" />
			<Txt x={120} y={330} t={t} a={sc[6] + 0.2} size={80} w={900}>cổ chân <B>rất nhỏ</B>.</Txt>
			<Txt x={120} y={450} t={t} a={r(9, 0.45)} size={80} w={900}>nhưng nó gánh <B c={RED}>cả một sự nghiệp</B>.</Txt>
		</Paper>,
	];
	const cur = scenes[Math.max(0, k)], nx = scenes[k + 1];
	const u = slide(k);
	return <AbsoluteFill style={{background: '#000'}}>
		<AbsoluteFill style={{transform: `translate(${Math.sin(t * 1.2) * 4}px,${Math.cos(t * 0.9) * 4}px) scale(1.015)`}}>
			<AbsoluteFill style={{transform: `translateX(${-u * 1920}px)`, filter: u > 0.05 && u < 0.95 ? `blur(${Math.sin(u * Math.PI) * 8}px)` : undefined}}>{cur}</AbsoluteFill>
			{u > 0 && nx && <AbsoluteFill style={{transform: `translateX(${(1 - u) * 1920}px)`}}>{nx}</AbsoluteFill>}
		</AbsoluteFill>
		<Img src={staticFile('mu/logo.png')} style={{position: 'absolute', right: 36, top: 30, width: 92, height: 92, borderRadius: '50%', opacity: 0.92, zIndex: 20}} />
		<div style={{position: 'absolute', left: 40, bottom: 30, fontFamily: MONO, fontSize: 16, color: '#888'}}>hình minh hoạ · nguồn: Waldén et al., BJSM 2013 (UEFA CL Injury Study)</div>
		<AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'multiply'}}><Img src={staticFile(`tex/noise${Math.floor(f / 3) % 4}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
		<AbsoluteFill style={{background: '#000', opacity: E(t, MUI_DUR - 0.6, MUI_DUR - 0.05)}} />
		<Audio src={staticFile('mu/mixI.wav')} />
	</AbsoluteFill>;
};
