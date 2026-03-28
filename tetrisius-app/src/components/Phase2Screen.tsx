import { useCallback, useState } from 'react';
import { useGameStore } from '../store/game-store';
import { TetrisCanvas } from './TetrisCanvas';
import { BlockSelector } from './BlockSelector';
import { PoolEditor } from './PoolEditor';
import { getPoolItemLabel } from '../game/block-pool';
import type { TetrominoShape } from '../game/types';

export function Phase2Screen() {
  const count = useGameStore(s => s.count);
  const pool = useGameStore(s => s.pool);
  const phase2SubState = useGameStore(s => s.phase2SubState);
  const lastDrawResult = useGameStore(s => s.lastDrawResult);
  const [jokerAnimation, setJokerAnimation] = useState(false);

  const store = useGameStore;

  const handleGameOver = useCallback(() => {
    // Phase2のゲームオーバーは TetrisCanvas からクリア判定時に呼ばれる
    // またはここで25行ゲームオーバーをチェック
  }, []);

  const handleAddCount = () => {
    store.getState().addCount(1);
  };

  const handleDropBlock = () => {
    if (count <= 0) return;
    const state = store.getState();
    state.addCount(-1);
    state.setPhase2SubState('drawing');

    const result = state.drawFromPool();

    if (result.type === 'joker') {
      setJokerAnimation(true);
      setTimeout(() => {
        setJokerAnimation(false);
        store.getState().setPhase2SubState('idle');
        store.getState().saveGame();
      }, 1500);
    } else if (result.type === 'ace') {
      store.getState().setPhase2SubState('selecting');
    } else if (result.type === 'tetromino') {
      const spawned = store.getState().spawnBlock(result.shape);
      if (!spawned) {
        store.getState().finishGame('gameover');
        return;
      }
      store.getState().setPhase2SubState('playing');
    }
  };

  const handleEliminateChoice = () => {
    if (count <= 0 || pool.length <= 1) return;
    store.getState().addCount(-1);
    store.getState().setPhase2SubState('eliminating');
  };

  const handleAceSelect = (shape: TetrominoShape) => {
    const spawned = store.getState().spawnBlock(shape);
    if (!spawned) {
      store.getState().finishGame('gameover');
      return;
    }
    store.getState().setPhase2SubState('playing');
  };

  const handlePoolEliminate = (item: typeof pool[0]) => {
    store.getState().eliminateFromPool(item);
    store.getState().setPhase2SubState('idle');
  };

  const handlePoolCancel = () => {
    // カウントを戻す（キャンセル時）
    store.getState().addCount(1);
    store.getState().setPhase2SubState('idle');
  };

  const isIdle = phase2SubState === 'idle';
  const canDrop = count > 0 && isIdle;
  const canEliminate = count > 0 && pool.length > 1 && isIdle;

  return (
    <div className="flex flex-col h-full relative">
      {/* HUD */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-900/80 text-sm">
        <div>
          <span className="text-gray-400">Count: </span>
          <span className="font-bold text-lg text-green-400">{count}</span>
        </div>
        <div>
          <span className="text-gray-400">Pool: </span>
          <span className="font-bold">{pool.length}</span>
        </div>
      </div>

      <div className="text-center text-xs text-green-400 py-1">
        PHASE 2 - Clear the bottom row!
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <TetrisCanvas phase="phase2" onGameOver={handleGameOver} />
      </div>

      {/* ジョーカー演出 */}
      {jokerAnimation && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
          <div className="text-4xl font-bold text-gray-500 animate-pulse">
            JOKER!
          </div>
        </div>
      )}

      {/* エース: ブロック選択 */}
      {phase2SubState === 'selecting' && (
        <BlockSelector onSelect={handleAceSelect} />
      )}

      {/* プール除外 */}
      {phase2SubState === 'eliminating' && (
        <PoolEditor
          pool={pool}
          onEliminate={handlePoolEliminate}
          onCancel={handlePoolCancel}
        />
      )}

      {/* アクションボタン */}
      {(isIdle || phase2SubState === 'drawing') && (
        <div className="px-4 py-3 bg-gray-900/80 flex gap-2">
          <button
            onClick={handleAddCount}
            className="flex-1 py-3 bg-green-700 hover:bg-green-600 rounded-lg text-sm font-bold transition-colors"
          >
            +1 Count
          </button>
          <button
            onClick={handleDropBlock}
            disabled={!canDrop}
            className="flex-1 py-3 bg-purple-700 hover:bg-purple-600 rounded-lg text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Drop Block
          </button>
          <button
            onClick={handleEliminateChoice}
            disabled={!canEliminate}
            className="flex-1 py-3 bg-red-800 hover:bg-red-700 rounded-lg text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Remove
          </button>
        </div>
      )}

      {/* 抽選結果表示 */}
      {phase2SubState === 'playing' && lastDrawResult && (
        <div className="px-4 py-2 bg-gray-900/80 text-center text-sm">
          <span className="text-gray-400">Drew: </span>
          <span className="font-bold text-yellow-300">
            {getPoolItemLabel(lastDrawResult)}
          </span>
          <span className="text-gray-500 ml-2">— Place the block!</span>
        </div>
      )}
    </div>
  );
}
