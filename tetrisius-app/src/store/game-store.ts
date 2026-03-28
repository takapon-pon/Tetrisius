import { create } from 'zustand';
import type {
  Board,
  GamePhase,
  Phase2SubState,
  ResultType,
  ActiveBlock,
  PoolItem,
  TetrominoShape,
  CellValue,
} from '../game/types';
import {
  COLS,
  ROWS_PHASE1,
  ROWS_PHASE2,
  LINES_PER_LEVEL,
  MAX_LEVEL,
  SCORE_TABLE,
  DEFAULT_DROP_SPEED_PHASE2,
  STORAGE_KEY,
  STORAGE_TTL,
  CELL_VALUE_MAP,
} from '../game/constants';
import { createEmptyBoard, clearLines as clearBoardLines, expandBoard } from '../game/board';
import { getBlockCells, getRandomShape, getWallKickOffsets } from '../game/tetrominoes';
import { checkCollision } from '../game/collision';
import { createInitialPool, drawFromPool as drawPool, eliminateFromPool as eliminatePool } from '../game/block-pool';

export interface GameStore {
  phase: GamePhase;
  board: Board;

  score: number;
  level: number;
  linesCleared: number;

  count: number;
  pool: PoolItem[];
  eliminatedPool: PoolItem[];
  phase2SubState: Phase2SubState;
  lastDrawResult: PoolItem | null;

  activeBlock: ActiveBlock | null;
  gameRows: number;

  settings: {
    dropSpeedPhase2: number;
  };

  resultType: ResultType | null;
  savedAt: number | null;

  startNewGame: () => void;
  transitionToPhase2: () => void;
  finishGame: (result: ResultType) => void;

  spawnBlock: (shape?: TetrominoShape) => boolean;
  placeBlock: () => { linesCleared: number; clearedRows: number[] };
  doClearLines: () => { linesCleared: number; clearedRows: number[] };
  moveBlock: (dx: number, dy: number) => boolean;
  rotateBlock: () => boolean;
  hardDrop: () => void;

  addCount: (amount: number) => void;
  drawFromPool: () => PoolItem;
  eliminateFromPool: (item: PoolItem) => void;
  setPhase2SubState: (state: Phase2SubState) => void;

  updateSettings: (settings: Partial<GameStore['settings']>) => void;

  saveGame: () => void;
  loadGame: () => boolean;
  clearSave: () => void;
  hasSave: () => boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'start',
  board: [],

  score: 0,
  level: 1,
  linesCleared: 0,

  count: 0,
  pool: createInitialPool(),
  eliminatedPool: [],
  phase2SubState: 'idle',
  lastDrawResult: null,

  activeBlock: null,
  gameRows: ROWS_PHASE1,

  settings: {
    dropSpeedPhase2: DEFAULT_DROP_SPEED_PHASE2,
  },

  resultType: null,
  savedAt: null,

  startNewGame: () => {
    set({
      phase: 'phase1',
      board: createEmptyBoard(ROWS_PHASE1),
      score: 0,
      level: 1,
      linesCleared: 0,
      count: 0,
      pool: createInitialPool(),
      eliminatedPool: [],
      phase2SubState: 'idle',
      lastDrawResult: null,
      activeBlock: null,
      gameRows: ROWS_PHASE1,
      resultType: null,
      savedAt: null,
    });
    get().spawnBlock();
  },

  transitionToPhase2: () => {
    const { board } = get();
    const newBoard = expandBoard(board, ROWS_PHASE2);
    set({
      phase: 'phase2',
      board: newBoard,
      gameRows: ROWS_PHASE2,
      activeBlock: null,
      phase2SubState: 'idle',
      pool: createInitialPool(),
      eliminatedPool: [],
      count: 0,
    });
    get().saveGame();
  },

  finishGame: (result: ResultType) => {
    set({
      phase: 'result',
      resultType: result,
      activeBlock: null,
    });
    get().clearSave();
  },

  spawnBlock: (shape?: TetrominoShape) => {
    const { gameRows, board } = get();
    const blockShape = shape || getRandomShape();
    const position = { x: 3, y: 0 };
    const rotation = 0;
    const cells = getBlockCells(blockShape, rotation, position);

    if (checkCollision(cells, board, gameRows)) {
      return false;
    }

    set({
      activeBlock: { shape: blockShape, position, rotation, cells },
    });
    return true;
  },

  placeBlock: () => {
    const { activeBlock, board, gameRows, phase } = get();
    if (!activeBlock) return { linesCleared: 0, clearedRows: [] };

    const newBoard = board.map(row => [...row]) as Board;
    const cellValue = CELL_VALUE_MAP[activeBlock.shape] as CellValue;
    for (const cell of activeBlock.cells) {
      if (cell.y >= 0 && cell.y < gameRows && cell.x >= 0 && cell.x < COLS) {
        newBoard[cell.y][cell.x] = cellValue;
      }
    }

    set({ board: newBoard, activeBlock: null });

    const result = get().doClearLines();

    if (phase === 'phase1') {
      const { linesCleared: totalLines, level: currentLevel } = get();
      const newTotalLines = totalLines + result.linesCleared;
      const newLevel = Math.min(MAX_LEVEL, 1 + Math.floor(newTotalLines / LINES_PER_LEVEL));
      const scoreAdd = (SCORE_TABLE[result.linesCleared] || 0) * currentLevel;

      set(state => ({
        score: state.score + scoreAdd,
        linesCleared: newTotalLines,
        level: newLevel,
      }));
    }

    return result;
  },

  doClearLines: () => {
    const { board, gameRows } = get();
    const result = clearBoardLines(board, gameRows);
    if (result.linesCleared > 0) {
      set({ board: result.newBoard });
    }
    return { linesCleared: result.linesCleared, clearedRows: result.clearedRows };
  },

  moveBlock: (dx: number, dy: number) => {
    const { activeBlock, board, gameRows } = get();
    if (!activeBlock) return false;

    const newPosition = {
      x: activeBlock.position.x + dx,
      y: activeBlock.position.y + dy,
    };
    const newCells = getBlockCells(activeBlock.shape, activeBlock.rotation, newPosition);

    if (checkCollision(newCells, board, gameRows)) {
      return false;
    }

    set({
      activeBlock: {
        ...activeBlock,
        position: newPosition,
        cells: newCells,
      },
    });
    return true;
  },

  rotateBlock: () => {
    const { activeBlock, board, gameRows } = get();
    if (!activeBlock) return false;

    const fromRotation = activeBlock.rotation;
    const toRotation = (fromRotation + 1) % 4;

    // まずオフセットなしで試す
    const baseCells = getBlockCells(activeBlock.shape, toRotation, activeBlock.position);
    if (!checkCollision(baseCells, board, gameRows)) {
      set({
        activeBlock: {
          ...activeBlock,
          rotation: toRotation,
          cells: baseCells,
        },
      });
      return true;
    }

    // 壁キック
    const offsets = getWallKickOffsets(activeBlock.shape, fromRotation, toRotation);
    for (const offset of offsets) {
      const kickedPosition = {
        x: activeBlock.position.x + offset.x,
        y: activeBlock.position.y + offset.y,
      };
      const kickedCells = getBlockCells(activeBlock.shape, toRotation, kickedPosition);
      if (!checkCollision(kickedCells, board, gameRows)) {
        set({
          activeBlock: {
            ...activeBlock,
            position: kickedPosition,
            rotation: toRotation,
            cells: kickedCells,
          },
        });
        return true;
      }
    }

    return false;
  },

  hardDrop: () => {
    const { activeBlock, board, gameRows } = get();
    if (!activeBlock) return;

    let dropY = 0;
    while (true) {
      const nextPosition = {
        x: activeBlock.position.x,
        y: activeBlock.position.y + dropY + 1,
      };
      const nextCells = getBlockCells(activeBlock.shape, activeBlock.rotation, nextPosition);
      if (checkCollision(nextCells, board, gameRows)) break;
      dropY++;
    }

    const finalPosition = {
      x: activeBlock.position.x,
      y: activeBlock.position.y + dropY,
    };
    const finalCells = getBlockCells(activeBlock.shape, activeBlock.rotation, finalPosition);
    set({
      activeBlock: {
        ...activeBlock,
        position: finalPosition,
        cells: finalCells,
      },
    });
  },

  addCount: (amount: number) => {
    set(state => ({ count: state.count + amount }));
    get().saveGame();
  },

  drawFromPool: () => {
    const { pool } = get();
    const result = drawPool(pool);
    set({ lastDrawResult: result });
    return result;
  },

  eliminateFromPool: (item: PoolItem) => {
    const { pool } = get();
    const newPool = eliminatePool(pool, item);
    set(state => ({
      pool: newPool,
      eliminatedPool: [...state.eliminatedPool, item],
    }));
    get().saveGame();
  },

  setPhase2SubState: (state: Phase2SubState) => {
    set({ phase2SubState: state });
  },

  updateSettings: (newSettings) => {
    set(state => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  saveGame: () => {
    const state = get();
    if (state.phase !== 'phase2') return;

    try {
      const data = {
        phase: state.phase,
        board: state.board,
        count: state.count,
        pool: state.pool,
        eliminatedPool: state.eliminatedPool,
        phase2SubState: 'idle',
        settings: state.settings,
        gameRows: state.gameRows,
        score: state.score,
        level: state.level,
        linesCleared: state.linesCleared,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      set({ savedAt: data.savedAt });
    } catch {
      // localStorage容量超過等 — 無視してゲーム続行
    }
  },

  loadGame: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw);
      if (Date.now() - data.savedAt >= STORAGE_TTL) {
        get().clearSave();
        return false;
      }

      set({
        phase: data.phase,
        board: data.board,
        count: data.count,
        pool: data.pool,
        eliminatedPool: data.eliminatedPool,
        phase2SubState: 'idle',
        settings: data.settings,
        gameRows: data.gameRows,
        score: data.score || 0,
        level: data.level || 1,
        linesCleared: data.linesCleared || 0,
        activeBlock: null,
        resultType: null,
        savedAt: data.savedAt,
      });
      return true;
    } catch {
      get().clearSave();
      return false;
    }
  },

  clearSave: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ savedAt: null });
  },

  hasSave: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return Date.now() - data.savedAt < STORAGE_TTL;
    } catch {
      return false;
    }
  },
}));
