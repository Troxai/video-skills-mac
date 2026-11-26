#!/bin/bash
# usage: publish_at.sh <run_dir> "<YYYY-MM-DD HH:MM +07>"  — waits, then publishes to 3 platforms + thumbnails
R=$1; until [ $(date +%s) -ge $(date -d "$2" +%s) ]; do sleep 30; done
cd ~/goc-nhin
[ -f $R/APPROVED ] || { echo "no APPROVED"; exit 1; }
python3 scripts/publish_youtube.py $R/final.mp4 $R/post.json > $R/pub_yt.log 2>&1
python3 scripts/publish_facebook.py $R/final.mp4 $R/post.json > $R/pub_fb.log 2>&1
node scripts/tiktok_upload.mjs $R/final.mp4 $R/post.json $R/tt_shots > $R/pub_tt.log 2>&1
for p in yt:youtube fb:facebook; do id=$(grep -o '"id": "[^"]*"' $R/pub_${p%%:*}.log | tail -1 | cut -d'"' -f4)
  T=$(ls $R/thumbnail.jpg $R/thumbnail.png 2>/dev/null | head -1); [ -n "$id" ] && [ -n "$T" ] && python3 scripts/set_thumbnail.py ${p##*:} $id $T >> $R/pub_thumb.log 2>&1; done
fid=$(grep -o '"id": "[^"]*"' $R/pub_fb.log | tail -1 | cut -d'"' -f4); [ -n "$fid" ] && python3 scripts/fb_comment.py $fid >> $R/pub_thumb.log 2>&1
tail -1 $R/pub_yt.log; tail -1 $R/pub_fb.log; tail -2 $R/pub_tt.log; cat $R/pub_thumb.log 2>/dev/null
