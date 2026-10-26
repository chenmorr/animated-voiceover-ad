// ===== המודעה. זה הקובץ היחיד שעורכים למודעה חדשה =====
// כל זמן כתוב כמילה מהקריינות ('לידים', או ['עוד', 2] למופע השני), ולא כמספר.
// הקלטה חדשה: npm run words, והכל מתיישר לבד. מילה שלא נמצאה = שגיאה ברורה עם הצעות.
// 1080x1920, 30fps. טקסט רק בין y=260 ל-y=1570 (מחוץ לאזורים שאינסטגרם מכסה). validate() אוכף את זה.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {f as fr, DURATION, When} from './time';
import {KT, N, note, ktRange, Kinetic, PhoneScene, AvatarScene, CounterScene, TitlesScene, OfferScene, CtaScene, Captions, cl} from './ui';

// ---- מי מדבר ----
const ME = {name: 'דני', img: undefined as string | undefined}; // תמונה: public/me.jpg ← img: 'me.jpg'

// ---- טקסט קינטי, על המילים ----
export const KTS: KT[] = [
  {t: 'אם אתה יוצר תוכן', at: 'אם', x: 540, y: 340, s: 82, r: -2, anim: 'slide'},
  {t: 'לקוחות 🎯', at: 'לקוחות', x: 540, y: 400, s: 128, bg: '#ffd166', tc: '#111', r: -5, anim: 'stamp'},
  {t: 'זמן ⏱️', at: 'זמן', x: 330, y: 350, s: 96, r: -8, anim: 'pop', until: 'בעוד'},
  {t: 'וכסף 💸', at: 'וכסף', x: 760, y: 460, s: 96, c: '#4ade80', r: 7, anim: 'pop', until: 'בעוד'},
  {t: 'עוד', at: 'בעוד', x: 800, y: 340, s: 100, r: 7, anim: 'pop', until: 'אבל'},
  {t: 'ועוד', at: 'ועוד', x: 540, y: 450, s: 100, r: -4, anim: 'pop', until: 'אבל'},
  {t: 'סרטונים 🎬', at: 'סרטונים', x: 300, y: 345, s: 90, c: '#ffd166', r: -6, anim: 'pop', until: 'אבל'},
  {t: 'אבל בסוף... 🤔', at: 'אבל', x: 540, y: 400, s: 100, anim: 'drop'},
  {t: 'אמא ❤️', at: 'אמא', x: 540, y: 380, s: 120, bg: '#ec4899', r: -6, anim: 'stamp', until: 'קוראים'},
  {t: 'לקוחות 🔥', at: 'מאתיים', x: 540, y: 350, s: 110, c: '#ffd166', r: -3, anim: 'pop', until: 'בלי'},
  {t: 'אני אראה לך איך', at: 'אני', x: 540, y: 350, s: 92, anim: 'slide'},
];

// ---- התראות ----
const FAMILY: N[] = [
  note('סרטונים', 'ig', 'Instagram', 'הסרטון שלך פורסם ✅'),
  note('אמא', 'ig', 'Instagram', 'אמא: זה הבן שלי! ❤️❤️'),
  note('אמא', 'ig', 'Instagram', 'אמא אהבה את הסרטון שלך', 8),
  note('לייק', 'ig', 'Instagram', 'אמא אהבה את הסרטון שלך'),
];
const PAY_START = fr('הבאתי');
// התראות שנכנסות בקצב שהולך ומאיץ
const CLIENTS: N[] = [0, 7, 13, 18, 23, 27, 31, 35, 39, 43, 47].map((t) => ({at: PAY_START + t, kind: 'dm', who: 'הודעה חדשה', body: 'היי, אפשר לקבוע שיחה?'}));

// ---- הסצנות. כל סצנה נכנסת על מילה ונגמרת כשהבאה נכנסת ----
type Scene = {from: When; draw: (f: number, start: number, end: number) => React.ReactNode};
const SCENES: Scene[] = [
  {from: 0, draw: (f, s, e) => <PhoneScene f={f} start={s} end={e} list={FAMILY} upload/>},
  {from: 'קוראים', draw: (f, s) => <AvatarScene f={f} start={s} img={ME.img} name={ME.name}/>},
  {from: 'הבאתי', draw: (f, s) => <CounterScene f={f} start={s} to={200} full={fr(['לקוחות', 2])} suffix="" list={CLIENTS}
    stamp={{t: '0 שיחות מכירה', at: fr('מכירה') + 4}}/>},
  {from: 'זה', draw: (f) => <TitlesScene f={f} lines={[{t: 'זה לא מזל.', at: fr('זה')}, {t: 'זו שיטה.', at: fr('שיטה'), c: '#ffd166', s: 140}]}/>},
  {from: 'בשיחה', draw: (f, s) => <OfferScene f={f} start={s} title={'שיחה אחת\nאיתי'}
    chips={[{t: '⏱️ קצרה', at: fr('קצרה')}, {t: '🎁 בחינם', at: fr('ובחינם'), good: true}]}/>},
  {from: 'תלחץ', draw: (f, s) => <CtaScene f={f} start={s} img={ME.img} name={ME.name} text={'תלחץ למטה\nונדבר 👇'} button="לשיחה בחינם"/>},
];

// ---- סאונד ----
const CAPTIONS = false;  // כתוביות מלאות לצפייה בלי סאונד
const VO = 1.15;
const MUSIC = 0.22;
const SFX = 0.38;        // כל האפקטים מוכפלים בזה, כדי שהקול תמיד יהיה מעליהם
// אפקטים נוספים ביד, על מילה: [מילה, קובץ ב-public/sfx, עוצמה]
const EXTRA_SFX: [When, string, number][] = [
  [['לקוחות', 2], 'cash', 0.7],
];

// ---- בדיקות לפני רינדור: נכשל עם הסבר במקום לרנדר מודעה שבורה ----
export const validate = () => {
  const bad: string[] = [];
  for (const k of KTS) {
    const y = k.y ?? 380, s = k.s ?? 100;
    if (y - s / 2 < 260 || y + s / 2 > 1570) bad.push(`"${k.t}" מחוץ לאזור הבטוח (y=${y})`);
    const w = [...k.t].length * s * 0.55 + (k.bg ? 60 : 0);
    if (w > 1000) bad.push(`"${k.t}" רחב מדי (בערך ${Math.round(w)}px מתוך 1000). תקטין את s או תקצר`);
  }
  if (bad.length) throw new Error('בעיות בטקסט:\n' + bad.join('\n'));
};

const SOUND = {stamp: 'stamp', pop: 'pop', slide: 'whoosh', drop: 'whoosh'} as const;
const NOTE_SOUND = {ig: 'note', wa: 'note', dm: 'dm', pay: 'coin'} as const;

export const Ad: React.FC<{music?: string}> = ({music = 'funkee-monkeee'}) => {
  const f = useCurrentFrame();
  const starts = SCENES.map((s) => fr(s.from));
  const i = starts.reduce((a, st, k) => (f >= st ? k : a), 0);
  const end = starts[i + 1] ?? DURATION;
  const notes = [...FAMILY, ...CLIENTS];

  return (
    <AbsoluteFill style={{background: 'radial-gradient(120% 80% at 50% 30%,#2b1f45 0%,#120d1f 55%,#07050c 100%)', overflow: 'hidden', direction: 'rtl'}}>
      {SCENES[i].draw(f, starts[i], end)}
      <Kinetic f={f} list={KTS}/>
      {CAPTIONS && <Captions f={f}/>}

      <Audio src={staticFile(`music/${music}.mp3`)} volume={(x) => interpolate(x, [0, 6, DURATION - 8, DURATION], [0, MUSIC, MUSIC, 0], cl)}/>
      <Audio src={staticFile('vo.wav')} volume={VO}/>

      {KTS.map((k, j) => <Sequence key={'k' + j} from={ktRange(k, KTS[j + 1])[0]}><Audio src={staticFile(`sfx/${SOUND[k.anim]}.mp3`)} volume={(k.anim === 'stamp' ? 0.4 : 0.35) * SFX}/></Sequence>)}
      {notes.map((n, j) => <Sequence key={'n' + j} from={n.at}><Audio src={staticFile(`sfx/${NOTE_SOUND[n.kind]}.mp3`)} volume={0.5 * SFX}/></Sequence>)}
      {starts.slice(1).map((st, j) => <Sequence key={'w' + j} from={Math.max(0, st - 3)}><Audio src={staticFile('sfx/whoosh.mp3')} volume={0.35 * SFX}/></Sequence>)}
      {EXTRA_SFX.map(([w, s, v], j) => <Sequence key={'x' + j} from={fr(w)}><Audio src={staticFile(`sfx/${s}.mp3`)} volume={v * SFX}/></Sequence>)}
      <Sequence from={starts[starts.length - 1]}><Audio src={staticFile('sfx/cta.mp3')} volume={0.5 * SFX}/></Sequence>
    </AbsoluteFill>
  );
};
