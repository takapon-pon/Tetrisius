import { describe, it, expect } from 'vitest';
import { clearLines, createEmptyBoard } from '../game/board';
import type { CellValue } from '../game/types';

describe('clearLines', () => {
  it('L-01: 1行全埋め → 消去', () => {
    const board = createEmptyBoard(20);
    for (let x = 0; x < 10; x++) board[19][x] = 1 as CellValue;
    const result = clearLines(board, 20);
    expect(result.linesCleared).toBe(1);
    expect(result.clearedRows).toContain(19);
    // 消去後、新盤面の最上段は空
    expect(result.newBoard[0].every(c => c === 0)).toBe(true);
  });

  it('L-02: 2行同時消去', () => {
    const board = createEmptyBoard(20);
    for (let x = 0; x < 10; x++) {
      board[18][x] = 1 as CellValue;
      board[19][x] = 2 as CellValue;
    }
    const result = clearLines(board, 20);
    expect(result.linesCleared).toBe(2);
  });

  it('L-03: 4行同時消去（テトリス）', () => {
    const board = createEmptyBoard(20);
    for (let y = 16; y <= 19; y++) {
      for (let x = 0; x < 10; x++) board[y][x] = 1 as CellValue;
    }
    const result = clearLines(board, 20);
    expect(result.linesCleared).toBe(4);
  });

  it('L-04: 1セル空き → 消去されない', () => {
    const board = createEmptyBoard(20);
    for (let x = 0; x < 9; x++) board[19][x] = 1 as CellValue;
    const result = clearLines(board, 20);
    expect(result.linesCleared).toBe(0);
  });

  it('L-05: 消去後、最上段に空行が追加される', () => {
    const board = createEmptyBoard(20);
    for (let x = 0; x < 10; x++) board[19][x] = 1 as CellValue;
    const result = clearLines(board, 20);
    expect(result.newBoard[0].every(c => c === 0)).toBe(true);
  });

  it('BV-05: 完全に空の盤面 → 消去なし', () => {
    const board = createEmptyBoard(20);
    const result = clearLines(board, 20);
    expect(result.linesCleared).toBe(0);
  });

  it('BV-19: フェーズ2で最下行(y=24)消去 → クリア判定可能', () => {
    const board = createEmptyBoard(25);
    for (let x = 0; x < 10; x++) board[24][x] = 1 as CellValue;
    const result = clearLines(board, 25);
    expect(result.linesCleared).toBe(1);
    expect(result.clearedRows).toContain(24);
  });

  it('BV-21: 最下行以外のみ消去 → 最下行は含まない', () => {
    const board = createEmptyBoard(25);
    for (let x = 0; x < 10; x++) board[20][x] = 1 as CellValue;
    const result = clearLines(board, 25);
    expect(result.linesCleared).toBe(1);
    expect(result.clearedRows).not.toContain(24);
  });
});
