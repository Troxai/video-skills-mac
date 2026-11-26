"""Every-frame contact sheets around each station change of a rendered video.
usage: qc_transitions.py run_dir  (reads run_dir/timing.json, run_dir/final.mp4) -> run_dir/tqc/t_XX.jpg"""
import json, sys, os, subprocess, glob
from PIL import Image
R = sys.argv[1]; out = f"{R}/tqc"; os.makedirs(out, exist_ok=True)
for f in glob.glob(f"{out}/*"): os.remove(f)
st = json.load(open(f"{R}/timing.json"))["lines"]
L = [l["dur"] + 0.25 + (2.6 if i == len(st) - 1 else 0) for i, l in enumerate(st)]
starts = [round(sum(L[:i]) * 30) for i in range(1, len(L))]
for k, s in enumerate(starts):
    a, b = s - 16, s + 8
    subprocess.run(["ffmpeg", "-v", "error", "-i", f"{R}/final.mp4", "-vf",
        f"select='between(n\\,{a}\\,{b})',scale=160:-2,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='%{{n}}':x=2:y=h-18:fontsize=14:fontcolor=yellow:box=1:boxcolor=black",
        "-vsync", "0", f"{out}/f{k:02d}_%03d.png"], check=True)
    fs = sorted(glob.glob(f"{out}/f{k:02d}_*.png")); W, H = Image.open(fs[0]).size
    c = Image.new("RGB", (W * 13, H * 2))
    for i, f in enumerate(fs): c.paste(Image.open(f), ((i % 13) * W, (i // 13) * H))
    c.save(f"{out}/t_{k:02d}.jpg", quality=85)
    for f in fs: os.remove(f)
print(len(starts), "transitions ->", out)
