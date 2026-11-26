# Cài đặt trên macOS (chip Apple M1–M4)

Bộ này gồm 2 skill Claude Code:
- `social-video/` — kênh **Góc Nhìn Đa Chiều** (tài chính, video dọc 9:16 kiểu "tấm bảng vô tận").
- `90plus-video-cutout-poster/` — kênh **90+** (bóng đá, poster đỏ–đen, 16:9 + 9:16).

Cấu hình khuyên dùng: chip M1 trở lên, RAM ≥ 16GB, ổ trống ≥ 50GB. MacBook: cắm sạc khi chạy.

## 1. Phần mềm

```bash
# Homebrew (nếu chưa có)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew install node python@3.12 ffmpeg flock git
brew install --cask google-chrome
```

Claude Code: cài app **Claude Desktop** (dùng tab Code) hoặc bản dòng lệnh:
```bash
npm install -g @anthropic-ai/claude-code
```

## 2. Thư viện Python

```bash
python3 -m venv ~/whisper-venv && ~/whisper-venv/bin/pip install faster-whisper numpy
pip3 install --user pillow numpy requests pyyaml google-api-python-client google-auth-oauthlib
brew install pipx && pipx install "rembg[cli]"      # tách nền (kênh 90+)
```

Giọng đọc: **VieNeu-TTS cài trên máy** vào `~/VieNeu-TTS/.venv` (theo hướng dẫn của VieNeu). Cả 2 kênh gọi VieNeu trực tiếp:
- GNDC: `~/VieNeu-TTS/.venv/bin/python scripts/tts_batch.py …` (giọng "Thanh Bình").
- 90+: `~/VieNeu-TTS/.venv/bin/python scripts/tts_build.py …` (giọng "Hải Đăng").
Kiểm tra: `~/VieNeu-TTS/.venv/bin/python -c "import vieneu; print('ok')"`. Trên Mac VieNeu chạy CPU/MPS nên chậm hơn GPU NVIDIA — thử 1 bài trước.

## 3. Cài skill

```bash
git clone <repo này> ~/video-skills
mkdir -p ~/.claude/skills
cp -R ~/video-skills/social-video ~/.claude/skills/
cp -R ~/video-skills/90plus-video-cutout-poster ~/.claude/skills/
```

**Góc Nhìn Đa Chiều**: mở Claude Code, gõ `/social-video setup` — skill tự tạo `~/goc-nhin`, chép template/scripts và `npm install`.
Sau đó sửa `~/goc-nhin/config/env` (mẫu ở `assets/config/env.example`).

**90+**:
```bash
mkdir -p ~/90plus/{config,secrets,logs} && chmod 700 ~/90plus/secrets
cp -R ~/video-skills/90plus-video-cutout-poster/{scripts,template,remotion,10_KHUNG_SUON_SCRIPT.md} ~/90plus/
cd ~/90plus/remotion && npm install && cd ~/90plus && npm install playwright
```
Tạo `~/90plus/config/env`:
```
FLOW_PROFILE="~/Library/Application Support/chrome-flow-90p"
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
FLOW_RATIO=9:16
```

## 4. Tài khoản (mỗi người tự tạo — KHÔNG có trong repo)

Đặt vào `~/goc-nhin/secrets/` hoặc `~/90plus/secrets/` (chmod 600):
- `youtube_client.json` — OAuth client (Google Cloud Console → YouTube Data API v3 → Desktop app). Lần đầu chạy `publish_youtube.py` sẽ mở đăng nhập và tạo `youtube_token.json`.
- `facebook.env` — `FB_PAGE_ID=...`, `FB_PAGE_TOKEN=...` (Page token dài hạn).
- `telegram.env` — bot báo cáo (tuỳ chọn).
- **Google Flow**: chạy 1 lần `node scripts/flow_generate.mjs` → Chrome mở ra → đăng nhập Google (nên gói PRO). Phiên đăng nhập được lưu trong profile.
- **TikTok** (tuỳ chọn): đăng nhập trong cùng Chrome profile.

## 5. Khác biệt so với bản VPS (đã sửa sẵn trong repo)

| VPS Linux | macOS |
|---|---|
| `xvfb-run -a node …` | `node …` (Chrome mở cửa sổ thật) |
| render `--gl=angle-egl` (NVIDIA) | `--gl=angle` (Metal) — `render_safe.py` tự chọn |
| Whisper large-v3 trên CUDA | tự chuyển CPU, model medium |
| VieNeu GPU NVIDIA | VieNeu trên Mac (CPU/MPS) |
| `~/rembg-venv/bin/rembg` | `rembg` (pipx) |
| cron + systemd + bot Telegram | xem mục 6 |

## 6. Chạy tự động (tuỳ chọn)

Đơn giản nhất: mỗi ngày mở tab Code, gõ `/social-video all goc-nhin-da-chieu`.

Tự động theo giờ: `crontab -e`, dán nội dung `social-video/assets/config/crontab.txt` (đổi `TEN_BAN` trong PATH). Cấp quyền **Full Disk Access** cho `/usr/sbin/cron` (System Settings → Privacy & Security). Giữ máy không ngủ:
```bash
caffeinate -dims &      # hoặc app Amphetamine
```
Đặt giờ máy về Asia/Ho_Chi_Minh (System Settings → General → Date & Time).

## 7. Kiểm tra nhanh

```bash
node -v && python3 --version && ffmpeg -version | head -1
~/whisper-venv/bin/python -c "import faster_whisper; print('whisper ok')"
cd ~/goc-nhin/template && npx remotion still src/index.ts FptBoard out/test.png --frame=600
```
