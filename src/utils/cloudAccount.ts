import { CloudUser, Bookmark, Collection } from '../types';
import { DEFAULT_COLLECTIONS } from './storage';

const STORAGE_KEYS = {
  ACCOUNTS: 'tabvault_cloud_accounts_v1',
  ACTIVE_USER_ID: 'tabvault_active_user_id_v1',
  DATA_PREFIX: 'tabvault_account_',
};

const AVATAR_COLORS = [
  '#7c3aed', // Purple
  '#2563eb', // Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#db2777', // Pink
  '#0891b2', // Cyan
];

/**
 * Retrieves all registered Cloud Accounts
 */
export function getAllCloudAccounts(): CloudUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves all Cloud Accounts
 */
function saveAllCloudAccounts(accounts: CloudUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (error) {
    console.error('Failed to save accounts', error);
  }
}

/**
 * Gets the currently signed in Cloud User
 */
export function getCurrentCloudUser(): CloudUser | null {
  try {
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (!activeId) return null;
    const accounts = getAllCloudAccounts();
    return accounts.find((a) => a.id === activeId) || null;
  } catch {
    return null;
  }
}

/**
 * Sets the active Cloud User
 */
export function setCurrentCloudUser(user: CloudUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, user.id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    }
  } catch (error) {
    console.error('Failed to set active user', error);
  }
}

/**
 * Registers a new Cloud Account
 */
export function signUpCloudAccount(
  name: string,
  email: string,
  password?: string
): { success: boolean; user?: CloudUser; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!cleanName) {
    return { success: false, error: 'Please enter your name.' };
  }

  const existing = getAllCloudAccounts();
  const found = existing.find((a) => a.email.toLowerCase() === cleanEmail);
  if (found) {
    return { success: false, error: 'An account with this email already exists. Please sign in.' };
  }

  const colorIndex = Math.floor(Math.random() * AVATAR_COLORS.length);
  const newUser: CloudUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    avatarColor: AVATAR_COLORS[colorIndex],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    cloudSyncEnabled: true,
  };

  const updatedAccounts = [newUser, ...existing];
  saveAllCloudAccounts(updatedAccounts);
  setCurrentCloudUser(newUser);

  // Initialize fresh collections for the new user, zero mock bookmarks
  saveAccountBookmarks(newUser.id, []);
  saveAccountCollections(newUser.id, DEFAULT_COLLECTIONS.map((c) => ({ ...c, userId: newUser.id })));

  return { success: true, user: newUser };
}

/**
 * Signs in to an existing Cloud Account (or auto-creates if first sign-in)
 */
export function signInCloudAccount(
  email: string,
  password?: string
): { success: boolean; user?: CloudUser; error?: string } {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const accounts = getAllCloudAccounts();
  let user = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

  if (!user) {
    // Conveniently create the cloud account if it's the user's first time
    const namePart = cleanEmail.split('@')[0];
    const derivedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const signUpResult = signUpCloudAccount(derivedName, cleanEmail, password);
    return signUpResult;
  }

  // Update last login
  user = {
    ...user,
    lastLoginAt: new Date().toISOString(),
  };

  const updatedAccounts = accounts.map((a) => (a.id === user?.id ? user : a));
  saveAllCloudAccounts(updatedAccounts as CloudUser[]);
  setCurrentCloudUser(user);

  return { success: true, user };
}

/**
 * Signs out of the current Cloud Account
 */
export function signOutCloudAccount(): void {
  setCurrentCloudUser(null);
}

/**
 * Updates properties of the current Cloud Account
 */
export function updateCurrentCloudAccount(updates: Partial<CloudUser>): CloudUser | null {
  const current = getCurrentCloudUser();
  if (!current) return null;

  const updated = { ...current, ...updates };
  const all = getAllCloudAccounts().map((a) => (a.id === current.id ? updated : a));
  saveAllCloudAccounts(all);
  return updated;
}

/**
 * Loads isolated bookmarks for a specific Cloud Account (zero mock bookmarks)
 */
export function loadAccountBookmarks(userId: string): Bookmark[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.DATA_PREFIX}${userId}_bookmarks`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves bookmarks for a specific Cloud Account
 */
export function saveAccountBookmarks(userId: string, bookmarks: Bookmark[]): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEYS.DATA_PREFIX}${userId}_bookmarks`,
      JSON.stringify(bookmarks)
    );
  } catch (error) {
    console.error('Failed to save account bookmarks', error);
  }
}

/**
 * Loads isolated collections for a specific Cloud Account
 */
export function loadAccountCollections(userId: string): Collection[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.DATA_PREFIX}${userId}_collections`);
    if (!raw) {
      const initialCols = DEFAULT_COLLECTIONS.map((c) => ({ ...c, userId }));
      saveAccountCollections(userId, initialCols);
      return initialCols;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initialCols = DEFAULT_COLLECTIONS.map((c) => ({ ...c, userId }));
    saveAccountCollections(userId, initialCols);
    return initialCols;
  } catch {
    return DEFAULT_COLLECTIONS.map((c) => ({ ...c, userId }));
  }
}

/**
 * Saves collections for a specific Cloud Account
 */
export function saveAccountCollections(userId: string, collections: Collection[]): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEYS.DATA_PREFIX}${userId}_collections`,
      JSON.stringify(collections)
    );
  } catch (error) {
    console.error('Failed to save account collections', error);
  }
}
