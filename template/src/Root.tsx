import React from 'react';
import {Composition} from 'remotion';
import {Ad, validate} from './Ad';
import {DURATION, FPS} from './time';

validate();

// גרסה לכל מוזיקה, כדי לבדוק A/B בממומן. השמות = קבצים ב-public/music
export const MUSICS = ['funkee-monkeee', 'gimme-that-groove', 'sounds-good'];

export const RemotionRoot: React.FC = () => (
  <>
    {MUSICS.map((m) => (
      <Composition key={m} id={'Ad-' + m} component={Ad} defaultProps={{music: m}} durationInFrames={DURATION} fps={FPS} width={1080} height={1920}/>
    ))}
  </>
);
