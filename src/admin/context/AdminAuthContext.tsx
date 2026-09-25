import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { ref, set, update } from 'firebase/database';
import { auth, db } from '../../firebase';
import { CentreProfile, ALL_CENTRES, CENTRES_CONFIG, getCentreByEmail } from '../utils/centreUtils';

export interface AdminAuthContextType {
  user: User | null;
  centre: CentreProfile | null;
  activeCentreId: string;
  loading: boolean;
  isAuthenticated: boolean;
  availableCentres: CentreProfile[];
  switchCentre: (centreId: string) => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

const STORAGE_KEY = 'fiitjee_admin_active_centre';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [centre, setCentre] = useState<CentreProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved && CENTRES_CONFIG[saved]) || CENTRES_CONFIG.bhubaneswar;
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Sync with Firebase Authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser && currentUser.email) {
        // 1. If user email directly maps to a specific centre email (e.g. fiitjee.dwarka@fiitjee.online)
        const emailCentre = getCentreByEmail(currentUser.email);
        if (emailCentre) {
          setCentre(emailCentre);
          localStorage.setItem(STORAGE_KEY, emailCentre.id);
        } else {
          // 2. For general admin / developer accounts, use persisted centre or fallback to Bhubaneswar
          const saved = localStorage.getItem(STORAGE_KEY);
          const fallback = (saved && CENTRES_CONFIG[saved]) || CENTRES_CONFIG.bhubaneswar;
          setCentre(fallback);
        }

        // Record admin active session in RTDB
        try {
          const adminRef = ref(db, `admins/${currentUser.uid}`);
          await update(adminRef, {
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email.split('@')[0],
            lastLoginAt: new Date().toISOString()
          });
        } catch {
          // Non-blocking RTDB update
        }
      } else {
        // When logged out, keep default centre reference ready
        const saved = localStorage.getItem(STORAGE_KEY);
        setCentre((saved && CENTRES_CONFIG[saved]) || CENTRES_CONFIG.bhubaneswar);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const switchCentre = (centreId: string) => {
    const nextCentre = CENTRES_CONFIG[centreId];
    if (nextCentre) {
      setCentre(nextCentre);
      localStorage.setItem(STORAGE_KEY, centreId);
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<void> => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const emailCentre = getCentreByEmail(cred.user.email);
      if (emailCentre) {
        setCentre(emailCentre);
        localStorage.setItem(STORAGE_KEY, emailCentre.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const emailCentre = getCentreByEmail(cred.user.email);
      if (emailCentre) {
        setCentre(emailCentre);
        localStorage.setItem(STORAGE_KEY, emailCentre.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    setUser(null);
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const value: AdminAuthContextType = {
    user,
    centre,
    activeCentreId: centre?.id || 'bhubaneswar',
    loading,
    isAuthenticated: !!user,
    availableCentres: ALL_CENTRES,
    switchCentre,
    loginWithEmail,
    loginWithGoogle,
    logout,
    sendPasswordReset
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
