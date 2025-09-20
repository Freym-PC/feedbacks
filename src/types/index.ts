
import type { Timestamp } from 'firebase/firestore';

export type ProfessionalSector =
  | 'Tecnología'
  | 'Salud'
  | 'Finanzas'
  | 'Educación'
  | 'Marketing'
  | 'Artes Creativas'
  | 'Ingeniería'
  | 'Legal'
  | 'Hostelería'
  | 'Venta Minorista'
  | 'Manufactura'
  | 'Otro';

export interface User {
  id: string; // Firebase Auth UID
  name: string;
  email: string;
  professionalSector?: ProfessionalSector | null; // Allow null from Firestore
  isAnonymous?: boolean; // Flag for anonymous users
}

export interface Recommendation {
  id:string; // Firestore document ID
  userId: string;
  userName: string;
  userSector?: ProfessionalSector | null; // Allow null from Firestore
  text: string;
  sector: ProfessionalSector;
  createdAt: string; // Stored as Firestore Timestamp, converted to ISO string for client use
}

export interface SummarizedFeedbackLog {
  id: string; // Firestore document ID
  originalFeedbackText: string;
  summaryText: string;
  userId?: string | null; // Optional: ID of the user who submitted, if logged in
  createdAt: string; // Stored as Firestore Timestamp, converted to ISO string for client use
}

export interface ChatMessage {
  id: string; // Firestore document ID
  userId: string;
  userName: string;
  text: string;
  createdAt: string; // ISO string
  isModerated?: boolean; // Flag to indicate if the message was altered
}
