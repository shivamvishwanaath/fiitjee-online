import React, { useState } from 'react';
import { 
  Award, 
  BookOpen, 
  Briefcase, 
  ShieldAlert, 
  Calendar, 
  MapPin, 
  Send,
  CheckCircle2,
  Clock,
  Heart
} from 'lucide-react';

/* =========================================================================
   1. CHAIRMAN'S MESSAGE
   ========================================================================= */
export const ChairmansMessage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-slate-700 leading-relaxed font-medium">
      {/* Header Banner */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-black text-[#ED1C24] uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Bedrock of Values & Ethics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#002147] tracking-tight uppercase">
          Chairman's Message
        </h1>
        <p className="text-slate-500 text-sm font-semibold uppercase">Pedagogy of Excellence and Bedrock of Integrity</p>
      </div>

      {/* Quote Block */}
      <div className="bg-slate-50 border-l-4 border-[#FEC400] rounded-r-2xl p-6 md:p-8 space-y-4">
        <p className="text-lg font-bold text-[#002147] italic">
          "Education is not just filling the mind with facts. It is about igniting a passion for learning, cultivating analytical rigor, and building character based on truth and dedication."
        </p>
        <div className="text-right">
          <span className="block font-black text-[#002147] text-sm">— Mr. D.K. Goel</span>
          <span className="block text-[10px] uppercase font-bold text-slate-500">Founder & Chairman, FIITJEE Group</span>
        </div>
      </div>

      {/* Message Body */}
      <div className="space-y-6 text-sm">
        <p>
          FIITJEE was created in 1992 with a very clear vision: to provide a platform of absolute integrity and excellence for students preparing for the toughest competitive examinations in the country. Over the past three decades, we have evolved from a simple forum for IIT-JEE into a comprehensive education institution with schooling, digital portals, and global platforms.
        </p>
        <p>
          We believe that success in IIT-JEE or any high-stakes scholastic platform requires more than just shortcuts or rote memorization. It requires a <strong>"Pattern-Proof"</strong> mindset. This mindset is nurtured when students learn concepts from first principles and master Physics, Chemistry, and Mathematics through discovery-based learning.
        </p>
        <p>
          Our HODs and faculty are trained to guide each student's mental conditioning, IQ development, and confidence. We do not compromise on instructional quality or make false claims. All our selections originate from long-term, verifiable classroom programs.
        </p>
        <p>
          To parents, I assure you: we treat your child's aspiration with the highest degree of respect and sincerity. Together, we will build a bright future based on character, hard work, and values.
        </p>
      </div>

      {/* Sign-off */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <div>
          <span className="block font-black text-[#002147]">D.K. Goel</span>
          <span className="block text-[10px] font-bold text-slate-500 uppercase">Chairman, FIITJEE Group</span>
        </div>
        <div className="w-24 h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 italic">Signature Block</span>
        </div>
      </div>
    </div>
  );
};


/* =========================================================================
   2. OUR JOURNEY
   ========================================================================= */
export const OurJourney: React.FC = () => {
  const milestones = [
    {
      year: '1992',
      title: 'The Inception',
      desc: 'Founded by Mr. DK Goel in Kalu Sarai, South Delhi, as a forum for IIT-JEE prep with just a handful of dedicated HODs.',
      icon: Award
    },
    {
      year: '1997',
      title: 'First Classroom Batch',
      desc: 'Transitioned to formal classroom program modules. Captured top ranks instantly, establishing the trademark FIITJEE teaching methodology.',
      icon: BookOpen
    },
    {
      year: '2005',
      title: 'Launch of FTRE',
      desc: 'Inception of the FIITJEE Talent Reward Exam, expanding scholarship opportunities to millions of students across junior classes.',
      icon: Calendar
    },
    {
      year: '2012',
      title: 'IIT-JEE Historic Sweep',
      desc: 'FIITJEE classroom program students swept All India Ranks 1, 2, and 3 in the IIT-JEE examination for the first time in history.',
      icon: CheckCircle2
    },
    {
      year: '2021',
      title: 'JEE Advanced Domain Swept Again',
      desc: 'Re-captured AIR 1, 2, and 3 in JEE Advanced from long-term classroom courses, setting a pattern-proof dominance benchmark.',
      icon: CheckCircle2
    },
    {
      year: '2026',
      title: 'The Digital Horizon',
      desc: 'Integrated eSchool live two-way classes and myPAT assessment suites, delivering FIITJEE pedagogy to every corner of India.',
      icon: Clock
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-black text-[#ED1C24] uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>Over 3 Decades of Excellence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#002147] tracking-tight uppercase">
          Our Journey
        </h1>
        <p className="text-slate-500 text-sm font-semibold uppercase">The Evolution of India's Premium Prep Institution</p>
      </div>

      {/* Vertical Timeline */}
      <div className="relative border-l-2 border-slate-200 pl-6 ml-4 space-y-12">
        {milestones.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="relative group">
              {/* Gold dot icon marker */}
              <div className="absolute -left-[38px] top-1.5 w-6 h-6 rounded-full bg-[#FEC400] text-[#002147] flex items-center justify-center border-4 border-white shadow-sm shrink-0">
                <Icon className="w-2.5 h-2.5" />
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-[#ED1C24]/30 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-[#ED1C24]">{item.year}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <h3 className="text-base font-black text-[#002147]">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


/* =========================================================================
   3. CAREERS
   ========================================================================= */
export const Careers: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Faculty - Physics',
    experience: '3-5 Years',
    message: ''
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setFormData({
        name: '',
        email: '',
        role: 'Faculty - Physics',
        experience: '3-5 Years',
        message: ''
      });
    }, 4000);
  };

  const vacancies = [
    { role: 'Senior Faculty - IIT-JEE (Physics/Chemistry/Math)', location: 'Delhi & Mumbai Study Centres', exp: '5+ Years Exp' },
    { role: 'Associate Faculty - Foundation (Science & Math)', location: 'Bangalore & Hyderabad Centres', exp: '2+ Years Exp' },
    { role: 'Academic Operations Manager', location: 'Noida HQ office', exp: '3+ Years Exp' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-black text-[#ED1C24] uppercase tracking-wider">
          <Briefcase className="w-4 h-4" />
          <span>Join the Cult of Excellence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#002147] tracking-tight uppercase">
          Careers at FIITJEE
        </h1>
        <p className="text-slate-500 text-sm font-semibold uppercase">Inspire, Mentor and Grow with the Industry Leaders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Vacancies */}
        <div className="space-y-6">
          <h2 className="text-lg font-black text-[#002147] uppercase tracking-wide border-b-2 border-slate-200 pb-2">
            Current Vacancies
          </h2>
          <div className="space-y-4">
            {vacancies.map((v, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                <h3 className="text-xs font-black text-[#002147]">{v.role}</h3>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase pt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#ED1C24]" />
                    <span>{v.location}</span>
                  </div>
                  <span>{v.exp}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-black text-[#ED1C24] uppercase">Why Teach at FIITJEE?</h3>
            <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
              We offer unmatched academic freedom, structured research tools, direct mentoring under HODs, and rewards linked directly to success milestones.
            </p>
          </div>
        </div>

        {/* Right Column: Quick Apply Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-[#002147] uppercase tracking-wide border-b-2 border-slate-200 pb-2">
            Quick Application
          </h2>
          
          {success && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Application sent successfully! Our HR team will connect.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="Enter your name" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED1C24] font-semibold bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="email@example.com" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED1C24] font-semibold bg-slate-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Position</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED1C24] font-bold bg-slate-50"
                >
                  <option value="Faculty - Physics">Faculty - Physics</option>
                  <option value="Faculty - Chemistry">Faculty - Chemistry</option>
                  <option value="Faculty - Mathematics">Faculty - Mathematics</option>
                  <option value="Associate HOD">Associate HOD</option>
                  <option value="Operations/Non-Academic">Operations/Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Experience</label>
                <select 
                  value={formData.experience}
                  onChange={e => setFormData({...formData, experience: e.target.value})}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED1C24] font-bold bg-slate-50"
                >
                  <option value="0-2 Years">0-2 Years</option>
                  <option value="3-5 Years">3-5 Years</option>
                  <option value="5-8 Years">5-8 Years</option>
                  <option value="8+ Years">8+ Years</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Cover Note & Resume URL</label>
              <textarea 
                required 
                rows={3}
                placeholder="Provide a brief summary of your qualifications or Link to your CV" 
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED1C24] font-semibold bg-slate-50"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Resume</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};


/* =========================================================================
   4. POLICIES & OTHER INFO
   ========================================================================= */
export const Policies: React.FC = () => {
  const sections = [
    {
      title: 'Fee Refund Guidelines',
      desc: 'FIITJEE adheres to strict, transparent guidelines on fee structures. Refund requests originating from withdrawal before batch commencement are processed within 15 working days, subject to the registration fee deductions as stated in the enrolment terms.',
      icon: ShieldAlert
    },
    {
      title: 'Scholarship Eligibility & Retention Rules',
      desc: 'Scholarships earned via FTRE or admission tests are subject to term-wise performance evaluations. Students must maintain a minimum of 75% class attendance and stay within the top 50% performance bracket of their batch to retain fee waivers.',
      icon: Award
    },
    {
      title: 'Student Wellness & Mental Health Protocols',
      desc: 'Student health and stress control is our highest priority. Every study center is equipped with a full-time dedicated student counselor to address anxiety, performance block, or stress. We conduct regular meditation workshops.',
      icon: Heart
    },
    {
      title: 'Anti-Ragging & Classroom Code of Conduct',
      desc: 'FIITJEE maintains a zero-tolerance policy against ragging, bullying, or disruption of classroom discipline. Students are expected to adhere to the code of conduct to support a highly focus-driven study environment.',
      icon: BookOpen
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-black text-[#ED1C24] uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Quality Standards & Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#002147] tracking-tight uppercase">
          Policies & Student Code
        </h1>
        <p className="text-slate-500 text-sm font-semibold uppercase">Institutional Guidelines, Student Wellness & Scholarship Protocols</p>
      </div>

      {/* Grid of Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((v, idx) => {
          const Icon = v.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-[#ED1C24]/30 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#ED1C24] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-[#002147]">{v.title}</h3>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  {v.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
