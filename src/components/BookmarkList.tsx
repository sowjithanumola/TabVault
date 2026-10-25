import React from 'react';
import {
  Star,
  ExternalLink,
  Copy,
  Edit2,
  Trash2,
  Globe,
} from 'lucide-react';
import { Bookmark, Collection } from '../types';
import { extractHostname } from '../utils/urlParser';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  collections: Collection[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
  onVisit: (id: string, url: string) => void;
  onCopyUrl: (url: string) => void;
  onTagClick?: (tag: string) => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({
  bookmarks,
  collections,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onToggleFavorite,
  onEdit,
  onDelete,
  onVisit,
  onCopyUrl,
  onTagClick,
}) => {
  const collectionMap = new Map<string, Collection>();
  collections.forEach((c) => collectionMap.set(c.id, c));

  const allSelected = bookmarks.length > 0 && bookmarks.every((b) => selectedIds.has(b.id));

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-medium">
            <th className="py-3 px-4 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="w-4 h-4 rounded text-purple-600 bg-slate-800 border-slate-700 focus:ring-purple-500 cursor-pointer"
                aria-label="Select all bookmarks"
              />
            </th>
            <th className="py-3 px-2 w-10 text-center">Fav</th>
            <th className="py-3 px-4 min-w-[280px]">Title & URL</th>
            <th className="py-3 px-4 min-w-[140px]">Collection</th>
            <th className="py-3 px-4 min-w-[180px]">Tags</th>
            <th className="py-3 px-4 text-right min-w-[100px]">Added</th>
            <th className="py-3 px-4 text-right min-w-[80px]">Visits</th>
            <th className="py-3 px-4 text-right min-w-[120px]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {bookmarks.map((b) => {
            const isSelected = selectedIds.has(b.id);
            const col = collectionMap.get(b.collectionId);
            const domain = extractHostname(b.url);
            const formattedDate = new Date(b.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <tr
                key={b.id}
                className={`transition-colors hover:bg-slate-850/50 ${
                  isSelected ? 'bg-purple-950/20' : ''
                }`}
              >
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(b.id)}
                    className="w-4 h-4 rounded text-purple-600 bg-slate-800 border-slate-700 focus:ring-purple-500 cursor-pointer"
                    aria-label={`Select ${b.title}`}
                  />
                </td>

                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => onToggleFavorite(b.id)}
                    className={`p-1 rounded-md transition-colors ${
                      b.isFavorite
                        ? 'text-amber-400 hover:text-amber-300'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                    aria-label={b.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${b.isFavorite ? 'fill-amber-400' : ''}`}
                    />
                  </button>
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    {b.favicon ? (
                      <img
                        src={b.favicon}
                        alt=""
                        className="w-4 h-4 rounded-sm shrink-0 object-contain"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <button
                        onClick={() => onVisit(b.id, b.url)}
                        className="font-medium text-slate-200 hover:text-purple-300 transition-colors truncate block max-w-sm text-left hover:underline"
                      >
                        {b.title}
                      </button>
                      <span className="text-[11px] text-slate-500 truncate block max-w-sm">
                        {domain}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                  {col ? (
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: col.color }}
                      />
                      <span>{col.name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-600">Uncategorized</span>
                  )}
                </td>

                <td className="py-3 px-4 text-slate-400">
                  {b.tags && b.tags.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {b.tags.map((t) => (
                        <button
                          key={t}
                          onClick={() => onTagClick && onTagClick(t)}
                          className="hover:text-purple-300 text-slate-400 transition-colors"
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-600">-</span>
                  )}
                </td>

                <td className="py-3 px-4 text-right text-slate-400 font-mono tabular-nums whitespace-nowrap">
                  {formattedDate}
                </td>

                <td className="py-3 px-4 text-right text-slate-400 font-mono tabular-nums whitespace-nowrap">
                  {b.visitCount}
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onCopyUrl(b.url)}
                      className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
                      title="Copy URL"
                      aria-label="Copy URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onVisit(b.id, b.url)}
                      className="p-1 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded-md transition-colors"
                      title="Open in new tab"
                      aria-label="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit(b)}
                      className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
                      title="Edit"
                      aria-label="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(b)}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
                      title="Delete"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
