"""Vertical thumbnail (1080x1920) for a board episode.
usage: make_thumbnail.py bg_frame.png cutout.png out.png "LINE1|LINE2" "sub line" [accent_hex]
Text kept in the top 2/3 (app UI covers the bottom ~260 px)."""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
bg, cut, out, title, sub = sys.argv[1:6]; acc = sys.argv[6] if len(sys.argv) > 6 else "#e3b341"
W, H = 1080, 1920
B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"; BI = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
im = Image.open(bg).convert("RGB").resize((W, H)).filter(ImageFilter.GaussianBlur(10))
im = ImageEnhance.Brightness(im).enhance(0.55)
c = Image.open(cut).convert("RGBA"); c.thumbnail((900, 820))
c = Image.merge("RGBA", (*ImageEnhance.Contrast(c.convert("RGB")).enhance(1.1).split(), c.split()[3]))
im.paste(c, ((W - c.width) // 2, 1000 - c.height // 2 + 120), c)
d = ImageDraw.Draw(im)
def fit(t, font, maxw, size):
    while d.textlength(t, font=ImageFont.truetype(font, size)) > maxw and size > 40: size -= 4
    return ImageFont.truetype(font, size)
y = 170
for i, line in enumerate(title.split("|")):
    f = fit(line, BI, 960, 190)
    w = d.textlength(line, font=f)
    d.text(((W - w) / 2 + 6, y + 8), line, font=f, fill=(0, 0, 0))
    d.text(((W - w) / 2, y), line, font=f, fill=acc if i == 0 else "#efe2c4")
    y += int(f.size * 1.08)
f = fit(sub, B, 940, 64); w = d.textlength(sub, font=f)
pad = 26; box = ((W - w) / 2 - pad, y + 20, (W + w) / 2 + pad, y + 20 + f.size + 2 * pad)
d.rectangle(box, fill="#d6362b"); d.text(((W - w) / 2, y + 20 + pad - 6), sub, font=f, fill="white")
logo = Image.open("template/public/brand/logo-full.png").convert("RGBA"); logo.thumbnail((360, 120))
im.paste(logo, ((W - logo.width) // 2, 1560), logo)
im.save(out); print(out)
