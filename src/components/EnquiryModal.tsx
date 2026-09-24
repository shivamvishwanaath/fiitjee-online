import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  User, 
  Mail, 
  MapPin, 
  GraduationCap, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  initialTopic
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    studentClass: 'Class 10',
    city: 'New Delhi',
    topic: initialTopic || 'General Admission & Fee Structure'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      // Auto close after 3 seconds
      setSubmitted(false);
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in">
        
        {/* Header */}
        <div className="bg-[#002147] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#ED1C24]">
          <div>
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">FIITJEE Academic Counseling</div>
            <h2 className="text-base font-extrabold font-display">
              {submitted ? 'Request Received' : 'Request Free Academic Counseling'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-[#002147] font-display">
                Thank You, {formData.name || 'Student'}!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our Senior Academic Counselor will call you at <strong className="text-slate-900">+91 {formData.phone}</strong> within 15 minutes to share the detailed syllabus, admission test guidelines, and fee scholarship structure.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student / Parent Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-2.5 text-xs font-bold text-slate-600 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-[#ED1C24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student's Class *</label>
                  <select
                    value={formData.studentClass}
                    onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24]"
                  >
                    <option value="Class 6">Class VI</option>
                    <option value="Class 7">Class VII</option>
                    <option value="Class 8">Class VIII</option>
                    <option value="Class 9">Class IX (SUPREME)</option>
                    <option value="Class 10">Class X (PINNACLE)</option>
                    <option value="Class 11">Class XI</option>
                    <option value="Class 12">Class XII</option>
                    <option value="Class 12 Pass">Class XII Pass</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / Region *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delhi NCR, Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Purpose / Program</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Request Instant Free Callback</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
