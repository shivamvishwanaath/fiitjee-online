import React from 'react';
import { ExamRegistration } from '../types';
import { 
  getCentreByName, 
  formatRegistrationNumber, 
  generateSID, 
  generateInvoiceNumber, 
  getExamScheduleForClass 
} from '../admin/utils/centreUtils';

interface OfficialHallTicketProps {
  registration: ExamRegistration;
  printId?: string;
}

export const OfficialHallTicket: React.FC<OfficialHallTicketProps> = ({ 
  registration,
  printId = 'official-hall-ticket-container'
}) => {
  const centre = getCentreByName(registration.selectedCenter);
  const formattedRoll = formatRegistrationNumber(registration.rollNo);
  const sid = registration.sid || generateSID(registration.rollNo);
  const invoiceNo = registration.invoiceNo || generateInvoiceNumber(centre, registration.rollNo);
  const invoiceDate = registration.invoiceDate || (registration.registeredAt ? registration.registeredAt.split('T')[0] : '11-10-2026');
  const paymentRef = registration.paymentRef || (registration.cashfreePaymentId ? `CF-${registration.cashfreePaymentId}` : `${centre.numericCode}/ADM-${formattedRoll.replace(/\s+/g, '').slice(-4)}`);
  const schedule = getExamScheduleForClass(registration.currentClass);

  // Address fallback without mock data
  const fullAddress = registration.address || 
    `${registration.schoolName ? `${registration.schoolName}, ` : ''}${centre.name.toUpperCase()}, ${centre.stateName}::${centre.stateCode}, India`;

  // Dynamic fee calculation (if fee paid or free/waived)
  const paidAmount = registration.paymentAmount !== undefined ? Number(registration.paymentAmount) : (registration.paymentStatus === 'paid' ? 1.00 : 0.00);
  const taxableBase = paidAmount > 0 ? (paidAmount / 1.18).toFixed(2) : '0.00';
  const taxEach = paidAmount > 0 ? ((paidAmount - parseFloat(taxableBase)) / 2).toFixed(2) : '0.00';

  const renderTaxInvoice = (type: 'Duplicate' | 'Original') => (
    <div className="border border-black p-2 text-[8.5px] leading-tight flex-1 font-sans text-black">
      <div className="text-center font-bold text-[10px] tracking-wide">TRANSED LLP (FIITJEE ADMISSIONS)</div>
      <div className="text-center text-[7.5px] text-gray-700 leading-snug">{centre.address}</div>
      <div className="text-center font-bold text-[9px] my-0.5 underline">Tax Invoice ({type})</div>
      
      <div className="flex justify-between border-b border-black pb-1 mt-1">
        <div>
          <div><span className="font-semibold">GSTIN :</span> {centre.gstin}</div>
          <div className="font-bold uppercase mt-0.5">{registration.studentName}</div>
          <div className="text-[7.5px] max-w-[180px] break-words uppercase">{fullAddress}</div>
        </div>
        <div className="text-right">
          <div><span className="font-semibold">Invoice Date :</span> {invoiceDate}</div>
          <div><span className="font-semibold">Invoice No. :</span> {invoiceNo}</div>
        </div>
      </div>

      <table className="w-full border-collapse my-1 text-[8px]">
        <thead>
          <tr className="border-b border-black font-bold">
            <th className="text-left py-0.5">Description</th>
            <th className="text-right py-0.5">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Registration Fee (HSN 999293)</td>
            <td className="text-right">{taxableBase}</td>
          </tr>
          <tr>
            <td colSpan={2} className="text-gray-600">Place of supply - {centre.stateName} {centre.stateCode}</td>
          </tr>
          <tr>
            <td>CGST @ 9%</td>
            <td className="text-right">{taxEach}</td>
          </tr>
          <tr>
            <td>SGST @ 9%</td>
            <td className="text-right">{taxEach}</td>
          </tr>
          <tr className="border-t border-black font-bold">
            <td>Total</td>
            <td className="text-right">{paidAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-between items-end pt-1 border-t border-dotted border-gray-400">
        <div className="text-[7.5px]">
          <div>This invoice is already paid in Cash / Online</div>
          <div>vide payment Ref No {paymentRef}</div>
          <div>Whether Tax is payable under reverse charge : No</div>
        </div>
        
        {/* Digital Signature Stamp Box matching sample */}
        <div className="border border-amber-600 bg-amber-50/50 p-1 text-[6.5px] rounded text-center min-w-[90px] leading-tight">
          <div className="text-amber-800 font-bold flex items-center justify-center gap-0.5">
            <span className="text-amber-600 font-extrabold text-[8px]">?</span> Signature Not Verified
          </div>
          <div className="text-gray-600 text-[6px]">Digitally signed by DS TRANSED LLP</div>
          <div className="text-gray-500 text-[6px]">Date: 2026.10.11 16:08:48 +05:30</div>
          <div className="font-bold text-gray-800 text-[7px] mt-0.5">Signature</div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      id={printId}
      className="bg-white text-black p-4 sm:p-6 max-w-[210mm] mx-auto text-[9.5px] font-sans leading-normal border border-gray-300 shadow-md print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none printable-area"
      style={{ minHeight: '290mm' }}
    >
      {/* 1. Dual Tax Invoices Header */}
      <div className="flex gap-2 mb-3">
        {renderTaxInvoice('Duplicate')}
        {renderTaxInvoice('Original')}
      </div>

      {/* 2. Main Title Strip */}
      <div className="border border-black text-center py-1 font-bold text-[13px] tracking-wider uppercase mb-3 bg-gray-50">
        TEST HALL TICKET
      </div>

      {/* 3. Comprehensive Table */}
      <table className="w-full border-collapse border border-black text-[9px] mb-3">
        <tbody>
          <tr className="border-b border-black">
            <td className="w-1/3 p-1 font-bold border-r border-black bg-gray-50">Registration number</td>
            <td className="p-1 font-bold text-[11px] font-mono tracking-wider">{formattedRoll}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 font-bold border-r border-black bg-gray-50">Name of the Student</td>
            <td className="p-1 font-bold uppercase">{registration.studentName}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 font-bold border-r border-black bg-gray-50">Address</td>
            <td className="p-1 uppercase">{fullAddress}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 font-bold border-r border-black bg-gray-50">SID</td>
            <td className="p-1 font-mono font-semibold">{sid}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 font-bold border-r border-black bg-gray-50">Profile Status</td>
            <td className="p-1 text-gray-700">Not yet updated. Please logon to www.fiitjeelogin.com and update your user profile</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 font-bold border-r border-black bg-gray-50">E-Mail ID</td>
            <td className="p-1 font-mono">{registration.email}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 font-bold border-r border-black bg-gray-50">Program Opted for</td>
            <td className="p-1 font-semibold">
              BIG BANG EDGE TEST 2026 - National Scholastic Assessment for {registration.currentClass} [BBE-2026]
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 font-bold border-r border-black bg-gray-50">Test Centre</td>
            <td className="p-1">
              {registration.testMode === 'Offline' ? (
                <span>{centre.testCentreDisplay}</span>
              ) : (
                <span className="font-semibold text-purple-900">
                  PROCTORED ONLINE TESTING HUB — Test from home via secure link emailed to {registration.email} [ONLINE-001]
                </span>
              )}
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 font-bold border-r border-black bg-gray-50">Studycentre Opted</td>
            <td className="p-1 font-semibold">{centre.name} {centre.code}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 font-bold border-r border-black bg-gray-50">Test Date</td>
            <td className="p-1 font-bold">{registration.testDate}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 font-bold border-r border-black bg-gray-50">Exam Schedule</td>
            <td className="p-1 font-medium">{schedule}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 font-bold border-r border-black bg-gray-50">Reporting Time</td>
            <td className="p-1 font-bold text-red-700">45 Minutes Before The First Examination</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 font-bold border-r border-black bg-gray-50">Type of Test</td>
            <td className="p-1">Big Bang Edge Test 2026</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 font-bold border-r border-black bg-gray-50">Registration Time</td>
            <td className="p-1">{invoiceDate}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 font-bold border-r border-black bg-gray-50">Controlling FIITJEE Centre</td>
            <td className="p-1 text-[8.5px]">{centre.controllingOffice}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 font-bold border-r border-black bg-gray-50">Sample Papers</td>
            <td className="p-1 text-[8.5px]">To get the Sample Papers of FIITJEE Tests, visit <span className="underline text-blue-800">https://fiitjee.com/samplepapers/</span></td>
          </tr>
          <tr>
            <td className="p-1 font-bold border-r border-black bg-gray-50">OMR sheet numbers</td>
            <td className="p-1">
              <div className="text-[8.5px] mb-1">Please make a note of your OMR number(s) given to you during the test</div>
              <div className="flex gap-8 font-mono text-[9px]">
                <div>Session 1: <span className="inline-block border-b border-black w-24"></span></div>
                <div>Session 2: <span className="inline-block border-b border-black w-24"></span></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 4. Important Instructions Section */}
      <div className="mb-2">
        <div className="font-bold text-[10px] mb-1 underline">Important Instructions</div>
        <ol className="list-none space-y-0.5 text-[7.5px] leading-snug text-gray-900 pl-0">
          <li className="flex gap-1.5"><span className="font-bold">a)</span> <span>Please keep this validated Hall Ticket safe and produce it at the time of taking admission / claiming scholarship. If this Hall Ticket is lost / stolen / damaged, you will not be able to claim any of the benefits attached with the test.</span></li>
          <li className="flex gap-1.5"><span className="font-bold">b)</span> <span>Test Dates, Examination centre etc. cannot be changed after the registration.</span></li>
          <li className="flex gap-1.5"><span className="font-bold">c)</span> <span>Students will not be allowed to enter the examination hall after 15 min of the starting of the exam and will not be allowed to leave the examination hall before the completion of the exam.</span></li>
          <li className="flex gap-1.5"><span className="font-bold">d)</span> <span>During the examination you will be given an OMR (Optical Mark Recognition) sheet having bubbles to be darkened. Please carry multiple HB pencils, good quality eraser and sharpener. Please also carry a blue / black pen to fill other information during the examination. Download an Introduction to OMR sheets from http://www.fiitjee.com/fillomr.pdf</span></li>
          <li className="flex gap-1.5"><span className="font-bold">e)</span> <span>This Hall ticket is Non refundable, Non Transferable, and Non Renewable and is to be presented in each test for verification.</span></li>
          <li className="flex gap-1.5"><span className="font-bold">f)</span> <span>Calculator in any form / slide rule / long sheets etc. will not be permitted during the examination.</span></li>
          <li className="flex gap-1.5"><span className="font-bold">g)</span> <span>Mobile Phones are not allowed inside the examination hall.</span></li>
          <li className="flex gap-1.5"><span className="font-bold">h)</span> <span>Adoption of any unfair means will render the applicant liable for cancellation of his/ her candidature.</span></li>
          <li className="flex gap-1.5"><span className="font-bold">i)</span> <span>The validity of this hall ticket is subject to realisation of payment.</span></li>
          <li className="flex gap-1.5"><span className="font-bold">j)</span> <span>If you have opted for online test, a separate set of instructions will be sent to you at your registered email id.</span></li>
        </ol>
      </div>

      {/* 5. Legal Terms */}
      <div className="text-[7px] text-gray-700 leading-tight mb-3 border-t border-gray-400 pt-1">
        By appearing for this test, candidate and parents agree to the terms and conditions managed by TRANSED LLP for FIITJEE programs. The registered office of TRANSED LLP is in New Delhi and all disputes, if any, shall be subject to the exclusive jurisdiction of the competent courts of New Delhi only.
      </div>

      {/* 6. Signatures Footer */}
      <div className="grid grid-cols-4 border border-black text-center text-[8px] h-10">
        <div className="border-r border-black p-1 flex flex-col justify-between">
          <span className="font-bold">Date</span>
          <span className="text-[7.5px] text-gray-600">{invoiceDate}</span>
        </div>
        <div className="border-r border-black p-1 flex flex-col justify-between">
          <span className="font-bold">Place</span>
          <span className="text-[7.5px] text-gray-600">{centre.name}</span>
        </div>
        <div className="border-r border-black p-1 flex flex-col justify-between">
          <span className="font-bold">Signature of the Student</span>
          <span></span>
        </div>
        <div className="p-1 flex flex-col justify-between">
          <span className="font-bold">Signature of the Parent/Guardian</span>
          <span></span>
        </div>
      </div>
    </div>
  );
};
