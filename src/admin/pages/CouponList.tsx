import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tag, 
  Plus, 
  Copy, 
  Check, 
  Search, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Building2, 
  Sparkles, 
  Percent, 
  AlertCircle
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useCoupons } from '../hooks/useCoupons';
import { CouponProfile } from '../../types';

export const CouponList: React.FC = () => {
  const navigate = useNavigate();
  const { centre, user } = useAdminAuth();
  const { coupons, loading, error, deleteCoupon, toggleCouponActive } = useCoupons(
    centre?.name,
    user?.email || undefined
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'exhausted'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const codeMatch = c.code.toLowerCase().includes(q);
        const descMatch = (c.description || '').toLowerCase().includes(q);
        if (!codeMatch && !descMatch) return false;
      }

      // Status
      const isExhausted = (c.usedCount || 0) >= (c.maxUses || 1);
      if (statusFilter === 'active') {
        if (!c.isActive || isExhausted) return false;
      } else if (statusFilter === 'inactive') {
        if (c.isActive) return false;
      } else if (statusFilter === 'exhausted') {
        if (!isExhausted) return false;
      }

      return true;
    });
  }, [coupons, searchQuery, statusFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalUses = 0;
    let activeCount = 0;
    let fullWaiverCount = 0;

    coupons.forEach((c) => {
      totalUses += c.usedCount || 0;
      if (c.isActive && (c.usedCount || 0) < (c.maxUses || 1)) activeCount++;
      if (c.discountType === 'full') fullWaiverCount++;
    });

    return {
      totalCoupons: coupons.length,
      activeCoupons: activeCount,
      totalRedemptions: totalUses,
      fullWaivers: fullWaiverCount
    };
  }, [coupons]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-red-100 text-[#ED1C24] rounded-lg">
              <Tag className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[#ED1C24] uppercase tracking-wider">Promotions Directorate</span>
          </div>
          <h1 className="text-2xl font-black text-[#002147] tracking-tight">
            Centre Coupon & Voucher Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate single-use or multi-use scholarship promo codes for {centre?.name || 'Authorized'} students.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/coupons/create')}
          className="bg-[#ED1C24] hover:bg-[#c9141b] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Coupon</span>
        </button>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Coupons</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : metrics.totalCoupons}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Configured for this centre</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active & Usable</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{loading ? '...' : metrics.activeCoupons}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ready for student redemption</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Redemptions</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{loading ? '...' : metrics.totalRedemptions}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Claimed during exam registration</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">100% Fee Waivers</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{loading ? '...' : metrics.fullWaivers}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Special scholarship allowances</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by coupon code or note..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#ED1C24] outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['all', 'active', 'inactive', 'exhausted'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === filter
                  ? 'bg-[#002147] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-3 border-[#ED1C24] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <span>Loading coupon catalogue...</span>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">No Coupons Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'No coupon matching your query. Try a different search term.'
                : 'Create your first promotional or fee waiver coupon for candidates.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/admin/coupons/create')}
                className="mt-4 inline-flex items-center gap-1.5 bg-[#ED1C24] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#c9141b] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Coupon Now</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Benefit</th>
                  <th className="py-3 px-4">Usage & Cap</th>
                  <th className="py-3 px-4">Target Audience</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCoupons.map((c) => {
                  const used = c.usedCount || 0;
                  const max = c.maxUses || 1;
                  const percentUsed = Math.min(100, Math.round((used / max) * 100));
                  const isExhausted = used >= max;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-[#002147] bg-slate-100 px-2 py-1 rounded-md border border-slate-200 tracking-wider">
                            {c.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(c.code)}
                            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                            title="Copy code to clipboard"
                          >
                            {copiedCode === c.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {c.description && (
                          <div className="text-[11px] font-sans text-slate-500 mt-1 max-w-xs truncate">
                            {c.description}
                          </div>
                        )}
                      </td>

                      {/* Benefit */}
                      <td className="py-3.5 px-4">
                        {c.discountType === 'full' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-extrabold border border-emerald-200">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>100% Free Waiver</span>
                          </span>
                        ) : c.discountType === 'percent' ? (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-[11px] font-extrabold border border-blue-200">
                            <Percent className="w-3 h-3 text-blue-600" />
                            <span>{c.discountValue}% Off</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full text-[11px] font-extrabold border border-amber-200">
                            <span>₹{c.discountValue} Flat Discount</span>
                          </span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 mb-1">
                          <span>{used} / {max} used</span>
                          <span className="text-slate-400 font-mono text-[10px]">{percentUsed}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isExhausted ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percentUsed}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-4">
                        {c.isEmailRestricted && c.allowedEmails && c.allowedEmails.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                            <Users className="w-3 h-3" />
                            <span>{c.allowedEmails.length} Email Restricted</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">
                            Universal (Any student)
                          </span>
                        )}
                      </td>

                      {/* Validity */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-600 font-mono">
                        {c.validUntil ? (
                          <span>Until {new Date(c.validUntil).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-slate-400">Lifetime</span>
                        )}
                      </td>

                      {/* Active Status Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleCouponActive(c.id, c.isActive, c.code)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            !c.isActive
                              ? 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                              : isExhausted
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          }`}
                        >
                          {!c.isActive ? 'Disabled' : isExhausted ? 'Exhausted' : 'Active'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/admin/coupons/${c.id}`)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-[#002147] text-slate-700 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="View Redemptions & Stats"
                          >
                            <span>Stats</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete coupon ${c.code}?`)) {
                                deleteCoupon(c.id, c.code);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
