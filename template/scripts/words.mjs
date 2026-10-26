// whisper על vo/vo16.wav ← public/words.json: [{w, s, e}] בשניות, ומדפיס את הקריינות עם זמנים לבחירת עוגנים
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {homedir} from 'node:os';

const model = process.env.WHISPER_MODEL || [`${homedir()}/.whisper/models/ggml-large-v3-turbo.bin`, '/opt/homebrew/share/whisper-cpp/ggml-large-v3-turbo.bin'].find(existsSync);
if (!model) throw new Error('לא מצאתי מודל whisper. תוריד: curl -L --create-dirs -o ~/.whisper/models/ggml-large-v3-turbo.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin');
execFileSync('whisper-cli', ['-m', model, '-l', 'he', '-ojf', '-ml', '1', '-sow', '-of', 'vo/whisper', '-f', 'vo/vo16.wav'], {stdio: ['ignore', 'ignore', 'inherit']});
const raw = JSON.parse(readFileSync('vo/whisper.json', 'utf8')).transcription;
const words = raw
  .map((x) => ({w: x.text.trim(), s: x.offsets.from / 1000, e: x.offsets.to / 1000}))
  .filter((x) => x.w && !/^\[.*\]$/.test(x.w));
writeFileSync('public/words.json', JSON.stringify(words, null, 0));
console.log(words.map((x) => `${x.s.toFixed(2)} ${x.w}`).join('\n'));
console.log(`\n${words.length} מילים ← public/words.json. אם whisper טעה במילה, לתקן ידנית בקובץ (את w, לא את הזמנים).`);
