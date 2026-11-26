#!/usr/bin/env python3
"""Helpers for a board episode run (stdlib + numpy only).
usage:
  run_helpers.py wc script.json
  run_helpers.py stations script.json voice_dir out_dir [--gap 0.25] [--inner 0.18]
      concatenates per-sentence wavs into one wav per station (st00.wav ...),
      writes out_dir/stations.json: {"lines":[{"id":"st00","dur":..,"sub":[offset of each sentence]}], "total":..}
"""
import json, sys, os, wave, argparse
import numpy as np


def read_wav(p):
    w = wave.open(p)
    sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth()
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16 if sw == 2 else np.int32).astype(np.float32)
    a /= 32768.0 if sw == 2 else 2147483648.0
    if ch == 2:
        a = a.reshape(-1, 2).mean(1)
    return a, sr


def trim(a, sr, thr=0.01):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx):
        return a
    s = max(0, idx[0] - int(0.04 * sr)); e = min(len(a), idx[-1] + int(0.08 * sr))
    return a[s:e]


def save(p, a, sr):
    w = wave.open(p, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()


def cmd_wc(a):
    L = json.load(open(a.script))['lines']
    print('sentences', len(L))
    print('words_display', sum(len(l['text_display'].split()) for l in L))
    print('words_tts', sum(len(l['text_tts'].split()) for l in L))
    for l in L:
        n = len(l['text_display'].split())
        if n < 10 or n > 28:
            print('  len-warn', l['id'], n)


def cmd_stations(a):
    L = json.load(open(a.script))['lines']
    os.makedirs(a.out, exist_ok=True)
    groups = {}
    for l in L:
        groups.setdefault(l['station'], []).append(l['id'])
    res = []
    for st in sorted(groups):
        parts, subs, sr0, t = [], [], None, 0.0
        for k, sid in enumerate(groups[st]):
            x, sr = read_wav(os.path.join(a.voice, sid + '.wav'))
            sr0 = sr0 or sr
            x = trim(x, sr)
            if k:
                parts.append(np.zeros(int(a.inner * sr))); t += a.inner
            subs.append(round(t, 3)); parts.append(x); t += len(x) / sr
        y = np.concatenate(parts)
        name = f'st{st:02d}'
        save(os.path.join(a.out, name + '.wav'), y, sr0)
        res.append({'id': name, 'dur': round(len(y) / sr0, 3), 'sub': subs, 'sentences': groups[st]})
        print(name, round(len(y) / sr0, 2), subs)
    tot = sum(r['dur'] + a.gap for r in res)
    json.dump({'lines': res, 'gap': a.gap, 'total': round(tot, 2)}, open(os.path.join(a.out, 'stations.json'), 'w'), indent=1)
    print('TOTAL', round(tot, 2))


ap = argparse.ArgumentParser(); sp = ap.add_subparsers(dest='cmd', required=True)
p = sp.add_parser('wc'); p.add_argument('script')
p = sp.add_parser('stations'); p.add_argument('script'); p.add_argument('voice'); p.add_argument('out')
p.add_argument('--gap', type=float, default=0.25); p.add_argument('--inner', type=float, default=0.18)
a = ap.parse_args()
{'wc': cmd_wc, 'stations': cmd_stations}[a.cmd](a)
