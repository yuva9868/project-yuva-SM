import { 
  Project, 
  FounderProfile, 
  StructuredFeedback, 
  CollaborationRequest, 
  NotificationItem, 
  ModerationReport,
  RequirementBadge,
  ProjectStage
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
    bio: 'Ex-Stripe engineer building next-gen developer productivity and AI workspace tools.',
    location: 'San Francisco, CA',
    skills: ['TypeScript', 'Next.js', 'Python', 'LLMs', 'System Architecture'],
    interests: ['AI Tools', 'DevTools', 'SaaS', 'Open Source'],
    projectsCount: 2,
    experience: '8+ years as Senior Staff Engineer at Stripe & Supabase contributor.',
    education: 'BS in Computer Science, UC Berkeley',
    links: {
      github: 'https://github.com',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      website: 'https://sarahchen.dev',
    },
    followersCount: 1240,
    followingCount: 380,
    collaborationStatus: 'Actively looking for a Product Marketing Co-founder & Beta Users',
    collaborationInterests: ['Co-founder', 'Marketing', 'Investor'],
    reputationScore: 945,
    badges: ['Verified Founder', 'Top Contributor', 'Builder', 'Helpful Reviewer'],
    verifiedType: 'Founder',
  },
  {
    id: 'user_alex',
    username: 'alexvance',
    name: 'Alex Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Full-stack AI developer & open source enthusiast. Passionate about health tech & micro-saas.',
    location: 'Austin, TX',
    skills: ['React Native', 'Node.js', 'PyTorch', 'UI/UX Design'],
    interests: ['Digital Health', 'Mobile Apps', 'Fitness Tech'],
    projectsCount: 3,
    experience: 'Former Lead Mobile Dev at Calm. Built 4 bootstrapped products.',
    education: 'MS in HCI, Stanford University',
    links: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
    followersCount: 890,
    followingCount: 210,
    collaborationStatus: 'Looking for Health Mentors & Angel Investors',
    collaborationInterests: ['Mentor', 'Investor', 'Developer'],
    reputationScore: 820,
    badges: ['Builder', 'Top Contributor', 'Helpful Reviewer'],
    verifiedType: 'Experienced',
  },
  {
    id: 'user_elena',
    username: 'elenaross',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Partner at Horizon Ventures & Founder advisor. Angel investor in 15+ B2B SaaS startups.',
    location: 'New York, NY',
    skills: ['Venture Funding', 'Go-To-Market Strategy', 'Financial Modeling', 'Growth'],
    interests: ['FinTech', 'AI/ML', 'Enterprise Software'],
    projectsCount: 1,
    experience: 'Former VP of Growth at Plaid, Angel Investor.',
    education: 'MBA, Harvard Business School',
    links: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
    followersCount: 3410,
    followingCount: 450,
    collaborationStatus: 'Mentoring pre-seed & seed stage B2B founders',
    collaborationInterests: ['Investor', 'Mentor'],
    reputationScore: 1250,
    badges: ['Mentor', 'Investor', 'Top Contributor'],
    verifiedType: 'Investor',
  },
  {
    id: 'user_marcus',
    username: 'marcusdev',
    name: 'Marcus Thorne',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'UI/UX Design Director & Frontend Engineer. Obsessed with micro-interactions & typography.',
    location: 'London, UK',
    skills: ['Figma', 'Tailwind CSS', 'Framer', 'Design Systems', 'React'],
    interests: ['Design Tools', 'Creative Tech', 'Consumer Products'],
    projectsCount: 1,
    experience: 'Ex-Design Lead at Linear & Framer template creator.',
    links: {
      github: 'https://github.com',
      twitter: 'https://twitter.com',
      website: 'https://marcusthorne.design',
    },
    followersCount: 1560,
    followingCount: 290,
    collaborationStatus: 'Open to joining seed-stage startup as Design Co-founder',
    collaborationInterests: ['Co-founder', 'Designer'],
    reputationScore: 780,
    badges: ['Builder', 'Helpful Reviewer'],
    verifiedType: 'Designer',
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_flowsmith',
    name: 'FlowSmith AI',
    tagline: 'Autonomous AI workflow builder that turns natural language into production backend APIs',
    category: 'AI/ML',
    industry: 'Developer Tools & Automation',
    location: 'San Francisco, CA',
    stage: 'MVP',

    founderId: 'user_sarah',
    founderName: 'Sarah Chen',
    founderUsername: 'sarahchen',
    founderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    founderBadges: ['Verified Founder', 'Top Contributor'],

    problemStatement: 'Engineers spend over 40% of their sprints writing repetitive CRUD endpoints, integrations, and webhook listeners. Existing low-code tools produce unmaintainable lock-in code that cannot be committed to Git.',
    whoExperiences: 'Backend developers, startup CTOs, and technical product managers building complex web/mobile platforms.',
    currentSolutions: 'Manual coding in Express/FastAPI, or visual drag-and-drop tools like Zapier/n8n which lack TypeScript type safety and custom business logic flexibility.',

    solutionStatement: 'FlowSmith allows developers to describe complex data flows in natural language, automatically generating production-ready, fully typed TypeScript code complete with unit tests and OpenAPI specs.',
    differentiator: 'Generates clean Git-versioned TypeScript code rather than proprietary visual state graphs.',
    uniqueAdvantage: 'Proprietary fine-tuned code generation pipeline trained specifically on cloud infrastructure best practices.',

    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
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

    fundingInfo: {
      seekingInvestment: true,
      stage: 'Pre-Seed',
      amountSeeking: '$500,000',
      equityOffered: '10-15%',
      useOfFunds: '70% Core AI research & GPU compute infra, 30% Developer outreach & developer relations.',
      currentTraction: '140 Waitlist Beta Users, 12 Weekly Active Projects',
      revenue: '$0 (Free Beta)',
      users: '140 registered developers'
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
      commonThemes: [
        'Developers love the clean TypeScript output',
        'Requesting VS Code extension integration',
        'Pricing model needs clear monthly token tiers'
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
    founderBadges: ['Builder', 'Top Contributor'],

    problemStatement: 'Knowledge workers and athletes suffer from burnout and overtraining because current health apps only give static, retrospective numbers without actionable real-time interventions.',
    whoExperiences: 'High-performance professionals, founders, endurance athletes, and chronic stress sufferers.',
    currentSolutions: 'Apple Health or Oura ring raw graphs which require manual interpretation and lack personalized behavioral nudges.',

    solutionStatement: 'PulseTrack combines HRV data with calendar and sleep metrics to predict energy dips 3 hours in advance and suggest micro-recovery routines.',
    differentiator: 'Predictive HRV modeling paired with automated calendar optimization.',
    uniqueAdvantage: 'Trained on 50,000 hours of anonymized continuous heart rate variability data.',

    logoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&auto=format&fit=crop&q=80',
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

    fundingInfo: {
      seekingInvestment: false,
      stage: 'Bootstrapped',
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
      commonThemes: [
        'Slick mobile interface design',
        'Users want Apple Watch complication support',
        'Need clear HIPAA privacy guidelines'
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
    founderBadges: ['Builder'],

    problemStatement: '3D designers and UI designers work in siloed 2D environments, making it difficult to visualize how 2D interfaces feel inside 3D spatial software.',
    whoExperiences: 'UI/UX designers, 3D artists, game developers, and VisionOS builders.',
    currentSolutions: 'Figma (2D only) or Blender/Unity (too heavy for quick UI prototyping).',

    solutionStatement: 'CraftSpace is a lightweight browser canvas where designers drag 2D layouts into 3D environments with live WebGL shader previews.',
    differentiator: 'Instant WebGL rendering in browser without installing heavy 3D software.',
    uniqueAdvantage: 'Custom lightweight WebGL rendering engine written in Rust + WebAssembly.',

    logoUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&auto=format&fit=crop&q=80',
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

    fundingInfo: {
      seekingInvestment: true,
      stage: 'Idea/Prototype',
      amountSeeking: '$250,000',
      equityOffered: '10%',
      useOfFunds: 'Full-time technical engineering & server infrastructure.',
      currentTraction: 'Alpha prototype running on WebGL',
      revenue: '$0',
      users: '25 Alpha testers'
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
    },
    writtenImprovement: 'Add a direct VS Code extension so developers can invoke endpoint generation without leaving their editor tab.',
    writtenConcerns: 'Ensure generated OpenAPI specs handle complex nested JWT auth permissions seamlessly.',
    writtenUseReason: 'I build 3-4 backend services a month; this would save me 15 hours per build.',
    isAnonymous: false,
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
    },
    writtenImprovement: 'Focus pitch messaging on enterprise developer security compliance (SOC2 / HIPAA ready generated code).',
    writtenConcerns: 'Big tech cloud providers (AWS Amplify / Supabase) might introduce similar AI prompt generators.',
    writtenUseReason: 'Extremely compelling market opportunity. Happy to connect regarding Pre-Seed allocation.',
    isAnonymous: false,
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
    message: 'Hey Sarah! Love FlowSmith. I specialize in complex developer tool UIs and design systems. I would love to collaborate on your frontend editor experience.',
    status: 'pending',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
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
    link: '/community/proj_flowsmith#feedback',
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
    reason: 'Promotional spam & misleading claims',
    status: 'pending',
    aiFlagReason: 'AI Moderation score: 98% likelihood of promotional spam.',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  }
];

// Helper functions for LocalStorage persistence

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
    
    const sumClarity = projectFeedback.reduce((acc, f) => acc + f.ratings.problemClarity, 0);
    const sumSol = projectFeedback.reduce((acc, f) => acc + f.ratings.solution, 0);
    const sumTarget = projectFeedback.reduce((acc, f) => acc + f.ratings.targetMarket, 0);
    const sumUx = projectFeedback.reduce((acc, f) => acc + f.ratings.productUx, 0);
    const sumBiz = projectFeedback.reduce((acc, f) => acc + f.ratings.businessPotential, 0);
    const sumDiff = projectFeedback.reduce((acc, f) => acc + f.ratings.differentiation, 0);

    projects[projectIndex].feedbackSummary = {
      totalReviews: count,
      avgProblemClarity: Math.round((sumClarity / count) * 10) / 10,
      avgSolution: Math.round((sumSol / count) * 10) / 10,
      avgTargetMarket: Math.round((sumTarget / count) * 10) / 10,
      avgProductUx: Math.round((sumUx / count) * 10) / 10,
      avgBusinessPotential: Math.round((sumBiz / count) * 10) / 10,
      avgDifferentiation: Math.round((sumDiff / count) * 10) / 10,
      commonThemes: projects[projectIndex].feedbackSummary?.commonThemes || ['High community engagement']
    };
    saveStoredProjects(projects);
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
