import { describe, it, expect } from 'vitest';
import { 
  assertDeveloper, 
  isDeveloperEmail, 
  DEVELOPER_EMAIL,
  fetchAllRegistrations,
  fetchAllStudents,
  fetchAllCoupons,
  fetchAllSupportTickets,
  fetchSystemDiagnosticStats
} from '../admin/utils/developerUtils';

describe('Developer Utilities & Authorization Guards', () => {
  it('correctly identifies developer email', () => {
    expect(isDeveloperEmail('shivam.strive@gmail.com')).toBe(true);
    expect(isDeveloperEmail('SHIVAM.STRIVE@GMAIL.COM')).toBe(true);
    expect(isDeveloperEmail('admin@fiitjee.online')).toBe(false);
    expect(isDeveloperEmail('student@gmail.com')).toBe(false);
    expect(isDeveloperEmail(null)).toBe(false);
    expect(isDeveloperEmail(undefined)).toBe(false);
  });

  it('allows verified developer without throwing', () => {
    expect(() => assertDeveloper(DEVELOPER_EMAIL)).not.toThrow();
    expect(() => assertDeveloper('shivam.strive@gmail.com')).not.toThrow();
  });

  it('strictly throws unauthorized error for any non-developer account', () => {
    expect(() => assertDeveloper('fiitjee.dwarka@fiitjee.online')).toThrow(/Unauthorized/i);
    expect(() => assertDeveloper('fiitjee.bhubaneswar@fiitjee.online')).toThrow(/Unauthorized/i);
    expect(() => assertDeveloper('other.person@gmail.com')).toThrow(/Unauthorized/i);
    expect(() => assertDeveloper('')).toThrow(/Unauthorized/i);
    expect(() => assertDeveloper(undefined)).toThrow(/Unauthorized/i);
  });

  it('guards all CRUD functions against unauthorized calls', async () => {
    const unauthEmail = 'intruder@example.com';
    await expect(fetchAllRegistrations('big_bang_2026', unauthEmail)).rejects.toThrow(/Unauthorized/i);
    await expect(fetchAllStudents(unauthEmail)).rejects.toThrow(/Unauthorized/i);
    await expect(fetchAllCoupons(unauthEmail)).rejects.toThrow(/Unauthorized/i);
    await expect(fetchAllSupportTickets(unauthEmail)).rejects.toThrow(/Unauthorized/i);
    await expect(fetchSystemDiagnosticStats(unauthEmail)).rejects.toThrow(/Unauthorized/i);
    await expect(import('../admin/utils/developerUtils').then(m => m.deleteExamRegistration({ rollNo: '123456', actorEmail: unauthEmail }))).rejects.toThrow(/Unauthorized/i);
    await expect(import('../admin/utils/developerUtils').then(m => m.purgeCandidateRegistration({ rollNo: '123456', actorEmail: unauthEmail }))).rejects.toThrow(/Unauthorized/i);
    await expect(import('../admin/utils/developerUtils').then(m => m.purgeStudentAccount({ uid: 'uid123', actorEmail: unauthEmail }))).rejects.toThrow(/Unauthorized/i);
  });
});
