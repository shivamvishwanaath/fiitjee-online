import { describe, it, expect } from 'vitest';
import { evaluateCouponRules, generateCouponCode } from '../admin/utils/couponUtils';
import { CouponProfile } from '../types';

describe('Coupon Validation & Centre Isolation Engine', () => {
  const baseCoupon: CouponProfile = {
    id: 'test-coupon-1',
    code: 'BHUB-BB26-EXAM',
    centreId: 'Bhubaneswar',
    discountType: 'full',
    discountValue: 100,
    maxUses: 10,
    usedCount: 0,
    isActive: true,
    isEmailRestricted: false,
    createdBy: 'admin@fiitjee.online',
    createdAt: new Date().toISOString()
  };

  it('generates coupon codes matching standard pattern', () => {
    const code = generateCouponCode('BBET26');
    expect(code).toMatch(/^BBET26-[A-Z0-9]{4}$/);
  });

  it('accepts valid coupon for the matching centre', () => {
    const res = evaluateCouponRules(baseCoupon, 'rahul@gmail.com', 250, 'bhubaneswar');
    expect(res.valid).toBe(true);
    expect(res.discountAmount).toBe(250);
    expect(res.finalAmount).toBe(0);
  });

  it('strictly blocks cross-centre coupon redemption', () => {
    // Bhubaneswar coupon applied for Dwarka registration
    const res = evaluateCouponRules(baseCoupon, 'rahul@gmail.com', 250, 'dwarka');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('exclusive to FIITJEE Bhubaneswar Centre');
  });

  it('rejects deactivated coupons', () => {
    const inactive = { ...baseCoupon, isActive: false };
    const res = evaluateCouponRules(inactive, 'rahul@gmail.com', 250, 'bhubaneswar');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('deactivated');
  });

  it('rejects expired coupons', () => {
    const expired = { ...baseCoupon, validUntil: '2020-01-01T00:00:00.000Z' };
    const res = evaluateCouponRules(expired, 'rahul@gmail.com', 250, 'bhubaneswar');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('expired');
  });

  it('rejects coupons that reached max usage limit', () => {
    const exhausted = { ...baseCoupon, maxUses: 5, usedCount: 5 };
    const res = evaluateCouponRules(exhausted, 'rahul@gmail.com', 250, 'bhubaneswar');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('maximum usage limit');
  });

  it('enforces email restriction when isEmailRestricted is true', () => {
    const restricted = {
      ...baseCoupon,
      isEmailRestricted: true,
      allowedEmails: ['vip.candidate@gmail.com']
    };
    const denied = evaluateCouponRules(restricted, 'other@gmail.com', 250, 'bhubaneswar');
    expect(denied.valid).toBe(false);

    const allowed = evaluateCouponRules(restricted, 'vip.candidate@gmail.com', 250, 'bhubaneswar');
    expect(allowed.valid).toBe(true);
  });

  it('prevents duplicate redemption by the same email', () => {
    const alreadyUsed = {
      ...baseCoupon,
      redemptions: {
        red1: {
          email: 'rahul@gmail.com',
          studentName: 'Rahul',
          rollNo: '12345',
          claimedAt: new Date().toISOString(),
          amountSaved: 250
        }
      }
    };
    const res = evaluateCouponRules(alreadyUsed, 'rahul@gmail.com', 250, 'bhubaneswar');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('already redeemed');
  });

  it('allows Hyderabad coupon BBE-HYD-SNR for Hyderabad centre registrations seamlessly', () => {
    const hyderabadCoupon: CouponProfile = {
      ...baseCoupon,
      code: 'BBE-HYD-SNR',
      centreId: 'Hyderabad (Madhapur)'
    };

    // When student registration passes 'hyderabad'
    const res1 = evaluateCouponRules(hyderabadCoupon, 'student@gmail.com', 200, 'hyderabad');
    expect(res1.valid).toBe(true);
    expect(res1.discountAmount).toBe(200);
    expect(res1.finalAmount).toBe(0);

    // When student registration passes 'Hyderabad (Madhapur)'
    const res2 = evaluateCouponRules(hyderabadCoupon, 'student@gmail.com', 200, 'Hyderabad (Madhapur)');
    expect(res2.valid).toBe(true);

    // When student registration passes 'Hyderabad'
    const res3 = evaluateCouponRules(hyderabadCoupon, 'student@gmail.com', 200, 'Hyderabad');
    expect(res3.valid).toBe(true);
  });

  it('allows global / all-centres coupons to be redeemed anywhere', () => {
    const globalCoupon: CouponProfile = {
      ...baseCoupon,
      code: 'GLOBAL-WAIVER',
      centreId: 'ALL'
    };

    const resBhub = evaluateCouponRules(globalCoupon, 'student@gmail.com', 200, 'bhubaneswar');
    expect(resBhub.valid).toBe(true);

    const resHyd = evaluateCouponRules(globalCoupon, 'student@gmail.com', 200, 'hyderabad');
    expect(resHyd.valid).toBe(true);
  });
});
