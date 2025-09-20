
// src/lib/services/feedbackDataService.ts
import type { SummarizedFeedbackLog } from '@/types';
import { db } from '@/lib/firebase/firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';

const SUMMARIZED_FEEDBACK_COLLECTION = 'summarizedFeedbackLogs';

export async function addSummarizedFeedbackLog(
  feedbackLogData: Omit<SummarizedFeedbackLog, 'id' | 'createdAt'>
): Promise<string | null> {
  if (!db) {
    console.error("Firestore is not initialized. Cannot add feedback log.");
    return null;
  }
  try {
    const feedbackCol = collection(db, SUMMARIZED_FEEDBACK_COLLECTION);
    const docRef = await addDoc(feedbackCol, {
      ...feedbackLogData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Failed to add summarized feedback log to Firestore", error);
    return null;
  }
}

export async function getSummarizedFeedbackLogs(): Promise<SummarizedFeedbackLog[]> {
  if (!db) {
    console.error("Firestore is not initialized. Cannot get feedback logs.");
    return [];
  }
  try {
    const logsCol = collection(db, SUMMARIZED_FEEDBACK_COLLECTION);
    const q = query(logsCol, orderBy('createdAt', 'desc'));
    const logsSnapshot = await getDocs(q);

    const logsList = logsSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      } as SummarizedFeedbackLog;
    });
    return logsList;
  } catch (error) {
    console.error("Failed to fetch summarized feedback logs from Firestore", error);
    return [];
  }
}
