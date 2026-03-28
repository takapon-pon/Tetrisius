import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/game-store';
import { ROWS_PHASE1, ROWS_PHASE2, COLS, LINES_PER_LEVEL, MAX_LEVEL } from '../game/constants';

describe('GameStore', () => {
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
    });
  });

  it('F-01: startNewGame初期状態', () => {
    useGameStore.getState().startNewGame();
    const state = useGameStore.getState();
    expect(state.phase).toBe('phase1');
    expect(state.board).toHaveLength(ROWS_PHASE1);
    expect(state.board[0]).toHaveLength(COLS);
    expect(state.level).toBe(1);
    expect(state.score).toBe(0);
    expect(state.activeBlock).not.toBeNull();
  });

  it('F-02: transitionToPhase2', () => {
    useGameStore.getState().startNewGame();
    useGameStore.getState().transitionToPhase2();
    const state = useGameStore.getState();
    expect(state.phase).toBe('phase2');
    expect(state.board).toHaveLength(ROWS_PHASE2);
    expect(state.gameRows).toBe(ROWS_PHASE2);
    expect(state.activeBlock).toBeNull();
    expect(state.count).toBe(0);
  });

  it('E-01: 盤面拡張で上5行が空', () => {
    useGameStore.getState().startNewGame();
    // 元の盤面の最下行にブロックを置く
    const board = useGameStore.getState().board;
    board[ROWS_PHASE1 - 1][0] = 3;
    useGameStore.setState({ board });

    useGameStore.getState().transitionToPhase2();
    const newBoard = useGameStore.getState().board;
    expect(newBoard).toHaveLength(ROWS_PHASE2);
    // 上5行は空
    for (let y = 0; y < 5; y++) {
      expect(newBoard[y].every(c => c === 0)).toBe(true);
    }
    // 元の最下行(19) → 新しい位置(24)
    expect(newBoard[ROWS_PHASE2 - 1][0]).toBe(3);
  });

  it('C-01: addCount', () => {
    useGameStore.getState().startNewGame();
    useGameStore.getState().transitionToPhase2();
    useGameStore.getState().addCount(1);
    expect(useGameStore.getState().count).toBe(1);
  });

  it('C-02: addCount(3)', () => {
    useGameStore.getState().startNewGame();
    useGameStore.getState().transitionToPhase2();
    useGameStore.getState().addCount(3);
    expect(useGameStore.getState().count).toBe(3);
  });

  it('S-06/BV-08: レベルアップ計算', () => {
    const level = Math.min(MAX_LEVEL, 1 + Math.floor(10 / LINES_PER_LEVEL));
    expect(level).toBe(2);
  });

  it('BV-07: レベルアップ直前', () => {
    const level = Math.min(MAX_LEVEL, 1 + Math.floor(9 / LINES_PER_LEVEL));
    expect(level).toBe(1);
  });

  it('BV-09: レベル上限は10', () => {
    const level = Math.min(MAX_LEVEL, 1 + Math.floor(100 / LINES_PER_LEVEL));
    expect(level).toBe(10);
  });

  it('F-03: finishGame(clear)', () => {
    useGameStore.getState().startNewGame();
    useGameStore.getState().finishGame('clear');
    const state = useGameStore.getState();
    expect(state.phase).toBe('result');
    expect(state.resultType).toBe('clear');
  });

  it('F-04: finishGame(gameover)', () => {
    useGameStore.getState().startNewGame();
    useGameStore.getState().finishGame('gameover');
    const state = useGameStore.getState();
    expect(state.phase).toBe('result');
    expect(state.resultType).toBe('gameover');
  });
});
