
// src/lib/services/recommendationDataService.ts
import type { Recommendation } from '@/types';
import { db } from '@/lib/firebase/firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, serverTimestamp } from 'firebase/firestore';

const RECOMMENDATIONS_COLLECTION = 'recommendations';

export async function getStoredRecommendations(): Promise<Recommendation[]> {
  if (!db) {
    console.error("Firestore is not initialized. Cannot get recommendations.");
    throw new Error("La base de datos no está disponible. Por favor, inténtalo de nuevo más tarde.");
  }
  try {
    const recommendationsCol = collection(db, RECOMMENDATIONS_COLLECTION);
    const q = query(recommendationsCol, orderBy('createdAt', 'desc'));
    const recommendationsSnapshot = await getDocs(q);
    
    const recommendationsList = recommendationsSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        // Convert Firestore Timestamp to ISO string for consistency with existing Recommendation type
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      } as Recommendation;
    });
    return recommendationsList;
  } catch (error) {
    console.error("Failed to fetch recommendations from Firestore", error);
    throw error; // Re-throw the error to be caught by the calling component
  }
}

export async function addStoredRecommendation(newRecommendationData: Omit<Recommendation, 'id' | 'createdAt'>): Promise<string | null> {
  if (!db) {
    console.error("Firestore is not initialized. Cannot add recommendation.");
    return null;
  }
  try {
    const recommendationsCol = collection(db, RECOMMENDATIONS_COLLECTION);
    const docRef = await addDoc(recommendationsCol, {
      ...newRecommendationData,
      createdAt: serverTimestamp(), // Use server timestamp for consistency
    });
    return docRef.id; // Return the ID of the newly created document
  } catch (error) {
    console.error("Failed to add recommendation to Firestore", error);
    return null;
  }
}
