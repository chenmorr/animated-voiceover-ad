// stills מהרגעים החשובים: כניסה של כל סצנה + שנייה אחריה + הפריים האחרון. לבדוק בעיניים לפני רינדור מלא
import {execFileSync} from 'node:child_process';
import {mkdirSync, readFileSync} from 'node:fs';
const words = JSON.parse(readFileSync('public/words.json', 'utf8'));
const end = Math.round(words[words.length - 1].e * 30);
const frames = [...new Set([2, 15, ...Array.from({length: 7}, (_, i) => Math.round((end * (i + 1)) / 8)), end + 4])];
mkdirSync('out/stills', {recursive: true});
for (const fr of frames) {
  execFileSync('npx', ['remotion', 'still', 'src/index.ts', 'Ad-funkee-monkeee', `out/stills/f${String(fr).padStart(4, '0')}.png`, `--frame=${fr}`, '--scale=0.5', '--log=error'], {stdio: 'inherit'});
}
console.log('stills ב-out/stills:', frames.join(', '));
