import { 
  Project, 
  FounderProfile, 
  StructuredFeedback, 
  CollaborationRequest, 
  NotificationItem, 
  ModerationReport, 
  RequirementBadge, 
  ProjectStage,
  ProjectMilestone,
  ValidationCampaign,
  CampaignSubmission,
  FundingExpression,
  WorkspaceTask,
  WorkspaceResource,
  WorkspaceNote,
  MentorProfile,
  MentorSessionRequest,
  VerificationRequest
} from './community-types';

export const COMMUNITY_STAGES: ProjectStage[] = [
  'Idea',
  'Research',
  'Prototype',
  'MVP',
  'Beta',
  'Launched',
  'Growing',
];

export const REQUIREMENT_OPTIONS: RequirementBadge[] = [
  'Looking for Feedback',
  'Looking for Early Users',
  'Looking for Co-founder',
  'Looking for Developers',
  'Looking for Designers',
  'Looking for Marketing help',
  'Looking for Mentors',
  'Looking for Investment',
  'Looking for Funding',
  'Looking for Business partner',
  'Looking for Technical review',
  'Looking for Market validation',
];

export const INITIAL_FOUNDERS: FounderProfile[] = [
  {
    id: 'user_sarah',
    username: 'sarahchen',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Ex-Stripe engineer building next-gen developer productivity and AI workspace tools. Passionate about evidence-based startup validation and clean code architecture.',
    location: 'San Francisco, CA',
    skills: ['TypeScript', 'Next.js', 'Python', 'LLMs', 'System Architecture', 'Cloud Infrastructure'],
    interests: ['AI Tools', 'DevTools', 'SaaS', 'Open Source', 'Developer Infrastructure'],
    projectsCount: 2,
    experience: '8+ years as Senior Staff Engineer at Stripe & Supabase core contributor.',
    education: 'BS in Computer Science, UC Berkeley',
    links: {
      github: 'https://github.com/sarahchen-dev',
      twitter: 'https://twitter.com/sarahchen_ai',
      linkedin: 'https://linkedin.com/in/sarahchen-founder',
      website: 'https://sarahchen.dev',
    },
    followersCount: 1240,
    followingCount: 380,
    collaborationStatus: 'Actively looking for a Product Marketing Co-founder & Beta Users',
    collaborationInterests: ['Co-founder', 'Marketing', 'Investor'],
    reputationScore: 945,
    badges: ['Verified Founder', 'Top Contributor', 'Builder', 'Helpful Reviewer', 'Verified Skill'],
    verifiedType: 'Founder',
    credibility: {
      identity: 'verified',
      skill: 'verified',
      portfolio: 'verified',
      completedCollaborationsCount: 4,
      confirmedMilestonesCount: 6,
      helpfulFeedbackCount: 28,
      mentoringContributionsCount: 12,
    },
    endorsements: [
      {
        id: 'end_1',
        endorserId: 'user_alex',
        endorserName: 'Alex Vance',
        endorserAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        relationship: 'Co-collaborator on DevTools Hackathon',
        content: 'Sarah is an exceptional technical architect. Her TypeScript code generator and infrastructure design on FlowSmith AI is enterprise grade.',
        skillOrProject: 'System Architecture & TypeScript',
        date: '2025-11-14'
      },
      {
        id: 'end_2',
        endorserId: 'user_elena',
        endorserName: 'Elena Rostova',
        endorserAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        relationship: 'Angel Investor & Advisor',
        content: 'Sarah delivers milestones consistently on time with rigorous validation metrics and genuine founder grit.',
        skillOrProject: 'Product Execution',
        date: '2026-01-20'
      }
    ],
    profileCompletionPercentage: 95,
    privacySettings: {
      showEmail: false,
      showLocation: true,
      showLinks: true,
      showMilestones: true,
    }
  },
  {
    id: 'user_alex',
    username: 'alexvance',
    name: 'Alex Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Full-stack AI developer & open source enthusiast. Passionate about digital biomarkers, wearable computing, and micro-SaaS.',
    location: 'Austin, TX',
    skills: ['React Native', 'Node.js', 'PyTorch', 'UI/UX Design', 'Biometric Signal Processing'],
    interests: ['Digital Health', 'Mobile Apps', 'Fitness Tech', 'Wearables'],
    projectsCount: 3,
    experience: 'Former Lead Mobile Dev at Calm. Built 4 bootstrapped products with over 50,000 active users.',
    education: 'MS in HCI, Stanford University',
    links: {
      github: 'https://github.com/alexvance-code',
      linkedin: 'https://linkedin.com/in/alexvance',
      twitter: 'https://twitter.com/alexvance_tech',
    },
    followersCount: 890,
    followingCount: 210,
    collaborationStatus: 'Looking for Health Mentors & Angel Investors',
    collaborationInterests: ['Mentor', 'Investor', 'Developer'],
    reputationScore: 820,
    badges: ['Builder', 'Top Contributor', 'Helpful Reviewer', 'Verified Skill'],
    verifiedType: 'Experienced',
    credibility: {
      identity: 'verified',
      skill: 'verified',
      portfolio: 'verified',
      completedCollaborationsCount: 3,
      confirmedMilestonesCount: 4,
      helpfulFeedbackCount: 19,
      mentoringContributionsCount: 5,
    },
    endorsements: [
      {
        id: 'end_3',
        endorserId: 'user_sarah',
        endorserName: 'Sarah Chen',
        endorserAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        relationship: 'Peer Founder in Austin Tech Circle',
        content: 'Alex has deep domain expertise in mobile UX and biometric algorithms. PulseTrack is remarkably responsive.',
        skillOrProject: 'React Native & Mobile Architecture',
        date: '2026-02-05'
      }
    ],
    profileCompletionPercentage: 90,
    privacySettings: {
      showEmail: false,
      showLocation: true,
      showLinks: true,
      showMilestones: true,
    }
  },
  {
    id: 'user_elena',
    username: 'elenaross',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Partner at Horizon Ventures & Founder advisor. Angel investor in 15+ B2B SaaS startups with 3 successful exits.',
    location: 'New York, NY',
    skills: ['Venture Funding', 'Go-To-Market Strategy', 'Financial Modeling', 'Enterprise Sales', 'Growth'],
    interests: ['FinTech', 'AI/ML', 'Enterprise Software', 'DevTools'],
    projectsCount: 1,
    experience: 'Former VP of Growth at Plaid. Active angel investor and board advisor.',
    education: 'MBA, Harvard Business School',
    links: {
      linkedin: 'https://linkedin.com/in/elenarostova',
      twitter: 'https://twitter.com/elena_vc',
    },
    followersCount: 3410,
    followingCount: 450,
    collaborationStatus: 'Mentoring pre-seed & seed stage B2B founders',
    collaborationInterests: ['Investor', 'Mentor'],
    reputationScore: 1250,
    badges: ['Mentor', 'Investor', 'Top Contributor', 'Verified Identity'],
    verifiedType: 'Investor',
    credibility: {
      identity: 'verified',
      skill: 'verified',
      portfolio: 'verified',
      completedCollaborationsCount: 12,
      confirmedMilestonesCount: 15,
      helpfulFeedbackCount: 45,
      mentoringContributionsCount: 32,
    },
    endorsements: [],
    profileCompletionPercentage: 88,
    privacySettings: {
      showEmail: false,
      showLocation: true,
      showLinks: true,
      showMilestones: true,
    }
  },
  {
    id: 'user_marcus',
    username: 'marcusdev',
    name: 'Marcus Thorne',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'UI/UX Design Director & Frontend Engineer. Obsessed with micro-interactions, spatial design, and typography systems.',
    location: 'London, UK',
    skills: ['Figma', 'Tailwind CSS', 'WebGL', 'Design Systems', 'React', 'Three.js'],
    interests: ['Design Tools', 'Creative Tech', 'Consumer Products', 'Spatial Canvas'],
    projectsCount: 1,
    experience: 'Ex-Design Lead at Linear & Framer template creator with 10k+ downloads.',
    links: {
      github: 'https://github.com/marcusthorne',
      twitter: 'https://twitter.com/marcusthorne_ui',
      website: 'https://marcusthorne.design',
    },
    followersCount: 1560,
    followingCount: 290,
    collaborationStatus: 'Open to joining seed-stage startup as Design Co-founder',
    collaborationInterests: ['Co-founder', 'Designer'],
    reputationScore: 780,
    badges: ['Builder', 'Helpful Reviewer', 'Verified Skill'],
    verifiedType: 'Designer',
    credibility: {
      identity: 'verified',
      skill: 'verified',
      portfolio: 'verified',
      completedCollaborationsCount: 2,
      confirmedMilestonesCount: 3,
      helpfulFeedbackCount: 16,
      mentoringContributionsCount: 4,
    },
    endorsements: [],
    profileCompletionPercentage: 85,
    privacySettings: {
      showEmail: false,
      showLocation: true,
      showLinks: true,
      showMilestones: true,
    }
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_flowsmith',
    name: 'FlowSmith AI',
    tagline: 'Autonomous AI workflow builder that turns natural language into production backend APIs and typed services',
    category: 'AI/ML',
    industry: 'Developer Tools & Cloud Automation',
    location: 'San Francisco, CA',
    stage: 'MVP',

    founderId: 'user_sarah',
    founderName: 'Sarah Chen',
    founderUsername: 'sarahchen',
    founderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    founderBadges: ['Verified Founder', 'Top Contributor', 'Verified Skill'],

    problemStatement: 'Engineers spend over 40% of their sprints writing repetitive CRUD endpoints, integrations, and webhook listeners. Existing low-code tools produce unmaintainable lock-in code that cannot be committed to Git.',
    whoExperiences: 'Backend developers, startup CTOs, and technical product managers building complex web/mobile platforms.',
    currentSolutions: 'Manual coding in Express/FastAPI, or visual drag-and-drop tools like Zapier/n8n which lack TypeScript type safety and custom business logic flexibility.',

    solutionStatement: 'FlowSmith allows developers to describe complex data flows in natural language, automatically generating production-ready, fully typed TypeScript code complete with unit tests and OpenAPI specs.',
    differentiator: 'Generates clean Git-versioned TypeScript code rather than proprietary visual state graphs.',
    uniqueAdvantage: 'Proprietary fine-tuned code generation pipeline trained specifically on cloud infrastructure best practices.',
    targetUsers: 'Full-stack engineers, startup founding engineers, and software agencies delivering scalable web applications.',

    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
    builtDescription: 'Functional MVP web console running Next.js 16 and a sandboxed Node.js code execution environment. Generates complete OpenAPI 3.1 definitions and runnable TypeScript endpoint handlers in under 3 seconds.',
    prototypeMedia: [
      {
        id: 'media_1',
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
        caption: 'FlowSmith Natural Language Endpoint Generator Interface',
        type: 'image',
      },
      {
        id: 'media_2',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
        caption: 'Live Execution Monitor & TypeScript Code Inspector',
        type: 'image',
      },
      {
        id: 'media_3',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
        caption: 'Automated OpenAPI Spec & Swagger Documentation Portal',
        type: 'image',
      }
    ],
    prototypeLinks: [
      { label: 'Try Live Interactive Sandbox', url: 'https://flowsmith-demo.vercel.app', type: 'Vercel' },
      { label: 'View GitHub Repository & Code', url: 'https://github.com/flowsmith-ai', type: 'GitHub' },
      { label: 'Watch 2-Min Demo Video', url: 'https://youtube.com', type: 'YouTube' }
    ],

    requirements: [
      'Looking for Feedback',
      'Looking for Early Users',
      'Looking for Co-founder',
      'Looking for Investment'
    ],
    requirementDetails: 'We have 140 developer signups on our early MVP. We are actively looking for a Go-To-Market / Growth Co-founder and gathering feedback on our OpenAPI generator. Also preparing our $500k Pre-Seed round.',

    validationMetrics: [
      { label: 'Waitlist Developers', value: '140 verified developers', isEvidenceSupported: true, proofUrl: 'https://flowsmith-demo.vercel.app' },
      { label: 'Active Prototype Testers', value: '28 weekly active developers', isEvidenceSupported: true },
      { label: 'Customer Discovery Interviews', value: '24 engineering leads interviewed', isEvidenceSupported: true },
      { label: 'Paying Alpha Customers', value: '3 design partners ($150/mo)', isEvidenceSupported: false }
    ],

    fundingInfo: {
      seekingInvestment: true,
      stage: 'Pre-Seed',
      amountSeeking: '$500,000',
      equityOffered: '10-15%',
      useOfFunds: '70% Core AI research & GPU compute infra, 30% Developer outreach & developer relations.',
      currentTraction: '140 Waitlist Beta Users, 12 Weekly Active Projects, 3 Paid Pilots',
      revenue: '$450/month (Alpha Pilots)',
      users: '140 registered developers',
      businessModel: 'Usage-based SaaS: Free tier for hobbyists; $39/seat/mo for Pro teams; enterprise self-hosted compliance licenses.',
      pitchDeckUrl: 'https://docsend.com/view/flowsmith-preseed-deck'
    },

    visibility: 'public',
    validationScore: 92,
    supportersCount: 428,
    commentsCount: 36,
    viewsCount: 2450,
    uniqueViewersCount: 1890,
    prototypeClicksCount: 640,
    externalClicksCount: 310,
    savedCount: 154,

    feedbackSummary: {
      totalReviews: 18,
      avgProblemClarity: 9.2,
      avgSolution: 9.0,
      avgTargetMarket: 8.8,
      avgProductUx: 8.5,
      avgBusinessPotential: 9.4,
      avgDifferentiation: 9.1,
      avgEaseOfUse: 8.7,
      avgTechnicalImplementation: 9.3,
      commonThemes: [
        'Developers love the clean TypeScript output',
        'Requesting direct VS Code extension integration',
        'Pricing model needs clear monthly token tiers',
        'SOC2 and enterprise security compliance required'
      ],
      actionableSuggestions: [
        'Release a lightweight VS Code extension to increase daily retention',
        'Publish benchmark comparisons against raw LangChain boilerplate',
        'Package enterprise export for local self-hosted docker runs'
      ]
    },

    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    featured: true
  },
  {
    id: 'proj_pulsehealth',
    name: 'PulseTrack AI',
    tagline: 'Continuous stress & recovery intelligence using passive wearables and biometric signals',
    category: 'Healthcare',
    industry: 'Digital Health & Biomarkers',
    location: 'Austin, TX',
    stage: 'Beta',

    founderId: 'user_alex',
    founderName: 'Alex Vance',
    founderUsername: 'alexvance',
    founderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    founderBadges: ['Builder', 'Top Contributor', 'Verified Skill'],

    problemStatement: 'Knowledge workers and athletes suffer from burnout and overtraining because current health apps only give static, retrospective numbers without actionable real-time interventions.',
    whoExperiences: 'High-performance professionals, founders, endurance athletes, and chronic stress sufferers.',
    currentSolutions: 'Apple Health or Oura ring raw graphs which require manual interpretation and lack personalized behavioral nudges.',

    solutionStatement: 'PulseTrack combines HRV data with calendar and sleep metrics to predict energy dips 3 hours in advance and suggest micro-recovery routines.',
    differentiator: 'Predictive HRV modeling paired with automated calendar optimization.',
    uniqueAdvantage: 'Trained on 50,000 hours of anonymized continuous heart rate variability data.',
    targetUsers: 'Knowledge workers, startup operators, endurance runners, and wellness coaches.',

    logoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&auto=format&fit=crop&q=80',
    builtDescription: 'React Native iOS app integrated with Apple HealthKit and Whoop BLE SDK. Real-time HRV frequency-domain calculation backend with sub-second latency.',
    prototypeMedia: [
      {
        id: 'media_p1',
        url: 'https://images.unsplash.com/photo-1510519138161-58446232f71f?w=1200&auto=format&fit=crop&q=80',
        caption: 'PulseTrack Mobile Dashboard & Real-Time Stress Gauge',
        type: 'image',
      },
      {
        id: 'media_p2',
        url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop&q=80',
        caption: 'Biometric Analytics & Sleep Stage Correlation',
        type: 'image',
      }
    ],
    prototypeLinks: [
      { label: 'Figma Interactive Prototype', url: 'https://figma.com', type: 'Figma' },
      { label: 'iOS TestFlight Beta Access', url: 'https://testflight.apple.com', type: 'App Store' }
    ],

    requirements: [
      'Looking for Feedback',
      'Looking for Mentors',
      'Looking for Technical review',
      'Looking for Early Users'
    ],
    requirementDetails: 'Seeking medical/health tech mentors to review our biometric validation pipeline. Also onboarding 50 iOS TestFlight beta testers.',

    validationMetrics: [
      { label: 'TestFlight Testers', value: '45 active wearable users', isEvidenceSupported: true },
      { label: 'Continuous HRV Data Logged', value: '18,500 hours recorded', isEvidenceSupported: true },
      { label: 'Reported Burnout Reduction', value: '38% lower subjective fatigue', isEvidenceSupported: false }
    ],

    fundingInfo: {
      seekingInvestment: false,
      stage: 'Bootstrapped',
      businessModel: 'B2C Subscription at $14.99/mo or $119/year with wearable bundle partnerships.'
    },

    visibility: 'public',
    validationScore: 86,
    supportersCount: 312,
    commentsCount: 22,
    viewsCount: 1680,
    uniqueViewersCount: 1320,
    prototypeClicksCount: 410,
    externalClicksCount: 180,
    savedCount: 98,

    feedbackSummary: {
      totalReviews: 12,
      avgProblemClarity: 8.9,
      avgSolution: 8.4,
      avgTargetMarket: 8.6,
      avgProductUx: 9.1,
      avgBusinessPotential: 8.2,
      avgDifferentiation: 8.7,
      avgEaseOfUse: 8.8,
      avgTechnicalImplementation: 8.5,
      commonThemes: [
        'Slick mobile interface design and high visual polish',
        'Users want Apple Watch complication support',
        'Need clear HIPAA privacy guidelines'
      ],
      actionableSuggestions: [
        'Implement an Apple Watch modular complication for instant recovery glance',
        'Clarify end-to-end local biometric encryption in onboarding'
      ]
    },

    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    featured: false
  },
  {
    id: 'proj_craftspace',
    name: 'CraftSpace',
    tagline: 'Collaborative spatial canvas for digital product designers and 3D creators',
    category: 'Design',
    industry: 'Creative Tools & Spatial Computing',
    location: 'London, UK',
    stage: 'Prototype',

    founderId: 'user_marcus',
    founderName: 'Marcus Thorne',
    founderUsername: 'marcusdev',
    founderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    founderBadges: ['Builder', 'Verified Skill'],

    problemStatement: '3D designers and UI designers work in siloed 2D environments, making it difficult to visualize how 2D interfaces feel inside 3D spatial software.',
    whoExperiences: 'UI/UX designers, 3D artists, game developers, and VisionOS builders.',
    currentSolutions: 'Figma (2D only) or Blender/Unity (too heavy for quick UI prototyping).',

    solutionStatement: 'CraftSpace is a lightweight browser canvas where designers drag 2D layouts into 3D environments with live WebGL shader previews.',
    differentiator: 'Instant WebGL rendering in browser without installing heavy 3D software.',
    uniqueAdvantage: 'Custom lightweight WebGL rendering engine written in Rust + WebAssembly.',
    targetUsers: 'Product designers, 3D modelers, spatial UI teams.',

    logoUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&auto=format&fit=crop&q=80',
    builtDescription: 'Interactive WebAssembly canvas preview running Three.js and Rust WebGL pipeline. Supports live drag and drop of Figma SVG frames.',
    prototypeMedia: [
      {
        id: 'media_c1',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        caption: '3D Spatial Canvas Editor with Real-Time WebGL Lighting',
        type: 'image',
      }
    ],
    prototypeLinks: [
      { label: 'Try WebAssembly Browser Demo', url: 'https://craftspace.dev', type: 'Website' },
      { label: 'Design System Figma Library', url: 'https://figma.com', type: 'Figma' }
    ],

    requirements: [
      'Looking for Co-founder',
      'Looking for Developers',
      'Looking for Feedback'
    ],
    requirementDetails: 'I am a Design Lead looking for a Rust / WebGL Technical Co-founder to scale the rendering engine backend.',

    validationMetrics: [
      { label: 'Alpha Designers Testing', value: '32 UI designers', isEvidenceSupported: true },
      { label: 'Figma Community Downloads', value: '1,420 library duplicates', isEvidenceSupported: true }
    ],

    fundingInfo: {
      seekingInvestment: true,
      stage: 'Pre-Seed',
      amountSeeking: '$250,000',
      equityOffered: '10%',
      useOfFunds: 'Full-time technical engineering & server infrastructure.',
      currentTraction: 'Alpha prototype running on WebGL, 32 designers testing weekly.',
      revenue: '$0',
      users: '32 Alpha testers',
      businessModel: 'Freemium canvas; $24/creator/month for team collaboration and 4K glTF exports.',
      pitchDeckUrl: 'https://craftspace.dev/deck.pdf'
    },

    visibility: 'public',
    validationScore: 89,
    supportersCount: 275,
    commentsCount: 19,
    viewsCount: 1420,
    uniqueViewersCount: 1100,
    prototypeClicksCount: 380,
    externalClicksCount: 140,
    savedCount: 88,

    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    featured: false
  }
];

export const INITIAL_MILESTONES: ProjectMilestone[] = [
  {
    id: 'mstone_1',
    projectId: 'proj_flowsmith',
    title: 'Customer Discovery Interviews Completed',
    description: 'Conducted 24 in-depth 45-minute interviews with Senior Staff Engineers at high-growth startups to map core CRUD time sinks.',
    date: '2025-10-15',
    status: 'completed',
    isVerified: true,
    metric: '24 engineering interviews',
    evidenceLink: 'https://flowsmith.notion.site/research-summary',
    visibility: 'public'
  },
  {
    id: 'mstone_2',
    projectId: 'proj_flowsmith',
    title: 'Interactive Prototype Sandbox Released',
    description: 'Shipped first web sandbox demonstrating natural language prompt to OpenAPI spec generator.',
    date: '2025-12-01',
    status: 'completed',
    isVerified: true,
    metric: '140 waitlist signups in 72h',
    evidenceLink: 'https://flowsmith-demo.vercel.app',
    visibility: 'public'
  },
  {
    id: 'mstone_3',
    projectId: 'proj_flowsmith',
    title: 'Alpha Design Partners Onboarded',
    description: 'Signed 3 software dev shops onto private alpha testing with real staging environments.',
    date: '2026-01-18',
    status: 'completed',
    isVerified: true,
    metric: '3 paying pilot teams ($450/mo)',
    visibility: 'public'
  },
  {
    id: 'mstone_4',
    projectId: 'proj_flowsmith',
    title: 'VS Code Extension Private Beta',
    description: 'Building official VS Code IDE extension to generate endpoints directly from code comments.',
    date: '2026-04-15',
    status: 'in_progress',
    isVerified: false,
    metric: 'Target: 50 active extension installs',
    visibility: 'public'
  },
  {
    id: 'mstone_p1',
    projectId: 'proj_pulsehealth',
    title: 'Biometric Signal Processing Pipeline Validated',
    description: 'Completed mathematical validation of frequency-domain HRV stress indices against clinical ECG datasets.',
    date: '2025-11-20',
    status: 'completed',
    isVerified: true,
    metric: '94% correlation with Holter ECG monitor',
    visibility: 'public'
  },
  {
    id: 'mstone_p2',
    projectId: 'proj_pulsehealth',
    title: 'iOS TestFlight Closed Beta Launched',
    description: 'Onboarded 45 endurance athletes and startup founders with continuous background HRV sync.',
    date: '2026-01-10',
    status: 'completed',
    isVerified: true,
    metric: '45 active TestFlight beta testers',
    visibility: 'public'
  }
];

export const INITIAL_CAMPAIGNS: ValidationCampaign[] = [
  {
    id: 'camp_1',
    projectId: 'proj_flowsmith',
    projectTitle: 'FlowSmith AI',
    founderId: 'user_sarah',
    title: 'FlowSmith OpenAPI Usability & Developer Workflow Test',
    type: 'prototype_testing',
    description: 'Help us test whether our generated TypeScript APIs integrate seamlessly into your current backend stack. We need 20 backend/fullstack developers to run a test prompt and review generated code quality.',
    targetAudience: 'Backend, Full-stack, or DevOps engineers with TypeScript/Node experience.',
    eligibilityCriteria: 'Must have built at least one REST or GraphQL API in the last 6 months.',
    questions: [
      {
        id: 'q1',
        question: 'How clean and readable was the generated TypeScript code?',
        type: 'rating'
      },
      {
        id: 'q2',
        question: 'Would you feel confident committing this generated code to your git repository without extensive manual rewriting?',
        type: 'choice',
        options: ['Yes, fully confident', 'Yes, with small tweaks', 'Neutral / Unsure', 'No, too risky']
      },
      {
        id: 'q3',
        question: 'What specific third-party integration or ORM support (e.g. Prisma, Drizzle, Stripe) is missing for your workflow?',
        type: 'text'
      }
    ],
    startDate: '2026-02-01',
    endDate: '2026-04-30',
    status: 'active',
    visitsCount: 184,
    signupsCount: 38,
    completedTestsCount: 22,
    feedbackThemes: [
      'High satisfaction with TypeScript type safety',
      'Strong demand for Drizzle ORM native schema export',
      'Developers want automatic test case generation (Vitest / Jest)'
    ],
    submissions: [
      {
        id: 'sub_1',
        campaignId: 'camp_1',
        projectId: 'proj_flowsmith',
        userId: 'user_alex',
        userName: 'Alex Vance',
        answers: {
          q1: 9,
          q2: 'Yes, with small tweaks',
          q3: 'Drizzle ORM and Supabase auth middleware integration would make this an instant purchase for me.'
        },
        feedbackThemes: ['Drizzle ORM', 'Supabase Auth'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'sub_2',
        campaignId: 'camp_1',
        projectId: 'proj_flowsmith',
        userId: 'user_marcus',
        userName: 'Marcus Thorne',
        answers: {
          q1: 10,
          q2: 'Yes, fully confident',
          q3: 'Automatic OpenAPI swagger doc viewer directly in the web preview.'
        },
        feedbackThemes: ['Swagger Viewer', 'High confidence'],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'camp_2',
    projectId: 'proj_pulsehealth',
    projectTitle: 'PulseTrack AI',
    founderId: 'user_alex',
    title: 'HRV Wearable Daily Stress Pilot',
    type: 'usability_testing',
    description: 'Testing the 3-hour predictive energy dip notification accuracy with daily Apple Watch / Whoop wearers.',
    targetAudience: 'Active smartwatch wearers experiencing mid-day work fatigue.',
    eligibilityCriteria: 'Owns Apple Watch Series 6+ or Whoop 4.0.',
    questions: [
      {
        id: 'pq1',
        question: 'Did the energy dip notification alert you accurately before your afternoon slump occurred?',
        type: 'choice',
        options: ['Very accurately (within 30 mins)', 'Somewhat accurately', 'Not accurate']
      },
      {
        id: 'pq2',
        question: 'Rate the helpfulness of the 3-minute guided breathing intervention.',
        type: 'rating'
      }
    ],
    startDate: '2026-02-10',
    status: 'active',
    visitsCount: 120,
    signupsCount: 28,
    completedTestsCount: 16,
    submissions: []
  }
];

export const INITIAL_FEEDBACK: StructuredFeedback[] = [
  {
    id: 'fb_1',
    projectId: 'proj_flowsmith',
    userId: 'user_alex',
    userName: 'Alex Vance',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    userBadge: 'Experienced Builder',
    ratings: {
      problemClarity: 10,
      solution: 9,
      targetMarket: 9,
      productUx: 8,
      businessPotential: 10,
      differentiation: 9,
      easeOfUse: 9,
      technicalImplementation: 9,
    },
    writtenImprovement: 'Add a direct VS Code extension so developers can invoke endpoint generation without leaving their editor tab.',
    writtenConcerns: 'Ensure generated OpenAPI specs handle complex nested JWT auth permissions seamlessly.',
    writtenUseReason: 'I build 3-4 backend services a month; this would save me 15 hours per build.',
    whatWorksWell: 'The generated TypeScript types are strictly valid with no unnecessary `any` types.',
    whatIsConfusing: 'The webhook configuration tab could use clearer documentation on HMAC signature checks.',
    whatWouldImprove: 'Add export presets for Fastify and Elysia alongside Express.',
    wouldPersonallyUse: 'Yes',
    additionalInfoNeeded: 'Details on monthly token generation rate limits.',
    helpfulVotes: ['user_sarah', 'user_elena'],
    ownerReply: {
      content: 'Thank you Alex! VS Code extension is currently underway in our Q2 milestone, and we will definitely include Elysia export presets.',
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      founderName: 'Sarah Chen'
    },
    isAnonymous: false,
    status: 'published',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fb_2',
    projectId: 'proj_flowsmith',
    userId: 'user_elena',
    userName: 'Elena Rostova',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    userBadge: 'Investor',
    ratings: {
      problemClarity: 9,
      solution: 9,
      targetMarket: 8,
      productUx: 9,
      businessPotential: 9,
      differentiation: 9,
      easeOfUse: 9,
      technicalImplementation: 10,
    },
    writtenImprovement: 'Focus pitch messaging on enterprise developer security compliance (SOC2 / HIPAA ready generated code).',
    writtenConcerns: 'Big tech cloud providers (AWS Amplify / Supabase) might introduce similar AI prompt generators.',
    writtenUseReason: 'Extremely compelling market opportunity. Happy to connect regarding Pre-Seed allocation.',
    whatWorksWell: 'Clear positioning around Git-committed code vs proprietary visual low-code lock-in.',
    whatIsConfusing: 'Enterprise pricing is not yet clearly displayed.',
    whatWouldImprove: 'Include customer case study or quote from design partners.',
    wouldPersonallyUse: 'Maybe',
    additionalInfoNeeded: 'Unit economics per generated API endpoint.',
    helpfulVotes: ['user_sarah'],
    ownerReply: {
      content: 'Thanks Elena! We are publishing our SOC2 compliance framework and unit economics in our Investor Room this week.',
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      founderName: 'Sarah Chen'
    },
    isAnonymous: false,
    status: 'published',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_COLLABORATIONS: CollaborationRequest[] = [
  {
    id: 'collab_1',
    senderId: 'user_marcus',
    senderName: 'Marcus Thorne',
    senderUsername: 'marcusdev',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    recipientId: 'user_sarah',
    recipientName: 'Sarah Chen',
    projectId: 'proj_flowsmith',
    projectTitle: 'FlowSmith AI',
    role: 'Designer',
    message: 'Hey Sarah! Love FlowSmith. I specialize in developer tool UIs and design systems. I would love to collaborate on your frontend editor experience and build a unified component library.',
    reasonForReachingOut: 'FlowSmith has enormous technical potential; elevating the UX to Linear-level polish will accelerate word-of-mouth adoption.',
    proposedContribution: 'Lead UI/UX redesign of the interactive code generator, dark mode token system, and keyboard shortcuts.',
    availabilityCommitment: '10-15 hrs/week',
    status: 'pending',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_FUNDING_EXPRESSIONS: FundingExpression[] = [
  {
    id: 'fund_1',
    projectId: 'proj_flowsmith',
    projectTitle: 'FlowSmith AI',
    investorId: 'user_elena',
    investorName: 'Elena Rostova',
    investorFirm: 'Horizon Ventures',
    checkSizeRange: '$100k - $250k',
    notes: 'Very impressed by the code generation fidelity and customer validation metrics. Requesting intro call and full data room access.',
    pitchDeckRequested: true,
    status: 'reviewed',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_WORKSPACE_TASKS: WorkspaceTask[] = [
  {
    id: 'task_1',
    projectId: 'proj_flowsmith',
    title: 'Finalize OpenAPI 3.1 Spec Export Handler',
    description: 'Ensure nested path parameters and JSON Schema references validate in Swagger UI without warnings.',
    status: 'done',
    assigneeName: 'Sarah Chen',
    priority: 'high',
    dueDate: '2026-03-01',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task_2',
    projectId: 'proj_flowsmith',
    title: 'Design Dark Mode Token Palette & Code Highlighting',
    description: 'Create high-contrast monospaced syntax themes for TypeScript and JSON blocks.',
    status: 'in_progress',
    assigneeName: 'Marcus Thorne',
    priority: 'medium',
    dueDate: '2026-03-15',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task_3',
    projectId: 'proj_flowsmith',
    title: 'Implement Drizzle ORM Schema Export Preset',
    description: 'Generate relational TypeScript database models from the prompt definition.',
    status: 'todo',
    assigneeName: 'Sarah Chen',
    priority: 'high',
    dueDate: '2026-03-25',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_WORKSPACE_RESOURCES: WorkspaceResource[] = [
  {
    id: 'res_1',
    projectId: 'proj_flowsmith',
    title: 'FlowSmith Main Repository & Issue Tracker',
    url: 'https://github.com/flowsmith-ai/core',
    category: 'Repository',
    addedBy: 'Sarah Chen',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'res_2',
    projectId: 'proj_flowsmith',
    title: 'UI Component Design System & Wireframes',
    url: 'https://figma.com/@flowsmith-design',
    category: 'Design',
    addedBy: 'Marcus Thorne',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'res_3',
    projectId: 'proj_flowsmith',
    title: 'Customer Discovery Interview Transcripts',
    url: 'https://flowsmith.notion.site/interviews',
    category: 'Documentation',
    addedBy: 'Sarah Chen',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_WORKSPACE_NOTES: WorkspaceNote[] = [
  {
    id: 'note_1',
    projectId: 'proj_flowsmith',
    authorName: 'Sarah Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content: 'Welcome to the FlowSmith private workspace! Our key priority for this sprint is validating the Drizzle ORM preset with our 3 paying pilot teams.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_MENTORS: MentorProfile[] = [
  {
    id: 'mentor_elena',
    userId: 'user_elena',
    name: 'Elena Rostova',
    title: 'Partner at Horizon Ventures & Ex-Plaid VP Growth',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Advisor to 20+ B2B SaaS and DevTools startups. Specializes in Pre-Seed/Seed pitch decks, GTM enterprise sales motions, and customer discovery loops.',
    expertise: ['Pre-Seed Fundraising', 'Enterprise GTM', 'Pitch Deck Review', 'Pricing Strategy'],
    industries: ['B2B SaaS', 'DevTools', 'FinTech', 'AI/ML'],
    availability: '2 slots / week (30-min office hours)',
    isVerifiedMentor: true,
    sessionsCount: 32,
    rating: 4.9,
    linkedin: 'https://linkedin.com/in/elenarostova'
  },
  {
    id: 'mentor_alex',
    userId: 'user_alex',
    name: 'Alex Vance',
    title: 'Ex-Lead Mobile Architect at Calm & Serial Founder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Mentoring early-stage founders on building lean MVPs, mobile architecture, App Store optimization, and biometric sensor data pipelines.',
    expertise: ['Mobile Architecture', 'Lean MVP Scoping', 'React Native', 'HealthTech Compliance'],
    industries: ['Digital Health', 'Consumer Mobile', 'Wearables'],
    availability: '3 slots / week (45-min technical review)',
    isVerifiedMentor: true,
    sessionsCount: 18,
    rating: 4.8,
    linkedin: 'https://linkedin.com/in/alexvance'
  },
  {
    id: 'mentor_david',
    userId: 'user_david',
    name: 'Dr. David Kim',
    title: 'Bioinformatics Researcher & Stanford Health Advisor',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    bio: 'Advising HealthTech and AI diagnostics startups on clinical validation trials, FDA SaMD compliance pathways, and research grant applications.',
    expertise: ['Clinical Validation', 'Biomarkers', 'IRB Protocols', 'FDA Pathways'],
    industries: ['Healthcare', 'Biotech', 'Digital Therapeutics'],
    availability: '1 slot / week',
    isVerifiedMentor: true,
    sessionsCount: 14,
    rating: 5.0,
    linkedin: 'https://linkedin.com'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    userId: 'user_sarah',
    type: 'collaboration_request',
    title: 'New Collaboration Request',
    message: 'Marcus Thorne requested to collaborate as Designer on FlowSmith AI.',
    link: '/dashboard?tab=collaboration',
    read: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_2',
    userId: 'user_sarah',
    type: 'feedback',
    title: 'New Structured Feedback Received',
    message: 'Elena Rostova (Investor) left detailed feedback on FlowSmith AI.',
    link: '/community/proj_flowsmith',
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_3',
    userId: 'user_sarah',
    type: 'trending',
    title: 'Project Trending #1',
    message: 'FlowSmith AI is currently the #1 Trending project in AI/ML this week!',
    link: '/community/proj_flowsmith',
    read: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_REPORTS: ModerationReport[] = [
  {
    id: 'rep_1',
    reporterId: 'user_alex',
    targetType: 'project',
    targetId: 'proj_spam_101',
    targetTitle: 'Get Rich Quick Crypto Token',
    reason: 'Promotional spam & misleading financial claims',
    status: 'pending',
    aiFlagReason: 'AI Moderation confidence: 98% likelihood of unsolicited crypto promotion.',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_VERIFICATION_REQUESTS: VerificationRequest[] = [
  {
    id: 'ver_1',
    userId: 'user_marcus',
    userName: 'Marcus Thorne',
    type: 'skill',
    evidenceUrl: 'https://github.com/marcusthorne',
    notes: 'Submitted open source design system repository with 1,200 stars on GitHub for Frontend & Design verification.',
    status: 'pending',
    submittedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ver_2',
    userId: 'user_alex',
    userName: 'Alex Vance',
    type: 'portfolio',
    evidenceUrl: 'https://apps.apple.com/app/calm',
    notes: 'Submitted App Store credit and verified GitHub commits for Lead Mobile Engineer position at Calm.',
    status: 'approved',
    submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
];

// -------------------------------------------------------------
// LOCALSTORAGE PERSISTENCE HELPERS
// -------------------------------------------------------------

export function getStoredProjects(): Project[] {
  if (typeof window === 'undefined') return INITIAL_PROJECTS;
  const stored = localStorage.getItem('ideacheck_community_projects');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse community projects from localStorage', e);
    }
  }
  localStorage.setItem('ideacheck_community_projects', JSON.stringify(INITIAL_PROJECTS));
  return INITIAL_PROJECTS;
}

export function saveStoredProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ideacheck_community_projects', JSON.stringify(projects));
}

export function getStoredFounders(): FounderProfile[] {
  if (typeof window === 'undefined') return INITIAL_FOUNDERS;
  const stored = localStorage.getItem('ideacheck_community_founders');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse community founders from localStorage', e);
    }
  }
  localStorage.setItem('ideacheck_community_founders', JSON.stringify(INITIAL_FOUNDERS));
  return INITIAL_FOUNDERS;
}

export function saveStoredFounderProfile(profile: FounderProfile): void {
  if (typeof window === 'undefined') return;
  const list = getStoredFounders();
  const index = list.findIndex(f => f.id === profile.id || f.username.toLowerCase() === profile.username.toLowerCase());
  if (index !== -1) {
    list[index] = profile;
  } else {
    list.push(profile);
  }
  localStorage.setItem('ideacheck_community_founders', JSON.stringify(list));
}

export function getStoredFeedback(projectId?: string): StructuredFeedback[] {
  if (typeof window === 'undefined') return INITIAL_FEEDBACK;
  const stored = localStorage.getItem('ideacheck_community_feedback');
  let list = INITIAL_FEEDBACK;
  if (stored) {
    try {
      list = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse feedback from localStorage', e);
    }
  } else {
    localStorage.setItem('ideacheck_community_feedback', JSON.stringify(INITIAL_FEEDBACK));
  }
  return projectId ? list.filter(f => f.projectId === projectId) : list;
}

export function saveStoredFeedback(feedback: StructuredFeedback): void {
  if (typeof window === 'undefined') return;
  const current = getStoredFeedback();
  const updated = [feedback, ...current];
  localStorage.setItem('ideacheck_community_feedback', JSON.stringify(updated));

  // Recalculate feedback summary for the project
  const projects = getStoredProjects();
  const projectIndex = projects.findIndex(p => p.id === feedback.projectId);
  if (projectIndex !== -1) {
    const projectFeedback = updated.filter(f => f.projectId === feedback.projectId);
    const count = projectFeedback.length;
    
    const sumClarity = projectFeedback.reduce((acc, f) => acc + (f.ratings.problemClarity || 0), 0);
    const sumSol = projectFeedback.reduce((acc, f) => acc + (f.ratings.solution || 0), 0);
    const sumTarget = projectFeedback.reduce((acc, f) => acc + (f.ratings.targetMarket || 0), 0);
    const sumUx = projectFeedback.reduce((acc, f) => acc + (f.ratings.productUx || 0), 0);
    const sumBiz = projectFeedback.reduce((acc, f) => acc + (f.ratings.businessPotential || 0), 0);
    const sumDiff = projectFeedback.reduce((acc, f) => acc + (f.ratings.differentiation || 0), 0);
    const sumEase = projectFeedback.reduce((acc, f) => acc + (f.ratings.easeOfUse || f.ratings.productUx || 0), 0);
    const sumTech = projectFeedback.reduce((acc, f) => acc + (f.ratings.technicalImplementation || f.ratings.solution || 0), 0);

    projects[projectIndex].feedbackSummary = {
      totalReviews: count,
      avgProblemClarity: Math.round((sumClarity / count) * 10) / 10,
      avgSolution: Math.round((sumSol / count) * 10) / 10,
      avgTargetMarket: Math.round((sumTarget / count) * 10) / 10,
      avgProductUx: Math.round((sumUx / count) * 10) / 10,
      avgBusinessPotential: Math.round((sumBiz / count) * 10) / 10,
      avgDifferentiation: Math.round((sumDiff / count) * 10) / 10,
      avgEaseOfUse: Math.round((sumEase / count) * 10) / 10,
      avgTechnicalImplementation: Math.round((sumTech / count) * 10) / 10,
      commonThemes: projects[projectIndex].feedbackSummary?.commonThemes || ['High community validation interest'],
      actionableSuggestions: projects[projectIndex].feedbackSummary?.actionableSuggestions || ['Implement suggested reviewer improvements']
    };
    saveStoredProjects(projects);
  }
}

export function upvoteFeedback(feedbackId: string, userId: string): boolean {
  if (typeof window === 'undefined') return false;
  const list = getStoredFeedback();
  const item = list.find(f => f.id === feedbackId);
  if (!item) return false;

  item.helpfulVotes = item.helpfulVotes || [];
  const idx = item.helpfulVotes.indexOf(userId);
  if (idx > -1) {
    item.helpfulVotes.splice(idx, 1);
  } else {
    item.helpfulVotes.push(userId);
  }
  localStorage.setItem('ideacheck_community_feedback', JSON.stringify(list));
  return true;
}

export function replyToFeedback(feedbackId: string, founderReply: { content: string; createdAt: string; founderName: string }): void {
  if (typeof window === 'undefined') return;
  const list = getStoredFeedback();
  const item = list.find(f => f.id === feedbackId);
  if (item) {
    item.ownerReply = founderReply;
    localStorage.setItem('ideacheck_community_feedback', JSON.stringify(list));
  }
}

export function reportFeedback(feedbackId: string, reason: string): void {
  if (typeof window === 'undefined') return;
  const list = getStoredFeedback();
  const item = list.find(f => f.id === feedbackId);
  if (item) {
    item.status = 'reported';
    localStorage.setItem('ideacheck_community_feedback', JSON.stringify(list));
  }
}

export function getStoredCollaborations(userId?: string): CollaborationRequest[] {
  if (typeof window === 'undefined') return INITIAL_COLLABORATIONS;
  const stored = localStorage.getItem('ideacheck_community_collaborations');
  let list = INITIAL_COLLABORATIONS;
  if (stored) {
    try {
      list = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse collaborations from localStorage', e);
    }
  } else {
    localStorage.setItem('ideacheck_community_collaborations', JSON.stringify(INITIAL_COLLABORATIONS));
  }
  return userId ? list.filter(c => c.recipientId === userId || c.senderId === userId) : list;
}

export function saveStoredCollaboration(req: CollaborationRequest): void {
  if (typeof window === 'undefined') return;
  const current = getStoredCollaborations();
  const updated = [req, ...current];
  localStorage.setItem('ideacheck_community_collaborations', JSON.stringify(updated));
}

export function getStoredNotifications(userId?: string): NotificationItem[] {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  const stored = localStorage.getItem('ideacheck_community_notifications');
  let list = INITIAL_NOTIFICATIONS;
  if (stored) {
    try {
      list = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse notifications', e);
    }
  } else {
    localStorage.setItem('ideacheck_community_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  return userId ? list.filter(n => n.userId === userId) : list;
}

export function saveStoredNotification(item: NotificationItem): void {
  if (typeof window === 'undefined') return;
  const list = getStoredNotifications();
  list.unshift(item);
  localStorage.setItem('ideacheck_community_notifications', JSON.stringify(list));
}

export function getStoredMilestones(projectId?: string): ProjectMilestone[] {
  if (typeof window === 'undefined') return INITIAL_MILESTONES;
  const stored = localStorage.getItem('ideacheck_community_milestones');
  let list = INITIAL_MILESTONES;
  if (stored) {
    try {
      list = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse milestones from localStorage', e);
    }
  } else {
    localStorage.setItem('ideacheck_community_milestones', JSON.stringify(INITIAL_MILESTONES));
  }
  return projectId ? list.filter(m => m.projectId === projectId) : list;
}

export function saveStoredMilestone(milestone: ProjectMilestone): void {
  if (typeof window === 'undefined') return;
  const list = getStoredMilestones();
  const index = list.findIndex(m => m.id === milestone.id);
  if (index !== -1) {
    list[index] = milestone;
  } else {
    list.unshift(milestone);
  }
  localStorage.setItem('ideacheck_community_milestones', JSON.stringify(list));
}

export function deleteStoredMilestone(id: string): void {
  if (typeof window === 'undefined') return;
  const list = getStoredMilestones().filter(m => m.id !== id);
  localStorage.setItem('ideacheck_community_milestones', JSON.stringify(list));
}

export function getStoredCampaigns(projectId?: string): ValidationCampaign[] {
  if (typeof window === 'undefined') return INITIAL_CAMPAIGNS;
  const stored = localStorage.getItem('ideacheck_community_campaigns');
  let list = INITIAL_CAMPAIGNS;
  if (stored) {
    try {
      list = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse campaigns from localStorage', e);
    }
  } else {
    localStorage.setItem('ideacheck_community_campaigns', JSON.stringify(INITIAL_CAMPAIGNS));
  }
  return projectId ? list.filter(c => c.projectId === projectId) : list;
}

export function saveStoredCampaign(campaign: ValidationCampaign): void {
  if (typeof window === 'undefined') return;
  const list = getStoredCampaigns();
  const index = list.findIndex(c => c.id === campaign.id);
  if (index !== -1) {
    list[index] = campaign;
  } else {
    list.unshift(campaign);
  }
  localStorage.setItem('ideacheck_community_campaigns', JSON.stringify(list));
}

export function submitCampaignResponse(submission: CampaignSubmission): void {
  if (typeof window === 'undefined') return;
  const campaigns = getStoredCampaigns();
  const camp = campaigns.find(c => c.id === submission.campaignId);
  if (camp) {
    camp.submissions = camp.submissions || [];
    camp.submissions.unshift(submission);
    camp.completedTestsCount = (camp.completedTestsCount || 0) + 1;
    saveStoredCampaign(camp);
  }
}

export function getStoredFundingExpressions(projectId?: string): FundingExpression[] {
  if (typeof window === 'undefined') return INITIAL_FUNDING_EXPRESSIONS;
  const stored = localStorage.getItem('ideacheck_funding_expressions');
  let list = INITIAL_FUNDING_EXPRESSIONS;
  if (stored) {
    try {
      list = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse funding expressions', e);
    }
  } else {
    localStorage.setItem('ideacheck_funding_expressions', JSON.stringify(INITIAL_FUNDING_EXPRESSIONS));
  }
  return projectId ? list.filter(f => f.projectId === projectId) : list;
}

export function saveStoredFundingExpression(expr: FundingExpression): void {
  if (typeof window === 'undefined') return;
  const list = getStoredFundingExpressions();
  list.unshift(expr);
  localStorage.setItem('ideacheck_funding_expressions', JSON.stringify(list));
}

export function getStoredWorkspaceTasks(projectId: string): WorkspaceTask[] {
  if (typeof window === 'undefined') return INITIAL_WORKSPACE_TASKS.filter(t => t.projectId === projectId);
  const stored = localStorage.getItem(`ideacheck_workspace_tasks_${projectId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse workspace tasks', e);
    }
  }
  const defaults = INITIAL_WORKSPACE_TASKS.filter(t => t.projectId === projectId);
  localStorage.setItem(`ideacheck_workspace_tasks_${projectId}`, JSON.stringify(defaults));
  return defaults;
}

export function saveStoredWorkspaceTask(task: WorkspaceTask): void {
  if (typeof window === 'undefined') return;
  const list = getStoredWorkspaceTasks(task.projectId);
  const index = list.findIndex(t => t.id === task.id);
  if (index !== -1) {
    list[index] = task;
  } else {
    list.unshift(task);
  }
  localStorage.setItem(`ideacheck_workspace_tasks_${task.projectId}`, JSON.stringify(list));
}

export function updateWorkspaceTaskStatus(projectId: string, taskId: string, status: 'todo' | 'in_progress' | 'done'): void {
  if (typeof window === 'undefined') return;
  const list = getStoredWorkspaceTasks(projectId);
  const task = list.find(t => t.id === taskId);
  if (task) {
    task.status = status;
    localStorage.setItem(`ideacheck_workspace_tasks_${projectId}`, JSON.stringify(list));
  }
}

export function getStoredWorkspaceResources(projectId: string): WorkspaceResource[] {
  if (typeof window === 'undefined') return INITIAL_WORKSPACE_RESOURCES.filter(r => r.projectId === projectId);
  const stored = localStorage.getItem(`ideacheck_workspace_resources_${projectId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  const defaults = INITIAL_WORKSPACE_RESOURCES.filter(r => r.projectId === projectId);
  localStorage.setItem(`ideacheck_workspace_resources_${projectId}`, JSON.stringify(defaults));
  return defaults;
}

export function saveStoredWorkspaceResource(resource: WorkspaceResource): void {
  if (typeof window === 'undefined') return;
  const list = getStoredWorkspaceResources(resource.projectId);
  list.unshift(resource);
  localStorage.setItem(`ideacheck_workspace_resources_${resource.projectId}`, JSON.stringify(list));
}

export function getStoredWorkspaceNotes(projectId: string): WorkspaceNote[] {
  if (typeof window === 'undefined') return INITIAL_WORKSPACE_NOTES.filter(n => n.projectId === projectId);
  const stored = localStorage.getItem(`ideacheck_workspace_notes_${projectId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  const defaults = INITIAL_WORKSPACE_NOTES.filter(n => n.projectId === projectId);
  localStorage.setItem(`ideacheck_workspace_notes_${projectId}`, JSON.stringify(defaults));
  return defaults;
}

export function saveStoredWorkspaceNote(note: WorkspaceNote): void {
  if (typeof window === 'undefined') return;
  const list = getStoredWorkspaceNotes(note.projectId);
  list.unshift(note);
  localStorage.setItem(`ideacheck_workspace_notes_${note.projectId}`, JSON.stringify(list));
}

export function getStoredMentors(): MentorProfile[] {
  if (typeof window === 'undefined') return INITIAL_MENTORS;
  const stored = localStorage.getItem('ideacheck_mentors');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  localStorage.setItem('ideacheck_mentors', JSON.stringify(INITIAL_MENTORS));
  return INITIAL_MENTORS;
}

export function getStoredMentorRequests(userId?: string): MentorSessionRequest[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('ideacheck_mentor_requests');
  let list: MentorSessionRequest[] = [];
  if (stored) {
    try {
      list = JSON.parse(stored);
    } catch (e) {}
  }
  return userId ? list.filter(r => r.founderId === userId || r.mentorId === userId) : list;
}

export function saveStoredMentorRequest(req: MentorSessionRequest): void {
  if (typeof window === 'undefined') return;
  const list = getStoredMentorRequests();
  list.unshift(req);
  localStorage.setItem('ideacheck_mentor_requests', JSON.stringify(list));
}

export function getStoredVerificationRequests(): VerificationRequest[] {
  if (typeof window === 'undefined') return INITIAL_VERIFICATION_REQUESTS;
  const stored = localStorage.getItem('ideacheck_verification_requests');
  let list = INITIAL_VERIFICATION_REQUESTS;
  if (stored) {
    try {
      list = JSON.parse(stored);
    } catch (e) {}
  } else {
    localStorage.setItem('ideacheck_verification_requests', JSON.stringify(INITIAL_VERIFICATION_REQUESTS));
  }
  return list;
}

export function saveStoredVerificationRequest(req: VerificationRequest): void {
  if (typeof window === 'undefined') return;
  const list = getStoredVerificationRequests();
  list.unshift(req);
  localStorage.setItem('ideacheck_verification_requests', JSON.stringify(list));
}

export function updateVerificationRequestStatus(id: string, status: 'approved' | 'rejected'): void {
  if (typeof window === 'undefined') return;
  const list = getStoredVerificationRequests();
  const req = list.find(r => r.id === id);
  if (req) {
    req.status = status;
    localStorage.setItem('ideacheck_verification_requests', JSON.stringify(list));
  }
}

export function getStoredReports(): ModerationReport[] {
  if (typeof window === 'undefined') return INITIAL_REPORTS;
  const stored = localStorage.getItem('ideacheck_moderation_reports');
  let list = INITIAL_REPORTS;
  if (stored) {
    try {
      list = JSON.parse(stored);
    } catch (e) {}
  } else {
    localStorage.setItem('ideacheck_moderation_reports', JSON.stringify(INITIAL_REPORTS));
  }
  return list;
}

export function resolveReport(id: string): void {
  if (typeof window === 'undefined') return;
  const list = getStoredReports();
  const rep = list.find(r => r.id === id);
  if (rep) {
    rep.status = 'resolved';
    localStorage.setItem('ideacheck_moderation_reports', JSON.stringify(list));
  }
}

export function dismissReport(id: string): void {
  if (typeof window === 'undefined') return;
  const list = getStoredReports();
  const rep = list.find(r => r.id === id);
  if (rep) {
    rep.status = 'dismissed';
    localStorage.setItem('ideacheck_moderation_reports', JSON.stringify(list));
  }
}

export function resetToDemoData(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ideacheck_community_projects', JSON.stringify(INITIAL_PROJECTS));
  localStorage.setItem('ideacheck_community_founders', JSON.stringify(INITIAL_FOUNDERS));
  localStorage.setItem('ideacheck_community_feedback', JSON.stringify(INITIAL_FEEDBACK));
  localStorage.setItem('ideacheck_community_collaborations', JSON.stringify(INITIAL_COLLABORATIONS));
  localStorage.setItem('ideacheck_community_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
  localStorage.setItem('ideacheck_community_milestones', JSON.stringify(INITIAL_MILESTONES));
  localStorage.setItem('ideacheck_community_campaigns', JSON.stringify(INITIAL_CAMPAIGNS));
  localStorage.setItem('ideacheck_funding_expressions', JSON.stringify(INITIAL_FUNDING_EXPRESSIONS));
  localStorage.setItem('ideacheck_mentors', JSON.stringify(INITIAL_MENTORS));
  localStorage.setItem('ideacheck_verification_requests', JSON.stringify(INITIAL_VERIFICATION_REQUESTS));
  localStorage.setItem('ideacheck_moderation_reports', JSON.stringify(INITIAL_REPORTS));
}
