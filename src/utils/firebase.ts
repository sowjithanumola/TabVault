import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { CloudUser } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Test Firestore Connection on boot per Skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or configuration pending.');
    }
  }
}
testConnection();

// Skill-mandated Firestore error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Transforms a Firebase User object into our application CloudUser
 */
export function mapFirebaseUserToCloudUser(fbUser: FirebaseUser): CloudUser {
  return {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
    email: fbUser.email || '',
    avatarColor: '#7c3aed',
    photoURL: fbUser.photoURL || undefined,
    isGoogle: true,
    createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
    lastLoginAt: fbUser.metadata.lastSignInTime || new Date().toISOString(),
    cloudSyncEnabled: true,
  };
}

/**
 * Initiates Google Sign In / Sign Up via popup
 */
export async function signInWithGoogle(): Promise<{
  success: boolean;
  user?: CloudUser;
  error?: string;
}> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (!result.user) {
      return { success: false, error: 'Sign in was cancelled.' };
    }
    const cloudUser = mapFirebaseUserToCloudUser(result.user);
    return { success: true, user: cloudUser };
  } catch (error: any) {
    console.error('Google Sign-In failed:', error);
    let message = 'Failed to sign in with Google.';
    if (error.code === 'auth/popup-closed-by-user') {
      message = 'Sign in window was closed before completion.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      message = 'Only one sign-in window can be open at a time.';
    } else if (error.message) {
      message = error.message;
    }
    return { success: false, error: message };
  }
}

/**
 * Signs out from Firebase Auth
 */
export async function signOutFromFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Failed to sign out from Firebase', error);
  }
}

export { onAuthStateChanged };
