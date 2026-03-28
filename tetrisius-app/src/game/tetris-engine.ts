import type { Board, ActiveBlock, Position } from './types';
import { COLS, VALUE_COLOR_MAP, BLOCK_COLORS } from './constants';
import { getBlockCells } from './tetrominoes';
import { checkCollision } from './collision';

export class TetrisEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cellSize: number = 30;
  private rows: number;

  constructor(canvas: HTMLCanvasElement, rows: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.rows = rows;
    this.updateSize();
  }

  updateSize() {
    const container = this.canvas.parentElement;
    if (!container) return;

    const maxWidth = container.clientWidth;
    const maxHeight = container.clientHeight;

    this.cellSize = Math.floor(
      Math.min(maxWidth / COLS, maxHeight / this.rows)
    );
    this.cellSize = Math.max(16, Math.min(40, this.cellSize));

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = COLS * this.cellSize * dpr;
    this.canvas.height = this.rows * this.cellSize * dpr;
    this.canvas.style.width = `${COLS * this.cellSize}px`;
    this.canvas.style.height = `${this.rows * this.cellSize}px`;
    this.ctx.scale(dpr, dpr);
  }

  setRows(rows: number) {
    this.rows = rows;
    this.updateSize();
  }

  render(board: Board, activeBlock: ActiveBlock | null) {
    const ctx = this.ctx;
    const size = this.cellSize;
    const width = COLS * size;
    const height = this.rows * size;

    ctx.clearRect(0, 0, width, height);

    // 背景
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);

    // グリッド線
    ctx.strokeStyle = '#1a1a3a';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * size, 0);
      ctx.lineTo(x * size, height);
      ctx.stroke();
    }
    for (let y = 0; y <= this.rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * size);
      ctx.lineTo(width, y * size);
      ctx.stroke();
    }

    // 盤面ブロック
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < COLS; x++) {
        if (board[y] && board[y][x] !== 0) {
          this.drawCell(x, y, VALUE_COLOR_MAP[board[y][x]] || '#888');
        }
      }
    }

    // ゴースト
    if (activeBlock) {
      this.drawGhost(activeBlock, board);
    }

    // アクティブブロック
    if (activeBlock) {
      const color = BLOCK_COLORS[activeBlock.shape];
      for (const cell of activeBlock.cells) {
        if (cell.y >= 0) {
          this.drawCell(cell.x, cell.y, color);
        }
      }
    }
  }

  private drawCell(x: number, y: number, color: string) {
    const ctx = this.ctx;
    const size = this.cellSize;
    const px = x * size;
    const py = y * size;

    ctx.fillStyle = color;
    ctx.fillRect(px + 1, py + 1, size - 2, size - 2);

    // ハイライト
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(px + 1, py + 1, size - 2, 2);
    ctx.fillRect(px + 1, py + 1, 2, size - 2);

    // シャドウ
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(px + size - 3, py + 1, 2, size - 2);
    ctx.fillRect(px + 1, py + size - 3, size - 2, 2);
  }

  private drawGhost(activeBlock: ActiveBlock, board: Board) {
    let ghostY = 0;
    while (true) {
      const nextPosition: Position = {
        x: activeBlock.position.x,
        y: activeBlock.position.y + ghostY + 1,
      };
      const nextCells = getBlockCells(activeBlock.shape, activeBlock.rotation, nextPosition);
      if (checkCollision(nextCells, board, this.rows)) break;
      ghostY++;
    }

    const ghostPosition: Position = {
      x: activeBlock.position.x,
      y: activeBlock.position.y + ghostY,
    };
    const ghostCells = getBlockCells(activeBlock.shape, activeBlock.rotation, ghostPosition);

    const color = BLOCK_COLORS[activeBlock.shape];
    const ctx = this.ctx;
    const size = this.cellSize;

    for (const cell of ghostCells) {
      if (cell.y >= 0) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.strokeRect(cell.x * size + 1, cell.y * size + 1, size - 2, size - 2);
        ctx.globalAlpha = 1;
      }
    }
  }

  getCellSize() {
    return this.cellSize;
  }
}
