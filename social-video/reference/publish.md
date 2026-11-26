# Đăng bài

`post.json`:
```json
{"title": "...", "description": "...", "hashtags": ["#taichinh"], "cover": "cover.jpg", "ai_label": false,
 "youtube": {"title": "...", "description": "...\nNguồn: ...\nNội dung mang tính thông tin, không phải khuyến nghị đầu tư.\n#giavang #taichinh #Shorts", "tags": ["giá vàng", "..."]},
 "facebook": {"title": "...", "description": "...\nBạn nghĩ sao?\nNguồn: ...\nNội dung mang tính thông tin, không phải khuyến nghị đầu tư.\n#giavang #taichinh"},
 "tiktok": {"caption": "Hook 1 câu + câu hỏi #taichinh #xuhuong #giavang #vangSJC"}}
```

- **YouTube** (`publish_youtube.py`): OAuth token ở `secrets/youtube_token.json` (scope `youtube.upload`). Video dọc ≤ 3:00 tự thành Shorts. `privacyStatus` theo config (`public` / `private` khi thử).
- **Facebook Page Reels** (`publish_facebook.py`): Page access token dài hạn ở `secrets/facebook.env` (`FB_PAGE_ID`, `FB_PAGE_TOKEN`). Quy trình 3 bước của Graph API: start → upload (rupload) → finish với `video_state=PUBLISHED`.
- **TikTok** (`tiktok_upload.mjs`): TikTok Studio qua Chrome profile đã đăng nhập. Không bật "AI-generated content" (tắt nếu TikTok tự bật). Giao diện hay đổi: script chụp màn hình mỗi bước vào `runs/.../tiktok/`; lỗi → báo Telegram kèm ảnh, không thử quá 2 lần. Khi có quyền Content Posting API, chuyển sang API.

Thời điểm: 19:00–21:00 giờ VN. Ghi `published.json` (`platform`, `id`, `url`, `at`).


## Viết theo nền tảng
| | YouTube Shorts | Facebook Reels | TikTok |
|---|---|---|---|
| Người xem tìm bằng | tìm kiếm + gợi ý | bảng tin, chia sẻ | For You, tìm kiếm trong app |
| Tiêu đề | ≤ 70 ký tự, từ khoá đầu câu, có 1 con số | ngắn, như câu nói | không có (caption là chính) |
| Mô tả | 3–5 câu tóm nội dung chứa từ khoá, nguồn, miễn trừ | giọng trò chuyện, câu hỏi mời bình luận, xuống dòng ngắn | ≤ 150 ký tự: hook + câu hỏi |
| Hashtag | 3 ở cuối (#Shorts) + `tags` 8–12 | 2–4 | 4–6 (rộng + ngách), tiếng Việt không dấu |
| Tránh | nhồi hashtag | link ngoài kéo giảm reach | link, caption dài, từ "AI" |
Ba bản phải khác câu chữ; không giật tít sai số liệu.
