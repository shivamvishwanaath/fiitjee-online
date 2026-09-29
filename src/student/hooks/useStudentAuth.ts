import { useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile as updateFirebaseProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { ref, set, update, onValue, remove, get } from 'firebase/database';
import { auth, db } from '../../firebase';
import { StudentProfile } from '../../types';

/**
 * Searches the Realtime Database registrations across centres for an email, phone, or roll number
 */
export async function findRegistrationInDatabase(identifier: string): Promise<{ reg: any; centreId: string } | null> {
  const clean = identifier.trim().toLowerCase();
  const cleanDigits = identifier.replace(/\D/g, '');
  const cleanRoll = identifier.replace(/\s+/g, '').toLowerCase();

  const centreIds = ['bhubaneswar', 'dwarka', 'ranchi', 'hyderabad'];

  try {
    for (const centreId of centreIds) {
      // 1. Direct roll number key lookup if identifier looks like roll number
      if (cleanRoll.length >= 6) {
        const directSnap = await get(ref(db, `registrations/big_bang_2026/${centreId}/${cleanRoll}`));
        if (directSnap.exists()) {
          return { reg: directSnap.val(), centreId };
        }
      }

      // 2. Fetch specific centre registrations node
      const centreRef = ref(db, `registrations/big_bang_2026/${centreId}`);
      const snap = await get(centreRef);
      if (!snap.exists()) continue;

      const regs = snap.val();
      if (!regs || typeof regs !== 'object') continue;

      for (const reg of Object.values(regs as any)) {
        if (!reg || typeof reg !== 'object') continue;
        const r = reg as any;
        const regEmail = (r.email || '').trim().toLowerCase();
        const regPhone = (r.phone || '').replace(/\D/g, '');
        const regRoll = (r.rollNo || '').replace(/\s+/g, '').toLowerCase();
        const prevRoll = (r.previousRollNo || '').replace(/\s+/g, '').toLowerCase();

        // 1. Check exact email match
        if (clean.includes('@') && regEmail === clean) {
          return { reg: r, centreId };
        }
        // 2. Check 10-digit phone match
        if (cleanDigits.length >= 10 && regPhone.slice(-10) === cleanDigits.slice(-10)) {
          return { reg: r, centreId };
        }
        // 3. Check roll number match (matches either updated roll or legacy previous roll)
        if (cleanRoll.length >= 6 && (regRoll === cleanRoll || prevRoll === cleanRoll)) {
          return { reg: r, centreId };
        }
      }
    }
  } catch (err) {
    console.warn('Error querying registrations:', err);
  }
  return null;
}

let activeRecaptchaVerifier: RecaptchaVerifier | null = null;

export function clearStudentRecaptcha() {
  if (activeRecaptchaVerifier) {
    try {
      activeRecaptchaVerifier.clear();
    } catch {}
    activeRecaptchaVerifier = null;
  }
  if (typeof window !== 'undefined' && (window as any).studentRecaptchaVerifier) {
    try {
      (window as any).studentRecaptchaVerifier.clear();
    } catch {}
    delete (window as any).studentRecaptchaVerifier;
  }
}

export function useStudentAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch or sync student profile from RTDB
  useEffect(() => {
    let isCancelled = false;
    let unsubscribeDb: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (isCancelled) return;
      setFirebaseUser(currentUser);

      if (!currentUser) {
        if (unsubscribeDb) {
          unsubscribeDb();
          unsubscribeDb = null;
        }
        setStudent(null);
        setLoading(false);
        return;
      }

      // Check if this is an admin account (do not treat as student)
      if (currentUser.email && currentUser.email.endsWith('@fiitjee.online') && !currentUser.email.includes('@candidate.fiitjee.online')) {
        if (unsubscribeDb) {
          unsubscribeDb();
          unsubscribeDb = null;
        }
        setStudent(null);
        setLoading(false);
        return;
      }

      try {
        const studentRef = ref(db, `students/${currentUser.uid}`);
        if (unsubscribeDb) {
          unsubscribeDb();
        }

        // Subscribe to real-time updates of student profile
        unsubscribeDb = onValue(studentRef, async (snapshot) => {
          if (isCancelled) return;

          if (snapshot.exists()) {
            setStudent({ uid: currentUser.uid, ...snapshot.val() });
          } else {
            // If profile does not exist yet, check if there is an existing registration by phone or email
            const phoneOrEmail = currentUser.phoneNumber || currentUser.email || '';
            const found = phoneOrEmail ? await findRegistrationInDatabase(phoneOrEmail) : null;
            if (isCancelled) return;

            let initialProfile: StudentProfile;
            if (found && found.reg) {
              initialProfile = {
                uid: currentUser.uid,
                fullName: found.reg.studentName || currentUser.displayName || 'Candidate',
                parentName: found.reg.parentName || '',
                email: (found.reg.email || currentUser.email || '').trim().toLowerCase(),
                phone: found.reg.phone || currentUser.phoneNumber || '',
                currentClass: found.reg.currentClass || 'Class X',
                schoolName: found.reg.schoolName || '',
                preferredCentreId: found.centreId,
                createdAt: found.reg.registeredAt || new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                lastLoginMethod: currentUser.phoneNumber ? 'phone_otp' : 'email',
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
            } else {
              initialProfile = {
                uid: currentUser.uid,
                fullName: currentUser.displayName || 'Candidate',
                parentName: '',
                email: currentUser.email || '',
                phone: currentUser.phoneNumber || '',
                currentClass: 'Class X',
                schoolName: '',
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                lastLoginMethod: currentUser.phoneNumber ? 'phone_otp' : 'email'
              };
            }
            await set(studentRef, initialProfile);
            if (!isCancelled) {
              setStudent(initialProfile);
            }
          }
          if (!isCancelled) {
            setLoading(false);
          }
        });
      } catch (err) {
        console.error('Error fetching student profile:', err);
        if (!isCancelled) setLoading(false);
      }
    });

    return () => {
      isCancelled = true;
      if (unsubscribeDb) unsubscribeDb();
      unsubscribeAuth();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    setLoading(true);
    try {
      try {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
        if (cred.user) {
          const studentRef = ref(db, `students/${cred.user.uid}`);
          await update(studentRef, { 
            lastLoginAt: new Date().toISOString(),
            lastLoginMethod: 'email'
          });
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
      } catch (authErr: any) {
        // Only provision account if user not found or invalid credentials
        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
          const cred = await createUserWithEmailAndPassword(auth, authEmail, authPass);
          userUid = cred.user.uid;
          await updateFirebaseProfile(cred.user, { displayName: found.reg.studentName });
        } else {
          throw authErr;
        }
      }

      // Check if student profile already exists in RTDB (Phase 2.1)
      const studentSnap = await get(ref(db, `students/${userUid}`));
      if (studentSnap.exists()) {
        await update(ref(db, `students/${userUid}`), {
          lastLoginAt: new Date().toISOString(),
          lastLoginMethod: 'roll_phone'
        });
        setStudent({ uid: userUid, ...studentSnap.val(), lastLoginAt: new Date().toISOString(), lastLoginMethod: 'roll_phone' });
      } else {
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
          lastLoginMethod: 'roll_phone',
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

  /**
   * Initializes invisible or normal reCAPTCHA for phone number verification
   */
  const setupRecaptcha = (containerId: string, size: 'invisible' | 'normal' = 'invisible'): RecaptchaVerifier => {
    clearStudentRecaptcha();
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size,
      callback: () => {
        // reCAPTCHA solved - allow signInWithPhoneNumber
      },
      'expired-callback': () => {
        console.warn('Phone auth reCAPTCHA expired. User should try again.');
      }
    });
    activeRecaptchaVerifier = verifier;
    if (typeof window !== 'undefined') {
      (window as any).studentRecaptchaVerifier = verifier;
    }
    return verifier;
  };

  /**
   * Dispatches SMS OTP to student's mobile number via native Firebase Authentication
   */
  const sendPhoneOtp = async (phone: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    setLoading(true);
    try {
      const cleanDigits = phone.replace(/\D/g, '');
      const e164 = cleanDigits.startsWith('91') && cleanDigits.length === 12
        ? `+${cleanDigits}`
        : `+91${cleanDigits.slice(-10)}`;
      const confirmationResult = await signInWithPhoneNumber(auth, e164, appVerifier);
      return confirmationResult;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifies the 6-digit SMS OTP code and completes authentication
   */
  const verifyPhoneOtp = async (confirmationResult: ConfirmationResult, verificationCode: string): Promise<User> => {
    setLoading(true);
    try {
      const cred = await confirmationResult.confirm(verificationCode.trim());
      try {
        await update(ref(db, `students/${cred.user.uid}`), {
          lastLoginAt: new Date().toISOString(),
          lastLoginMethod: 'phone_otp'
        });
      } catch {}
      return cred.user;
    } finally {
      setLoading(false);
    }
  };

  return {
    firebaseUser,
    student,
    loading,
    isAuthenticated: !!firebaseUser && !!student,
    login,
    loginWithRollOrPhone,
    setupRecaptcha,
    clearRecaptcha: clearStudentRecaptcha,
    sendPhoneOtp,
    verifyPhoneOtp,
    signup,
    logout,
    updateStudentProfile
  };
}
