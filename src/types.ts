export interface Program {
  id: string;
  name: string;
  targetClasses: string; // e.g. "Class VI", "Class XI", "Class XII Pass"
  duration: string;
  badge?: string;
  category: 'classroom' | 'integrated' | 'eschool' | 'non-classroom' | 'crash';
  targetExams: string[];
  summary: string;
  keyFeatures: string[];
  eligibility: string;
  commencement: string;
  mode: 'Offline Classroom' | 'Integrated School' | 'Live Online' | 'Distance / Test Series';
  recommendedFor: string;
  feeRange: string;
}

export interface Topper {
  id: string;
  name: string;
  rank: string | number;
  exam: string;
  year: number | string;
  program: string;
  center?: string;
  scoreOrMarks?: string;
  image: string;
  quote?: string;
  categoryRank?: string;
  college?: string;
}

export interface CenterLocation {
  id: string;
  city: string;
  state: string;
  name: string;
  address: string;
  phone: string[];
  email: string;
  isNationalHub?: boolean;
  programsOffered: string[];
  timing: string;
  pincode: string;
}

export interface CbtQuestion {
  id: number;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  topic: string;
  type: 'single' | 'multiple' | 'numerical';
  difficulty: 'Easy' | 'Medium' | 'Challenging (IIT-JEE Adv Level)';
  questionText: string;
  diagramSvg?: string;
  options?: {
    id: string;
    text: string;
  }[];
  correctAnswer: string | string[];
  explanation: string;
  formulaHint?: string;
}

export interface Notice {
  id: string;
  date: string;
  title: string;
  category: 'Exam Date' | 'Admit Card' | 'Result' | 'Admission' | 'Scholarship';
  isUrgent?: boolean;
  linkText: string;
  linkAction?: string;
}

export interface ExamCenter {
  city: string;
  phone: string;
  address?: string;
}

export interface AdmissionExam {
  id: string;
  name: string;
  fullBrandedName: string;
  tagline: string;
  description: string;
  targetClasses: string[];
  targetClassesDisplay: string;
  testDates: string[];
  modes: ('Offline' | 'Proctored Online')[];
  offlineCenters: ExamCenter[];
  year: string;
  registrationOpen: boolean;
  registrationDbPath: string;
  registrationFee?: number;
  isFree?: boolean;
}

export interface RegistrationNote {
  text: string;
  addedBy: string;
  addedAt: string;
}

export interface ExamRegistration {
  id?: string;
  examId: string;
  examYear: string;
  studentName: string;
  parentName: string;
  currentClass: string;
  schoolName: string;
  phone: string;
  email: string;
  testDate: string;
  testMode: 'Offline' | 'Proctored Online';
  selectedCenter?: string;
  registeredAt: string;
  rollNo: string;
  // Official Hall Ticket & Tax Invoice Fields
  address?: string;
  sid?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  // Payment & Coupon Fields
  paymentStatus?: 'free' | 'paid' | 'pending' | 'failed';
  paymentAmount?: number;
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  couponCodeApplied?: string;
  discountAmount?: number;
  // Admin & CRM Workflow Fields
  status?: 'New' | 'Contacted' | 'Confirmed' | 'Absent' | 'Selected';
  notes?: RegistrationNote[];
  paymentRef?: string;
  registeredByCentre?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  // CRM Tracking
  followUpDate?: string;
  lastContactedAt?: string;
  contactChannel?: 'email' | 'phone' | 'whatsapp' | 'in-person';
}

export interface CouponRedemption {
  id?: string;
  email: string;
  studentName: string;
  rollNo: string;
  claimedAt: string;
  amountSaved: number;
}

export interface CouponProfile {
  id: string;
  code: string;
  description?: string;
  centreId: string; // e.g. 'Bhubaneswar', 'Dwarka', 'Ranchi', 'Hyderabad', or 'ALL'
  discountType: 'full' | 'percent' | 'flat';
  discountValue: number; // 100 for full waiver, or % or ₹
  maxUses: number; // 1 for single-use, >1 for multi-use
  usedCount: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  isEmailRestricted: boolean;
  allowedEmails?: string[];
  createdBy: string;
  createdAt: string;
  redemptions?: Record<string, CouponRedemption>;
}

export interface CRMInteractionLog {
  id?: string;
  rollNo: string;
  type: 'email_sent' | 'call_log' | 'manual_note' | 'sms_prep';
  content: string;
  by: string;
  at: string;
}

export interface CRMCampaign {
  id: string;
  centreId: string;
  title: string;
  channel: 'email' | 'copy_phone';
  subject?: string;
  body?: string;
  audienceCount: number;
  status: 'draft' | 'sent';
  createdAt: string;
  createdBy: string;
  sentAt?: string;
}

export interface StudentExamLink {
  examId: string;
  examName: string;
  rollNo: string;
  centreId: string;
  selectedCenter: string;
  testDate: string;
  testMode: 'Offline' | 'Proctored Online';
  registeredAt: string;
  paymentStatus: 'free' | 'paid' | 'pending' | 'failed';
  paymentAmount: number;
  paymentRef?: string;
  invoiceNo?: string;
  sid?: string;
}

export interface StudentProfile {
  uid: string;
  fullName: string;
  parentName: string;
  email: string;
  phone: string;
  currentClass: string;
  schoolName: string;
  preferredCentreId?: string;
  city?: string;
  state?: string;
  pincode?: string;
  createdAt: string;
  lastLoginAt?: string;
  registeredExams?: Record<string, StudentExamLink>;
}

export interface SupportTicket {
  ticketId: string;
  studentUid: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  rollNo?: string;
  category: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high';
  centreId: string;
  submittedAt: string;
  lastUpdatedAt: string;
  adminReply?: string;
  adminRepliedAt?: string;
  adminRepliedBy?: string;
}

export interface ExamResult {
  rollNo: string;
  studentName?: string;
  totalMarks: number;
  marksObtained: number;
  percentile?: number;
  allIndiaRank?: number;
  scholarshipTier?: string;
  subjectBreakdown?: Record<string, { marks: number; max: number }>;
  publishedAt?: string;
}
