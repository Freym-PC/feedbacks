
// src/lib/services/userDataService.ts
import type { User } from '@/types';
import { db } from '@/lib/firebase/firebaseConfig';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const USERS_COLLECTION = 'users';

export async function getUserFromFirestore(userId: string): Promise<User | null> {
  if (!db) {
    console.error("Firestore is not initialized. Cannot get user.");
    return null;
  }
  if (!userId) return null;
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    console.log('No such user document!');
    return null;
  } catch (error) {
    console.error("Error fetching user from Firestore:", error);
    return null;
  }
}

export async function saveUserToFirestore(user: User): Promise<void> {
  if (!db) {
    console.error("Firestore is not initialized. Cannot save user.");
    return;
  }
  if (!user || !user.id) {
    console.error("User data or user ID is missing.");
    return;
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(userDocRef, { 
      name: user.name, 
      email: user.email, 
      professionalSector: user.professionalSector || null 
    }, { merge: true }); // Use merge to avoid overwriting fields not included
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
  }
}

// This function might be used for deleting a user account in the future.
// For logging out, Firebase Auth's signOut is used, and AuthContext clears local state.
export async function removeUserFromFirestore(userId: string): Promise<void> {
   if (!db) {
    console.error("Firestore is not initialized. Cannot remove user.");
    return;
  }
   if (!userId) {
    console.error("User ID is missing for removal.");
    return;
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userDocRef);
  } catch (error)
    {
    console.error("Error removing user from Firestore:", error);
  }
}

// These functions are kept for compatibility but will now interact with Firestore via the above functions.
// In a typical scenario with Firebase, AuthContext would directly call getUserFromFirestore and saveUserToFirestore.
// The "getStoredUser" name is a bit misleading now, it fetches from DB.
export async function getStoredUser(userId: string): Promise<User | null> {
  return getUserFromFirestore(userId);
}

export async function saveUserToStorage(user: User): Promise<void> {
  return saveUserToFirestore(user);
}

export async function removeUserFromStorage(userId: string): Promise<void> {
  return removeUserFromFirestore(userId);
}
