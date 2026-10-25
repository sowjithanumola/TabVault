import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  Star,
  Globe,
  Tag as TagIcon,
  FolderPlus,
  Plus,
} from 'lucide-react';
import { Bookmark, Collection } from '../types';
import {
  fetchWebsiteMetadata,
  normalizeUrl,
  deriveTitleFromUrl,
  getFaviconUrl,
} from '../utils/urlParser';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmarkData: Partial<Bookmark>) => void;
  bookmarkToEdit?: Bookmark | null;
  collections: Collection[];
  existingTags: string[];
  onOpenNewCollection: () => void;
}

export const AddEditModal: React.FC<AddEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  bookmarkToEdit,
  collections,
  existingTags,
  onOpenNewCollection,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [collectionId, setCollectionId] = useState('col-dev');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [metaStatus, setMetaStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookmarkToEdit) {
      setUrl(bookmarkToEdit.url);
      setTitle(bookmarkToEdit.title);
      setDescription(bookmarkToEdit.description || '');
      setNotes(bookmarkToEdit.notes || '');
      setCollectionId(bookmarkToEdit.collectionId || collections[0]?.id || 'uncategorized');
      setTags(bookmarkToEdit.tags || []);
      setIsFavorite(bookmarkToEdit.isFavorite || false);
      setError(null);
      setMetaStatus(null);
    } else {
      setUrl('');
      setTitle('');
      setDescription('');
      setNotes('');
      setCollectionId(collections[0]?.id || 'uncategorized');
      setTags([]);
      setIsFavorite(false);
      setError(null);
      setMetaStatus(null);
    }
  }, [bookmarkToEdit, isOpen, collections]);

  if (!isOpen) return null;

  const handleFetchTitle = async () => {
    if (!url.trim()) {
      setError('Please enter a URL first.');
      return;
    }

    const normalized = normalizeUrl(url);
    setUrl(normalized);
    setIsFetchingMetadata(true);
    setMetaStatus(null);
    setError(null);

    try {
      const meta = await fetchWebsiteMetadata(normalized);
      if (meta.title) {
        setTitle(meta.title);
        if (meta.description && !description) {
          setDescription(meta.description);
        }
        setMetaStatus(
          meta.source === 'scraped' ? 'Title retrieved from website' : 'Title generated from URL'
        );
      }
    } catch {
      const fallback = deriveTitleFromUrl(normalized);
      setTitle(fallback);
      setMetaStatus('Generated from URL path');
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const handleUrlBlur = () => {
    if (url.trim() && !title.trim()) {
      handleFetchTitle();
    }
  };

  const handleAddTag = (tagToAdd?: string) => {
    const raw = tagToAdd || tagInput;
    const cleanTag = raw.trim().toLowerCase().replace(/^[#\s]+/, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('A valid URL is required.');
      return;
    }

    const normalized = normalizeUrl(url);
    const finalTitle = title.trim() || deriveTitleFromUrl(normalized);
    const faviconUrl = getFaviconUrl(normalized);

    onSave({
      url: normalized,
      title: finalTitle,
      description: description.trim(),
      notes: notes.trim(),
      collectionId,
      tags,
      isFavorite,
      favicon: faviconUrl,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 relative my-8"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-950/60 text-purple-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              {bookmarkToEdit ? 'Edit Bookmark' : 'Add New Bookmark'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL with Title Fetch Button */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              URL <span className="text-purple-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="https://example.com/article"
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                required
                autoFocus={!bookmarkToEdit}
              />
              <button
                type="button"
                onClick={handleFetchTitle}
                disabled={isFetchingMetadata || !url.trim()}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
                title="Automatically fetch title and description"
              >
                {isFetchingMetadata ? (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-400" />
                )}
                <span>Retrieve Title</span>
              </button>
            </div>
            {metaStatus && (
              <p className="text-[11px] text-purple-400 mt-1 font-medium">{metaStatus}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Title <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bookmark Title"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Collection & Favorite Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Collection
                </label>
                <button
                  type="button"
                  onClick={onOpenNewCollection}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>New</span>
                </button>
              </div>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
              >
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value="uncategorized">Uncategorized</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-slate-800 border-slate-700 focus:ring-purple-500 cursor-pointer"
                />
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-200">
                  <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                  Mark as Favorite
                </span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tags
            </label>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-xs font-medium text-slate-200"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-400 text-slate-400 p-0.5"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <TagIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Type tag and press Enter or comma..."
                  className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
                {tagInput && (
                  <button
                    type="button"
                    onClick={() => handleAddTag()}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium px-2 py-0.5 rounded bg-purple-950/60"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>

            {/* Suggested existing tags */}
            {existingTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-slate-500">Suggestions:</span>
                {existingTags.slice(0, 8).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleAddTag(st)}
                    disabled={tags.includes(st)}
                    className="text-[11px] text-slate-400 hover:text-purple-300 disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
                  >
                    +{st}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary of this bookmark..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Personal Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Personal Notes & Code Snippets
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add key takeaways, login tips, commands, or personal reminders..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y font-sans"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 rounded-lg transition-colors shadow-sm"
            >
              {bookmarkToEdit ? 'Save Changes' : 'Create Bookmark'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
