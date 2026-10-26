// הזמנים של כל המודעה באים מהקריינות. public/words.json נוצר מ-whisper (npm run words),
// וכל רגע בסרטון נקבע לפי מילה ולא לפי מספר פריים. הקלטה חדשה = npm run words, וכל הסרטון מתיישר לבד.
import words from '../public/words.json';

export const FPS = 30;
export type Word = {w: string; s: number; e: number};
export const WORDS = words as Word[];

// מילה, [מילה, מופע] כשהיא חוזרת כמה פעמים, או שנייה מפורשת
export type When = string | [string, number] | number;

const norm = (x: string) => x.replace(/[^\p{L}\p{N}]/gu, '');

const loose = (x: string) => norm(x).replace(/[יו]/g, '');
const dist = (a: string, b: string) => {
  const d = Array.from({length: a.length + 1}, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};

export const word = (w: string, nth = 1): Word => {
  const k = norm(w);
  let c = 0;
  for (const x of WORDS) if (norm(x.w) === k && ++c === nth) return x;
  // הצעות: whisper כותב לפעמים בכתיב מלא או חסר (אמא/אימא, מאתיים/מתיים), אז משווים בלי י/ו ומרשים טעות אחת
  const near = [...new Set(WORDS.filter((x) => dist(loose(x.w), loose(w)) <= 1 || norm(x.w).includes(k)).map((x) => x.w))].slice(0, 5);
  throw new Error(`המילה "${w}" (מופע ${nth}) לא נמצאה בקריינות.${near.length ? ' אולי התכוונת ל: ' + near.join(', ') : ''} תבדוק את public/words.json`);
};

// התחלה וסוף של רגע, בשניות של הקריינות
export const sec = (x: When): number => (typeof x === 'number' ? x : Array.isArray(x) ? word(x[0], x[1]).s : word(x).s);
export const secEnd = (x: When): number => (typeof x === 'number' ? x : Array.isArray(x) ? word(x[0], x[1]).e : word(x).e);

// שניות ← פריים
export const at = (s: number) => Math.round(s * FPS);
export const f = (x: When) => at(sec(x));

export const VO_END = WORDS.length ? WORDS[WORDS.length - 1].e : 5;
// הסרטון נגמר כשהקריינות נגמרת, עם זנב קצר. קצר מזה = ה-CTA נחתך
export const DURATION = at(VO_END) + 8;
