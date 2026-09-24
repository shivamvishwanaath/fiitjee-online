import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { Printer, ArrowLeft, AlertCircle } from 'lucide-react';
import { db } from '../../firebase';
import { OfficialHallTicket } from '../../components/OfficialHallTicket';
import { printElementById } from '../../utils/printUtils';
import { ExamRegistration } from '../../types';

export const StandaloneHallTicketView: React.FC = () => {
  const { rollNo } = useParams<{ rollNo: string }>();
  const [registration, setRegistration] = useState<ExamRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecord() {
      if (!rollNo) return;
      try {
        setLoading(true);
        // Clean rollNo query
        const cleanRoll = rollNo.trim();
        const cleanRollNoSpaces = cleanRoll.replace(/\s+/g, '');
        const allRef = ref(db, 'registrations/big_bang_2026');
        const allSnap = await get(allRef);

        if (allSnap.exists()) {
          const data = allSnap.val();
          let found: ExamRegistration | null = null;

          // Case 1: Direct key match
          if (data[cleanRoll] || data[cleanRollNoSpaces]) {
            found = data[cleanRoll] || data[cleanRollNoSpaces];
          } else {
            // Case 2: Search within each per-centre branch (bhubaneswar, dwarka, ranchi, hyderabad)
            for (const key of Object.keys(data)) {
              const centreNode = data[key];
              if (centreNode && typeof centreNode === 'object') {
                if (centreNode[cleanRoll] || centreNode[cleanRollNoSpaces]) {
                  found = centreNode[cleanRoll] || centreNode[cleanRollNoSpaces];
                  break;
                }
                for (const regKey of Object.keys(centreNode)) {
                  const reg = centreNode[regKey];
                  if (
                    (reg.rollNo && reg.rollNo.replace(/\s+/g, '') === cleanRollNoSpaces) ||
                    (reg.phone && reg.phone === cleanRoll) ||
                    regKey === cleanRollNoSpaces
                  ) {
                    found = reg as ExamRegistration;
                    break;
                  }
                }
                if (found) break;
              }
            }
          }

          if (found) {
            setRegistration(found);
          } else {
            setError(`No registration found for roll number or contact "${rollNo}".`);
          }
        } else {
          setError(`No registrations database located.`);
        }
      } catch (err: any) {
        console.error('Failed to fetch hall ticket:', err);
        setError(err.message || 'Failed to retrieve hall ticket record.');
      } finally {
        setLoading(false);
      }
    }

    fetchRecord();
  }, [rollNo]);

  const handlePrint = () => {
    printElementById('official-hall-ticket-container');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 text-xs font-bold text-[#002147]">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-[#ED1C24] rounded-full animate-spin mb-3"></div>
        <div>Generating Official FIITJEE Hall Ticket & Tax Invoice...</div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md text-center max-w-md space-y-4">
          <AlertCircle className="w-10 h-10 text-[#ED1C24] mx-auto" />
          <h2 className="text-base font-bold text-slate-800">Hall Ticket Not Located</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || 'Unable to retrieve registration record. Please check your roll number or contact the FIITJEE admissions office.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#002147] text-white text-xs font-bold rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-2 sm:px-4 print:p-0 print:bg-white">
      {/* Top Floating Print Bar */}
      <div className="max-w-[210mm] mx-auto mb-4 bg-[#002147] text-white p-3 rounded-xl shadow-md flex items-center justify-between print:hidden">
        <div className="text-xs">
          <span className="font-bold text-amber-300">Official Candidate Hall Ticket</span>
          <span className="text-slate-300 ml-2">Roll No: {registration.rollNo}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="bg-[#ED1C24] hover:bg-[#c9141b] text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print A4 Hall Ticket</span>
          </button>
        </div>
      </div>

      {/* 1:1 Authentic Hall Ticket */}
      <OfficialHallTicket registration={registration} />
    </div>
  );
};
