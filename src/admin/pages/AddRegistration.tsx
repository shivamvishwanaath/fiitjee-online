import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  Phone, 
  Mail, 
  School,
  Sparkles
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useRegistrations } from '../hooks/useRegistrations';
import { ALL_CENTRES, generateSID, generateInvoiceNumber, getCentreByName } from '../utils/centreUtils';
import { HallTicketModal } from '../../components/HallTicketModal';
import { ExamRegistration } from '../../types';

export const AddRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { centre, user } = useAdminAuth();
  const { addRegistration } = useRegistrations(centre?.name, user?.email || undefined);

  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    currentClass: 'Class X',
    schoolName: '',
    phone: '',
    email: '',
    address: '',
    selectedCenter: centre?.name || 'Bhubaneswar',
    testMode: 'Offline' as 'Offline' | 'Proctored Online',
    testDate: '11th October 2026 (Sunday)',
    status: 'Confirmed' as ExamRegistration['status'],
    paymentMode: 'Free Counter Registration / Scholarship Voucher'
  });

  const [submitting, setSubmitting] = useState(false);
  const [createdReg, setCreatedReg] = useState<ExamRegistration | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedCentreProfile = getCentreByName(formData.selectedCenter);
      const seqSuffix = Date.now().toString().slice(-4);
      const counterId = Math.floor(10 + (Date.now() % 90));
      const generatedRoll = `7052 ${selectedCentreProfile.numericCode}${seqSuffix} 111026 00${counterId}`;
      const sid = generateSID(generatedRoll);
      const invoiceNo = generateInvoiceNumber(selectedCentreProfile, generatedRoll);
      const paymentRef = `${selectedCentreProfile.numericCode}/ADM-${seqSuffix}`;

      const newRecord: ExamRegistration = {
        examId: 'big_bang_2026',
        examYear: '2026',
        studentName: formData.studentName.trim(),
        parentName: formData.parentName.trim(),
        currentClass: formData.currentClass,
        schoolName: formData.schoolName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        selectedCenter: formData.selectedCenter,
        testMode: formData.testMode,
        testDate: formData.testDate,
        registeredAt: new Date().toISOString(),
        rollNo: generatedRoll,
        sid,
        invoiceNo,
        invoiceDate: new Date().toISOString().split('T')[0],
        status: formData.status,
        paymentRef,
        registeredByCentre: `${centre?.name || 'Counter'} Staff (${user?.email || 'Admin'})`
      };

      await addRegistration(newRecord);
      setCreatedReg(newRecord);
    } catch (err) {
      console.error('Registration failed:', err);
      alert('Failed to register student. Please check network connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/registrations')}
            className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#002147] uppercase tracking-tight font-display">
              Walk-in Student Registration
            </h1>
            <p className="text-xs text-slate-500">
              Direct counter enrollment for Big Bang Edge Test 2026 · Auto-generates Hall Ticket & Tax Invoice
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#ED1C24]" />
            <span className="font-bold text-sm text-[#002147] uppercase tracking-wide">Candidate Enrollment Dossier</span>
          </div>
          <span className="text-xs text-slate-400 font-semibold">Operating Centre: <strong className="text-[#002147]">{centre?.name}</strong></span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Student Name */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ARJUN SHARMA"
                value={formData.studentName}
                onChange={(e) => handleInputChange('studentName', e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] uppercase font-bold"
              />
            </div>

            {/* Parent Name */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Parent / Guardian Name *
              </label>
              <input
                type="text"
                required
                placeholder="Father / Mother Name"
                value={formData.parentName}
                onChange={(e) => handleInputChange('parentName', e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] uppercase"
              />
            </div>

            {/* Class */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Current Grade / Class *
              </label>
              <select
                value={formData.currentClass}
                onChange={(e) => handleInputChange('currentClass', e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] bg-white font-bold"
              >
                <option value="Class V">Class V</option>
                <option value="Class VI">Class VI</option>
                <option value="Class VII">Class VII</option>
                <option value="Class VIII">Class VIII</option>
                <option value="Class IX">Class IX</option>
                <option value="Class X">Class X</option>
                <option value="Class XI">Class XI</option>
                <option value="Class XII">Class XII</option>
              </select>
            </div>

            {/* School */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                School Name & City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. D.A.V. Public School, Unit 8"
                value={formData.schoolName}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Mobile Phone (WhatsApp Notifications) *
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] font-mono font-bold"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="candidate@gmail.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] font-mono"
              />
            </div>

            {/* Residential Address (For Tax Invoice & Hall Ticket) */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Full Residential Address (Printed on Tax Invoice & Hall Ticket)
              </label>
              <input
                type="text"
                placeholder="e.g. PLOT NO 139 , JAGANNATH VIHAR, BARMUNDA, BHUBANESWAR, Odisha, 751012"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147]"
              />
            </div>

            {/* Centre Selection */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Examination / Study Centre *
              </label>
              <select
                value={formData.selectedCenter}
                onChange={(e) => handleInputChange('selectedCenter', e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] bg-white font-bold"
              >
                {ALL_CENTRES.map(c => (
                  <option key={c.id} value={c.name}>{c.name} {c.code}</option>
                ))}
              </select>
            </div>

            {/* Mode */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Exam Mode *
              </label>
              <select
                value={formData.testMode}
                onChange={(e) => handleInputChange('testMode', e.target.value as any)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] bg-white font-bold"
              >
                <option value="Offline">Offline Physical Classroom Test</option>
                <option value="Proctored Online">Proctored Online (From Home)</option>
              </select>
            </div>

            {/* Test Date */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Test Slot Date *
              </label>
              <select
                value={formData.testDate}
                onChange={(e) => handleInputChange('testDate', e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] bg-white font-bold text-[#002147]"
              >
                <option value="11th October 2026 (Sunday)">11th October 2026 (Sunday)</option>
                <option value="18th October 2026 (Sunday)">18th October 2026 (Sunday)</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Initial CRM Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as any)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] bg-white font-bold"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/admin/registrations')}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#ED1C24] hover:bg-[#c9141b] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-extrabold flex items-center gap-2 transition-all shadow-md cursor-pointer uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{submitting ? 'Registering Candidate...' : 'Complete Registration & Print Ticket'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Instant Hall Ticket Preview Modal after Submission */}
      {createdReg && (
        <HallTicketModal
          isOpen={!!createdReg}
          onClose={() => {
            setCreatedReg(null);
            navigate('/admin/registrations');
          }}
          registration={createdReg}
        />
      )}
    </div>
  );
};
