# Kịch bản 3 phút — phong cách "lập luận bằng số liệu" (720–800 chữ, 32–38 câu, ~2:40–2:55; VieNeu ≈ 4,5 chữ/giây)

Kênh Góc Nhìn Đa Chiều **không có người dẫn** và **không quảng cáo sản phẩm/app nào**. Giọng đọc là người kể chuyện (VieNeu "Thanh Bình", đọc truyện): xưng **"chúng ta"**, gọi người xem là **"bạn"** / **"các bạn"**. Không xưng tên riêng, không "link in bio", không mời tải app, không xin like/share/subscribe.

## Nguyên tắc số 1: góc nhìn trước, khung sau

Mỗi bài phải có **một luận điểm riêng** (1 câu, ghi vào `brief.json` → `thesis`) — điều người xem chưa nghĩ tới về chủ đề hôm nay. Cấu trúc, hook, nhịp đều phục vụ luận điểm đó.
Các kỹ thuật dưới đây là **hộp đồ nghề, không phải khuôn**: mỗi bài chọn những món hợp, không bắt buộc dùng đủ.

**Chống rập khuôn (anh yêu cầu 16/11/2026 — BẮT BUỘC)** — trước khi viết, đọc `script.json` + `log.md` của 7 run gần nhất và:
- Chọn **1 trong 5 kiểu bài** bên dưới, hợp với luận điểm. **Không dùng một kiểu quá 2 lần trong 7 ngày, không dùng cùng kiểu 2 ngày liền.** Ghi vào `script.json` → `structure` (`so`, `timeline`, `doi_dau`, `hoi_dap`, `dong_tien`).
- Không dùng lại công thức hook của 3 bài gần nhất; không lặp nguyên văn câu nối/câu kết của 3 bài gần nhất.
- **Câu kết xoay vòng**: (a) một câu đúc kết sắc, không hỏi; (b) để mở — một dữ kiện/mốc sắp tới người xem nên theo dõi; (c) câu hỏi cho người xem. **Không quá 1/3 số bài kết bằng câu hỏi; cấm mở câu kết bằng "Còn bạn, bạn…" / "Vậy lần tới…".**
- Đổi cả nhịp: không phải bài nào cũng "con số → bóc lớp → Nhưng thực ra → hệ quả".
- Ghi vào log: luận điểm, kiểu bài, công thức hook, kiểu kết.

## 5 kiểu bài (kịch bản + dựng khác nhau)

### 1. `so` — Giải mã một con số
1 con số trung tâm → bóc từng lớp (nó gồm gì, so với gì, ai được/mất) → điểm mấu chốt ở 75–85%. Dựng: bảng số, phép tính chạy, ô nhân quả nối mũi tên (kiểu quen thuộc của kênh).

### 2. `timeline` — Dòng thời gian / câu chuyện một nhân vật hay vụ việc
Mở giữa cao trào (in medias res: "Tháng 3/2022, …"), rồi lùi về đầu, kể theo 4–6 mốc có ngày tháng, mỗi mốc 1 quyết định/bước ngoặt; số liệu đi kèm mốc chứ không dồn thành tràng. Kết bằng điều câu chuyện nói về hiện tại. Dựng: trục thời gian chạy ngang/dọc trên bảng, mốc năm lớn, cutout nhân vật/địa điểm theo từng mốc, ít bảng số.

### 3. `doi_dau` — Đối đầu A vs B
2 đối tượng (vàng vs bitcoin, SJC vs thế giới, gửi tiết kiệm vs trái phiếu, 2 đại gia…) đấu 3–4 "hiệp", mỗi hiệp 1 tiêu chí có số; chốt tỷ số và "phụ thuộc vào ai đang hỏi". Dựng: chia đôi bảng trái/phải, bảng tỷ số hiệp, màu riêng cho mỗi bên.

### 4. `hoi_dap` — Hỏi nhanh, đáp gọn
3–5 câu hỏi người xem thật sự hay hỏi về chủ đề (lấy từ bình luận/tìm kiếm), mỗi câu trả lời 4–7 câu có số; câu hỏi cuối là câu "khó" nhất, chứa insight. Nhịp nhanh, hook chính là câu hỏi số 1. Dựng: thẻ câu hỏi lật/đánh số lớn, chuyển cảnh dứt khoát giữa các câu.

### 5. `dong_tien` — Bản đồ dòng tiền
Tiền chảy từ đâu → qua ai → về đâu (vd tiền gửi → tín dụng → BĐS; ETF → vàng thế giới → giá SJC). 3–5 "trạm" trên dòng chảy, mỗi trạm 1 con số dòng tiền; insight là chỗ tiền bị kẹt/rò rỉ. Dựng: sơ đồ mũi tên có dòng chảy động, độ dày mũi tên theo quy mô, chart động.

> Kiểu dựng mới (2–5) chưa có đủ thành phần trong template: khi lần đầu dùng một kiểu, xây thành phần Remotion cho kiểu đó (giữ tông màu/phông của kênh), lưu vào `template/src` để tái dùng; nếu không kịp trong ngày thì vẫn viết kịch bản đúng kiểu, dựng gần nhất có thể bằng thành phần sẵn có và ghi việc còn thiếu vào log.

### Khung thời lượng chung (mọi kiểu)
Hook 0–12 s · thân bài theo kiểu · insight ở 75–85% · kết 10–20 s. Phần **"Mặt khác"** (2–3 rủi ro/phản biện có nguồn) vẫn bắt buộc, đặt chỗ hợp với kiểu bài.

## Hook — công thức dùng được

1. **Phép tính món hời giả**: "Giả sử bạn mua 1 lượng vàng SJC hôm nay… trên giấy bạn đang lời… nghe cũng ổn, nhưng mang ra tiệm bán lại thì…"
2. **So sánh nghịch lý 2 đối tượng**: A đạt con số cao hơn nhưng thua B. "Vấn đề nằm ở đâu?"
3. **"Thực ra…" + phủ định số đông**: "Thực ra, tiệm vàng không kiếm tiền chủ yếu nhờ chờ giá tăng…"
4. **Hai cảnh trái ngược**: cùng một nơi, sáng người ta xếp hàng mua, chiều xếp hàng bán.
5. **Tỷ lệ gây giật mình**: "Cứ 100 đồng bạn bỏ vào…, có X đồng mất ngay tại quầy."
6. **Cửa sổ khép lại**: "Kiểu kiếm lời A đã hết hiệu quả khi chênh lệch lên tới…"

Mọi con số trong hook **phải là số đã kiểm trong `brief.json`**. Nếu cần ví dụ giả định ("giả sử bạn có 100 triệu"), nói rõ là giả định và chỉ tính từ số đã kiểm.

## Lập luận bằng số liệu

- Mỗi video **9–12 con số đã kiểm** (≥ 2 nguồn), mỗi số có **đơn vị, kỳ và mốc so sánh**. Không đọc con số trơ trọi.
- **Dịch số lớn sang tỷ lệ nhỏ**: "cứ 4 đồng cho vay thì 1 đồng vào bất động sản", "hơn 1/3", "gấp đôi".
- **Tính hộ người xem**: lãi năm → mỗi tháng; chênh lệch % → số tiền mất trên 1 lượng / 10 lượng; giá phải tăng bao nhiêu % để hoà vốn.
- **Ẩn dụ đời thường** cho cơ chế khó (vd "xe chạy đẹp nhưng động cơ đi mượn").
- **Chuỗi lập luận chuẩn**: dữ kiện 1 → đặt cạnh dữ kiện 2 trái ngược ("Nhưng tại sao…?") → chia 2 phía → nhân quả A → B → C → hệ quả cho người xem.
- **Phản biện khách quan**: công nhận lý do hợp lý trước ("Ở thời điểm đó, điều này có lý do…") rồi mới "Chỉ có điều là…".
- Không quá 2 con số phức tạp trong 1 câu; con số thứ hai luôn kèm "tức là…" / "tương đương…".
- Nguồn không đọc dài dòng trong lời thoại; ghi `source_urls` trong brief, trên màn hình hiện nhãn nguồn nhỏ ("Nguồn: SJC, Dân Việt") ở trạm có số. Số chỉ có 1 nguồn → nói "theo X".

## Nhịp và câu chữ

- Văn nói, câu 12–22 chữ, 1 ý/câu. Câu đầu mỗi phần là "cửa" dẫn sang ý mới.
- Tiểu từ văn nói dùng **vừa phải** (tối đa ~1 lần / 3 câu, chỉ "đấy", "đúng không", "nhé"); không dùng "ạ", "nhở", "nhá" dày đặc — giọng đọc là người kể chuyện, không phải vlogger.
- **Câu nối** dùng được:
  - Lật ý: "Thực ra…", "Nhưng…", "Chỉ có điều là…", "Nhưng nhìn từ phía ngược lại…"
  - Tự hỏi tự đáp: "Tức là gì?", "Nghĩa là sao?", "Điều gì xảy ra tiếp theo?"
  - Vào trọng tâm: "Điểm mấu chốt nằm ở đây.", "Nói gọn lại thế này."
  - Gọi chú ý: "Bạn để ý này…", "Thử làm một phép tính…", "Nghe có vẻ ổn, nhưng…"
  - Tóm lại: "Vậy chung quy lại là gì?", "Bức tranh là như thế."
- Từ khoá gây tò mò: biến số, mắt xích, cuộc chơi, bề mặt, phía bên kia quầy, điểm hoà vốn, dòng tiền.
- Không phóng đại ("bùng nổ", "lao dốc") trừ khi số liệu > ±30%. Không hù doạ, không giật tít sai sự thật.

## Ghi chú dựng (cho `visual` mỗi câu)

- Chuỗi nhân quả A → B → C viết thành các ý 3–5 chữ để dựng thành các ô nối mũi tên trên bảng.
- Phép tính ("180 triệu → 2 lượng → bán lại 174 triệu → mất 6 triệu") ghi rõ từng bước để dựng thành phép tính chạy trên bảng.
- Mỗi câu có `visual` mô tả cutout đúng lời thoại (xem SKILL.md mục Ảnh).

## Điều cấm

1. Không khuyên mua/bán tài sản, mã, sàn cụ thể; không dự báo giá mục tiêu. Chỉ phân tích "cuộc chơi đang có lợi cho phía nào".
2. Không công kích chính sách/cơ quan quản lý; giải thích lý do của chính sách trước rồi mới nói điểm cần điều chỉnh.
3. Không con số nào thiếu mốc so sánh; không số chưa kiểm.
4. Không xưng tên người dẫn, không quảng cáo app/sản phẩm, không "link in bio", không xin like/share.
5. **Không đọc "không phải khuyến nghị đầu tư" thành lời.** Câu cuối của lời thoại là câu đúc kết. Dòng miễn trừ chỉ hiện chữ nhỏ ở khung cuối và nằm trong mô tả bài đăng.

## Kỹ thuật trường `text_tts` / `text_display`

- `text_tts`: số viết bằng chữ ("tám nghìn bảy trăm bảy mươi tỷ", "mười hai phẩy bốn phần trăm"), viết tắt phiên âm
  (FPT → "Ép pê tê", AI → "Ây Ai", VN-Index → "Vi en In đếch", USD → "đô la", GDP → "Giê Đê Pê", SJC → "Ét giê xê").
- `text_display`: bản hiển thị gọn (số dùng dấu chấm ngăn nghìn, dấu phẩy thập phân kiểu Việt).

## Kiểm trước khi ghi `script.json`

Bắt buộc:
1. Có `thesis` riêng của bài; mọi phần đều phục vụ luận điểm đó.
2. Hook ≤ 12 s, khác công thức với bài ngay trước; không mở bằng câu đã dùng 2 bài gần nhất.
3. 9–12 số đã kiểm, mỗi số có đơn vị + kỳ + mốc so sánh; ≤ 2 số phức tạp/câu; ≥ 2 phép "dịch số".
4. Có phần "Mặt khác" 2–3 ý có nguồn.
5. Có đoạn quy về tiền/quyết định của người xem (diễn đạt mới).
6. Kết bằng câu đúc kết gắn luận điểm; **không đọc câu miễn trừ đầu tư**; không CTA, không tên người dẫn, không app.
7. Không lặp nguyên văn câu nối/câu kết của 3 bài gần nhất.
8. 720–800 chữ, 32–38 câu; tiểu từ văn nói ≤ 1 lần / 3 câu.
9. Mỗi câu có `visual` cụ thể (hình/số/chữ sẽ hiện khi câu đó bắt đầu đọc).

Nên có (chọn theo bài, không bắt buộc): câu hỏi treo giữa bài, chia 2 phía, chuỗi nhân quả A → B → C, ẩn dụ đời thường, insight đặt ở 75–85% thời lượng.
