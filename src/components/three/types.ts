import type { PaletteName } from './palette';

export interface SceneProps {
  palette: PaletteName;
  reducedMotion: boolean;
  lowDetail: boolean;
}
