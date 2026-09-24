import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { CentreProfile, getCentreByEmail } from '../utils/centreUtils';

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [centre, setCentre] = useState<CentreProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        const resolvedCentre = getCentreByEmail(currentUser.email);
        setCentre(resolvedCentre);
      } else {
        setCentre(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return {
    user,
    centre,
    loading,
    logout,
    isAuthenticated: !!user && !!centre
  };
}
