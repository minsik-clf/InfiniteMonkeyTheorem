export interface Mission {
  id: number;
  target: string;
  charPool: string;
  goldPerMatch: number;
  completionBonus: number;
}

const SHAPE_CHARS = '○△□';
const ALPHA_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const MISSIONS: Mission[] = [
  // --- Phase 1: Shape symbols (pool size 3) ---
  {
    id: 1,
    target: '○',
    charPool: SHAPE_CHARS,
    goldPerMatch: 3,
    completionBonus: 50,
  },
  {
    id: 2,
    target: '△',
    charPool: SHAPE_CHARS,
    goldPerMatch: 3,
    completionBonus: 50,
  },
  {
    id: 3,
    target: '□○',
    charPool: SHAPE_CHARS,
    goldPerMatch: 5,
    completionBonus: 120,
  },
  {
    id: 4,
    target: '○△',
    charPool: SHAPE_CHARS,
    goldPerMatch: 5,
    completionBonus: 120,
  },
  {
    id: 5,
    target: '□○△',
    charPool: SHAPE_CHARS,
    goldPerMatch: 8,
    completionBonus: 250,
  },
  {
    id: 6,
    target: '△○□',
    charPool: SHAPE_CHARS,
    goldPerMatch: 8,
    completionBonus: 250,
  },
  {
    id: 7,
    target: '○□△○',
    charPool: SHAPE_CHARS,
    goldPerMatch: 12,
    completionBonus: 500,
  },
  {
    id: 8,
    target: '□△○□',
    charPool: SHAPE_CHARS,
    goldPerMatch: 12,
    completionBonus: 500,
  },
  {
    id: 9,
    target: '△□○△□',
    charPool: SHAPE_CHARS,
    goldPerMatch: 18,
    completionBonus: 1_000,
  },
  {
    id: 10,
    target: '○△□○△□',
    charPool: SHAPE_CHARS,
    goldPerMatch: 25,
    completionBonus: 2_000,
  },

  // --- Phase 2: Alphabet (pool 26, 클리어 시 보너스 대폭) ---
  {
    id: 11,
    target: 'GO',
    charPool: ALPHA_CHARS,
    goldPerMatch: 150,
    completionBonus: 50_000,
  },
  {
    id: 12,
    target: 'APE',
    charPool: ALPHA_CHARS,
    goldPerMatch: 350,
    completionBonus: 200_000,
  },
  {
    id: 13,
    target: 'TYPE',
    charPool: ALPHA_CHARS,
    goldPerMatch: 700,
    completionBonus: 600_000,
  },
  {
    id: 14,
    target: 'MONEY',
    charPool: ALPHA_CHARS,
    goldPerMatch: 1_400,
    completionBonus: 2_000_000,
  },
  {
    id: 15,
    target: 'BANANA',
    charPool: ALPHA_CHARS,
    goldPerMatch: 2_800,
    completionBonus: 6_000_000,
  },
  {
    id: 16,
    target: 'THEOREM',
    charPool: ALPHA_CHARS,
    goldPerMatch: 5_000,
    completionBonus: 18_000_000,
  },
  {
    id: 17,
    target: 'KEYBOARD',
    charPool: ALPHA_CHARS,
    goldPerMatch: 9_000,
    completionBonus: 50_000_000,
  },
  {
    id: 18,
    target: 'EVOLUTION',
    charPool: ALPHA_CHARS,
    goldPerMatch: 16_000,
    completionBonus: 140_000_000,
  },
  {
    id: 19,
    target: 'CHIMPANZEE',
    charPool: ALPHA_CHARS,
    goldPerMatch: 28_000,
    completionBonus: 380_000_000,
  },
  {
    id: 20,
    target: 'SHAKESPEARE',
    charPool: ALPHA_CHARS,
    goldPerMatch: 48_000,
    completionBonus: 1_000_000_000,
  },
  {
    id: 21,
    target: 'INFINITETYPE',
    charPool: ALPHA_CHARS,
    goldPerMatch: 80_000,
    completionBonus: 2_500_000_000,
  },
  {
    id: 22,
    target: 'MONKEYTHEOREM',
    charPool: ALPHA_CHARS,
    goldPerMatch: 130_000,
    completionBonus: 6_000_000_000,
  },
];
