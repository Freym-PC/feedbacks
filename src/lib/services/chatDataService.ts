
import type { ChatMessage } from '@/types';
import { db } from '@/lib/firebase/firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { moderateChat, type ModerateChatInput } from '@/ai/flows/moderate-chat-flow';

const CHAT_MESSAGES_COLLECTION = 'chatMessages';

/**
 * Sets up a real-time listener for chat messages.
 * @param callback Function to be called with the array of messages whenever data changes.
 * @returns An unsubscribe function to detach the listener.
 */
export function getChatMessagesStream(
  callback: (messages: ChatMessage[]) => void
): () => void {
  if (!db) {
    console.error("Firestore is not initialized. Cannot get chat messages.");
    callback([]);
    return () => {}; // Return a no-op unsubscribe function
  }
  const messagesCol = collection(db, CHAT_MESSAGES_COLLECTION);
  const q = query(messagesCol, orderBy('createdAt', 'asc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messagesList = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      } as ChatMessage;
    });
    callback(messagesList);
  }, (error) => {
    console.error("Error fetching chat messages in real-time:", error);
    callback([]); // Return empty array on error
  });

  return unsubscribe;
}

/**
 * Moderates a chat message using an AI flow and adds it to Firestore.
 * @param messageData The basic message data from the client.
 * @returns The ID of the newly created document, or null on failure.
 */
export async function addChatMessage(
  messageData: Omit<ChatMessage, 'id' | 'createdAt' | 'text'> & { text: string }
): Promise<string | null> {
  if (!db) {
    console.error("Firestore is not initialized. Cannot add chat message.");
    throw new Error("La base de datos no está disponible. Por favor, inténtalo de nuevo más tarde.");
  }
  try {
    // 1. Moderate the content first
    const moderationInput: ModerateChatInput = { text: messageData.text };
    const moderationResult = await moderateChat(moderationInput);

    // 2. Prepare the final document to be saved
    const finalMessage = {
      userId: messageData.userId,
      userName: messageData.userName,
      text: moderationResult.moderatedText,
      isModerated: !moderationResult.isAppropriate,
      createdAt: serverTimestamp(),
    };

    // 3. Add the moderated message to Firestore
    const messagesCol = collection(db, CHAT_MESSAGES_COLLECTION);
    const docRef = await addDoc(messagesCol, finalMessage);
    
    return docRef.id;
  } catch (error) {
    console.error("Failed to add chat message to Firestore:", error);
    throw error; // Re-throw to be caught by the UI
  }
}
