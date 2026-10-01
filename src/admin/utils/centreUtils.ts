export interface CentreProfile {
  id: string;
  name: string;
  code: string;
  numericCode: string;
  testCentreCode: string;
  testCentres?: { code: string; name: string }[];
  studyCentres?: { code: string; name: string }[];
  email: string;
  stateCode: string;
  stateName: string;
  address: string;
  controllingOffice: string;
  testCentreDisplay: string;
  helplinePhone: string;
  phoneNumbers: string[];
}

export const CENTRES_CONFIG: Record<string, CentreProfile> = {
  bhubaneswar: {
    id: 'bhubaneswar',
    name: 'Bhubaneswar',
    code: '[73]',
    numericCode: '73',
    testCentreCode: '733',
    testCentres: [
      { code: '733', name: 'BHUBANESWAR - FIITJEE INFOCITY CENTRE, Near Infocity Square, BHUBANESWAR, 1st Floor, E/3, Near Infocity Square, BHUBANESWAR' }
    ],
    studyCentres: [
      { code: '73', name: '73 (Bhubaneswar)' }
    ],
    email: 'fiitjee.bhubaneswar@fiitjee.online',
    stateCode: '[S.C-21]',
    stateName: 'Odisha',
    address: 'Scouts Bhawan, Bharat Scouts & Guides Complex CIX/8, Unit 3, 751022 [S.C-21]',
    controllingOffice: 'Bhubaneswar - FIITJEE Ltd., 2nd Floor, Scouts Bhawan, Bharat Scouts & Guides Complex, C - IX / 8, Unit - 3, Bhubaneswar-22 Ph: 0674-2392022/2396725/2394925/2394825 [73]',
    testCentreDisplay: 'BHUBANESWAR - FIITJEE INFOCITY CENTRE, Near Infocity Square, BHUBANESWAR, , 1st Floor, E/3 , Near Infocity Square, BHUBANESWAR [733]',
    helplinePhone: '76820 41257',
    phoneNumbers: ['0674-2392022', '0674-2396725', '76820 41257']
  },
  dwarka: {
    id: 'dwarka',
    name: 'Dwarka',
    code: '[21]',
    numericCode: '21',
    testCentreCode: '210',
    testCentres: [
      { code: '210', name: 'DWARKA - FIITJEE DWARKA CENTRE, Institutional Plot No. 6, Sector 12, Dwarka, New Delhi' }
    ],
    studyCentres: [
      { code: '21', name: '21 (Dwarka)' }
    ],
    email: 'fiitjee.dwarka@fiitjee.online',
    stateCode: '[S.C-07]',
    stateName: 'Delhi',
    address: 'Plot No. 6, Sector 12, Dwarka, New Delhi, 110075 [S.C-07]',
    controllingOffice: 'Dwarka - FIITJEE Ltd., Plot No. 6, Sector 12, Dwarka, New Delhi - 110075 Ph: 011-45634000/45634001/8527208022 [21]',
    testCentreDisplay: 'DWARKA - FIITJEE DWARKA CENTRE, Institutional Plot No. 6, Sector 12, Dwarka, New Delhi [210]',
    helplinePhone: '85272 08022',
    phoneNumbers: ['011-45634000', '011-45634001', '85272 08022']
  },
  ranchi: {
    id: 'ranchi',
    name: 'Ranchi',
    code: '[45]',
    numericCode: '45',
    testCentreCode: '820',
    testCentres: [
      { code: '820', name: 'Ranchi- FIITJEE, 7th Floor, Hariom Tower, Circular Road, Ranchi - 834001' },
      { code: '850', name: 'Ranchi- FIITJEE, Samraddhi Complex, Ground Floor, South Office Para, Doranda, Ranchi - 834002' }
    ],
    studyCentres: [
      { code: '82', name: '82 (Ranchi-Lalpur)' },
      { code: '85', name: '85 (Ranchi-SOP Doranda)' }
    ],
    email: 'fiitjee.ranchi@fiitjee.online',
    stateCode: '[S.C-20]',
    stateName: 'Jharkhand',
    address: 'Ranchi- FIITJEE, 7th Floor, Hariom Tower, Circular Road, Ranchi - 834001 [S.C-20]',
    controllingOffice: 'Ranchi- FIITJEE, 7th Floor, Hariom Tower, Circular Road, Ranchi - 834001 Ph: 9835155509 [45]',
    testCentreDisplay: 'Ranchi- FIITJEE, 7th Floor, Hariom Tower, Circular Road, Ranchi - 834001 [820]',
    helplinePhone: '98351 55509',
    phoneNumbers: ['98351 55509']
  },
  hyderabad: {
    id: 'hyderabad',
    name: 'Hyderabad (Madhapur)',
    code: '[92]',
    numericCode: '92',
    testCentreCode: '920',
    testCentres: [
      { code: '920', name: 'HYDERABAD - FIITJEE MADHAPUR CENTRE, Near Durgam Cheruvu Metro, Madhapur, Hyderabad' }
    ],
    studyCentres: [
      { code: '92', name: '92 (Hyderabad - Madhapur)' }
    ],
    email: 'fiitjee.hyderabad@fiitjee.online',
    stateCode: '[S.C-36]',
    stateName: 'Telangana',
    address: 'Plot No. 22 & 23, Vittal Rao Nagar, Madhapur, Hyderabad, 500081 [S.C-36]',
    controllingOffice: 'Hyderabad - FIITJEE Ltd., Plot No. 22 & 23, Vittal Rao Nagar, Madhapur, Hyderabad-500081 Ph: 040-48550400/9247551761 [92]',
    testCentreDisplay: 'HYDERABAD - FIITJEE MADHAPUR CENTRE, Near Durgam Cheruvu Metro, Madhapur, Hyderabad [920]',
    helplinePhone: '92475 51761',
    phoneNumbers: ['040-48550400', '92475 51761']
  }
};

export const ALL_CENTRES = Object.values(CENTRES_CONFIG);

export const SUPERADMIN_EMAILS = [
  'shivam.strive@gmail.com',
  'admin@fiitjee.online',
  'corporate@fiitjee.online'
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return SUPERADMIN_EMAILS.includes(clean);
}

export function isValidAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();

  // Exclude candidate virtual accounts
  if (clean.includes('@candidate.fiitjee.online')) return false;

  // Superadmin emails
  if (SUPERADMIN_EMAILS.includes(clean)) return true;

  // Official FIITJEE organisation domains
  if (clean.endsWith('@fiitjee.online') || clean.endsWith('@fiitjee.com')) {
    return true;
  }

  // Exact centre emails
  for (const centre of ALL_CENTRES) {
    if (centre.email.toLowerCase() === clean) {
      return true;
    }
  }

  return false;
}

export function getCentreByEmail(email?: string | null): CentreProfile | null {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();

  // Candidate emails can never be centre accounts
  if (cleanEmail.includes('@candidate.fiitjee.online')) return null;

  for (const centre of ALL_CENTRES) {
    if (centre.email.toLowerCase() === cleanEmail) {
      return centre;
    }
  }

  // Fallback matching by identifier in email ONLY for official organisation domains
  const isOfficialDomain = cleanEmail.endsWith('@fiitjee.online') || cleanEmail.endsWith('@fiitjee.com');
  if (isOfficialDomain) {
    if (cleanEmail.includes('dwarka')) return CENTRES_CONFIG.dwarka;
    if (cleanEmail.includes('bhubaneswar')) return CENTRES_CONFIG.bhubaneswar;
    if (cleanEmail.includes('ranchi')) return CENTRES_CONFIG.ranchi;
    if (cleanEmail.includes('hyderabad') || cleanEmail.includes('madhapur')) return CENTRES_CONFIG.hyderabad;
  }

  return null;
}

export function getCentreByName(name?: string | null): CentreProfile {
  if (!name) return CENTRES_CONFIG.bhubaneswar;
  const clean = name.toLowerCase();
  if (clean.includes('dwarka')) return CENTRES_CONFIG.dwarka;
  if (clean.includes('ranchi')) return CENTRES_CONFIG.ranchi;
  if (clean.includes('hyderabad') || clean.includes('madhapur')) return CENTRES_CONFIG.hyderabad;
  return CENTRES_CONFIG.bhubaneswar;
}

export function getCentreIdByName(name?: string | null): string {
  if (!name) return 'bhubaneswar';
  const clean = name.toLowerCase();
  if (clean.includes('dwarka')) return 'dwarka';
  if (clean.includes('ranchi')) return 'ranchi';
  if (clean.includes('hyderabad') || clean.includes('madhapur')) return 'hyderabad';
  return 'bhubaneswar';
}

/**
 * Resolves any centre identifier, name, city string, or branch abbreviation
 * into a canonical centre ID ('bhubaneswar', 'dwarka', 'ranchi', 'hyderabad', or 'all').
 */
export function resolveCanonicalCentreId(input?: string | null): string {
  if (!input) return '';
  const clean = input.trim().toLowerCase().replace(/[\s_\-()]+/g, '');
  if (!clean || clean === 'all' || clean === 'global' || clean === 'allcentres' || clean === 'allbranches' || clean === 'system') {
    return 'all';
  }
  if (clean.includes('dwarka') || clean.includes('delhi')) return 'dwarka';
  if (clean.includes('ranchi') || clean.includes('lalpur') || clean.includes('doranda')) return 'ranchi';
  if (clean.includes('hyderabad') || clean.includes('madhapur') || clean.includes('hyd')) return 'hyderabad';
  if (clean.includes('bhubaneswar') || clean.includes('infocity') || clean.includes('odisha') || clean.includes('bbsr')) return 'bhubaneswar';
  return clean;
}

/**
 * Checks whether a coupon's centre restriction matches the student's registration centre.
 */
export function isCentreMatch(couponCentreId?: string | null, targetCentreId?: string | null): boolean {
  if (!couponCentreId) return true;
  const couponCanonical = resolveCanonicalCentreId(couponCentreId);
  if (couponCanonical === 'all' || !couponCanonical) return true;
  if (!targetCentreId) return true;
  const targetCanonical = resolveCanonicalCentreId(targetCentreId);
  return couponCanonical === targetCanonical;
}

export function formatRegistrationNumber(rollNo?: string): string {
  if (!rollNo) return '';
  // Strip non-alphanumerics
  const raw = rollNo.replace(/\s+/g, '');
  if (raw.length >= 16) {
    return `${raw.slice(0, 4)} ${raw.slice(4, 9)} ${raw.slice(9, 15)} ${raw.slice(15)}`;
  }
  if (raw.length >= 12) {
    return `${raw.slice(0, 4)} ${raw.slice(4, 8)} ${raw.slice(8, 12)} ${raw.slice(12)}`;
  }
  // Standard chunking in 4s
  const chunks = raw.match(/.{1,4}/g);
  return chunks ? chunks.join(' ') : rollNo;
}

export function getExamCodeForClass(className?: string): string {
  if (!className) return '7052';
  const c = className.trim().toUpperCase();

  // Class 5 / V (going to 6th) -> 6052
  if (
    c === 'CLASS V' || 
    c === 'CLASS 5' || 
    c.includes('CLASS V ') || 
    c.includes('CLASS 5TH') || 
    c.includes('5TH') || 
    (c.includes('CLASS V') && !c.includes('VI') && !c.includes('VII') && !c.includes('VIII'))
  ) {
    return '6052';
  }

  // Class 6 / VI (going to 7th) -> 7052
  if (
    c === 'CLASS VI' || 
    c === 'CLASS 6' || 
    c.includes('CLASS VI ') || 
    c.includes('CLASS 6TH') || 
    c.includes('6TH') || 
    (c.includes('CLASS VI') && !c.includes('VII') && !c.includes('VIII'))
  ) {
    return '7052';
  }

  // Class 7 / VII (going to 8th) -> 8052
  if (
    c === 'CLASS VII' || 
    c === 'CLASS 7' || 
    c.includes('CLASS VII ') || 
    c.includes('CLASS 7TH') || 
    c.includes('7TH') || 
    (c.includes('CLASS VII') && !c.includes('VIII'))
  ) {
    return '8052';
  }

  // Class 8 / VIII (going to 9th) -> 9052
  if (
    c === 'CLASS VIII' || 
    c === 'CLASS 8' || 
    c.includes('CLASS VIII ') || 
    c.includes('CLASS 8TH') || 
    c.includes('8TH') || 
    c.includes('CLASS VIII')
  ) {
    return '9052';
  }

  // Class 9 / IX (going to 10th) -> 1052
  if (
    c === 'CLASS IX' || 
    c === 'CLASS 9' || 
    c.includes('CLASS IX ') || 
    c.includes('CLASS 9TH') || 
    c.includes('9TH') || 
    c.includes('CLASS IX')
  ) {
    return '1052';
  }

  // Class 10 / X (going to 11th) -> 1152
  if (
    c === 'CLASS X' || 
    c === 'CLASS 10' || 
    c.includes('CLASS X ') || 
    c.includes('CLASS 10TH') || 
    c.includes('10TH') || 
    (c.includes('CLASS X') && !c.includes('XI') && !c.includes('XII'))
  ) {
    return '1152';
  }

  // Class 11 / XI (going to 12th) -> 1252
  if (
    c === 'CLASS XI' || 
    c === 'CLASS 11' || 
    c.includes('CLASS XI ') || 
    c.includes('CLASS 11TH') || 
    c.includes('11TH') || 
    (c.includes('CLASS XI') && !c.includes('XII'))
  ) {
    return '1252';
  }

  // Class 12 / XII -> 1252
  if (
    c === 'CLASS XII' || 
    c === 'CLASS 12' || 
    c.includes('CLASS XII') || 
    c.includes('12TH')
  ) {
    return '1252';
  }

  return '7052';
}

export function generateRollNumber(
  centre: CentreProfile,
  testDate?: string,
  sequence?: number | string,
  testCentreCodeOverride?: string,
  className?: string
): string {
  const examCode = getExamCodeForClass(className);
  // Test Centre Code
  const tcCode = testCentreCodeOverride || centre.testCentreCode || '820';
  const centreSegment = `${centre.numericCode}${tcCode}`; // e.g. "45820"
  
  // Date chunk: 6 digits (DDMMYY)
  let dateChunk = '111026';
  if (testDate) {
    if (testDate.includes('18')) {
      dateChunk = '181026';
    } else if (testDate.includes('11')) {
      dateChunk = '111026';
    }
  }

  // 4-digit sequence chunk: '0001', '0002', etc.
  let seqChunk = '0001';
  if (typeof sequence === 'number') {
    seqChunk = String(sequence).padStart(4, '0');
  } else if (typeof sequence === 'string' && sequence.trim()) {
    seqChunk = sequence.trim().padStart(4, '0');
  } else {
    const rand = Math.floor(1 + Math.random() * 99);
    seqChunk = String(rand).padStart(4, '0');
  }

  return `${examCode} ${centreSegment} ${dateChunk} ${seqChunk}`;
}

export function generateSID(rollNo?: string): string {
  if (!rollNo) return '';
  let hash = 0;
  for (let i = 0; i < rollNo.length; i++) {
    hash = (hash * 31 + rollNo.charCodeAt(i)) & 0xffffffff;
  }
  const positive = Math.abs(hash);
  return `SOOO21${String(positive).slice(0, 5).padStart(5, '0')}`;
}

export function generateInvoiceNumber(centre: CentreProfile, rollNo?: string): string {
  const code = centre.numericCode;
  const year = '26';
  let suffix = '00000021';
  if (rollNo) {
    const digits = rollNo.replace(/\D/g, '');
    if (digits.length >= 4) {
      suffix = digits.slice(-6).padStart(8, '0');
    }
  }
  return `FL${year}${code}25${suffix}`;
}

export function getExamScheduleForClass(_className?: string): string {
  // Universal across all classes and centres: 3 Hours, 10:00 AM to 01:00 PM
  return 'Test Duration : 3 Hours; Test Timing : 10:00 AM to 01:00 PM';
}

export { getRegistrationFeeForClass } from '../../data/examsData';

/**
 * Deep sanitize helper to eliminate any undefined values that crash Firebase RTDB
 */
export function sanitizeForFirebase<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirebase) as any;
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      clean[k] = sanitizeForFirebase(v);
    }
  }
  return clean as T;
}
