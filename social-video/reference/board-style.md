# Style "Bảng xây dần" (mặc định từ 26/11/2026 — anh duyệt)

Mẫu code (sao file này, không dựng từ FptBoard/MetroBoard nữa):
- `template/src/episodes/2026-11-17-dau-gia-board.tsx` — có BẢN ĐỒ VỆ TINH nền (BĐS, quy hoạch, hạ tầng, bất kỳ chủ đề có địa danh).
- `template/src/episodes/2026-11-19-vang-fed-petro.tsx` — nền đen hạt nhiễu, không bản đồ (tài chính, vàng, lãi suất…).
(bản sao: `$SKILL/assets/template/src/examples/BuildBoardMap.tsx`, `BuildBoard.tsx`; SFX ở `public/sfx/`.)

## Nguyên tắc (anh đã sửa qua nhiều vòng — giữ đúng)
1. KHÔNG phải "mỗi câu 1 hình rồi chuyển" (= slide). Mỗi BẢNG được XÂY DẦN qua 2–5 câu: vật → chữ/số → mũi tên vẽ tay nối → vật thứ 2… mọi thứ Ở LẠI trên màn hình thành 1 sơ đồ nhỏ có quan hệ. ~8–12 bảng / video 3 phút.
2. KHÔNG cắt cứng, KHÔNG cho vật bay ra/bay vào, KHÔNG glitch, KHÔNG đường chấm nối các cảnh. Các bảng nằm trên 1 không gian lớn; chuyển bảng = camera lùi ra + lia (nhịp đổi: lia thường / lia nhanh có nhoè / trôi chậm / lia giật).
3. Trong bảng: camera lấy nét vào phần mới thêm, lùi dần khi bảng đầy, cuối bảng lùi ra thấy cả sơ đồ. Camera PHẢI giữ mọi phần tử đã hiện nằm trong khung (hàm `bounds` + KEYS) — anh bắt lỗi tràn khung.
4. HÌNH MINH HOẠ TO: cutout rộng 500–760 px (khung 1080). Mỗi bảng ít vật nhưng to; đông quá thì tách bảng.
5. Chữ: lật từng ký tự; số chạy đếm (`count: true`); câu nhấn có gạch chân vẽ tay (`under`); chữ tự co theo `w` (fit = w*1.5/len), lề 60 px. Không đặt gì dưới y=1660 (UI TikTok).
6. Thẻ báo (`news`): giấy xé mép + highlight bút dạ đúng cụm đang đọc; ghi "Tóm tắt nội dung bài báo" (không giả ảnh chụp báo).
7. Timeline năm/ngày trên cùng (`tl`) khi câu chuyện có mốc thời gian.
8. Nguồn (`src`) hiện 1 dòng chữ nhỏ cuối bảng.
9. SFX nhẹ: whoosh/whip khi chuyển bảng, click khi chữ hiện, coin khi số đếm, paper/marker cho thẻ báo, thud cho tiêu đề.
10. Không người dẫn.

## Bản đồ vệ tinh (anh 26/11)
- Bản đồ FULL MÀN HÌNH làm NỀN xuyên suốt (`BgMap`): mở bằng toàn vùng (có tên tỉnh/thành) → zoom liền mạch vào địa điểm → ghim + nhãn → bản đồ MỜ + TỐI đi, các bảng xây ngay trên nền đó. Khi lời đọc nhắc địa điểm mới/lần nữa → nét lại, zoom tiếp, ghim, rồi mờ lại (keyframe `MK`, `PINS`).
- Ảnh: `python3 scripts/map_tiles.py <lat> <lon> template/public/episodes/<tập>/map` → wide/mid/close.jpg (z8/z11/z14) + meta.json.
- Luôn ghi "Ảnh vệ tinh: Esri · vị trí khu vực minh hoạ" nếu ghim chỉ là khu vực, không phải đúng thửa/dự án. Toạ độ phải kiểm, không đoán vị trí lô đất cụ thể.

## Quy trình
1. Sau TTS + words.json: gom câu thành bảng (ghi kế hoạch bảng vào log.md).
2. Viết `BOARDS` (mỗi phần tử: `at` câu + `ph` cụm từ trong words.json làm mốc; kiểm cụm có trong words.json — vd "1,468" Whisper nghe thành "1 ,468" → dùng `,468`; số "11" trong ngày tháng dễ khớp nhầm với "1").
3. QC: render đoạn ngắn `RENDER_GL=angle-egl RENDER_RANGE=0-<frame> node scripts/render_episode.mjs <comp> <out>` + scan 1–2 fps, xem tràn khung/chồng chữ/hình nhỏ; rồi mới `render_safe.py` cả bài.
