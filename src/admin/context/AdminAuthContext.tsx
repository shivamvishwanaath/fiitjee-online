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
  isSuperAdminEmail,
  isValidAdminEmail 
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
  refreshToken: number;
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
  const [refreshToken, setRefreshToken] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync with Firebase Authentication state changes & strictly enforce centre isolation
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        const isSuper = isSuperAdminEmail(currentUser.email);
        const isOfficialAdmin = isValidAdminEmail(currentUser.email);

        // Check if explicitly authorized in RTDB admins/${uid}
        let isRtdbAdmin = false;
        let rtdbAssignedCentre: CentreProfile | null = null;
        try {
          const snap = await get(ref(db, `admins/${currentUser.uid}`));
          if (snap.exists()) {
            isRtdbAdmin = true;
            const data = snap.val();
            if (data.assignedCentreId && CENTRES_CONFIG[data.assignedCentreId]) {
              rtdbAssignedCentre = CENTRES_CONFIG[data.assignedCentreId];
            }
          }
        } catch (err) {
          console.error('Error fetching admin centre assignment:', err);
        }

        const isAuthorizedAdmin = isSuper || isOfficialAdmin || isRtdbAdmin;

        if (!isAuthorizedAdmin) {
          // Strictly reject non-admin / student accounts from the admin portal
          await signOut(auth);
          setUser(null);
          setCentre(null);
          setIsCentreLocked(true);
          setCanSwitchCentres(false);
          setAvailableCentres([]);
          setLoading(false);
          return;
        }

        // Only authorized admins reach this point
        setUser(currentUser);

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
          let assignedCentre = getCentreByEmail(currentUser.email) || rtdbAssignedCentre;

          // If still unresolved, default to Bhubaneswar
          if (!assignedCentre) {
            const saved = localStorage.getItem(STORAGE_KEY);
            assignedCentre = (saved && CENTRES_CONFIG[saved]) || CENTRES_CONFIG.bhubaneswar;
          }

          setCentre(assignedCentre);
          setIsCentreLocked(true);
          setCanSwitchCentres(false);
          setAvailableCentres([assignedCentre]);
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
        // When logged out or unauthenticated
        setUser(null);
        setCentre(null);
        setIsCentreLocked(true);
        setCanSwitchCentres(false);
        setAvailableCentres([]);
        localStorage.removeItem(STORAGE_KEY);
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
      setRefreshToken(r => r + 1);
      localStorage.setItem(STORAGE_KEY, centreId);
    }
  };

  const loginWithEmail = async (email: string, pass: string, targetCentreId?: string): Promise<void> => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const isSuper = isSuperAdminEmail(cred.user.email);
      const isOfficial = isValidAdminEmail(cred.user.email);
      let isRtdbAdmin = false;
      let rtdbAssignedCentre: CentreProfile | null = null;
      try {
        const snap = await get(ref(db, `admins/${cred.user.uid}`));
        if (snap.exists()) {
          isRtdbAdmin = true;
          const data = snap.val();
          if (data.assignedCentreId && CENTRES_CONFIG[data.assignedCentreId]) {
            rtdbAssignedCentre = CENTRES_CONFIG[data.assignedCentreId];
          }
        }
      } catch {}

      if (!isSuper && !isOfficial && !isRtdbAdmin) {
        await signOut(auth);
        throw new Error('Access Denied: Only authorized FIITJEE centre emails can access the administration portal.');
      }

      let assignedCentre = getCentreByEmail(cred.user.email) || rtdbAssignedCentre;
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
      const isOfficial = isValidAdminEmail(cred.user.email);
      let isRtdbAdmin = false;
      let rtdbAssignedCentre: CentreProfile | null = null;
      try {
        const snap = await get(ref(db, `admins/${cred.user.uid}`));
        if (snap.exists()) {
          isRtdbAdmin = true;
          const data = snap.val();
          if (data.assignedCentreId && CENTRES_CONFIG[data.assignedCentreId]) {
            rtdbAssignedCentre = CENTRES_CONFIG[data.assignedCentreId];
          }
        }
      } catch {}

      if (!isSuper && !isOfficial && !isRtdbAdmin) {
        await signOut(auth);
        throw new Error('Access Denied: This Google account is not authorized as a centre administrator.');
      }

      let assignedCentre = getCentreByEmail(cred.user.email) || rtdbAssignedCentre;
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
    setCentre(null);
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
    isAuthenticated: !!user && !!centre,
    isCentreLocked,
    canSwitchCentres,
    availableCentres,
    refreshToken,
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
