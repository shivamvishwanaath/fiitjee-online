import { useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { ref, set, update, onValue, remove, get } from 'firebase/database';
import { auth, db } from '../../firebase';
import { StudentProfile } from '../../types';

/**
 * Searches the Realtime Database registrations across all centres for an email, phone, or roll number
 */
async function findRegistrationInDatabase(identifier: string): Promise<{ reg: any; centreId: string } | null> {
  const clean = identifier.trim().toLowerCase();
  const cleanDigits = identifier.replace(/\D/g, '');
  const cleanRoll = identifier.replace(/\s+/g, '').toLowerCase();

  try {
    const snap = await get(ref(db, 'registrations/big_bang_2026'));
    if (!snap.exists()) return null;
    const centresData = snap.val();

    for (const [centreId, regs] of Object.entries(centresData)) {
      if (!regs || typeof regs !== 'object') continue;
      for (const reg of Object.values(regs as any)) {
        if (!reg || typeof reg !== 'object') continue;
        const r = reg as any;
        const regEmail = (r.email || '').trim().toLowerCase();
        const regPhone = (r.phone || '').replace(/\D/g, '');
        const regRoll = (r.rollNo || '').replace(/\s+/g, '').toLowerCase();

        // 1. Check exact email match
        if (clean.includes('@') && regEmail === clean) {
          return { reg: r, centreId };
        }
        // 2. Check 10-digit phone match
        if (cleanDigits.length >= 10 && regPhone.slice(-10) === cleanDigits.slice(-10)) {
          return { reg: r, centreId };
        }
        // 3. Check roll number match
        if (cleanRoll.length >= 6 && regRoll === cleanRoll) {
          return { reg: r, centreId };
        }
      }
    }
  } catch (err) {
    console.warn('Error querying registrations:', err);
  }
  return null;
}

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
      if (currentUser.email && currentUser.email.endsWith('@fiitjee.online') && !currentUser.email.includes('@candidate.fiitjee.online')) {
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
      try {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
        if (cred.user) {
          const studentRef = ref(db, `students/${cred.user.uid}`);
          await update(studentRef, { lastLoginAt: new Date().toISOString() });
        }
        return;
      } catch (authErr: any) {
        // If invalid credential or user not found, check if a registration exists for this candidate
        if (authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/user-not-found') {
          const found = await findRegistrationInDatabase(email);
          if (found) {
            // Candidate registered for an admission test but hasn't created a password yet.
            // Automatically provision their account with this password!
            try {
              const newCred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
              const uid = newCred.user.uid;
              await updateFirebaseProfile(newCred.user, { displayName: found.reg.studentName });

              const fullProfile: StudentProfile = {
                uid,
                fullName: found.reg.studentName,
                parentName: found.reg.parentName || '',
                email: (found.reg.email || email).trim().toLowerCase(),
                phone: found.reg.phone || '',
                currentClass: found.reg.currentClass || 'Class X',
                schoolName: found.reg.schoolName || '',
                preferredCentreId: found.centreId,
                createdAt: found.reg.registeredAt || new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                registeredExams: {
                  big_bang_2026: {
                    examId: found.reg.examId || 'big_bang_2026',
                    examName: 'Big Bang Edge Test 2026',
                    rollNo: found.reg.rollNo,
                    centreId: found.centreId,
                    selectedCenter: found.reg.selectedCenter,
                    testDate: found.reg.testDate,
                    testMode: found.reg.testMode,
                    registeredAt: found.reg.registeredAt,
                    paymentStatus: found.reg.paymentStatus,
                    paymentAmount: found.reg.paymentAmount,
                    paymentRef: found.reg.paymentRef,
                    invoiceNo: found.reg.invoiceNo,
                    sid: found.reg.sid
                  }
                }
              };

              await set(ref(db, `students/${uid}`), fullProfile);
              setStudent(fullProfile);
              return;
            } catch (createErr: any) {
              if (createErr.code === 'auth/email-already-in-use') {
                throw new Error('Incorrect password. Please verify your password or use Quick Access (Roll No / Mobile).');
              }
              throw createErr;
            }
          }
        }
        throw authErr;
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fast, frictionless login for registered test candidates using Roll Number or Mobile Number
   */
  const loginWithRollOrPhone = async (identifier: string): Promise<void> => {
    setLoading(true);
    try {
      const found = await findRegistrationInDatabase(identifier);
      if (!found || !found.reg) {
        throw new Error('No registration found for this Roll Number or Mobile Number. Please verify your entry or register for the test.');
      }

      // Generate deterministic credentials for this verified registration
      const cleanRoll = (found.reg.rollNo || 'temp').replace(/\s+/g, '_').toLowerCase();
      const cleanPhone = (found.reg.phone || '999999').replace(/\D/g, '').slice(-6);
      const authEmail = `cand_${cleanRoll}@candidate.fiitjee.online`;
      const authPass = `FIITJEE#${cleanPhone}#${cleanRoll.slice(-4)}`;

      let userUid: string;
      try {
        const cred = await signInWithEmailAndPassword(auth, authEmail, authPass);
        userUid = cred.user.uid;
      } catch {
        // First-time candidate login - create the deterministic Firebase Auth account
        const cred = await createUserWithEmailAndPassword(auth, authEmail, authPass);
        userUid = cred.user.uid;
        await updateFirebaseProfile(cred.user, { displayName: found.reg.studentName });
      }

      const fullProfile: StudentProfile = {
        uid: userUid,
        fullName: found.reg.studentName,
        parentName: found.reg.parentName || '',
        email: found.reg.email || '',
        phone: found.reg.phone || '',
        currentClass: found.reg.currentClass || 'Class X',
        schoolName: found.reg.schoolName || '',
        preferredCentreId: found.centreId,
        createdAt: found.reg.registeredAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        registeredExams: {
          big_bang_2026: {
            examId: found.reg.examId || 'big_bang_2026',
            examName: 'Big Bang Edge Test 2026',
            rollNo: found.reg.rollNo,
            centreId: found.centreId,
            selectedCenter: found.reg.selectedCenter,
            testDate: found.reg.testDate,
            testMode: found.reg.testMode,
            registeredAt: found.reg.registeredAt,
            paymentStatus: found.reg.paymentStatus,
            paymentAmount: found.reg.paymentAmount,
            paymentRef: found.reg.paymentRef,
            invoiceNo: found.reg.invoiceNo,
            sid: found.reg.sid
          }
        }
      };

      await set(ref(db, `students/${userUid}`), fullProfile);
      setStudent(fullProfile);
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
    loginWithRollOrPhone,
    signup,
    logout,
    updateStudentProfile
  };
}
