import React, { useState } from 'react';
import { Tag as TagIcon, Hash, Search, Edit2, Trash2, ArrowRight } from 'lucide-react';

interface TagsViewProps {
  tags: { name: string; count: number }[];
  onSelectTag: (tag: string) => void;
  onRenameTag: (oldTag: string, newTag: string) => void;
  onDeleteTag: (tag: string) => void;
}

export const TagsView: React.FC<TagsViewProps> = ({
  tags,
  onSelectTag,
  onRenameTag,
  onDeleteTag,
}) => {
  const [search, setSearch] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const startRename = (tag: string) => {
    setEditingTag(tag);
    setNewTagName(tag);
  };

  const handleSaveRename = (oldTag: string) => {
    const clean = newTagName.trim().toLowerCase().replace(/^[#\s]+/, '');
    if (clean && clean !== oldTag) {
      onRenameTag(oldTag, clean);
    }
    setEditingTag(null);
    setNewTagName('');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Tags Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, manage, and rename tags across your entire bookmark repository.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {filteredTags.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40">
          <TagIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-300">No tags found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {search ? 'No tags match your search query.' : 'Add tags to your bookmarks to organize them.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredTags.map((t) => {
            const isEditing = editingTag === t.name;

            return (
              <div
                key={t.name}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(t.name);
                        if (e.key === 'Escape') setEditingTag(null);
                      }}
                      autoFocus
                      className="w-full px-2 py-1 rounded bg-slate-950 border border-purple-500 text-xs text-slate-100 focus:outline-none font-mono"
                    />
                    <button
                      onClick={() => handleSaveRename(t.name)}
                      className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold shrink-0"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onSelectTag(t.name)}
                      className="flex items-center gap-2 text-left truncate group"
                      title="Filter bookmarks by this tag"
                    >
                      <Hash className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-purple-300 truncate">
                        {t.name}
                      </span>
                      <span className="text-xs font-mono tabular-nums text-slate-500">
                        ({t.count})
                      </span>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startRename(t.name)}
                        className="p-1 text-slate-400 hover:text-slate-200 rounded-md transition-colors"
                        title="Rename tag"
                        aria-label={`Rename ${t.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete tag "#${t.name}" from all bookmarks?`)) {
                            onDeleteTag(t.name);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
                        title="Remove tag from all bookmarks"
                        aria-label={`Delete tag ${t.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
