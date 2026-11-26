#!/usr/bin/env python3
"""VieNeu batch TTS. usage: tts_batch.py script.json out_dir [--voice "Thanh Bình"] [--style doc_truyen]
script.json: {"lines":[{"id":"n1","text_tts":"..."}, ...]}  -> out_dir/<id>.wav + out_dir/timing.json"""
import json, os, sys, wave, contextlib, argparse, urllib.request
# Mặc định: VieNeu chạy trên máy. Tuỳ chọn TTS_ENGINE=remote + TTS_URL=<dịch vụ TTS HTTP riêng của bạn>
REMOTE = os.environ.get('TTS_ENGINE') == 'remote'
if not REMOTE:
    from vieneu import Vieneu
ap = argparse.ArgumentParser(); ap.add_argument('script'); ap.add_argument('out')
ap.add_argument('--voice', default='Thanh Bình'); ap.add_argument('--style', default='doc_truyen')
ap.add_argument('--only', default='', help='comma ids to regenerate')
a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
lines = json.load(open(a.script))['lines']; only = set(filter(None, a.only.split(',')))
class Remote:
    url = os.environ['TTS_URL']
    def infer(self, text, voice, style):
        req = urllib.request.Request(self.url, json.dumps({'text': text, 'voice': voice, 'style': style}).encode(), {'Content-Type': 'application/json'})
        return urllib.request.urlopen(req, timeout=300).read()
    def save(self, data, p): open(p, 'wb').write(data)
v = Remote() if REMOTE else Vieneu(); timing = []
for L in lines:
    p = os.path.join(a.out, L['id'] + '.wav')
    if not only or L['id'] in only or not os.path.exists(p):
        v.save(v.infer(L['text_tts'], voice=a.voice, style=a.style), p)
    with contextlib.closing(wave.open(p)) as w: d = w.getnframes() / w.getframerate()
    timing.append({'id': L['id'], 'dur': round(d, 3)}); print(L['id'], round(d, 2))
tot = sum(t['dur'] for t in timing)
json.dump({'lines': timing, 'total': round(tot, 2)}, open(os.path.join(a.out, 'timing.json'), 'w'), indent=1)
print('TOTAL', round(tot, 1))
