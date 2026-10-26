#!/bin/bash
# מוריד אפקטים ומוזיקה מ-Mixkit (רישיון חינמי לשימוש מסחרי, בלי קרדיט): https://mixkit.co/license/
set -e
cd "$(dirname "$0")/.."
mkdir -p public/sfx public/music
get() { [ -s "$2" ] || curl -sfL "$1" -o "$2" || echo "לא הצלחתי להוריד $2"; }
for pair in note:2354 ding:2867 stamp:2150 pop:3005 whoosh:1490 coin:1992 cash:1936 tick:2364 dm:2357 cta:2870; do
  get "https://assets.mixkit.co/active_storage/sfx/${pair#*:}/${pair#*:}-preview.mp3" "public/sfx/${pair%%:*}.mp3"
done
for pair in funkee-monkeee:1140 gimme-that-groove:872 sounds-good:1077; do
  get "https://assets.mixkit.co/music/${pair#*:}/${pair#*:}.mp3" "public/music/${pair%%:*}.mp3"
done
ls public/sfx public/music
