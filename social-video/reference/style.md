# Style: tấm bảng vô tận

Tham chiếu sống: `template/src/examples/FptBoard.tsx` (video `fpt-board-v4.mp4`). Khi phân vân, làm giống tập mẫu.

## Không gian
- Một tấm bảng duy nhất, **không cắt cảnh**. Mỗi ý là một "trạm" (`P[i]`), cách nhau ~1900 px theo trục y, x lệch ±150–250 (zigzag).
- Camera đi theo **đường chấm** nối các trạm (`Dots`, vẽ dần khi camera di chuyển). Di chuyển ~0.5–0.7 s, đến nơi thì drift nhẹ (zoom 1.0 → 1.06).
- Camera dùng spline đơn điệu, zoom nội suy theo log. Không zoom-out toàn cảnh ở cuối (anh không thích).
- 3 lớp: nền (vân sóng parallax 0.35, nhiễu hạt), bảng (nội dung), tiền cảnh (mảnh giấy / số / đốm sáng, parallax 1.55, blur 5 px).

## Màu
- Nền than `#121110`, kem `#efe2c4`, đỏ `#d6362b`, cam `#f28a1e`, xanh `#48d597`, xám `#a59c8a`.
- **Tint theo chương** (`TINT`): mặc định than; chương đặc biệt đổi tint (đỏ đô cho "Mặt khác"/rủi ro, xanh rêu cho công nghệ/tăng trưởng, nâu giấy cho hợp đồng/tài liệu).
- Màu nhấn theo mảng của kênh (config `accent`): chứng khoán cam, BĐS đỏ gạch, vĩ mô xanh.

## Chữ
- Inter 800–900, in hoa, letter-spacing âm. Số liệu **in nghiêng**, cỡ 100–200. Nhãn phụ 30–40, không in hoa.
- Chữ xoay dọc (rot ±90) cho tiêu đề chương. Tag nền màu (`Tag`) cho % tăng/giảm.
- Số đếm lên (`Count`) khi xuất hiện. Mỗi lần hiện chữ: pop (back easing) hoặc trượt 60–80 px, 9 frame.
- **Chữ trên màn hình không dùng phiên âm** ("AI", không "Ây Ai").

## Hình
- Cutout ảnh tách nền: sepia (`SEPIA`) cho vật/toà nhà, trắng đen (`BW`) cho người. Băng dính (`Tape`) dán lên 1–2 cutout mỗi video.
- **Biểu đồ so sánh**: không dùng thanh xám phẳng. Biến thanh thành vật của chủ đề (đường ray + tàu cho metro, cột nhà cho BĐS…), dài gần hết khung, số ở đầu thanh, kèm nhãn ý nghĩa ("Hà Nội thấp hơn 42%"), một đường tham chiếu nét đứt xuyên suốt; bỏ lớp báo in mờ phía sau biểu đồ. Mẫu: `Rail` trong `MetroBoard.tsx`.
- Mỗi con số phải có **hình trực quan**: cột so sánh, vòng tròn %, thanh đua, đường tăng trưởng, vật đếm (tờ hợp đồng rơi), mảng màu dâng trong cutout (`Cut fill`).
- Nhấn mạnh **trong bảng**, không đổi toàn màn hình: vệt bút dạ màu xiên sau số, vòng chấm khoanh số, nhãn câu hỏi.
- Lớp chất liệu (`Material`): báo in mờ, dấu góc, số trạm "0x/NN".

## Cấu trúc cố định
- **Logo chính thức** ở `public/brand/` (gốc: `logo-original.png`). Góc trên trái: `logo-icon-dark.png` + `logo-wordline-dark.png` (bản cho nền tối, phần đen đổi sang kem). **Outro** 1.8 s: nền sáng #f7f6f4 mở dạng vòng tròn, `logo-full.png` màu gốc (đen + vàng) hiện dần + vệt sáng lướt qua + "Theo dõi để xem phân tích tiếp". Không tự vẽ lại logo.
- Chương **"Mặt khác"**: tint đỏ đô, tiêu đề dọc đỏ, 2–3 ý, mỗi ý một hình (mũi tên giảm, khung nét đứt, biểu tượng rủi ro).
- Trạm cuối: câu hỏi mở (khoanh từ khoá) → đi theo đường chấm xuống **thẻ tổng kết** 3 dòng + nguồn + "Không phải khuyến nghị đầu tư".
- Không ghi "hình minh hoạ tạo bằng AI" và **không ghi nguồn báo** trong video; nguồn đưa vào phần mô tả bài đăng. Thẻ cuối chỉ giữ "Không phải khuyến nghị đầu tư".

## Âm thanh
- Giọng là xương sống: mỗi câu một file, `LINES` = độ dài thật + 0.25 s.
- Nhạc tự tổng hợp (`scripts/music.py`): A minor ~110 bpm, tăng dần, riser trước mỗi lần chuyển trạm, impact khi đến, hụt nhạc + đập ở khoảnh khắc nhấn mạnh, tự ducking dưới giọng, nhẹ đi ở "Mặt khác".
