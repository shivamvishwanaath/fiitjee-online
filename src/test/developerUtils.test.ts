import { describe, it, expect } from 'vitest';
import { 
  assertDeveloper, 
  isDeveloperEmail, 
  DEVELOPER_EMAIL 
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
});
