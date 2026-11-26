---
name: "90plus-video-cutout-poster"
description: "Dựng video bóng đá kênh 90+ (16:9 bản dài + 9:16 Shorts) kiểu MEZZALA: nghiên cứu báo, kịch bản có nguồn, giọng Hải Đăng, nhân vật poster đỏ–đen từ Flow, Remotion nền giấy, mũi tên chấm."
---

# Video 90+ · phong cách cutout poster 

Người dùng xưng "anh", gọi Claude là "em". Kênh: **90+ · Bên kia bảng tỷ số**. Video phân tích / kể chuyện bóng đá.

## 0-mac. Chạy trên macOS
Xem `SETUP_MAC.md` ở gốc repo. Khác VPS: không cần Xvfb (Chrome mở thật), render `--gl=angle`, rembg cài bằng `pipx install rembg` → gọi `rembg` thay cho `~/rembg-venv/bin/rembg`, `config/env` đặt `CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`. Bỏ qua mục "GPU dùng chung" nếu máy chỉ chạy 1 kênh.

## 0. Môi trường VPS (agent 90P, thư mục ~/90plus) — đọc trước, thay cho các bước dùng trình duyệt ở dưới
- Đường dẫn trong skill: `90-plus/…` = `~/90plus/…` trên VPS. Có sẵn: `template/` (MUL/MU2/MUT/MUV/MUI.tsx, sfx), `anh-that/` (thư viện ảnh + `_cutout/`), `10_KHUNG_SUON_SCRIPT.md`, `mau-giong/TU_DIEN_PHIEN_AM.md`.
- Dự án Remotion: `~/90plus/remotion` (đã cài, `npx tsc` sạch). Video mới: copy `src/MUL.tsx` → `src/<EP>.tsx`, thêm Composition trong `src/Root.tsx`, ảnh vào `public/<ep>/`. Render: `npx remotion render <ID> out/<ep>.mp4 --gl=angle-egl` (Linux NVIDIA) hoặc `--gl=angle` (macOS).
- Kịch bản/nháp: `~/90plus/<chu-de>/`. Gửi anh duyệt qua Telegram (reply kèm file), không có SendUserFile/device_commit_files.
- Giọng (VieNeu cài trên máy, giọng "Hải Đăng", style doc_truyen): `~/VieNeu-TTS/.venv/bin/python scripts/tts_build.py <script.md> <thu_muc> <phon.json>` — tự gọi VieNeu từng câu, cắt lặng, nối 0,32s, atempo 1.15 → `voice.wav` + `timeline.json`.
- Ảnh Flow: `node scripts/flow_generate.mjs prompts.json <thu_muc>` (prompts.json = `[{"id","prompt"}]`; script tự thêm khung "cinematic photograph" — với poster đỏ–đen hãy viết tiền tố poster ngay trong prompt). Tỉ lệ: `FLOW_RATIO=16:9` cho cảnh nền, mặc định 9:16 cho nhân vật/đạo cụ (trong config/env). Mỗi prompt ra `<id>_0.jpg`, `<id>_1.jpg`. Exit 3 = cần đăng nhập Google → báo anh; exit 4 = giao diện Flow đổi; exit 2 = chạy lại cùng lệnh. KHÔNG chạy 2 lệnh flow cùng lúc. Profile `~/.config/chrome-flow-90p` dùng chung tài khoản Google với GNDC/BMD.
- Tách nền: `~/rembg-venv/bin/rembg i -m u2net in.png out.png` (sau khi phóng ×2 Lanczos); có `scripts/chroma_key.py` nếu nền trơn.
- Logo ✦ của Flow ở góc dưới phải: crop `crop=iw*0.94:ih*0.94:0:0` hoặc scale như mục 4.
- GPU dùng chung: KHÔNG render nặng 15:00–20:00 (giờ của GNDC) và khi BMD đang render; xem trước `--scale=0.5`.
- Đăng bài (sau khi anh duyệt): `python3 scripts/publish_youtube.py <video> <post.json>` và `python3 scripts/publish_facebook.py <video> <post.json> [reel|video]` (tự đọc `~/90plus/secrets`, không in token). Kiểm key: `python3 scripts/check_auth.py`.

## 0b. Môi trường gốc (máy Mac, tham khảo)
- Thư mục máy anh: `~/mnt/90-plus/` (device_bash). Khuôn mẫu Remotion: `90-plus/template/` (`MUL.tsx` = bản dài 16:9, `MU2.tsx` = bản 9:16, `Root.tsx`, `sfx_lib.py`, `sfx_mix.py`, `paper.jpg`, `logo.png`). Stage lên container, dựng ở `/home/claude/p90` (Remotion có sẵn, `@fontsource/playfair-display`, `@fontsource/jetbrains-mono`, rembg).
- Thư viện ảnh: `90-plus/anh-that/` → `minh-hoa/` (ảnh gốc Flow), `canh/` (cảnh nền 16:9 + đạo cụ), `_cutout/<ten>_full.png` (đã tách nền). Dùng lại trước khi tạo mới. Ghi người còn thiếu vào `anh-that/CAN_BO_SUNG.md`.
- Dịch vụ web qua built-in browser: `flow.google.com` (Flow, model Nano Banana 2.1).

## 1. Nghiên cứu (luôn làm TRƯỚC mọi thứ)
- Đọc nhiều bài báo về chủ đề (WebSearch + WebFetch), lập bảng sự kiện có nguồn, ghi chỗ mâu thuẫn giữa các nguồn (chọn theo đa số, nói rõ).
- Lời đồn (phòng thay đồ, nội bộ) luôn quy nguồn: "theo SI…", "Roundtable cho biết…". Không kết luận thay người xem; kết bằng câu hỏi.
- Ngay trước khi render bản đăng: kiểm tra lại tin mới nhất (BXH, điểm, tình trạng HLV).

## 2. Kịch bản ★ (gửi anh duyệt)
- File `90-plus/<chu-de>/KICH_BAN_*.md`, bảng `| # | Lời đọc | Hình |`.
- Viết từ góc nhìn của một **nhà phân tích bóng đá**: đọc trận + số liệu + chiến thuật, tự rút ra nhận định của kênh (điều gì thực sự quyết định, vì sao, dư luận đánh giá sai chỗ nào). Đọc thật kỹ bài gốc (chi tiết đắt thường nằm sẵn trong số liệu) + báo nước ngoài (ESPN, Athletic, báo hai quốc gia…).
- Chọn **1 trong 10 khung sườn** hợp với câu chuyện (đầy đủ từng bước + ví dụ trong `90-plus/10_KHUNG_SUON_SCRIPT.md`, học từ 10 video nhiều view). Không lặp khung của video ngay trước; ghi tên khung đã dùng vào đầu file kịch bản.
  1. Đồng xu hai mặt (MEZZALA) — đặc điểm ai cũng nói chung chung.
  2. Chúng ta có đang hiểu sai? (MEZZALA) — cầu thủ bị đánh giá qua 1 con số; mở bằng bảng xếp hạng, "quên" người cuối.
  3. Bác bỏ một câu tuyên bố (HLV Online) — tranh cãi lâu năm; từng giai đoạn = 1 bằng chứng.
  4. Tiểu sử vòng tròn (Spiderum) — cột mốc lớn; kết quay về hình ảnh mở đầu.
  5. Nghịch lý con số (Lóng) — tài chính; chuỗi số leo thang + quy đổi dễ hình dung.
  6. Đế chế trỗi dậy & sụp đổ (SOFA Zone) — triều đại/lối chơi.
  7. Bí ẩn phá luật (Athletic Interest) — thành công trái logic; "không có X, Y, Z… vậy mà"; mảnh ghép 1-2-3.
  8. Cảnh mở đầu như phim (Sam Ellis) — bê bối/ngoài sân; tường thuật cảnh cụ thể rồi khép vòng.
  9. Một người, nhiều phiên bản (MacKelvie) — phong độ đổi theo môi trường; tách từng biến.
  10. Một câu nói mở khoá (Tifo) — giải thích chiến thuật/khái niệm qua một công cụ trung tâm.
- Điểm chung của video nhiều view: câu đầu là thứ cụ thể (số, câu nói, cảnh), không chào · câu hỏi lớn nói trong 30s · tài trợ đặt ngay sau hook · đặt tên cho thứ đang phân tích · kết bằng nhận định của kênh rồi mới hỏi bình luận.
- Trước khi viết cả bài: gửi anh một đoạn ngắn — khung định dùng + nhận định chính + 2–3 bằng chứng + câu hook. Anh đồng ý mới viết.
- Nguyên tắc giữ chân (Tifo + retention): hook bằng 1 sự thật chứng minh tiêu đề trong 10s, không chào, không bối cảnh trước · vòng lặp mở mỗi 30–60s · bất ngờ mới mỗi 20–30s · cú lật mạnh nhất ở ~2/3 · mọi con số phải có ngữ cảnh so sánh · không tin đồn · một thông điệp duy nhất · viết như nói.
- Hình phân tích phải ĐA DẠNG theo nội dung, không lặp một kiểu: thanh so sánh 2 phía, bản đồ nhiệt, vị trí trung bình động, bản đồ dứt điểm, đường việt vị động, sơ đồ đội hình + thay người, dòng thời gian lỗi (xem `src/BM8.tsx`). Vị trí minh hoạ (không phải toạ độ thật) phải ghi "minh hoạ" trên khung.
- Lời đọc nhắc vật gì thì trên hình PHẢI có vật đó (vd nói "chiếc ghế" → có ghế).
- 47 câu giọng Hải Đăng ×1,15 ≈ 2:50. Muốn 6–8 phút cần ~100–120 câu.

## 3. Giọng đọc
- VieNeu trên máy: `scripts/tts_build.py` (xem mục 0). Mỗi câu 1 file, cắt lặng (|s|<300), nối nghỉ 0,32s, ghi timeline T, ghép WAV.
- Tăng tốc: `ffmpeg -af atempo=1.15`; trong Remotion `const SPD=1.15; T = T0/SPD`.
- Phiên âm (eSpeak: gạch nối gộp âm → viết âm tiết cách nhau): Man Diu nai tịt / Man Diu, Ôn Tra phót, Bon mớt, Bờ ru nô Phéc nan đét, Li xan đrô Mác ti nết, Mai cồn Ca rích, Phơ gu xơn, Mô ri nhô, Xôn sa, Ten Hác, A mô rim, Moi, Van Ga, Gờ lây dơ, Gim Rát clíp, Ghe ri Ne vin, Gie xần Uyn cốc, Ti lơ manh, Ba lê ba, An đrây Xan tốt, Át lê ti cô Ma đrít, Chen xi, Át tơn Vi la, Cô mô, Lít, Chem pi ần Lích, Pri mia Lích, derby→đác bi, pressing→prét xinh, Ri an Man rít (Real Madrid). Từ điển đầy đủ: `90-plus/mau-giong/TU_DIEN_PHIEN_AM.md` — cập nhật khi có tên mới.
- Tên mới chưa chắc: làm file nghe thử ngắn gửi anh trước.

## 4. Hình ảnh (Flow, phong cách poster đỏ–đen)
- Tiền tố prompt cố định: `Vintage screen-print poster style, two-tone duotone (deep red and black on off-white), bold graphic shapes, coarse halftone grain (clearly a printed poster artwork).`
- Nhân vật: `FULL-BODY figure, head to shoes fully visible with margin. Plain flat off-white background with no shapes behind the figure, no text, no logos, no crest, no sponsor. Vertical 9:16. Subject: …` (áo đỏ trơn, không logo). Luôn tạo toàn thân; khi dựng tự cắt nửa người.
- Cảnh nền: chọn tỉ lệ 16:9 trong menu model (click nút "Nano Banana · ▯"), `No people / faces not identifiable, no text, no logos`. Đạo cụ (ghế dugout, băng đội trưởng, hợp đồng, xấp tiền, bảng chiến thuật) 9:16 nền trơn.
- Tải: lưu `window.OLD` = src ảnh cũ trước khi gửi prompt; sau ~30s fetch các src mới (naturalWidth>300), tải cách 2,5s; thứ tự lưới = mới nhất trước. Ảnh 768px → phóng ×2 Lanczos rồi `rembg` model **u2net** (u2net_human_seg cắt hỏng tranh).
- Logo ngôi sao Gemini ở góc dưới phải ảnh nền: Bg phóng `scale(1.16+)` với `transformOrigin: 30% 30%` để đẩy ra khỏi khung.

## 5. Giới hạn an toàn (giữ nguyên)
- Em KHÔNG tự tải ảnh/footage người thật từ web (kể cả Commons/Pinterest), không tạo ảnh AI giả-như-thật người thật, không xóa watermark/né Content ID, không vẽ/chèn huy hiệu CLB (dùng thẻ tên CLB riêng của 90+). Tranh poster AI người thật được dùng vì nhìn rõ là tranh; khung cuối ghi "hình minh hoạ · nguồn: …".
- Ảnh thật chỉ khi anh tự cung cấp (CC BY/BY-SA có ghi nguồn hoặc đã mua).

## 6. Dựng Remotion (16:9, 1920×1080, 30fps) — xem `template/MUL.tsx`
**Chuẩn anh duyệt 25/11/2026 (áp dụng mọi video dọc mới):**
- Số đinh của câu chuyện = `BigNum` (xem `remotion/src/CRV.tsx`): chữ số serif nghiêng khổng lồ, viền mực, nằm SAU nhân vật cutout, phóng nhẹ + trôi. Số đổi thì chữ số cuối quay kiểu đồng hồ đếm, đổi đỏ→đen; không gạch bỏ, không dùng thẻ Stat/Stamp làm số chính.
- Mọi hình là cutout nền trong suốt, mỗi cảnh một hình riêng; cầu thủ mặc đúng màu áo đội (thêm màu thứ ba vào prompt nếu đội không mặc đỏ).
- Khung kịch bản đổi luân phiên, không lặp khung của 3 video gần nhất.
Ngôn ngữ hình (bắt buộc):
- **Không dùng nền đen.** Nền giấy `#e9e9e7` + `paper.jpg` multiply 0.55. Cảnh có ảnh nền: ảnh in mờ lên giấy (opacity .38 multiply + gradient sáng bên trái cho chữ).
- Nhân vật cutout to: thường ≥60% chiều cao khung (cảnh tổng như 3 vòng tròn / ghế mở đầu được nhỏ hơn). Đứng trên `Ground` (đường kẻ 4px), sau lưng `Circle` đỏ #C62828 / xanh #1E4FA8 viền nhòe (`filter:url(#rough)`).
- Bóng đổ = bản xám lệch trái 1,9% chiều cao, xuống 0,3%, opacity .35 (anh đã chốt).
- Nhân vật được phép đè lên chữ khi bố cục cần (zIndex 2), nhưng chữ chính vẫn đọc được.
- Rất ít chữ: serif viết thường (Playfair), từ khóa đậm nghiêng có màu. Số liệu: `Stat` mono in hoa + số to + gạch chân xanh #2E7D32. Trích dẫn: `Clip` thẻ giấy ngắn + dòng nguồn mono. `Stamp` đóng dấu đỏ. `Club` thẻ tên CLB mono trên nền màu áo có chấm halftone.
- `Arrow` mũi tên chấm cong vẽ dần, chỉ đúng vào người/chi tiết — công cụ kể chuyện chính.
- Chuyển cảnh: lia ngang/dọc có nhòe; trang "hub" (vd 3 vòng tròn nghi phạm) là trục, zoom xuyên vòng tròn → `FromCircle` mở cảnh sau; cuối video quay lại hub. Không khung nào đứng im >2s (máy quay drift, nhân vật thở nhẹ, Ken Burns nền).
- Chữ/hình bật theo nhịp câu: `R(i, frac)` = thời điểm trong câu i.
- Logo kênh góc trên phải 92px tròn; khung kết 3s: logo nảy + "đăng ký để không bỏ lỡ bên kia bảng tỷ số".

## 7. Âm thanh
- `sfx_lib.py` (numpy): whoosh, boom, pop, thud, tick, paper, marker, creak (ghế). `sfx_mix.py`: whoosh mỗi chuyển cảnh, boom ở zoom/sự thật sốc, pop mỗi câu, thud+creak khi ghế đổ, tick khi số chạy, marker khi mũi tên vẽ; nhạc nền lo-fi 80BPM duck theo giọng; giọng ×1,5 + SFX ×0,45; `loudnorm I=-14 TP=-1.5`.

## 8. Render & giao
- Bản xem trước (`--scale=0.5`, 960×540) phải ghi rõ "bản nháp 540p" khi gửi. Anh duyệt xong → render full 1080p `--crf=18` (~10 phút cho 85s) rồi gửi + lưu.
- Kiểm tra: `npx tsc`, still `--scale=0.15` nhiều mốc → contact sheet → xem (chữ đè, logo Gemini, nhân vật lệch).
- Xem trước: `--scale=0.5` chạy nohup + vòng chờ; nén `libx264 -preset veryfast -crf 26` → SendUserFile → device_commit_files (dùng fileUuid) vào `90-plus/<chu-de>/` với tên `_vN`.
- Duyệt xong mới render Full HD. Bản 9:16: khuôn `MU2.tsx` (1080×1920), cắt 2–3 đoạn hay nhất.

## 9. Phân tích chiến thuật (khuôn `template/MUT.tsx`, đã được anh duyệt)
Dùng cho đoạn giải thích tình huống/đội hình (30–60s mỗi tình huống), ghép vào video dài hoặc đứng riêng.

**Nghiên cứu riêng cho chiến thuật:** đọc bài phân tích trận (The Analyst/Opta, Squawka, Coaches' Voice, UEFA insights, báo uy tín) để lấy: sơ đồ hai đội, cách triển khai bóng, tình huống bàn thắng (phút, ai chạy vào đâu), số liệu hiệp/trận (kiểm soát bóng, cú sút, xG). Vị trí chấm là **sơ đồ minh hoạ** dựa trên mô tả — ghi "sơ đồ minh hoạ" + nguồn số liệu.

**Hình:**
- Sân 105×68 m vẽ nét mực trên nền giấy, `S=15` px/m, nghiêng 3D `rotateX(34deg)` trong div `perspective: 2200`, `transformStyle: preserve-3d`. **Không đặt `opacity` lên mặt phẳng sân** (làm mất 3D, cutout bị bẹp) — muốn làm mờ sân thì phủ lớp giấy rgba lên trên.
- Cầu thủ = chấm tròn 44px màu đội (xanh #1E4FA8 / đỏ #C62828) viền kem, bóng đổ; nhãn tên mono in hoa chỉ hiện khi lời đọc nhắc tới; chấm phụ mờ đi khi cần dồn chú ý.
- Nhân vật chính "bật" từ chấm thành cutout poster đứng trên sân: billboard `rotateX(-34deg)`, gốc ở chân, bóng lệch như quy tắc chung.
- Đường kẻ theo lời đọc, vẽ dần bằng mask: chuyền = nét liền + mũi tên; chạy chỗ = nét chấm; lựa chọn chuyền = nét gạch mảnh nhấp nháy. Vùng trống = vòng tròn đỏ gạch đứt tô nhạt; khoảng hở giữa 2 cầu thủ = đường gạch đỏ + nhãn "KHOẢNG TRỐNG".
- Camera: keyframe [t, tâm x(m), tâm y(m), scale] nội suy mượt; tổng quan (~0.8) → zoom khu vực (1.3–1.5) → bám bóng → tổng quan. Chừa khoảng trên đầu khi có cutout đứng (hạ tâm y).
- Overlay: câu hỏi serif + thẻ CLB ở đầu; nhãn sơ đồ mono "COMO · 4-2-3-1"; `Stamp` cho khoảnh khắc chốt ("1 ĐƯỜNG CHUYỀN", "1–0 · PHÚT 2") + chớp trắng khi ghi bàn; `Stat` số liệu khi zoom ra; kết bằng cutout lớn + vòng tròn và câu chốt luận điểm. Chữ đặt né cutout (đổi sang bên phải khi nhân vật đứng bên trái).
- SFX: pop khi chấm bật ra, whoosh khi chạy/zoom, thud mỗi đường chuyền, marker khi vẽ vùng, boom khi ghi bàn.

**Mẫu kịch bản tình huống (~9 câu):** câu hỏi tranh cãi → sơ đồ hai đội → cách đối thủ triển khai → hành động của nhân vật chính → điều sai (không ai hỗ trợ / khoảng trống) → đường chuyền xuyên tuyến → hậu quả (bàn thua) → số liệu xác nhận → kết luận một câu.

## 10. Bộ đồ hoạ dữ liệu (khuôn `template/MUV.tsx`)
Các component cùng phong cách giấy–mực, dùng lại trong mọi video:
- `FormChart`: điểm tích luỹ theo trận (đường đỏ vẽ dần, chấm xanh thắng / xám hoà / đỏ thua) + đường gạch xanh lá làm mốc so sánh (vd nhịp top 4).
- `Radar`: 6 chỉ số, 2 đa giác đỏ/xanh bung lần lượt.
- `ShotMap`: nửa sân, vòng tròn to = xG cao, tô đặc = bàn thắng, bảng tổng (cú sút, tổng xG, bàn).
- `PassNet`: nút = vị trí (to = chạm nhiều), cạnh dày = chuyền nhiều, trục chính tô đỏ + vòng gạch.
- `Heat`: các đốm đỏ blur cắt trong khung sân + mũi tên hướng tấn công.
Số liệu thật lấy từ FBref/Understat/bài phân tích, ghi nguồn; số mẫu thì ghi "SỐ LIỆU MINH HOẠ". Tiêu đề: kicker mono + câu serif có từ khoá đậm nghiêng; chừa chỗ để tiêu đề không đè lên sân.

## 11. Giải thích chấn thương / cơ thể (khuôn `template/MUI.tsx`, đã được anh duyệt)
Theo mẫu MEZZALA (De Jong cổ chân). Trình tự ~10 câu, ~35s:
1. Cầu thủ ngồi ôm chỗ đau trên đường nền + câu hỏi "tình hình *nghiêm trọng*?".
2. Tiêu đề tạp chí khoa học serif đậm nghiêng + gạch ngang (vd *British Journal of Sports Medicine*), dòng mô tả nghiên cứu nhỏ, `Stat` số liệu dịch tễ (tỉ lệ, số ca/mùa/đội).
3. Cận cảnh phần cơ thể (cutout cắt từ đùi xuống giày, rất to, đứng trên `Ground`) + vòng tròn nâu đỏ #8E2F1B góc trên với câu hỏi chữ kem "vì sao lại *chấn thương*?" + kính lúp SVG tự vẽ.
4. Cơ học động tác: cutout toàn thân + mũi tên chấm chỉ "hạ *trọng tâm*", "áp lực lên *chân trụ*", "*mắt cá* gánh trọng lượng".
5. "X-quang": vòng tròn đen bung ra đúng vị trí khớp, bên trong là hình xương (line art trắng nền đen) + đường dây chằng nháy đỏ; kính lúp + mũi tên chỉ vào; chữ cơ chế + `Stat`.
6. Một con số chốt (số mono khổng lồ đếm lên) + nguồn.
7. Câu kết cảm xúc + cutout trên vòng tròn đỏ.

Tài nguyên Flow (poster đỏ–đen, cầu thủ vô danh áo đỏ trơn khi nói chung chung): ngồi ôm chỗ đau; rê bóng hạ trọng tâm (side view); cận cảnh chân (shorts→giày, một chân đạp bóng, chân trụ dưới đất); hình xương giải phẫu `white line art on solid black, like an X-ray, lateral view, no labels`.

An toàn: chỉ dùng số liệu từ nghiên cứu/nguồn y khoa uy tín (BJSM, UEFA ECIS, PubMed), ghi tên nghiên cứu ở chân màn hình. Với cầu thủ thật: chỉ nêu chẩn đoán/thời gian nghỉ do CLB hoặc báo chí công bố, không tự suy đoán bệnh án.

## 12. Việc còn mở
- Thư viện nhân vật nhiều tư thế (đứng, chỉ tay, ôm đầu, ăn mừng) cho ~50 HLV/ngôi sao; khuôn thumbnail; chuyển đổi đội hình có bóng/không bóng.