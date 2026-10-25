import React, { useState } from 'react';
import {
  FolderInput,
  Star,
  Trash2,
  Download,
  X,
  CheckSquare,
} from 'lucide-react';
import { Collection } from '../types';

interface BatchActionBarProps {
  selectedCount: number;
  collections: Collection[];
  onClearSelection: () => void;
  onBulkMove: (targetCollectionId: string) => void;
  onBulkToggleFavorite: () => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  collections,
  onClearSelection,
  onBulkMove,
  onBulkToggleFavorite,
  onBulkDelete,
  onBulkExport,
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-3 text-xs">
      <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
        <CheckSquare className="w-4 h-4 text-purple-400" />
        <span className="font-semibold text-slate-100 font-mono tabular-nums">
          {selectedCount} selected
        </span>
      </div>

      <div className="flex items-center gap-1.5 relative">
        <button
          onClick={() => setShowMoveMenu(!showMoveMenu)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium transition-colors"
        >
          <FolderInput className="w-3.5 h-3.5 text-purple-400" />
          <span>Move to</span>
        </button>

        {showMoveMenu && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50">
            <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Select collection:
            </div>
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => {
                  onBulkMove(col.id);
                  setShowMoveMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: col.color }}
                />
                <span className="truncate">{col.name}</span>
              </button>
            ))}
            <button
              onClick={() => {
                onBulkMove('uncategorized');
                setShowMoveMenu(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              Uncategorized
            </button>
          </div>
        )}

        <button
          onClick={onBulkToggleFavorite}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium transition-colors"
          title="Toggle favorites"
        >
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>Favorite</span>
        </button>

        <button
          onClick={onBulkExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium transition-colors"
          title="Export selected as JSON"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>Export</span>
        </button>

        <button
          onClick={onBulkDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 font-medium transition-colors"
          title="Delete selected"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Delete</span>
        </button>
      </div>

      <button
        onClick={onClearSelection}
        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors ml-2"
        title="Deselect all"
        aria-label="Deselect all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
