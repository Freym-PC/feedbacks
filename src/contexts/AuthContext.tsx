
"use client";

import type { User, ProfessionalSector } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase/firebaseConfig'; 
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  signInAnonymously, 
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { getUserFromFirestore, saveUserToFirestore } from '@/lib/services/userDataService';

interface AuthContextType {
  user: User | null;
  login: (credentials: {email: string, password: string}) => Promise<void>;
  signup: (userData: Omit<User, 'id'> & {password: string}) => Promise<void>;
  logout: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  updateUser: (updatedFields: Partial<User>) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure auth is initialized before setting up the listener
    if (!auth) {
      console.error("Firebase Auth no está inicializado. El contexto de autenticación no puede funcionar.");
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      if (firebaseUser) {
        if (firebaseUser.isAnonymous) {
          const guestUser: User = {
            id: firebaseUser.uid,
            name: "Usuario Invitado",
            email: "", 
            professionalSector: null,
            isAnonymous: true,
          };
          setUser(guestUser);
        } else {
          let appUser = await getUserFromFirestore(firebaseUser.uid);
          if (!appUser) {
            console.warn(`No se encontró perfil de Firestore para el usuario no anónimo ${firebaseUser.uid}. Creando uno por defecto.`);
            const defaultUserProfile: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || "Nuevo Usuario", 
              email: firebaseUser.email || "", 
              professionalSector: null, 
              isAnonymous: false,
            };
            try {
              await saveUserToFirestore(defaultUserProfile); 
              appUser = defaultUserProfile; 
            } catch (saveError) {
                console.error("Failed to save default user profile to Firestore:", saveError);
                appUser = defaultUserProfile; 
            }
          }
          setUser(appUser);
        }
      } else {
        setUser(null); 
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const login = async (credentials: {email: string, password: string}) => {
    if (!auth) throw new Error("Firebase Auth no está inicializado.");
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    } catch (error) {
      console.error("Error logging in:", error);
      setIsLoading(false); 
      throw error; 
    }
  };

  const signup = async (userData: Omit<User, 'id'> & { password: string }) => {
    if (!auth) throw new Error("Firebase Auth no está inicializado.");
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const firebaseUser = userCredential.user;
      const newUser: User = {
        id: firebaseUser.uid,
        name: userData.name,
        email: userData.email,
        professionalSector: userData.professionalSector || null,
        isAnonymous: false, 
      };
      await saveUserToFirestore(newUser);
      setUser(newUser); 
    } catch (error) {
      console.error("Error signing up:", error);
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const signInAnonymouslyHandler = async () => {
    if (!auth) throw new Error("Firebase Auth no está inicializado.");
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Error signing in anonymously:", error);
      setIsLoading(false); 
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) throw new Error("Firebase Auth no está inicializado.");
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoading(false); 
    }
  };
  
  const updateUser = async (updatedFields: Partial<User>) => {
    if (user && !user.isAnonymous) { 
      setIsLoading(true);
      const updatedUser = { ...user, ...updatedFields } as User; 
      try {
        await saveUserToFirestore(updatedUser);
        setUser(updatedUser);
      } catch (error) {
        console.error("Error updating user:", error);
      } finally {
        setIsLoading(false);
      }
    } else if (user && user.isAnonymous) {
      console.log("Las actualizaciones de perfil están deshabilitadas para usuarios anónimos.");
    }
  };

  const sendPasswordResetEmailHandler = async (email: string) => {
    if (!auth) throw new Error("Firebase Auth no está inicializado.");
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, signInAnonymously: signInAnonymouslyHandler, updateUser, sendPasswordResetEmail: sendPasswordResetEmailHandler, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
