import type { Position, Board } from './types';
import { COLS } from './constants';

export function checkCollision(
  cells: Position[],
  board: Board,
  rows: number,
  cols: number = COLS,
): boolean {
  for (const cell of cells) {
    if (cell.x < 0 || cell.x >= cols) return true;
    if (cell.y < 0 || cell.y >= rows) return true;
    if (board[cell.y] && board[cell.y][cell.x] !== 0) return true;
  }
  return false;
}
