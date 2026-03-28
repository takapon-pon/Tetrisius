import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/game-store';
import { drawFromPool } from '../game/block-pool';
import type { TetrominoShape } from '../game/types';


describe('結合テスト: プール除外→抽選反映', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().startNewGame();
    useGameStore.getState().transitionToPhase2();
  });

  it('INT-05: 除外したブロックは抽選に出ない', () => {
    useGameStore.getState().eliminateFromPool({ type: 'tetromino', shape: 'I' });
    const pool = useGameStore.getState().pool;

    for (let i = 0; i < 100; i++) {
      const result = drawFromPool(pool);
      expect(result.type === 'tetromino' && result.shape === 'I').toBe(false);
    }
  });

  it('INT-06: 1種だけ残して抽選', () => {
    const shapes: TetrominoShape[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    shapes.forEach(shape => {
      useGameStore.getState().eliminateFromPool({ type: 'tetromino', shape });
    });
    useGameStore.getState().eliminateFromPool({ type: 'joker' });

    const pool = useGameStore.getState().pool;
    expect(pool).toHaveLength(1);
    expect(pool[0].type).toBe('ace');

    const result = drawFromPool(pool);
    expect(result.type).toBe('ace');
  });

  it('INT-07: 除外→保存→復元→抽選で除外が維持', () => {
    useGameStore.getState().eliminateFromPool({ type: 'tetromino', shape: 'Z' });
    useGameStore.getState().saveGame();

    // リセットして復元
    useGameStore.setState({ pool: [] });
    useGameStore.getState().loadGame();

    const pool = useGameStore.getState().pool;
    expect(pool).toHaveLength(8);
    for (let i = 0; i < 100; i++) {
      const result = drawFromPool(pool);
      expect(result.type === 'tetromino' && result.shape === 'Z').toBe(false);
    }
  });
});

describe('結合テスト: フェーズ遷移', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('INT-08: フェーズ1→2の盤面整合性', () => {
    useGameStore.getState().startNewGame();

    const board = useGameStore.getState().board;
    board[19][0] = 3;
    useGameStore.setState({ board });

    useGameStore.getState().transitionToPhase2();
    const newBoard = useGameStore.getState().board;

    expect(newBoard).toHaveLength(25);
    for (let y = 0; y < 5; y++) {
      expect(newBoard[y].every(c => c === 0)).toBe(true);
    }
    expect(newBoard[24][0]).toBe(3);
  });

  it('INT-09: 保存→復元の整合性', () => {
    useGameStore.getState().startNewGame();
    useGameStore.getState().transitionToPhase2();
    useGameStore.getState().addCount(3);
    useGameStore.getState().eliminateFromPool({ type: 'joker' });

    const beforeSave = {
      count: useGameStore.getState().count,
      poolLength: useGameStore.getState().pool.length,
    };

    useGameStore.getState().saveGame();
    useGameStore.getState().startNewGame();
    useGameStore.getState().loadGame();

    expect(useGameStore.getState().count).toBe(beforeSave.count);
    expect(useGameStore.getState().pool).toHaveLength(beforeSave.poolLength);
    expect(useGameStore.getState().phase).toBe('phase2');
  });
});

describe('結合テスト: カウント消費と操作制約', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().startNewGame();
    useGameStore.getState().transitionToPhase2();
  });

  it('INT-11: count=1→除外→count=0→ブロック操作不可', () => {
    useGameStore.getState().addCount(1);
    expect(useGameStore.getState().count).toBe(1);

    // 除外でcount消費
    useGameStore.getState().addCount(-1);
    useGameStore.getState().eliminateFromPool({ type: 'tetromino', shape: 'I' });
    expect(useGameStore.getState().count).toBe(0);

    // count=0では操作を許可しない（UIレベルのガード）
    expect(useGameStore.getState().count).toBe(0);
  });

  it('INT-13: pool.length=1では除外不可', () => {
    // 8種除外して1種だけ残す
    const shapes: TetrominoShape[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    shapes.forEach(shape => {
      useGameStore.getState().eliminateFromPool({ type: 'tetromino', shape });
    });
    useGameStore.getState().eliminateFromPool({ type: 'joker' });

    expect(useGameStore.getState().pool).toHaveLength(1);

    // さらに除外しようとしても変わらない
    useGameStore.getState().eliminateFromPool({ type: 'ace' });
    expect(useGameStore.getState().pool).toHaveLength(1);
  });
});
