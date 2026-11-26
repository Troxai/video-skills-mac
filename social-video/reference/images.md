# Ảnh minh hoạ bằng Muse (muse.ai)

Script: `node scripts/muse_generate.mjs prompts.json runs/.../images` (Chrome profile `~/.config/chrome-muse` đã đăng nhập, màn hình :99). Gửi tất cả prompt cùng lúc, mỗi prompt 1 chat → `<id>_0.jpg` 1152×2048, ~1 phút cả bộ. Tự thêm "Tạo ảnh · tỷ lệ 9:16 dọc" ở đầu và "không chữ, không logo, không watermark" ở cuối (trừ prompt có `"raw": true`). Cuối lượt in `QUOTA used x%` (gói Free theo tuần; hết thì trừ credit nạp thêm). Exit 3 = cần đăng nhập lại; exit 2 = có ảnh thiếu.

## Prompt (tiếng Việt hoặc Anh, luôn kèm khung chung)
Khung chung: `Vertical 9:16 cinematic editorial documentary photograph, 35mm lens, natural realism, subtle film grain. No readable text, no letters, no numbers, no logos, no signage, no watermark.`

- **Cutout (dùng nhiều nhất)**: `Only the main subject: <người/vật>, <hành động>, full body/full object visible. Isolated on a plain flat pure chroma green background (#00FF00), no environment, no floor shadow, no text, no logo.`
  → `python3 scripts/chroma_key.py in.jpg out.png` (khoá xanh + khử loang + crop). Kiểm tóc, tay, cạnh.
- Người: chỉ nhân vật minh hoạ chung (nhà đầu tư, kỹ sư, lãnh đạo doanh nghiệp, người mua nhà). **Không** tạo người thật, không logo.
- Vật: toà nhà, căn hộ, nhà phố, hợp đồng, tiền giấy chung chung, container, nhà máy, bản đồ trơn.
- **Không dùng ảnh nguyên tấm / ảnh cảnh có phông.** Mọi ảnh đều là cutout. Muốn có bối cảnh thì đưa vật thể vào chủ thể: `Only the main subject: a Vietnamese woman handing cash across a small glass gold shop counter with a digital scale, ...` trên nền #00FF00.
- Phong cách được chuyển sang sepia/trắng đen trong Remotion, nên ánh sáng tự nhiên là đủ.

## Thư viện
Ảnh tốt sau khi tách nền → copy vào `template/public/library/` và thêm vào `library.json` (`file`, `tags`, `kind: person|building|object`).
Mỗi video tạo mới 8–12 ảnh cutout đúng câu từng trạm; không dùng lại ảnh nhân vật cũ. Thư viện chỉ cho logo kênh hoặc khi Muse lỗi.

## Khi Muse lỗi
Exit 3 (hết phiên) → báo Telegram "Muse cần đăng nhập lại" (anh đăng nhập qua VNC :99, profile chrome-muse). Muse đổi giao diện (`not_ready`, SEND_FAIL hàng loạt) → không thử quá 2 lần, dùng ảnh thư viện, báo Telegram. Phần nói chuyện với Muse nằm ở `scripts/vendor/muse-page.cjs` (lấy từ CodeMuseTool).
