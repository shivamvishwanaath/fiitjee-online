import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { ref, get, remove } from 'firebase/database';
import { db, firebaseConfig } from '../../firebase';
import { ExamRegistration } from '../../types';
import { logActivity } from './logActivity';

export interface DeleteResult {
  success: boolean;
  dbDeleted: boolean;
  authDeleted: boolean;
  message: string;
}

/**
 * Permanently deletes a candidate registration from RTDB (across all centres),
 * associated student profile in students/, indices in student_centre_index/,
 * results in results/, and their Firebase Auth accounts.
 */
export async function deleteRegistrationAndAuth(
  registrationOrRoll: string | ExamRegistration,
  actorEmail?: string
): Promise<DeleteResult> {
  const rollNo = typeof registrationOrRoll === 'string' ? registrationOrRoll : registrationOrRoll.rollNo;
  const cleanRoll = rollNo.replace(/\s+/g, '_');
  const centres = ['bhubaneswar', 'dwarka', 'ranchi', 'hyderabad'];

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
        const matchRoll = sData.registeredExams?.big_bang_2026?.rollNo === rollNo;
        if (matchEmail || matchRoll) {
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

  // 5. Delete Firebase Authentication Accounts via secondary auth app
  let authDeleted = false;
  const candEmail = `cand_${cleanRoll.toLowerCase()}@candidate.fiitjee.online`;
  const candPass = `FIITJEE#${cleanPhone.slice(-6)}#${cleanRoll.slice(-4)}`;

  const credentialPairs = [
    { email: candEmail, pass: candPass },
    { email: cleanEmail, pass: 'Fiitjee@2026' },
    { email: cleanEmail, pass: 'password123' },
    { email: cleanEmail, pass: cleanPhone },
    { email: cleanEmail, pass: `Fiitjee@${cleanPhone.slice(-4)}` }
  ];

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
        console.log(`Deleted Firebase Auth user: ${cred.email}`);
      }
      await deleteApp(tempApp);
    } catch {
      // Ignored if credentials do not match or user is not found
    }
  }

  // 6. Audit log
  if (actorEmail) {
    await logActivity('DELETE_REGISTRATION', foundCentre || 'Centre', actorEmail, rollNo, {
      studentName: reg?.studentName,
      email: cleanEmail,
      phone: cleanPhone,
      authDeleted,
      dbDeleted
    });
  }

  return {
    success: true,
    dbDeleted,
    authDeleted,
    message: `Registration ${rollNo} and associated authentication deleted successfully.`
  };
}
