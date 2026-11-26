#!/usr/bin/env python3
"""Fast + clean render. usage: python3 scripts/render_safe.py <compId> <out.mp4>
1) render twice on the GPU (RENDER_GL=angle-egl, ~5 min each)
2) per-frame PSNR between the two renders -> frames that differ = random compositor ghosting
3) re-render only those frame ranges on CPU (swangle, clean) and overlay them into render A.
Falls back to a full swangle render if too many frames differ."""
import os, sys, subprocess, tempfile, re
comp, out = sys.argv[1], os.path.abspath(sys.argv[2])
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GPU_GL = "angle" if sys.platform == "darwin" else "angle-egl"  # macOS: Metal qua ANGLE
FPS = 30; THRESH = 40.0; PAD = 2; MAX_BAD = 600
tmp = os.environ.get("RSAFE_DIR") or tempfile.mkdtemp(prefix="rsafe-")

def render(dst, gl, rng=None):
    env = dict(os.environ, RENDER_GL=gl)
    if rng: env["RENDER_RANGE"] = f"{rng[0]}-{rng[1]}"
    subprocess.run(["node", "scripts/render_episode.mjs", comp, dst], cwd=ROOT, env=env, check=True,
                   stdout=subprocess.DEVNULL)

a, b = f"{tmp}/a.mp4", f"{tmp}/b.mp4"
for p in (a, b):
    if os.path.exists(p) and os.environ.get("RSAFE_DIR"): continue
    render(p, GPU_GL); print("gpu render ok", p, flush=True)
st = f"{tmp}/psnr.txt"
subprocess.run(["ffmpeg", "-loglevel", "error", "-i", a, "-i", b, "-lavfi", f"[0:v][1:v]psnr=stats_file={st}", "-f", "null", "-"], check=True)
bad = []
for line in open(st):
    n = int(re.search(r"n:(\d+)", line).group(1)) - 1
    v = re.search(r"psnr_avg:(\S+)", line).group(1)
    if v != "inf" and float(v) < THRESH: bad.append(n)
print("differing frames:", len(bad), bad[:30], flush=True)
if not bad:
    os.replace(a, out); print("DONE clean", out); sys.exit(0)
if len(bad) > MAX_BAD:
    print("too many differences -> full CPU render", flush=True)
    render(out, "swangle"); print("DONE swangle", out); sys.exit(0)
rngs = []
for n in sorted(bad):
    s, e = max(0, n - PAD), n + PAD
    if rngs and s <= rngs[-1][1] + 30: rngs[-1][1] = max(rngs[-1][1], e)
    else: rngs.append([s, e])
total = int(float(subprocess.check_output(["ffprobe", "-v", "error", "-count_packets", "-select_streams", "v:0",
          "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", a]).decode().strip().strip(",")))
inputs, segs = ["-i", a], []
rngs = [[s_, min(e_, total - 1)] for s_, e_ in rngs]
cur = 0
for i, (s_, e_) in enumerate(rngs):
    p = f"{tmp}/p{s_}-{e_}.mp4"
    if not (os.path.exists(p) and os.environ.get("RSAFE_DIR")): render(p, "swangle", (s_, e_))
    print("patched", s_, e_, flush=True)
    inputs += ["-i", p]
    if s_ > cur: segs.append(("A", cur, s_))
    segs.append((i + 1, 0, e_ - s_ + 1)); cur = e_ + 1
if cur < total: segs.append(("A", cur, total))
na = sum(1 for x in segs if x[0] == "A")
chain = f"[0:v]split={na}" + "".join(f"[a{k}]" for k in range(na)) + ";" if na > 1 else "[0:v]null[a0];"
k = 0; labs = []
for j, (src, st_, en_) in enumerate(segs):
    if src == "A": inp = f"[a{k}]"; k += 1
    else: inp = f"[{src}:v]"
    chain += f"{inp}trim=start_frame={st_}:end_frame={en_},setpts=PTS-STARTPTS[s{j}];"; labs.append(f"[s{j}]")
chain += "".join(labs) + f"concat=n={len(labs)}:v=1:a=0[vout]"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex", chain,
                "-map", "[vout]", "-map", "0:a?", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "copy", out], check=True)
print("DONE patched", len(rngs), "ranges ->", out)
