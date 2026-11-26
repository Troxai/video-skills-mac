# Khuôn mẫu Remotion kênh 90+

## Cài đặt (một lần)
npx create-video@latest (blank) → copy các file .tsx vào src/, Root.tsx thay src/Root.tsx
npm i @fontsource/playfair-display @fontsource/jetbrains-mono @fontsource/be-vietnam-pro
pip install rembg numpy scipy pillow --break-system-packages
remotion.config.ts: Config.setBrowserExecutable('/usr/bin/google-chrome') nếu cần

## Thư mục public/
- mz/paper.jpg (= template/paper.jpg), tex/noise0-3.png, mu/logo.png
- mu/<nhân vật>.png  ← copy từ anh-that/_cutout/<ten>_full.png (đổi tên bỏ _full)
- mu/bg_*.jpg (ảnh nền 16:9 đã phóng), mu/inj_*.png (cầu thủ vô danh cho chấn thương)
- mu/voice*.wav + mu/mix*.wav (sinh bằng sfx_mix*.py)

## Composition
- MUL  : bản dài 16:9 "3 nghi phạm" (khuôn chính)
- MU2  : bản dọc 9:16 (Shorts)
- MUT  : phân tích chiến thuật trên sân 3D
- MUV  : bộ đồ hoạ dữ liệu (phong độ, radar, shot map, pass network, heatmap)
- MUI  : giải thích chấn thương (X-quang, kính lúp)

## Render
npx remotion render src/index.ts <ID> out/x.mp4 --scale=0.5   (xem trước)
npx remotion render src/index.ts <ID> out/x.mp4 --crf=18        (Full HD)
