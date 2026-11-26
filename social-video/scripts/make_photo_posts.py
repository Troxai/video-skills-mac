"""Make 3 FB photo posts (1080x1350) for a run: infographic, quote, video teaser."""
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
run = sys.argv[1]; out = f"{run}/photo_posts"; os.makedirs(out, exist_ok=True)
B, R = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
F = lambda p, s: ImageFont.truetype(p, s)
W, H, BG, GOLD, RED, GREEN, WHITE = 1080, 1350, (14, 20, 32), (232, 184, 60), (226, 72, 72), (64, 190, 120), (240, 240, 240)
def wrap(d, t, f, w):
    lines, cur = [], ""
    for word in t.split():
        if d.textlength(cur + " " + word, font=f) > w and cur: lines.append(cur); cur = word
        else: cur = (cur + " " + word).strip()
    return lines + [cur]
def text(d, xy, t, f, fill, w=960, gap=1.25):
    x, y = xy
    for l in wrap(d, t, f, w): d.text((x, y), l, font=f, fill=fill); y += int(f.size * gap)
    return y
def brand(d): d.text((60, H - 80), "GÓC NHÌN ĐA CHIỀU", font=F(B, 30), fill=GOLD)
# 1 infographic
im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
text(d, (60, 70), "PHIÊN 5/11: HAI CHIỀU NGƯỢC NHAU", F(B, 52), GOLD)
rows = [("VÀNG", "≈ 4.090 USD/oz", "+0,7%", GREEN), ("BITCOIN", "≈ 76.000 USD", "−6%", RED),
        ("CHỈ SỐ BÁN DẪN", "Bán mạnh", "−12%", RED), ("S&P 500", "Giảm sâu", "−4%", RED)]
y = 280
for name, val, pct, c in rows:
    d.rounded_rectangle((60, y, W - 60, y + 180), 24, fill=(26, 34, 52))
    d.text((100, y + 30), name, font=F(B, 40), fill=WHITE); d.text((100, y + 100), val, font=F(R, 36), fill=(180, 190, 205))
    d.text((W - 100, y + 90), pct, font=F(B, 72), fill=c, anchor="rm"); y += 210
text(d, (60, y + 20), "Nguồn: VnExpress, CoinDesk, Kitco. Không phải khuyến nghị đầu tư.", F(R, 26), (150, 160, 175))
brand(d); im.save(f"{out}/1_infographic.jpg", quality=92)
# 2 quote on blurred cover
cv = Image.open(f"{run}/cover.png").convert("RGB").resize((1080, 1920)).crop((0, 285, 1080, 1635))
im = Image.blend(cv.filter(ImageFilter.GaussianBlur(14)), Image.new("RGB", (W, H), BG), 0.6); d = ImageDraw.Draw(im)
d.text((60, 260), "“", font=F(B, 200), fill=GOLD)
y = text(d, (60, 470), "Khi thị trường sợ hãi, bitcoin chạy cùng cổ phiếu công nghệ, chứ không chạy cùng vàng.", F(B, 58), WHITE, gap=1.3)
text(d, (60, y + 40), "Nhãn “vàng kỹ thuật số” đã trượt bài kiểm tra?", F(R, 38), GOLD)
brand(d); im.save(f"{out}/2_quote.jpg", quality=92)
# 3 teaser: cover with band
im = cv.copy(); d = ImageDraw.Draw(im)
d.rectangle((0, H - 330, W, H), fill=BG)
text(d, (60, H - 300), "Bitcoin rơi, vàng tăng: ai mới là nơi trú ẩn?", F(B, 50), WHITE)
d.text((60, H - 150), "▶ Xem video 3 phút trên trang", font=F(B, 34), fill=GOLD)
im.save(f"{out}/3_teaser.jpg", quality=92)
print("ok", out)
