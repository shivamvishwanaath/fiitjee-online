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
    controllingOffice: 'Ranchi- FIITJEE, 7th Floor, Hariom Tower, Circular Road, Ranchi - 834001 Ph: 0651-2244000/2244001/9835155509 [45]',
    testCentreDisplay: 'Ranchi- FIITJEE, 7th Floor, Hariom Tower, Circular Road, Ranchi - 834001 [820]',
    helplinePhone: '98351 55509',
    phoneNumbers: ['0651-2244000', '0651-2244001', '98351 55509']
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

export function getCentreByEmail(email?: string | null): CentreProfile | null {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  for (const centre of ALL_CENTRES) {
    if (centre.email.toLowerCase() === cleanEmail) {
      return centre;
    }
  }
  // Fallback matching by identifier in email
  if (cleanEmail.includes('dwarka')) return CENTRES_CONFIG.dwarka;
  if (cleanEmail.includes('bhubaneswar')) return CENTRES_CONFIG.bhubaneswar;
  if (cleanEmail.includes('ranchi')) return CENTRES_CONFIG.ranchi;
  if (cleanEmail.includes('hyderabad') || cleanEmail.includes('madhapur')) return CENTRES_CONFIG.hyderabad;
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

export function generateRollNumber(
  centre: CentreProfile,
  testDate?: string,
  sequence?: number | string,
  testCentreCodeOverride?: string
): string {
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

  return `7052 ${centreSegment} ${dateChunk} ${seqChunk}`;
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
