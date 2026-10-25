import { Bookmark, Collection, StorageStats } from '../types';

export const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: 'col-dev',
    name: 'Development',
    description: 'Frameworks, programming languages, and engineering documentation',
    color: '#8b5cf6',
    icon: 'Code',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'col-design',
    name: 'Design & UI',
    description: 'Interface design, iconography, design systems, and visual resources',
    color: '#ec4899',
    icon: 'Palette',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'col-reading',
    name: 'Reading List',
    description: 'Articles, blogs, and tutorials to study',
    color: '#3b82f6',
    icon: 'BookOpen',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'col-tools',
    name: 'Tools & Utilities',
    description: 'Web development utilities, conversion tools, and developer helpers',
    color: '#10b981',
    icon: 'Terminal',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'col-reference',
    name: 'Reference & Docs',
    description: 'Official API references, specs, and platform standards',
    color: '#f59e0b',
    icon: 'Globe',
    createdAt: new Date().toISOString(),
  },
];

// All mock data strictly removed
export const INITIAL_BOOKMARKS: Bookmark[] = [];

export function calculateStorageStats(bookmarks: Bookmark[], collections: Collection[]): StorageStats {
  const allTags = new Set<string>();
  let favoriteCount = 0;

  bookmarks.forEach((b) => {
    if (b.isFavorite) favoriteCount++;
    if (Array.isArray(b.tags)) {
      b.tags.forEach((t) => allTags.add(t.toLowerCase().trim()));
    }
  });

  const estimatedJsonBytes = JSON.stringify({ bookmarks, collections }).length * 2;

  return {
    bookmarkCount: bookmarks.length,
    collectionCount: collections.length,
    tagCount: allTags.size,
    favoriteCount,
    storageSizeBytes: estimatedJsonBytes,
  };
}
