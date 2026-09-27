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
import { ref, get, update } from 'firebase/database';
import { auth, db } from '../../firebase';
import { 
  CentreProfile, 
  ALL_CENTRES, 
  CENTRES_CONFIG, 
  getCentreByEmail, 
  isSuperAdminEmail 
} from '../utils/centreUtils';

export interface AdminAuthContextType {
  user: User | null;
  centre: CentreProfile | null;
  activeCentreId: string;
  loading: boolean;
  isAuthenticated: boolean;
  isCentreLocked: boolean;
  canSwitchCentres: boolean;
  availableCentres: CentreProfile[];
  switchCentre: (centreId: string) => void;
  loginWithEmail: (email: string, pass: string, targetCentreId?: string) => Promise<void>;
  loginWithGoogle: (targetCentreId?: string) => Promise<void>;
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
  const [isCentreLocked, setIsCentreLocked] = useState<boolean>(true);
  const [canSwitchCentres, setCanSwitchCentres] = useState<boolean>(false);
  const [availableCentres, setAvailableCentres] = useState<CentreProfile[]>([CENTRES_CONFIG.bhubaneswar]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync with Firebase Authentication state changes & strictly enforce centre isolation
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser && currentUser.email) {
        const isSuper = isSuperAdminEmail(currentUser.email);

        if (isSuper) {
          // 1. Superadmin (Developer / National Corporate Office): Can inspect all branches
          setIsCentreLocked(false);
          setCanSwitchCentres(true);
          setAvailableCentres(ALL_CENTRES);

          const saved = localStorage.getItem(STORAGE_KEY);
          const activeCentre = (saved && CENTRES_CONFIG[saved]) || CENTRES_CONFIG.bhubaneswar;
          setCentre(activeCentre);
          localStorage.setItem(STORAGE_KEY, activeCentre.id);
        } else {
          // 2. Regular Centre Staff: Strictly locked to their assigned centre only
          let assignedCentre = getCentreByEmail(currentUser.email);

          // If email didn't match directly, check RTDB admin profile
          if (!assignedCentre && currentUser.uid) {
            try {
              const snap = await get(ref(db, `admins/${currentUser.uid}`));
              if (snap.exists()) {
                const data = snap.val();
                if (data.assignedCentreId && CENTRES_CONFIG[data.assignedCentreId]) {
                  assignedCentre = CENTRES_CONFIG[data.assignedCentreId];
                }
              }
            } catch (err) {
              console.error('Error fetching admin centre assignment:', err);
            }
          }

          // If still unresolved, fallback to saved or default and persist
          if (!assignedCentre) {
            const saved = localStorage.getItem(STORAGE_KEY);
            assignedCentre = (saved && CENTRES_CONFIG[saved]) || CENTRES_CONFIG.bhubaneswar;
          }

          setCentre(assignedCentre);
          setIsCentreLocked(true);
          setCanSwitchCentres(false);
          setAvailableCentres([assignedCentre]);
          // Strict overwrite of storage to lock access
          localStorage.setItem(STORAGE_KEY, assignedCentre.id);
        }

        // Record admin active session & centre assignment in RTDB
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
        // When logged out
        setIsCentreLocked(true);
        setCanSwitchCentres(false);
        const saved = localStorage.getItem(STORAGE_KEY);
        const fallback = (saved && CENTRES_CONFIG[saved]) || CENTRES_CONFIG.bhubaneswar;
        setCentre(fallback);
        setAvailableCentres([fallback]);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const switchCentre = (centreId: string) => {
    // Security check: Block unauthorized cross-centre access
    if (!canSwitchCentres) {
      console.warn(`[Security Notice] User ${user?.email} is restricted to centre ${centre?.name}. Cross-centre switching is disabled.`);
      return;
    }

    const nextCentre = CENTRES_CONFIG[centreId];
    if (nextCentre) {
      setCentre(nextCentre);
      localStorage.setItem(STORAGE_KEY, centreId);
    }
  };

  const loginWithEmail = async (email: string, pass: string, targetCentreId?: string): Promise<void> => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const isSuper = isSuperAdminEmail(cred.user.email);
      let assignedCentre = getCentreByEmail(cred.user.email);

      if (!assignedCentre && targetCentreId && CENTRES_CONFIG[targetCentreId]) {
        assignedCentre = CENTRES_CONFIG[targetCentreId];
      }

      if (!isSuper && assignedCentre) {
        setCentre(assignedCentre);
        setIsCentreLocked(true);
        setCanSwitchCentres(false);
        setAvailableCentres([assignedCentre]);
        localStorage.setItem(STORAGE_KEY, assignedCentre.id);

        try {
          await update(ref(db, `admins/${cred.user.uid}`), {
            assignedCentreId: assignedCentre.id,
            centreName: assignedCentre.name,
            lastLoginAt: new Date().toISOString()
          });
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (targetCentreId?: string): Promise<void> => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const isSuper = isSuperAdminEmail(cred.user.email);
      let assignedCentre = getCentreByEmail(cred.user.email);

      if (!assignedCentre && targetCentreId && CENTRES_CONFIG[targetCentreId]) {
        assignedCentre = CENTRES_CONFIG[targetCentreId];
      }

      if (!isSuper && assignedCentre) {
        setCentre(assignedCentre);
        setIsCentreLocked(true);
        setCanSwitchCentres(false);
        setAvailableCentres([assignedCentre]);
        localStorage.setItem(STORAGE_KEY, assignedCentre.id);

        try {
          await update(ref(db, `admins/${cred.user.uid}`), {
            assignedCentreId: assignedCentre.id,
            centreName: assignedCentre.name,
            lastLoginAt: new Date().toISOString()
          });
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    setUser(null);
    setIsCentreLocked(true);
    setCanSwitchCentres(false);
    localStorage.removeItem(STORAGE_KEY);
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
    isCentreLocked,
    canSwitchCentres,
    availableCentres,
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
