#!/usr/bin/env bash
# usage: notify_telegram.sh "text" [photo_or_video_path]
# secrets/telegram.env: TG_BOT_TOKEN=..., TG_CHAT_ID=...
# Videos over 45 MB (bot limit 50 MB) are sent as a 720p preview; the original file is untouched.
set -euo pipefail
source ~/goc-nhin/secrets/telegram.env
API="https://api.telegram.org/bot${TG_BOT_TOKEN}"
LIMIT=$((45 * 1024 * 1024))
check() { # fail loudly if Telegram did not accept the message
  local r="$1"
  if [[ "$(jq -r '.ok' <<<"$r" 2>/dev/null)" != "true" ]]; then
    echo "TELEGRAM_ERROR: $(jq -r '.description // .' <<<"$r" 2>/dev/null || echo "$r")" >&2; exit 1
  fi
}
if [[ $# -ge 2 && -f "$2" ]]; then
  FILE="$2"; CAP="${1:0:1000}"
  case "$FILE" in
    *.mp4)
      M=sendVideo; F=video
      if (( $(stat -c %s "$FILE") > LIMIT )); then
        PREV="$(mktemp --suffix=.mp4)"; trap 'rm -f "$PREV"' EXIT
        dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$FILE")
        # target ~40 MB total: video bitrate = 40MB*8/dur - 128k audio
        vb=$(python3 -c "print(max(500, int(40*8*1024/float('$dur')) - 128))")
        ffmpeg -v error -y -i "$FILE" -vf "scale=720:-2" -c:v libx264 -preset veryfast -b:v ${vb}k -maxrate ${vb}k -bufsize $((vb*2))k \
          -c:a aac -b:a 128k -movflags +faststart "$PREV"
        FILE="$PREV"; CAP="${CAP} (bản xem trước 720p, file gốc trên VPS)"
      fi
      R=$(curl -sS -F chat_id="$TG_CHAT_ID" -F caption="${CAP:0:1024}" -F supports_streaming=true -F "$F=@$FILE" "$API/$M");;
    *)
      R=$(curl -sS -F chat_id="$TG_CHAT_ID" -F caption="${CAP:0:1024}" -F "photo=@$FILE" "$API/sendPhoto");;
  esac
else
  R=$(curl -sS -d chat_id="$TG_CHAT_ID" --data-urlencode text="${1:0:4096}" "$API/sendMessage")
fi
check "$R"
echo "TELEGRAM_OK"
