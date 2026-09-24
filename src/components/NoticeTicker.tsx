import React from 'react';
import { Bell } from 'lucide-react';
import { NOTICES } from '../data/fiitjeeData';
import { Notice } from '../types';

interface NoticeTickerProps {
  onOpenFtreModal: () => void;
  onOpenBigBangModal: () => void;
  onNavigate: (sectionId: string) => void;
}

export const NoticeTicker: React.FC<NoticeTickerProps> = ({
  onOpenFtreModal,
  onOpenBigBangModal,
  onNavigate
}) => {
  const handleNoticeClick = (notice: Notice) => {
    if (notice.linkAction === 'open-big-bang-modal') {
      onOpenBigBangModal();
    } else if (notice.linkAction === 'open-ftre-modal') {
      onOpenFtreModal();
    } else if (notice.linkAction && notice.linkAction.startsWith('/')) {
      onNavigate(notice.linkAction);
    } else {
      onOpenFtreModal(); // Default fallback
    }
  };

  return (
    <div className="bg-[#002147] text-white text-xs font-semibold py-2 border-b border-[#001733] overflow-hidden flex items-center shadow-xs">
      <div className="px-4 shrink-0 flex items-center gap-1.5 font-black uppercase text-amber-300 border-r border-white/20 pr-3 z-10 bg-[#002147]">
        <Bell className="w-4 h-4 animate-bounce text-amber-300" />
        <span>LATEST ANNOUNCEMENTS:</span>
      </div>

      <div className="overflow-hidden whitespace-nowrap flex-1 relative">
        <div className="animate-marquee inline-flex gap-8 items-center">
          {NOTICES.map((notice) => (
            <div key={notice.id} className="inline-flex items-center gap-2">
              <span className="bg-[#ED1C24] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                {notice.category}
              </span>
              <span className="text-slate-100 font-medium">{notice.title}</span>
              <button
                onClick={() => handleNoticeClick(notice)}
                className="underline hover:text-amber-300 text-amber-200 font-extrabold cursor-pointer transition-colors"
              >
                [{notice.linkText} →]
              </button>
              <span className="text-white/40 font-normal">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
