import React from 'react';
import { 
  ShieldCheck, 
  FileText, 
  RefreshCw, 
  Mail, 
  Phone, 
  MapPin, 
  AlertCircle, 
  Clock, 
  Building, 
  Lock, 
  CheckCircle2, 
  Scale, 
  HelpCircle,
  Truck
} from 'lucide-react';

/* =========================================================================
   1. TERMS & CONDITIONS
   ========================================================================= */
export const TermsAndConditions: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-slate-700 leading-relaxed font-normal">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-black text-[#ED1C24] uppercase tracking-wider">
          <Scale className="w-4 h-4" />
          <span>Legal Agreement & User Obligations</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#002147] tracking-tight uppercase">
          Terms & Conditions
        </h1>
        <p className="text-slate-500 text-sm font-semibold uppercase">
          Legal Entity: TRANSED LLP | Last Updated: March 2026
        </p>
      </div>

      {/* Entity Notice Card */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-[#002147] font-bold text-sm">
          <Building className="w-5 h-5 text-[#002147]" />
          <span>Merchant & Operating Entity Identification</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          This digital portal (<strong>fiitjee.online</strong> and affiliated registration systems) is owned, managed, and operated by <strong>TRANSED LLP</strong> (hereinafter referred to as <strong>"TRANSED LLP"</strong>, <strong>"Entity"</strong>, <strong>"We"</strong>, <strong>"Us"</strong>, or <strong>"Our"</strong>). By accessing, browsing, creating an account, or completing test registrations on this website, you (<strong>"User"</strong>, <strong>"Student"</strong>, or <strong>"Parent/Guardian"</strong>) agree to be bound by these Terms and Conditions.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">1</span>
            Scope of Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            TRANSED LLP facilitates online applications, diagnostic assessments, scholarship examinations (including the Big Bang Edge Test and FTRE), issuance of digital Official Hall Tickets, candidate scorecards, syllabus downloads, and admission workflow support for FIITJEE preparatory programs.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">2</span>
            User Account & Candidate Registration Integrity
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            When registering for an admission test or creating an account, the user warrants that all submitted credentials—including student name, date of birth, present schooling class, guardian mobile number, and target examination center—are authentic and accurate. Registration under false or misleading information may lead to the cancellation of test slot, disqualification of scholarship awards, and invalidation of the Official Hall Ticket.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            In cases where candidates are minors (under 18 years of age), registrations and monetary payments must be authorized by a parent or legal guardian.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">3</span>
            Online Payment, Fees & Invoicing
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            All online transaction processing, test fee collections, and coupon-adjusted payments made on this website are collected and processed by <strong>TRANSED LLP</strong>. Payments are routed through RBI-authorized, PCI-DSS compliant payment gateways (including Cashfree Payments India Pvt. Ltd.).
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1.5">
            <li>All examination fees are listed in Indian Rupees (₹ INR) inclusive/exclusive of applicable Goods and Services Tax (GST) as indicated on the checkout summary.</li>
            <li>Upon successful payment confirmation from the payment aggregator, a digital Tax Invoice / Fee Receipt and an Official Hall Ticket are instantly made available in the candidate portal.</li>
            <li>TRANSED LLP does not capture, store, or view your full credit card numbers, debit card PINs, or UPI security credentials.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">4</span>
            Hall Ticket & Examination Guidelines
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Candidates must carry a clear printed copy of their Official Hall Ticket along with an institutional photo ID card to the designated test centre. Reporting times and testing protocols printed on the Hall Ticket must be strictly adhered to. TRANSED LLP and FIITJEE centre administrators reserve the right to deny admission to testing halls in cases of impersonation, electronic malpractice, or unauthorized entry.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">5</span>
            Intellectual Property Rights
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            All curriculum materials, diagnostic questions, mock CBT portals, logos, trademarks, website layouts, and graphics on this platform are protected by intellectual property laws. Unauthorized reproduction, commercial distribution, or automated crawling of test questions or website assets is strictly prohibited.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">6</span>
            Limitation of Liability & Force Majeure
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            TRANSED LLP will not be liable for any temporary failure or delay in online service delivery caused by circumstances beyond reasonable control, including telecom disruptions, cloud server failures, local government curfew orders, or force majeure events. In such cases, alternate exam dates or slot reassignments will be provisioned.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">7</span>
            Governing Law & Dispute Resolution
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            These terms are governed by and construed in accordance with the substantive laws of the Republic of India. Any legal dispute, claim, or controversy arising out of or relating to this platform, payments, or services shall be subject to the exclusive jurisdiction of the competent courts in <strong>New Delhi, India</strong>.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-[#002147]">Legal & Grievance Queries</h2>
          <p className="text-xs text-slate-600">
            For questions regarding these Terms & Conditions, please contact the compliance officer at:
            <br />
            <strong>TRANSED LLP</strong>
            <br />
            Email: <a href="mailto:support@fiitjee.online" className="text-[#ED1C24] font-semibold underline">support@fiitjee.online</a> / <a href="mailto:transedllp@gmail.com" className="text-[#ED1C24] font-semibold underline">transedllp@gmail.com</a>
            <br />
            Helpline: 011-49283471 / 1800 11 4242
          </p>
        </section>
      </div>
    </div>
  );
};

/* =========================================================================
   2. PRIVACY POLICY
   ========================================================================= */
export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-slate-700 leading-relaxed font-normal">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-black text-[#ED1C24] uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Data Privacy & Security Protocols</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#002147] tracking-tight uppercase">
          Privacy Policy
        </h1>
        <p className="text-slate-500 text-sm font-semibold uppercase">
          Legal Entity: TRANSED LLP | Compliance with IT Act, 2000 & SPDI Rules
        </p>
      </div>

      {/* Trust Notice */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
          <Lock className="w-5 h-5 text-emerald-700" />
          <span>Commitment to Student & Guardian Privacy</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          <strong>TRANSED LLP</strong> (<strong>"Entity"</strong>, <strong>"We"</strong>, <strong>"Us"</strong>) values the trust reposed by students and parents. This Privacy Policy details the types of personal information collected, how it is processed and protected, and your rights concerning your personal data in connection with the <strong>fiitjee.online</strong> portal.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">1</span>
            Information We Collect
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To register candidates for entrance and scholarship examinations, we collect:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1.5">
            <li><strong>Student Identity Data:</strong> Full Name, Date of Birth, Gender, School Name, and Current Academic Class.</li>
            <li><strong>Contact Details:</strong> Student Email, Parent/Guardian Mobile Phone Number, and Residential Postal Address.</li>
            <li><strong>Exam Preferences:</strong> Chosen Examination Centre, Target Exam Stream, and Preferred Test Date slot.</li>
            <li><strong>Transaction Identifiers:</strong> Payment Reference ID, Order ID, and Payment Status received from our payment gateway partner (Cashfree). <em>We never store credit card numbers, CVVs, or bank net-banking passwords.</em></li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">2</span>
            How Information is Utilized
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Information gathered is used exclusively for:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1.5">
            <li>Generating and validating the Official Test Hall Ticket with unique QR and roll number credentials.</li>
            <li>Transmitting examination slot reminders, venue directions, and score updates via SMS, WhatsApp, and email.</li>
            <li>Administering academic counselling and evaluating scholarship eligibility based on exam performance.</li>
            <li>Issuing statutory GST-compliant tax invoices and payment reconciliations.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">3</span>
            Information Security & Data Protection
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            TRANSED LLP implements administrative, technical, and physical safeguards in accordance with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011. All communications with our servers are encrypted using 256-bit Secure Socket Layer (SSL) protocols. Data access is restricted to authorized personnel who have signed non-disclosure agreements.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">4</span>
            Third-Party Disclosures
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We do not sell, rent, or lease personal customer data to commercial telemarketers or external third parties. We share data only with trusted infrastructure partners essential for service delivery, such as:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1.5">
            <li><strong>Payment Aggregators (Cashfree Payments):</strong> To process online fee transactions securely.</li>
            <li><strong>Cloud Service Providers (Google Firebase / GCP):</strong> For encrypted database storage and real-time syncing.</li>
            <li><strong>Regulatory / Law Enforcement Bodies:</strong> Strictly where required under applicable Indian laws or judicial orders.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">5</span>
            Cookies & Local Storage
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Our platform uses cookies and browser local storage strictly to remember user session states, prevent CSRF attacks, maintain candidate login sessions, and optimize page load speeds. Users can disable cookies in browser preferences, though certain interactive features may be limited.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-[#002147]">Grievance Officer & Data Controller Details</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            In compliance with Information Technology Act, 2000 and rules made thereunder, the contact details of the Grievance Officer for TRANSED LLP are:
            <br />
            <strong>Grievance Officer:</strong> Legal & Compliance Officer, TRANSED LLP
            <br />
            <strong>Address:</strong> FIITJEE House, 29-A, Kalu Sarai, Sarvapriya Vihar, New Delhi - 110016, India
            <br />
            <strong>Email:</strong> <a href="mailto:transedllp@gmail.com" className="text-[#ED1C24] font-semibold underline">transedllp@gmail.com</a> / <a href="mailto:support@fiitjee.online" className="text-[#ED1C24] font-semibold underline">support@fiitjee.online</a>
          </p>
        </section>
      </div>
    </div>
  );
};

/* =========================================================================
   3. CANCELLATION & REFUND POLICY
   ========================================================================= */
export const RefundPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-slate-700 leading-relaxed font-normal">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-black text-[#ED1C24] uppercase tracking-wider">
          <RefreshCw className="w-4 h-4" />
          <span>Payment Gateway Approved SLA</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#002147] tracking-tight uppercase">
          Cancellation & Refund Policy
        </h1>
        <p className="text-slate-500 text-sm font-semibold uppercase">
          Legal Entity: TRANSED LLP | Last Updated: March 2026
        </p>
      </div>

      {/* SLA Highlight Card */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <Clock className="w-5 h-5 text-amber-700" />
          <span>Refund Processing SLA (Standard Payment Gateway Guideline)</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          Approved refunds are processed and credited back to the original source of payment (Credit Card / Debit Card / Net Banking / UPI Account) within <strong>5 to 7 business days</strong> from the date the refund request is verified and authorized by <strong>TRANSED LLP</strong>.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">1</span>
            Admission & Diagnostic Test Registration Fees
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Registration fees paid for examination seat allocations (e.g., Big Bang Edge Test, FTRE, and admission assessment tests) cover individual computer workstation reservation, printed question paper provisioning, digital hall ticket generation, and proctoring logistics.
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1.5">
            <li><strong>Cancellation Before Cutoff:</strong> If a student or guardian submits a cancellation request in writing at least <strong>7 calendar days</strong> prior to the designated test date, a refund of 80% of the registration fee will be granted (20% retained toward administrative overhead).</li>
            <li><strong>Cancellation Within 7 Days:</strong> Registration cancellations requested within 7 days of the scheduled exam or on/after the exam date are non-refundable as logistics and seating arrangements are finalized.</li>
            <li><strong>Non-Attendance (No-Show):</strong> If a candidate fails to report for the examination on the test date, no refund will be provided. However, the student may request rescheduling to a subsequent test date where available.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">2</span>
            Duplicate or Excess Transactions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            In the event that a user experiences a network interruption or multiple card debits for the same registration, TRANSED LLP will refund <strong>100%</strong> of the duplicate excess transaction. Once reported with the transaction references (Cashfree Payment ID / Order ID), the duplicate charge will be verified within 24 hours and credited within <strong>5–7 working days</strong>.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">3</span>
            Test Cancellation or Rescheduling by TRANSED LLP / FIITJEE
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            If an examination date or center is cancelled entirely by TRANSED LLP / FIITJEE due to unforeseen administrative constraints or force majeure, candidates will be offered the choice of:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1.5">
            <li>An alternate test date / time slot without any additional fee.</li>
            <li>A <strong>full 100% refund</strong> of the paid registration fee credited back to their original payment mode within 5–7 business days.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">4</span>
            How to Submit a Refund or Cancellation Request
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To request a refund or cancellation, please contact our merchant support team with the following details:
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-1 text-slate-700 font-mono">
            <div>• Registered Student Name & Roll Number</div>
            <div>• Registered Mobile Number & Email Address</div>
            <div>• Transaction / Order ID (e.g. ORD_BBET_... or CF-...)</div>
            <div>• Date of Transaction and Amount Paid</div>
            <div>• Reason for Cancellation</div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Send the above details via email to: <a href="mailto:support@fiitjee.online" className="text-[#ED1C24] font-semibold underline">support@fiitjee.online</a> or <a href="mailto:transedllp@gmail.com" className="text-[#ED1C24] font-semibold underline">transedllp@gmail.com</a>. You can also raise a ticket through the <strong>Student Dashboard Support Desk</strong>.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-[#002147]">Mode of Refund</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            All refunds are initiated digitally through the payment aggregator (Cashfree) directly to the original bank account, credit card, debit card, or UPI VPA from which the transaction was initiated. Under no circumstances are cash refunds handed out.
          </p>
        </section>
      </div>
    </div>
  );
};

/* =========================================================================
   4. SHIPPING & DIGITAL DELIVERY POLICY
   ========================================================================= */
export const ShippingPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-slate-700 leading-relaxed font-normal">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-black text-[#ED1C24] uppercase tracking-wider">
          <Truck className="w-4 h-4" />
          <span>Fulfillment & Delivery Disclosures</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#002147] tracking-tight uppercase">
          Shipping & Delivery Policy
        </h1>
        <p className="text-slate-500 text-sm font-semibold uppercase">
          Legal Entity: TRANSED LLP | Digital Service Fulfillment
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs">
        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">1</span>
            Digital Fulfillment of Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            <strong>TRANSED LLP</strong> delivers educational examination registrations, assessment seat allocations, diagnostic tests, and candidate management services. Because these services are entirely electronic and service-oriented, <strong>no tangible physical goods are shipped or delivered via post/courier</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">2</span>
            Delivery Timelines & Mode of Access
          </h2>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-2">
            <li>
              <strong>Official Hall Ticket & Tax Invoice:</strong> Delivered electronically and immediately on the screen upon successful payment verification. Candidates can instantly download and print the document.
            </li>
            <li>
              <strong>Confirmation Communication:</strong> A confirmation email containing the registered Roll Number, Centre Address, Test Timings, and Hall Ticket download link is dispatched automatically to the candidate's email within <strong>0 to 15 minutes</strong> of transaction completion.
            </li>
            <li>
              <strong>Student Portal Credentials:</strong> Candidates can log in to the Student Portal (<strong>fiitjee.online/student/login</strong>) using their Roll Number / Email anytime 24/7 to re-download hall tickets, view test schedules, access sample papers, or review examination scorecards.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-[#002147] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#ED1C24] flex items-center justify-center text-xs font-bold">3</span>
            Support for Non-Receipt
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            In rare cases of email spam filtering or network latency, if a candidate has not received their digital hall ticket or confirmation email within 30 minutes of payment debit, please email <a href="mailto:support@fiitjee.online" className="text-[#ED1C24] font-semibold underline">support@fiitjee.online</a> or call our helpline at <strong>011-49283471</strong> for instantaneous manual issuance.
          </p>
        </section>
      </div>
    </div>
  );
};

/* =========================================================================
   5. CONTACT US & MERCHANT DETAILS
   ========================================================================= */
export const ContactUsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-slate-700 leading-relaxed font-normal">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-black text-[#ED1C24] uppercase tracking-wider">
          <Building className="w-4 h-4" />
          <span>Merchant & Support Information</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#002147] tracking-tight uppercase">
          Contact Us
        </h1>
        <p className="text-slate-500 text-sm font-semibold uppercase">
          Operating Entity: TRANSED LLP | Official Contact Desk
        </p>
      </div>

      {/* Grid of Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Merchant Legal Info Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#ED1C24] flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#002147] uppercase">Legal Entity</h3>
            <p className="text-xs text-slate-500 font-semibold uppercase mt-0.5">Payment Gateway Merchant</p>
          </div>
          <div className="text-xs sm:text-sm text-slate-700 space-y-2 pt-2 border-t border-slate-100">
            <div><span className="font-bold text-slate-900">Entity Name:</span> TRANSED LLP</div>
            <div><span className="font-bold text-slate-900">Industry:</span> Educational Admissions & Examination Support</div>
            <div><span className="font-bold text-slate-900">Portal:</span> fiitjee.online</div>
            <div><span className="font-bold text-slate-900">Status:</span> Active Registered Limited Liability Partnership</div>
          </div>
        </div>

        {/* Operating Address Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#ED1C24] flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#002147] uppercase">Operating & Registered Office</h3>
            <p className="text-xs text-slate-500 font-semibold uppercase mt-0.5">Headquarters & Admissions Center</p>
          </div>
          <div className="text-xs sm:text-sm text-slate-700 space-y-1 pt-2 border-t border-slate-100">
            <div className="font-semibold text-slate-900">FIITJEE House, 29-A, Kalu Sarai</div>
            <div>Sarvapriya Vihar (Near Hauz Khas Metro Station)</div>
            <div>New Delhi - 110016, India</div>
          </div>
        </div>

        {/* Email & Phone Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#ED1C24] flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#002147] uppercase">Customer & Payment Support</h3>
            <p className="text-xs text-slate-500 font-semibold uppercase mt-0.5">Inquiries, Refunds & Receipts</p>
          </div>
          <div className="text-xs sm:text-sm text-slate-700 space-y-2 pt-2 border-t border-slate-100">
            <div>
              <span className="font-bold text-slate-900">Official Support Email:</span>
              <br />
              <a href="mailto:support@fiitjee.online" className="text-[#ED1C24] font-semibold underline">support@fiitjee.online</a>
            </div>
            <div>
              <span className="font-bold text-slate-900">Billing & Gateway Queries:</span>
              <br />
              <a href="mailto:transedllp@gmail.com" className="text-[#ED1C24] font-semibold underline">transedllp@gmail.com</a>
            </div>
          </div>
        </div>

        {/* Helpline & Operating Hours Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#ED1C24] flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#002147] uppercase">Phone & Working Hours</h3>
            <p className="text-xs text-slate-500 font-semibold uppercase mt-0.5">Direct Helpdesk</p>
          </div>
          <div className="text-xs sm:text-sm text-slate-700 space-y-2 pt-2 border-t border-slate-100">
            <div>
              <span className="font-bold text-slate-900">Toll-Free Helpline:</span> 1800 11 4242
            </div>
            <div>
              <span className="font-bold text-slate-900">Direct Desk:</span> 011-49283471
            </div>
            <div>
              <span className="font-bold text-slate-900">Operating Hours:</span>
              <br />
              Monday – Saturday: 09:30 AM to 06:30 PM IST
              <br />
              Sunday: 10:00 AM to 02:00 PM IST (Exam Days)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
