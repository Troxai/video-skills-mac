import React from 'react';
import {Composition} from 'remotion';
import {FptBoard, TOTAL} from './examples/FptBoard';
// Each episode: add <Composition id="<date>-<slug>" component={...} durationInFrames={TOTAL} .../>
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="FptBoard" component={FptBoard} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
  </>
);
