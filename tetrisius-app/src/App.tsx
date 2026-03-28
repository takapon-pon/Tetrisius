import { useGameStore } from './store/game-store';
import { StartScreen } from './components/StartScreen';
import { Phase1Screen } from './components/Phase1Screen';
import { Phase2Screen } from './components/Phase2Screen';
import { ResultScreen } from './components/ResultScreen';

function App() {
  const phase = useGameStore(s => s.phase);

  switch (phase) {
    case 'start':
      return <StartScreen />;
    case 'phase1':
      return <Phase1Screen />;
    case 'phase2':
      return <Phase2Screen />;
    case 'result':
      return <ResultScreen />;
    default:
      return <StartScreen />;
  }
}

export default App;
