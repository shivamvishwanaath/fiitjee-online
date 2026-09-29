import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Award, 
  Plus, 
  Calendar, 
  MapPin, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Building2,
  Sparkles,
  Search,
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { 
  CentreExamConfig, 
  getCentreExams, 
  toggleExamRegistration, 
  deleteCentreExam,
  seedDefaultExamsIfEmpty 
} from '../utils/examUtils';

export const ExamList: React.FC = () => {
  const navigate = useNavigate();
  const { centre, activeCentreId, user } = useAdminAuth();

  const [exams, setExams] = useState<CentreExamConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadExams = async () => {
    setLoading(true);
    try {
      await seedDefaultExamsIfEmpty(activeCentreId);
      const data = await getCentreExams(activeCentreId);
      setExams(data);
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, [activeCentreId]);

  const handleToggleRegistration = async (examId: string, currentStatus: boolean) => {
    setTogglingId(examId);
    try {
      await toggleExamRegistration(activeCentreId, examId, !currentStatus);
      setExams(prev => prev.map(e => e.id === examId ? { ...e, registrationOpen: !currentStatus } : e));
    } catch (err) {
      console.error('Failed to toggle exam status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteExam = async (examId: string, examName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${examName}" from ${centre?.name || 'this'} centre?`)) {
      return;
    }
    try {
      await deleteCentreExam(activeCentreId, examId);
      setExams(prev => prev.filter(e => e.id !== examId));
    } catch (err) {
      console.error('Failed to delete exam:', err);
    }
  };

  const filteredExams = exams.filter(e => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (e.name || '').toLowerCase().includes(q) ||
      (e.tagline || '').toLowerCase().includes(q) ||
      (e.testDates || []).some(d => d.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#002147] to-[#0A3663] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-[#ED1C24]/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#ED1C24] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>Multi-Centre Admission Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight uppercase">
              {centre?.name || 'Centre'} Exam Management
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Configure admission examinations, offline test dates, proctored online schedules, class-wise fee structures, and venue particulars for students registering at FIITJEE {centre?.name || 'this'} centre.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadExams}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer border border-white/10"
              title="Refresh Exam Blueprints"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/admin/exams/create')}
              className="px-4 py-2.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Exam</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search admission exams by name, date..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#ED1C24] outline-none"
          />
        </div>
        <div className="text-xs font-bold text-slate-500">
          Active Branch: <span className="text-[#002147] font-black uppercase">{centre?.name}</span>
        </div>
      </div>

      {/* Exam Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs border border-slate-200">
          <div className="w-8 h-8 border-3 border-[#ED1C24] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Synchronizing admission exams for {centre?.name || 'this'} centre...</span>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">No Examinations Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No admission test configurations have been established for this branch yet.
          </p>
          <button
            onClick={() => navigate('/admin/exams/create')}
            className="mt-4 px-4 py-2 bg-[#002147] hover:bg-[#001733] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Create Admission Test
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredExams.map((exam) => {
            return (
              <div 
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300 hover:shadow-md"
              >
                {/* Header Banner */}
                <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full font-mono">
                        {exam.year || '2026'}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 ${
                        exam.registrationOpen
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {exam.registrationOpen ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Registrations Live</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Registrations Paused</span>
                          </>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Branch: {exam.centreId?.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-[#002147] tracking-tight">
                      {exam.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {exam.tagline}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={togglingId === exam.id}
                      onClick={() => handleToggleRegistration(exam.id, exam.registrationOpen)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        exam.registrationOpen
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {togglingId === exam.id ? 'Updating...' : exam.registrationOpen ? 'Pause Registrations' : 'Open Registrations'}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/admin/exams/edit/${exam.id}`)}
                      className="px-3.5 py-1.5 bg-[#002147] hover:bg-[#001733] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Configure</span>
                    </button>

                    {exam.id !== 'big-bang-edge-test' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteExam(exam.id, exam.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Test Dates & Modes */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Configured Test Dates
                      </span>
                      <div className="space-y-1">
                        {exam.testDates && exam.testDates.length > 0 ? (
                          exam.testDates.map((d, i) => (
                            <div key={i} className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#ED1C24] shrink-0" />
                              <span>{d}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No dates set</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Examination Modes
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {exam.modes?.map((m, i) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Class-wise Fee Schedule */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Class-Wise Registration Fee Schedule
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(exam.classFees || {}).map(([cls, fee]) => (
                        <div key={cls} className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                          <span className="font-bold text-slate-700">{cls}:</span>
                          <span className="font-mono font-black text-[#002147]">₹{fee}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Default Base Fee: <strong className="text-slate-700 font-mono">₹{exam.defaultFee || 250}</strong>
                    </div>
                  </div>

                  {/* Venues & Centres */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Designated Examination Venue
                    </span>
                    {exam.venues && exam.venues.length > 0 ? (
                      exam.venues.map((v, i) => (
                        <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#ED1C24] shrink-0" />
                            <span>{v.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            {v.address}
                          </p>
                          <div className="text-[10px] font-mono text-slate-600">
                            Desk: {v.phone}
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No venues defined</span>
                    )}
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Last synchronized: {new Date(exam.lastUpdatedAt || Date.now()).toLocaleDateString('en-IN')}</span>
                  <span className="font-mono">Exam ID: {exam.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
