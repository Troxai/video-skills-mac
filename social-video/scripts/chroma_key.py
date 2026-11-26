#!/usr/bin/env python3
"""Green-screen key for Flow cutouts. usage: chroma_key.py in.jpg out.png"""
import sys
import numpy as np
from PIL import Image, ImageFilter
a = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
d = g - np.maximum(r, b)
alpha = np.clip(1 - (d - 25) / 45, 0, 1)
m = np.maximum(r, b); g2 = np.where(g > m, m + (g - m) * 0.15, g)   # despill
im = Image.fromarray(np.dstack([r, g2, b, alpha * 255]).astype(np.uint8), 'RGBA')
im.putalpha(im.split()[3].filter(ImageFilter.GaussianBlur(0.8)))
im = im.crop(im.getbbox()); im.save(sys.argv[2]); print(sys.argv[2], im.size)
