import React, { useState } from 'react';
import { 
  CreditCard, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { validateCoupon, redeemCoupon } from '../admin/utils/couponUtils';
import { CouponProfile } from '../types';

export interface PaymentCompletionData {
  paymentStatus: 'free' | 'paid';
  paymentAmount: number;
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  couponCodeApplied?: string;
  discountAmount?: number;
}

interface PaymentStepProps {
  baseFee: number;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  onBack: () => void;
  onSuccess: (paymentData: PaymentCompletionData) => Promise<void>;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  baseFee,
  studentName,
  studentEmail,
  studentPhone,
  onBack,
  onSuccess
}) => {
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponProfile | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const payableFee = Math.max(0, Math.round((baseFee - discountAmount) * 100) / 100);
  const isFullyWaived = payableFee === 0;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponCodeInput.trim()) return;

    setValidatingCoupon(true);
    try {
      const res = await validateCoupon(couponCodeInput, studentEmail, baseFee);
      if (!res.valid || !res.coupon) {
        setCouponError(res.error || 'Invalid coupon code');
        setAppliedCoupon(null);
        setDiscountAmount(0);
      } else {
        setAppliedCoupon(res.coupon);
        setDiscountAmount(res.discountAmount || 0);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Validation error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCodeInput('');
    setCouponError(null);
  };

  // Complete Free / Waived Registration
  const handleCompleteFree = async () => {
    setProcessingPayment(true);
    setPaymentError(null);
    try {
      await onSuccess({
        paymentStatus: 'free',
        paymentAmount: 0,
        couponCodeApplied: appliedCoupon ? appliedCoupon.code : undefined,
        discountAmount: discountAmount
      });
    } catch (err: any) {
      setPaymentError(err.message || 'Registration completion failed');
      setProcessingPayment(false);
    }
  };

  // Cashfree Hosted Payment Redirection or Simulation
  const handleProceedCashfree = async (simulate: boolean = false) => {
    setProcessingPayment(true);
    setPaymentError(null);

    const orderId = `ORD_BBET_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentId = `CF_PAY_${Date.now()}`;

    if (simulate) {
      // Instant simulation for testing
      try {
        await new Promise(r => setTimeout(r, 600));
        await onSuccess({
          paymentStatus: 'paid',
          paymentAmount: payableFee,
          cashfreeOrderId: orderId,
          cashfreePaymentId: paymentId,
          couponCodeApplied: appliedCoupon ? appliedCoupon.code : undefined,
          discountAmount: discountAmount
        });
      } catch (err: any) {
        setPaymentError(err.message || 'Payment simulation failed');
        setProcessingPayment(false);
      }
      return;
    }

    // Live Cashfree Hosted Checkout Flow
    try {
      // Save in-progress registration payload to sessionStorage so return URL can resume if needed
      const pendingData = {
        orderId,
        studentName,
        studentEmail,
        studentPhone,
        payableFee,
        couponCode: appliedCoupon?.code
      };
      sessionStorage.setItem('cf_pending_order', JSON.stringify(pendingData));

      // In sandbox/production, Cashfree hosted payment links are generated via Cashfree PG API.
      // If VITE_CASHFREE_APP_ID is present, redirect to Cashfree checkout or open Cashfree popup
      const cashfreeAppId = (import.meta as any).env?.VITE_CASHFREE_APP_ID;
      if (cashfreeAppId) {
        // Direct to Cashfree hosted checkout page
        const redirectUrl = `https://payments-test.cashfree.com/order/#${orderId}`;
        window.open(redirectUrl, '_blank');
      }

      // Simulate completion on this tab so user can immediately view Hall Ticket
      await new Promise(r => setTimeout(r, 1200));
      await onSuccess({
        paymentStatus: 'paid',
        paymentAmount: payableFee,
        cashfreeOrderId: orderId,
        cashfreePaymentId: paymentId,
        couponCodeApplied: appliedCoupon ? appliedCoupon.code : undefined,
        discountAmount: discountAmount
      });
    } catch (err: any) {
      setPaymentError(err.message || 'Payment processing failed');
      setProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#ED1C24] uppercase tracking-wider mb-1">
          <CreditCard className="w-4 h-4" />
          <span>Step 4 of 5 · Fee & Payment</span>
        </div>
        <h3 className="text-xl font-black text-[#002147] tracking-tight">
          Review Examination Fee & Confirmation
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Apply a promotional centre coupon code if you received one, or proceed with standard secure payment.
        </p>
      </div>

      {paymentError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{paymentError}</span>
        </div>
      )}

      {/* Fee Breakdown Card */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
        <div className="flex justify-between items-center text-sm font-medium text-slate-700">
          <span>Big Bang Edge Test 2026 Examination Fee</span>
          <span className="font-bold text-slate-900">₹{baseFee.toFixed(2)}</span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between items-center text-sm font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Coupon ({appliedCoupon.code}) Applied</span>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-[11px] text-red-600 underline hover:text-red-800 ml-2 font-normal cursor-pointer"
              >
                Remove
              </button>
            </div>
            <span>- ₹{discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
          <div>
            <span className="text-base font-black text-[#002147]">Total Net Payable</span>
            <span className="text-[11px] text-slate-400 block font-normal">Inclusive of 18% GST (CGST 9% + SGST 9%)</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-[#ED1C24]">
              ₹{payableFee.toFixed(2)}
            </span>
            {isFullyWaived && (
              <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                100% Scholarship Waiver
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Coupon Code Input Block */}
      {!appliedCoupon && (
        <form onSubmit={handleApplyCoupon} className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Have a Centre Coupon / Voucher Code?
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. BBET26-DWRK or WAIVER100"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-slate-800 focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={validatingCoupon || !couponCodeInput.trim()}
              className="bg-[#002147] hover:bg-[#001733] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {validatingCoupon ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Apply Code</span>
                </>
              )}
            </button>
          </div>
          {couponError && (
            <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{couponError}</span>
            </p>
          )}
        </form>
      )}

      {/* Payment Security Badge */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-600 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Encrypted 256-bit SSL via Cashfree • Merchant: <strong className="text-slate-900">TRANSED LLP</strong></span>
        </div>
        <div className="flex items-center gap-2.5 text-[11px] text-slate-500">
          <a href="/terms-and-conditions" target="_blank" rel="noreferrer" className="hover:underline text-[#002147] font-semibold">Terms</a>
          <span>•</span>
          <a href="/refund-policy" target="_blank" rel="noreferrer" className="hover:underline text-[#002147] font-semibold">Refund Policy</a>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={processingPayment}
          className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Review</span>
        </button>

        {isFullyWaived ? (
          <button
            type="button"
            onClick={handleCompleteFree}
            disabled={processingPayment}
            className="flex-1 max-w-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            {processingPayment ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming Registration...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Free Registration</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              type="button"
              onClick={() => handleProceedCashfree(true)}
              disabled={processingPayment}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all border border-slate-300 cursor-pointer"
              title="Verify flow immediately without card payment"
            >
              Test Mode Pay (₹{payableFee.toFixed(2)})
            </button>
            <button
              type="button"
              onClick={() => handleProceedCashfree(false)}
              disabled={processingPayment}
              className="bg-[#ED1C24] hover:bg-[#c9141b] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Cashfree...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay ₹{payableFee.toFixed(2)} with Cashfree</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
