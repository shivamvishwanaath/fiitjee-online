import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Printer, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  School, 
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useRegistrations } from '../hooks/useRegistrations';
import { NoteEditor } from '../components/NoteEditor';
import { OfficialHallTicket } from '../../components/OfficialHallTicket';
import { HallTicketModal } from '../../components/HallTicketModal';
import { ALL_CENTRES } from '../utils/centreUtils';
import { ExamRegistration } from '../../types';

export const RegistrationDetail: React.FC = () => {
  const { rollNo } = useParams<{ rollNo: string }>();
  const navigate = useNavigate();
  const { centre, user } = useAdminAuth();
  const { 
    registrations, 
    loading, 
    updateRegistration, 
    addNote, 
    deleteRegistration 
  } = useRegistrations(centre?.name, user?.email || undefined);

  const reg = registrations.find(r => (r.rollNo === rollNo || r.id === rollNo));

  const [formData, setFormData] = useState<Partial<ExamRegistration>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showHallTicketModal, setShowHallTicketModal] = useState(false);

  useEffect(() => {
    if (reg) {
      setFormData(reg);
    }
  }, [reg]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        <div className="w-8 h-8 border-3 border-slate-300 border-t-[#ED1C24] rounded-full animate-spin mx-auto mb-3"></div>
        Loading student dossier...
      </div>
    );
  }

  if (!reg) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-md mx-auto my-12 space-y-3">
        <h3 className="font-bold text-slate-800 text-base">Record Not Found</h3>
        <p className="text-xs text-slate-500">No application matches roll number <code className="font-mono font-bold text-red-600">{rollNo}</code>.</p>
        <button
          onClick={() => navigate('/admin/registrations')}
          className="px-4 py-2 bg-[#002147] text-white rounded-lg text-xs font-bold cursor-pointer"
        >
          Back to Registrations
        </button>
      </div>
    );
  }

  const handleInputChange = (field: keyof ExamRegistration, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateRegistration(reg.rollNo, formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Permanently delete student ${reg.studentName} (${reg.rollNo})?`)) {
      await deleteRegistration(reg.rollNo);
      navigate('/admin/registrations');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/registrations')}
            className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Return to list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#002147] uppercase tracking-tight">
                {reg.studentName}
              </h1>
              <span className="font-mono text-xs font-bold bg-[#ED1C24]/10 text-[#ED1C24] px-2 py-0.5 rounded">
                {reg.rollNo}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Registered on {reg.registeredAt ? reg.registeredAt.split('T')[0] : 'N/A'} via {reg.registeredByCentre || 'Online Portal'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHallTicketModal(true)}
            className="bg-[#ED1C24] hover:bg-[#c9141b] text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print 1:1 Hall Ticket</span>
          </button>

          <button
            onClick={handleDelete}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
            title="Delete Student Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Editable Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wide">
                Candidate Information & Allotment
              </h3>
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Changes Saved!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Student Name */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Student Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentName || ''}
                  onChange={(e) => handleInputChange('studentName', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] font-semibold"
                />
              </div>

              {/* Parent Name */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  value={formData.parentName || ''}
                  onChange={(e) => handleInputChange('parentName', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147]"
                />
              </div>

              {/* Current Class */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Present Class / Grade
                </label>
                <select
                  value={formData.currentClass || 'Class X'}
                  onChange={(e) => handleInputChange('currentClass', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] bg-white font-bold"
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

              {/* School Name */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Current School Name
                </label>
                <input
                  type="text"
                  value={formData.schoolName || ''}
                  onChange={(e) => handleInputChange('schoolName', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147]"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Mobile Contact Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] font-mono"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] font-mono"
                />
              </div>

              {/* Address (for Tax Invoice & Hall Ticket) */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Residential Address (Printed on Tax Invoice & Hall Ticket)
                </label>
                <input
                  type="text"
                  placeholder="Plot/Flat No, Street, Area, City, State, PIN"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147]"
                />
              </div>

              {/* Centre Selection */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Allocated Study Centre
                </label>
                <select
                  value={formData.selectedCenter || centre?.name}
                  onChange={(e) => handleInputChange('selectedCenter', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] bg-white font-bold"
                >
                  {ALL_CENTRES.map(c => (
                    <option key={c.id} value={c.name}>{c.name} {c.code}</option>
                  ))}
                </select>
              </div>

              {/* Test Mode */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Test Mode
                </label>
                <select
                  value={formData.testMode || 'Offline'}
                  onChange={(e) => handleInputChange('testMode', e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] bg-white font-bold"
                >
                  <option value="Offline">Offline Classroom (Center)</option>
                  <option value="Proctored Online">Proctored Online (Home)</option>
                </select>
              </div>

              {/* Test Date */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Assigned Test Date
                </label>
                <select
                  value={formData.testDate || '11th October 2026 (Sunday)'}
                  onChange={(e) => handleInputChange('testDate', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] bg-white"
                >
                  <option value="11th October 2026 (Sunday)">11th October 2026 (Sunday)</option>
                  <option value="18th October 2026 (Sunday)">18th October 2026 (Sunday)</option>
                </select>
              </div>

              {/* Application Status */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  CRM Admission Status
                </label>
                <select
                  value={formData.status || 'New'}
                  onChange={(e) => handleInputChange('status', e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] bg-white font-black text-slate-800"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Selected">Selected</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>

            {/* Save CTA */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#002147] hover:bg-[#001733] disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>

          {/* Internal Notes Section */}
          <NoteEditor
            notes={reg.notes}
            onAddNote={(text) => addNote(reg.rollNo, text)}
          />
        </div>

        {/* Right Column (5 cols): Embedded Hall Ticket & Quick Print */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-[#002147] uppercase tracking-wide">
                Live Hall Ticket & Tax Invoice Preview
              </h4>
              <button
                onClick={() => setShowHallTicketModal(true)}
                className="text-xs font-bold text-[#ED1C24] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print A4</span>
              </button>
            </div>
            
            {/* Scrollable scaled ticket preview */}
            <div className="border border-slate-300 rounded-xl overflow-y-auto max-h-[600px] bg-slate-100 p-2 shadow-inner">
              <OfficialHallTicket registration={{ ...reg, ...formData }} />
            </div>
          </div>
        </div>

      </div>

      {/* Hall Ticket Full Modal */}
      <HallTicketModal
        isOpen={showHallTicketModal}
        onClose={() => setShowHallTicketModal(false)}
        registration={{ ...reg, ...formData }}
      />
    </div>
  );
};
