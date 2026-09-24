import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Printer, 
  Download, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  School,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FiitjeeLogo } from './FiitjeeLogo';

interface FtreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProgramId?: string;
}

export const FtreRegistrationModal: React.FC<FtreRegistrationModalProps> = ({
  isOpen,
  onClose,
  preselectedProgramId
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    currentClass: 'Class 10',
    schoolName: '',
    phone: '',
    email: '',
    city: 'New Delhi',
    testDate: '14th September 2026',
    testMode: 'Offline CBT Center',
    centerName: 'FIITJEE South Delhi (Kalu Sarai)',
    couponCode: 'FIITJEE2026'
  });

  const [generatedAdmitCard, setGeneratedAdmitCard] = useState<{
    rollNo: string;
    registrationNo: string;
    reportingTime: string;
    examSlots: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Generate Admit Card
      const rollNumber = `FTRE-${formData.currentClass.replace(/\D/g, '') || '10'}-${Math.floor(100000 + Math.random() * 900000)}`;
      const regNumber = `REG-${Math.floor(10000000 + Math.random() * 90000000)}`;
      
      setGeneratedAdmitCard({
        rollNo: rollNumber,
        registrationNo: regNumber,
        reportingTime: '08:15 AM IST',
        examSlots: 'Paper 1 (Aptitude): 09:00 AM - 12:00 PM | Paper 2 (PCM): 01:30 PM - 04:30 PM'
      });

      setStep(4);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6">
        
        {/* Modal Header */}
        <div className="bg-[#002147] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#ED1C24]">
          <div className="flex items-center gap-3">
            <FiitjeeLogo variant="white" size="sm" showTagline={false} />
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">Official Examination Portal</div>
              <h2 className="text-lg font-extrabold font-display">
                {step === 4 ? 'Official FTRE 2026-27 Admit Card' : 'FIITJEE Talent Reward Exam (FTRE) Registration'}
              </h2>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step Progress Indicator (Steps 1-3) */}
        {step < 4 && (
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#ED1C24]' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-[#ED1C24] text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
              <span>Student Details</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#ED1C24]' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? 'bg-[#ED1C24] text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
              <span>Test Slot & Center</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#ED1C24]' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 3 ? 'bg-[#ED1C24] text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
              <span>Confirm & Generate</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          
          {/* STEP 1: Student Information */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student's Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryan Sharma"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Present Class *</label>
                  <select
                    value={formData.currentClass}
                    onChange={(e) => setFormData({ ...formData, currentClass: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24]"
                  >
                    <option value="Class 5">Class V (Going to VI)</option>
                    <option value="Class 6">Class VI (Going to VII)</option>
                    <option value="Class 7">Class VII (Going to VIII)</option>
                    <option value="Class 8">Class VIII (Going to IX - SUPREME)</option>
                    <option value="Class 9">Class IX (Going to X - ASCENT)</option>
                    <option value="Class 10">Class X (Going to XI - PINNACLE)</option>
                    <option value="Class 11">Class XI (Going to XII)</option>
                    <option value="Class 12">Class XII Pass / Dropper</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Present School Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DPS R.K. Puram"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (For Admit Card SMS) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>Continue to Test Slot Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Exam Slot & Center */}
          {step === 2 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select FTRE Exam Date *</label>
                <div className="grid grid-cols-2 gap-3">
                  {['14th September 2026 (Slot 1)', '28th September 2026 (Slot 2)'].map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setFormData({ ...formData, testDate: date })}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        formData.testDate === date
                          ? 'border-2 border-[#ED1C24] bg-red-50 text-[#ED1C24]'
                          : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Calendar className="w-4 h-4 mb-1" />
                      <div>{date}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exam Mode *</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Offline CBT Center', 'Online Proctored at Home'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFormData({ ...formData, testMode: mode })}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        formData.testMode === mode
                          ? 'border-2 border-[#ED1C24] bg-red-50 text-[#ED1C24]'
                          : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div>{mode}</div>
                      <div className="text-[10px] font-normal text-slate-500">
                        {mode.includes('Offline') ? 'At official FIITJEE Computer Labs' : 'Take from home with webcam'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Examination Center / City *</label>
                <select
                  value={formData.centerName}
                  onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24]"
                >
                  <option value="FIITJEE South Delhi (Kalu Sarai)">FIITJEE South Delhi (Kalu Sarai HQ)</option>
                  <option value="FIITJEE Punjabi Bagh (New Delhi)">FIITJEE Punjabi Bagh (New Delhi)</option>
                  <option value="FIITJEE Noida (Sector 16)">FIITJEE Noida (Sector 16)</option>
                  <option value="FIITJEE Mumbai (Andheri West)">FIITJEE Mumbai (Andheri West)</option>
                  <option value="FIITJEE Hyderabad (Kukatpally)">FIITJEE Hyderabad (Kukatpally)</option>
                  <option value="FIITJEE Bengaluru (HSR Layout)">FIITJEE Bengaluru (HSR Layout)</option>
                  <option value="FIITJEE Kolkata (South)">FIITJEE Kolkata (South)</option>
                  <option value="FIITJEE Chennai (Kilpauk)">FIITJEE Chennai (Kilpauk)</option>
                  <option value="FIITJEE Jaipur (Malviya Nagar)">FIITJEE Jaipur (Malviya Nagar)</option>
                  <option value="FIITJEE Dubai GCC Hub">FIITJEE Dubai (UAE & Gulf Center)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <span>Review & Generate</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Fee Waiver Code & Instant Confirmation */}
          {step === 3 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Standard FTRE Registration Fee:</span>
                  <span className="font-bold text-slate-900 line-through">₹750</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Early Bird 100% Promo Applied ({formData.couponCode}):
                  </span>
                  <span className="font-extrabold text-emerald-700">- ₹750</span>
                </div>
                <div className="border-t border-red-200 pt-2 flex items-center justify-between text-sm font-black text-slate-900">
                  <span>Net Payable Amount:</span>
                  <span className="text-[#ED1C24]">₹0 (FREE ADMISSION SLOT)</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                <div><strong>Candidate:</strong> {formData.studentName || 'Aryan Sharma'}</div>
                <div><strong>Class:</strong> {formData.currentClass}</div>
                <div><strong>Selected Date:</strong> {formData.testDate}</div>
                <div><strong>Allotted Center:</strong> {formData.centerName}</div>
                <div><strong>Mode:</strong> {formData.testMode}</div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Official Admit Card</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Official Printable Admit Card / Hall Ticket */}
          {step === 4 && generatedAdmitCard && (
            <div className="space-y-4">
              
              {/* Printable Ticket Container */}
              <div id="printable-admit-card" className="border-2 border-[#002147] rounded-xl p-5 bg-white space-y-4 text-slate-900 shadow-sm">
                
                {/* Header with FIITJEE emblem and Barcode */}
                <div className="flex items-start justify-between border-b-2 border-[#002147] pb-3">
                  <div className="flex items-center gap-3">
                    <FiitjeeLogo variant="dark" size="sm" showDomain={false} showTagline={false} />
                    <div>
                      <h3 className="text-base font-black font-serif-heading text-[#ED1C24] tracking-tight">
                        FIITJEE TALENT REWARD EXAM (FTRE) 2026-27
                      </h3>
                      <div className="text-[11px] font-bold text-[#002147]">
                        OFFICIAL PROVISIONAL E-HALL TICKET / ADMIT CARD • fiitjee.com
                      </div>
                    </div>
                  </div>

                  {/* Simulated barcode */}
                  <div className="text-right">
                    <div className="font-mono text-[9px] tracking-widest font-bold text-slate-700">
                      ||| |||| || ||||| |||| || |||
                    </div>
                    <div className="font-mono text-[9px] font-bold text-slate-600">
                      {generatedAdmitCard.rollNo}
                    </div>
                  </div>
                </div>

                {/* Candidate & Test Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Candidate Name</span>
                    <span className="font-extrabold text-slate-900">{formData.studentName || 'Aryan Sharma'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Roll Number</span>
                    <span className="font-extrabold text-[#ED1C24] font-mono">{generatedAdmitCard.rollNo}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Registration ID</span>
                    <span className="font-mono font-bold">{generatedAdmitCard.registrationNo}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Class / Grade</span>
                    <span className="font-bold text-slate-900">{formData.currentClass}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Test Date</span>
                    <span className="font-bold text-slate-900">{formData.testDate}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Reporting Time</span>
                    <span className="font-bold text-emerald-700">{generatedAdmitCard.reportingTime}</span>
                  </div>
                </div>

                {/* Allotted Center Details */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-300 text-xs">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Examination Center & Address</span>
                  <span className="font-bold text-[#002147]">{formData.centerName}</span>
                  <span className="block text-slate-600 text-[11px] mt-0.5">Mode: {formData.testMode} (Identity Verification via SMS OTP)</span>
                </div>

                {/* Exam Slot Timings */}
                <div className="text-[11px] bg-red-50 text-[#ED1C24] p-2.5 rounded-lg border border-red-200 font-bold">
                  <strong>Exam Schedule:</strong> {generatedAdmitCard.examSlots}
                </div>

                {/* Instructions */}
                <div className="text-[10px] text-slate-500 space-y-1">
                  <div>1. Candidate must carry a printed copy of this Hall Ticket along with School ID Card.</div>
                  <div>2. Electronic devices, calculators, and smartwatches are strictly prohibited.</div>
                  <div>3. Rough sheets and pens will be provided inside the examination center.</div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md uppercase tracking-wider"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save Admit Card PDF</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
