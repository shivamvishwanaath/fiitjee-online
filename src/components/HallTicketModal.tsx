import React from 'react';
import { X, Printer, Download, CheckCircle2, ExternalLink } from 'lucide-react';
import { ExamRegistration } from '../types';
import { OfficialHallTicket } from './OfficialHallTicket';
import { printElementById } from '../utils/printUtils';

interface HallTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: ExamRegistration | null;
}

export const HallTicketModal: React.FC<HallTicketModalProps> = ({
  isOpen,
  onClose,
  registration
}) => {
  if (!isOpen || !registration) return null;

  const handlePrint = () => {
    printElementById('official-hall-ticket-container');
  };

  const cleanRollParam = registration.rollNo.replace(/\s+/g, '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
        
        {/* Header toolbar - hidden in print */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#002147] text-white print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">Official FIITJEE Hall Ticket & Tax Invoice</h3>
              <p className="text-[11px] text-slate-300">Roll No: {registration.rollNo} | {registration.studentName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/hall-ticket/${encodeURIComponent(cleanRollParam)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors"
              title="Open dedicated full-screen printable page in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </a>

            <button
              onClick={handlePrint}
              className="bg-[#ED1C24] hover:bg-[#c9141b] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Hall Ticket</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Hall Ticket View */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-slate-100 print:bg-white print:p-0">
          <OfficialHallTicket registration={registration} />
        </div>

        {/* Footer info - hidden in print */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex justify-between items-center print:hidden">
          <span>* Standard A4 single-page format. Use browser Print to save as PDF or print to physical printer.</span>
          <button 
            onClick={onClose}
            className="text-slate-700 hover:text-black font-semibold text-xs cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
