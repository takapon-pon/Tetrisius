import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/game-store';
import { STORAGE_KEY, STORAGE_TTL } from '../game/constants';

describe('Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.setState({
      phase: 'start',
      board: [],
      score: 0,
      level: 1,
      linesCleared: 0,
      count: 0,
      activeBlock: null,
      resultType: null,
      savedAt: null,
    });
  });

  it('SV-01: saveGameでlocalStorageに保存', () => {
    useGameStore.getState().startNewGame();
    useGameStore.getState().transitionToPhase2();
    useGameStore.getState().saveGame();
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const data = JSON.parse(raw!);
    expect(data.phase).toBe('phase2');
    expect(data.savedAt).toBeGreaterThan(0);
  });

  it('SV-02: loadGameで復元', () => {
    useGameStore.getState().startNewGame();
    useGameStore.getState().transitionToPhase2();
    useGameStore.getState().addCount(5);
    useGameStore.getState().saveGame();

    // リセット
    useGameStore.setState({ phase: 'start', count: 0 });
    expect(useGameStore.getState().count).toBe(0);

    // 復元
    const result = useGameStore.getState().loadGame();
    expect(result).toBe(true);
    expect(useGameStore.getState().count).toBe(5);
    expect(useGameStore.getState().phase).toBe('phase2');
  });

  it('ERR-01: 保存データなしでloadGame', () => {
    const result = useGameStore.getState().loadGame();
    expect(result).toBe(false);
  });

  it('ERR-02: 不正JSONでloadGame', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid json{{{');
    const result = useGameStore.getState().loadGame();
    expect(result).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('BV-16: 23時間59分前の保存データ → 復元成功', () => {
    const data = {
      phase: 'phase2',
      board: Array.from({ length: 25 }, () => Array(10).fill(0)),
      count: 3,
      pool: [{ type: 'ace' }],
      eliminatedPool: [],
      phase2SubState: 'idle',
      settings: { dropSpeedPhase2: 3000 },
      gameRows: 25,
      score: 100,
      level: 1,
      linesCleared: 0,
      savedAt: Date.now() - (STORAGE_TTL - 60 * 1000), // 23時間59分前
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const result = useGameStore.getState().loadGame();
    expect(result).toBe(true);
  });

  it('BV-17: 24時間経過 → 復元失敗', () => {
    const data = {
      phase: 'phase2',
      board: [],
      count: 0,
      pool: [],
      eliminatedPool: [],
      phase2SubState: 'idle',
      settings: { dropSpeedPhase2: 3000 },
      gameRows: 25,
      savedAt: Date.now() - STORAGE_TTL,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const result = useGameStore.getState().loadGame();
    expect(result).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
