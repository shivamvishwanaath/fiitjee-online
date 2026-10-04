import { ref, get, set, update, remove } from 'firebase/database';
import { db } from '../../firebase';
import { CENTRES_CONFIG } from './centreUtils';
import { getClassOption } from '../../data/examsData';

export interface CentreExamVenue {
  name: string;
  address: string;
  phone: string;
}

export interface CentreExamConfig {
  id: string; // e.g. 'big-bang-edge-test'
  centreId: string; // e.g. 'bhubaneswar'
  name: string;
  fullBrandedName: string;
  tagline: string;
  description: string;
  year: string;
  registrationOpen: boolean;
  targetClasses: string[];
  testDates: string[];
  modes: ('Offline' | 'Proctored Online')[];
  venues: CentreExamVenue[];
  classFees: Record<string, number>;
  defaultFee: number;
  paymentModes: string[];
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
}

/**
 * Standard default classes for FIITJEE admission tests
 */
export const DEFAULT_EXAM_CLASSES = [
  'Class V',
  'Class VI',
  'Class VII',
  'Class VIII',
  'Class IX',
  'Class X',
  'Class XI',
  'Class XII Passout'
];

/**
 * Default Big Bang Edge Test 2026 blueprints for each of the 4 centres
 */
export const DEFAULT_CENTRE_EXAMS: Record<string, CentreExamConfig> = {
  bhubaneswar: {
    id: 'big-bang-edge-test',
    centreId: 'bhubaneswar',
    name: 'Big Bang Edge Test 2026',
    fullBrandedName: 'FIITJEE Big Bang Edge Test 2026',
    tagline: 'Some choices are obvious. Your future starts here.',
    description: 'A comprehensive 360° diagnostic examination evaluating aptitude, fundamental conceptual clarity, and national-level competitive potential for JEE & early talent programs.',
    year: '2026',
    registrationOpen: true,
    targetClasses: [...DEFAULT_EXAM_CLASSES],
    testDates: [
      '11th October 2026 (Sunday)',
      '18th October 2026 (Sunday)'
    ],
    modes: ['Offline', 'Proctored Online'],
    venues: [
      {
        name: 'FIITJEE Bhubaneswar Centre',
        address: 'MBS PUBLIC SCHOOL, PLOT NO 4 ,UNIT -9, BUDHA MANDIR COMPLEX ,BHUBANESWAR-751022',
        phone: '7682041257'
      }
    ],
    classFees: {
      'Class V': 200,
      'Class VI': 200,
      'Class VII': 200,
      'Class VIII': 200,
      'Class IX': 250,
      'Class X': 250,
      'Class XI': 250,
      'Class XII Passout': 250
    },
    defaultFee: 250,
    paymentModes: ['Online (Cashfree / UPI / Cards)', 'Centre Cash Desk / Offline DD'],
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: 'system@fiitjee.online'
  },
  dwarka: {
    id: 'big-bang-edge-test',
    centreId: 'dwarka',
    name: 'Big Bang Edge Test 2026',
    fullBrandedName: 'FIITJEE Big Bang Edge Test 2026',
    tagline: 'Some choices are obvious. Elevate your potential in Delhi-NCR.',
    description: 'A comprehensive 360° diagnostic examination evaluating aptitude, fundamental conceptual clarity, and national-level competitive potential for JEE & early talent programs.',
    year: '2026',
    registrationOpen: true,
    targetClasses: [...DEFAULT_EXAM_CLASSES],
    testDates: [
      '11th October 2026 (Sunday)',
      '18th October 2026 (Sunday)'
    ],
    modes: ['Offline', 'Proctored Online'],
    venues: [
      {
        name: 'FIITJEE Dwarka Centre',
        address: 'Sector 12, Dwarka, New Delhi 110075',
        phone: '8527208022'
      }
    ],
    classFees: {
      'Class V': 200,
      'Class VI': 200,
      'Class VII': 200,
      'Class VIII': 200,
      'Class IX': 250,
      'Class X': 250,
      'Class XI': 250,
      'Class XII Passout': 250
    },
    defaultFee: 250,
    paymentModes: ['Online (Cashfree / UPI / Cards)', 'Centre Cash Desk / Offline DD'],
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: 'system@fiitjee.online'
  },
  ranchi: {
    id: 'big-bang-edge-test',
    centreId: 'ranchi',
    name: 'Big Bang Edge Test 2026',
    fullBrandedName: 'FIITJEE Big Bang Edge Test 2026',
    tagline: 'Benchmark your academic excellence with FIITJEE Ranchi.',
    description: 'A comprehensive 360° diagnostic examination evaluating aptitude, fundamental conceptual clarity, and national-level competitive potential for JEE & early talent programs.',
    year: '2026',
    registrationOpen: true,
    targetClasses: [...DEFAULT_EXAM_CLASSES],
    testDates: [
      '11th October 2026 (Sunday)',
      '18th October 2026 (Sunday)'
    ],
    modes: ['Offline', 'Proctored Online'],
    venues: [
      {
        name: 'FIITJEE Ranchi Centre',
        address: 'SOPOR, Main Road, Ranchi, Jharkhand 834001',
        phone: '9835155509'
      }
    ],
    classFees: {
      'Class V': 200,
      'Class VI': 200,
      'Class VII': 200,
      'Class VIII': 200,
      'Class IX': 250,
      'Class X': 250,
      'Class XI': 250,
      'Class XII Passout': 250
    },
    defaultFee: 250,
    paymentModes: ['Online (Cashfree / UPI / Cards)', 'Centre Cash Desk / Offline DD'],
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: 'system@fiitjee.online'
  },
  hyderabad: {
    id: 'big-bang-edge-test',
    centreId: 'hyderabad',
    name: 'Big Bang Edge Test 2026',
    fullBrandedName: 'FIITJEE Big Bang Edge Test 2026',
    tagline: 'Unlock Telangana & national-level competitive supremacy with FIITJEE Hyderabad.',
    description: 'A comprehensive 360° diagnostic examination evaluating aptitude, fundamental conceptual clarity, and national-level competitive potential for JEE & early talent programs.',
    year: '2026',
    registrationOpen: true,
    targetClasses: [...DEFAULT_EXAM_CLASSES],
    testDates: [
      '11th October 2026 (Sunday)',
      '18th October 2026 (Sunday)'
    ],
    modes: ['Offline', 'Proctored Online'],
    venues: [
      {
        name: 'FIITJEE Hyderabad (Madhapur)',
        address: 'Plot No 34, VIP Hills, Silicon Valley, Madhapur, Hyderabad 500081',
        phone: '9247551761'
      }
    ],
    classFees: {
      'Class V': 200,
      'Class VI': 200,
      'Class VII': 200,
      'Class VIII': 200,
      'Class IX': 250,
      'Class X': 250,
      'Class XI': 250,
      'Class XII Passout': 250
    },
    defaultFee: 250,
    paymentModes: ['Online (Cashfree / UPI / Cards)', 'Centre Cash Desk / Offline DD'],
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: 'system@fiitjee.online'
  }
};

/**
 * Seeds Big Bang Edge Test 2026 into RTDB for all 4 centres if not already present
 */
export async function seedDefaultExamsIfEmpty(specificCentreId?: string): Promise<void> {
  const centresToSeed = specificCentreId 
    ? [specificCentreId.toLowerCase()] 
    : ['bhubaneswar', 'dwarka', 'ranchi', 'hyderabad'];

  for (const cid of centresToSeed) {
    try {
      const examRef = ref(db, `centre_exams/${cid}/big-bang-edge-test`);
      const snap = await get(examRef);
      if (!snap.exists()) {
        const defaultBlueprint = DEFAULT_CENTRE_EXAMS[cid] || DEFAULT_CENTRE_EXAMS.bhubaneswar;
        await set(examRef, defaultBlueprint);
        console.log(`Seeded default Big Bang Edge Test 2026 for ${cid}`);
      }
    } catch (err) {
      console.warn(`Could not seed exam for ${cid}:`, err);
    }
  }
}

/**
 * Fetches all exams configured for a given centre from RTDB
 */
export async function getCentreExams(centreId: string): Promise<CentreExamConfig[]> {
  const cleanId = (centreId || 'bhubaneswar').toLowerCase();
  try {
    const examsRef = ref(db, `centre_exams/${cleanId}`);
    const snap = await get(examsRef);

    if (snap.exists()) {
      const data = snap.val();
      return Object.entries(data).map(([key, val]: [string, any]) => ({
        id: key,
        centreId: cleanId,
        ...val
      }));
    } else {
      // Seed fallback default
      const defaultBlueprint = DEFAULT_CENTRE_EXAMS[cleanId] || DEFAULT_CENTRE_EXAMS.bhubaneswar;
      await set(ref(db, `centre_exams/${cleanId}/${defaultBlueprint.id}`), defaultBlueprint);
      return [defaultBlueprint];
    }
  } catch (err) {
    console.error('Error fetching centre exams:', err);
    return [DEFAULT_CENTRE_EXAMS[cleanId] || DEFAULT_CENTRE_EXAMS.bhubaneswar];
  }
}

/**
 * Fetches a single exam configuration for a centre
 */
export async function getCentreExamById(centreId: string, examId: string): Promise<CentreExamConfig | null> {
  const cleanCentreId = (centreId || 'bhubaneswar').toLowerCase();
  const cleanExamId = (examId || 'big-bang-edge-test').trim();

  try {
    const examRef = ref(db, `centre_exams/${cleanCentreId}/${cleanExamId}`);
    const snap = await get(examRef);

    if (snap.exists()) {
      return { id: cleanExamId, centreId: cleanCentreId, ...snap.val() };
    }

    // Check if it's default big-bang
    if (cleanExamId === 'big-bang-edge-test' || cleanExamId === 'big_bang_2026') {
      const blueprint = DEFAULT_CENTRE_EXAMS[cleanCentreId] || DEFAULT_CENTRE_EXAMS.bhubaneswar;
      await set(examRef, blueprint);
      return blueprint;
    }

    return null;
  } catch (err) {
    console.error(`Error fetching exam ${cleanExamId} for ${cleanCentreId}:`, err);
    return DEFAULT_CENTRE_EXAMS[cleanCentreId] || null;
  }
}

/**
 * Saves or updates an exam configuration for a centre
 */
export async function saveCentreExam(exam: CentreExamConfig): Promise<void> {
  const cleanCentreId = (exam.centreId || 'bhubaneswar').toLowerCase();
  const cleanExamId = (exam.id || 'big-bang-edge-test').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  const examRef = ref(db, `centre_exams/${cleanCentreId}/${cleanExamId}`);
  const payload = {
    ...exam,
    id: cleanExamId,
    centreId: cleanCentreId,
    lastUpdatedAt: new Date().toISOString()
  };

  await set(examRef, payload);
}

/**
 * Toggles registration open/closed status for an exam
 */
export async function toggleExamRegistration(
  centreId: string, 
  examId: string, 
  isOpen: boolean
): Promise<void> {
  const cleanCentreId = centreId.toLowerCase();
  const examRef = ref(db, `centre_exams/${cleanCentreId}/${examId}`);
  await update(examRef, {
    registrationOpen: isOpen,
    lastUpdatedAt: new Date().toISOString()
  });
}

/**
 * Deletes an exam configuration from a centre
 */
export async function deleteCentreExam(centreId: string, examId: string): Promise<void> {
  const cleanCentreId = centreId.toLowerCase();
  const examRef = ref(db, `centre_exams/${cleanCentreId}/${examId}`);
  await remove(examRef);
}

/**
 * Calculates fee for an exam based on candidate's class
 */
export function calculateExamFeeForClass(
  examConfig: CentreExamConfig | null, 
  className?: string
): number {
  if (!examConfig) return 250;
  if (!className) return examConfig.defaultFee || 250;

  // 1. Map via getClassOption canonical (e.g. '05th. Going to 06th.' -> 'Class V', '12th Passout' -> 'Class XII Passout')
  const opt = getClassOption(className);
  const canonical = opt.canonical;
  if (examConfig.classFees) {
    if (examConfig.classFees[canonical] !== undefined) {
      return examConfig.classFees[canonical];
    }
    if (canonical === 'Class XII Passout') {
      if (examConfig.classFees['Class XII'] !== undefined) return examConfig.classFees['Class XII'];
      if (examConfig.classFees['12th Passout'] !== undefined) return examConfig.classFees['12th Passout'];
    }
    if (examConfig.classFees[opt.label] !== undefined) {
      return examConfig.classFees[opt.label];
    }
  }

  const normalizedClass = className.startsWith('Class ') ? className : `Class ${className.toUpperCase()}`;
  if (examConfig.classFees && examConfig.classFees[normalizedClass] !== undefined) {
    return examConfig.classFees[normalizedClass];
  }

  // Check bare roman numerals (V, VI, etc.)
  const bare = className.toUpperCase().replace(/^CLASS\s*/, '').trim();
  const matchedKey = Object.keys(examConfig.classFees || {}).find(k => k.toUpperCase().includes(bare));
  if (matchedKey && examConfig.classFees[matchedKey] !== undefined) {
    return examConfig.classFees[matchedKey];
  }

  return examConfig.defaultFee || 250;
}
