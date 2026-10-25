import React from 'react';
import {
  Bookmark,
  Star,
  Clock,
  Tag as TagIcon,
  FolderPlus,
  Hash,
  Cloud,
  Code,
  Palette,
  BookOpen,
  Terminal,
  Globe,
  Folder,
} from 'lucide-react';
import { Collection } from '../types';

interface SidebarProps {
  collections: Collection[];
  activeFilter: string; // 'all' | 'favorites' | 'recent' | 'untagged' | collectionId
  onSelectFilter: (filter: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  allTags: { name: string; count: number }[];
  bookmarkCounts: {
    all: number;
    favorites: number;
    recent: number;
    untagged: number;
    byCollection: Record<string, number>;
  };
  onOpenNewCollection: () => void;
  storageSizeBytes: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collections,
  activeFilter,
  onSelectFilter,
  selectedTag,
  onSelectTag,
  allTags,
  bookmarkCounts,
  onOpenNewCollection,
}) => {
  const getCollectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-4 h-4 shrink-0" />;
      case 'Palette':
        return <Palette className="w-4 h-4 shrink-0" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 shrink-0" />;
      case 'Terminal':
        return <Terminal className="w-4 h-4 shrink-0" />;
      case 'Globe':
        return <Globe className="w-4 h-4 shrink-0" />;
      default:
        return <Folder className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between py-6 pr-6 border-r border-slate-800/80 min-h-[calc(100vh-4rem)] font-sans">
      <div className="space-y-6">
        {/* Main Navigation Views */}
        <div>
          <div className="text-xs font-semibold text-slate-400 px-3 uppercase tracking-wider mb-2">
            Views
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => {
                onSelectFilter('all');
                onSelectTag(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg font-medium transition-colors cursor-pointer ${
                activeFilter === 'all' && !selectedTag
                  ? 'bg-purple-950/60 text-purple-300 font-semibold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Bookmark className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">All Bookmarks</span>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {bookmarkCounts.all}
              </span>
            </button>

            <button
              onClick={() => {
                onSelectFilter('favorites');
                onSelectTag(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg font-medium transition-colors cursor-pointer ${
                activeFilter === 'favorites'
                  ? 'bg-purple-950/60 text-purple-300 font-semibold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Star className="w-4 h-4 text-amber-400 shrink-0 fill-amber-400/20" />
                <span className="truncate">Favorites</span>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {bookmarkCounts.favorites}
              </span>
            </button>

            <button
              onClick={() => {
                onSelectFilter('recent');
                onSelectTag(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg font-medium transition-colors cursor-pointer ${
                activeFilter === 'recent'
                  ? 'bg-purple-950/60 text-purple-300 font-semibold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">Recent</span>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {bookmarkCounts.recent}
              </span>
            </button>

            <button
              onClick={() => {
                onSelectFilter('untagged');
                onSelectTag(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg font-medium transition-colors cursor-pointer ${
                activeFilter === 'untagged'
                  ? 'bg-purple-950/60 text-purple-300 font-semibold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <TagIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">Untagged</span>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {bookmarkCounts.untagged}
              </span>
            </button>
          </nav>
        </div>

        {/* Collections */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Collections
            </span>
            <button
              onClick={onOpenNewCollection}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              title="Add collection"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
          <nav className="space-y-1">
            {collections.map((col) => {
              const count = bookmarkCounts.byCollection[col.id] || 0;
              const isActive = activeFilter === col.id && !selectedTag;
              return (
                <button
                  key={col.id}
                  onClick={() => {
                    onSelectFilter(col.id);
                    onSelectTag(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-purple-950/60 text-purple-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: col.color }}
                    />
                    <span className="text-slate-400">
                      {getCollectionIcon(col.icon)}
                    </span>
                    <span className="truncate">{col.name}</span>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-slate-500">
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tags filter list */}
        {allTags.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Popular Tags
              </span>
              {selectedTag && (
                <button
                  onClick={() => onSelectTag(null)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {allTags.slice(0, 10).map((tag) => {
                const isSelected = selectedTag === tag.name;
                return (
                  <button
                    key={tag.name}
                    onClick={() => onSelectTag(isSelected ? null : tag.name)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/60 text-purple-300 font-medium'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Hash className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{tag.name}</span>
                    </div>
                    <span className="text-slate-500 font-mono tabular-nums">
                      {tag.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Cloud Account Status */}
      <div className="pt-6 border-t border-slate-800/80 px-3">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <Cloud className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="font-medium text-slate-300">Cloud Account</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400 font-medium">Synced</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Cloud vault active. Bookmarks synced to your personal account.
        </p>
      </div>
    </aside>
  );
};
