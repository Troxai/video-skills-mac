#!/usr/bin/env python3
"""Stitch Esri World_Imagery tiles around a point at 3 zoom levels for the board-style map background.
usage: python3 scripts/map_tiles.py <lat> <lon> <out_dir> [z_wide=8 z_mid=11 z_close=14]
writes wide.jpg / mid.jpg / close.jpg + meta.json (px,py = pixel of the point in each image).
Credit on screen: "Ảnh vệ tinh: Esri"."""
import io, json, math, os, sys, urllib.request
from PIL import Image

U = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

def tile(lat, lon, z):
    n = 2 ** z; r = math.radians(lat)
    return (lon + 180) / 360 * n, (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * n

def stitch(lat, lon, z, R, path):
    cx, cy = tile(lat, lon, z); x0, y0 = int(cx) - R, int(cy) - R; N = 2 * R + 1
    im = Image.new('RGB', (N * 256, N * 256))
    for i in range(N):
        for j in range(N):
            req = urllib.request.Request(U.format(z=z, y=y0 + j, x=x0 + i), headers={'User-Agent': 'map-video'})
            im.paste(Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=30).read())), (i * 256, j * 256))
    im.save(path, quality=88)
    return {'w': im.width, 'h': im.height, 'px': (cx - x0) * 256, 'py': (cy - y0) * 256, 'z': z}

if __name__ == '__main__':
    lat, lon, out = float(sys.argv[1]), float(sys.argv[2]), sys.argv[3]
    zs = [int(x) for x in sys.argv[4:7]] or [8, 11, 14]
    os.makedirs(out, exist_ok=True)
    meta = {n: stitch(lat, lon, z, 3, os.path.join(out, f'{n}.jpg')) for n, z in zip(['wide', 'mid', 'close'], zs)}
    meta['lat'], meta['lon'] = lat, lon
    json.dump(meta, open(os.path.join(out, 'meta.json'), 'w'), indent=1)
    print(json.dumps(meta))
