import { describe, it, expect } from 'vitest';
import { 
  isSuperAdminEmail, 
  isValidAdminEmail, 
  getCentreByEmail,
  CENTRES_CONFIG 
} from '../admin/utils/centreUtils';

describe('Admin Centre and Email Authorization Logic', () => {
  it('correctly identifies super-admin accounts', () => {
    expect(isSuperAdminEmail('shivam.strive@gmail.com')).toBe(true);
    expect(isSuperAdminEmail('admin@fiitjee.online')).toBe(true);
    expect(isSuperAdminEmail('corporate@fiitjee.online')).toBe(true);
    expect(isSuperAdminEmail('random.student@gmail.com')).toBe(false);
    expect(isSuperAdminEmail('cand_7052@candidate.fiitjee.online')).toBe(false);
  });

  it('validates official admin emails and excludes candidate domains', () => {
    expect(isValidAdminEmail('fiitjee.bhubaneswar@fiitjee.online')).toBe(true);
    expect(isValidAdminEmail('fiitjee.dwarka@fiitjee.online')).toBe(true);
    expect(isValidAdminEmail('fiitjee.ranchi@fiitjee.online')).toBe(true);
    expect(isValidAdminEmail('fiitjee.hyderabad@fiitjee.online')).toBe(true);
    // Student candidate accounts must NOT pass as admin
    expect(isValidAdminEmail('cand_123456@candidate.fiitjee.online')).toBe(false);
    expect(isValidAdminEmail('student@gmail.com')).toBe(false);
  });

  it('maps centre email to the correct branch profile', () => {
    const bbsr = getCentreByEmail('fiitjee.bhubaneswar@fiitjee.online');
    expect(bbsr?.id).toBe('bhubaneswar');
    expect(bbsr?.name).toBe('Bhubaneswar');

    const dwarka = getCentreByEmail('fiitjee.dwarka@fiitjee.online');
    expect(dwarka?.id).toBe('dwarka');
    expect(dwarka?.name).toBe('Dwarka');

    const ranchi = getCentreByEmail('fiitjee.ranchi@fiitjee.online');
    expect(ranchi?.id).toBe('ranchi');

    const hyd = getCentreByEmail('fiitjee.hyderabad@fiitjee.online');
    expect(hyd?.id).toBe('hyderabad');
  });
});
