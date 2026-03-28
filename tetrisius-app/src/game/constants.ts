import type { TetrominoShape } from './types';

export const COLS = 10;
export const ROWS_PHASE1 = 20;
export const ROWS_PHASE2 = 25;

export const BLOCK_COLORS: Record<TetrominoShape, string> = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000',
};

export const CELL_VALUE_MAP: Record<TetrominoShape, number> = {
  I: 1,
  O: 2,
  T: 3,
  S: 4,
  Z: 5,
  J: 6,
  L: 7,
};

export const VALUE_COLOR_MAP: Record<number, string> = {
  1: BLOCK_COLORS.I,
  2: BLOCK_COLORS.O,
  3: BLOCK_COLORS.T,
  4: BLOCK_COLORS.S,
  5: BLOCK_COLORS.Z,
  6: BLOCK_COLORS.J,
  7: BLOCK_COLORS.L,
};

export const LEVEL_SPEEDS: Record<number, number> = {
  1: 3000,
  2: 2500,
  3: 2000,
  4: 1500,
  5: 1200,
  6: 1000,
  7: 800,
  8: 600,
  9: 400,
  10: 300,
};

export const LINES_PER_LEVEL = 10;
export const MAX_LEVEL = 10;

export const DEFAULT_DROP_SPEED_PHASE2 = 3000;

export const SCORE_TABLE: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

// タッチ操作
export const SWIPE_THRESHOLD = 30;
export const TAP_THRESHOLD = 10;

// localStorage
export const STORAGE_KEY = 'tetrisius-save';
export const STORAGE_TTL = 24 * 60 * 60 * 1000;
