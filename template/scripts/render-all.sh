#!/bin/bash
# מרנדר את כל הגרסאות (מוזיקה) ובודק שכל קובץ באורך הקריינות
set -e
cd "$(dirname "$0")/.."
rm -rf "${TMPDIR:-/tmp}"/remotion-webpack-bundle-* 2>/dev/null || true   # bundle ישן = קוד ישן ברינדור
mkdir -p out
VO=$(ffprobe -v error -show_entries format=duration -of csv=p=0 public/vo.wav)
for id in $(npx remotion compositions src/index.ts --quiet 2>/dev/null); do
  npx remotion render src/index.ts "$id" "out/$id.mp4" --codec=h264 --crf=18 --audio-bitrate=192k --timeout=180000 --log=error
  D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "out/$id.mp4")
  echo "$id: $D שניות (קריינות $VO)"
done
