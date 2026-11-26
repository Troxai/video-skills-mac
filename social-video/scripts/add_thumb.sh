#!/bin/bash
# usage: bash scripts/add_thumb.sh <run_dir>  — thumbnail.jpg vào 3 khung đầu + encode chất lượng cao cho FB (≈12 Mbps)
set -e; R=$1
[ -f $R/final_nothumb.mp4 ] || mv $R/final.mp4 $R/final_nothumb.mp4
S=$(ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 $R/final_nothumb.mp4 | tr , :)
ffmpeg -loglevel error -y -i $R/final_nothumb.mp4 -i $R/thumbnail.jpg -filter_complex "[1]scale=${S}[t];[0][t]overlay=0:0:enable='lt(n,3)'" \
  -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -b:v 12M -maxrate 16M -bufsize 24M -movflags +faststart -c:a aac -b:a 192k $R/final.mp4
ffprobe -v error -show_entries format=duration,bit_rate -of csv=p=0 $R/final.mp4
