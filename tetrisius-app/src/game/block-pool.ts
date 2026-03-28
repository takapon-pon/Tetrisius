import type { PoolItem, TetrominoShape } from './types';

const ALL_SHAPES: TetrominoShape[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export function createInitialPool(): PoolItem[] {
  return [
    ...ALL_SHAPES.map(shape => ({ type: 'tetromino' as const, shape })),
    { type: 'ace' as const },
    { type: 'joker' as const },
  ];
}

export function drawFromPool(pool: PoolItem[]): PoolItem {
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

export function eliminateFromPool(pool: PoolItem[], item: PoolItem): PoolItem[] {
  if (pool.length <= 1) return pool;
  return pool.filter(p => !isSamePoolItem(p, item));
}

export function isSamePoolItem(a: PoolItem, b: PoolItem): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'tetromino' && b.type === 'tetromino') {
    return a.shape === b.shape;
  }
  return true;
}

export function getPoolItemLabel(item: PoolItem): string {
  if (item.type === 'tetromino') return item.shape;
  if (item.type === 'ace') return 'ACE';
  return 'JOKER';
}
