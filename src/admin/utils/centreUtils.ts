export interface CentreProfile {
  id: string;
  name: string;
  code: string;
  numericCode: string;
  email: string;
  stateCode: string;
  stateName: string;
  gstin: string;
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
    email: 'fiitjee.bhubaneswar@fiitjee.online',
    stateCode: '[S.C-21]',
    stateName: 'Odisha',
    gstin: '21AAACF2659M1ZN',
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
    email: 'fiitjee.dwarka@fiitjee.online',
    stateCode: '[S.C-07]',
    stateName: 'Delhi',
    gstin: '07AAACF2659M1ZN',
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
    email: 'fiitjee.ranchi@fiitjee.online',
    stateCode: '[S.C-20]',
    stateName: 'Jharkhand',
    gstin: '20AAACF2659M1ZN',
    address: 'SOPPORIUM, 5th Floor, Near Argora Chowk, Harmu Road, Ranchi, 834002 [S.C-20]',
    controllingOffice: 'Ranchi - FIITJEE Ltd., 5th Floor, SOPPORIUM, Near Argora Chowk, Harmu Road, Ranchi-834002 Ph: 0651-2244000/2244001/9835155509 [45]',
    testCentreDisplay: 'RANCHI - FIITJEE RANCHI CENTRE, SOPPORIUM, Near Argora Chowk, Harmu Road, Ranchi [450]',
    helplinePhone: '98351 55509',
    phoneNumbers: ['0651-2244000', '0651-2244001', '98351 55509']
  },
  hyderabad: {
    id: 'hyderabad',
    name: 'Hyderabad (Madhapur)',
    code: '[92]',
    numericCode: '92',
    email: 'fiitjee.hyderabad@fiitjee.online',
    stateCode: '[S.C-36]',
    stateName: 'Telangana',
    gstin: '36AAACF2659M1ZN',
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

export function getExamScheduleForClass(className?: string): string {
  const norm = (className || '').toLowerCase();
  if (norm.includes('v') || norm.includes('vi') || norm.includes('vii') || norm.includes('viii')) {
    return 'Paper 1 (IQ & Mental Ability) : 9:00 am - 10:30 am; Paper 2 (Science & Math) : 11:15 am - 1:15 pm';
  }
  if (norm.includes('xi') || norm.includes('xii')) {
    return 'Paper 1 (IQ & Physics) : 9:00 am - 11:00 am; Paper 2 (Chemistry & Math) : 12:00 pm - 2:00 pm; Paper 3 (Advanced PCM) : 2:45 pm - 4:45 pm';
  }
  // Default for Class IX / X (matches user PDF exactly)
  return 'Paper 1a (IQ) : 9:00 am - 10:00 am; Paper 1b (IQ) : 10:15 am - 11:15 am; Paper 2 (Science-PCB) : 12:30 pm - 2:00 pm; Paper 3 (Math) : 2:15 pm - 3:45 pm';
}
