import { useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { ref, set, update, onValue, remove } from 'firebase/database';
import { auth, db } from '../../firebase';
import { StudentProfile } from '../../types';

export function useStudentAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch or sync student profile from RTDB
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setFirebaseUser(currentUser);
      if (!currentUser) {
        setStudent(null);
        setLoading(false);
        return;
      }

      // Check if this is an admin account (do not treat as student)
      if (currentUser.email && currentUser.email.endsWith('@fiitjee.online')) {
        setStudent(null);
        setLoading(false);
        return;
      }

      try {
        const studentRef = ref(db, `students/${currentUser.uid}`);
        // Subscribe to real-time updates of student profile
        const unsubscribeDb = onValue(studentRef, (snapshot) => {
          if (snapshot.exists()) {
            setStudent({ uid: currentUser.uid, ...snapshot.val() });
          } else {
            // If profile does not exist yet, create a minimal profile
            const minimal: StudentProfile = {
              uid: currentUser.uid,
              fullName: currentUser.displayName || 'Candidate',
              parentName: '',
              email: currentUser.email || '',
              phone: currentUser.phoneNumber || '',
              currentClass: 'Class X',
              schoolName: '',
              createdAt: new Date().toISOString()
            };
            set(studentRef, minimal).then(() => setStudent(minimal));
          }
          setLoading(false);
        });

        return () => unsubscribeDb();
      } catch (err) {
        console.error('Error fetching student profile:', err);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      if (cred.user) {
        const studentRef = ref(db, `students/${cred.user.uid}`);
        await update(studentRef, { lastLoginAt: new Date().toISOString() });
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    profileData: Omit<StudentProfile, 'uid' | 'createdAt'>, 
    pass: string
  ): Promise<string> => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, profileData.email.trim(), pass);
      const uid = cred.user.uid;

      await updateFirebaseProfile(cred.user, {
        displayName: profileData.fullName.trim()
      });

      const fullProfile: StudentProfile = {
        uid,
        ...profileData,
        fullName: profileData.fullName.trim(),
        parentName: profileData.parentName.trim(),
        email: profileData.email.trim().toLowerCase(),
        phone: profileData.phone.trim(),
        schoolName: profileData.schoolName.trim(),
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      const studentRef = ref(db, `students/${uid}`);
      await set(studentRef, fullProfile);

      // Index student under their preferred centre
      if (fullProfile.preferredCentreId) {
        const indexRef = ref(db, `student_centre_index/${fullProfile.preferredCentreId}/${uid}`);
        await set(indexRef, true);
      }

      setStudent(fullProfile);
      return uid;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    setStudent(null);
    setFirebaseUser(null);
  };

  const updateStudentProfile = async (updates: Partial<StudentProfile>): Promise<void> => {
    if (!firebaseUser) throw new Error('Not authenticated');

    // If preferredCentreId is updated, update the cross-index
    if (updates.preferredCentreId && student?.preferredCentreId !== updates.preferredCentreId) {
      if (student?.preferredCentreId) {
        const oldIndexRef = ref(db, `student_centre_index/${student.preferredCentreId}/${firebaseUser.uid}`);
        await remove(oldIndexRef).catch(() => {});
      }
      const newIndexRef = ref(db, `student_centre_index/${updates.preferredCentreId}/${firebaseUser.uid}`);
      await set(newIndexRef, true);
    }

    const studentRef = ref(db, `students/${firebaseUser.uid}`);
    await update(studentRef, updates);
    if (updates.fullName) {
      await updateFirebaseProfile(firebaseUser, { displayName: updates.fullName });
    }
  };

  return {
    firebaseUser,
    student,
    loading,
    isAuthenticated: !!firebaseUser && !!student,
    login,
    signup,
    logout,
    updateStudentProfile
  };
}
