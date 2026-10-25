import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Plus,
  Bookmark as BookmarkIcon,
  X,
  RefreshCw,
} from 'lucide-react';
import { Bookmark, Collection, ViewMode, SortOption, ActiveTab, CloudUser } from './types';
import { calculateStorageStats } from './utils/storage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BookmarkCard } from './components/BookmarkCard';
import { BookmarkList } from './components/BookmarkList';
import { AddEditModal } from './components/AddEditModal';
import { CollectionModal } from './components/CollectionModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { BatchActionBar } from './components/BatchActionBar';
import { SettingsView } from './components/SettingsView';
import { CollectionsView } from './components/CollectionsView';
import { TagsView } from './components/TagsView';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { TermsView } from './components/TermsView';
import { SignInView } from './components/SignInView';
import { ToastContainer, ToastMessage } from './components/Toast';
import { exportToJson } from './utils/exportImport';
import {
  getCurrentCloudUser,
  signOutCloudAccount,
  loadAccountBookmarks,
  saveAccountBookmarks,
  loadAccountCollections,
  saveAccountCollections,
} from './utils/cloudAccount';

export default function App() {
  const [user, setUser] = useState<CloudUser | null>(() => getCurrentCloudUser());

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const currentUser = getCurrentCloudUser();
    return currentUser ? loadAccountBookmarks(currentUser.id) : [];
  });

  const [collections, setCollections] = useState<Collection[]>(() => {
    const currentUser = getCurrentCloudUser();
    return currentUser ? loadAccountCollections(currentUser.id) : [];
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('vault');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('tabvault_view_mode_v1') as ViewMode) || 'grid';
  });

  // Batch selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [bookmarkToEdit, setBookmarkToEdit] = useState<Bookmark | null>(null);

  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState<Collection | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // When user changes (signs in or out), load their account data
  useEffect(() => {
    if (user) {
      setBookmarks(loadAccountBookmarks(user.id));
      setCollections(loadAccountCollections(user.id));
    } else {
      setBookmarks([]);
      setCollections([]);
    }
  }, [user]);

  // Sync bookmarks to active Cloud Account storage
  useEffect(() => {
    if (user) {
      saveAccountBookmarks(user.id, bookmarks);
    }
  }, [bookmarks, user]);

  // Sync collections to active Cloud Account storage
  useEffect(() => {
    if (user) {
      saveAccountCollections(user.id, collections);
    }
  }, [collections, user]);

  useEffect(() => {
    localStorage.setItem('tabvault_view_mode_v1', viewMode);
  }, [viewMode]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!user) return;

      // Focus search on '/' or 'Cmd+K' / 'Ctrl+K'
      if (
        (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setActiveTab('vault');
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }

      // New bookmark on 'n' or 'N'
      if (
        (e.key === 'n' || e.key === 'N') &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        !isAddModalOpen &&
        !isCollectionModalOpen
      ) {
        e.preventDefault();
        setBookmarkToEdit(null);
        setIsAddModalOpen(true);
      }

      // Escape clears selection or closes search
      if (e.key === 'Escape') {
        if (selectedIds.size > 0) {
          setSelectedIds(new Set());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen, isCollectionModalOpen, selectedIds, user]);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSignOut = () => {
    signOutCloudAccount();
    setUser(null);
    showToast('info', 'Signed out of Cloud Account.');
    setActiveTab('vault');
  };

  // Aggregated Tags with frequencies
  const allTags = useMemo(() => {
    const tagCountMap: Record<string, number> = {};
    bookmarks.forEach((b) => {
      if (Array.isArray(b.tags)) {
        b.tags.forEach((raw) => {
          const t = raw.trim().toLowerCase();
          if (t) {
            tagCountMap[t] = (tagCountMap[t] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(tagCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [bookmarks]);

  // Bookmark counts for sidebar & collections
  const bookmarkCounts = useMemo(() => {
    const byCollection: Record<string, number> = {};
    let favorites = 0;
    let untagged = 0;
    let recent = 0;

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    bookmarks.forEach((b) => {
      if (b.isFavorite) favorites++;
      if (!b.tags || b.tags.length === 0) untagged++;
      if (b.createdAt >= fourteenDaysAgo || (b.lastVisitedAt && b.lastVisitedAt >= fourteenDaysAgo)) {
        recent++;
      }
      if (b.collectionId) {
        byCollection[b.collectionId] = (byCollection[b.collectionId] || 0) + 1;
      }
    });

    return {
      all: bookmarks.length,
      favorites,
      untagged,
      recent,
      byCollection,
    };
  }, [bookmarks]);

  const storageStats = useMemo(() => {
    return calculateStorageStats(bookmarks, collections);
  }, [bookmarks, collections]);

  // Filtering and Sorting
  const filteredBookmarks = useMemo(() => {
    let result = [...bookmarks];

    // Filter by View / Category / Collection
    if (activeFilter === 'favorites') {
      result = result.filter((b) => b.isFavorite);
    } else if (activeFilter === 'recent') {
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      result = result.filter(
        (b) => b.createdAt >= fourteenDaysAgo || (b.lastVisitedAt && b.lastVisitedAt >= fourteenDaysAgo)
      );
    } else if (activeFilter === 'untagged') {
      result = result.filter((b) => !b.tags || b.tags.length === 0);
    } else if (activeFilter !== 'all') {
      result = result.filter((b) => b.collectionId === activeFilter);
    }

    // Filter by Tag
    if (selectedTag) {
      const targetTag = selectedTag.toLowerCase();
      result = result.filter((b) =>
        b.tags?.some((t) => t.toLowerCase() === targetTag)
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const colMap = new Map<string, string>();
      collections.forEach((c) => colMap.set(c.id, c.name.toLowerCase()));

      result = result.filter((b) => {
        const titleMatch = b.title.toLowerCase().includes(q);
        const urlMatch = b.url.toLowerCase().includes(q);
        const notesMatch = b.notes?.toLowerCase().includes(q);
        const descMatch = b.description?.toLowerCase().includes(q);
        const tagMatch = b.tags?.some((t) => t.toLowerCase().includes(q));
        const colName = colMap.get(b.collectionId) || '';
        const colMatch = colName.includes(q);

        return titleMatch || urlMatch || notesMatch || descMatch || tagMatch || colMatch;
      });
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'most-visited':
          return b.visitCount - a.visitCount;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [bookmarks, activeFilter, selectedTag, searchQuery, sortOption, collections]);

  // Handlers for Bookmark Actions
  const handleSaveBookmark = (data: Partial<Bookmark>) => {
    if (!user) return;

    if (bookmarkToEdit) {
      setBookmarks((prev) =>
        prev.map((b) =>
          b.id === bookmarkToEdit.id
            ? {
                ...b,
                ...data,
                userId: user.id,
                updatedAt: new Date().toISOString(),
              }
            : b
        )
      );
      showToast('success', 'Bookmark updated.');
    } else {
      const newBookmark: Bookmark = {
        id: `bm-${Date.now()}`,
        userId: user.id,
        url: data.url || '',
        title: data.title || '',
        description: data.description || '',
        notes: data.notes || '',
        collectionId: data.collectionId || collections[0]?.id || 'uncategorized',
        tags: data.tags || [],
        isFavorite: data.isFavorite || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visitCount: 0,
        favicon: data.favicon,
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
      showToast('success', 'Bookmark saved to Cloud Account.');
    }
    setBookmarkToEdit(null);
  };

  const handleToggleFavorite = (id: string) => {
    setBookmarks((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const next = !b.isFavorite;
          showToast('info', next ? 'Added to favorites.' : 'Removed from favorites.');
          return { ...b, isFavorite: next, updatedAt: new Date().toISOString() };
        }
        return b;
      })
    );
  };

  const handleVisit = (id: string, url: string) => {
    setBookmarks((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              visitCount: (b.visitCount || 0) + 1,
              lastVisitedAt: new Date().toISOString(),
            }
          : b
      )
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => showToast('success', 'URL copied to clipboard.'),
      () => showToast('error', 'Could not copy URL.')
    );
  };

  const handleDeleteBookmarkPrompt = (bookmark: Bookmark) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Bookmark',
      message: `Are you sure you want to delete "${bookmark.title}"? This cannot be undone.`,
      onConfirm: () => {
        setBookmarks((prev) => prev.filter((b) => b.id !== bookmark.id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(bookmark.id);
          return next;
        });
        showToast('error', 'Bookmark deleted.');
      },
    });
  };

  // Multi-Select Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (filteredBookmarks.every((b) => selectedIds.has(b.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBookmarks.map((b) => b.id)));
    }
  };

  const handleBulkMove = (targetCollectionId: string) => {
    setBookmarks((prev) =>
      prev.map((b) =>
        selectedIds.has(b.id)
          ? { ...b, collectionId: targetCollectionId, updatedAt: new Date().toISOString() }
          : b
      )
    );
    showToast('success', `Moved ${selectedIds.size} bookmarks.`);
    setSelectedIds(new Set());
  };

  const handleBulkToggleFavorite = () => {
    setBookmarks((prev) =>
      prev.map((b) =>
        selectedIds.has(b.id)
          ? { ...b, isFavorite: !b.isFavorite, updatedAt: new Date().toISOString() }
          : b
      )
    );
    showToast('info', `Updated favorites for ${selectedIds.size} bookmarks.`);
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Selected Bookmarks',
      message: `Are you sure you want to delete ${selectedIds.size} selected bookmarks? This cannot be undone.`,
      onConfirm: () => {
        setBookmarks((prev) => prev.filter((b) => !selectedIds.has(b.id)));
        showToast('error', `Deleted ${selectedIds.size} bookmarks.`);
        setSelectedIds(new Set());
      },
    });
  };

  const handleBulkExport = () => {
    const selectedList = bookmarks.filter((b) => selectedIds.has(b.id));
    exportToJson(selectedList, collections);
    showToast('success', `Exported ${selectedList.length} bookmarks as JSON.`);
  };

  // Collection Handlers
  const handleSaveCollection = (data: {
    name: string;
    description: string;
    color: string;
    icon: string;
  }) => {
    if (!user) return;

    if (collectionToEdit) {
      setCollections((prev) =>
        prev.map((c) => (c.id === collectionToEdit.id ? { ...c, ...data } : c))
      );
      showToast('success', `Collection "${data.name}" updated.`);
    } else {
      const newCol: Collection = {
        id: `col-${Date.now()}`,
        userId: user.id,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        createdAt: new Date().toISOString(),
      };
      setCollections((prev) => [...prev, newCol]);
      showToast('success', `Collection "${data.name}" created.`);
    }
    setCollectionToEdit(null);
  };

  const handleDeleteCollectionPrompt = (collection: Collection) => {
    const count = bookmarkCounts.byCollection[collection.id] || 0;
    setDeleteModal({
      isOpen: true,
      title: `Delete Collection "${collection.name}"`,
      message:
        count > 0
          ? `This collection contains ${count} bookmarks. Deleting the collection will move these bookmarks to Uncategorized.`
          : 'Are you sure you want to delete this collection?',
      onConfirm: () => {
        setBookmarks((prev) =>
          prev.map((b) =>
            b.collectionId === collection.id
              ? { ...b, collectionId: 'uncategorized', updatedAt: new Date().toISOString() }
              : b
          )
        );
        setCollections((prev) => prev.filter((c) => c.id !== collection.id));
        if (activeFilter === collection.id) {
          setActiveFilter('all');
        }
        showToast('error', `Collection "${collection.name}" deleted.`);
      },
    });
  };

  // Tag Handlers
  const handleRenameTag = (oldTag: string, newTag: string) => {
    setBookmarks((prev) =>
      prev.map((b) => {
        if (b.tags && b.tags.includes(oldTag)) {
          const updatedTags = b.tags.map((t) => (t === oldTag ? newTag : t));
          return { ...b, tags: Array.from(new Set(updatedTags)), updatedAt: new Date().toISOString() };
        }
        return b;
      })
    );
    if (selectedTag === oldTag) {
      setSelectedTag(newTag);
    }
    showToast('success', `Renamed tag #${oldTag} to #${newTag}.`);
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setBookmarks((prev) =>
      prev.map((b) => {
        if (b.tags && b.tags.includes(tagToDelete)) {
          return {
            ...b,
            tags: b.tags.filter((t) => t !== tagToDelete),
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );
    if (selectedTag === tagToDelete) {
      setSelectedTag(null);
    }
    showToast('error', `Deleted tag #${tagToDelete} from all bookmarks.`);
  };

  // Import / Data Management
  const handleImportData = (
    newBookmarks: Bookmark[],
    newCollections: Collection[],
    replace: boolean
  ) => {
    if (!user) return;

    if (replace) {
      setBookmarks(newBookmarks.map((b) => ({ ...b, userId: user.id })));
      if (newCollections.length > 0) {
        setCollections(newCollections.map((c) => ({ ...c, userId: user.id })));
      }
    } else {
      setBookmarks((prev) => {
        const existingUrls = new Set(prev.map((b) => b.url.toLowerCase()));
        const toAdd = newBookmarks
          .filter((b) => !existingUrls.has(b.url.toLowerCase()))
          .map((b) => ({ ...b, userId: user.id }));
        return [...toAdd, ...prev];
      });

      if (newCollections.length > 0) {
        setCollections((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const existingNames = new Set(prev.map((c) => c.name.toLowerCase()));
          const toAdd = newCollections
            .filter(
              (c) => !existingIds.has(c.id) && !existingNames.has(c.name.toLowerCase())
            )
            .map((c) => ({ ...c, userId: user.id }));
          return [...prev, ...toAdd];
        });
      }
    }
  };

  const handleClearAllData = () => {
    setBookmarks([]);
    setActiveFilter('all');
    setSelectedTag(null);
    setSearchQuery('');
    setSelectedIds(new Set());
  };

  // Title for current filter
  const currentFilterTitle = useMemo(() => {
    if (selectedTag) return `Bookmarks tagged #${selectedTag}`;
    if (activeFilter === 'all') return 'All Bookmarks';
    if (activeFilter === 'favorites') return 'Favorite Bookmarks';
    if (activeFilter === 'recent') return 'Recently Added & Visited';
    if (activeFilter === 'untagged') return 'Untagged Bookmarks';
    const foundCol = collections.find((c) => c.id === activeFilter);
    return foundCol ? foundCol.name : 'Bookmarks';
  }, [activeFilter, selectedTag, collections]);

  const collectionMap = useMemo(() => {
    const map = new Map<string, Collection>();
    collections.forEach((c) => map.set(c.id, c));
    return map;
  }, [collections]);

  // FIRST PAGE MUST BE SIGN IN PAGE IF NOT AUTHENTICATED
  if (!user) {
    if (activeTab === 'privacy') {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
          <PrivacyPolicyView onBack={() => setActiveTab('vault')} />
        </div>
      );
    }
    if (activeTab === 'terms') {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
          <TermsView onBack={() => setActiveTab('vault')} />
        </div>
      );
    }
    return (
      <SignInView
        onSignInSuccess={(signedUser) => {
          setUser(signedUser);
          showToast('success', `Welcome back, ${signedUser.name}!`);
        }}
        onViewPrivacy={() => setActiveTab('privacy')}
        onViewTerms={() => setActiveTab('terms')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
        onOpenNewBookmark={() => {
          setBookmarkToEdit(null);
          setIsAddModalOpen(true);
        }}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        bookmarkCount={bookmarks.length}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Main App Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'vault' && (
          <div className="flex gap-6 min-h-[calc(100vh-4rem)]">
            {/* Desktop Left Sidebar */}
            <div className="hidden lg:block">
              <Sidebar
                collections={collections}
                activeFilter={activeFilter}
                onSelectFilter={setActiveFilter}
                selectedTag={selectedTag}
                onSelectTag={setSelectedTag}
                allTags={allTags}
                bookmarkCounts={bookmarkCounts}
                onOpenNewCollection={() => {
                  setCollectionToEdit(null);
                  setIsCollectionModalOpen(true);
                }}
                storageSizeBytes={storageStats.storageSizeBytes}
              />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 py-6 min-w-0 space-y-6">
              {/* Search and Filter Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles, tags, notes, URLs (Press / to focus)..."
                    className="w-full pl-10 pr-9 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* View Controls: Sort & Grid/List */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="newest" className="bg-slate-900">Newest first</option>
                      <option value="oldest" className="bg-slate-900">Oldest first</option>
                      <option value="title-asc" className="bg-slate-900">Title A-Z</option>
                      <option value="title-desc" className="bg-slate-900">Title Z-A</option>
                      <option value="most-visited" className="bg-slate-900">Most visited</option>
                    </select>
                  </div>

                  {/* Grid / List View Toggle */}
                  <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        viewMode === 'grid'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Grid view"
                      aria-label="Grid view"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        viewMode === 'list'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Compact list view"
                      aria-label="Compact list view"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Header Info Row: Title, active tag, count, and clear filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg font-bold text-slate-100">
                    {currentFilterTitle}
                  </h1>
                  <span className="text-xs font-mono tabular-nums text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {filteredBookmarks.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {(selectedTag || searchQuery || activeFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSelectedTag(null);
                        setSearchQuery('');
                        setActiveFilter('all');
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Bookmarks Grid / List Content or Empty States */}
              {filteredBookmarks.length === 0 ? (
                <div className="p-16 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/30">
                  <BookmarkIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-200 mb-1">
                    {searchQuery ? 'No bookmarks match your search' : 'No bookmarks found'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
                    {searchQuery
                      ? `We couldn't find anything matching "${searchQuery}". Try different keywords or reset your filters.`
                      : 'Your cloud vault is ready. Click the button below to add your first bookmark.'}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    {searchQuery ? (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        Clear Search
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setBookmarkToEdit(null);
                          setIsAddModalOpen(true);
                        }}
                        className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors cursor-pointer"
                      >
                        + Add First Bookmark
                      </button>
                    )}
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredBookmarks.map((bookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      collection={collectionMap.get(bookmark.collectionId)}
                      isSelected={selectedIds.has(bookmark.id)}
                      onToggleSelect={handleToggleSelect}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={(b) => {
                        setBookmarkToEdit(b);
                        setIsAddModalOpen(true);
                      }}
                      onDelete={handleDeleteBookmarkPrompt}
                      onVisit={handleVisit}
                      onCopyUrl={handleCopyUrl}
                      onTagClick={(tag) => setSelectedTag(tag)}
                    />
                  ))}
                </div>
              ) : (
                <BookmarkList
                  bookmarks={filteredBookmarks}
                  collections={collections}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={(b) => {
                    setBookmarkToEdit(b);
                    setIsAddModalOpen(true);
                  }}
                  onDelete={handleDeleteBookmarkPrompt}
                  onVisit={handleVisit}
                  onCopyUrl={handleCopyUrl}
                  onTagClick={(tag) => setSelectedTag(tag)}
                />
              )}
            </main>
          </div>
        )}

        {/* Collections Tab */}
        {activeTab === 'collections' && (
          <CollectionsView
            collections={collections}
            bookmarkCounts={bookmarkCounts.byCollection}
            onOpenNewCollection={() => {
              setCollectionToEdit(null);
              setIsCollectionModalOpen(true);
            }}
            onEditCollection={(c) => {
              setCollectionToEdit(c);
              setIsCollectionModalOpen(true);
            }}
            onDeleteCollection={handleDeleteCollectionPrompt}
            onSelectCollection={(colId) => {
              setActiveFilter(colId);
              setSelectedTag(null);
              setActiveTab('vault');
            }}
          />
        )}

        {/* Tags Tab */}
        {activeTab === 'tags' && (
          <TagsView
            tags={allTags}
            onSelectTag={(tag) => {
              setSelectedTag(tag);
              setActiveFilter('all');
              setActiveTab('vault');
            }}
            onRenameTag={handleRenameTag}
            onDeleteTag={handleDeleteTag}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SettingsView
            user={user}
            bookmarks={bookmarks}
            collections={collections}
            stats={storageStats}
            onImportData={handleImportData}
            onClearAllData={handleClearAllData}
            onSignOut={handleSignOut}
            onShowToast={showToast}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {/* Privacy Policy Tab */}
        {activeTab === 'privacy' && (
          <PrivacyPolicyView onBack={() => setActiveTab('vault')} />
        )}

        {/* Terms Tab */}
        {activeTab === 'terms' && (
          <TermsView onBack={() => setActiveTab('vault')} />
        )}
      </div>

      {/* Batch Action Floating Bar */}
      <BatchActionBar
        selectedCount={selectedIds.size}
        collections={collections}
        onClearSelection={() => setSelectedIds(new Set())}
        onBulkMove={handleBulkMove}
        onBulkToggleFavorite={handleBulkToggleFavorite}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
      />

      {/* Add / Edit Bookmark Modal */}
      <AddEditModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setBookmarkToEdit(null);
        }}
        onSave={handleSaveBookmark}
        bookmarkToEdit={bookmarkToEdit}
        collections={collections}
        existingTags={allTags.map((t) => t.name)}
        onOpenNewCollection={() => {
          setCollectionToEdit(null);
          setIsCollectionModalOpen(true);
        }}
      />

      {/* Collection Modal */}
      <CollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => {
          setIsCollectionModalOpen(false);
          setCollectionToEdit(null);
        }}
        onSave={handleSaveCollection}
        collectionToEdit={collectionToEdit}
      />

      {/* Safe Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={deleteModal.onConfirm}
        title={deleteModal.title}
        message={deleteModal.message}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Quiet Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 mt-12 text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookmarkIcon className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-slate-400">TabVault</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Cloud Account bookmark workspace</span>
          </div>

          <div className="flex items-center gap-5 text-slate-400">
            <button
              onClick={() => setActiveTab('privacy')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
