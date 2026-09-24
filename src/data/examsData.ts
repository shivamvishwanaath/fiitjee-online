import { AdmissionExam } from '../types';

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
  registrationFee: 1,
  isFree: false
};

export const ADMISSION_EXAMS: AdmissionExam[] = [BIG_BANG_EXAM];
