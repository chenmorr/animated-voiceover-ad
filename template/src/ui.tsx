// אבני הבניין של המודעה: טקסט קינטי, התראות, טלפון, מונה, חותמת, כרטיס הצעה, סיום ו-CTA.
import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useVideoConfig, Easing} from 'remotion';
import {at, sec, f as fr, When, WORDS} from './time';
import './fonts';

export const F = 'HeeboV, Heebo, sans-serif';
export const R = 'RubikV, Rubik, sans-serif';
export const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// ---- טקסט קינטי: כל משפט מקבל מקום, גודל, זווית וכניסה משלו ----
export type Anim = 'pop' | 'slide' | 'drop' | 'stamp';
export type KT = {t: string; at: When; until?: When; x?: number; y?: number; s?: number; c?: string; bg?: string; tc?: string; r?: number; anim: Anim};

// טווח הזמן של כל שורה: עד ה-until שלה, ואם אין, עד השורה הבאה (ולא יותר מ-1.6 שניות)
export const ktRange = (k: KT, next?: KT): [number, number] => {
  const a = at(sec(k.at));
  const b = k.until !== undefined ? at(sec(k.until)) : next ? Math.min(at(sec(next.at)), a + 48) : a + 40;
  return [a, Math.max(a + 8, b)];
};

export const Kinetic: React.FC<{f: number; list: KT[]}> = ({f, list}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      {list.map((k, i) => {
        const [A, B] = ktRange(k, list[i + 1]);
        if (f < A || f >= B) return null;
        // בחותמת בלי overshoot: אחרת היא מתכווצת מתחת לגודל שלה לפני שהיא מתייצבת
        const p = spring({frame: f - A, fps, config: k.anim === 'stamp' ? {damping: 14, stiffness: 320, overshootClamping: true} : {damping: 11, stiffness: 260}});
        const out = interpolate(f, [B - 4, B], [1, 0], cl);
        const tr = k.anim === 'pop' ? `scale(${0.2 + p * 0.8})`
          : k.anim === 'stamp' ? `scale(${2.3 - p * 1.3})`
          : k.anim === 'drop' ? `translateY(${(1 - p) * -260}px)`
          : `translateX(${(1 - p) * 700}px)`;
        return (
          <div key={i} style={{position: 'absolute', left: k.x ?? 540, top: k.y ?? 380, zIndex: 95, direction: 'rtl', whiteSpace: 'nowrap',
            transform: `translate(-50%,-50%) ${tr} rotate(${k.r || 0}deg) scale(${0.85 + out * 0.15})`, opacity: Math.min(1, p * 1.6) * out}}>
            <span style={{display: 'inline-block', fontFamily: R, fontWeight: 900, fontSize: k.s ?? 100, lineHeight: 1.1, color: k.bg ? (k.tc || '#fff') : (k.c || '#fff'),
              background: k.bg || 'transparent', padding: k.bg ? '8px 30px 14px' : 0, borderRadius: 24,
              boxShadow: k.bg ? '0 14px 40px rgba(0,0,0,.55)' : 'none',
              WebkitTextStroke: k.bg ? '0' : '4px rgba(0,0,0,.6)', paintOrder: 'stroke fill',
              textShadow: k.bg ? 'none' : '0 8px 24px rgba(0,0,0,.85)'}}>{k.t}</span>
          </div>
        );
      })}
    </>
  );
};

// ---- התראות ----
export type NKind = 'ig' | 'wa' | 'dm' | 'pay';
export type N = {at: number; kind: NKind; who: string; body: string};
// התראה על מילה, עם היסט בפריימים
export const note = (w: When, kind: NKind, who: string, body: string, plus = 0): N => ({at: fr(w) + plus, kind, who, body});

const IgIco = () => (
  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1" fill="#fff"/></svg>
);
const WaIco = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3z"/></svg>
);

export const Card: React.FC<{n: N}> = ({n}) => {
  const good = n.kind === 'dm';
  return (
    <div style={{display: 'flex', gap: 18, alignItems: 'center', direction: 'rtl', fontFamily: F, color: '#fff',
      background: good ? 'rgba(20,70,45,.88)' : 'rgba(64,64,72,.82)', borderRadius: 34, padding: '16px 20px',
      border: good ? '2px solid #4ade80' : '1px solid rgba(255,255,255,.1)',
      boxShadow: good ? '0 0 30px rgba(74,222,128,.45)' : '0 10px 26px rgba(0,0,0,.35)'}}>
      <div style={{flex: '0 0 auto', width: 76, height: 76, borderRadius: 20, display: 'grid', placeItems: 'center',
        background: n.kind === 'wa' ? '#25D366' : n.kind === 'pay' ? '#14125a' : 'radial-gradient(circle at 30% 110%,#fdf497 0%,#fd5949 45%,#d6249f 60%,#285AEB 90%)'}}>
        {n.kind === 'wa' ? <WaIco/> : n.kind === 'pay' ? <span style={{fontFamily: R, fontWeight: 900, fontSize: 44, color: '#c4b5fd'}}>₪</span> : <IgIco/>}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 30, fontWeight: 700}}>
          <span>{n.who}</span><span style={{fontWeight: 400, color: 'rgba(255,255,255,.6)', fontSize: 26}}>עכשיו</span>
        </div>
        <div style={{fontSize: 38, fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{n.body}</div>
      </div>
    </div>
  );
};

// ערימה: החדשה למעלה, וכל אחת דוחפת את הקודמות למטה בצורה רכה
export const Stack: React.FC<{list: N[]; f: number}> = ({list, f}) => {
  const {fps} = useVideoConfig();
  const shown = list.filter((n) => f >= n.at);
  return (
    <div style={{position: 'relative'}}>
      {shown.map((n, i) => {
        const above = shown.slice(i + 1).reduce((a, m) => a + interpolate(f - m.at, [0, 6], [0, 1], cl), 0);
        const p = spring({frame: f - n.at, fps, config: {damping: 13, stiffness: 220}});
        return (
          <div key={i} style={{position: 'absolute', left: 0, right: 0, top: above * 122,
            transform: `translateY(${(1 - p) * -60}px) scale(${0.88 + p * 0.12})`, opacity: Math.min(1, p * 1.5), zIndex: 50 - i}}>
            <Card n={n}/>
          </div>
        );
      })}
    </div>
  );
};

// טלפון: מסך נעילה בהטיה תלת-ממדית, עם רטט קצר על כל התראה
export const Phone: React.FC<{f: number; list: N[]; zoom: number; tilt: number; clock?: string; date?: string; extra?: React.ReactNode}> = ({f, list, zoom, tilt, clock = '21:47', date = 'יום שני', extra}) => {
  const shake = list.reduce((a, n) => {
    const t = f - n.at;
    return t >= 0 && t < 7 ? a + Math.sin(t * 2.6) * (7 - t) * 1.4 : a;
  }, 0);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 580, display: 'flex', justifyContent: 'center', perspective: 2200}}>
      <div style={{width: 740, height: 980, borderRadius: 88, border: '14px solid #1d1d22', background: 'linear-gradient(170deg,#2c3c5c,#141c30 60%,#0b0f1c)',
        boxShadow: '0 50px 120px rgba(0,0,0,.7), 0 0 0 2px #3a3a42', overflow: 'hidden', padding: '40px 26px', position: 'relative',
        transform: `translateX(${shake}px) rotateY(${tilt}deg) rotateX(5deg) scale(${zoom})`, transformOrigin: '50% 30%'}}>
        <div style={{textAlign: 'center', color: '#fff', fontFamily: F}}>
          <div style={{fontSize: 32, opacity: .85}}>{date}</div>
          <div style={{fontFamily: '-apple-system, Heebo', fontSize: 130, fontWeight: 300, lineHeight: 1, marginBottom: 24}}>{clock}</div>
        </div>
        <Stack list={list} f={f}/>
        {extra}
      </div>
    </div>
  );
};

// ---- הסצנות. כל אחת מקבלת f = פריים מתחילת הסרטון ו-start = הפריים שבו היא נכנסה ----

// טלפון שמתמלא בהתראות. זום פנימה בכניסה ויציאה איטית.
// upload: פס העלאה של אינסטגרם שמתמלא עד ההתראה הראשונה, כדי שהפריים הראשון לא יהיה ריק
export const PhoneScene: React.FC<{f: number; start: number; end: number; list: N[]; upload?: boolean}> = ({f, start, end, list, upload}) => {
  const z = interpolate(f, [start, start + 20, end], [1.3, 1.08, 1.0], {...cl, easing: Easing.out(Easing.cubic)});
  const t = interpolate(f, [start, end], [-9, 5], cl);
  const first = list.length ? list[0].at : end;
  const pct = interpolate(f, [start, first - 6], [12, 100], {...cl, easing: Easing.out(Easing.quad)});
  const bar = upload && f < first + 4 ? (
    <div style={{position: 'absolute', left: 26, right: 26, top: 330, background: 'rgba(64,64,72,.9)', borderRadius: 34, padding: '26px 28px', direction: 'rtl', fontFamily: F, color: '#fff',
      opacity: interpolate(f, [first, first + 4], [1, 0], cl)}}>
      <div style={{fontSize: 34, fontWeight: 700}}>{pct < 100 ? 'Instagram · מעלה את הסרטון שלך' : 'Instagram · הסרטון שלך פורסם ✅'}</div>
      <div style={{height: 22, borderRadius: 99, background: '#2a2a30', marginTop: 18, overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#f58529,#dd2a7b,#8134af)'}}/>
      </div>
      <div style={{fontSize: 30, marginTop: 10, color: '#bbb'}}>{Math.round(pct)}%</div>
    </div>
  ) : null;
  return <Phone f={f} list={list} zoom={z} tilt={t} extra={bar}/>;
};

// תמונה עגולה + שם
// בלי תמונה מוצגת האות הראשונה של השם. תמונה אמיתית שמים ב-public/ ומעבירים את שם הקובץ
const Face: React.FC<{img?: string; name: string; size: number}> = ({img, name, size}) => {
  const st = {width: size, height: size, borderRadius: '50%', border: '8px solid #a855f7', boxShadow: '0 0 80px rgba(168,85,247,.55)'};
  return img ? <Img src={staticFile(img)} style={{...st, objectFit: 'cover'}}/>
    : <div style={{...st, margin: '0 auto', display: 'grid', placeItems: 'center', background: 'linear-gradient(140deg,#7c3aed,#db2777)', fontFamily: R, fontWeight: 900, fontSize: size * 0.45, color: '#fff'}}>{name.slice(0, 1)}</div>;
};

export const AvatarScene: React.FC<{f: number; start: number; img?: string; name: string}> = ({f, start, img, name}) => {
  const {fps} = useVideoConfig();
  const p = spring({frame: f - start, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${0.6 + p * 0.4})`, opacity: p, textAlign: 'center'}}>
        <Face img={img} name={name} size={560}/>
        <div style={{fontFamily: R, fontWeight: 900, fontSize: 96, color: '#fff', marginTop: 30}}>{name}</div>
      </div>
    </AbsoluteFill>
  );
};

// מונה שרץ עד מספר, עם התראות תשלום בטלפון וחותמת אופציונלית
export const CounterScene: React.FC<{f: number; start: number; to: number; full: number; suffix?: string; list: N[]; stamp?: {t: string; at: number}}> = ({f, start, to, full, suffix = ' ₪', list, stamp}) => {
  const {fps} = useVideoConfig();
  const v = Math.round(interpolate(f, [start, full], [0, to], {...cl, easing: Easing.out(Easing.quad)}));
  const p = spring({frame: f - start, fps, config: {damping: 12}});
  const st = stamp ? spring({frame: f - stamp.at, fps, config: {damping: 8, stiffness: 260}}) : 0;
  return (
    <>
      <Phone f={f} list={list} zoom={1} tilt={-3}/>
      <div style={{position: 'absolute', top: 1370, left: 0, right: 0, textAlign: 'center', zIndex: 60, transform: `scale(${0.7 + p * 0.3})`}}>
        <span style={{display: 'inline-block', background: 'rgba(5,30,15,.92)', border: '3px solid #4ade80', borderRadius: 34, padding: '14px 40px', boxShadow: '0 0 50px rgba(74,222,128,.5)',
          fontFamily: R, fontWeight: 900, fontSize: 96, color: '#4ade80', direction: 'ltr'}}>{v.toLocaleString('en-US')}{suffix}</span>
      </div>
      {stamp && f >= stamp.at && (
        <div style={{position: 'absolute', top: 760, left: 0, right: 0, textAlign: 'center', zIndex: 70}}>
          <span style={{display: 'inline-block', border: '10px solid #ff3b3b', color: '#ff3b3b', background: 'rgba(0,0,0,.55)', borderRadius: 26,
            padding: '10px 40px', fontFamily: R, fontWeight: 900, fontSize: 88, transform: `rotate(-10deg) scale(${2.2 - st * 1.2})`, opacity: Math.min(1, st * 1.5)}}>{stamp.t}</span>
        </div>
      )}
    </>
  );
};

// מסך שחור עם שורות שנכנסות אחת אחרי השנייה ("זה לא מזל. / זו אסטרטגיה.")
export const TitlesScene: React.FC<{f: number; lines: {t: string; at: number; c?: string; s?: number}[]}> = ({f, lines}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: R}}>
      {lines.map((l, i) => {
        const p = spring({frame: f - l.at, fps, config: {damping: 10, stiffness: 220}});
        return <div key={i} style={{fontWeight: 900, fontSize: l.s ?? 120, color: l.c ?? '#fff', marginTop: i ? 30 : 0, opacity: p, transform: `scale(${0.55 + p * 0.45})`}}>{l.t}</div>;
      })}
    </AbsoluteFill>
  );
};

// כרטיס ההצעה עם צ'יפים שמורידים חסמים (קצרה / בחינם / בלי התחייבות)
export const OfferScene: React.FC<{f: number; start: number; title: string; chips: {t: string; at: number; good?: boolean}[]}> = ({f, start, title, chips}) => {
  const {fps} = useVideoConfig();
  const p = spring({frame: f - start, fps, config: {damping: 13}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 880, background: '#17121f', border: '3px solid #a855f7', borderRadius: 48, padding: '60px 50px', textAlign: 'center', transform: `scale(${0.8 + p * 0.2})`, opacity: p}}>
        <div style={{fontFamily: R, fontWeight: 900, fontSize: 84, color: '#fff', lineHeight: 1.15, whiteSpace: 'pre-line'}}>{title}</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 22, marginTop: 44, alignItems: 'center'}}>
          {chips.map((c, i) => {
            const q = spring({frame: f - c.at, fps, config: {damping: 10, stiffness: 240}});
            return <div key={i} style={{fontFamily: R, fontWeight: 800, fontSize: 64, color: c.good ? '#4ade80' : '#fff', opacity: q, transform: `scale(${0.5 + q * 0.5})`}}>{c.t}</div>;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// הסיום: תמונה, הנעה לפעולה וכפתור שפועם
export const CtaScene: React.FC<{f: number; start: number; img?: string; name: string; text: string; button: string}> = ({f, start, img, name, text, button}) => {
  const {fps} = useVideoConfig();
  const p = spring({frame: f - start, fps, config: {damping: 13}});
  const pulse = 1 + Math.max(0, Math.sin((f - start) / 5)) * 0.05;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
      <div style={{transform: `translateY(${(1 - p) * 60}px)`, opacity: p}}>
        <Face img={img} name={name} size={380}/>
        <div style={{fontFamily: R, fontWeight: 900, fontSize: 86, color: '#fff', marginTop: 34, lineHeight: 1.15, whiteSpace: 'pre-line'}}>{text}</div>
        <div style={{display: 'inline-block', marginTop: 44, background: '#ffd166', color: '#111', fontFamily: R, fontWeight: 900, fontSize: 50, padding: '26px 44px', borderRadius: 999,
          whiteSpace: 'nowrap', transform: `scale(${pulse})`}}>{button}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---- כתוביות (לצפייה בלי סאונד). שורה אחת, נשברת לפי פיסוק, לא גולשת למשפט הבא ----
const lines = (() => {
  const out: {s: number; e: number; t: string}[] = [];
  let cur: typeof WORDS = [];
  const flush = () => { if (cur.length) out.push({s: cur[0].s, e: cur[cur.length - 1].e, t: cur.map((w) => w.w).join(' ')}); cur = []; };
  for (const w of WORDS) {
    cur.push(w);
    const len = cur.map((x) => x.w).join(' ').length;
    if (/[.,!?:]$/.test(w.w) || len > 22) flush();
  }
  flush();
  return out;
})();

export const Captions: React.FC<{f: number}> = ({f}) => {
  const l = lines.find((x) => f >= at(x.s) && f < at(x.e) + 4);
  if (!l) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1440, zIndex: 120, textAlign: 'center', direction: 'rtl'}}>
      <span style={{display: 'inline-block', background: 'rgba(0,0,0,.72)', color: '#fff', fontFamily: F, fontWeight: 800, fontSize: 54, padding: '10px 26px', borderRadius: 18}}>
        {l.t.replace(/[.,]$/, '')}
      </span>
    </div>
  );
};
