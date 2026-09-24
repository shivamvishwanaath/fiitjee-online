import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, MapPin, User, ArrowRight } from 'lucide-react';
import { PROGRAMS, TOPPERS, CENTERS } from '../data/fiitjeeData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (pathOrSectionId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();

  const matchedPrograms = cleanQuery 
    ? PROGRAMS.filter(p => p.name.toLowerCase().includes(cleanQuery) || p.summary.toLowerCase().includes(cleanQuery)) 
    : [];

  const matchedToppers = cleanQuery 
    ? TOPPERS.filter(t => t.name.toLowerCase().includes(cleanQuery) || t.program.toLowerCase().includes(cleanQuery) || String(t.rank).includes(cleanQuery)) 
    : [];

  const matchedCenters = cleanQuery 
    ? CENTERS.filter(c => c.name.toLowerCase().includes(cleanQuery) || c.city.toLowerCase().includes(cleanQuery) || c.state.toLowerCase().includes(cleanQuery)) 
    : [];

  const hasResults = matchedPrograms.length > 0 || matchedToppers.length > 0 || matchedCenters.length > 0;

  const handleResultClick = (targetPath: string) => {
    onNavigate(targetPath);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Search Input */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search programs, study centers, toppers, ranks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-slate-800 text-sm font-semibold placeholder-slate-400 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Panel */}
        <div className="max-h-[400px] overflow-y-auto p-6 space-y-6">
          {!cleanQuery ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <div className="text-xs font-bold uppercase tracking-wider">Start typing to search...</div>
              <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Quickly search through classroom programs, local coaching branches, and IIT toppers.</p>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <X className="w-8 h-8 mx-auto text-slate-300" />
              <div className="text-xs font-bold uppercase tracking-wider">No matches found</div>
              <p className="text-[10px] text-slate-500">Try checking spelling or searching for generic terms like "Pinnacle" or "Delhi".</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Programs Column */}
              {matchedPrograms.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Featured Programs ({matchedPrograms.length})</span>
                  </div>
                  <div className="grid gap-2">
                    {matchedPrograms.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleResultClick('/all-programs')}
                        className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-red-300 hover:bg-red-50/20 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-black text-[#002147] truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{p.summary}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#ED1C24] transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Toppers Column */}
              {matchedToppers.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Honored Toppers ({matchedToppers.length})</span>
                  </div>
                  <div className="grid gap-2">
                    {matchedToppers.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleResultClick('/fiitjee-results')}
                        className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-red-300 hover:bg-red-50/20 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img 
                            src={t.image} 
                            alt={t.name} 
                            className="w-8 h-8 rounded-lg object-cover object-top shrink-0 border border-slate-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${t.name}`;
                            }}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-black text-[#002147] truncate">{t.name}</div>
                            <div className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">AIR {t.rank} • {t.exam}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#ED1C24] transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Centers Column */}
              {matchedCenters.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Study Centers ({matchedCenters.length})</span>
                  </div>
                  <div className="grid gap-2">
                    {matchedCenters.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleResultClick('/fiitjee-centres')}
                        className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-red-300 hover:bg-red-50/20 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-black text-[#002147] truncate">{c.name}</div>
                          <div className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{c.address}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#ED1C24] transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
