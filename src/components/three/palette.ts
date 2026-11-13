/**
 * Colour presets for the procedural How to Pirate scenes.
 * `neon` matches the current site (dark ground, purple/cyan neon accents).
 * `dusk` is an alternative warm sunset look; the choice belongs to the art direction.
 */
export type PaletteName = 'neon' | 'dusk';

export interface Palette {
  fog: number;
  waterDeep: number;
  waterMid: number;
  waterCrest: number;
  wood: number;
  woodDark: number;
  woodLight: number;
  iron: number;
  sail: number;
  sailStripe: number;
  skin: number;
  accent: number;
  accent2: number;
  danger: number;
  key: number;
  rim: number;
  skyLight: number;
  groundLight: number;
  lantern: number;
  moon: number;
  crew: [number, number, number, number];
}

export const PALETTES: Record<PaletteName, Palette> = {
  neon: {
    fog: 0x060a12,
    waterDeep: 0x071a30,
    waterMid: 0x0d3354,
    waterCrest: 0x2a7fa8,
    wood: 0x8a5532,
    woodDark: 0x4e2f1c,
    woodLight: 0xb98450,
    iron: 0x2b2f3a,
    sail: 0xe8e0cc,
    sailStripe: 0xa855f7,
    skin: 0xe0ac7e,
    accent: 0xa855f7,
    accent2: 0x22d3ee,
    danger: 0xff4d6d,
    key: 0xc9d8ff,
    rim: 0xb26bff,
    skyLight: 0x6d7fb8,
    groundLight: 0x120a1e,
    lantern: 0xffb054,
    moon: 0xe9e4ff,
    crew: [0x22d3ee, 0xa855f7, 0xf472b6, 0xfbbf24],
  },
  dusk: {
    fog: 0x1a0f1f,
    waterDeep: 0x13253f,
    waterMid: 0x24496b,
    waterCrest: 0x5f9fb8,
    wood: 0x9a5f36,
    woodDark: 0x5a341e,
    woodLight: 0xc99258,
    iron: 0x33303a,
    sail: 0xf3e6cc,
    sailStripe: 0xff7a45,
    skin: 0xe6b085,
    accent: 0xff7a45,
    accent2: 0xffd166,
    danger: 0xff3b3b,
    key: 0xffd2a6,
    rim: 0xff6ea8,
    skyLight: 0xb08aa8,
    groundLight: 0x2a1418,
    lantern: 0xffc46b,
    moon: 0xffe2b8,
    crew: [0x4cc9f0, 0xff6ea8, 0x80ed99, 0xffd166],
  },
};
