#!/usr/bin/env python3
"""Series helper (5 cực, 11/2026). usage:
  series_build.py prep  <run> <ep>                  words(shifted)+station wav+timing → public/episodes/<ep>, chroma-key images
  series_build.py tsx   <run> <ep> <Comp> <endSid> <tint,csv>   world.tsx.part → template/src/episodes/<ep>.tsx + Root.tsx
  series_build.py music <run> <ep> <calmFrom> <calmTo>          (station indices, calm = Mặt khác)
  series_build.py frames <run>                       QC frame list (start+0.5 s of every sentence)
  series_build.py thumbs <run> <topic> <line1> <line2> <pick>            text on t1..t3 → s1..s3, thumbnail.jpg = s<pick> (watermark covered)
"""
import glob, json, os, re, shutil, subprocess, sys, wave
import numpy as np
H = os.path.expanduser('~/goc-nhin')
cmd, run = sys.argv[1], sys.argv[2].rstrip('/')
R = f'{H}/{run}'

def trim_start(p, thr=0.01):
    w = wave.open(p); sr, sw, ch = w.getframerate(), w.getsampwidth(), w.getnchannels()
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16 if sw == 2 else np.int32).astype(np.float32)
    a /= 32768.0 if sw == 2 else 2147483648.0
    if ch == 2: a = a.reshape(-1, 2).mean(1)
    idx = np.where(np.abs(a) > thr)[0]
    return 0.0 if not len(idx) else max(0, idx[0] - int(0.04 * sr)) / sr

if cmd == 'prep':
    ep = sys.argv[3]; OUT = f'{H}/template/public/episodes/{ep}'; os.makedirs(f'{OUT}/img', exist_ok=True)
    W = json.load(open(f'{R}/voice/words.json')); adj = {}
    for sid, ws in W.items():
        o = trim_start(f'{R}/voice/{sid}.wav')
        adj[sid] = [{'w': x['w'], 't': round(max(0, x['t'] - o), 3), 'e': round(max(0, x['e'] - o), 3)} for x in ws]
    json.dump(adj, open(f'{OUT}/words.json', 'w'), ensure_ascii=False)
    shutil.copy(f'{R}/stations/stations.json', f'{H}/template/src/episodes/{ep}.timing.json')
    shutil.copy(f'{R}/stations/stations.json', f'{R}/timing.json')
    for f in glob.glob(f'{R}/stations/st*.wav'): shutil.copy(f, OUT)
    for src in sorted(glob.glob(f'{R}/images/b*_0.jpg')):
        k = os.path.basename(src)[:-6]
        subprocess.run(['python3', f'{H}/scripts/chroma_key.py', src, f'{OUT}/img/{k}.png'], check=True, capture_output=True)
    print('prep ok', ep)

elif cmd == 'tsx':
    ep, comp, end, tint = sys.argv[3:7]
    SRC = f'{H}/template/src/episodes/2026-11-16-quy-hoach-100.tsx'
    L = open(SRC).read().split('\n')
    i0 = next(i for i, l in enumerate(L) if l.startswith('      {/* 0 —'))
    i1 = next(i for i in range(len(L) - 1, 0, -1) if L[i].strip() == '</>' and i < len(L) - 50)
    s = '\n'.join(L[:i0]) + '\n' + open(f'{R}/world.tsx.part').read() + '\n' + '\n'.join(L[i1:])
    s = s.replace('2026-11-16-quy-hoach-100', ep).replace('export const QuyHoach100', f'export const {comp}')
    s = s.replace('runs/2026-11-16/goc-nhin-da-chieu-2', run)
    s = re.sub(r"const END = S\('s\d+', DUR\.s\d+ \+ 0\.2\);", f"const END = S('{end}', DUR.{end} + 0.2);", s)
    s = re.sub(r"const TINT = \[.*?\];", 'const TINT = [' + ', '.join(f"'{t}'" for t in tint.split(',')) + '];', s, flags=re.S)
    open(f'{H}/template/src/episodes/{ep}.tsx', 'w').write(s)
    RT = f'{H}/template/src/Root.tsx'; r = open(RT).read()
    if f'{{{comp},' not in r:
        tag = 'T_' + re.sub(r'\W', '_', ep)
        r = r.replace("import {QuyHoach100,", f"import {{{comp}, TOTAL as {tag}}} from './episodes/{ep}';\nimport {{QuyHoach100,", 1)
        r = r.replace('    <Composition id="2026-11-16-quy-hoach-100"', f'    <Composition id="{ep}" component={{{comp}}} durationInFrames={{{tag}}} fps={{30}} width={{1080}} height={{1920}} />\n    <Composition id="2026-11-16-quy-hoach-100"', 1)
        open(RT, 'w').write(r)
    print('tsx ok', ep)

elif cmd == 'music':
    ep, a, b = sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
    st = json.load(open(f'{R}/stations/stations.json'))['lines']
    lines = [{'id': l['id'], 'dur': l['dur'] + (2.6 if i == len(st) - 1 else 0)} for i, l in enumerate(st)]
    starts = []; t = 0
    for l in lines: starts.append(t); t += l['dur'] + 0.25
    calm = [[round(starts[a], 2), round(starts[b], 2)]]
    json.dump({'lines': lines, 'gap': 0.25, 'outro': 1.8, 'calm': calm}, open(f'{R}/music_episode.json', 'w'))
    subprocess.run(['python3', f'{H}/scripts/music.py', f'{R}/music_episode.json', f'{R}/stations',
                    f'{H}/template/public/episodes/{ep}/music.wav', f'{R}/mix.wav'], check=True, capture_output=True)
    print('music ok total', round(t + 1.8, 2))

elif cmd == 'frames':
    st = json.load(open(f'{R}/timing.json'))['lines']; t = 0; fr = []
    for i, l in enumerate(st):
        for o in l['sub']: fr.append(round((t + o + 0.5) * 30))
        t += l['dur'] + 0.25 + (2.6 if i == len(st) - 1 else 0)
    fr.append(round((t - 0.5) * 30)); print(','.join(map(str, fr)))

elif cmd == 'thumbs':
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    topic, l1, l2, pick = sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6]
    FONT = (glob.glob('/usr/share/fonts/**/NotoSans-CondensedBlack.ttf', recursive=True) +
            glob.glob(f'{H}/**/NotoSans-CondensedBlack.ttf', recursive=True))[0]
    W_, H_ = 1080, 1920
    for k in (1, 2, 3):
        im = Image.open(f'{R}/thumbs/t{k}_0.jpg').convert('RGB')
        s = max(W_ / im.width, H_ / im.height); im = im.resize((round(im.width * s), round(im.height * s)))
        im = im.crop(((im.width - W_) // 2, (im.height - H_) // 2, (im.width - W_) // 2 + W_, (im.height - H_) // 2 + H_))
        patch = im.crop((760, 1730, 880, 1860)); im.paste(patch, (880, 1730))
        im.paste(im.crop((840, 1700, 1080, 1900)).filter(ImageFilter.GaussianBlur(6)), (840, 1700))
        d = ImageDraw.Draw(im)
        def fit(t, size, maxw=980):
            while d.textlength(t, font=ImageFont.truetype(FONT, size)) > maxw: size -= 6
            return ImageFont.truetype(FONT, size)
        y = int(H_ * 0.13)
        ft = fit(topic, 84, 900); tw = d.textlength(topic, font=ft)
        d.rectangle(((W_ - tw) / 2 - 28, y - 10, (W_ + tw) / 2 + 28, y + ft.size * 1.18), fill='#d6362b')
        d.text(((W_ - tw) / 2, y), topic, font=ft, fill='#ffffff')
        y += int(ft.size * 1.5)
        for t, f, c in ((l1, fit(l1, 150), '#ffffff'), (l2, fit(l2, 230), '#ffd21f')):
            d.text(((W_ - d.textlength(t, font=f)) / 2, y), t, font=f, fill=c, stroke_width=max(8, f.size // 16), stroke_fill='black')
            y += int(f.size * 1.12)
        im.save(f'{R}/thumbs/s{k}.jpg', quality=92)
    shutil.copy(f'{R}/thumbs/s{pick}.jpg', f'{R}/thumbnail.jpg'); print('thumbs ok, picked', pick)
