#!/usr/bin/env python3
"""Word-level timestamps for each TTS sentence, so visuals can appear exactly when a word is spoken.
usage: ~/whisper-venv/bin/python scripts/word_times.py runs/.../voice/   -> runs/.../voice/words.json
words.json: {"s01": [{"w": "một", "t": 0.42, "e": 0.61}, ...], ...}   (t/e = seconds from the start of that sentence's wav)
In the episode .tsx use W('s02', 'năm trăm') -> frame when that phrase starts (falls back to sentence start)."""
import sys, os, json, glob, wave
import numpy as np
import ctypes, site
for sp in site.getsitepackages():  # preload pip-installed CUDA libs (cublas/cudnn) for ctranslate2
    for lib in sorted(glob.glob(os.path.join(sp, "nvidia", "*", "lib", "lib*.so*"))):
        try: ctypes.CDLL(lib, mode=ctypes.RTLD_GLOBAL)
        except OSError: pass
from faster_whisper import WhisperModel
vdir = sys.argv[1]
try:
    m = WhisperModel("large-v3", device="cuda", compute_type="float16")
except Exception:
    m = WhisperModel("medium", device="cpu", compute_type="int8")
def load16k(f):  # avoid PyAV: read wav with stdlib, mono float32 @16 kHz
    with wave.open(f) as w:
        sr, ch, sw, n = w.getframerate(), w.getnchannels(), w.getsampwidth(), w.getnframes()
        a = np.frombuffer(w.readframes(n), dtype={2: np.int16, 4: np.int32}[sw]).astype(np.float32)
    a = a.reshape(-1, ch).mean(1) / (32768.0 if sw == 2 else 2147483648.0)
    if sr != 16000:
        a = np.interp(np.arange(0, len(a), sr / 16000), np.arange(len(a)), a).astype(np.float32)
    return a
out = {}
for f in sorted(glob.glob(os.path.join(vdir, "*.wav"))):
    sid = os.path.splitext(os.path.basename(f))[0]
    if not sid.startswith("s"): continue
    segs, _ = m.transcribe(load16k(f), language="vi", word_timestamps=True, vad_filter=False, beam_size=1)
    out[sid] = [{"w": w.word.strip().lower(), "t": round(w.start, 3), "e": round(w.end, 3)} for s in segs for w in s.words]
    print(sid, len(out[sid]), "words")
json.dump(out, open(os.path.join(vdir, "words.json"), "w"), ensure_ascii=False, indent=0)
print("WROTE", os.path.join(vdir, "words.json"))
