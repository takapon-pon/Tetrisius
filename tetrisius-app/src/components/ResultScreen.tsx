import { useGameStore } from '../store/game-store';

export function ResultScreen() {
  const resultType = useGameStore(s => s.resultType);
  const score = useGameStore(s => s.score);

  const handleRestart = () => {
    useGameStore.setState({ phase: 'start', resultType: null });
  };

  const isClear = resultType === 'clear';

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
      <h1 className={`text-5xl font-bold ${isClear ? 'text-green-400' : 'text-red-400'}`}>
        {isClear ? 'CLEAR!' : 'GAME OVER'}
      </h1>

      {isClear && (
        <p className="text-lg text-gray-300">
          Bottom row cleared!
        </p>
      )}

      <div className="text-gray-400">
        Phase 1 Score: <span className="font-bold text-white">{score}</span>
      </div>

      <button
        onClick={handleRestart}
        className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-xl font-bold transition-colors mt-4"
      >
        Play Again
      </button>
    </div>
  );
}
