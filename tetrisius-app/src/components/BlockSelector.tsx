import type { TetrominoShape } from '../game/types';
import { BLOCK_COLORS } from '../game/constants';

const ALL_SHAPES: TetrominoShape[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

interface Props {
  onSelect: (shape: TetrominoShape) => void;
}

export function BlockSelector({ onSelect }: Props) {
  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
      <h3 className="text-lg font-bold mb-4 text-yellow-400">ACE! Choose a block</h3>
      <div className="grid grid-cols-4 gap-3 px-4">
        {ALL_SHAPES.map(shape => (
          <button
            key={shape}
            onClick={() => onSelect(shape)}
            className="w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold border-2 border-transparent hover:border-white transition-colors"
            style={{ backgroundColor: BLOCK_COLORS[shape] + '40', color: BLOCK_COLORS[shape] }}
          >
            {shape}
          </button>
        ))}
      </div>
    </div>
  );
}
