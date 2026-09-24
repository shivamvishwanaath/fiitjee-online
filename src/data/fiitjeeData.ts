import { Program, Topper, CenterLocation, CbtQuestion, Notice } from '../types';

export const PROGRAMS: Program[] = [
  {
    id: 'pinnacle-two-year',
    name: 'PINNACLE - Two Year Integrated School Program',
    targetClasses: 'Class XI',
    duration: '2 Years',
    badge: 'Flagship Integrated',
    category: 'integrated',
    targetExams: ['JEE Advanced', 'JEE Main', 'XII Boards', 'Olympiads'],
    summary: 'The ultimate synchronized program integrating senior secondary school syllabus with JEE Advanced coaching within school hours, eliminating extra commute.',
    keyFeatures: [
      'Zero collision between School & JEE study schedules',
      'Comprehensive coverage of Physics, Chemistry & Mathematics',
      'Simultaneous preparation for Board Exams (100% focused) & JEE Advanced',
      'Regular Chapter Practice Problems (CPP) & All India Internal Test Series (AI²TS)',
      'Dedicated doubt clearing sessions & personalized performance mentoring'
    ],
    eligibility: 'Admission through FTRE / FIITJEE Admission Test / Big Bang Edge Test',
    commencement: 'April / June 2026',
    mode: 'Integrated School',
    recommendedFor: 'Students entering Class XI aiming for Top 500 AIR in JEE Advanced without dual-stress of school and coaching.',
    feeRange: '₹2,40,000 - ₹3,10,000 / yr (Scholarships up to 100% via FTRE)'
  },
  {
    id: 'two-year-classroom',
    name: 'Two Year Classroom Program for JEE (Advanced)',
    targetClasses: 'Class XI',
    duration: '2 Years',
    badge: 'Most Popular',
    category: 'classroom',
    targetExams: ['JEE Advanced', 'JEE Main', 'Olympiads'],
    summary: 'FIITJEE’s legendary classroom program designed to build deep conceptual clarity, analytical thinking, and exam temperament from fundamentals to IIT-JEE level.',
    keyFeatures: [
      'Over 850+ hours of intense, pattern-proof classroom teaching',
      'Standardized FIITJEE Study Package + Grand Master Package (GMP)',
      'Computer-Based All India Test Series (AITS) with national percentile benchmarking',
      'Pattern-Proof testing to excel regardless of changing JEE paper patterns',
      'Rankers Study Material & Compendium with solution archive'
    ],
    eligibility: 'Selection via FTRE or General Admission Test',
    commencement: 'April / July 2026',
    mode: 'Offline Classroom',
    recommendedFor: 'Serious aspirants starting Class XI dedicated to securing Top IIT branches (CSE, MnC, Electrical).',
    feeRange: '₹1,95,000 - ₹2,60,000 / yr (Scholarships available)'
  },
  {
    id: 'supreme-four-year',
    name: 'SUPREME - Four Year Integrated School Program',
    targetClasses: 'Class IX',
    duration: '4 Years',
    badge: 'Early Mover Advantage',
    category: 'integrated',
    targetExams: ['JEE Advanced', 'JEE Main', 'X & XII Boards', 'NSEJS', 'IJSO', 'RMO'],
    summary: 'Starts right after Class VIII. Develops profound mathematical rigor and scientific temperament while smoothly covering 9th-12th school curricula.',
    keyFeatures: [
      'Comprehensive 4-Year roadmap spanning Class IX to XII',
      'Mastery over Olympiads (Physics, Astronomy, Math, Chemistry) & Junior Science',
      'Seamless transition from Foundation concepts to advanced JEE calculus and mechanics',
      'Exclusive batch mentoring by Senior FIITJEE HODs'
    ],
    eligibility: 'FTRE / Big Bang Edge Test',
    commencement: 'April 2026',
    mode: 'Integrated School',
    recommendedFor: 'Motivated students moving from Class VIII to IX targeting Top 100 AIR in JEE Advanced.',
    feeRange: '₹2,20,000 / yr'
  },
  {
    id: 'ascent-two-year',
    name: 'ASCENT - Two Year Classroom Program',
    targetClasses: 'Class IX & X',
    duration: '2 Years',
    badge: 'Foundation Leader',
    category: 'classroom',
    targetExams: ['IOQJS', 'NSEJS', 'PRMO / RMO', 'NTSE', 'Class X Boards', 'JEE Foundation'],
    summary: 'Cultivates sharp logical deduction, raises IQ, and strengthens Physics, Chemistry, Biology, Mathematics & Mental Ability for national olympiads.',
    keyFeatures: [
      'Mental Ability & Analytical Reasoning training',
      'Advance coverage of Class IX & X Science & Math for Olympiad podiums',
      'Foundation for early JEE Advanced preparation',
      'Quarterly National level benchmarking and diagnostic reports'
    ],
    eligibility: 'FIITJEE Admission Test / FTRE',
    commencement: 'April / May 2026',
    mode: 'Offline Classroom',
    recommendedFor: 'Class 9 students aiming for Olympiads and creating an unbeatable base for 11th/12th JEE prep.',
    feeRange: '₹1,10,000 - ₹1,45,000 / yr'
  },
  {
    id: 'udaya-two-year',
    name: 'UDAYA - Two Year Foundation Program',
    targetClasses: 'Class VII & VIII',
    duration: '2 Years',
    badge: 'Junior Genius',
    category: 'classroom',
    targetExams: ['Junior Olympiads', 'NSTSE', 'Green Olympiad', 'School Math & Science'],
    summary: 'Ignites curiosity, transforms how young minds think, and builds rock-solid basics in Science and Mathematics through discovery-based learning.',
    keyFeatures: [
      'Focus on "Thinking Skills" rather than rote memorization',
      'Conceptual experiment demonstrations and speed math shortcuts',
      'School syllabus enhancement with high-order thinking problems (HOTS)',
      'Regular interactive quizzes and parent-teacher counseling'
    ],
    eligibility: 'FTRE or Junior Admission Test',
    commencement: 'April 2026',
    mode: 'Offline Classroom',
    recommendedFor: 'Class 7 students seeking strong scientific aptitude and school exam excellence.',
    feeRange: '₹85,000 - ₹1,10,000 / yr'
  },
  {
    id: 'little-genie',
    name: 'LITTLE GENIE - One Year Foundation Program',
    targetClasses: 'Class VI',
    duration: '1 Year',
    badge: 'Early Start',
    category: 'classroom',
    targetExams: ['School Exams', 'Math Olympiads', 'NSTSE'],
    summary: 'Specially crafted for 6th graders to eliminate fear of math & science, boost IQ, and build structured study habits early.',
    keyFeatures: [
      'Fun-filled logical puzzles, spatial reasoning, and science games',
      'Strengthening elementary algebra, arithmetic, and basic physics',
      'Personal attention with small batch sizes'
    ],
    eligibility: 'Direct Admission / Aptitude Test',
    commencement: 'April 2026',
    mode: 'Offline Classroom',
    recommendedFor: 'Class 6 students to develop a passion for problem solving.',
    feeRange: '₹65,000 / yr'
  },
  {
    id: 'special-one-year-passout',
    name: 'Special One Year Classroom Program for XII Pass / Dropper',
    targetClasses: 'Class XII Pass',
    duration: '1 Year (Fast-Track)',
    badge: 'High Impact',
    category: 'crash',
    targetExams: ['JEE Advanced', 'JEE Main'],
    summary: 'A rigorously calibrated intensive program for 12th pass students to eliminate weaknesses, perfect problem-solving speed, and jump 5,000+ ranks.',
    keyFeatures: [
      '6 days/week high-intensity problem solving and concept revision',
      'Full Computer-Based All India Test Series (CBT-AITS) included',
      'Grand Master Package (GMP) with 1500+ handpicked challenging problems',
      'Rigorous error analysis and rank booster modules'
    ],
    eligibility: 'JEE Main Percentile / Board Marks / Direct Test',
    commencement: 'June / July 2026',
    mode: 'Offline Classroom',
    recommendedFor: 'Passout students determined to achieve a top rank in their next attempt.',
    feeRange: '₹1,50,000 - ₹1,95,000'
  },
  {
    id: 'eschool-live-online',
    name: 'FIITJEE eSchool - Live 2-Way Interactive Online',
    targetClasses: 'Class VI to XII & XII Pass',
    duration: '1 to 4 Years',
    badge: 'Learn From Anywhere',
    category: 'eschool',
    targetExams: ['JEE Advanced', 'JEE Main', 'Olympiads', 'Boards'],
    summary: 'Brings the legendary FIITJEE classroom pedagogy to your home. Live audio-video interaction with premier faculty, digital whiteboard, and instant doubt resolution.',
    keyFeatures: [
      'Live 2-Way Interactive Classes (Not pre-recorded videos)',
      'Digital Study Material + Hard Copy dispatched to your doorstep',
      'Online Computer-Based Tests with AI-powered performance analytics',
      'Live online doubt clearing rooms 6 days a week'
    ],
    eligibility: 'eFTRE / Online Admission Test',
    commencement: 'Rolling Batches',
    mode: 'Live Online',
    recommendedFor: 'Students in cities without a physical FIITJEE center or seeking flexible home-based learning.',
    feeRange: '₹75,000 - ₹1,65,000 / yr'
  },
  {
    id: 'aits-cbt-series',
    name: 'Computer Based All India Test Series (AITS)',
    targetClasses: 'Class XI, XII & XII Pass',
    duration: '1 Year',
    badge: 'National Benchmark',
    category: 'non-classroom',
    targetExams: ['JEE Advanced', 'JEE Main'],
    summary: 'The gold standard test series taken by 90%+ of top 1000 IIT rankers across India. Replicates actual JEE CBT interface with intricate national rank predictor.',
    keyFeatures: [
      '24+ Part & Full Syllabus CBT Tests on exact NTA / IIT-JEE interface',
      'Video solutions and detailed step-by-step diagnostic analysis',
      'Real-time All India Rank, Percentile, and Topic-wise accuracy metrics',
      'Concept strengthening RTPF (Rankers Test Paper File)'
    ],
    eligibility: 'Open Registration',
    commencement: 'September 2026',
    mode: 'Distance / Test Series',
    recommendedFor: 'Students needing real exam simulation and all-India ranking before the main exams.',
    feeRange: '₹14,500 - ₹24,000'
  }
];

export const TOPPERS: Topper[] = [
  // JEE Advanced 2025
  {
    id: 'ta-25-1',
    name: 'Ujjwal Kesari',
    rank: '5',
    exam: 'JEE Advanced 2025',
    year: 2025,
    program: 'Rankers Study Material (RSM) (XI-XII)',
    image: 'student_photos/jee-advanced-2025_Ujjwal_Kesari_rank_5.webp'
  },
  {
    id: 'ta-25-2',
    name: 'Arnav Singh',
    rank: '9',
    exam: 'JEE Advanced 2025',
    year: 2025,
    program: 'FIITJEE World School (VIII-X) + PINNACLE : Two Year Integrated Program (XI-XII)',
    image: 'student_photos/jee-advanced-2025_Arnav_Singh_rank_9.webp'
  },
  {
    id: 'ta-25-3',
    name: 'Devdutta Majhi',
    rank: '16',
    exam: 'JEE Advanced 2025',
    year: 2025,
    program: 'Two Year Live Interactive Online Classroom Program under eSchool (XI-XII)',
    image: 'student_photos/jee-advanced-2025_Devdutta_Majhi_rank_16.webp'
  },
  {
    id: 'ta-25-4',
    name: 'Sanidhya Saraf',
    rank: '31',
    exam: 'JEE Advanced 2025',
    year: 2025,
    program: 'PINNACLE: Two Year Integrated School Program (XI-XII)',
    image: 'student_photos/jee-advanced-2025_Sanidhya_Saraf_rank_31.webp'
  },
  {
    id: 'ta-25-5',
    name: 'Advay Mayank',
    rank: '36',
    exam: 'JEE Advanced 2025',
    year: 2025,
    program: 'Three Year Classroom Program (X-XII)',
    image: 'student_photos/jee-advanced-2025_Advay_Mayank_rank_36.webp'
  },
  {
    id: 'ta-25-6',
    name: 'Karmanya Gupta',
    rank: '37',
    exam: 'JEE Advanced 2025',
    year: 2025,
    program: 'Rankers Study Material (RSM) (XI-XII)',
    image: 'student_photos/jee-advanced-2025_Karmanya_Gupta_rank_37.webp'
  },
  {
    id: 'ta-25-7',
    name: 'Ramit Goyal',
    rank: '45',
    exam: 'JEE Advanced 2025',
    year: 2025,
    program: 'Two Year Live Interactive Online Classroom Program under eSchool (XI-XII)',
    image: 'student_photos/jee-advanced-2025_Ramit_Goyal_rank_45.webp'
  },
  {
    id: 'ta-25-8',
    name: 'Aritro Ray',
    rank: '50',
    exam: 'JEE Advanced 2025',
    year: 2025,
    program: 'Four Year Classroom Program (IX-XII)',
    image: 'student_photos/jee-advanced-2025_Aritro_Ray_rank_50.webp'
  },

  // JEE Main 2025
  {
    id: 'tm-25-1',
    name: 'Devdutta Majhi',
    rank: '1',
    exam: 'JEE Main 2025',
    year: 2025,
    program: 'Two Year Live Interactive Online Classroom Program (XI-XII)',
    image: 'student_photos/jee-main-2025_Devdutta_Majhi_rank_1.webp'
  },
  {
    id: 'tm-25-2',
    name: 'Shreyas Lohiya',
    rank: '6',
    exam: 'JEE Main 2025',
    year: 2025,
    program: 'PANINI: Two Year Integrated Program (XI-XII)',
    image: 'student_photos/jee-main-2025_Shreyas_Lohiya_rank_6.webp'
  },
  {
    id: 'tm-25-3',
    name: 'Archisman Nandy',
    rank: '13',
    exam: 'JEE Main 2025',
    year: 2025,
    program: 'Two Year Classroom Program (XI-XII)',
    image: 'student_photos/jee-main-2025_Archisman_Nandy_rank_13.webp'
  },
  {
    id: 'tm-25-4',
    name: 'Aadit P. Bhagade',
    rank: '14',
    exam: 'JEE Main 2025',
    year: 2025,
    program: 'PINNACLE: Two Year Integrated School Program (XI-XII)',
    image: 'student_photos/jee-main-2025_Aadit_P._Bhagade_rank_14.webp'
  },
  {
    id: 'tm-25-5',
    name: 'Harssh A Gupta',
    rank: '15',
    exam: 'JEE Main 2025',
    year: 2025,
    program: 'PINNACLE: Two Year Integrated Program (XI-XII)',
    image: 'student_photos/jee-main-2025_Harssh_A_Gupta_rank_15.webp'
  },

  // JEE Advanced 2024
  {
    id: 'ta-24-1',
    name: 'Ved Lahoti',
    rank: '1',
    exam: 'JEE Advanced 2024',
    year: 2024,
    program: 'Two Year Live Interactive Online Classroom Program (XI - XII)',
    image: 'student_photos/jee-advanced-2024_Ved_Lahoti_rank_1.webp'
  },
  {
    id: 'ta-24-2',
    name: 'Aditya',
    rank: '2',
    exam: 'JEE Advanced 2024',
    year: 2024,
    program: 'Four Year Classroom Program (IX - XII)',
    image: 'student_photos/jee-advanced-2024_Aditya_rank_2.webp'
  },
  {
    id: 'ta-24-3',
    name: 'Rajdeep Mishra',
    rank: '6',
    exam: 'JEE Advanced 2024',
    year: 2024,
    program: 'Two Year Live Interactive Online Classroom Program (XI - XII)',
    image: 'student_photos/jee-advanced-2024_Rajdeep_Mishra_rank_6.webp'
  },
  {
    id: 'ta-24-4',
    name: 'K Tejeswar',
    rank: '8',
    exam: 'JEE Advanced 2024',
    year: 2024,
    program: 'UDAYA: One Year (VIII) + SUPREME: Four Year Integrated Program (IX-XII)',
    image: 'student_photos/jee-advanced-2024_K_Tejeswar_rank_8.webp'
  },

  // JEE Main 2024
  {
    id: 'tm-24-1',
    name: 'Jyotiraditya Mishra',
    rank: '11',
    exam: 'JEE Main 2024',
    year: 2024,
    program: 'Three Year Classroom Program (Class X - XII)',
    image: 'student_photos/jee-main-2024_Jyotiraditya_Mishra_rank_11.webp'
  },
  {
    id: 'tm-24-2',
    name: 'Sanjay Sanjeev',
    rank: '15',
    exam: 'JEE Main 2024',
    year: 2024,
    program: 'Four Year Classroom Program (Class IX - XII)',
    image: 'student_photos/jee-main-2024_Sanjay_Sanjeev_rank_15.webp'
  },

  // Olympiads 2024
  {
    id: 'to-24-1',
    name: 'Bhavya Tiwari',
    rank: 'Gold Medal',
    exam: 'Olympiads 2024',
    year: 2024,
    program: 'Three Year Classroom Program (Class IX - XI)',
    image: 'student_photos/olympiads-2024_Bhavya_Tiwari_rank_Gold_Medal.webp'
  },
  {
    id: 'to-24-2',
    name: 'Harshin Posina',
    rank: 'Gold Medal',
    exam: 'Olympiads 2024',
    year: 2024,
    program: 'Two Year Classroom Program (Class XI - XII)',
    image: 'student_photos/olympiads-2024_Harshin_Posina_rank_Gold_Medal.webp'
  }
];

export const CENTERS: CenterLocation[] = [
  {
    id: 'delhi-south',
    city: 'New Delhi',
    state: 'Delhi NCR',
    name: 'FIITJEE South Delhi (National Corporate Office)',
    address: 'FIITJEE House, 29-A, Kalu Sarai, Sarvapriya Vihar, Near Hauz Khas Metro',
    phone: ['011-49283471', '011-46106000', '1800 11 4242'],
    email: 'southdelhi@fiitjee.com',
    isNationalHub: true,
    programsOffered: ['PINNACLE', 'SUPREME', 'Two Year Classroom', 'UDAYA', 'ASCENT', 'Dropper Special'],
    timing: 'Mon - Sun: 8:30 AM - 7:30 PM',
    pincode: '110016'
  },
  {
    id: 'delhi-punjabi-bagh',
    city: 'New Delhi',
    state: 'Delhi NCR',
    name: 'FIITJEE Punjabi Bagh Centre',
    address: '31, 32, 33, Central Market, West Avenue Road, Punjabi Bagh, New Delhi',
    phone: ['011-45634000', '011-45634001'],
    email: 'punjabibagh@fiitjee.com',
    programsOffered: ['PINNACLE', 'Two Year Classroom', 'ASCENT', 'Dropper Special'],
    timing: 'Mon - Sun: 9:00 AM - 7:00 PM',
    pincode: '110026'
  },
  {
    id: 'delhi-noida',
    city: 'Noida',
    state: 'Uttar Pradesh (Delhi NCR)',
    name: 'FIITJEE Noida Sector-16',
    address: 'B-4, Sector 16, Behind Metro Station, Noida',
    phone: ['0120-4080400', '0120-4080401'],
    email: 'noida@fiitjee.com',
    programsOffered: ['PINNACLE', 'SUPREME', 'Two Year Classroom', 'ASCENT', 'UDAYA'],
    timing: 'Mon - Sun: 9:00 AM - 7:00 PM',
    pincode: '201301'
  },
  {
    id: 'mumbai-andheri',
    city: 'Mumbai',
    state: 'Maharashtra',
    name: 'FIITJEE Andheri West Centre',
    address: '201, 2nd Floor, Sterling Centre, Opp. Andheri Railway Station, Mumbai',
    phone: ['022-42378100', '022-26284700'],
    email: 'andheri@fiitjee.com',
    programsOffered: ['PINNACLE', 'Two Year Classroom', 'ASCENT', 'UDAYA'],
    timing: 'Mon - Sun: 8:30 AM - 7:00 PM',
    pincode: '400058'
  },
  {
    id: 'hyderabad-kukatpally',
    city: 'Hyderabad',
    state: 'Telangana',
    name: 'FIITJEE Kukatpally Centre',
    address: 'Plot No. 22 to 24, MIG, Housing Board Colony, Phase-1, Kukatpally, Hyderabad',
    phone: ['040-66777000', '040-66777001'],
    email: 'kukatpally@fiitjee.com',
    isNationalHub: true,
    programsOffered: ['Integrated College Program', 'PINNACLE', 'Two Year Classroom', 'ASCENT'],
    timing: 'Mon - Sun: 8:00 AM - 8:00 PM',
    pincode: '500072'
  },
  {
    id: 'bengaluru-hsr',
    city: 'Bengaluru',
    state: 'Karnataka',
    name: 'FIITJEE Bengaluru HSR Layout Centre',
    address: '19th Main Road, Sector 4, HSR Layout, Bengaluru',
    phone: ['080-49149999', '080-41135682'],
    email: 'bangalore@fiitjee.com',
    programsOffered: ['PINNACLE', 'Two Year Classroom', 'ASCENT', 'Dropper Special'],
    timing: 'Mon - Sun: 9:00 AM - 7:00 PM',
    pincode: '560102'
  },
  {
    id: 'kolkata-south',
    city: 'Kolkata',
    state: 'West Bengal',
    name: 'FIITJEE Kolkata South Centre',
    address: '124, Southern Avenue, Near Golpark, Kolkata',
    phone: ['033-40566900', '033-40566901'],
    email: 'kolkata.south@fiitjee.com',
    programsOffered: ['PINNACLE', 'SUPREME', 'Two Year Classroom', 'UDAYA', 'ASCENT'],
    timing: 'Mon - Sun: 8:30 AM - 7:30 PM',
    pincode: '700029'
  },
  {
    id: 'chennai-kilpauk',
    city: 'Chennai',
    state: 'Tamil Nadu',
    name: 'FIITJEE Chennai Kilpauk Centre',
    address: 'No. 175, Poonamallee High Road, Opp. Ega Theatre, Kilpauk, Chennai',
    phone: ['044-43937100', '044-42859701'],
    email: 'chennai@fiitjee.com',
    programsOffered: ['PINNACLE', 'Two Year Classroom', 'ASCENT', 'UDAYA'],
    timing: 'Mon - Sun: 9:00 AM - 7:00 PM',
    pincode: '600010'
  },
  {
    id: 'jaipur-malviya',
    city: 'Jaipur',
    state: 'Rajasthan',
    name: 'FIITJEE Jaipur Malviya Nagar',
    address: 'Plot No. 3-A, Girdhar Marg, Sector 9, Malviya Nagar, Jaipur',
    phone: ['0141-4036666', '0141-4036667'],
    email: 'jaipur@fiitjee.com',
    programsOffered: ['PINNACLE', 'Two Year Classroom', 'Dropper Special'],
    timing: 'Mon - Sun: 9:00 AM - 7:00 PM',
    pincode: '302017'
  },
  {
    id: 'dubai-gulf',
    city: 'Dubai',
    state: 'UAE & Gulf (International)',
    name: 'FIITJEE GCC Global Centre (Dubai)',
    address: 'Al Zarooni Building, Al Barsha 1, Sheikh Zayed Road, Dubai, UAE',
    phone: ['+971-4-3563777', '+971-55-9778900'],
    email: 'dubai@fiitjee.com',
    programsOffered: ['eSchool Global', 'Classroom Weekend', 'AITS International'],
    timing: 'Mon - Sun: 9:00 AM - 8:00 PM (GST)',
    pincode: 'UAE-001'
  }
];

export const CBT_SAMPLE_QUESTIONS: CbtQuestion[] = [
  {
    id: 1,
    subject: 'Physics',
    topic: 'Rotational Mechanics & Conservation of Angular Momentum',
    type: 'single',
    difficulty: 'Challenging (IIT-JEE Adv Level)',
    questionText: 'A uniform disc of mass M and radius R is spinning about its vertical axis with angular velocity ω₀. It is placed gently onto a rough horizontal surface with coefficient of friction μ. How much time does it take for the disc to achieve pure rolling without slipping?',
    options: [
      { id: 'A', text: 't = (ω₀ R) / (3 μ g)' },
      { id: 'B', text: 't = (ω₀ R) / (4 μ g)' },
      { id: 'C', text: 't = (ω₀ R) / (2 μ g)' },
      { id: 'D', text: 't = (2 ω₀ R) / (3 μ g)' }
    ],
    correctAnswer: 'A',
    formulaHint: 'Torque due to friction τ = I α; Linear acceleration a = μ g; Condition for rolling: v = ω R.',
    explanation: 'For a disc on a horizontal rough surface, the friction force f = μMg acts to decelerate rotation and accelerate the center of mass. Torque about CM: τ = - f R = - (μMg)R. Moment of Inertia I = 1/2 M R². Hence angular deceleration α = 2μg / R. Linear acceleration a = μg. At pure rolling time t: v(t) = a t = μg t, and ω(t) = ω₀ - α t = ω₀ - (2μg/R)t. Setting v(t) = R ω(t) gives: μgt = R(ω₀ - (2μg/R)t) => μgt = ω₀R - 2μgt => 3μgt = ω₀R => t = (ω₀ R) / (3 μ g).'
  },
  {
    id: 2,
    subject: 'Chemistry',
    topic: 'Coordination Chemistry & Crystal Field Theory (CFT)',
    type: 'single',
    difficulty: 'Medium',
    questionText: 'Which of the following octahedral complexes exhibits the highest crystal field stabilization energy (CFSE) in terms of |Δ₀| in a low-spin configuration?',
    options: [
      { id: 'A', text: '[Co(CN)₆]³⁻ (d⁶ low spin)' },
      { id: 'B', text: '[Fe(H₂O)₆]³⁺ (d⁵ high spin)' },
      { id: 'C', text: '[Cr(H₂O)₆]³⁺ (d³)' },
      { id: 'D', text: '[Ni(NH₃)₆]²⁺ (d⁸)' }
    ],
    correctAnswer: 'A',
    formulaHint: 'CFSE = [-0.4 × n(t₂g) + 0.6 × n(e_g)] Δ₀ + Pairing energy (P)',
    explanation: 'In [Co(CN)₆]³⁻, Co³⁺ is a d⁶ ion with a strong field ligand (CN⁻), resulting in a low-spin t₂g⁶ e_g⁰ configuration. CFSE = 6 × (-0.4 Δ₀) + 2P = -2.4 Δ₀ + 2P. The magnitude 2.4 Δ₀ is the maximum among all transition metal octahedral complexes.'
  },
  {
    id: 3,
    subject: 'Mathematics',
    topic: 'Definite Integration & Leibniz Rule',
    type: 'single',
    difficulty: 'Challenging (IIT-JEE Adv Level)',
    questionText: 'Evaluate the definite integral: I = ∫[0 to π] (x · sin x) / (1 + cos² x) dx.',
    options: [
      { id: 'A', text: 'π² / 4' },
      { id: 'B', text: 'π² / 2' },
      { id: 'C', text: 'π / 4' },
      { id: 'D', text: 'π² / 8' }
    ],
    correctAnswer: 'A',
    formulaHint: 'Use King’s property: ∫[0 to a] f(x) dx = ∫[0 to a] f(a - x) dx.',
    explanation: 'Using King’s property: I = ∫[0 to π] ((π - x) sin(π - x)) / (1 + cos²(π - x)) dx = ∫[0 to π] ((π - x) sin x) / (1 + cos² x) dx. Adding both: 2I = π ∫[0 to π] (sin x) / (1 + cos² x) dx. Substitute u = cos x, du = -sin x dx. As x goes 0 to π, u goes 1 to -1. 2I = π ∫[-1 to 1] du / (1 + u²) = π [arctan(u)]_(-1)^1 = π (π/4 - (-π/4)) = π²/2. Therefore, I = π² / 4.'
  }
];

export const NOTICES: Notice[] = [
  {
    id: 'n-big-bang',
    date: '31 Aug 2026',
    title: 'Registration Open: Big Bang Edge Test — 11th & 18th Oct 2026 | Class V–XI | Offline & Proctored Online | Bhubaneswar · Ranchi · Dwarka · Hyderabad',
    category: 'Exam Date',
    isUrgent: true,
    linkText: 'Register for Big Bang',
    linkAction: 'open-big-bang-modal'
  },
  {
    id: 'n-1',
    date: '28 Aug 2026',
    title: 'FTRE 2026-27 (FIITJEE Talent Reward Exam): Registration Open for Class V, VI, VII, VIII, IX, X & XI with up to 100% Tuition Fee Waiver.',
    category: 'Scholarship',
    isUrgent: true,
    linkText: 'Register for FTRE',
    linkAction: 'open-ftre-modal'
  },
  {
    id: 'n-2',
    date: '26 Aug 2026',
    title: 'Admit Card released for All India Admission Test & Big Bang Edge Test (Offline CBT & Online Proctored).',
    category: 'Admit Card',
    isUrgent: true,
    linkText: 'Download Admit Card',
    linkAction: 'open-ftre-modal'
  },
  {
    id: 'n-3',
    date: '22 Aug 2026',
    title: 'FIITJEEians dominate JEE Advanced 2026 with 37 Ranks in Top 100 All India Rankers from Classroom Programs.',
    category: 'Result',
    isUrgent: false,
    linkText: 'View Rankers'
  },
  {
    id: 'n-4',
    date: '18 Aug 2026',
    title: 'Computer Based All India Test Series (CBT-AITS) for JEE 2027: Registrations open with National Benchmarking.',
    category: 'Exam Date',
    isUrgent: false,
    linkText: 'Explore AITS'
  }
];



export const WHY_FIITJEE_POINTS = [
  {
    title: 'Pattern-Proof Teaching Methodology',
    desc: 'Our faculty prepares students to master fundamental principles so deeply that changes in examination pattern (from subjective to objective, multi-correct, matrix match, numerical integer) never throw them off.',
    icon: 'ShieldCheck'
  },
  {
    title: 'Comprehensive Study Material & GMP',
    desc: 'Rankers Study Material (RSM) and Grand Master Package (GMP) with 1500+ curated problems have remained the undisputed gold standard in competitive test prep for over 3 decades.',
    icon: 'BookOpen'
  },
  {
    title: 'National Level Benchmarking (AITS & AI²TS)',
    desc: 'With tens of thousands of top brains competing on the same test, students receive precise all-India percentile projections and micro-topic diagnostic heatmaps.',
    icon: 'BarChart3'
  },
  {
    title: 'Full-Time Dedicated Faculty Ecosystem',
    desc: 'Unlike generic coaching hubs, all FIITJEE faculty are full-time, exclusively trained through rigorous faculty development programs and strictly monitored for instructional quality.',
    icon: 'GraduationCap'
  },
  {
    title: 'Holistic Student Development & Mental Conditioning',
    desc: 'Beyond academics, regular motivational seminars, stress management, speed-enhancement drills, and meditation sessions keep aspirants peak-ready.',
    icon: 'Sparkles'
  },
  {
    title: 'Integrated Synchronized Schooling',
    desc: 'PINNACLE and SUPREME models save 4-5 hours of daily travel and school-coaching scheduling friction, giving students crucial extra self-study hours.',
    icon: 'Clock'
  }
];
