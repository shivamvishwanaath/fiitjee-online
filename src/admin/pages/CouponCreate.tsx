import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tag, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Calendar, 
  Percent, 
  ShieldCheck, 
  Lock,
  Building2,
  AlertCircle
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useCoupons } from '../hooks/useCoupons';
import { generateCouponCode } from '../utils/couponUtils';
import { CouponProfile } from '../../types';

export const CouponCreate: React.FC = () => {
  const navigate = useNavigate();
  const { centre, user } = useAdminAuth();
  const { createCoupon } = useCoupons(centre?.name, user?.email || undefined);

  const [code, setCode] = useState(() => generateCouponCode(centre?.name ? centre.name.slice(0, 4).toUpperCase() : 'BBET'));
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'full' | 'percent' | 'flat'>('full');
  const [discountValue, setDiscountValue] = useState<number>(100);
  const [usageType, setUsageType] = useState<'single' | 'multi' | 'unlimited'>('single');
  const [maxUses, setMaxUses] = useState<number>(1);
  const [validUntil, setValidUntil] = useState<string>('2026-10-18');
  const [isEmailRestricted, setIsEmailRestricted] = useState(false);
  const [allowedEmailsText, setAllowedEmailsText] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRandomCode = () => {
    const prefix = centre?.name ? centre.name.slice(0, 4).toUpperCase() : 'BBET';
    setCode(generateCouponCode(prefix));
  };

  const handleUsageTypeChange = (type: 'single' | 'multi' | 'unlimited') => {
    setUsageType(type);
    if (type === 'single') setMaxUses(1);
    else if (type === 'multi') setMaxUses(25);
    else setMaxUses(99999);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Please provide a coupon code.');
      return;
    }

    let parsedEmails: string[] = [];
    if (isEmailRestricted && allowedEmailsText.trim()) {
      parsedEmails = allowedEmailsText
        .split(/[\n,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 3 && e.includes('@'));
      if (parsedEmails.length === 0) {
        setError('Please enter at least one valid candidate email address.');
        return;
      }
    }

    setSubmitting(true);
    try {
      await createCoupon({
        code: cleanCode,
        description: description.trim() || undefined,
        centreId: centre?.name || 'ALL',
        discountType,
        discountValue: discountType === 'full' ? 100 : Number(discountValue),
        maxUses: Number(maxUses),
        validFrom: new Date().toISOString(),
        validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
        isActive,
        isEmailRestricted,
        allowedEmails: parsedEmails,
        createdBy: user?.email || 'staff@fiitjee.online'
      });

      navigate('/admin/coupons');
    } catch (err: any) {
      setError(err.message || 'Failed to create coupon code');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/coupons')}
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          title="Back to coupons list"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#002147] tracking-tight">
            Create Promotional Coupon
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue discount or 100% full waiver voucher codes for Big Bang Edge Test 2026.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Fields Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          
          {/* Code */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Coupon Promo Code *
              </label>
              <button
                type="button"
                onClick={handleGenerateRandomCode}
                className="text-xs font-bold text-[#ED1C24] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Generate</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. BBET26-DWRK"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-black tracking-wider uppercase focus:ring-2 focus:ring-[#ED1C24] outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Description / Internal Note
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Science Olympiad School Topper Waiver"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#ED1C24] outline-none"
            />
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Benefit / Discount Type *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setDiscountType('full');
                  setDiscountValue(100);
                }}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  discountType === 'full'
                    ? 'border-2 border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <div>100% Free Waiver</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDiscountType('percent');
                  setDiscountValue(50);
                }}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  discountType === 'percent'
                    ? 'border-2 border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Percent className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <div>Percentage Off</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDiscountType('flat');
                  setDiscountValue(1);
                }}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  discountType === 'flat'
                    ? 'border-2 border-amber-600 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Tag className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                <div>Flat Amount (₹)</div>
              </button>
            </div>
          </div>

          {/* Discount Value (if not full) */}
          {discountType !== 'full' && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                {discountType === 'percent' ? 'Discount Percentage (%) *' : 'Flat Discount Amount (₹) *'}
              </label>
              <input
                type="number"
                min="1"
                max={discountType === 'percent' ? 100 : 1000}
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#ED1C24] outline-none"
              />
            </div>
          )}

          {/* Usage Limit Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Maximum Usage Limit *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleUsageTypeChange('single')}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  usageType === 'single'
                    ? 'border-2 border-[#002147] bg-slate-100 text-[#002147]'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div>Single Use</div>
                <div className="text-[10px] font-normal text-slate-400">1 Student Only</div>
              </button>

              <button
                type="button"
                onClick={() => handleUsageTypeChange('multi')}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  usageType === 'multi'
                    ? 'border-2 border-[#002147] bg-slate-100 text-[#002147]'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div>Multi Use</div>
                <div className="text-[10px] font-normal text-slate-400">Custom Cap (N)</div>
              </button>

              <button
                type="button"
                onClick={() => handleUsageTypeChange('unlimited')}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  usageType === 'unlimited'
                    ? 'border-2 border-[#002147] bg-slate-100 text-[#002147]'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div>Universal</div>
                <div className="text-[10px] font-normal text-slate-400">Unlimited Claims</div>
              </button>
            </div>
          </div>

          {/* Custom Cap input */}
          {usageType === 'multi' && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Maximum Redemptions Cap *
              </label>
              <input
                type="number"
                min="2"
                max="10000"
                required
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#ED1C24] outline-none"
              />
            </div>
          )}

          {/* Expiry Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Valid Until Date
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#ED1C24] outline-none"
            />
          </div>

          {/* Email Restriction Toggle */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isEmailRestricted}
                onChange={(e) => setIsEmailRestricted(e.target.checked)}
                className="w-4 h-4 text-[#ED1C24] rounded border-slate-300 focus:ring-[#ED1C24]"
              />
              <span className="text-xs font-bold text-slate-700">
                Restrict this coupon to specific candidate email addresses only
              </span>
            </label>

            {isEmailRestricted && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Allowed Emails (separated by comma or newline):
                </label>
                <textarea
                  rows={3}
                  value={allowedEmailsText}
                  onChange={(e) => setAllowedEmailsText(e.target.value)}
                  placeholder="student1@gmail.com&#10;student2@yahoo.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#ED1C24] outline-none"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/coupons')}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#ED1C24] hover:bg-[#c9141b] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Generating Coupon...' : 'Create & Activate Coupon'}
            </button>
          </div>
        </form>

        {/* Live Preview Column */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Live Voucher Preview
          </div>

          <div className="bg-gradient-to-br from-[#002147] to-slate-900 text-white p-5 rounded-2xl border-2 border-dashed border-amber-400/50 shadow-lg relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#ED1C24]/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                FIITJEE Spotlight Voucher
              </span>
              <span className="bg-[#ED1C24] text-white px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                {centre?.name || 'CENTRE'}
              </span>
            </div>

            <div className="font-mono text-xl font-black text-amber-300 tracking-widest my-2">
              {code || 'COUPON-CODE'}
            </div>

            <div className="text-xs font-bold text-white mb-3">
              {discountType === 'full'
                ? '100% Full Exam Fee Waiver'
                : discountType === 'percent'
                ? `${discountValue}% Registration Fee Discount`
                : `₹${discountValue} Flat Fee Deduction`}
            </div>

            <div className="text-[11px] text-slate-300 border-t border-slate-700/60 pt-2 space-y-1">
              <div>Capacity: <strong className="text-white">{usageType === 'single' ? 'Single Student' : `${maxUses} Students`}</strong></div>
              <div>Valid until: <strong className="text-white">{validUntil || 'Exam Day'}</strong></div>
              {isEmailRestricted && (
                <div className="text-amber-300 text-[10px] font-semibold">🔒 Whitelisted Emails Only</div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Redemption Logic</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              When a student enters this coupon during registration for Big Bang Edge Test 2026, the fee is adjusted automatically. If 100% waived, payment is bypassed and the Official Hall Ticket is generated immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
