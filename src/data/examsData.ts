import { AdmissionExam } from '../types';

export interface BigBangClassItem {
  key: string;       // 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'
  canonical: string; // 'Class V', 'Class VI', ...
  label: string;     // '05th. Going to 06th. - 6052', '06th. Going to 07th. - 7052', ...
  code: string;      // '6052', '7052', ...
  fromGrade: string; // '05th'
  toGrade: string;   // '06th'
}

export const BIG_BANG_CLASSES: BigBangClassItem[] = [
  { key: 'V',    canonical: 'Class V',    label: '05th. Going to 06th. - 6052', code: '6052', fromGrade: '05th', toGrade: '06th' },
  { key: 'VI',   canonical: 'Class VI',   label: '06th. Going to 07th. - 7052', code: '7052', fromGrade: '06th', toGrade: '07th' },
  { key: 'VII',  canonical: 'Class VII',  label: '07th. Going to 08th. - 8052', code: '8052', fromGrade: '07th', toGrade: '08th' },
  { key: 'VIII', canonical: 'Class VIII', label: '08th. Going to 09th. - 9052', code: '9052', fromGrade: '08th', toGrade: '09th' },
  { key: 'IX',   canonical: 'Class IX',   label: '09th. Going to 10th. - 1052', code: '1052', fromGrade: '09th', toGrade: '10th' },
  { key: 'X',    canonical: 'Class X',    label: '10th. Going to 11th. - 1152', code: '1152', fromGrade: '10th', toGrade: '11th' },
  { key: 'XI',   canonical: 'Class XI',   label: '11th. Going to 12th. - 1252', code: '1252', fromGrade: '11th', toGrade: '12th' },
];

export function getClassOption(className?: string): BigBangClassItem {
  if (!className) return BIG_BANG_CLASSES[5]; // Default to 10th
  const c = className.trim().toUpperCase();

  // 1. Direct match on key, code, canonical, or label
  for (const item of BIG_BANG_CLASSES) {
    if (
      c === item.key || 
      c === item.code || 
      c === item.canonical.toUpperCase() || 
      c === item.label.toUpperCase()
    ) {
      return item;
    }
  }

  // 2. Specific class checks
  if (c.includes('6052') || c.includes('05TH') || c.includes('5TH') || c === '5' || c.includes('CLASS 5') || (c.includes('CLASS V') && !c.includes('VI') && !c.includes('VII') && !c.includes('VIII'))) {
    return BIG_BANG_CLASSES[0];
  }
  if (c.includes('7052') || c.includes('06TH') || c.includes('6TH') || c === '6' || c.includes('CLASS 6') || (c.includes('CLASS VI') && !c.includes('VII') && !c.includes('VIII'))) {
    return BIG_BANG_CLASSES[1];
  }
  if (c.includes('8052') || c.includes('07TH') || c.includes('7TH') || c === '7' || c.includes('CLASS 7') || (c.includes('CLASS VII') && !c.includes('VIII'))) {
    return BIG_BANG_CLASSES[2];
  }
  if (c.includes('9052') || c.includes('08TH') || c.includes('8TH') || c === '8' || c.includes('CLASS 8') || c.includes('CLASS VIII')) {
    return BIG_BANG_CLASSES[3];
  }
  if (c.includes('1052') || c.includes('09TH') || c.includes('9TH') || c === '9' || c.includes('CLASS 9') || c.includes('CLASS IX')) {
    return BIG_BANG_CLASSES[4];
  }
  if (c.includes('1152') || c.includes('10TH') || c === '10' || c.includes('CLASS 10') || (c.includes('CLASS X') && !c.includes('XI') && !c.includes('XII'))) {
    return BIG_BANG_CLASSES[5];
  }
  if (c.includes('1252') || c.includes('11TH') || c === '11' || c.includes('CLASS 11') || (c.includes('CLASS XI') && !c.includes('XII'))) {
    return BIG_BANG_CLASSES[6];
  }

  return BIG_BANG_CLASSES[5];
}

export const BIG_BANG_EXAM: AdmissionExam = {
  id: 'big-bang-edge-test',
  name: 'Big Bang Edge Test',
  fullBrandedName: 'FIITJEE Big Bang Edge Test',
  tagline: 'Some choices are obvious.',
  description: 'A 360° analysis of aptitude, potential & academic standing.',
  targetClasses: ['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'],
  targetClassesDisplay: 'Class V · VI · VII · VIII · IX · X · XI',
  testDates: [
    '11th October 2026 (Sunday)',
    '18th October 2026 (Sunday)'
  ],
  modes: ['Offline', 'Proctored Online'],
  offlineCenters: [
    { city: 'Bhubaneswar', phone: '76820 41257' },
    { city: 'Ranchi',       phone: '98351 55509' },
    { city: 'Dwarka',       phone: '85272 08022' },
    { city: 'Hyderabad (Madhapur)', phone: '92475 51761' }
  ],
  year: '2026',
  registrationOpen: true,
  registrationDbPath: 'registrations/big_bang_2026',
  registrationFee: 200,
  isFree: false
};

import { calculateExamFeeForClass, DEFAULT_CENTRE_EXAMS, CentreExamConfig } from '../admin/utils/examUtils';

export function getRegistrationFeeForClass(
  className?: string,
  centreId?: string,
  examConfig?: CentreExamConfig | null
): number {
  if (examConfig) {
    return calculateExamFeeForClass(examConfig, className);
  }
  if (centreId) {
    const cleanId = centreId.toLowerCase();
    const blueprint = DEFAULT_CENTRE_EXAMS[cleanId] || DEFAULT_CENTRE_EXAMS.bhubaneswar;
    return calculateExamFeeForClass(blueprint, className);
  }
  return calculateExamFeeForClass(null, className);
}

export const ADMISSION_EXAMS: AdmissionExam[] = [BIG_BANG_EXAM];
