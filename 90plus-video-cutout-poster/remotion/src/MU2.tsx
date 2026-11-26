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

export const MU2_DUR = 81.8;
const SERIF = 'Playfair Display', MONO = 'JetBrains Mono';
const INK = '#141414', RED = '#C62828', BLUE = '#1E4FA8', GREEN = '#2E7D32';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const E = (t: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(t, [a, b], [0, 1], {...cl, easing: e});
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const st = (t: number) => Math.floor(t * 12) / 12;
const pop = (t: number, a: number) => E(st(t), a, a + 0.3, Easing.out(Easing.back(2)));

const SIZE: Record<string, [number, number]> = {carrick: [744, 2480], bruno: [1010, 2461], martinez: [975, 2464], wilcox: [704, 2471], neville: [866, 2515], chair: [1116, 1758]};

// ---------- building blocks ----------
const Paper: React.FC<{children?: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: '#e9e9e7'}}>
	<Img src={staticFile('mz/paper.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, mixBlendMode: 'multiply'}} />{children}</AbsoluteFill>;
const Dark: React.FC<{children?: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: '#0b0b0b'}}>
	<AbsoluteFill style={{backgroundImage: 'radial-gradient(#2a2a2a 1.4px, transparent 1.6px)', backgroundSize: '16px 16px', opacity: 0.8}} />
	<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(0,0,0,.7))'}} />{children}</AbsoluteFill>;

// cutout figure: x = centre, y = feet (full) ; crop = fraction of height shown from top (1 = full body)
const Fig: React.FC<{n: string; x: number; y: number; h: number; t: number; a: number; crop?: number; flip?: boolean; from?: 'left' | 'right' | 'up' | 'none'; out?: number; dim?: number; shake?: number}> = ({n, x, y, h, t, a, crop = 1, flip, from = 'none', out = 999, dim = 0, shake = 0}) => {
	const [w0, h0] = SIZE[n]; const w = (w0 / h0) * h;
	const u = E(t, a, a + 0.55, Easing.out(Easing.cubic));
	const o = 1 - E(t, out, out + 0.35, Easing.in(Easing.cubic));
	const dx = from === 'left' ? -500 * (1 - u) - 600 * (1 - o) : from === 'right' ? 500 * (1 - u) + 600 * (1 - o) : 0;
	const dy = from === 'up' ? -300 * (1 - u) : 0;
	const vis = h * crop;
	const g = h * 0.019;
	const img = (ghost: boolean) => <Img src={staticFile(`mu/${n}.png`)} style={{position: 'absolute', left: ghost ? -g : 0, top: ghost ? g * 0.15 : 0, width: w, height: h, transform: flip ? 'scaleX(-1)' : undefined, filter: ghost ? 'grayscale(1) brightness(.35)' : dim ? `brightness(${1 - dim})` : undefined, opacity: ghost ? 0.35 : 1}} />;
	return <div style={{position: 'absolute', left: x - w / 2 + dx, top: y - vis + dy, width: w, height: vis, overflow: crop < 1 ? 'hidden' : 'visible', zIndex: 2, transform: shake ? `rotate(${Math.sin(t * 31) * shake * 2.2}deg) translateX(${Math.sin(t * 47) * shake * 7}px)` : undefined, transformOrigin: '50% 100%', opacity: Math.min(1, u * 1.4) * o, WebkitMaskImage: crop < 1 ? 'linear-gradient(to bottom, #000 82%, transparent)' : undefined}}>
		{img(true)}{img(false)}
	</div>;
};
const Circle: React.FC<{x: number; y: number; r: number; c: string; t: number; a: number}> = ({x, y, r, c, t, a}) => {const u = E(t, a, a + 0.5, Easing.out(Easing.back(1.4))); return <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: c, transform: `scale(${u})`, filter: 'url(#rough)'}} />;};
const Ground: React.FC<{y: number; t: number; a: number; c?: string}> = ({y, t, a, c = INK}) => <div style={{position: 'absolute', left: 0, top: y, height: 4, width: 1080 * E(t, a, a + 0.6), background: c}} />;
// serif line: parts = [text, bold?]
const S: React.FC<{x: number; y: number; t: number; a: number; size?: number; c?: string; out?: number; align?: 'left' | 'center' | 'right'; w?: number; children: React.ReactNode}> = ({x, y, t, a, size = 64, c = INK, out = 999, align = 'center', w = 900, children}) => {
	const u = E(t, a, a + 0.45), o = 1 - E(t, out, out + 0.3);
	const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
	return <div style={{position: 'absolute', left, top: y, width: w, textAlign: align, fontFamily: SERIF, fontSize: size, color: c, lineHeight: 1.2, opacity: u * o, transform: `translateY(${(1 - u) * 18}px)`}}>{children}</div>;
};
const B: React.FC<{children: React.ReactNode; c?: string}> = ({children, c}) => <b style={{fontWeight: 700, fontStyle: 'italic', color: c}}>{children}</b>;
// mono stat row
const Stat: React.FC<{x: number; y: number; label: string; val: string; t: number; a: number; w?: number; c?: string; out?: number}> = ({x, y, label, val, t, a, w = 860, c = '#d8d8d8', out = 999}) => {
	const u = E(t, a, a + 0.4), o = 1 - E(t, out, out + 0.3);
	return <div style={{position: 'absolute', left: x, top: y, width: w, opacity: u * o}}>
		<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: MONO, color: c}}>
			<span style={{fontSize: 34, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.85, maxWidth: w - 260}}>{label}</span>
			<span style={{fontSize: 76, fontWeight: 700}}>{val}</span>
		</div>
		<div style={{height: 3, background: GREEN, width: `${E(t, a + 0.2, a + 0.8) * 100}%`, marginTop: 10}} />
	</div>;
};
// dotted curved arrow from (x1,y1) to (x2,y2) with bend
const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; bend?: number; t: number; a: number; c?: string; out?: number; id: string}> = ({x1, y1, x2, y2, bend = 0.25, t, a, c = INK, out = 999, id}) => {
	const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
	const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
	const u = E(t, a, a + 0.6, Easing.inOut(Easing.cubic)), o = 1 - E(t, out, out + 0.3);
	const ang = Math.atan2(y2 - my, x2 - mx) * 180 / Math.PI;
	return <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: o}}>
		<defs><mask id={`m${id}`}><path d={d} stroke="#fff" strokeWidth={14} fill="none" pathLength={1} strokeDasharray={`${u} 1`} /></mask></defs>
		<path d={d} stroke={c} strokeWidth={5} fill="none" strokeDasharray="2 11" strokeLinecap="round" mask={`url(#m${id})`} />
		{u > 0.97 && <path d="M -16 -10 L 0 0 L -16 10" transform={`translate(${x2} ${y2}) rotate(${ang})`} stroke={c} strokeWidth={5} fill="none" strokeLinecap="round" />}
	</svg>;
};

// ---------- shots ----------
type Shot = {a: number; b: number; trans: 'left' | 'up' | 'cut' | 'zoom'; C: React.FC<{t: number; d: number}>};
const CIRC = [{x: 230, y: 960, c: RED}, {x: 540, y: 960, c: BLUE}, {x: 850, y: 960, c: RED}];
const Suspects: React.FC<{t: number; d: number; focus?: number; fill: number[]; ask?: boolean}> = ({t, fill, ask}) => {
	const figs = [['carrick'], ['bruno', 'martinez'], ['wilcox']];
	return <Paper>
		<S x={540} y={330} t={t} a={0.1} size={60}>ai có lỗi?</S>
		<S x={540} y={420} t={t} a={0.6} size={92}><B>ba</B> nghi phạm</S>
		{CIRC.map((c, i) => <React.Fragment key={i}>
			<Circle x={c.x} y={c.y} r={135} c={c.c} t={t} a={0.9 + i * 0.2} />
			{fill[i] === 0 ? <div style={{position: 'absolute', left: c.x - 135, top: c.y - 135, width: 270, height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 150, color: '#fff', opacity: E(t, 1.1 + i * 0.2, 1.4 + i * 0.2)}}>?</div>
				: figs[i].map((n, j) => <Fig key={n} n={n} x={c.x + (figs[i].length > 1 ? (j - 0.5) * 110 : 0)} y={c.y + 130} h={figs[i].length > 1 ? 560 : 640} crop={0.5} t={t} a={fill[i] < 0 ? -9 : fill[i]} from="up" />)}
			<div style={{position: 'absolute', left: c.x - 150, top: c.y + 160, width: 300, textAlign: 'center', fontFamily: MONO, fontSize: 28, letterSpacing: 3, color: INK, opacity: E(t, 1.2 + i * 0.2, 1.6 + i * 0.2)}}>{['HLV', 'CẦU THỦ', 'BAN LÃNH ĐẠO'][i]}</div>
		</React.Fragment>)}
		{ask && <><Ground y={1640} t={t} a={1.8} /><Fig n="chair" x={540} y={1640} h={380} t={t} a={2.0} from="up" shake={E(t, 2.6, 2.9) * 0.8} /><S x={540} y={1700} t={t} a={4.4} size={66}>ai đáng bị <B c={RED}>gọi tên</B>?</S><div style={{position: 'absolute', bottom: 70, width: 1080, textAlign: 'center', fontFamily: MONO, fontSize: 20, color: '#777', opacity: E(t, 5, 5.5)}}>hình minh hoạ · nguồn: Malay Mail/AFP, SI, Roundtable, Capital FM, Sky Sports</div></>}
	</Paper>;
};
// zoom wrapper for suspects page: zoom into circle k at end
const zoomInto = (k: number, t: number, d: number) => {const u = E(t, d - 0.6, d, Easing.in(Easing.cubic)); const s = lerp(1, 9, u); const c = CIRC[k]; return {transformOrigin: `${c.x}px ${c.y}px`, transform: `scale(${s})`};};
// page that starts from a full-screen colored circle shrinking to (x,y,r)
const FromCircle: React.FC<{t: number; c: string; x: number; y: number; r: number}> = ({t, c, x, y, r}) => {const u = E(t, 0, 0.6, Easing.out(Easing.cubic)); const rr = lerp(1400, r, u); return <div style={{position: 'absolute', left: lerp(540, x, u) - rr, top: lerp(960, y, u) - rr, width: rr * 2, height: rr * 2, borderRadius: '50%', background: c, filter: 'url(#rough)'}} />;};

const SHOTS: Shot[] = [
	{a: 0, b: 2.85, trans: 'cut', C: ({t}) => <Paper>
		<Circle x={560} y={1150} r={340} c={RED} t={t} a={0.0} />
		<Ground y={1620} t={t} a={0.1} />
		<Fig n="chair" x={560} y={1620} h={900} t={t} a={0.05} from="up" shake={E(t, 1.4, 1.7) * (0.6 + 0.4 * Math.sin(t * 3))} />
		<S x={60} y={330} t={t} a={0.5} size={72} align="left" w={640}>chiếc ghế<br /><B c={RED}>nóng nhất</B><br />nước Anh</S>
		<Arrow id="a0" x1={300} y1={540} x2={420} y2={760} bend={-0.3} t={t} a={1.0} />
	</Paper>},
	{a: 2.85, b: 9.62, trans: 'left', C: ({t}) => <Dark>
		<Stat x={110} y={260} label="Điểm sau 10 trận" val="8" t={t} a={0.6} />
		<Stat x={110} y={440} label="Vị trí hiện tại" val="18" t={t} a={1.5} />
		<Stat x={110} y={620} label="Khởi đầu tệ nhất kể từ" val="1986" t={t} a={3.6} c="#ff6b6b" />
		<Fig n="carrick" x={540} y={1920} h={1900} crop={0.64} t={t} a={0.2} from="up" />
		<div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: SERIF, fontSize: 170, color: '#fff', opacity: E(t, 5.0, 5.3)}}>?</div>
	</Dark>},
	{a: 9.62, b: 16.72, trans: 'left', C: ({t}) => <Paper>
		<Circle x={700} y={1180} r={300} c={BLUE} t={t} a={0.1} />
		<Ground y={1760} t={t} a={0.0} />
		<Fig n="carrick" x={700} y={1760} h={1450} t={t} a={0.0} from="right" />
		<S x={70} y={420} t={t} a={0.5} size={66} align="left" w={500}>michael<br /><B>carrick</B></S>
		<Arrow id="a1" x1={280} y1={600} x2={560} y2={560} bend={0.25} t={t} a={1.0} />
		<S x={70} y={950} t={t} a={3.2} size={52} align="left" w={440}>mùa trước:<br /><B c={BLUE}>hạng 3</B></S>
		<S x={70} y={1140} t={t} a={4.6} size={52} align="left" w={440}>trở lại<br /><B c={BLUE}>champions league</B></S>
	</Paper>},
	{a: 16.72, b: 22.62, trans: 'up', C: ({t}) => <Dark>
		<S x={540} y={250} t={t} a={0.2} size={60} c="#eee">mùa này</S>
		<Stat x={110} y={480} label="Como – Man Utd" val="4–1" t={t} a={1.3} c="#ff6b6b" />
		<Stat x={110} y={700} label="Man Utd – Bournemouth" val="0–3" t={t} a={3.2} c="#ff6b6b" />
		<S x={600} y={900} t={t} a={4.2} size={46} c="#ddd" align="left" w={420}>ngay tại<br /><B>old trafford</B></S>
		<Arrow id="a2" x1={720} y1={895} x2={880} y2={800} bend={-0.3} t={t} a={4.4} c="#ddd" />
		<Fig n="bruno" x={360} y={1920} h={2000} crop={0.62} t={t} a={0.4} dim={0.15} from="left" />
	</Dark>},
	{a: 22.62, b: 27.04, trans: 'left', C: ({t}) => <Paper>
		<Circle x={250} y={1150} r={220} c={BLUE} t={t} a={0.1} />
		<Circle x={780} y={1150} r={260} c={RED} t={t} a={0.2} />
		<Ground y={1760} t={t} a={0.0} />
		<Fig n="carrick" x={250} y={1760} h={1250} t={t} a={0.0} from="left" />
		<Fig n="bruno" x={680} y={1760} h={1250} t={t} a={0.15} from="right" />
		<Fig n="martinez" x={900} y={1770} h={1230} t={t} a={0.25} from="right" />
		<S x={250} y={300} t={t} a={1.1} size={60} w={440}><B c={BLUE}>vỗ tay</B></S>
		<Arrow id="a3" x1={250} y1={390} x2={250} y2={560} bend={0.15} t={t} a={1.3} />
		<S x={790} y={300} t={t} a={2.5} size={60} w={440}><B c={RED}>la ó</B></S>
		<Arrow id="a4" x1={790} y1={390} x2={780} y2={560} bend={-0.15} t={t} a={2.7} />
	</Paper>},
	{a: 27.04, b: 29.72, trans: 'left', C: ({t, d}) => <AbsoluteFill style={zoomInto(0, t, d)}><Suspects t={t} d={d} fill={[0, 0, 0]} /></AbsoluteFill>},
	{a: 29.72, b: 38.63, trans: 'zoom', C: ({t}) => <Paper>
		<FromCircle t={t} c={RED} x={300} y={1200} r={260} />
		<Ground y={1780} t={t} a={0.4} />
		<S x={540} y={130} t={t} a={0.5} size={44}>nghi phạm #1</S>
		<S x={540} y={190} t={t} a={0.7} size={88}><B>huấn luyện viên</B></S>
		<Fig n="carrick" x={280} y={1780} h={1300} t={t} a={0.3} from="up" />
		<Fig n="bruno" x={760} y={1780} h={1500} t={t} a={2.6} from="right" out={6.0} />
		<S x={60} y={330} t={t} a={3.3} size={52} w={560} align="left" out={6.0}>chất vấn<br /><B c={RED}>chiến thuật</B></S>
		<Arrow id="a5" x1={250} y1={470} x2={280} y2={560} bend={0.3} t={t} a={3.6} out={6.0} />
		<S x={760} y={900} t={t} a={6.3} size={50} w={560}>trận sau:<br /><B c={RED}>ngồi ngoài</B></S>
		<Arrow id="a6" x1={760} y1={1050} x2={800} y2={1560} bend={-0.25} t={t} a={6.6} />
	</Paper>},
	{a: 38.63, b: 40.9, trans: 'cut', C: ({t, d}) => <AbsoluteFill style={zoomInto(1, t, d)}><Suspects t={t + 3} d={d + 3} fill={[-1, 0, 0]} /></AbsoluteFill>},
	{a: 40.9, b: 49.77, trans: 'zoom', C: ({t}) => <Dark>
		<FromCircle t={t} c={BLUE} x={540} y={1250} r={330} />
		<S x={540} y={230} t={t} a={0.4} size={48} c="#ddd">nghi phạm #2</S>
		<S x={540} y={300} t={t} a={0.6} size={96} c="#fff"><B>các cầu thủ</B></S>
		<Fig n="bruno" x={380} y={1920} h={2000} crop={0.62} t={t} a={0.3} from="left" />
		<Fig n="martinez" x={730} y={1920} h={2000} crop={0.62} t={t} a={0.45} from="right" />
		<div style={{position: 'absolute', left: 110, top: 520, fontFamily: MONO, fontSize: 28, letterSpacing: 4, color: '#999', opacity: E(t, 1.0, 1.4) * (1 - E(t, 5.6, 5.9))}}>SPORTS ILLUSTRATED</div>
		<S x={110} y={570} t={t} a={1.2} size={62} c="#fff" align="left" w={860} out={5.6}>phòng thay đồ <B c="#ff6b6b">“mất kiểm soát”</B></S>
		<div style={{position: 'absolute', left: 110, top: 520, fontFamily: MONO, fontSize: 28, letterSpacing: 4, color: '#999', opacity: E(t, 6.0, 6.4)}}>CARRICK · 23/10</div>
		<S x={110} y={570} t={t} a={6.1} size={62} c="#fff" align="left" w={860}>“nó <B>không</B> bị chia rẽ.”</S>
	</Dark>},
	{a: 49.77, b: 52.98, trans: 'cut', C: ({t, d}) => <AbsoluteFill style={zoomInto(2, t, d)}><Suspects t={t + 3} d={d + 3} fill={[-1, -1, 0]} /></AbsoluteFill>},
	{a: 52.98, b: 59.16, trans: 'zoom', C: ({t}) => <Paper>
		<FromCircle t={t} c={RED} x={780} y={1200} r={280} />
		<Ground y={1780} t={t} a={0.4} />
		<S x={540} y={130} t={t} a={0.3} size={44}>nghi phạm #3</S>
		<S x={540} y={190} t={t} a={0.5} size={88}><B>ban lãnh đạo</B></S>
		<Fig n="wilcox" x={790} y={1780} h={1300} t={t} a={0.2} from="up" />
		<Fig n="martinez" x={270} y={1780} h={1300} t={t} a={0.9} from="left" />
		<S x={540} y={350} t={t} a={2.4} size={50} w={760}>không mua <B c={RED}>đủ người</B></S>
		<Arrow id="a7" x1={330} y1={760} x2={690} y2={760} bend={-0.25} t={t} a={2.0} />
	</Paper>},
	{a: 59.16, b: 63.51, trans: 'left', C: ({t}) => <Dark>
		<Stat x={110} y={420} label="Tân binh hè 2026" val="3" t={t} a={0.3} />
		<Stat x={110} y={600} label="Tổng chi phí" val={`£${Math.round(150 * E(t, 0.9, 2.0))}m`} t={t} a={0.8} c="#ffd54f" />
		<S x={110} y={830} t={t} a={1.0} size={40} c="#aaa" align="left" w={860}>Baleba · Tielemans · Andrey Santos</S>
		<S x={540} y={1150} t={t} a={2.4} size={72} c="#fff">chưa tạo ra <B c="#ff6b6b">khác biệt</B></S>
	</Dark>},
	{a: 63.51, b: 70.64, trans: 'left', C: ({t}) => <Paper>
		<Circle x={300} y={1200} r={240} c={BLUE} t={t} a={0.1} />
		<Circle x={790} y={1200} r={240} c={RED} t={t} a={2.9} />
		<Ground y={1780} t={t} a={0.0} />
		<Fig n="carrick" x={290} y={1780} h={1300} t={t} a={0.0} from="left" />
		<Fig n="wilcox" x={800} y={1780} h={1300} t={t} a={2.8} from="right" />
		<div style={{position: 'absolute', left: 60, top: 260, fontFamily: MONO, fontSize: 26, letterSpacing: 4, color: '#666', opacity: E(t, 0.5, 0.9)}}>ROUNDTABLE · 14/10</div>
		<S x={60} y={310} t={t} a={0.7} size={54} align="left" w={480}>cầu thủ <B c={BLUE}>ủng hộ</B></S>
		<Arrow id="a8" x1={250} y1={400} x2={290} y2={560} bend={0.2} t={t} a={1.1} />
		<S x={1020} y={430} t={t} a={3.4} size={50} align="right" w={560}>cấp trên: ông đã<br /><B c={RED}>mất phòng thay đồ</B></S>
		<Arrow id="a9" x1={640} y1={570} x2={400} y2={660} bend={-0.3} t={t} a={4.4} c={RED} />
	</Paper>},
	{a: 70.64, b: 75.25, trans: 'up', C: ({t}) => <Paper>
		<Circle x={720} y={1150} r={300} c={RED} t={t} a={0.1} />
		<Ground y={1780} t={t} a={0.0} />
		<Fig n="neville" x={700} y={1780} h={1400} t={t} a={0.0} from="right" />
		<div style={{position: 'absolute', left: 60, top: 300, fontFamily: MONO, fontSize: 26, letterSpacing: 4, color: '#666', opacity: E(t, 0.4, 0.8)}}>GARY NEVILLE · SKY SPORTS</div>
		<S x={60} y={350} t={t} a={0.7} size={62} align="left" w={560}>“không thể lại <B c={RED}>chỉ</B> là lỗi của HLV”</S>
	</Paper>},
	{a: 75.25, b: MU2_DUR, trans: 'left', C: ({t}) => <Suspects t={t + 3} d={99} fill={[-1, -1, -1]} ask />},
];

const Trans: React.FC<{kind: Shot['trans']; u: number; children: React.ReactNode; isIn: boolean}> = ({kind, u, children, isIn}) => {
	let tr = '';
	if (kind === 'left') tr = isIn ? `translateX(${(1 - u) * 1080}px)` : `translateX(${-u * 1080}px)`;
	if (kind === 'up') tr = isIn ? `translateY(${(1 - u) * 1920}px)` : `translateY(${-u * 1920}px)`;
	const blur = (kind === 'left' || kind === 'up') ? Math.sin(u * Math.PI) * 8 : 0;
	return <AbsoluteFill style={{transform: tr, filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>;
};

export const MU2Video: React.FC = () => {
	const f = useCurrentFrame(), t = f / 30;
	const TD = 0.45;
	const i = Math.max(0, SHOTS.findIndex((s) => t >= s.a && t < s.b));
	const cur = SHOTS[i], nxt = SHOTS[i + 1];
	const inTrans = nxt && (nxt.trans === 'left' || nxt.trans === 'up') && t > nxt.a - TD;
	const u = inTrans ? E(t, nxt.a - TD, nxt.a, Easing.inOut(Easing.cubic)) : 0;
	const Cur = cur.C, Nxt = nxt?.C;
	return <AbsoluteFill style={{background: '#000'}}>
		<svg width={0} height={0} style={{position: 'absolute'}}><defs><filter id="rough"><feTurbulence baseFrequency="0.035" numOctaves="2" seed="4" /><feDisplacementMap in="SourceGraphic" scale="9" /></filter></defs></svg>
		<AbsoluteFill style={{transform: `translate(${Math.sin(t * 1.2) * 4}px,${Math.cos(t * 0.9) * 4}px) scale(1.012)`}}>
			<Trans kind={nxt?.trans ?? 'cut'} u={u} isIn={false}><Cur t={t - cur.a} d={cur.b - cur.a} /></Trans>
			{inTrans && Nxt && <Trans kind={nxt.trans} u={u} isIn><Nxt t={t - nxt.a} d={nxt.b - nxt.a} /></Trans>}
		</AbsoluteFill>
		<div style={{position: 'absolute', left: 40, bottom: 40, fontFamily: MONO, fontWeight: 700, fontSize: 30, color: '#fff', mixBlendMode: 'difference'}}>90+</div>
		<AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'multiply'}}><Img src={staticFile(`tex/noise${Math.floor(f / 3) % 4}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
		<AbsoluteFill style={{background: '#000', opacity: E(t, MU2_DUR - 1.2, MU2_DUR - 0.1)}} />
		<Audio src={staticFile('mu/mix2.wav')} />
	</AbsoluteFill>;
};
