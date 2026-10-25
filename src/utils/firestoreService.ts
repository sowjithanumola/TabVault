import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Bookmark, Collection, CloudUser } from '../types';
import { DEFAULT_COLLECTIONS } from './storage';

/**
 * Sync user profile to Firestore
 */
export async function syncUserProfile(user: CloudUser): Promise<void> {
  const path = `users/${user.id}`;
  try {
    await setDoc(
      doc(db, 'users', user.id),
      {
        uid: user.id,
        email: user.email,
        displayName: user.name,
        photoURL: user.photoURL || null,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribes to real-time bookmark updates for a specific user
 */
export function subscribeToUserBookmarks(
  userId: string,
  onUpdate: (bookmarks: Bookmark[]) => void
): Unsubscribe {
  const path = `users/${userId}/bookmarks`;
  const bookmarksRef = collection(db, 'users', userId, 'bookmarks');

  return onSnapshot(
    bookmarksRef,
    (snapshot) => {
      const items: Bookmark[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Bookmark;
        items.push({
          ...data,
          id: docSnap.id,
        });
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Subscribes to real-time collections updates for a specific user
 */
export function subscribeToUserCollections(
  userId: string,
  onUpdate: (collections: Collection[]) => void
): Unsubscribe {
  const path = `users/${userId}/collections`;
  const collectionsRef = collection(db, 'users', userId, 'collections');

  return onSnapshot(
    collectionsRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Initialize default collections for the user
        const defaults = DEFAULT_COLLECTIONS.map((c) => ({
          ...c,
          userId,
        }));
        for (const col of defaults) {
          await saveCollectionToFirestore(userId, col);
        }
        onUpdate(defaults);
      } else {
        const items: Collection[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Collection;
          items.push({
            ...data,
            id: docSnap.id,
          });
        });
        onUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Saves or updates a bookmark in Firestore
 */
export async function saveBookmarkToFirestore(
  userId: string,
  bookmark: Bookmark
): Promise<void> {
  const path = `users/${userId}/bookmarks/${bookmark.id}`;
  try {
    const payload = {
      ...bookmark,
      userId,
      tags: bookmark.tags || [],
    };
    await setDoc(doc(db, 'users', userId, 'bookmarks', bookmark.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a bookmark from Firestore
 */
export async function deleteBookmarkFromFirestore(
  userId: string,
  bookmarkId: string
): Promise<void> {
  const path = `users/${userId}/bookmarks/${bookmarkId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'bookmarks', bookmarkId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Saves or updates a collection in Firestore
 */
export async function saveCollectionToFirestore(
  userId: string,
  col: Collection
): Promise<void> {
  const path = `users/${userId}/collections/${col.id}`;
  try {
    const payload = {
      ...col,
      userId,
    };
    await setDoc(doc(db, 'users', userId, 'collections', col.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a collection from Firestore
 */
export async function deleteCollectionFromFirestore(
  userId: string,
  collectionId: string
): Promise<void> {
  const path = `users/${userId}/collections/${collectionId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'collections', collectionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
