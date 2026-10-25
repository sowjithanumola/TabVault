import React from 'react';
import {
  FolderPlus,
  Edit2,
  Trash2,
  ExternalLink,
  Code,
  Palette,
  BookOpen,
  Terminal,
  Globe,
  Folder,
  Layers,
  Bookmark as BookmarkIcon,
  Star,
  Cpu,
} from 'lucide-react';
import { Collection } from '../types';

interface CollectionsViewProps {
  collections: Collection[];
  bookmarkCounts: Record<string, number>;
  onOpenNewCollection: () => void;
  onEditCollection: (collection: Collection) => void;
  onDeleteCollection: (collection: Collection) => void;
  onSelectCollection: (collectionId: string) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections,
  bookmarkCounts,
  onOpenNewCollection,
  onEditCollection,
  onDeleteCollection,
  onSelectCollection,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-5 h-5" />;
      case 'Palette':
        return <Palette className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'Terminal':
        return <Terminal className="w-5 h-5" />;
      case 'Globe':
        return <Globe className="w-5 h-5" />;
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      case 'Star':
        return <Star className="w-5 h-5" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      default:
        return <Folder className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Collections</h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize bookmarks into dedicated spaces with custom colors and categorization.
          </p>
        </div>
        <button
          onClick={onOpenNewCollection}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors shadow-sm self-start"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((col) => {
          const count = bookmarkCounts[col.id] || 0;
          return (
            <div
              key={col.id}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: col.color }}
                  >
                    {getIcon(col.icon)}
                  </div>

                  <span className="text-xs font-mono tabular-nums text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                    {count} {count === 1 ? 'bookmark' : 'bookmarks'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-1">
                  {col.name}
                </h3>
                {col.description && (
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {col.description}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => onSelectCollection(col.id)}
                  className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  <span>Open Collection</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditCollection(col)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit collection"
                    aria-label={`Edit ${col.name}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCollection(col)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete collection"
                    aria-label={`Delete ${col.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
