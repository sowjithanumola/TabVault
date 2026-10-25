import React, { useState } from 'react';
import {
  Star,
  ExternalLink,
  Copy,
  Edit2,
  Trash2,
  Globe,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Bookmark, Collection } from '../types';
import { extractHostname } from '../utils/urlParser';

interface BookmarkCardProps {
  bookmark: Bookmark;
  collection?: Collection;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
  onVisit: (id: string, url: string) => void;
  onCopyUrl: (url: string) => void;
  onTagClick?: (tag: string) => void;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  collection,
  isSelected,
  onToggleSelect,
  onToggleFavorite,
  onEdit,
  onDelete,
  onVisit,
  onCopyUrl,
  onTagClick,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [imgError, setImgError] = useState(false);

  const domain = extractHostname(bookmark.url);
  const formattedDate = new Date(bookmark.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article
      className={`group relative flex flex-col justify-between p-5 rounded-xl border bg-slate-900/90 transition-all ${
        isSelected
          ? 'border-purple-500 bg-purple-950/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div>
        {/* Top Header Row: Checkbox, Domain, Favicon, Star */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(bookmark.id)}
              className="w-4 h-4 rounded text-purple-600 bg-slate-800 border-slate-700 focus:ring-purple-500 focus:ring-offset-slate-900 cursor-pointer"
              aria-label={`Select ${bookmark.title}`}
            />

            <div className="flex items-center gap-2 truncate">
              {bookmark.favicon && !imgError ? (
                <img
                  src={bookmark.favicon}
                  alt=""
                  onError={() => setImgError(true)}
                  className="w-4 h-4 rounded-sm shrink-0 object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Globe className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="text-xs text-slate-400 font-medium truncate">
                {domain}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onToggleFavorite(bookmark.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                bookmark.isFavorite
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                className={`w-4 h-4 ${bookmark.isFavorite ? 'fill-amber-400' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Title Link */}
        <h3 className="text-base font-semibold text-slate-100 hover:text-purple-300 transition-colors mb-2 line-clamp-2 leading-snug">
          <button
            onClick={() => onVisit(bookmark.id, bookmark.url)}
            className="text-left w-full hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 rounded-sm"
          >
            {bookmark.title}
          </button>
        </h3>

        {/* Description */}
        {bookmark.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {bookmark.description}
          </p>
        )}

        {/* Notes preview toggle if notes exist */}
        {bookmark.notes && (
          <div className="mb-3">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showNotes ? 'Hide personal notes' : 'View personal notes'}</span>
              {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showNotes && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                {bookmark.notes}
              </div>
            )}
          </div>
        )}

        {/* Metadata: Unboxed collection & tags with typographic separators */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mb-4">
          {collection && (
            <>
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: collection.color }}
                />
                {collection.name}
              </span>
              {bookmark.tags && bookmark.tags.length > 0 && (
                <span aria-hidden="true" className="text-slate-600">·</span>
              )}
            </>
          )}

          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2">
              {bookmark.tags.map((tag, idx) => (
                <React.Fragment key={tag}>
                  {idx > 0 && <span aria-hidden="true" className="text-slate-600">·</span>}
                  <button
                    onClick={() => onTagClick && onTagClick(tag)}
                    className="text-slate-400 hover:text-purple-300 transition-colors"
                  >
                    #{tag}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Row: Timestamps, Visit Count & Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>{formattedDate}</span>
          {bookmark.visitCount > 0 && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-mono tabular-nums">{bookmark.visitCount} visits</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onCopyUrl(bookmark.url)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Copy URL"
            aria-label="Copy URL"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onVisit(bookmark.id, bookmark.url)}
            className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg transition-colors"
            title="Open in new tab"
            aria-label="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(bookmark)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit bookmark"
            aria-label="Edit bookmark"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(bookmark)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Delete bookmark"
            aria-label="Delete bookmark"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
