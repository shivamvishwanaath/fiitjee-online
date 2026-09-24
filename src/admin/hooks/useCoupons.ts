import { useState, useEffect } from 'react';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { db } from '../../firebase';
import { CouponProfile } from '../../types';
import { logActivity } from '../utils/logActivity';
import { getCentreIdByName } from '../utils/centreUtils';

export function useCoupons(centreName?: string, actorEmail?: string) {
  const [coupons, setCoupons] = useState<CouponProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const centreId = centreName ? getCentreIdByName(centreName) : null;

  useEffect(() => {
    if (!centreId) {
      setCoupons([]);
      setLoading(false);
      return;
    }

    const couponsRef = ref(db, `coupons/${centreId}`);
    const unsubscribe = onValue(
      couponsRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list: CouponProfile[] = Object.entries(data)
              .filter(([key, val]) => key !== '_init' && val && typeof val === 'object' && (val as any).code)
              .map(([key, val]: [string, any]) => ({
                id: key,
                ...val,
                code: val.code || '',
                usedCount: val.usedCount || 0,
                maxUses: val.maxUses || 1,
                isActive: val.isActive !== false
              }));

            // Sort newest first
            list.sort((a, b) => {
              const timeA = new Date(a.createdAt || 0).getTime();
              const timeB = new Date(b.createdAt || 0).getTime();
              return timeB - timeA;
            });

            setCoupons(list);
          } else {
            setCoupons([]);
          }
          setLoading(false);
        } catch (err: any) {
          console.error('Error parsing coupons:', err);
          setError(err.message || 'Failed to load coupons');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Firebase coupons onValue error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [centreId]);

  const createCoupon = async (
    data: Omit<CouponProfile, 'id' | 'usedCount' | 'createdAt'>
  ): Promise<string> => {
    if (!centreId) throw new Error('No centre authenticated');
    try {
      const couponsRef = ref(db, `coupons/${centreId}`);
      const newRef = push(couponsRef);
      const newId = newRef.key || `COUPON_${Date.now()}`;

      const payload: CouponProfile = {
        id: newId,
        ...data,
        centreId: centreName || 'System',
        usedCount: 0,
        createdAt: new Date().toISOString()
      };

      await set(newRef, payload);

      await logActivity({
        actorEmail: actorEmail || 'staff@fiitjee.online',
        actorCentre: centreName || 'System',
        action: 'CREATE_COUPON',
        targetRollNo: data.code,
        details: `Created coupon ${data.code} (${data.discountType}, max ${data.maxUses} uses)`
      });

      return newId;
    } catch (err) {
      console.error('Error creating coupon:', err);
      throw err;
    }
  };

  const updateCoupon = async (id: string, updates: Partial<CouponProfile>): Promise<void> => {
    if (!centreId) throw new Error('No centre authenticated');
    try {
      const couponRef = ref(db, `coupons/${centreId}/${id}`);
      await update(couponRef, updates);

      await logActivity({
        actorEmail: actorEmail || 'staff@fiitjee.online',
        actorCentre: centreName || 'System',
        action: 'UPDATE_COUPON',
        targetRollNo: updates.code || id,
        details: `Updated coupon parameters for ${id}`
      });
    } catch (err) {
      console.error('Error updating coupon:', err);
      throw err;
    }
  };

  const deleteCoupon = async (id: string, code: string): Promise<void> => {
    if (!centreId) throw new Error('No centre authenticated');
    try {
      const couponRef = ref(db, `coupons/${centreId}/${id}`);
      await remove(couponRef);

      await logActivity({
        actorEmail: actorEmail || 'staff@fiitjee.online',
        actorCentre: centreName || 'System',
        action: 'DELETE_COUPON',
        targetRollNo: code,
        details: `Deleted coupon ${code}`
      });
    } catch (err) {
      console.error('Error deleting coupon:', err);
      throw err;
    }
  };

  const toggleCouponActive = async (id: string, currentStatus: boolean, code: string): Promise<void> => {
    if (!centreId) throw new Error('No centre authenticated');
    try {
      const couponRef = ref(db, `coupons/${centreId}/${id}`);
      await update(couponRef, { isActive: !currentStatus });

      await logActivity({
        actorEmail: actorEmail || 'staff@fiitjee.online',
        actorCentre: centreName || 'System',
        action: !currentStatus ? 'ACTIVATE_COUPON' : 'DEACTIVATE_COUPON',
        targetRollNo: code,
        details: `${!currentStatus ? 'Activated' : 'Deactivated'} coupon ${code}`
      });
    } catch (err) {
      console.error('Error toggling coupon status:', err);
      throw err;
    }
  };

  return {
    coupons,
    loading,
    error,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponActive
  };
}

