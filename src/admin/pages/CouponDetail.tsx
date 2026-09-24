import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Tag, 
  ArrowLeft, 
  Copy, 
  Check, 
  Users, 
  Calendar, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ExternalLink,
  Percent,
  Search
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useCoupons } from '../hooks/useCoupons';
import { CouponRedemption } from '../../types';

export const CouponDetail: React.FC = () => {
  const { couponId } = useParams<{ couponId: string }>();
  const navigate = useNavigate();
  const { centre, user } = useAdminAuth();
  const { coupons, loading, deleteCoupon, toggleCouponActive } = useCoupons(centre?.name, user?.email || undefined);

  const [copiedCode, setCopiedCode] = useState(false);
  const [searchClaimant, setSearchClaimant] = useState('');

  const coupon = coupons.find((c) => c.id === couponId);

  const redemptionsList: CouponRedemption[] = useMemo(() => {
    if (!coupon || !coupon.redemptions) return [];
    return Object.entries(coupon.redemptions).map(([id, val]: [string, any]) => ({
      id,
      ...val
    }));
  }, [coupon]);

  const filteredRedemptions = useMemo(() => {
    if (!searchClaimant.trim()) return redemptionsList;
    const q = searchClaimant.toLowerCase();
    return redemptionsList.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.rollNo.toLowerCase().includes(q)
    );
  }, [redemptionsList, searchClaimant]);

  const totalSaved = useMemo(() => {
    return redemptionsList.reduce((acc, curr) => acc + (curr.amountSaved || 0), 0);
  }, [redemptionsList]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        <div className="w-8 h-8 border-3 border-[#ED1C24] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Loading coupon analytics...</span>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md mx-auto">
        <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-base font-black text-slate-800">Coupon Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">This promotional code could not be retrieved or has been removed.</p>
        <button
          onClick={() => navigate('/admin/coupons')}
          className="mt-4 bg-[#002147] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
        >
          Return to Coupons
        </button>
      </div>
    );
  }

  const used = coupon.usedCount || 0;
  const max = coupon.maxUses || 1;
  const percentUsed = Math.min(100, Math.round((used / max) * 100));
  const isExhausted = used >= max;

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Back and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/coupons')}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            title="Back to coupons"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#ED1C24] uppercase tracking-wider">Coupon Analytics</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-mono text-slate-500">{coupon.centreId} Branch</span>
            </div>
            <h1 className="text-2xl font-black text-[#002147] tracking-tight flex items-center gap-2">
              <span>{coupon.code}</span>
              <button
                onClick={handleCopy}
                className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleCouponActive(coupon.id, coupon.isActive, coupon.code)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              coupon.isActive
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {coupon.isActive ? 'Deactivate Code' : 'Activate Code'}
          </button>

          <button
            onClick={() => {
              if (window.confirm(`Delete coupon ${coupon.code}?`)) {
                deleteCoupon(coupon.id, coupon.code);
                navigate('/admin/coupons');
              }
            }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-slate-200"
            title="Delete coupon"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Claimed Uses</div>
          <div className="text-2xl font-black text-[#002147] mt-1">{used} / {max}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{percentUsed}% capacity reached</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Benefit Type</div>
          <div className="text-sm font-black text-slate-900 mt-2">
            {coupon.discountType === 'full'
              ? '100% Full Waiver'
              : coupon.discountType === 'percent'
              ? `${coupon.discountValue}% Fee Discount`
              : `₹${coupon.discountValue} Flat Deduction`}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Applies at checkout</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Scholarship Value Granted</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹{totalSaved.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Total candidate savings</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Status</div>
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                !coupon.isActive
                  ? 'bg-slate-100 text-slate-500'
                  : isExhausted
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {!coupon.isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{!coupon.isActive ? 'Disabled' : isExhausted ? 'Exhausted' : 'Active'}</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {coupon.validUntil ? `Expires: ${new Date(coupon.validUntil).toLocaleDateString()}` : 'No Expiry Date'}
          </div>
        </div>
      </div>

      {/* Claimants Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-[#002147] tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-[#ED1C24]" />
              <span>Candidates Who Claimed This Voucher ({redemptionsList.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live audit of all candidate registrations that utilized coupon code {coupon.code}.
            </p>
          </div>

          {redemptionsList.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchClaimant}
                onChange={(e) => setSearchClaimant(e.target.value)}
                placeholder="Search candidates..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#ED1C24] outline-none"
              />
            </div>
          )}
        </div>

        {redemptionsList.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">No Claims Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              This coupon has not yet been used by any candidate during Big Bang Edge Test 2026 registration.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Candidate Name</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Candidate Email</th>
                  <th className="py-3 px-4">Date & Time Claimed</th>
                  <th className="py-3 px-4 text-right">Benefit Granted</th>
                  <th className="py-3 px-4 text-right">Hall Ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRedemptions.map((r) => (
                  <tr key={r.id || r.rollNo} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {r.studentName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#002147]">
                      <Link
                        to={`/admin/registrations/${encodeURIComponent(r.rollNo)}`}
                        className="hover:text-[#ED1C24] hover:underline"
                      >
                        {r.rollNo}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {r.email}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(r.claimedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      ₹{(r.amountSaved || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`/hall-ticket/${encodeURIComponent(r.rollNo)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-[#ED1C24] bg-slate-100 px-2 py-1 rounded-md"
                      >
                        <span>Ticket</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
