import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  Building2, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layers,
  Check
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { 
  CentreExamConfig, 
  getCentreExamById, 
  saveCentreExam,
  DEFAULT_EXAM_CLASSES 
} from '../utils/examUtils';
import { CENTRES_CONFIG } from '../utils/centreUtils';

interface ExamEditProps {
  isNew?: boolean;
}

export const ExamEdit: React.FC<ExamEditProps> = ({ isNew = false }) => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const { centre, activeCentreId, user } = useAdminAuth();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<CentreExamConfig>({
    id: isNew ? '' : examId || 'big-bang-edge-test',
    centreId: activeCentreId,
    name: 'Big Bang Edge Test 2026',
    fullBrandedName: 'FIITJEE Big Bang Edge Test 2026',
    tagline: 'Some choices are obvious.',
    description: 'A comprehensive 360° diagnostic examination evaluating aptitude and academic potential.',
    year: '2026',
    registrationOpen: true,
    targetClasses: [...DEFAULT_EXAM_CLASSES],
    testDates: [
      '11th October 2026 (Sunday)',
      '18th October 2026 (Sunday)'
    ],
    modes: ['Offline', 'Proctored Online'],
    venues: [
      {
        name: `FIITJEE ${centre?.name || 'Main'} Centre`,
        address: centre?.address || 'FIITJEE Centre Address',
        phone: centre?.phoneNumbers?.[0] || '85272 08022'
      }
    ],
    classFees: {
      'Class V': 200,
      'Class VI': 200,
      'Class VII': 200,
      'Class VIII': 200,
      'Class IX': 250,
      'Class X': 250,
      'Class XI': 250
    },
    defaultFee: 250,
    paymentModes: ['Online (Cashfree / UPI / Cards)', 'Centre Cash Desk / Offline DD'],
  });

  // State for adding a new date
  const [newDateInput, setNewDateInput] = useState('');

  useEffect(() => {
    if (isNew) return;

    const loadExam = async () => {
      setLoading(true);
      try {
        const data = await getCentreExamById(activeCentreId, examId || 'big-bang-edge-test');
        if (data) {
          setForm(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load exam particulars');
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [activeCentreId, examId, isNew]);

  const handleAddDate = () => {
    if (!newDateInput.trim()) return;
    if (form.testDates.includes(newDateInput.trim())) return;
    setForm({
      ...form,
      testDates: [...form.testDates, newDateInput.trim()]
    });
    setNewDateInput('');
  };

  const handleRemoveDate = (index: number) => {
    setForm({
      ...form,
      testDates: form.testDates.filter((_, i) => i !== index)
    });
  };

  const handleToggleMode = (mode: 'Offline' | 'Proctored Online') => {
    const exists = form.modes.includes(mode);
    if (exists && form.modes.length === 1) {
      alert('At least one examination mode must remain active.');
      return;
    }
    setForm({
      ...form,
      modes: exists ? form.modes.filter(m => m !== mode) : [...form.modes, mode]
    });
  };

  const handleClassFeeChange = (className: string, feeStr: string) => {
    const fee = parseInt(feeStr, 10) || 0;
    setForm({
      ...form,
      classFees: {
        ...form.classFees,
        [className]: fee
      }
    });
  };

  const handleVenueChange = (index: number, field: string, value: string) => {
    const updated = [...form.venues];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, venues: updated });
  };

  const handleAddVenue = () => {
    setForm({
      ...form,
      venues: [
        ...form.venues,
        {
          name: `FIITJEE ${centre?.name || 'Branch'} Secondary Exam Centre`,
          address: '',
          phone: ''
        }
      ]
    });
  };

  const handleRemoveVenue = (index: number) => {
    if (form.venues.length === 1) {
      alert('At least one designated test venue is required.');
      return;
    }
    setForm({
      ...form,
      venues: form.venues.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const cleanId = form.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      if (!cleanId) {
        throw new Error('Please specify an Exam Identification Code.');
      }
      if (isNew) {
        const existing = await getCentreExamById(activeCentreId, cleanId);
        if (existing) {
          throw new Error(`An exam blueprint with ID "${cleanId}" already exists for ${centre?.name || 'this'} centre. Please use a unique ID.`);
        }
      }
      if (form.testDates.length === 0) {
        throw new Error('Please add at least one examination test date.');
      }

      await saveCentreExam({
        ...form,
        id: cleanId,
        centreId: activeCentreId,
        lastUpdatedBy: user?.email || 'admin@fiitjee.online'
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/admin/exams');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save exam blueprint');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs border border-slate-200">
        <div className="w-8 h-8 border-3 border-[#ED1C24] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Loading examination configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link 
          to="/admin/exams"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#002147] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Exam Management</span>
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          Branch: <strong className="text-slate-800 uppercase">{centre?.name}</strong>
        </span>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-[#002147] uppercase tracking-tight">
                {isNew ? 'Establish New Admission Exam' : `Configure: ${form.name}`}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic parameters take effect immediately for all students selecting FIITJEE {centre?.name}.
              </p>
            </div>

            {/* Registration Active Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Registrations:</span>
              <button
                type="button"
                onClick={() => setForm({ ...form, registrationOpen: !form.registrationOpen })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  form.registrationOpen
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-red-50 text-red-800 border-red-300 ring-2 ring-red-500/20'
                }`}
              >
                {form.registrationOpen ? '🟢 Active & Open' : '🔴 Closed / Paused'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">Exam configuration saved successfully! Redirecting...</span>
            </div>
          )}

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Exam Identification Code (URL Key) * {!isNew && <span className="text-slate-400 font-normal lowercase">(Locked for existing exam)</span>}
              </label>
              <input
                type="text"
                required
                disabled={!isNew}
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
                placeholder="e.g. big-bang-edge-test or ftre-2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#002147] disabled:bg-slate-100 disabled:text-slate-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Unique alphanumeric identifier (e.g. big-bang-edge-test) used for registrations.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Exam Title *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Big Bang Edge Test 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Branded Title *
              </label>
              <input
                type="text"
                required
                value={form.fullBrandedName}
                onChange={(e) => setForm({ ...form, fullBrandedName: e.target.value })}
                placeholder="e.g. FIITJEE Big Bang Edge Test 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tagline / Banner Hook
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="e.g. Some choices are obvious."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Academic Year
              </label>
              <input
                type="text"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                placeholder="e.g. 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Comprehensive Examination Description
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002147] resize-none"
            />
          </div>
        </div>

        {/* Section 2: Examination Modes & Test Dates */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-black text-[#002147] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#ED1C24]" />
            <span>Test Modes & Examination Dates</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Modes Checkboxes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Supported Exam Modes
              </label>
              <div className="space-y-2">
                {(['Offline', 'Proctored Online'] as const).map((mode) => {
                  const isChecked = form.modes.includes(mode);
                  return (
                    <label 
                      key={mode}
                      onClick={() => handleToggleMode(mode)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked 
                          ? 'border-[#002147] bg-slate-50 text-[#002147] font-bold shadow-xs' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-[#002147] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs">{mode} Mode</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Test Dates Manager */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Designated Test Dates
              </label>
              <div className="space-y-2">
                {form.testDates.map((date, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#ED1C24]" />
                      <span>{date}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDate(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add Date Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newDateInput}
                    onChange={(e) => setNewDateInput(e.target.value)}
                    placeholder="e.g. 25th October 2026 (Sunday)"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002147]"
                  />
                  <button
                    type="button"
                    onClick={handleAddDate}
                    className="px-3.5 py-2 bg-[#002147] text-white rounded-xl text-xs font-bold transition-all hover:bg-[#001733] cursor-pointer"
                  >
                    Add Date
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Class-Wise Fee Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#002147] uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-500 font-mono">₹</span>
              <span>Class-Wise Registration Fee Schedule (INR)</span>
            </h3>
            <div className="text-xs text-slate-500">
              Default Base: ₹{form.defaultFee}
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Set custom admission test registration fees for candidates in each academic grade at FIITJEE {centre?.name}.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {DEFAULT_EXAM_CLASSES.map((cls) => {
              const currentFee = form.classFees[cls] !== undefined ? form.classFees[cls] : 250;
              return (
                <div key={cls} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider">
                    {cls}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={currentFee}
                      onChange={(e) => handleClassFeeChange(cls, e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#002147]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Examination Venues */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#002147] uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#ED1C24]" />
              <span>Designated Test Venues & Offline Centres</span>
            </h3>
            <button
              type="button"
              onClick={handleAddVenue}
              className="text-xs font-bold text-[#ED1C24] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Venue</span>
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {form.venues.map((venue, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    Venue #{idx + 1}
                  </span>
                  {form.venues.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVenue(idx)}
                      className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      required
                      value={venue.name}
                      onChange={(e) => handleVenueChange(idx, 'name', e.target.value)}
                      placeholder="e.g. FIITJEE Main Campus"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-[#002147]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Desk Helpline Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={venue.phone}
                      onChange={(e) => handleVenueChange(idx, 'phone', e.target.value)}
                      placeholder="e.g. 76820 41257"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-[#002147]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Complete Address & Landmarks
                  </label>
                  <input
                    type="text"
                    required
                    value={venue.address}
                    onChange={(e) => handleVenueChange(idx, 'address', e.target.value)}
                    placeholder="e.g. Plot No. 123, Saheed Nagar, Bhubaneswar, Odisha 751007"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-[#002147]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/admin/exams"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Exam Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
