#!/bin/bash
# ניקוי הקלטה: חיתוך שקטים ארוכים, נרמול ל-16 LUFS, ותמלול מילה-מילה.
# שימוש: npm run vo -- path/to/recording.m4a
set -e
cd "$(dirname "$0")/.."
IN="${1:?תן נתיב להקלטה}"
mkdir -p vo public
# שקט מעל 0.25 שניות נחתך ל-0.25. אם המשפטים נדבקים מדי, להעלות את stop_duration
ffmpeg -y -loglevel error -i "$IN" -af "silenceremove=start_periods=1:start_threshold=-40dB:stop_periods=-1:stop_duration=0.25:stop_threshold=-40dB,loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -ac 1 public/vo.wav
ffmpeg -y -loglevel error -i public/vo.wav -ar 16000 -ac 1 vo/vo16.wav
echo "אורך הקריינות: $(ffprobe -v error -show_entries format=duration -of csv=p=0 public/vo.wav) שניות"
echo "שקטים שנשארו (אמור להיות כמעט ריק):"
ffmpeg -i public/vo.wav -af silencedetect=noise=-40dB:d=0.4 -f null - 2>&1 | grep silence_duration || echo "  אין"
node scripts/words.mjs
