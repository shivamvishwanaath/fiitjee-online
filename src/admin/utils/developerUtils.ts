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
  getRegistrationFeeForClass
} from './centreUtils';
import { deleteRegistrationAndAuth, DeleteResult } from './deleteRegistrationUtil';
import { logActivity } from './logActivity';
import { ExamRegistration, StudentProfile } from '../../types';

export { DEVELOPER_EMAIL, isDeveloperEmail };

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

/**
 * De-registers a candidate from an exam (e.g. Big Bang Edge Test 2026).
 * This safely purges the registration node, results, and student registeredExams link,
 * allowing the developer/student to test the registration wizard again from scratch
 * without deleting their student profile or Firebase Auth credentials.
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
  const centres = ['bhubaneswar', 'dwarka', 'ranchi', 'hyderabad'];
  let removedFromCentres: string[] = [];

  // 1. Remove registration from specified centre or search all centres
  for (const c of centres) {
    if (centreId && c !== centreId) continue;
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

      // Check if student has remaining registered exams
      const remainingExamsSnap = await get(ref(db, `students/${targetUid}/registeredExams`));
      const hasOtherExams = remainingExamsSnap.exists() && Object.keys(remainingExamsSnap.val() || {}).length > 0;

      if (!hasOtherExams && centreId) {
        await remove(ref(db, `student_centre_index/${centreId}/${targetUid}`));
      }
    } catch (err) {
      console.warn('Error updating student node during de-registration:', err);
    }
  }

  // Log activity
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
  assertDeveloper(actorEmail);

  const cleanRoll = rollNo.replace(/\s+/g, '_');
  const regRef = ref(db, `registrations/big_bang_2026/${centreId}/${cleanRoll}`);
  const snap = await get(regRef);

  if (!snap.exists()) {
    throw new Error(`Registration not found under centre ${centreId} for roll no ${rollNo}`);
  }

  const currentData = snap.val();
  const merged = sanitizeForFirebase({
    ...currentData,
    ...updates,
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: actorEmail || DEVELOPER_EMAIL
  });

  await set(regRef, merged);

  // Sync to student registeredExams if studentUid exists
  const studentUid = updates.studentUid || currentData.studentUid;
  if (studentUid) {
    try {
      const studentExamRef = ref(db, `students/${studentUid}/registeredExams/big_bang_2026`);
      const examSnap = await get(studentExamRef);
      if (examSnap.exists()) {
        const currentExamLink = examSnap.val();
        await update(studentExamRef, sanitizeForFirebase({
          ...currentExamLink,
          paymentStatus: updates.paymentStatus || currentExamLink.paymentStatus,
          paymentAmount: updates.paymentAmount !== undefined ? updates.paymentAmount : currentExamLink.paymentAmount,
          testDate: updates.testDate || currentExamLink.testDate,
          testMode: updates.testMode || currentExamLink.testMode,
          selectedCenter: updates.selectedCenter || currentExamLink.selectedCenter
        }));
      }
    } catch (err) {
      console.warn('Error syncing updates to student registeredExams node:', err);
    }
  }

  return {
    success: true,
    message: `Successfully updated registration for ${rollNo}.`
  };
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
  assertDeveloper(actorEmail);

  if (fromCentreId === toCentreId) {
    return { success: true, message: 'Source and destination centres are identical.' };
  }

  const cleanRoll = rollNo.replace(/\s+/g, '_');
  const sourceRef = ref(db, `registrations/big_bang_2026/${fromCentreId}/${cleanRoll}`);
  const snap = await get(sourceRef);

  if (!snap.exists()) {
    throw new Error(`Registration not found under centre ${fromCentreId} for roll no ${rollNo}`);
  }

  const data = snap.val();
  const toCentre = CENTRES_CONFIG[toCentreId] || CENTRES_CONFIG.bhubaneswar;

  const migratedData = sanitizeForFirebase({
    ...data,
    registeredByCentre: toCentreId,
    selectedCenter: toCentre.name,
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: actorEmail || DEVELOPER_EMAIL
  });

  // Write to new centre
  const targetRef = ref(db, `registrations/big_bang_2026/${toCentreId}/${cleanRoll}`);
  await set(targetRef, migratedData);

  // Remove from old centre
  await remove(sourceRef);

  // Update student centre indices
  if (data.studentUid) {
    try {
      await remove(ref(db, `student_centre_index/${fromCentreId}/${data.studentUid}`));
      await set(ref(db, `student_centre_index/${toCentreId}/${data.studentUid}`), true);
      await update(ref(db, `students/${data.studentUid}/registeredExams/big_bang_2026`), {
        centreId: toCentreId,
        selectedCenter: toCentre.name
      });
    } catch (err) {
      console.warn('Error updating student centre indices:', err);
    }
  }

  return {
    success: true,
    message: `Migrated registration ${rollNo} from ${fromCentreId} to ${toCentreId}.`
  };
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

  const centre = CENTRES_CONFIG[centreId] || CENTRES_CONFIG.bhubaneswar;
  const rollNo = generateRollNumber(centre, currentClass, testMode);
  const sid = generateSID(rollNo);
  const invoiceNo = generateInvoiceNumber(centre, rollNo);
  const cleanRoll = rollNo.replace(/\s+/g, '_');
  const now = new Date().toISOString();
  const fee = getRegistrationFeeForClass(currentClass);

  const mockUid = `dev_test_${Date.now()}`;
  const mockEmail = `dev.test.${Date.now()}@example.com`;
  const mockPhone = '9876543210';

  const regPayload: ExamRegistration = {
    examId: 'big_bang_2026',
    examYear: '2026',
    rollNo: rollNo,
    studentName: studentName,
    parentName: 'Developer Parent',
    currentClass: currentClass,
    schoolName: 'FIITJEE Test Demonstration School',
    phone: mockPhone,
    email: mockEmail,
    testDate: '12th October 2026',
    testMode: testMode,
    selectedCenter: centre.name,
    registeredByCentre: centreId,
    registeredAt: now,
    status: 'Confirmed',
    paymentStatus: paymentStatus,
    paymentAmount: paymentStatus === 'paid' ? fee : 0,
    paymentRef: `DEV_REF_${Date.now()}`,
    sid: sid,
    invoiceNo: invoiceNo,
    invoiceDate: now.split('T')[0],
    studentUid: mockUid
  };

  // 1. Save to registrations/big_bang_2026/{centre}/{cleanRoll}
  await set(ref(db, `registrations/big_bang_2026/${centreId}/${cleanRoll}`), sanitizeForFirebase(regPayload));

  // 2. Save student profile
  const studentProfile: StudentProfile = {
    uid: mockUid,
    fullName: studentName,
    parentName: 'Developer Parent',
    email: mockEmail,
    phone: mockPhone,
    currentClass: currentClass,
    schoolName: 'FIITJEE Test Demonstration School',
    preferredCentreId: centreId,
    city: centre.name,
    state: centre.stateName,
    pincode: '751022',
    createdAt: now,
    lastLoginAt: now,
    profileStatus: 'Official candidate profile generated via Developer Utilities.'
  };
  await set(ref(db, `students/${mockUid}`), sanitizeForFirebase(studentProfile));

  // 3. Link registered exam
  await set(ref(db, `students/${mockUid}/registeredExams/big_bang_2026`), sanitizeForFirebase({
    examId: 'big_bang_2026',
    examName: 'Big Bang Edge Test 2026',
    rollNo: rollNo,
    centreId: centreId,
    selectedCenter: centre.name,
    testDate: '12th October 2026',
    testMode: testMode,
    registeredAt: now,
    paymentStatus: paymentStatus,
    paymentAmount: paymentStatus === 'paid' ? fee : 0,
    invoiceNo: invoiceNo,
    sid: sid
  }));

  // 4. Index under centre
  await set(ref(db, `student_centre_index/${centreId}/${mockUid}`), true);

  return {
    success: true,
    message: `Test candidate created successfully with Roll No ${rollNo} under ${centre.name}.`,
    details: { rollNo, studentUid: mockUid, email: mockEmail }
  };
}

/**
 * Permanently purges a candidate registration and their portal accounts.
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
 * Inspect raw Realtime Database node JSON (Developer read utility).
 */
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

/**
 * Write or update raw Realtime Database node JSON (Developer write utility).
 */
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

/**
 * Delete raw Realtime Database node (Developer delete utility).
 */
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
