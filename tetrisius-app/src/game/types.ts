export type TetrominoShape = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type PoolItem =
  | { type: 'tetromino'; shape: TetrominoShape }
  | { type: 'ace' }
  | { type: 'joker' };

export interface Position {
  x: number;
  y: number;
}

export interface ActiveBlock {
  shape: TetrominoShape;
  position: Position;
  rotation: number;
  cells: Position[];
}

export type GamePhase = 'start' | 'phase1' | 'phase2' | 'result';

export type Phase2SubState =
  | 'idle'
  | 'drawing'
  | 'playing'
  | 'selecting'
  | 'eliminating';

export type ResultType = 'clear' | 'gameover';

export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Board = CellValue[][];
