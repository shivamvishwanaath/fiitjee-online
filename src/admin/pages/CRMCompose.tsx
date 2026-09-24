import React, { useState, useMemo, useEffect } from 'react';
import { NavLink, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Send, 
  Copy, 
  Check, 
  Users, 
  Sparkles, 
  Building2,
  FileText,
  Phone,
  Contact,
  Clock,
  FolderArchive,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useRegistrations } from '../hooks/useRegistrations';
import { useCRMContacts } from '../hooks/useCRMContacts';
import { CRMSubNav } from '../components/CRMSubNav';
import { ALL_CENTRES, getCentreByName } from '../utils/centreUtils';

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const CRM_TEMPLATES: Template[] = [
  {
    id: 'hall-ticket-ready',
    name: '🔔 Official Hall Ticket Available for Download',
    subject: 'FIITJEE Big Bang Edge Test 2026 — Your Official Hall Ticket & Tax Invoice is Ready',
    body: `Dear {{studentName}},

Greetings from FIITJEE {{centreName}} Centre.

Your registration for the BIG BANG EDGE TEST 2026 has been successfully confirmed.

Important Examination Particulars:
• Roll Number: {{rollNo}}
• Test Date: {{testDate}}
• Reporting Time: 45 Minutes Before Examination (08:15 AM)
• Examination Mode: {{testMode}}
• Test Centre: {{centreAddress}}

Please ensure you carry a printed copy of your Official Hall Ticket along with an authorized school ID card to your examination center.

For any queries, please reach out to the FIITJEE {{centreName}} helpline at {{centrePhone}}.

Best regards,
Center Admissions Directorate
FIITJEE {{centreName}}`
  },
  {
    id: 'omr-guidelines',
    name: '📝 Important OMR Bubbling & Examination Instructions',
    subject: 'FIITJEE Big Bang Edge Test 2026 — OMR Marking Instructions & Timetable',
    body: `Dear {{studentName}},

To ensure your examination paper is graded with complete accuracy, please review the following mandatory OMR instructions:

1. Use only HB pencils / dark blue / black ballpoint pens to darken OMR bubbles completely.
2. Multiple bubbling or faint marks will lead to invalid question evaluation.
3. Keep your Official Hall Ticket safe for verification by room invigilators.
4. Mobile phones, programmable calculators, and slide rules are strictly prohibited in the test hall.

We wish you the very best for your scholastic evaluation!

Warm regards,
Academic Examination Committee
FIITJEE {{centreName}} Centre`
  },
  {
    id: 'exam-eve',
    name: '⏰ Exam Eve Final Checklist & Reporting Reminder',
    subject: 'REMINDER: FIITJEE Big Bang Edge Test is Tomorrow! Final Checklist',
    body: `Dear {{studentName}},

This is a final reminder that your BIG BANG EDGE TEST 2026 is scheduled for tomorrow: {{testDate}}.

Reporting Checklist:
[✔] Printed A4 Official Hall Ticket
[✔] Valid Student ID or Aadhar Card
[✔] 2 HB Pencils, Eraser & Sharpener
[✔] Arrive by 08:15 AM (45 minutes before commencement)

Centre Address:
{{centreAddress}}

Helpline: {{centrePhone}}

Good luck! Stand out and claim your academic excellence scholarship.

Directorate of Admissions
TRANSED LLP (FIITJEE Admissions)`
  }
];

export const CRMCompose: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { centre, user } = useAdminAuth();
  const { registrations, loading } = useRegistrations(centre?.name, user?.email || undefined);
  const { saveCampaign } = useCRMContacts(centre?.name, user?.email || undefined);

  const directEmail = searchParams.get('email');

  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedTestDate, setSelectedTestDate] = useState<string>('All');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('hall-ticket-ready');
  
  const [customSubject, setCustomSubject] = useState(CRM_TEMPLATES[0].subject);
  const [customBody, setCustomBody] = useState(CRM_TEMPLATES[0].body);

  const [campaignTitle, setCampaignTitle] = useState('');
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [copiedEmails, setCopiedEmails] = useState(false);
  const [copiedPhones, setCopiedPhones] = useState(false);

  // Recipient list based on filter
  const recipients = useMemo(() => {
    if (directEmail) {
      return registrations.filter(r => (r.email || '').toLowerCase() === directEmail.toLowerCase());
    }

    return registrations.filter(r => {
      if (selectedStatus !== 'All' && (r.status || 'New') !== selectedStatus) {
        return false;
      }
      if (selectedTestDate !== 'All' && r.testDate !== selectedTestDate) {
        return false;
      }
      return true;
    });
  }, [registrations, selectedStatus, selectedTestDate, directEmail]);

  // Handle template switch
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = CRM_TEMPLATES.find(t => t.id === templateId);
    if (tmpl) {
      setCustomSubject(tmpl.subject);
      setCustomBody(tmpl.body);
    }
  };

  // Sample recipient for live preview
  const previewCandidate = recipients[0] || (registrations[0] ? registrations[0] : null);

  // Rendered subject and body
  const { renderedSubject, renderedBody } = useMemo(() => {
    const activeCentre = previewCandidate?.selectedCenter 
      ? getCentreByName(previewCandidate.selectedCenter) 
      : (centre || ALL_CENTRES[0]);

    const vars: Record<string, string> = {
      '{{studentName}}': previewCandidate ? previewCandidate.studentName : '[Student Name]',
      '{{rollNo}}': previewCandidate ? previewCandidate.rollNo : '[Roll Number]',
      '{{testDate}}': previewCandidate ? previewCandidate.testDate : '11th October 2026',
      '{{testMode}}': previewCandidate ? previewCandidate.testMode : 'Offline',
      '{{centreName}}': activeCentre?.name || 'FIITJEE Centre',
      '{{centreAddress}}': activeCentre?.address || 'FIITJEE Admissions Centre',
      '{{centrePhone}}': activeCentre?.phoneNumbers?.[0] || activeCentre?.helplinePhone || '85272 08022'
    };

    let s = customSubject;
    let b = customBody;

    Object.entries(vars).forEach(([k, v]) => {
      s = s.replace(new RegExp(k, 'g'), v);
      b = b.replace(new RegExp(k, 'g'), v);
    });

    return { renderedSubject: s, renderedBody: b };
  }, [customSubject, customBody, previewCandidate, centre]);

  // Copy email list
  const handleCopyEmails = () => {
    const list = recipients.map(r => r.email).filter(Boolean).join(', ');
    navigator.clipboard.writeText(list);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2000);
  };

  // Copy phone list
  const handleCopyPhones = () => {
    const list = recipients.map(r => r.phone?.replace(/\D/g, '')).filter(Boolean).join(', ');
    navigator.clipboard.writeText(list);
    setCopiedPhones(true);
    setTimeout(() => setCopiedPhones(false), 2000);
  };

  // Launch Desktop mail client with BCC
  const handleLaunchMailClient = () => {
    const bccList = recipients.map(r => r.email).filter(Boolean).slice(0, 80).join(',');
    const mailto = `mailto:?bcc=${encodeURIComponent(bccList)}&subject=${encodeURIComponent(customSubject)}&body=${encodeURIComponent(customBody)}`;
    window.location.href = mailto;
  };

  // Save campaign draft
  const handleSaveCampaignDraft = async () => {
    if (!campaignTitle.trim()) {
      alert('Please enter a campaign title before saving.');
      return;
    }
    setSavingCampaign(true);
    try {
      await saveCampaign({
        centreId: centre?.name || 'All',
        title: campaignTitle.trim(),
        channel: 'email',
        subject: customSubject,
        body: customBody,
        audienceCount: recipients.length,
        status: 'draft',
        createdBy: user?.email || 'staff@fiitjee.online'
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Save campaign error:', err);
    } finally {
      setSavingCampaign(false);
    }
  };

  const insertVariable = (placeholder: string) => {
    setCustomBody(prev => `${prev} ${placeholder}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      <CRMSubNav
        title="Compose Outreach & Email Broadcast"
        subtitle={`Dispatch official notifications to registered students of ${centre?.name || 'All'} Centre.`}
        icon={Send}
        candidateCount={registrations.length}
      />

      {/* Main Composer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Audience & Templates (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Audience Filter Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#ED1C24]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Target Candidate Segment
                </h3>
              </div>
              <span className="bg-red-50 text-[#ED1C24] border border-red-200 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                {recipients.length} Selected
              </span>
            </div>

            {directEmail ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex justify-between items-center">
                <span>Single Recipient: <strong>{directEmail}</strong></span>
                <button
                  onClick={() => navigate('/admin/crm/compose')}
                  className="text-xs underline font-bold text-blue-700 cursor-pointer"
                >
                  Clear Single
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Status Stage
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#ED1C24] outline-none"
                    >
                      <option value="All">All Stages</option>
                      <option value="New">New Leads</option>
                      <option value="Contacted">In Contact</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Selected">Selected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Exam Date
                    </label>
                    <select
                      value={selectedTestDate}
                      onChange={(e) => setSelectedTestDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#ED1C24] outline-none"
                    >
                      <option value="All">All Dates</option>
                      <option value="11th October 2026 (Sunday)">11th Oct 2026</option>
                      <option value="18th October 2026 (Sunday)">18th Oct 2026</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Copy Helpers */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPhones}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Copy phone numbers"
              >
                {copiedPhones ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Phone className="w-3.5 h-3.5" />}
                <span>{copiedPhones ? 'Phones Copied!' : 'Copy Phones'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyEmails}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Copy email addresses"
              >
                {copiedEmails ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Mail className="w-3.5 h-3.5" />}
                <span>{copiedEmails ? 'Emails Copied!' : 'Copy Emails'}</span>
              </button>
            </div>
          </div>

          {/* Template Selector Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
              <FileText className="w-4 h-4 text-[#ED1C24]" />
              <span>Official FIITJEE Templates</span>
            </div>

            <div className="space-y-2">
              {CRM_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl.id)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex flex-col gap-0.5 ${
                    selectedTemplateId === tmpl.id
                      ? 'border-2 border-[#ED1C24] bg-red-50 text-[#ED1C24]'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>{tmpl.name}</div>
                  <div className="text-[10px] font-normal text-slate-500 truncate">{tmpl.subject}</div>
                </button>
              ))}
            </div>

            {/* Merge Placeholder Variables */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Insert Merge Tags (click to append)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['{{studentName}}', '{{rollNo}}', '{{testDate}}', '{{testMode}}', '{{centreName}}', '{{centrePhone}}'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertVariable(tag)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono font-bold px-2 py-1 rounded-md border border-slate-200 cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Message Composer & Live Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Subject and Body Editor */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Subject Line *
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#ED1C24] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Message Body *
              </label>
              <textarea
                rows={10}
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:ring-2 focus:ring-[#ED1C24] outline-none leading-relaxed"
              />
            </div>

            {/* Campaign Saver Row */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="Campaign Title (e.g. Oct 11 Admit Card Release)"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#002147]"
                />
                <button
                  type="button"
                  onClick={handleSaveCampaignDraft}
                  disabled={savingCampaign}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 border border-slate-200"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingCampaign ? 'Saving...' : 'Save Draft'}</span>
                </button>
              </div>

              {savedSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </span>
              )}
            </div>

            {/* Primary Action: Launch Desktop Client */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleLaunchMailClient}
                disabled={recipients.length === 0}
                className="bg-[#ED1C24] hover:bg-[#c9141b] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Launch Email Client (BCC {recipients.length} Candidates)</span>
              </button>
            </div>
          </div>

          {/* Live Dynamic Preview Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
              <div className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Merged Preview Sample</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Simulated for: {previewCandidate ? previewCandidate.studentName : 'Demo Candidate'}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 font-mono">
              <div className="text-slate-500 text-[11px] border-b border-slate-200 pb-1.5">
                <strong>Subject:</strong> <span className="text-slate-900 font-bold">{renderedSubject}</span>
              </div>
              <div className="text-slate-700 whitespace-pre-wrap font-sans text-xs leading-relaxed">
                {renderedBody}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMCompose;

