export interface Bookmark {
  id: string;
  userId?: string;
  url: string;
  title: string;
  description?: string;
  notes?: string;
  collectionId: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  lastVisitedAt?: string;
  visitCount: number;
  favicon?: string;
}

export interface Collection {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface CloudUser {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  createdAt: string;
  lastLoginAt: string;
  cloudSyncEnabled: boolean;
}

export type ViewMode = 'grid' | 'list';

export type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'most-visited';

export type ActiveTab = 'vault' | 'collections' | 'tags' | 'settings' | 'privacy' | 'terms';

export interface StorageStats {
  bookmarkCount: number;
  collectionCount: number;
  tagCount: number;
  favoriteCount: number;
  storageSizeBytes: number;
}
