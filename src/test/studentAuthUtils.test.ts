import { describe, it, expect } from 'vitest';
import { BIG_BANG_CLASSES, getClassOption } from '../data/examsData';

describe('Phone Number Normalization & Candidate Identity', () => {
  function normalizeIndianPhone(input: string): string {
    const digits = input.replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
  }

  function getCandidateShadowEmail(phone: string): string {
    const cleanPhone = normalizeIndianPhone(phone);
    return `cand_${cleanPhone}@candidate.fiitjee.online`;
  }

  it('normalizes various Indian phone formats to standard 10-digit number', () => {
    const expected = '9876543210';

    expect(normalizeIndianPhone('9876543210')).toBe(expected);
    expect(normalizeIndianPhone('+919876543210')).toBe(expected);
    expect(normalizeIndianPhone('+91 98765 43210')).toBe(expected);
    expect(normalizeIndianPhone('09876543210')).toBe(expected);
    expect(normalizeIndianPhone('+91-98765-43210')).toBe(expected);
    expect(normalizeIndianPhone('919876543210')).toBe(expected);
  });

  it('generates consistent candidate shadow email from any valid phone format', () => {
    const expectedEmail = 'cand_9876543210@candidate.fiitjee.online';

    expect(getCandidateShadowEmail('9876543210')).toBe(expectedEmail);
    expect(getCandidateShadowEmail('+91 9876543210')).toBe(expectedEmail);
    expect(getCandidateShadowEmail('+919876543210')).toBe(expectedEmail);
    expect(getCandidateShadowEmail('09876543210')).toBe(expectedEmail);
  });
});

describe('BIG_BANG_CLASSES and Grade Mapping', () => {
  it('correctly maps 7 class options with their respective codes', () => {
    expect(BIG_BANG_CLASSES).toHaveLength(7);

    expect(BIG_BANG_CLASSES[0].label).toBe('05th. Going to 06th.');
    expect(BIG_BANG_CLASSES[0].code).toBe('6052');

    expect(BIG_BANG_CLASSES[1].label).toBe('06th. Going to 07th.');
    expect(BIG_BANG_CLASSES[1].code).toBe('7052');

    expect(BIG_BANG_CLASSES[2].label).toBe('07th. Going to 08th.');
    expect(BIG_BANG_CLASSES[2].code).toBe('8052');

    expect(BIG_BANG_CLASSES[3].label).toBe('08th. Going to 09th.');
    expect(BIG_BANG_CLASSES[3].code).toBe('9052');

    expect(BIG_BANG_CLASSES[4].label).toBe('09th. Going to 10th.');
    expect(BIG_BANG_CLASSES[4].code).toBe('1052');

    expect(BIG_BANG_CLASSES[5].label).toBe('10th. Going to 11th.');
    expect(BIG_BANG_CLASSES[5].code).toBe('1152');

    expect(BIG_BANG_CLASSES[6].label).toBe('11th. Going to 12th.');
    expect(BIG_BANG_CLASSES[6].code).toBe('1252');
  });

  it('getClassOption correctly matches by code, label, or grade', () => {
    expect(getClassOption('6052').label).toBe('05th. Going to 06th.');
    expect(getClassOption('1152').label).toBe('10th. Going to 11th.');
    expect(getClassOption('Class VI').label).toBe('06th. Going to 07th.');
    expect(getClassOption('Class XI').label).toBe('11th. Going to 12th.');
    // Backward compatibility for legacy inputs with 4-digit code
    expect(getClassOption('05th. Going to 06th. - 6052').label).toBe('05th. Going to 06th.');
  });
});
