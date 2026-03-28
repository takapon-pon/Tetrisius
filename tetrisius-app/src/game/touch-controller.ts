import { SWIPE_THRESHOLD, TAP_THRESHOLD } from './constants';

export interface TouchCallbacks {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotate: () => void;
}

type Gesture = 'left' | 'right' | 'down' | 'up' | 'tap';

export class TouchController {
  private element: HTMLElement;
  private callbacks: TouchCallbacks;
  private startX = 0;
  private startY = 0;
  private lastMoveX = 0;
  private movedCells = 0;
  private cellSize: number;
  private active = true;

  constructor(element: HTMLElement, callbacks: TouchCallbacks, cellSize: number) {
    this.element = element;
    this.callbacks = callbacks;
    this.cellSize = cellSize;

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);

    element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
  }

  setActive(active: boolean) {
    this.active = active;
  }

  setCellSize(size: number) {
    this.cellSize = size;
  }

  private handleTouchStart(e: TouchEvent) {
    if (!this.active) return;
    e.preventDefault();
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.lastMoveX = touch.clientX;
    this.movedCells = 0;
  }

  private handleTouchMove(e: TouchEvent) {
    if (!this.active) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - this.lastMoveX;

    // 横方向のドラッグ: セルサイズ分動いたら移動
    if (Math.abs(dx) >= this.cellSize) {
      const cellsMoved = Math.floor(Math.abs(dx) / this.cellSize);
      for (let i = 0; i < cellsMoved; i++) {
        if (dx > 0) {
          this.callbacks.onMoveRight();
        } else {
          this.callbacks.onMoveLeft();
        }
      }
      this.lastMoveX += (dx > 0 ? 1 : -1) * cellsMoved * this.cellSize;
      this.movedCells += cellsMoved;
    }
  }

  private handleTouchEnd(e: TouchEvent) {
    if (!this.active) return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    const dx = touch.clientX - this.startX;
    const dy = touch.clientY - this.startY;

    // ドラッグ中に移動していた場合、追加のジェスチャー判定はしない
    if (this.movedCells > 0) {
      // ただし下方向に大きくスワイプしていたらソフトドロップ
      if (dy > SWIPE_THRESHOLD * 2 && Math.abs(dy) > Math.abs(dx) * 2) {
        this.callbacks.onSoftDrop();
      }
      return;
    }

    const gesture = this.classifyGesture(dx, dy);
    switch (gesture) {
      case 'tap':
        this.callbacks.onRotate();
        break;
      case 'down':
        this.callbacks.onSoftDrop();
        break;
      case 'up':
        this.callbacks.onHardDrop();
        break;
      case 'left':
        this.callbacks.onMoveLeft();
        break;
      case 'right':
        this.callbacks.onMoveRight();
        break;
    }
  }

  private classifyGesture(dx: number, dy: number): Gesture {
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < TAP_THRESHOLD && absDy < TAP_THRESHOLD) {
      return 'tap';
    }

    if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) {
      return 'tap';
    }

    if (absDy > absDx) {
      return dy > 0 ? 'down' : 'up';
    } else {
      return dx > 0 ? 'right' : 'left';
    }
  }

  destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
  }
}
