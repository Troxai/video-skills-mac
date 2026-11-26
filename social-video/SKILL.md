---
name: social-video
description: Sản xuất video dọc ~3 phút về tài chính, chứng khoán, bất động sản theo phong cách "tấm bảng vô tận" cho các kênh trong ~/goc-nhin/channels. Dùng khi được gọi "/social-video <setup|research|produce|publish|all> <kênh> [chủ đề]" từ cron, Telegram hoặc tay.
---

# Social video — tấm bảng vô tận

Skill nằm ở `~/.claude/skills/social-video` (gọi là `$SKILL`). Workspace là `~/goc-nhin` (gọi là `$WS`).

## 0-mac. Chạy trên macOS
Xem `SETUP_MAC.md` ở gốc repo. Khác VPS: không cần Xvfb; `render_safe.py` tự dùng `angle` (Metal) trên Mac; `word_times.py` tự chuyển Whisper sang CPU (model medium) khi không có CUDA; `config/env` đặt `CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`. VieNeu chạy trên máy (CPU/MPS), chậm hơn VPS GPU — chờ lâu hơn là bình thường.

## 0. setup (chạy 1 lần, hoặc khi `$WS` chưa có)

`/social-video setup`:
1. `mkdir -p ~/goc-nhin/{runs,logs,secrets,channels,config}` ; `chmod 700 ~/goc-nhin/secrets`
2. Sao `$SKILL/assets/template` → `$WS/template`, `$SKILL/scripts` → `$WS/scripts`,
   `$SKILL/assets/channels/*` → `$WS/channels/` (không ghi đè file đã có), `$SKILL/assets/config/*` → `$WS/config/`.
3. `cd $WS/template && npm install` rồi `npx remotion still src/index.ts FptBoard out/test.png --frame=600` để kiểm tra.
4. `cp $WS/config/claude-settings.json $WS/.claude/settings.json` (tạo thư mục `.claude`).
5. Kiểm tra: `~/VieNeu-TTS/.venv/bin/python -c "import vieneu"`, `ffmpeg -version`, `node -v` (≥ 20), Playwright + Chrome profile trong `config/env`.
6. Báo cáo những gì còn thiếu (secrets, đăng nhập Muse/TikTok, cron) — **không** tự cài cron; đưa nội dung `config/crontab.txt` cho anh duyệt.

Làm việc trong `$WS`. Mỗi lần chạy ghi vào `runs/<YYYY-MM-DD>/<kênh>/` và `runs/.../log.md`.
Cấu hình kênh: `channels/<kênh>.yaml`. Bí mật ở `secrets/` — đọc qua script, **không bao giờ in ra**.
Khoá: cron đã bọc cả lượt chạy trong `flock ~/goc-nhin/.lock` — KHÔNG gọi flock lại bên trong (sẽ tự khoá chính mình).

Đối số: `setup` | `research` | `produce` | `publish` | `all`, tên kênh, tuỳ chọn chủ đề cố định.
Không có người trả lời trong cron: tự quyết theo tài liệu này, ghi lý do vào log, **không hỏi**.

## 1. research (cào và chọn chủ đề)

1. Đọc `sources` trong config kênh. Lấy bài 24 giờ gần nhất (WebFetch / curl RSS / trang chuyên mục).
2. Chấm điểm mỗi tin 0–10: có số liệu cụ thể (≥3 con số), liên quan nhà đầu tư cá nhân, có mặt trái để phản biện.
   Nhân với `topic_weights` của kênh (nếu có) → điểm cuối. Ghi bảng điểm top 5 vào `log.md`.
   - **Phân bổ tuần** (`weekly_mix`): đếm chủ đề 7 ngày gần nhất trong `runs/*/*/brief.json` (trường `topic`). Đã đủ `max` nhóm nào → bỏ nhóm đó hôm nay; chưa đủ `min` mà còn ≤ số ngày còn lại → ưu tiên nhóm đó.
   - **Chống lặp** (`avoid_repeat_days`, `avoid_repeat_scope`): `topic` → không lặp chủ đề; `angle` → được lặp chủ đề nhưng góc nhìn (trường `angle` trong brief) phải khác mọi brief cùng chủ đề trong khoảng đó.
3. Chọn 1 chủ đề (ghi `title` = tiêu đề, `topic` = một khoá trong `topic_weights`, và `angle` = một câu ngắn). **Gom số liệu từ ≥ 2 nguồn độc lập**; mỗi con số ghi `value`, `unit`, `period`, `source_urls`.
4. Kiểm theo `reference/factcheck.md`. Con số chỉ có 1 nguồn hoặc lệch giữa nguồn → bỏ khỏi video hoặc ghi rõ "theo X".
4b. Vàng/bitcoin: không nói "nên mua/bán", không dự báo giá mục tiêu, không gợi ý sàn/coin cụ thể; luôn có ý "Mặt khác" về rủi ro.
5. Ghi `brief.json` (chủ đề, góc nhìn chính, 9–12 con số đã kiểm, 3–4 ý "Mặt khác" có nguồn, câu hỏi mở).
Không đủ 4 con số đã kiểm → dừng, thông báo Telegram "hôm nay không có chủ đề đủ chuẩn". Có 4–8 số → vẫn làm, video được ngắn hơn 170 s; ghi lý do vào log, tuyệt đối không thêm số chưa kiểm để kéo dài.

## 2. produce (dựng video)

1. **Kịch bản** theo `reference/script.md`: **góc nhìn trước, khung sau** — viết 1 câu luận điểm riêng của bài, rồi chọn cấu trúc hợp với luận điểm đó (không áp một khuôn cho mọi bài); đọc 3 `script.json` gần nhất để không lặp hook, câu nối, câu kết. 32–38 câu, 720–800 chữ, đọc ~2:40–2:55 (VieNeu ≈ 4,5 chữ/giây). Sau TTS: tổng < 160 s → thêm câu từ số liệu/ý "Mặt khác" đã kiểm trong brief (không bịa thêm); > 175 s → rút.
   Ghi `script.json`: mỗi câu `{id, chapter, text_display, text_tts, station, visual}`.
   `text_tts` viết số bằng chữ, tên viết phiên âm ("Ép pê tê", "Ây Ai", "Vi en In đếch").
2. **Giọng**: `~/VieNeu-TTS/.venv/bin/python scripts/tts_batch.py runs/.../script.json runs/.../voice/` (VieNeu, giọng/style từ config).
   Script in độ dài từng câu → ghi `timing.json`.
   Ngay sau đó lấy **mốc từng chữ**: `~/whisper-venv/bin/python scripts/word_times.py runs/.../voice/` → `voice/words.json` (`{"s01": [{"w": "142", "t": 2.78, "e": 3.5}, …]}`, t tính từ đầu file wav của câu). Chép `words.json` vào `public/episodes/<tập>/`. Tổng > 175 s → rút câu, tạo lại câu đó.
3. **Ảnh — tạo mới bằng Google Flow** (12/11/2026: tài khoản Muse bị khoá → quay lại Flow) (theo `reference/images.md`): mỗi trạm có ít nhất 1 ảnh **tạo mới, đúng cảnh của câu thoại** (vd câu về người dân mua vàng → cutout "a small group of Vietnamese people queuing, one woman handing cash over a gold shop counter"). Thường 8–12 ảnh/video, **TẤT CẢ đều là cutout** trên nền xanh #00FF00 rồi tách nền — phong cách "tấm bảng vô tận": KHÔNG dùng ảnh nguyên tấm/ảnh cảnh có phông nền. Bối cảnh thể hiện bằng chính vật thể trong cutout (quầy vàng, cân, bảng giá trơn…), không bằng phông.
   **Ảnh minh hoạ đúng lời thoại**: mỗi prompt viết từ trường `visual` + `text_display` của chính câu đó trong `script.json` — người xem nghe gì thì thấy đúng cảnh đó (nghe "người dân xếp hàng mua vàng" → thấy người dân xếp hàng ở quầy vàng; nghe "khối ngoại bán ròng" → nhà đầu tư nước ngoài trước bảng điện đỏ). Không dùng ảnh chung chung kiểu "doanh nhân", "toà nhà" nếu câu nói về việc cụ thể hơn.
   Ghi `prompts.json` (mỗi ảnh: `id`, `station`, `line_ids` = các câu nó minh hoạ, `prompt`, `kind: cutout`) → **Flow**: `node scripts/flow_generate.mjs prompts.json runs/.../images` (prompt TIẾNG ANH; script tự thêm khung chung 9:16; chạy song song 3 prompt (FLOW_CONC, tối đa 4), mỗi prompt ra 2 ảnh `<id>_0.jpg`, `<id>_1.jpg`, ~10–15 giây/prompt; ảnh được ghép đúng prompt theo phản hồi mạng của Flow). Exit 3 / FLOW_LOGIN_REQUIRED = cần đăng nhập Google → báo Telegram. Exit 4 = giao diện Flow đổi (xem `_flow_error.png` trong thư mục ảnh) → báo Telegram, dùng thư viện. Exit 2 / ảnh thiếu (FLOW_NO_RESULT) → chạy lại cùng lệnh tối đa 2 lần (bỏ qua ảnh đã có). Ảnh Flow có logo ✦ nhỏ góc dưới phải: luôn tách nền + crop sát chủ thể (chroma_key.py) nên logo bị loại; kiểm bằng mắt, còn logo thì crop thêm. **KHÔNG dùng Muse** (tài khoản bị khoá 12/11).
   (cutout: nền #00FF00 → `python3 scripts/chroma_key.py`). Mỗi prompt 1 ảnh (`<id>_0.jpg`); xem bằng mắt — ảnh dị dạng, sai bối cảnh → tạo lại prompt đó 1 lần.
   **Thư viện** `template/public/library/` chỉ dùng cho logo/thương hiệu kênh hoặc khi Flow lỗi; **không** dùng lại ảnh nhân vật của tập cũ. Flow vẫn lỗi sau 2 lần chạy lại → mới dùng thư viện, ghi log và báo Telegram.
   Tên thương hiệu thật (SJC, PNJ, ngân hàng…) Muse vẽ được chữ thật (vd miếng vàng SJC) — chấp nhận nếu chữ đúng; còn lại không để AI vẽ chữ/logo; hiển thị bằng nhãn chữ trong Remotion đặt cạnh ảnh.
4. **Dựng — STYLE MẶC ĐỊNH "BẢNG XÂY DẦN" (anh duyệt 26/11/2026): đọc `reference/board-style.md` TRƯỚC.** Sao `template/src/episodes/2026-11-17-dau-gia-board.tsx` (có bản đồ vệ tinh nền — chủ đề có địa danh/BĐS/hạ tầng) hoặc `2026-11-19-vang-fed-petro.tsx` (nền đen — tài chính), viết lại `BOARDS` theo kịch bản. Hình minh hoạ to, cảnh xây dần, camera lia/zoom, không cắt cứng, không bay ra vào. Phần dưới (FptBoard/MetroBoard, camera spline trạm) là CÁCH CŨ, chỉ tham khảo hàm W()/khớp giọng.
   (Cách cũ) tạo `template/src/episodes/<date>-<slug>.tsx` bằng cách sao tập mẫu gần nhất (`src/examples/FptBoard.tsx`: doanh nghiệp/BCTC; `src/examples/MetroBoard.tsx`: chính sách/hạ tầng, 17 trạm, biểu đồ so sánh trải qua nhiều trạm) và thay:
   `LINES`/`VOICE` từ `timing.json`, số trạm `P` theo số câu nhóm (mỗi trạm 1–3 câu), nội dung `World`.
   Giữ nguyên: Board/tint/Material/Foreground/Logo/Outro, camera spline, cách hiện chữ. Quy tắc hình ở `reference/style.md`.
   Đăng ký composition trong `src/Root.tsx`. Nhạc: `python3 scripts/music.py timing.json public/...` (tự né giọng).
   **Khớp giọng – hình (bắt buộc)**: mỗi câu phải có hình/chữ/số của chính nó **xuất hiện trong vòng 0,3 s sau khi câu đó bắt đầu đọc** (lấy mốc từ `timing.json`), và **không xuất hiện trước** khi câu trước kết thúc. Camera tới trạm trước rồi mới đọc; không để giọng đọc tới con số mà màn hình còn đang lướt hoặc chưa hiện số. 
   **Cách làm**: KHÔNG dùng tỷ lệ phần trăm của câu (`Sf(sid, 0.6)`) để hẹn giờ hiện hình. Dùng mốc chữ thật trong `words.json`:
   ```ts
   import WORDS from '../../public/episodes/<tập>/words.json';
   const norm = (x: string) => x.toLowerCase().replace(/[.,!?%:;"“”()]/g, '').trim();
   // frame lúc cụm `phrase` bắt đầu được đọc trong câu sid (−3 frame để hình hiện ngay trước tiếng); không thấy → đầu câu
   const W = (sid: string, phrase: string, lead = 3) => {
     const ws = (WORDS as any)[sid] || [], q = phrase.split(/\s+/).map(norm);
     for (let i = 0; i + q.length <= ws.length; i++) if (q.every((t, k) => norm(ws[i + k].w).startsWith(t))) return Math.max(S(sid, 0), S(sid, ws[i].t) - lead);
     return S(sid, 0);
   };
   ```
   Mỗi con số/nhãn/cutout gắn với đúng chữ nó minh hoạ: `at={W('s02', '142')}`, `at={W('s05', 'chênh lệch')}`. Ảnh chính của câu hiện ở `S(sid, 0)`. Whisper có thể nghe số thành chữ số ("142", ",5") — dùng phần đầu của con số làm khoá.
5. **QC trước khi render toàn bộ**: `npx remotion still` tại **(start + 0,5 s)** của mỗi câu (không chỉ giữa câu) và mỗi lần chuyển trạm, ghép contact sheet, **tự xem**: câu đang đọc nói gì thì khung đó phải đang hiện đúng hình/số đó (ghi `line_id` + 6 chữ đầu câu dưới mỗi ô contact sheet để đối chiếu);
   chữ không tràn khung (lề an toàn 60 px, tránh 260 px dưới cùng — vùng UI TikTok), không chồng chữ, số đúng `brief.json`,
   không có chữ/logo do AI vẽ trong ảnh. Sửa đến khi sạch.
6. **Render**: `python3 scripts/render_safe.py <Comp> runs/.../final.mp4` (~12–15 phút: render GPU 2 lần, so từng khung, khung lệch = nhấp nháy → render lại riêng khung đó bằng CPU rồi ghép). **Không** render cả bài bằng `swangle`/CPU (mất ~75 phút). Kiểm thời lượng < 180 s.
7. Tạo `post.json` — **mỗi nền tảng một bản riêng** (không copy cùng 1 caption), theo `reference/publish.md` mục "Viết theo nền tảng":
   - `youtube`: `title` ≤ 70 ký tự có từ khoá tìm kiếm ở đầu (vd "Giá vàng SJC…"), `description` 3–5 câu + nguồn + dòng miễn trừ + 3 hashtag cuối (gồm #Shorts), `tags` 8–12 từ khoá.
   - `facebook`: `title` ngắn; `description` 3–5 dòng giọng trò chuyện, mở bằng câu hỏi/con số gây tò mò, 1 câu hỏi mời bình luận, nguồn, dòng miễn trừ, 2–4 hashtag.
   - `tiktok`: `caption` ≤ 150 ký tự trước hashtag (1 câu hook + câu hỏi), rồi 4–6 hashtag (2 rộng #taichinh #xuhuong… + 2–4 ngách #giavang…). Không dán link.
   - Trường chung `title`, `description`, `hashtags`, `cover`, `ai_label: false` vẫn giữ (dùng làm dự phòng). Dòng "Nội dung mang tính thông tin, không phải khuyến nghị đầu tư." chỉ ở mô tả YouTube/Facebook và chữ nhỏ khung cuối — **không đọc thành lời**. Bản preview Telegram gửi kèm cả 3 caption để anh duyệt.
8. `scripts/notify_telegram.sh` gửi: tiêu đề, thời lượng, contact sheet, đường dẫn video, "trả lời OK để đăng".

## 3. publish

Chỉ đăng khi `runs/.../APPROVED` tồn tại (anh trả lời OK → tạo file) hoặc `auto_publish: true`.
- YouTube: `python3 scripts/publish_youtube.py runs/.../final.mp4 runs/.../post.json` (Shorts, < 3:00).
- Facebook Page Reels: `python3 scripts/publish_facebook.py …`.
- TikTok: `node scripts/tiktok_upload.mjs …` (Chrome profile đã đăng nhập). **Không** bật nhãn "AI-generated content" (nếu TikTok tự bật thì tắt đi). YouTube `containsSyntheticMedia: false`. Theo `ai_label` trong config kênh.
Ghi link vào `published.json`, báo Telegram. Lỗi một nền tảng không chặn nền tảng khác; thử lại tối đa 2 lần.

## Không bao giờ

- Đăng con số chưa qua `factcheck.md`, hoặc khuyến nghị mua/bán cụ thể.
- Dùng logo công ty, ảnh người thật (lãnh đạo, người nổi tiếng) — chỉ nhân vật minh hoạ tạo bằng AI.
- In / gửi token, cookie, private key. Xoá file ngoài `~/goc-nhin/runs`.
