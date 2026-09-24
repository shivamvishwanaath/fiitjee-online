import { ref, get, push, set, update } from 'firebase/database';
import { db } from '../../firebase';
import { CouponProfile, CouponRedemption } from '../../types';

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  coupon?: CouponProfile;
  discountAmount?: number;
  finalAmount?: number;
}

/**
 * Generate a standard FIITJEE promotional coupon code
 * e.g. BBET26-DWRK-8921 or BBET26-7842
 */
export function generateCouponCode(prefix: string = 'BBET26'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix.toUpperCase()}-${rand}`;
}

/**
 * Validate a coupon code against Firebase Realtime Database
 */
export async function validateCoupon(
  rawCode: string,
  studentEmail: string,
  currentFee: number
): Promise<CouponValidationResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, error: 'Please enter a coupon code' };
  }

  try {
    const couponsRef = ref(db, 'coupons');
    const snapshot = await get(couponsRef);

    if (!snapshot.exists()) {
      return { valid: false, error: 'Invalid coupon code. No active promotional codes found.' };
    }

    const allCoupons = snapshot.val();
    let matchedCoupon: CouponProfile | null = null;
    let matchedPath: string = '';

    for (const [key, val] of Object.entries(allCoupons)) {
      if (!val || typeof val !== 'object') continue;
      // Direct coupon
      if ((val as any).code && (val as any).code.trim().toUpperCase() === code) {
        matchedCoupon = { id: key, ...(val as any) };
        matchedPath = `coupons/${key}`;
        break;
      }
      // Sub-node per centre
      for (const [subKey, subVal] of Object.entries(val as object)) {
        const c = subVal as any;
        if (c && c.code && c.code.trim().toUpperCase() === code) {
          matchedCoupon = { id: subKey, ...c };
          matchedPath = `coupons/${key}/${subKey}`;
          break;
        }
      }
      if (matchedCoupon) break;
    }

    if (!matchedCoupon) {
      return { valid: false, error: `Coupon "${code}" is invalid or does not exist.` };
    }

    // Attach discovered path to coupon object for seamless redemption
    (matchedCoupon as any)._dbPath = matchedPath;

    // Check if active
    if (matchedCoupon.isActive === false) {
      return { valid: false, error: 'This coupon code has been deactivated.' };
    }

    // Check validity dates
    const now = new Date();
    if (matchedCoupon.validFrom && new Date(matchedCoupon.validFrom) > now) {
      return { valid: false, error: 'This coupon is not active yet.' };
    }
    if (matchedCoupon.validUntil && new Date(matchedCoupon.validUntil) < now) {
      return { valid: false, error: 'This coupon code has expired.' };
    }

    // Check usage limits
    const maxUses = matchedCoupon.maxUses || 1;
    const usedCount = matchedCoupon.usedCount || 0;
    if (usedCount >= maxUses) {
      return { valid: false, error: 'This coupon code has reached its maximum usage limit.' };
    }

    // Check email restriction
    const cleanEmail = (studentEmail || '').trim().toLowerCase();
    if (matchedCoupon.isEmailRestricted && matchedCoupon.allowedEmails && matchedCoupon.allowedEmails.length > 0) {
      const allowed = matchedCoupon.allowedEmails.map(e => e.trim().toLowerCase());
      if (!cleanEmail || !allowed.includes(cleanEmail)) {
        return { 
          valid: false, 
          error: `This coupon is restricted to pre-authorized candidate email IDs only.` 
        };
      }
    }

    // Check if student already redeemed this code
    if (cleanEmail && matchedCoupon.redemptions) {
      const alreadyRedeemed = Object.values(matchedCoupon.redemptions).some(
        r => (r.email || '').trim().toLowerCase() === cleanEmail
      );
      if (alreadyRedeemed) {
        return { valid: false, error: 'You have already redeemed this coupon code.' };
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (matchedCoupon.discountType === 'full') {
      discountAmount = currentFee;
    } else if (matchedCoupon.discountType === 'percent') {
      discountAmount = (currentFee * (matchedCoupon.discountValue || 100)) / 100;
    } else if (matchedCoupon.discountType === 'flat') {
      discountAmount = Math.min(currentFee, matchedCoupon.discountValue || currentFee);
    }

    // Keep 2 decimals
    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalAmount = Math.max(0, Math.round((currentFee - discountAmount) * 100) / 100);

    return {
      valid: true,
      coupon: matchedCoupon,
      discountAmount,
      finalAmount
    };
  } catch (err: any) {
    console.error('Coupon validation error:', err);
    return { valid: false, error: err.message || 'Failed to validate coupon code' };
  }
}

/**
 * Record a coupon redemption in Firebase RTDB and increment usedCount
 */
export async function redeemCoupon(
  couponIdOrPath: string,
  redemption: Omit<CouponRedemption, 'id'>,
  centreId?: string
): Promise<void> {
  try {
    const fullPath = couponIdOrPath.startsWith('coupons/')
      ? couponIdOrPath
      : centreId
      ? `coupons/${centreId}/${couponIdOrPath}`
      : `coupons/${couponIdOrPath}`;
    const couponRef = ref(db, fullPath);
    const snapshot = await get(couponRef);
    if (!snapshot.exists()) return;

    const couponData = snapshot.val();
    const newUsedCount = (couponData.usedCount || 0) + 1;

    // Push new redemption
    const redemptionsRef = ref(db, `${fullPath}/redemptions`);
    const newRedemptionRef = push(redemptionsRef);
    await set(newRedemptionRef, redemption);

    // Update used count
    await update(couponRef, {
      usedCount: newUsedCount
    });
  } catch (err) {
    console.error('Error redeeming coupon:', err);
    throw err;
  }
}
