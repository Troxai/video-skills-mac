import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import '@fontsource/playfair-display/vietnamese-700-italic.css';
import '@fontsource/playfair-display/latin-700-italic.css';
import '@fontsource/playfair-display/vietnamese-900.css';
import '@fontsource/playfair-display/latin-900.css';
import '@fontsource/jetbrains-mono/vietnamese-700.css';
import '@fontsource/jetbrains-mono/latin-700.css';
const RED = '#C62828', INK = '#141414';
export type ThumbProps = {bg?: string; figs: {src: string; x: number; h: number; y?: number}[]; kicker: string; l1: string; l2: string; score?: string; logos?: string[]};
export const Thumb: React.FC<ThumbProps> = ({bg, figs, kicker, l1, l2, score, logos = []}) => <AbsoluteFill style={{background: '#e9e9e7'}}>
	<Img src={staticFile('mz/paper.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, mixBlendMode: 'multiply'}} />
	{bg && <Img src={staticFile(bg)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.12)', transformOrigin: '30% 30%'}} />}
	<div style={{position: 'absolute', left: 540 - 430, top: 820, width: 860, height: 860, borderRadius: '50%', background: RED, opacity: bg ? 0 : 0.9, filter: 'blur(2px)'}} />
	{figs.map((f, k) => <Img key={k} src={staticFile(f.src)} style={{position: 'absolute', left: f.x, bottom: f.y ?? 0, height: f.h, filter: 'drop-shadow(-20px 4px 0 rgba(0,0,0,.3))'}} />)}
	{logos.map((l, k) => <Img key={l} src={staticFile(l)} style={{position: 'absolute', left: k ? 800 : 40, top: 660, width: 240, filter: 'drop-shadow(6px 8px 0 rgba(0,0,0,.25))'}} />)}
	<div style={{position: 'absolute', left: 50, top: 110, width: 980, padding: '30px 36px', background: '#faf8f2', boxShadow: '14px 16px 0 rgba(0,0,0,.25)', borderTop: `12px solid ${RED}`}}>
		<div style={{fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 34, letterSpacing: 4, color: RED}}>{kicker}</div>
		<div style={{fontFamily: 'Playfair Display', fontWeight: 900, fontSize: 112, lineHeight: 1.02, color: INK, marginTop: 10}}>{l1}</div>
		<div style={{fontFamily: 'Playfair Display', fontWeight: 700, fontStyle: 'italic', fontSize: 104, lineHeight: 1.05, color: RED}}>{l2}</div>
		{score && <div style={{fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 80, color: INK, marginTop: 12}}>{score}</div>}
	</div>
	<Img src={staticFile('mu/logo.png')} style={{position: 'absolute', right: 40, bottom: 40, width: 120, borderRadius: '50%'}} />
</AbsoluteFill>;
