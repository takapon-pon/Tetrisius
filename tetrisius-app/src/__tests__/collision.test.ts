import { describe, it, expect } from 'vitest';
import { checkCollision } from '../game/collision';
import { createEmptyBoard } from '../game/board';
import type { Position } from '../game/types';
import { COLS, ROWS_PHASE1 } from '../game/constants';

describe('checkCollision', () => {
  const ROWS = ROWS_PHASE1;

  it('H-01: 空きスペースでは衝突しない', () => {
    const board = createEmptyBoard(ROWS);
    const cells: Position[] = [
      { x: 5, y: 0 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 },
    ];
    expect(checkCollision(cells, board, ROWS)).toBe(false);
  });

  it('H-02: 左壁衝突', () => {
    const board = createEmptyBoard(ROWS);
    const cells: Position[] = [
      { x: 0, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 },
    ];
    expect(checkCollision(cells, board, ROWS)).toBe(true);
  });

  it('H-03: 右壁衝突', () => {
    const board = createEmptyBoard(ROWS);
    const cells: Position[] = [
      { x: COLS - 1, y: 0 }, { x: COLS, y: 0 }, { x: COLS - 1, y: 1 }, { x: COLS, y: 1 },
    ];
    expect(checkCollision(cells, board, ROWS)).toBe(true);
  });

  it('H-04: 床衝突', () => {
    const board = createEmptyBoard(ROWS);
    const cells: Position[] = [
      { x: 0, y: ROWS - 1 }, { x: 1, y: ROWS - 1 }, { x: 0, y: ROWS }, { x: 1, y: ROWS },
    ];
    expect(checkCollision(cells, board, ROWS)).toBe(true);
  });

  it('H-05: 既存ブロックとの衝突', () => {
    const board = createEmptyBoard(ROWS);
    board[10][5] = 1;
    const cells: Position[] = [
      { x: 4, y: 9 }, { x: 5, y: 9 }, { x: 4, y: 10 }, { x: 5, y: 10 },
    ];
    expect(checkCollision(cells, board, ROWS)).toBe(true);
  });

  it('BV-01: x=0の位置で左移動 → 衝突', () => {
    const board = createEmptyBoard(ROWS);
    const cells: Position[] = [{ x: -1, y: 5 }];
    expect(checkCollision(cells, board, ROWS)).toBe(true);
  });

  it('BV-04: 最下段で下移動 → 衝突', () => {
    const board = createEmptyBoard(ROWS);
    const cells: Position[] = [{ x: 0, y: ROWS }];
    expect(checkCollision(cells, board, ROWS)).toBe(true);
  });
});
