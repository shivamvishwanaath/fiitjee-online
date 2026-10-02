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
  Sparkles,
  Lock,
  CreditCard
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { firebaseConfig, db } from '../../firebase';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useRegistrations } from '../hooks/useRegistrations';
import { ALL_CENTRES, generateSID, generateInvoiceNumber, getCentreByName, generateRollNumber, getRegistrationFeeForClass, BIG_BANG_CLASSES, getClassOption } from '../utils/centreUtils';
import { HallTicketModal } from '../../components/HallTicketModal';
import { ExamRegistration } from '../../types';

export const AddRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { centre, user, canSwitchCentres } = useAdminAuth();
  const { addRegistration, registrations } = useRegistrations(centre?.name, user?.email || undefined);

  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    currentClass: BIG_BANG_CLASSES[5].label,
    schoolName: '',
    phone: '',
    email: '',
    address: '',
    selectedCenter: centre?.name || 'Bhubaneswar',
    testCentreCode: '820',
    testMode: 'Offline' as 'Offline' | 'Proctored Online',
    testDate: '11th October 2026 (Sunday)',
    status: 'Confirmed' as ExamRegistration['status'],
    paymentAmount: getRegistrationFeeForClass(BIG_BANG_CLASSES[5].label),
    paymentMode: 'Cash (Counter)',
    paymentStatus: 'paid' as 'paid' | 'pending' | 'free',
    paymentRef: ''
  });

  React.useEffect(() => {
    if (centre?.name && !canSwitchCentres) {
      setFormData(prev => ({ ...prev, selectedCenter: centre.name }));
    }
  }, [centre?.name, canSwitchCentres]);

  const [submitting, setSubmitting] = useState(false);
  const [createdReg, setCreatedReg] = useState<ExamRegistration | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClassChange = (newClass: string) => {
    const standardFee = getRegistrationFeeForClass(newClass);
    setFormData(prev => ({
      ...prev,
      currentClass: newClass,
      paymentAmount: standardFee
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedCentreProfile = getCentreByName(formData.selectedCenter);
      const effectiveTestCentreCode = (selectedCentreProfile.id === 'ranchi' && formData.testCentreCode) 
        ? formData.testCentreCode 
        : selectedCentreProfile.testCentreCode;

      const seqSuffix = Date.now().toString().slice(-4);
      let candidateSeq = registrations && registrations.length > 0 ? (registrations.length + 1) : 1;
      let generatedRoll = generateRollNumber(selectedCentreProfile, formData.testDate, candidateSeq, effectiveTestCentreCode, formData.currentClass);
      const existingRolls = new Set(registrations.map(r => r.rollNo));
      while (existingRolls.has(generatedRoll)) {
        candidateSeq++;
        generatedRoll = generateRollNumber(selectedCentreProfile, formData.testDate, candidateSeq, effectiveTestCentreCode, formData.currentClass);
      }
      const sid = generateSID(generatedRoll);
      const invoiceNo = generateInvoiceNumber(selectedCentreProfile, generatedRoll);
      const autoPaymentRef = `${selectedCentreProfile.numericCode}/ADM-${seqSuffix}`;

      // Automatically register student user in Auth and create student profile in database
      let studentUid = '';
      const cleanEmail = formData.email.trim();
      if (cleanEmail) {
        try {
          const secondaryApp = getApps().find(a => a.name === 'SecondaryStudentRegistrar') 
            || initializeApp(firebaseConfig, 'SecondaryStudentRegistrar');
          const secondaryAuth = getAuth(secondaryApp);
          const tempPassword = 'Fiitjee@2026';
          try {
            const userCred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, tempPassword);
            studentUid = userCred.user.uid;
            await signOut(secondaryAuth);
          } catch (authErr: any) {
            // Already registered or exists
            console.log('Student account registration notice:', authErr.code);
          }
        } catch (e) {
          console.warn('Could not initialize secondary auth:', e);
        }

        if (studentUid) {
          try {
            await set(ref(db, `students/${studentUid}`), {
              uid: studentUid,
              fullName: formData.studentName.trim(),
              parentName: formData.parentName.trim(),
              email: cleanEmail,
              phone: formData.phone.trim(),
              currentClass: formData.currentClass,
              schoolName: formData.schoolName.trim(),
              city: selectedCentreProfile.name,
              preferredCentreId: selectedCentreProfile.id,
              profileStatus: 'Not yet updated. Please logon to www.fiitjee.online and update your user profile',
              registeredBy: 'Admin Counter',
              registeredByCentre: centre?.name || selectedCentreProfile.name,
              registeredByEmail: user?.email || 'admin',
              createdAt: new Date().toISOString()
            });
            await set(ref(db, `student_centre_index/${selectedCentreProfile.id}/${studentUid}`), true);
          } catch (rtdbErr) {
            console.error('Error recording student record:', rtdbErr);
          }
        }
      }

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
        paymentStatus: formData.paymentStatus,
        paymentAmount: Number(formData.paymentAmount),
        paymentMode: formData.paymentMode,
        paymentRef: formData.paymentRef.trim() || autoPaymentRef,
        profileStatus: 'Not yet updated. Please logon to www.fiitjee.online and update your user profile',
        studentUid: studentUid || undefined,
        registeredByAdmin: true,
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
                value={getClassOption(formData.currentClass).label}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] bg-white font-bold"
              >
                {BIG_BANG_CLASSES.map((cls) => (
                  <option key={cls.code} value={cls.label}>
                    {cls.label}
                  </option>
                ))}
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
              {canSwitchCentres ? (
                <select
                  value={formData.selectedCenter}
                  onChange={(e) => handleInputChange('selectedCenter', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] bg-white font-bold"
                >
                  {ALL_CENTRES.map(c => (
                    <option key={c.id} value={c.name}>{c.name} {c.code}</option>
                  ))}
                </select>
              ) : (
                <div className="w-full p-2.5 border border-slate-200 bg-slate-100 rounded-lg flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#ED1C24]" />
                    <span>FIITJEE {centre?.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">{centre?.code}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 select-none">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Locked to Branch</span>
                  </div>
                </div>
              )}
            </div>

            {/* Ranchi Test Centre Venue Selection */}
            {formData.selectedCenter.toLowerCase().includes('ranchi') && (
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Ranchi Test Centre Venue *
                </label>
                <select
                  value={formData.testCentreCode}
                  onChange={(e) => handleInputChange('testCentreCode', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] bg-white font-bold"
                >
                  <option value="820">820 - Ranchi- FIITJEE, Hariom Tower, Lalpur - 834001</option>
                  <option value="850">850 - Ranchi- FIITJEE, Samraddhi Complex, Doranda - 834002</option>
                </select>
              </div>
            )}

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

            {/* --- Fee Collection & Counter Payment Section --- */}
            <div className="sm:col-span-2 pt-4 border-t border-slate-200 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                  <CreditCard className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Fee Collection & Counter Payment Details</h4>
                  <p className="text-[10px] text-slate-500">Record amount taken and payment instrument at registration</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Amount Collected */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Amount Taken (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="10"
                      value={formData.paymentAmount}
                      onChange={(e) => handleInputChange('paymentAmount', Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] font-mono font-bold text-xs"
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 block">
                    Standard fee for {formData.currentClass}: ₹{getRegistrationFeeForClass(formData.currentClass)}
                  </span>
                </div>

                {/* Mode of Payment */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Mode of Payment *
                  </label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => handleInputChange('paymentMode', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] bg-white font-bold text-xs"
                  >
                    <option value="Cash (Counter)">Cash (Counter)</option>
                    <option value="UPI / QR Code (Counter)">UPI / QR Code (Counter)</option>
                    <option value="Debit / Credit Card (POS Swipe)">Debit / Credit Card (POS Swipe)</option>
                    <option value="Net Banking / NEFT">Net Banking / NEFT</option>
                    <option value="Cheque / Demand Draft">Cheque / Demand Draft</option>
                    <option value="Scholarship / Concession Voucher (Free)">Scholarship / Concession Voucher (Free)</option>
                  </select>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Payment Status *
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => handleInputChange('paymentStatus', e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] bg-white font-bold text-xs"
                  >
                    <option value="paid">Paid (Confirmed)</option>
                    <option value="free">100% Scholarship / Free Voucher</option>
                    <option value="pending">Pending Counter Collection</option>
                  </select>
                </div>

                {/* Counter Receipt / Transaction Reference */}
                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Counter Receipt No. / Transaction Ref ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. REC-2026-0042 / UPI Transaction ID / Bank Scroll Ref"
                    value={formData.paymentRef}
                    onChange={(e) => handleInputChange('paymentRef', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] font-mono text-xs"
                  />
                </div>
              </div>
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
