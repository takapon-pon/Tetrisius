import type { Board, CellValue } from './types';
import { COLS } from './constants';

export function createEmptyBoard(rows: number, cols: number = COLS): Board {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0 as CellValue)
  );
}

export interface ClearResult {
  linesCleared: number;
  clearedRows: number[];
  newBoard: Board;
}

export function clearLines(board: Board, rows: number): ClearResult {
  const clearedRows: number[] = [];

  for (let y = rows - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      clearedRows.push(y);
    }
  }

  if (clearedRows.length === 0) {
    return { linesCleared: 0, clearedRows: [], newBoard: board };
  }

  const newBoard: Board = board.filter((_, y) => !clearedRows.includes(y));
  const emptyRows = Array.from({ length: clearedRows.length }, () =>
    Array.from({ length: COLS }, () => 0 as CellValue)
  );

  const result = [...emptyRows, ...newBoard];

  return {
    linesCleared: clearedRows.length,
    clearedRows,
    newBoard: result,
  };
}

export function expandBoard(board: Board, newRows: number): Board {
  const currentRows = board.length;
  const extraRows = newRows - currentRows;
  if (extraRows <= 0) return board;

  const emptyRows = Array.from({ length: extraRows }, () =>
    Array.from({ length: COLS }, () => 0 as CellValue)
  );

  return [...emptyRows, ...board];
}
