import type { PoolItem } from '../game/types';
import { getPoolItemLabel } from '../game/block-pool';
import { BLOCK_COLORS } from '../game/constants';

interface Props {
  pool: PoolItem[];
  onEliminate: (item: PoolItem) => void;
  onCancel: () => void;
}

function getItemColor(item: PoolItem): string {
  if (item.type === 'tetromino') return BLOCK_COLORS[item.shape];
  if (item.type === 'ace') return '#ffd700';
  return '#888';
}

export function PoolEditor({ pool, onEliminate, onCancel }: Props) {
  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
      <h3 className="text-lg font-bold mb-2 text-red-400">Remove from pool</h3>
      <p className="text-xs text-gray-400 mb-4">Tap to remove ({pool.length} remaining)</p>
      <div className="grid grid-cols-3 gap-3 px-4 mb-4">
        {pool.map((item, i) => (
          <button
            key={i}
            onClick={() => onEliminate(item)}
            disabled={pool.length <= 1}
            className="w-20 h-12 rounded-lg flex items-center justify-center text-sm font-bold border border-gray-600 hover:border-red-400 disabled:opacity-30 transition-colors"
            style={{ color: getItemColor(item) }}
          >
            {getPoolItemLabel(item)}
          </button>
        ))}
      </div>
      <button
        onClick={onCancel}
        className="px-4 py-2 bg-gray-700 rounded text-sm"
      >
        Cancel
      </button>
    </div>
  );
}
