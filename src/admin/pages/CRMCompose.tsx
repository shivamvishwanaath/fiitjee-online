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
  AlertCircle,
  Server,
  Key,
  X,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck
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

For any queries, please reach out to the FIITJEE {{centreName}} desk at {{centrePhone}}.

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
[✔] Arrive by 09:15 AM (45 minutes before commencement)

Centre Address:
{{centreAddress}}

Contact Desk: {{centrePhone}}

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

  // Direct Email Outreach State
  const [customPassword, setCustomPassword] = useState(() => {
    return localStorage.getItem(`fiitjee_smtp_pass_${centre?.id || 'default'}`) || '';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [sendResults, setSendResults] = useState<{
    sentCount: number;
    failedCount: number;
    totalCount: number;
    results: Array<{ email: string; studentName?: string; success: boolean; error?: string }>;
  } | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Test email state
  const [testTargetEmail, setTestTargetEmail] = useState(user?.email || 'shivam.strive@gmail.com');
  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

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

  const handleSavePassword = (newPass: string) => {
    setCustomPassword(newPass);
    if (centre?.id) {
      localStorage.setItem(`fiitjee_smtp_pass_${centre.id}`, newPass);
    }
  };

  // Direct In-App Outreach Dispatch via Serverbyt SMTP
  const handleDirectDispatch = async () => {
    if (recipients.length === 0) return;
    setSendingCampaign(true);
    setShowConfirmModal(false);
    setSendError(null);
    setSendResults(null);

    const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const senderEmail = user?.email || centre?.email || 'fiitjee.bhubaneswar@fiitjee.online';
    const senderName = `FIITJEE ${centre?.name || 'Admissions'} Centre`;

    try {
      const payload = {
        senderEmail,
        senderName,
        replyTo: senderEmail,
        recipients: recipients.map(r => ({
          studentName: r.studentName,
          email: r.email,
          rollNo: r.rollNo,
          testDate: r.testDate,
          testMode: r.testMode,
          currentClass: r.currentClass,
          selectedCenter: r.selectedCenter
        })),
        subject: customSubject,
        bodyTemplate: customBody,
        customPassword: customPassword.trim() || undefined,
        centreInfo: {
          name: centre?.name || 'Admissions Centre',
          address: centre?.address || '',
          phone: centre?.phoneNumbers?.[0] || centre?.helplinePhone || ''
        }
      };

      const res = await fetch(`${API_BASE_URL}/api/send-crm-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch email campaign');
      }

      setSendResults(data);

      // Record in CRM campaign history
      await saveCampaign({
        centreId: centre?.name || 'All',
        title: campaignTitle.trim() || `${centre?.name || 'Centre'} Broadcast — ${new Date().toLocaleDateString()}`,
        channel: 'email',
        subject: customSubject,
        body: customBody,
        audienceCount: data.sentCount,
        status: 'sent',
        createdBy: user?.email || 'staff@fiitjee.online'
      });
    } catch (err: any) {
      console.error('Dispatch error:', err);
      setSendError(err.message || 'Error occurred while sending outreach emails');
    } finally {
      setSendingCampaign(false);
    }
  };

  // Test Email Handler
  const handleSendTestEmail = async () => {
    const target = (testTargetEmail || user?.email || 'shivam.strive@gmail.com').trim();
    if (!target) return;

    setSendingTest(true);
    setTestSuccess(null);
    setTestError(null);

    const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const senderEmail = user?.email || centre?.email || 'fiitjee.bhubaneswar@fiitjee.online';
    const senderName = `FIITJEE ${centre?.name || 'Admissions'} Centre`;

    try {
      const payload = {
        senderEmail,
        senderName,
        customPassword: customPassword.trim() || undefined,
        targetEmail: target
      };

      const res = await fetch(`${API_BASE_URL}/api/test-crm-smtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'SMTP verification failed');
      }

      setTestSuccess(`Verification email delivered to ${target}!`);
      setTimeout(() => setTestSuccess(null), 5000);
    } catch (err: any) {
      setTestError(err.message || 'Failed to connect to SMTP server');
    } finally {
      setSendingTest(false);
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

      {/* Active Mailbox & Sender Information Banner */}
      <div className="bg-[#002147] text-white p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-900/60 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-xs">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-mono font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Serverbyt SMTP Connected &bull; Port 465 (SSL)
              </span>
              <span className="text-[10px] text-slate-300 font-mono">
                Host: smtp.fiitjee.online
              </span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1">
              Dispatched From: <span className="font-mono text-amber-300 bg-white/10 px-2 py-0.5 rounded">{user?.email || centre?.email || 'fiitjee.bhubaneswar@fiitjee.online'}</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Direct student replies route automatically to your centre's official mailbox.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="flex-1 md:flex-none px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer"
            title="Configure mailbox password or test connection"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Mailbox Settings</span>
          </button>
        </div>
      </div>

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

            {/* Action Buttons Row */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={sendingTest}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 border border-slate-200"
                  title={`Send a test email to ${user?.email || 'shivam.strive@gmail.com'}`}
                >
                  {sendingTest ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-600" />
                  ) : (
                    <Mail className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  <span>{sendingTest ? 'Sending Test...' : 'Send Test Preview to Me'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLaunchMailClient}
                  disabled={recipients.length === 0}
                  className="px-3 py-2.5 text-slate-500 hover:text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Fallback to desktop email client (BCC)"
                >
                  <Send className="w-3 h-3 text-slate-400" />
                  <span>Mailto Fallback</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={recipients.length === 0 || sendingCampaign}
                className="bg-[#ED1C24] hover:bg-[#c9141b] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer tracking-wide"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch Campaign ({recipients.length} Candidates)</span>
              </button>
            </div>

            {/* Test Email Alert Notification */}
            {testSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{testSuccess}</span>
              </div>
            )}
            {testError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{testError}</span>
              </div>
            )}
            {sendError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{sendError}</span>
              </div>
            )}
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#ED1C24] flex items-center justify-center font-bold">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Confirm Outreach Broadcast</h3>
                  <p className="text-xs text-slate-500">Live Serverbyt SMTP Dispatch</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">From / Reply-To:</span>
                  <span className="text-slate-900 font-bold">{user?.email || centre?.email || 'fiitjee.bhubaneswar@fiitjee.online'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipients Count:</span>
                  <span className="text-[#ED1C24] font-black font-sans text-sm">{recipients.length} Candidates</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Segment:</span>
                  <span className="text-slate-700">{selectedStatus} Status &bull; {selectedTestDate} Test</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Outgoing Host:</span>
                  <span className="text-emerald-700 font-semibold">smtp.fiitjee.online:465 (SSL)</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">
                  Emails will be dynamically rendered for each candidate with their individual name, roll number, test date, and centre details. This action will dispatch live emails immediately.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDirectDispatch}
                className="px-5 py-2.5 bg-[#ED1C24] hover:bg-[#c9141b] text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Confirm & Dispatch ({recipients.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sending Progress Modal */}
      {sendingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#ED1C24] mx-auto flex items-center justify-center animate-pulse">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Broadcasting Campaign...</h3>
              <p className="text-xs text-slate-500 mt-1">
                Transmitting emails via Serverbyt SMTP to {recipients.length} registered students. Please do not close this window.
              </p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#ED1C24] h-full w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Campaign Results Modal */}
      {sendResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Campaign Dispatch Report</h3>
                  <p className="text-xs text-slate-500">Live Serverbyt SMTP Delivery Summary</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSendResults(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center py-2">
              <div className="bg-emerald-50 border border-emerald-200/60 p-2.5 rounded-xl">
                <div className="text-base font-black text-emerald-700">{sendResults.sentCount}</div>
                <div className="text-[10px] font-bold uppercase text-emerald-800">Delivered</div>
              </div>
              <div className="bg-red-50 border border-red-200/60 p-2.5 rounded-xl">
                <div className="text-base font-black text-red-700">{sendResults.failedCount}</div>
                <div className="text-[10px] font-bold uppercase text-red-800">Failed</div>
              </div>
              <div className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl">
                <div className="text-base font-black text-slate-700">{sendResults.totalCount}</div>
                <div className="text-[10px] font-bold uppercase text-slate-600">Total</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[300px] space-y-1.5 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
              {sendResults.results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/70 text-xs font-mono"
                >
                  <div className="truncate max-w-[280px]">
                    <div className="font-bold text-slate-800 font-sans text-xs truncate">
                      {r.studentName || 'Candidate'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{r.email}</div>
                  </div>
                  <div>
                    {r.success ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px] flex items-center gap-1 font-sans">
                        <Check className="w-3 h-3" /> Sent
                      </span>
                    ) : (
                      <span
                        className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-semibold text-[10px] flex items-center gap-1 font-sans cursor-help"
                        title={r.error}
                      >
                        <AlertCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSendResults(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mailbox Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#002147] flex items-center justify-center font-bold">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Centre Mailbox Settings</h3>
                  <p className="text-xs text-slate-500">Configure Serverbyt / StackMail Credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">SMTP Host:</span>
                  <span className="font-bold text-slate-800">smtp.fiitjee.online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Port / Security:</span>
                  <span className="font-bold text-emerald-700">465 (SSL Encrypted)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Centre Account:</span>
                  <span className="font-bold text-slate-800">{user?.email || centre?.email || 'fiitjee.bhubaneswar@fiitjee.online'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mailbox Password (Overrides Server Default)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={customPassword}
                    onChange={(e) => handleSavePassword(e.target.value)}
                    placeholder="Enter Serverbyt mailbox password..."
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-[#002147] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Stored securely in your local browser session. Default for Dwarka is configured. If your centre password was changed in Serverbyt/StackCP, update it here.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Test Connection & Send Verification Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testTargetEmail}
                    onChange={(e) => setTestTargetEmail(e.target.value)}
                    placeholder="Recipient email address..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:ring-1 focus:ring-[#002147]"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={sendingTest}
                    className="px-4 py-2 bg-[#002147] hover:bg-slate-900 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {sendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Test Mail</span>
                  </button>
                </div>

                {testSuccess && (
                  <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{testSuccess}</span>
                  </div>
                )}
                {testError && (
                  <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px] font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{testError}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMCompose;

