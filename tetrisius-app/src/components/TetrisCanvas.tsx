import { useRef, useEffect, useCallback } from 'react';
import { TetrisEngine } from '../game/tetris-engine';
import { TouchController } from '../game/touch-controller';
import { useGameStore } from '../store/game-store';
import { LEVEL_SPEEDS } from '../game/constants';

interface Props {
  onGameOver: () => void;
  phase: 'phase1' | 'phase2';
}

export function TetrisCanvas({ onGameOver, phase }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<TetrisEngine | null>(null);
  const touchRef = useRef<TouchController | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastDropRef = useRef(0);

  const store = useGameStore;

  const getDropSpeed = useCallback(() => {
    const state = store.getState();
    if (phase === 'phase1') {
      return LEVEL_SPEEDS[state.level] || 3000;
    }
    return state.settings.dropSpeedPhase2;
  }, [phase, store]);

  const gameLoop = useCallback((timestamp: number) => {
    const state = store.getState();
    if (!state.activeBlock) {
      animationRef.current = requestAnimationFrame(gameLoop);
      engineRef.current?.render(state.board, state.activeBlock);
      return;
    }

    const dropSpeed = getDropSpeed();
    if (timestamp - lastDropRef.current >= dropSpeed) {
      lastDropRef.current = timestamp;

      const moved = state.moveBlock(0, 1);
      if (!moved) {
        const { clearedRows } = state.placeBlock();

        if (phase === 'phase2') {
          const currentState = store.getState();
          const maxRow = currentState.gameRows - 1;
          if (clearedRows.includes(maxRow)) {
            currentState.finishGame('clear');
            onGameOver();
            return;
          }
        }

        // 新ブロック生成
        if (phase === 'phase1') {
          const spawned = store.getState().spawnBlock();
          if (!spawned) {
            onGameOver();
            return;
          }
        } else {
          // フェーズ2: ブロック操作完了 → idle
          store.getState().setPhase2SubState('idle');
          store.getState().saveGame();
          return;
        }
      }
    }

    const currentState = store.getState();
    engineRef.current?.render(currentState.board, currentState.activeBlock);
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [phase, store, getDropSpeed, onGameOver]);

  const startLoop = useCallback(() => {
    lastDropRef.current = performance.now();
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const stopLoop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // エンジン初期化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rows = store.getState().gameRows;
    const engine = new TetrisEngine(canvas, rows);
    engineRef.current = engine;

    const touch = new TouchController(canvas, {
      onMoveLeft: () => store.getState().moveBlock(-1, 0),
      onMoveRight: () => store.getState().moveBlock(1, 0),
      onSoftDrop: () => store.getState().moveBlock(0, 1),
      onHardDrop: () => {
        store.getState().hardDrop();
      },
      onRotate: () => store.getState().rotateBlock(),
    }, engine.getCellSize());
    touchRef.current = touch;

    const handleResize = () => {
      engine.updateSize();
      touch.setCellSize(engine.getCellSize());
      const state = store.getState();
      engine.render(state.board, state.activeBlock);
    };
    window.addEventListener('resize', handleResize);

    // フェーズ1なら即ループ開始
    if (phase === 'phase1') {
      startLoop();
    }

    return () => {
      stopLoop();
      touch.destroy();
      window.removeEventListener('resize', handleResize);
    };
  }, [phase, store, startLoop, stopLoop]);

  // フェーズ2: subStateがplayingになったらループ開始
  const phase2SubState = useGameStore(s => s.phase2SubState);
  useEffect(() => {
    if (phase !== 'phase2') return;

    if (phase2SubState === 'playing') {
      const state = store.getState();
      if (state.activeBlock) {
        touchRef.current?.setActive(true);
        startLoop();
      }
    } else {
      stopLoop();
      touchRef.current?.setActive(false);
      // idle時に盤面を再描画
      const state = store.getState();
      engineRef.current?.render(state.board, state.activeBlock);
    }
  }, [phase, phase2SubState, store, startLoop, stopLoop]);

  // gameRows変更時にエンジンのサイズ更新
  const gameRows = useGameStore(s => s.gameRows);
  useEffect(() => {
    engineRef.current?.setRows(gameRows);
    const state = store.getState();
    engineRef.current?.render(state.board, state.activeBlock);
  }, [gameRows, store]);

  // キーボード操作（開発用）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = store.getState();
      if (!state.activeBlock) return;
      switch (e.key) {
        case 'ArrowLeft': state.moveBlock(-1, 0); break;
        case 'ArrowRight': state.moveBlock(1, 0); break;
        case 'ArrowDown': state.moveBlock(0, 1); break;
        case 'ArrowUp': state.rotateBlock(); break;
        case ' ': state.hardDrop(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);

  return (
    <canvas
      ref={canvasRef}
      className="block mx-auto border border-gray-700 rounded"
    />
  );
}
