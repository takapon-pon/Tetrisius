import { useGameStore } from '../store/game-store';
import { useState } from 'react';

export function StartScreen() {
  const startNewGame = useGameStore(s => s.startNewGame);
  const loadGame = useGameStore(s => s.loadGame);
  const hasSave = useGameStore(s => s.hasSave);
  const [showSettings, setShowSettings] = useState(false);
  const settings = useGameStore(s => s.settings);
  const updateSettings = useGameStore(s => s.updateSettings);

  const savedGameExists = hasSave();

  const handleResume = () => {
    loadGame();
  };

  if (showSettings) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
        <h2 className="text-2xl font-bold">Settings</h2>
        <div className="w-full max-w-xs">
          <label className="block text-sm mb-2">
            Phase 2 Drop Speed: {(settings.dropSpeedPhase2 / 1000).toFixed(1)}s
          </label>
          <input
            type="range"
            min={500}
            max={5000}
            step={100}
            value={settings.dropSpeedPhase2}
            onChange={e => updateSettings({ dropSpeedPhase2: Number(e.target.value) })}
            className="w-full"
          />
        </div>
        <button
          onClick={() => setShowSettings(false)}
          className="px-6 py-3 bg-gray-600 rounded-lg text-lg"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
      <h1 className="text-4xl font-bold tracking-tight">TETRISIUS</h1>
      <p className="text-gray-400 text-sm text-center max-w-xs">
        Food & Drink Counter Tetris
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
        <button
          onClick={startNewGame}
          className="px-6 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-xl font-bold transition-colors"
        >
          New Game
        </button>

        {savedGameExists && (
          <button
            onClick={handleResume}
            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-bold transition-colors"
          >
            Resume
          </button>
        )}

        <button
          onClick={() => setShowSettings(true)}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-lg transition-colors"
        >
          Settings
        </button>
      </div>
    </div>
  );
}
