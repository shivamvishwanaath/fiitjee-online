import { describe, it, expect } from 'vitest';
import { calculateExamFeeForClass, CentreExamConfig } from '../admin/utils/examUtils';

describe('Exam Fee Calculation Engine', () => {
  const sampleConfig: CentreExamConfig = {
    id: 'test-exam',
    centreId: 'bhubaneswar',
    name: 'Big Bang Edge Test 2026',
    fullBrandedName: 'FIITJEE Big Bang Edge Test 2026',
    tagline: 'Some choices are obvious.',
    description: 'Test description',
    year: '2026',
    registrationOpen: true,
    targetClasses: ['Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI'],
    testDates: ['11th October 2026 (Sunday)'],
    modes: ['Offline'],
    venues: [],
    classFees: {
      'Class V': 200,
      'Class VI': 200,
      'Class VII': 200,
      'Class VIII': 200,
      'Class IX': 250,
      'Class X': 250,
      'Class XI': 250
    },
    defaultFee: 250,
    paymentModes: ['Online']
  };

  it('calculates junior class fees accurately (Class V - VIII -> ₹200)', () => {
    expect(calculateExamFeeForClass(sampleConfig, 'Class V')).toBe(200);
    expect(calculateExamFeeForClass(sampleConfig, 'Class VI')).toBe(200);
    expect(calculateExamFeeForClass(sampleConfig, 'Class VII')).toBe(200);
    expect(calculateExamFeeForClass(sampleConfig, 'Class VIII')).toBe(200);
  });

  it('calculates senior class fees accurately (Class IX - XI -> ₹250)', () => {
    expect(calculateExamFeeForClass(sampleConfig, 'Class IX')).toBe(250);
    expect(calculateExamFeeForClass(sampleConfig, 'Class X')).toBe(250);
    expect(calculateExamFeeForClass(sampleConfig, 'Class XI')).toBe(250);
  });

  it('handles bare roman numeral class inputs cleanly', () => {
    expect(calculateExamFeeForClass(sampleConfig, 'X')).toBe(250);
    expect(calculateExamFeeForClass(sampleConfig, 'V')).toBe(200);
  });

  it('falls back to default fee of 250 when config is null', () => {
    expect(calculateExamFeeForClass(null, 'Class X')).toBe(250);
    expect(calculateExamFeeForClass(null, undefined)).toBe(250);
  });
});
