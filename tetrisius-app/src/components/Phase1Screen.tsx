import { useGameStore } from '../store/game-store';
import { TetrisCanvas } from './TetrisCanvas';

export function Phase1Screen() {
  const score = useGameStore(s => s.score);
  const level = useGameStore(s => s.level);
  const linesCleared = useGameStore(s => s.linesCleared);
  const transitionToPhase2 = useGameStore(s => s.transitionToPhase2);

  const handleGameOver = () => {
    transitionToPhase2();
  };

  return (
    <div className="flex flex-col h-full">
      {/* HUD */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-900/80 text-sm">
        <div>
          <span className="text-gray-400">Score: </span>
          <span className="font-bold">{score}</span>
        </div>
        <div>
          <span className="text-gray-400">Lv. </span>
          <span className="font-bold">{level}</span>
        </div>
        <div>
          <span className="text-gray-400">Lines: </span>
          <span className="font-bold">{linesCleared}</span>
        </div>
      </div>

      <div className="text-center text-xs text-yellow-400 py-1">
        PHASE 1 - Play until Game Over
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <TetrisCanvas phase="phase1" onGameOver={handleGameOver} />
      </div>
    </div>
  );
}
