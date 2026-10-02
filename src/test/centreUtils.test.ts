import { describe, it, expect } from 'vitest';
import { 
  isSuperAdminEmail, 
  isDeveloperEmail,
  isValidAdminEmail, 
  getCentreByEmail,
  CENTRES_CONFIG,
  resolveCanonicalCentreId,
  isCentreMatch,
  BIG_BANG_CLASSES,
  getExamCodeForClass
} from '../admin/utils/centreUtils';

describe('Admin Centre and Email Authorization Logic', () => {
  it('correctly identifies developer account as exclusive super-admin with cross-centre access', () => {
    expect(isSuperAdminEmail('shivam.strive@gmail.com')).toBe(true);
    expect(isDeveloperEmail('shivam.strive@gmail.com')).toBe(true);
    // Regular admin and corporate emails are centre-isolated, not super-admin
    expect(isSuperAdminEmail('admin@fiitjee.online')).toBe(false);
    expect(isSuperAdminEmail('corporate@fiitjee.online')).toBe(false);
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

  it('resolves canonical centre IDs consistently regardless of casing or formatting', () => {
    expect(resolveCanonicalCentreId('Hyderabad (Madhapur)')).toBe('hyderabad');
    expect(resolveCanonicalCentreId('hyderabad')).toBe('hyderabad');
    expect(resolveCanonicalCentreId('Hyderabad')).toBe('hyderabad');
    expect(resolveCanonicalCentreId('Madhapur')).toBe('hyderabad');
    expect(resolveCanonicalCentreId('Dwarka')).toBe('dwarka');
    expect(resolveCanonicalCentreId('dwarka')).toBe('dwarka');
    expect(resolveCanonicalCentreId('Ranchi')).toBe('ranchi');
    expect(resolveCanonicalCentreId('Ranchi-Lalpur')).toBe('ranchi');
    expect(resolveCanonicalCentreId('Bhubaneswar')).toBe('bhubaneswar');
    expect(resolveCanonicalCentreId('ALL')).toBe('all');
    expect(resolveCanonicalCentreId('All Centres')).toBe('all');
  });

  it('accurately verifies centre matching for coupons', () => {
    // Hyderabad matches
    expect(isCentreMatch('Hyderabad (Madhapur)', 'hyderabad')).toBe(true);
    expect(isCentreMatch('hyderabad', 'Hyderabad (Madhapur)')).toBe(true);
    expect(isCentreMatch('Hyderabad', 'Hyderabad')).toBe(true);

    // Cross-centre mismatches
    expect(isCentreMatch('Bhubaneswar', 'hyderabad')).toBe(false);
    expect(isCentreMatch('Dwarka', 'ranchi')).toBe(false);

    // Global / All coupons match anything
    expect(isCentreMatch('ALL', 'hyderabad')).toBe(true);
    expect(isCentreMatch('all', 'bhubaneswar')).toBe(true);
    expect(isCentreMatch(undefined, 'dwarka')).toBe(true);
  });

  it('correctly maps the official Big Bang Edge Test classes and codes', () => {
    expect(BIG_BANG_CLASSES).toHaveLength(7);
    expect(BIG_BANG_CLASSES.map(c => c.label)).toEqual([
      '05th. Going to 06th.',
      '06th. Going to 07th.',
      '07th. Going to 08th.',
      '08th. Going to 09th.',
      '09th. Going to 10th.',
      '10th. Going to 11th.',
      '11th. Going to 12th.',
    ]);

    expect(getExamCodeForClass('05th. Going to 06th.')).toBe('6052');
    expect(getExamCodeForClass('06th. Going to 07th.')).toBe('7052');
    expect(getExamCodeForClass('07th. Going to 08th.')).toBe('8052');
    expect(getExamCodeForClass('08th. Going to 09th.')).toBe('9052');
    expect(getExamCodeForClass('09th. Going to 10th.')).toBe('1052');
    expect(getExamCodeForClass('10th. Going to 11th.')).toBe('1152');
    expect(getExamCodeForClass('11th. Going to 12th.')).toBe('1252');

    // Backward compatibility for legacy inputs with 4-digit code
    expect(getExamCodeForClass('05th. Going to 06th. - 6052')).toBe('6052');
    expect(getExamCodeForClass('10th. Going to 11th. - 1152')).toBe('1152');

    // Backward compatibility for legacy inputs
    expect(getExamCodeForClass('Class V')).toBe('6052');
    expect(getExamCodeForClass('Class VI')).toBe('7052');
    expect(getExamCodeForClass('Class VII')).toBe('8052');
    expect(getExamCodeForClass('Class VIII')).toBe('9052');
    expect(getExamCodeForClass('Class IX')).toBe('1052');
    expect(getExamCodeForClass('Class X')).toBe('1152');
    expect(getExamCodeForClass('Class XI')).toBe('1252');
  });
});
