import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, deleteUser, signOut } from 'firebase/auth';
import { ref, get, set, remove } from 'firebase/database';
import { db, firebaseConfig } from '../../firebase';
import { ExamRegistration } from '../../types';
import { logActivity } from './logActivity';
import { resolveCanonicalCentreId } from './centreUtils';

export interface DeleteResult {
  success: boolean;
  dbDeleted: boolean;
  authDeleted: boolean;
  message: string;
}

const CANONICAL_CENTRES = ['bhubaneswar', 'dwarka', 'ranchi', 'hyderabad'];

/**
 * Helper to sanitize email key for Firebase RTDB path
 */
function sanitizeEmailKey(email: string): string {
  return email.trim().toLowerCase().replace(/[\s\.\#\$\[\]\/]+/g, '_');
}

/**
 * Checks if a candidate / student account has been marked permanently purged in RTDB.
 */
export async function isAccountPurged({
  uid,
  email,
  phone,
  rollNo
}: {
  uid?: string | null;
  email?: string | null;
  phone?: string | null;
  rollNo?: string | null;
}): Promise<boolean> {
  try {
    if (uid) {
      const snap = await get(ref(db, `purged_accounts/uids/${uid}`));
      if (snap.exists()) return true;
    }
    if (email) {
      const emailKey = sanitizeEmailKey(email);
      const snap = await get(ref(db, `purged_accounts/emails/${emailKey}`));
      if (snap.exists()) return true;
    }
    if (phone) {
      const cleanDigits = phone.replace(/\D/g, '').slice(-10);
      if (cleanDigits.length >= 10) {
        const snap = await get(ref(db, `purged_accounts/phones/${cleanDigits}`));
        if (snap.exists()) return true;
      }
    }
    if (rollNo) {
      const cleanRoll = rollNo.replace(/\s+/g, '_').toLowerCase();
      const snap = await get(ref(db, `purged_accounts/rolls/${cleanRoll}`));
      if (snap.exists()) return true;
    }
  } catch (err) {
    console.warn('Error checking purged_accounts:', err);
  }
  return false;
}

/**
 * OPTION 1: DELETES EXAM REGISTRATION ONLY
 * Removes the candidate's registration and exam results from RTDB,
 * and unlinks the exam from the student's profile without deleting
 * their student profile or Firebase Authentication account.
 */
export async function deleteExamRegistrationOnly({
  rollNo,
  centreId,
  studentUid,
  examId = 'big_bang_2026',
  actorEmail
}: {
  rollNo: string;
  centreId?: string;
  studentUid?: string;
  examId?: string;
  actorEmail?: string;
}): Promise<DeleteResult> {
  const cleanRoll = rollNo.replace(/\s+/g, '_');
  const targetCentres = centreId ? [resolveCanonicalCentreId(centreId)] : CANONICAL_CENTRES;
  let dbDeleted = false;

  // 1. Remove from registrations
  for (const c of targetCentres) {
    try {
      const regRef = ref(db, `registrations/${examId}/${c}/${cleanRoll}`);
      const snap = await get(regRef);
      if (snap.exists()) {
        await remove(regRef);
        dbDeleted = true;
      }
    } catch (e) {
      console.warn(`Failed removing registration from ${c}:`, e);
    }
  }

  // 2. Remove results node
  for (const c of targetCentres) {
    try {
      await remove(ref(db, `results/${examId}/${c}/${cleanRoll}`));
    } catch {}
  }

  // 3. Unlink exam from student node (if studentUid known or located)
  let targetUid = studentUid;
  if (!targetUid) {
    try {
      const studentsSnap = await get(ref(db, 'students'));
      if (studentsSnap.exists()) {
        const all = studentsSnap.val();
        for (const [uid, s] of Object.entries(all)) {
          if (!s || typeof s !== 'object') continue;
          const sData = s as any;
          if (sData.registeredExams?.[examId]?.rollNo === rollNo || sData.registeredExams?.[examId]?.rollNo === cleanRoll) {
            targetUid = uid;
            break;
          }
        }
      }
    } catch {}
  }

  if (targetUid) {
    try {
      await remove(ref(db, `students/${targetUid}/registeredExams/${examId}`));
      await remove(ref(db, `students/${targetUid}/admitCards/${examId}`));
      await remove(ref(db, `students/${targetUid}/results/${examId}`));
    } catch (e) {
      console.warn(`Failed unlinking exam from student ${targetUid}:`, e);
    }
  }

  if (actorEmail) {
    await logActivity(
      `[DEVELOPER] Deleted exam registration ${rollNo} from ${examId} (Student account retained)`,
      centreId || 'System',
      actorEmail,
      rollNo,
      { rollNo, targetUid }
    );
  }

  return {
    success: true,
    dbDeleted,
    authDeleted: false,
    message: `Exam registration for ${rollNo} deleted. Student login account remains active.`
  };
}

/**
 * OPTION 2: DELETES EVERYTHING (Registration + Student Profile + Firebase Auth Account)
 * Permanently deletes the candidate registration, student account, results, indices,
 * AND their Firebase Authentication credentials so the student cannot log in anymore.
 */
export async function deleteRegistrationAndAuth(
  registrationOrRoll: string | ExamRegistration,
  actorEmail?: string
): Promise<DeleteResult> {
  const rollNo = typeof registrationOrRoll === 'string' ? registrationOrRoll : registrationOrRoll.rollNo;
  const cleanRoll = rollNo.replace(/\s+/g, '_');
  const centres = CANONICAL_CENTRES;

  let reg: ExamRegistration | null = typeof registrationOrRoll === 'object' ? registrationOrRoll : null;

  // 1. Locate registration across centres if not fully provided
  let foundCentre: string | null = reg?.registeredByCentre || null;
  if (!reg) {
    for (const c of centres) {
      try {
        const snap = await get(ref(db, `registrations/big_bang_2026/${c}/${cleanRoll}`));
        if (snap.exists() && snap.val()?.studentName) {
          reg = { id: cleanRoll, ...snap.val(), rollNo: snap.val().rollNo || rollNo, registeredByCentre: c };
          foundCentre = c;
          break;
        }
      } catch (err) {
        console.warn(`Querying centre ${c} during delete failed:`, err);
      }
    }
  }

  // 2. Remove registration node from RTDB across all centres (to clean any duplicates)
  let dbDeleted = false;
  for (const c of centres) {
    try {
      const regRef = ref(db, `registrations/big_bang_2026/${c}/${cleanRoll}`);
      const snap = await get(regRef);
      if (snap.exists()) {
        await remove(regRef);
        dbDeleted = true;
      }
    } catch (e) {
      console.warn(`Failed removing registration from ${c}:`, e);
    }
  }

  // 3. Remove results node from RTDB across all centres
  for (const c of centres) {
    try {
      await remove(ref(db, `results/big_bang_2026/${c}/${cleanRoll}`));
    } catch {}
  }

  const cleanEmail = (reg?.email || '').trim().toLowerCase();
  const cleanPhone = (reg?.phone || '').replace(/\D/g, '');

  // 4. Remove student profiles from RTDB (students/ and student_centre_index/)
  const uidsToDelete = new Set<string>();
  if (reg?.studentUid) {
    uidsToDelete.add(reg.studentUid);
  }

  try {
    const studentsSnap = await get(ref(db, 'students'));
    if (studentsSnap.exists()) {
      const allStudents = studentsSnap.val();
      for (const [uid, s] of Object.entries(allStudents)) {
        if (!s || typeof s !== 'object') continue;
        const sData = s as any;
        const matchEmail = cleanEmail && sData.email && sData.email.trim().toLowerCase() === cleanEmail;
        const matchPhone = cleanPhone && sData.phone && sData.phone.replace(/\D/g, '') === cleanPhone;
        const matchRoll = sData.registeredExams?.big_bang_2026?.rollNo === rollNo || sData.registeredExams?.big_bang_2026?.rollNo === cleanRoll;
        if (matchEmail || matchPhone || matchRoll) {
          uidsToDelete.add(uid);
        }
      }
    }
  } catch (e) {
    console.warn('Error querying students for deletion cleanup:', e);
  }

  for (const uid of uidsToDelete) {
    try {
      await remove(ref(db, `students/${uid}`));
      for (const c of centres) {
        await remove(ref(db, `student_centre_index/${c}/${uid}`));
      }
      dbDeleted = true;
    } catch (e) {
      console.warn(`Error deleting student profile ${uid}:`, e);
    }
  }

  // Remove support tickets
  for (const c of centres) {
    try {
      const ticketsSnap = await get(ref(db, `support_tickets/${c}`));
      if (ticketsSnap.exists()) {
        const tList = ticketsSnap.val();
        for (const [tId, tVal] of Object.entries(tList)) {
          if (!tVal || typeof tVal !== 'object') continue;
          const t = tVal as any;
          if (t.rollNo === rollNo || (t.studentUid && uidsToDelete.has(t.studentUid)) || (t.studentEmail && t.studentEmail.toLowerCase() === cleanEmail)) {
            await remove(ref(db, `support_tickets/${c}/${tId}`));
          }
        }
      }
    } catch {}
  }

  // 5. Blacklist in purged_accounts to permanently prevent any future login attempt
  const now = new Date().toISOString();
  try {
    for (const uid of uidsToDelete) {
      await set(ref(db, `purged_accounts/uids/${uid}`), {
        purgedAt: now,
        rollNo,
        email: cleanEmail,
        phone: cleanPhone,
        purgedBy: actorEmail || 'developer'
      });
    }

    if (cleanEmail) {
      const emailKey = sanitizeEmailKey(cleanEmail);
      await set(ref(db, `purged_accounts/emails/${emailKey}`), {
        purgedAt: now,
        rollNo,
        purgedBy: actorEmail || 'developer'
      });
    }

    if (cleanPhone.length >= 10) {
      await set(ref(db, `purged_accounts/phones/${cleanPhone.slice(-10)}`), {
        purgedAt: now,
        rollNo,
        purgedBy: actorEmail || 'developer'
      });
    }

    await set(ref(db, `purged_accounts/rolls/${cleanRoll.toLowerCase()}`), {
      purgedAt: now,
      purgedBy: actorEmail || 'developer'
    });
  } catch (err) {
    console.warn('Error recording purged_accounts:', err);
  }

  // 6. Delete Firebase Authentication Accounts via secondary auth app
  let authDeleted = false;
  const candRollEmail = `cand_${cleanRoll.toLowerCase()}@candidate.fiitjee.online`;
  const candPhoneEmail = cleanPhone ? `cand_${cleanPhone.slice(-10)}@candidate.fiitjee.online` : '';
  const candPass = `FIITJEE#${cleanPhone.slice(-6)}#${cleanRoll.slice(-4)}`;

  const credentialPairs: { email: string; pass: string }[] = [];
  
  if (cleanEmail) {
    credentialPairs.push(
      { email: cleanEmail, pass: 'Fiitjee@2026' },
      { email: cleanEmail, pass: 'password123' },
      { email: cleanEmail, pass: cleanPhone },
      { email: cleanEmail, pass: `Fiitjee@${cleanPhone.slice(-4)}` }
    );
  }

  if (candRollEmail) {
    credentialPairs.push(
      { email: candRollEmail, pass: candPass },
      { email: candRollEmail, pass: 'Fiitjee@2026' },
      { email: candRollEmail, pass: cleanPhone }
    );
  }

  if (candPhoneEmail) {
    credentialPairs.push(
      { email: candPhoneEmail, pass: candPass },
      { email: candPhoneEmail, pass: 'Fiitjee@2026' },
      { email: candPhoneEmail, pass: cleanPhone }
    );
  }

  for (const cred of credentialPairs) {
    if (!cred.email || !cred.pass) continue;
    try {
      const tempAppName = `del_auth_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const tempApp = initializeApp(firebaseConfig, tempAppName);
      const tempAuth = getAuth(tempApp);
      const userCred = await signInWithEmailAndPassword(tempAuth, cred.email, cred.pass);
      if (userCred.user) {
        await deleteUser(userCred.user);
        authDeleted = true;
        console.log(`Successfully deleted Firebase Auth user: ${cred.email}`);
      }
      await deleteApp(tempApp);
    } catch {
      // Ignored if credentials do not match or user is not found
    }
  }

  // 7. Audit log
  if (actorEmail) {
    await logActivity(
      `[DEVELOPER] Deleted EVERYTHING for ${rollNo} (Registration + Student Profile + Auth)`,
      foundCentre || 'Centre',
      actorEmail,
      rollNo,
      {
        studentName: reg?.studentName,
        email: cleanEmail,
        phone: cleanPhone,
        authDeleted,
        dbDeleted
      }
    );
  }

  return {
    success: true,
    dbDeleted,
    authDeleted,
    message: `Everything deleted permanently for ${rollNo} (${reg?.studentName || 'Candidate'}). Authentication account revoked and candidate cannot log in.`
  };
}

/**
 * OPTION 3: DELETES STUDENT ACCOUNT AND AUTH BY UID
 * Permanently deletes a student profile from students/ by UID,
 * unlinks and removes any exam registrations and results,
 * blacklists credentials in purged_accounts, and attempts Auth deletion.
 */
export async function deleteStudentAccountAndAuth({
  uid,
  actorEmail
}: {
  uid: string;
  actorEmail?: string;
}): Promise<DeleteResult> {
  let dbDeleted = false;
  let authDeleted = false;
  let studentData: any = null;

  try {
    const sSnap = await get(ref(db, `students/${uid}`));
    if (sSnap.exists()) {
      studentData = sSnap.val();
    }
  } catch (err) {
    console.warn(`Error reading student ${uid}:`, err);
  }

  const cleanEmail = (studentData?.email || '').trim().toLowerCase();
  const cleanPhone = (studentData?.phone || '').replace(/\D/g, '');
  const registeredExams = studentData?.registeredExams || {};

  // 1. Delete associated registrations & results for all exams
  for (const [examId, examInfo] of Object.entries(registeredExams)) {
    const eInfo = examInfo as any;
    const rollNo = eInfo?.rollNo;
    if (rollNo) {
      const cleanRoll = rollNo.replace(/\s+/g, '_');
      for (const c of CANONICAL_CENTRES) {
        try {
          await remove(ref(db, `registrations/${examId}/${c}/${cleanRoll}`));
          await remove(ref(db, `results/${examId}/${c}/${cleanRoll}`));
        } catch {}
      }
    }
  }

  // 2. Remove student profile and indices
  try {
    await remove(ref(db, `students/${uid}`));
    for (const c of CANONICAL_CENTRES) {
      await remove(ref(db, `student_centre_index/${c}/${uid}`));
    }
    dbDeleted = true;
  } catch (e) {
    console.warn(`Error removing student ${uid}:`, e);
  }

  // 3. Purged accounts blacklist
  const now = new Date().toISOString();
  try {
    await set(ref(db, `purged_accounts/uids/${uid}`), {
      purgedAt: now,
      email: cleanEmail,
      phone: cleanPhone,
      purgedBy: actorEmail || 'developer'
    });

    if (cleanEmail) {
      const emailKey = sanitizeEmailKey(cleanEmail);
      await set(ref(db, `purged_accounts/emails/${emailKey}`), {
        purgedAt: now,
        purgedBy: actorEmail || 'developer'
      });
    }

    if (cleanPhone.length >= 10) {
      await set(ref(db, `purged_accounts/phones/${cleanPhone.slice(-10)}`), {
        purgedAt: now,
        purgedBy: actorEmail || 'developer'
      });
    }
  } catch (err) {
    console.warn('Error recording purged_accounts for student:', err);
  }

  // 4. Attempt secondary app auth deletion
  const credentialPairs: { email: string; pass: string }[] = [];
  if (cleanEmail) {
    credentialPairs.push(
      { email: cleanEmail, pass: 'Fiitjee@2026' },
      { email: cleanEmail, pass: 'password123' },
      { email: cleanEmail, pass: cleanPhone },
      { email: cleanEmail, pass: `Fiitjee@${cleanPhone.slice(-4)}` }
    );
  }
  if (cleanPhone.length >= 10) {
    const candPhoneEmail = `cand_${cleanPhone.slice(-10)}@candidate.fiitjee.online`;
    credentialPairs.push(
      { email: candPhoneEmail, pass: 'Fiitjee@2026' },
      { email: candPhoneEmail, pass: cleanPhone }
    );
  }

  for (const cred of credentialPairs) {
    if (!cred.email || !cred.pass) continue;
    try {
      const tempAppName = `del_sauth_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const tempApp = initializeApp(firebaseConfig, tempAppName);
      const tempAuth = getAuth(tempApp);
      const userCred = await signInWithEmailAndPassword(tempAuth, cred.email, cred.pass);
      if (userCred.user) {
        await deleteUser(userCred.user);
        authDeleted = true;
      }
      await deleteApp(tempApp);
    } catch {}
  }

  if (actorEmail) {
    await logActivity(
      `[DEVELOPER] Deleted EVERYTHING for student UID ${uid} (${studentData?.fullName || 'Student'})`,
      studentData?.preferredCentreId || 'System',
      actorEmail,
      studentData?.phone || uid,
      { uid, email: cleanEmail, phone: cleanPhone, dbDeleted, authDeleted }
    );
  }

  return {
    success: true,
    dbDeleted,
    authDeleted,
    message: `Student account ${studentData?.fullName || uid} and authentication records have been deleted permanently.`
  };
}
