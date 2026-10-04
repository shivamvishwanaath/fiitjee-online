import { ref, get, set, update, remove } from 'firebase/database';
import { db } from '../../firebase';
import { 
  DEVELOPER_EMAIL, 
  isDeveloperEmail, 
  CENTRES_CONFIG, 
  ALL_CENTRES, 
  generateRollNumber, 
  generateSID, 
  generateInvoiceNumber, 
  sanitizeForFirebase,
  getRegistrationFeeForClass,
  resolveCanonicalCentreId
} from './centreUtils';
import { 
  deleteRegistrationAndAuth, 
  deleteExamRegistrationOnly, 
  deleteStudentAccountAndAuth as deleteStudentAuthUtil, 
  DeleteResult 
} from './deleteRegistrationUtil';
import { logActivity } from './logActivity';
import { ExamRegistration, StudentProfile, CouponProfile, SupportTicket } from '../../types';

export { DEVELOPER_EMAIL, isDeveloperEmail };

const CANONICAL_CENTRES = ['bhubaneswar', 'dwarka', 'ranchi', 'hyderabad'];

/**
 * Doubly-guarded assertion: Throws immediately if actor is not the verified developer.
 */
export function assertDeveloper(actorEmail?: string | null): void {
  if (!isDeveloperEmail(actorEmail)) {
    throw new Error('Unauthorized Access: This action is strictly restricted to verified developer accounts (shivam.strive@gmail.com).');
  }
}

export interface DeregisterExamParams {
  rollNo: string;
  centreId?: string;
  studentUid?: string;
  examId?: string;
  actorEmail?: string;
}

export interface DeveloperActionResult {
  success: boolean;
  message: string;
  details?: any;
}

export interface EnrichedRegistration extends ExamRegistration {
  id: string;
  registeredByCentre: string;
  dbKey: string;
}

// ============================================================================
// 1. CANDIDATE REGISTRATIONS CRUD
// ============================================================================

/**
 * Fetches all registrations across all 4 canonical centres.
 */
export async function fetchAllRegistrations(
  examId: string = 'big_bang_2026',
  actorEmail?: string
): Promise<EnrichedRegistration[]> {
  assertDeveloper(actorEmail);

  const results: EnrichedRegistration[] = [];

  for (const centreId of CANONICAL_CENTRES) {
    try {
      const snap = await get(ref(db, `registrations/${examId}/${centreId}`));
      if (snap.exists()) {
        const data = snap.val();
        for (const [key, val] of Object.entries(data)) {
          if (key === '_init' || !val || typeof val !== 'object') continue;
          const reg = val as any;
          if (!reg.studentName) continue;
          results.push({
            id: key,
            dbKey: key,
            ...reg,
            rollNo: reg.rollNo || key.replace(/_/g, ' '),
            registeredByCentre: centreId
          });
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch registrations for centre ${centreId}:`, err);
    }
  }

  // Sort newest first
  results.sort((a, b) => {
    const timeA = new Date(a.registeredAt || 0).getTime();
    const timeB = new Date(b.registeredAt || 0).getTime();
    return timeB - timeA;
  });

  return results;
}

/**
 * Creates a complete candidate registration directly from the developer console.
 */
export async function createRegistrationDirect({
  centreId,
  data,
  actorEmail
}: {
  centreId: string;
  data: Partial<ExamRegistration>;
  actorEmail?: string;
}): Promise<DeveloperActionResult> {
  assertDeveloper(actorEmail);

  const canonicalCentre = resolveCanonicalCentreId(centreId) || 'bhubaneswar';
  const centreProfile = CENTRES_CONFIG[canonicalCentre] || CENTRES_CONFIG.bhubaneswar;
  const examId = data.examId || 'big_bang_2026';
  const currentClass = data.currentClass || 'Class X';
  const testMode = data.testMode || 'Offline';
  const testDate = data.testDate || '11th October 2026';
  const fee = getRegistrationFeeForClass(currentClass);
  const paymentStatus = data.paymentStatus || 'paid';
  const paymentAmount = data.paymentAmount !== undefined ? data.paymentAmount : (paymentStatus === 'paid' ? fee : 0);

  // Generate roll number if not manually specified
  const rollNo = data.rollNo && data.rollNo.trim() 
    ? data.rollNo.trim() 
    : generateRollNumber(centreProfile, testDate, undefined, undefined, currentClass);
  const cleanRoll = rollNo.replace(/\s+/g, '_');
  const sid = data.sid || generateSID(rollNo);
  const invoiceNo = data.invoiceNo || generateInvoiceNumber(centreProfile, rollNo);
  const now = new Date().toISOString();

  const studentUid = data.studentUid || `dev_std_${Date.now()}`;
  const studentEmail = data.email || `candidate_${Date.now()}@candidate.fiitjee.online`;
  const studentPhone = data.phone || '9876543210';
  const studentName = data.studentName || 'Developer Created Candidate';

  const regPayload: ExamRegistration = {
    examId,
    examYear: data.examYear || '2026',
    rollNo,
    studentName,
    parentName: data.parentName || 'Parent Name',
    currentClass,
    schoolName: data.schoolName || 'FIITJEE Demonstration School',
    phone: studentPhone,
    email: studentEmail,
    testDate,
    testMode,
    selectedCenter: centreProfile.name,
    registeredByCentre: canonicalCentre,
    registeredAt: data.registeredAt || now,
    status: data.status || 'Confirmed',
    paymentStatus,
    paymentAmount,
    paymentRef: data.paymentRef || `DEV_CREATE_${Date.now()}`,
    sid,
    invoiceNo,
    invoiceDate: data.invoiceDate || now.split('T')[0],
    studentUid,
    registeredByAdmin: true,
    lastUpdatedAt: now,
    lastUpdatedBy: actorEmail || DEVELOPER_EMAIL
  };

  // 1. Save in registrations/{examId}/{centreId}/{cleanRoll}
  const regRef = ref(db, `registrations/${examId}/${canonicalCentre}/${cleanRoll}`);
  await set(regRef, sanitizeForFirebase(regPayload));

  // 2. Upsert student profile
  const studentProfileRef = ref(db, `students/${studentUid}`);
  const existingStudentSnap = await get(studentProfileRef);
  if (!existingStudentSnap.exists()) {
    const newProfile: StudentProfile = {
      uid: studentUid,
      fullName: studentName,
      parentName: regPayload.parentName,
      email: studentEmail,
      phone: studentPhone,
      currentClass,
      schoolName: regPayload.schoolName,
      preferredCentreId: canonicalCentre,
      city: centreProfile.name,
      state: centreProfile.stateName,
      createdAt: now,
      lastLoginAt: now,
      profileStatus: 'Official candidate profile created via Developer Station.'
    };
    await set(studentProfileRef, sanitizeForFirebase(newProfile));
  }

  // 3. Link registered exam
  await set(ref(db, `students/${studentUid}/registeredExams/${examId}`), sanitizeForFirebase({
    examId,
    examName: 'Big Bang Edge Test 2026',
    rollNo,
    centreId: canonicalCentre,
    selectedCenter: centreProfile.name,
    testDate,
    testMode,
    registeredAt: now,
    paymentStatus,
    paymentAmount,
    invoiceNo,
    sid
  }));

  // 4. Index under centre
  await set(ref(db, `student_centre_index/${canonicalCentre}/${studentUid}`), true);

  await logActivity({
    action: `[DEVELOPER] Created new registration ${rollNo} under ${canonicalCentre.toUpperCase()}`,
    actorCentre: canonicalCentre,
    actorEmail: actorEmail || DEVELOPER_EMAIL,
    targetRollNo: rollNo,
    details: { rollNo, studentName, studentUid, centreId: canonicalCentre }
  });

  return {
    success: true,
    message: `Candidate ${studentName} successfully registered with Roll No ${rollNo} under ${centreProfile.name}.`,
    details: { rollNo, studentUid, centreId: canonicalCentre }
  };
}

/**
 * Comprehensive update of a candidate registration across all fields.
 * Handles automatic centre migration if targetCentreId differs from currentCentreId.
 */
export async function updateRegistrationFull({
  rollNo,
  currentCentreId,
  targetCentreId,
  updates,
  actorEmail
}: {
  rollNo: string;
  currentCentreId: string;
  targetCentreId?: string;
  updates: Partial<ExamRegistration>;
  actorEmail?: string;
}): Promise<DeveloperActionResult> {
  assertDeveloper(actorEmail);

  const cleanRoll = rollNo.replace(/\s+/g, '_');
  const sourceCentre = resolveCanonicalCentreId(currentCentreId) || 'bhubaneswar';
  const destCentre = resolveCanonicalCentreId(targetCentreId || currentCentreId) || sourceCentre;
  const examId = updates.examId || 'big_bang_2026';

  const sourceRef = ref(db, `registrations/${examId}/${sourceCentre}/${cleanRoll}`);
  const snap = await get(sourceRef);

  if (!snap.exists()) {
    throw new Error(`Registration not found under centre ${sourceCentre} for roll no ${rollNo}`);
  }

  const currentData = snap.val();
  const destProfile = CENTRES_CONFIG[destCentre] || CENTRES_CONFIG.bhubaneswar;
  const now = new Date().toISOString();

  const merged = sanitizeForFirebase({
    ...currentData,
    ...updates,
    registeredByCentre: destCentre,
    selectedCenter: destProfile.name,
    lastUpdatedAt: now,
    lastUpdatedBy: actorEmail || DEVELOPER_EMAIL
  });

  if (destCentre !== sourceCentre) {
    // 1. Write to new centre path
    const destRef = ref(db, `registrations/${examId}/${destCentre}/${cleanRoll}`);
    await set(destRef, merged);

    // 2. Remove old centre path
    await remove(sourceRef);

    // 3. Update centre indexes
    if (merged.studentUid) {
      try {
        await remove(ref(db, `student_centre_index/${sourceCentre}/${merged.studentUid}`));
        await set(ref(db, `student_centre_index/${destCentre}/${merged.studentUid}`), true);
      } catch (err) {
        console.warn('Error migrating student centre index:', err);
      }
    }
  } else {
    // Direct write to same centre
    await set(sourceRef, merged);
  }

  // Sync to student's registeredExams
  const studentUid = merged.studentUid;
  if (studentUid) {
    try {
      const studentExamRef = ref(db, `students/${studentUid}/registeredExams/${examId}`);
      const examSnap = await get(studentExamRef);
      if (examSnap.exists()) {
        const curExam = examSnap.val();
        await update(studentExamRef, sanitizeForFirebase({
          ...curExam,
          centreId: destCentre,
          selectedCenter: destProfile.name,
          paymentStatus: merged.paymentStatus || curExam.paymentStatus,
          paymentAmount: merged.paymentAmount !== undefined ? merged.paymentAmount : curExam.paymentAmount,
          testDate: merged.testDate || curExam.testDate,
          testMode: merged.testMode || curExam.testMode,
          sid: merged.sid || curExam.sid,
          invoiceNo: merged.invoiceNo || curExam.invoiceNo
        }));
      }

      // Also update student profile general details if modified
      const studentProfileRef = ref(db, `students/${studentUid}`);
      await update(studentProfileRef, sanitizeForFirebase({
        fullName: merged.studentName,
        parentName: merged.parentName,
        phone: merged.phone,
        email: merged.email,
        currentClass: merged.currentClass,
        schoolName: merged.schoolName,
        preferredCentreId: destCentre
      }));
    } catch (err) {
      console.warn('Error syncing student profile during registration update:', err);
    }
  }

  await logActivity({
    action: `[DEVELOPER] Updated registration ${rollNo} (Centre: ${destCentre.toUpperCase()})`,
    actorCentre: destCentre,
    actorEmail: actorEmail || DEVELOPER_EMAIL,
    targetRollNo: rollNo,
    details: { rollNo, sourceCentre, destCentre, updates }
  });

  return {
    success: true,
    message: `Registration ${rollNo} updated successfully.${destCentre !== sourceCentre ? ` Migrated from ${sourceCentre.toUpperCase()} to ${destCentre.toUpperCase()}.` : ''}`
  };
}

/**
 * Duplicates an existing candidate registration for fast testing with fresh identifiers.
 */
export async function duplicateRegistration({
  rollNo,
  centreId,
  actorEmail
}: {
  rollNo: string;
  centreId: string;
  actorEmail?: string;
}): Promise<DeveloperActionResult> {
  assertDeveloper(actorEmail);

  const cleanRoll = rollNo.replace(/\s+/g, '_');
  const canonicalCentre = resolveCanonicalCentreId(centreId) || 'bhubaneswar';
  const regRef = ref(db, `registrations/big_bang_2026/${canonicalCentre}/${cleanRoll}`);
  const snap = await get(regRef);

  if (!snap.exists()) {
    throw new Error(`Source registration ${rollNo} not found in centre ${canonicalCentre}.`);
  }

  const original = snap.val();
  const centre = CENTRES_CONFIG[canonicalCentre] || CENTRES_CONFIG.bhubaneswar;
  const newRollNo = generateRollNumber(centre, original.testDate, undefined, undefined, original.currentClass);
  const newSid = generateSID(newRollNo);
  const newInvoiceNo = generateInvoiceNumber(centre, newRollNo);
  const now = new Date().toISOString();
  const mockUid = `dev_clone_${Date.now()}`;
  const mockEmail = `clone.${Date.now()}@example.com`;

  const clonedPayload: ExamRegistration = {
    ...original,
    rollNo: newRollNo,
    studentName: `${original.studentName || 'Candidate'} (Copy)`,
    email: mockEmail,
    sid: newSid,
    invoiceNo: newInvoiceNo,
    registeredAt: now,
    lastUpdatedAt: now,
    lastUpdatedBy: actorEmail || DEVELOPER_EMAIL,
    studentUid: mockUid
  };

  const newCleanRoll = newRollNo.replace(/\s+/g, '_');
  await set(ref(db, `registrations/big_bang_2026/${canonicalCentre}/${newCleanRoll}`), sanitizeForFirebase(clonedPayload));

  // Create mock student profile
  const studentProfile: StudentProfile = {
    uid: mockUid,
    fullName: clonedPayload.studentName,
    parentName: original.parentName || 'Parent Name',
    email: mockEmail,
    phone: original.phone || '9876543210',
    currentClass: original.currentClass,
    schoolName: original.schoolName,
    preferredCentreId: canonicalCentre,
    city: centre.name,
    state: centre.stateName,
    createdAt: now,
    lastLoginAt: now,
    profileStatus: 'Cloned test candidate.'
  };
  await set(ref(db, `students/${mockUid}`), sanitizeForFirebase(studentProfile));
  await set(ref(db, `students/${mockUid}/registeredExams/big_bang_2026`), sanitizeForFirebase({
    examId: 'big_bang_2026',
    examName: 'Big Bang Edge Test 2026',
    rollNo: newRollNo,
    centreId: canonicalCentre,
    selectedCenter: centre.name,
    testDate: original.testDate,
    testMode: original.testMode,
    registeredAt: now,
    paymentStatus: clonedPayload.paymentStatus || 'paid',
    paymentAmount: clonedPayload.paymentAmount || 0,
    invoiceNo: newInvoiceNo,
    sid: newSid
  }));
  await set(ref(db, `student_centre_index/${canonicalCentre}/${mockUid}`), true);

  return {
    success: true,
    message: `Cloned registration into new Roll No ${newRollNo}.`,
    details: { newRollNo, studentUid: mockUid }
  };
}

/**
 * Batch update payment status for multiple candidates.
 */
export async function batchUpdatePaymentStatus({
  records,
  status,
  actorEmail
}: {
  records: { rollNo: string; centreId: string }[];
  status: 'paid' | 'free' | 'pending';
  actorEmail?: string;
}): Promise<DeveloperActionResult> {
  assertDeveloper(actorEmail);

  let successCount = 0;
  for (const item of records) {
    try {
      const canonical = resolveCanonicalCentreId(item.centreId) || 'bhubaneswar';
      const cleanRoll = item.rollNo.replace(/\s+/g, '_');
      const regRef = ref(db, `registrations/big_bang_2026/${canonical}/${cleanRoll}`);
      const snap = await get(regRef);
      if (snap.exists()) {
        const val = snap.val();
        const fee = getRegistrationFeeForClass(val.currentClass);
        const amount = status === 'paid' ? fee : 0;
        await update(regRef, {
          paymentStatus: status,
          paymentAmount: amount,
          lastUpdatedAt: new Date().toISOString(),
          lastUpdatedBy: actorEmail || DEVELOPER_EMAIL
        });
        if (val.studentUid) {
          await update(ref(db, `students/${val.studentUid}/registeredExams/big_bang_2026`), {
            paymentStatus: status,
            paymentAmount: amount
          });
        }
        successCount++;
      }
    } catch (err) {
      console.warn(`Failed batch status update for ${item.rollNo}:`, err);
    }
  }

  return {
    success: true,
    message: `Updated payment status to ${status.toUpperCase()} for ${successCount} candidates.`
  };
}

/**
 * De-registers a candidate from an exam (resets flow so candidate can test registration again).
 */
export async function deregisterCandidateExam({
  rollNo,
  centreId,
  studentUid,
  examId = 'big_bang_2026',
  actorEmail
}: DeregisterExamParams): Promise<DeveloperActionResult> {
  assertDeveloper(actorEmail);

  const cleanRoll = rollNo.replace(/\s+/g, '_');
  const centres = CANONICAL_CENTRES;
  let removedFromCentres: string[] = [];

  // 1. Remove registration from specified centre or search all centres
  for (const c of centres) {
    if (centreId && resolveCanonicalCentreId(centreId) !== c) continue;
    try {
      const regRef = ref(db, `registrations/${examId}/${c}/${cleanRoll}`);
      const snap = await get(regRef);
      if (snap.exists()) {
        await remove(regRef);
        removedFromCentres.push(c);
      }
    } catch (err) {
      console.warn(`Error removing registration from ${c}:`, err);
    }
  }

  // Also remove corresponding exam results node if any exists
  for (const c of centres) {
    try {
      await remove(ref(db, `results/${examId}/${c}/${cleanRoll}`));
    } catch {}
  }

  // 2. Identify studentUid to clear registeredExams link
  let targetUid = studentUid;
  if (!targetUid) {
    try {
      const studentsSnap = await get(ref(db, 'students'));
      if (studentsSnap.exists()) {
        const allStudents = studentsSnap.val();
        for (const [uid, s] of Object.entries(allStudents)) {
          if (!s || typeof s !== 'object') continue;
          const sData = s as any;
          if (sData.registeredExams?.[examId]?.rollNo === rollNo || sData.registeredExams?.[examId]?.rollNo === cleanRoll) {
            targetUid = uid;
            break;
          }
        }
      }
    } catch (err) {
      console.warn('Error locating studentUid for exam de-registration:', err);
    }
  }

  // 3. Clear registeredExams, admitCards, and results links from student node
  if (targetUid) {
    try {
      await remove(ref(db, `students/${targetUid}/registeredExams/${examId}`));
      await remove(ref(db, `students/${targetUid}/admitCards/${examId}`));
      await remove(ref(db, `students/${targetUid}/results/${examId}`));

      const remainingExamsSnap = await get(ref(db, `students/${targetUid}/registeredExams`));
      const hasOtherExams = remainingExamsSnap.exists() && Object.keys(remainingExamsSnap.val() || {}).length > 0;

      if (!hasOtherExams && centreId) {
        const cId = resolveCanonicalCentreId(centreId);
        await remove(ref(db, `student_centre_index/${cId}/${targetUid}`));
      }
    } catch (err) {
      console.warn('Error updating student node during de-registration:', err);
    }
  }

  await logActivity({
    action: `[DEVELOPER] De-registered exam ${examId} for Roll No ${rollNo}`,
    actorCentre: centreId || removedFromCentres[0] || 'System',
    actorEmail: actorEmail || DEVELOPER_EMAIL,
    targetRollNo: rollNo,
    details: { cleanRoll, targetUid, removedFromCentres }
  });

  return {
    success: true,
    message: `Successfully de-registered Roll No ${rollNo} from ${examId}. Registration flow is reset and ready for re-testing.`,
    details: { removedFromCentres, targetUid }
  };
}

/**
 * Updates a registration's payment status, centre, test mode, date, or class directly.
 */
export async function updateRegistrationFieldDirect({
  rollNo,
  centreId,
  updates,
  actorEmail
}: {
  rollNo: string;
  centreId: string;
  updates: Partial<ExamRegistration>;
  actorEmail?: string;
}): Promise<DeveloperActionResult> {
  return await updateRegistrationFull({
    rollNo,
    currentCentreId: centreId,
    updates,
    actorEmail
  });
}

/**
 * Migrates a registration from one centre to another.
 */
export async function migrateRegistrationCentre({
  rollNo,
  fromCentreId,
  toCentreId,
  actorEmail
}: {
  rollNo: string;
  fromCentreId: string;
  toCentreId: string;
  actorEmail?: string;
}): Promise<DeveloperActionResult> {
  return await updateRegistrationFull({
    rollNo,
    currentCentreId: fromCentreId,
    targetCentreId: toCentreId,
    updates: {},
    actorEmail
  });
}

/**
 * Creates a complete mock test registration instantly for rapid flow testing.
 */
export async function seedTestRegistration({
  centreId = 'bhubaneswar',
  currentClass = 'Class X',
  testMode = 'Offline',
  paymentStatus = 'paid',
  studentName = 'Developer Test Candidate',
  actorEmail
}: {
  centreId?: string;
  currentClass?: string;
  testMode?: 'Offline' | 'Proctored Online';
  paymentStatus?: 'paid' | 'free' | 'pending';
  studentName?: string;
  actorEmail?: string;
}): Promise<DeveloperActionResult> {
  assertDeveloper(actorEmail);

  return await createRegistrationDirect({
    centreId,
    data: {
      studentName,
      currentClass,
      testMode,
      paymentStatus
    },
    actorEmail
  });
}

/**
 * BUTTON 1: Delete Exam Registration ONLY (resets exam registration, student account stays intact)
 */
export async function deleteExamRegistration({
  rollNo,
  centreId,
  studentUid,
  examId = 'big_bang_2026',
  actorEmail
}: DeregisterExamParams): Promise<DeleteResult> {
  assertDeveloper(actorEmail);
  return await deleteExamRegistrationOnly({
    rollNo,
    centreId,
    studentUid,
    examId,
    actorEmail: actorEmail || DEVELOPER_EMAIL
  });
}

/**
 * BUTTON 2: Delete EVERYTHING (candidate registration, student profile, results, tickets, and Firebase Auth account)
 */
export async function purgeCandidateRegistration({
  rollNo,
  actorEmail
}: {
  rollNo: string;
  actorEmail?: string;
}): Promise<DeleteResult> {
  assertDeveloper(actorEmail);
  return await deleteRegistrationAndAuth(rollNo, actorEmail || DEVELOPER_EMAIL);
}

/**
 * BUTTON 3: Delete Student Profile and Firebase Auth Account by student UID
 */
export async function purgeStudentAccount({
  uid,
  actorEmail
}: {
  uid: string;
  actorEmail?: string;
}): Promise<DeleteResult> {
  assertDeveloper(actorEmail);
  return await deleteStudentAuthUtil({
    uid,
    actorEmail: actorEmail || DEVELOPER_EMAIL
  });
}

// ============================================================================
// 2. STUDENT PROFILES CRUD (`students/`)
// ============================================================================

/**
 * Fetches all student profiles.
 */
export async function fetchAllStudents(actorEmail?: string): Promise<StudentProfile[]> {
  assertDeveloper(actorEmail);

  const snap = await get(ref(db, 'students'));
  if (!snap.exists()) return [];

  const all = snap.val();
  const list: StudentProfile[] = [];

  for (const [uid, val] of Object.entries(all)) {
    if (!val || typeof val !== 'object') continue;
    list.push({
      uid,
      ...(val as any)
    });
  }

  // Sort newest first
  list.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return list;
}

/**
 * Updates a student profile directly in RTDB.
 */
export async function updateStudentProfileDirect({
  uid,
  updates,
  actorEmail
}: {
  uid: string;
  updates: Partial<StudentProfile>;
  actorEmail?: string;
}): Promise<DeveloperActionResult> {
  assertDeveloper(actorEmail);

  const studentRef = ref(db, `students/${uid}`);
  const snap = await get(studentRef);
  if (!snap.exists()) {
    throw new Error(`Student account with UID "${uid}" does not exist.`);
  }

  await update(studentRef, sanitizeForFirebase({
    ...updates,
    lastUpdatedAt: new Date().toISOString()
  }));

  return {
    success: true,
    message: `Updated student profile for ${updates.fullName || uid}.`
  };
}

/**
 * Deletes a student profile and cleans centre index.
 */
export async function deleteStudentProfileDirect({
  uid,
  actorEmail
}: {
  uid: string;
  actorEmail?: string;
}): Promise<DeveloperActionResult> {
  assertDeveloper(actorEmail);

  // Remove from all centre indices
  for (const c of CANONICAL_CENTRES) {
    try {
      await remove(ref(db, `student_centre_index/${c}/${uid}`));
    } catch {}
  }

  await remove(ref(db, `students/${uid}`));

  return {
    success: true,
    message: `Student account ${uid} permanently deleted from RTDB.`
  };
}

/**
 * Unlinks an exam from a student's profile without deleting the account.
 */
export async function unlinkStudentExam({
  uid,
  examId,
  actorEmail
}: {
  uid: string;
  examId: string;
  actorEmail?: string;
}): Promise<DeveloperActionResult> {
  assertDeveloper(actorEmail);

  await remove(ref(db, `students/${uid}/registeredExams/${examId}`));
  await remove(ref(db, `students/${uid}/admitCards/${examId}`));
  await remove(ref(db, `students/${uid}/results/${examId}`));

  return {
    success: true,
    message: `Unlinked exam ${examId} from student ${uid}.`
  };
}

// ============================================================================
// 3. PROMOTIONAL COUPONS CRUD (`coupons/`)
// ============================================================================

/**
 * Fetches all coupons from RTDB.
 */
export async function fetchAllCoupons(actorEmail?: string): Promise<CouponProfile[]> {
  assertDeveloper(actorEmail);

  const snap = await get(ref(db, 'coupons'));
  if (!snap.exists()) return [];

  const all = snap.val();
  const list: CouponProfile[] = [];

  for (const [key, val] of Object.entries(all)) {
    if (!val || typeof val !== 'object') continue;
    // Check if flat coupon
    if ((val as any).code) {
      list.push({ id: key, ...(val as any) });
    } else {
      // Centre partitioned coupons
      for (const [subKey, subVal] of Object.entries(val as object)) {
        if (subVal && typeof subVal === 'object' && (subVal as any).code) {
          list.push({ id: `${key}/${subKey}`, ...(subVal as any) });
        }
      }
    }
  }

  return list;
}

/**
 * Creates or updates a promotional coupon profile.
 */
export async function saveCouponDirect({
  coupon,
  actorEmail
}: {
  coupon: CouponProfile;
  actorEmail?: string;
}): Promise<DeveloperActionResult> {
  assertDeveloper(actorEmail);

  const cleanCode = coupon.code.trim().toUpperCase();
  if (!cleanCode) throw new Error('Coupon code cannot be empty.');

  const payload: CouponProfile = sanitizeForFirebase({
    ...coupon,
    id: cleanCode,
    code: cleanCode,
    discountValue: Number(coupon.discountValue) || 0,
    maxUses: Number(coupon.maxUses) || 9999,
    usedCount: Number(coupon.usedCount) || 0,
    isActive: coupon.isActive !== false,
    centreId: coupon.centreId || 'ALL',
    createdBy: coupon.createdBy || actorEmail || DEVELOPER_EMAIL,
    createdAt: coupon.createdAt || new Date().toISOString()
  });

  await set(ref(db, `coupons/${cleanCode}`), payload);

  return {
    success: true,
    message: `Promotional coupon "${cleanCode}" saved successfully.`
  };
}

/**
 * Deletes a coupon code completely.
 */
export async function deleteCouponDirect({
  couponId,
  actorEmail
}: {
  couponId: string;
  actorEmail?: string;
}): Promise<DeveloperActionResult> {
  assertDeveloper(actorEmail);

  await remove(ref(db, `coupons/${couponId}`));
  return {
    success: true,
    message: `Coupon "${couponId}" deleted.`
  };
}

/**
 * Resets a coupon's redemption count and removes redemption history.
 */
export async function resetCouponUsesDirect({
  couponId,
  actorEmail
}: {
  couponId: string;
  actorEmail?: string;
}): Promise<DeveloperActionResult> {
  assertDeveloper(actorEmail);

  await set(ref(db, `coupons/${couponId}/usedCount`), 0);
  await remove(ref(db, `coupons/${couponId}/redemptions`));

  return {
    success: true,
    message: `Usage count reset to 0 for coupon "${couponId}".`
  };
}

// ============================================================================
// 4. SUPPORT TICKETS CRUD (`support_tickets/`)
// ============================================================================

export interface EnrichedTicket extends SupportTicket {
  centreId: string;
}

/**
 * Fetches all support tickets across all centres.
 */
export async function fetchAllSupportTickets(actorEmail?: string): Promise<EnrichedTicket[]> {
  assertDeveloper(actorEmail);

  const results: EnrichedTicket[] = [];

  for (const centreId of CANONICAL_CENTRES) {
    try {
      const snap = await get(ref(db, `support_tickets/${centreId}`));
      if (snap.exists()) {
        const data = snap.val();
        for (const [tId, tVal] of Object.entries(data)) {
          if (!tVal || typeof tVal !== 'object') continue;
          results.push({
            ticketId: tId,
            centreId,
            ...(tVal as any)
          });
        }
      }
    } catch (err) {
      console.warn(`Error reading tickets for ${centreId}:`, err);
    }
  }

  // Sort newest first
  results.sort((a, b) => {
    const timeA = new Date(a.submittedAt || 0).getTime();
    const timeB = new Date(b.submittedAt || 0).getTime();
    return timeB - timeA;
  });

  return results;
}

/**
 * Updates a support ticket status, priority, or admin reply.
 */
export async function updateSupportTicketDirect({
  centreId,
  ticketId,
  updates,
  actorEmail
}: {
  centreId: string;
  ticketId: string;
  updates: Partial<SupportTicket>;
  actorEmail?: string;
}): Promise<DeveloperActionResult> {
  assertDeveloper(actorEmail);

  const canonical = resolveCanonicalCentreId(centreId) || 'bhubaneswar';
  const ticketRef = ref(db, `support_tickets/${canonical}/${ticketId}`);
  const snap = await get(ticketRef);

  if (!snap.exists()) {
    throw new Error(`Ticket "${ticketId}" not found in centre ${canonical}.`);
  }

  await update(ticketRef, sanitizeForFirebase({
    ...updates,
    lastUpdatedAt: new Date().toISOString(),
    adminRepliedBy: updates.adminReply ? (actorEmail || DEVELOPER_EMAIL) : undefined,
    adminRepliedAt: updates.adminReply ? new Date().toISOString() : undefined
  }));

  return {
    success: true,
    message: `Updated ticket #${ticketId}.`
  };
}

/**
 * Deletes a support ticket.
 */
export async function deleteSupportTicketDirect({
  centreId,
  ticketId,
  actorEmail
}: {
  centreId: string;
  ticketId: string;
  actorEmail?: string;
}): Promise<DeveloperActionResult> {
  assertDeveloper(actorEmail);

  const canonical = resolveCanonicalCentreId(centreId) || 'bhubaneswar';
  await remove(ref(db, `support_tickets/${canonical}/${ticketId}`));

  return {
    success: true,
    message: `Deleted ticket #${ticketId}.`
  };
}

// ============================================================================
// 5. SYSTEM HEALTH & PURGE TEST DATA
// ============================================================================

export interface DiagnosticStats {
  registrationsByCentre: Record<string, number>;
  totalRegistrations: number;
  totalStudents: number;
  totalCoupons: number;
  totalTickets: number;
  recentRegistrations7Days: number;
}

/**
 * Calculates live system metrics across RTDB.
 */
export async function fetchSystemDiagnosticStats(actorEmail?: string): Promise<DiagnosticStats> {
  assertDeveloper(actorEmail);

  const stats: DiagnosticStats = {
    registrationsByCentre: { bhubaneswar: 0, dwarka: 0, ranchi: 0, hyderabad: 0 },
    totalRegistrations: 0,
    totalStudents: 0,
    totalCoupons: 0,
    totalTickets: 0,
    recentRegistrations7Days: 0
  };

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  // Count registrations
  for (const c of CANONICAL_CENTRES) {
    try {
      const snap = await get(ref(db, `registrations/big_bang_2026/${c}`));
      if (snap.exists()) {
        const data = snap.val();
        let cCount = 0;
        for (const [k, v] of Object.entries(data)) {
          if (k === '_init' || !v || typeof v !== 'object') continue;
          if ((v as any).studentName) {
            cCount++;
            stats.totalRegistrations++;
            const regTime = new Date((v as any).registeredAt || 0).getTime();
            if (regTime >= sevenDaysAgo) {
              stats.recentRegistrations7Days++;
            }
          }
        }
        stats.registrationsByCentre[c] = cCount;
      }
    } catch {}
  }

  // Count students
  try {
    const sSnap = await get(ref(db, 'students'));
    if (sSnap.exists()) {
      stats.totalStudents = Object.keys(sSnap.val() || {}).length;
    }
  } catch {}

  // Count coupons
  try {
    const cSnap = await get(ref(db, 'coupons'));
    if (cSnap.exists()) {
      stats.totalCoupons = Object.keys(cSnap.val() || {}).length;
    }
  } catch {}

  // Count tickets
  for (const c of CANONICAL_CENTRES) {
    try {
      const tSnap = await get(ref(db, `support_tickets/${c}`));
      if (tSnap.exists()) {
        stats.totalTickets += Object.keys(tSnap.val() || {}).length;
      }
    } catch {}
  }

  return stats;
}

/**
 * Purges all mock candidate test records containing "@example.com" or "dev_test_" or "Demo Test".
 */
export async function purgeAllTestData(actorEmail?: string): Promise<DeveloperActionResult> {
  assertDeveloper(actorEmail);

  let purgedCount = 0;

  for (const c of CANONICAL_CENTRES) {
    try {
      const snap = await get(ref(db, `registrations/big_bang_2026/${c}`));
      if (snap.exists()) {
        const all = snap.val();
        for (const [k, v] of Object.entries(all)) {
          if (k === '_init' || !v || typeof v !== 'object') continue;
          const reg = v as any;
          const isMockEmail = reg.email && (reg.email.includes('@example.com') || reg.email.includes('dev.test.'));
          const isMockName = reg.studentName && (reg.studentName.includes('Test Candidate') || reg.studentName.includes('Demo Test'));
          const isMockUid = reg.studentUid && (reg.studentUid.startsWith('dev_test_') || reg.studentUid.startsWith('dev_std_') || reg.studentUid.startsWith('dev_clone_'));

          if (isMockEmail || isMockName || isMockUid) {
            await remove(ref(db, `registrations/big_bang_2026/${c}/${k}`));
            if (reg.studentUid) {
              await remove(ref(db, `students/${reg.studentUid}`));
              await remove(ref(db, `student_centre_index/${c}/${reg.studentUid}`));
            }
            purgedCount++;
          }
        }
      }
    } catch (err) {
      console.warn(`Error purging test records in ${c}:`, err);
    }
  }

  return {
    success: true,
    message: `Successfully purged ${purgedCount} mock test candidate records from database.`
  };
}

// ============================================================================
// 6. RAW RTDB NODE INSPECTOR & CRUD
// ============================================================================

export async function inspectRtdbPath({
  path,
  actorEmail
}: {
  path: string;
  actorEmail?: string;
}): Promise<any> {
  assertDeveloper(actorEmail);
  const cleanPath = path.trim().replace(/^\/+|\/+$/g, '');
  const snap = await get(ref(db, cleanPath));
  return snap.exists() ? snap.val() : null;
}

export async function writeRtdbPath({
  path,
  data,
  actorEmail
}: {
  path: string;
  data: any;
  actorEmail?: string;
}): Promise<void> {
  assertDeveloper(actorEmail);
  const cleanPath = path.trim().replace(/^\/+|\/+$/g, '');
  await set(ref(db, cleanPath), sanitizeForFirebase(data));
}

export async function deleteRtdbPath({
  path,
  actorEmail
}: {
  path: string;
  actorEmail?: string;
}): Promise<void> {
  assertDeveloper(actorEmail);
  const cleanPath = path.trim().replace(/^\/+|\/+$/g, '');
  await remove(ref(db, cleanPath));
}
