import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FolderArchive,
  Mail,
  Send,
  Contact,
  Clock,
  Sparkles,
  Search,
  Trash2,
  ExternalLink,
  Plus,
  Calendar,
  Users,
  Building2,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useCRMContacts } from '../hooks/useCRMContacts';
import { useRegistrations } from '../hooks/useRegistrations';
import { CRMSubNav } from '../components/CRMSubNav';

export const CRMCampaigns: React.FC = () => {
  const navigate = useNavigate();
  const { centre, user } = useAdminAuth();
  const { campaigns, loadingCampaigns, deleteCampaign } = useCRMContacts(
    centre?.name,
    user?.email || undefined
  );
  const { registrations } = useRegistrations(centre?.name, user?.email || undefined);

  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Registrations and campaigns are strictly scoped to current centre by hooks
  const scopedRegistrations = registrations;

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const q = searchQuery.toLowerCase();
    return campaigns.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q) ||
        c.body?.toLowerCase().includes(q)
    );
  }, [campaigns, searchQuery]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete campaign "${title}"?`)) return;
    setDeletingId(id);
    try {
      await deleteCampaign(id);
    } catch (err) {
      alert('Failed to delete campaign. Check console for details.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <CRMSubNav
        title="Saved Outreach Campaigns"
        subtitle={`Broadcast history and message drafts for ${centre?.name || 'All'} Centre.`}
        icon={FolderArchive}
        candidateCount={scopedRegistrations.length}
        campaignsCount={campaigns.length}
        actions={
          <button
            onClick={() => navigate('/admin/crm/compose')}
            className="px-4 py-2 bg-[#ED1C24] hover:bg-[#c9141b] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Outreach Campaign</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns by title, subject or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#ED1C24] transition-all"
          />
        </div>
        <div className="text-xs font-bold text-slate-500">
          Showing {filteredCampaigns.length} of {campaigns.length} campaigns
        </div>
      </div>

      {/* Campaigns Grid / List */}
      {loadingCampaigns ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <div className="w-8 h-8 border-3 border-[#ED1C24] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500">Loading campaigns...</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">No campaigns found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'No campaigns match your search criteria.'
                : 'You have not saved any outreach campaigns yet. Draft an outreach message from the Compose tab.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/crm/compose')}
            className="px-4 py-2 bg-[#ED1C24] hover:bg-[#c9141b] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose New Outreach</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-50 text-[#ED1C24] border border-red-100">
                      <Mail className="w-3 h-3" />
                      <span>{camp.channel || 'Email'}</span>
                    </span>
                    <h3 className="text-sm font-bold text-[#002147] line-clamp-1">{camp.title}</h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                      camp.status === 'sent'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {camp.status || 'Draft'}
                  </span>
                </div>

                {/* Subject line */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</div>
                  <p className="text-xs font-semibold text-slate-700 line-clamp-2">{camp.subject}</p>
                </div>

                {/* Body Snippet */}
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-sans">
                  {camp.body}
                </p>
              </div>

              {/* Metadata & Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{camp.audienceCount ?? 0} Recipients</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{camp.centreId || 'All Centres'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {camp.createdAt ? new Date(camp.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown Date'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => navigate('/admin/crm/compose')}
                    className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3 h-3 text-[#ED1C24]" />
                    <span>Use in Compose</span>
                  </button>
                  <button
                    onClick={() => handleDelete(camp.id, camp.title)}
                    disabled={deletingId === camp.id}
                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all cursor-pointer"
                    title="Delete campaign"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CRMCampaigns;