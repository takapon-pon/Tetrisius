import { describe, it, expect } from 'vitest';
import {
  createInitialPool,
  drawFromPool,
  eliminateFromPool,
  isSamePoolItem,
} from '../game/block-pool';
import type { PoolItem } from '../game/types';

describe('BlockPool', () => {
  it('P-01: 初期プールは9種', () => {
    const pool = createInitialPool();
    expect(pool).toHaveLength(9);
  });

  it('P-02: 抽選はプール内のアイテムを返す', () => {
    const pool = createInitialPool();
    const result = drawFromPool(pool);
    expect(pool.some(p => isSamePoolItem(p, result))).toBe(true);
  });

  it('P-03: 除外後にプールが1つ減る', () => {
    const pool = createInitialPool();
    const newPool = eliminateFromPool(pool, { type: 'tetromino', shape: 'I' });
    expect(newPool).toHaveLength(8);
    expect(newPool.some(p => p.type === 'tetromino' && p.shape === 'I')).toBe(false);
  });

  it('P-04: 除外後に抽選で除外アイテムが出ない', () => {
    const pool = createInitialPool();
    const newPool = eliminateFromPool(pool, { type: 'tetromino', shape: 'I' });
    for (let i = 0; i < 100; i++) {
      const result = drawFromPool(newPool);
      expect(result.type === 'tetromino' && result.shape === 'I').toBe(false);
    }
  });

  it('P-05: 同一テトリミノ判定', () => {
    expect(isSamePoolItem(
      { type: 'tetromino', shape: 'I' },
      { type: 'tetromino', shape: 'I' },
    )).toBe(true);
  });

  it('P-06: 異なるテトリミノ判定', () => {
    expect(isSamePoolItem(
      { type: 'tetromino', shape: 'I' },
      { type: 'tetromino', shape: 'O' },
    )).toBe(false);
  });

  it('P-07: エース同士は同一', () => {
    expect(isSamePoolItem({ type: 'ace' }, { type: 'ace' })).toBe(true);
  });

  it('P-08: エースとジョーカーは異なる', () => {
    expect(isSamePoolItem({ type: 'ace' }, { type: 'joker' })).toBe(false);
  });

  it('BV-11: pool.length=2で除外 → 1になる', () => {
    const pool: PoolItem[] = [
      { type: 'ace' },
      { type: 'joker' },
    ];
    const newPool = eliminateFromPool(pool, { type: 'joker' });
    expect(newPool).toHaveLength(1);
    expect(newPool[0].type).toBe('ace');
  });

  it('BV-12: pool.length=1では除外不可', () => {
    const pool: PoolItem[] = [{ type: 'ace' }];
    const newPool = eliminateFromPool(pool, { type: 'ace' });
    expect(newPool).toHaveLength(1);
  });

  it('BV-13: pool.length=1で抽選 → 唯一のアイテム', () => {
    const pool: PoolItem[] = [{ type: 'joker' }];
    const result = drawFromPool(pool);
    expect(result.type).toBe('joker');
  });
});
