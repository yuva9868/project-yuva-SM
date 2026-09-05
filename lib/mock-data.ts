export interface ValidationReport {
  id: string;
  ideaId: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  marketPotential: number;
  techFeasibility: number;
  competitorAnalysis: string;
  targetMarket: string;
  uniqueValue: string;
  businessModel: string;
  riskFactors: string;
  nextSteps: string;
  overallScore: number;
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
  // New Metrics & Sections
  buildDifficulty: string;
  estimatedMvpCost: string;
  timeToBuild: string;
  first5Features: string[];
  biggestRisk: string;
  realityCheck: string;
  competitorComparison: {
    competitor: string;
    price: string;
    strength: string;
    weakness: string;
    opportunity: string;
  }[];
  mvpRoadmap: {
    week: string;
    tasks: string;
  }[];
  pivotSuggestions: string[];
  first100UsersStrategy: {
    platform: string;
    strategy: string;
  }[];
}

export interface Idea {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  description: string;
  category: string;
  votes: number;
  comments: number;
  saved: boolean;
  report?: ValidationReport;
  createdAt: string;
  isPublic?: boolean;
  history?: {
    version: number;
    date: string;
    score: number;
    report: ValidationReport;
  }[];
}

export interface Comment {
  id: string;
  reportId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export const CATEGORIES = [
  'SaaS',
  'E-commerce',
  'Mobile App',
  'AI/ML',
  'Fintech',
  'Healthcare',
  'Education',
  'Social',
  'Gaming',
  'Other',
];

export const mockIdeas: Idea[] = [
  {
    id: 'idea_1',
    userId: 'user_1',
    userName: 'Sarah Chen',
    userAvatar: 'https://avatar.vercel.sh/sarah@example.com?s=96',
    title: 'AI-Powered Project Management Tool',
    description: 'An intelligent project management platform that uses AI to predict project timelines and identify risks automatically.',
    category: 'SaaS',
    votes: 342,
    comments: 28,
    saved: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'idea_2',
    userId: 'user_2',
    userName: 'Mike Johnson',
    userAvatar: 'https://avatar.vercel.sh/mike@example.com?s=96',
    title: 'Sustainable Packaging Marketplace',
    description: 'Connect eco-friendly packaging suppliers with businesses looking to reduce their environmental footprint.',
    category: 'E-commerce',
    votes: 218,
    comments: 15,
    saved: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'idea_3',
    userId: 'user_3',
    userName: 'Emma Rodriguez',
    userAvatar: 'https://avatar.vercel.sh/emma@example.com?s=96',
    title: 'Mental Health App for Teenagers',
    description: 'A peer-supported mental health platform specifically designed for teenagers with AI-powered mood tracking and expert guidance.',
    category: 'Healthcare',
    votes: 456,
    comments: 42,
    saved: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function generateValidationReport(idea: Idea): ValidationReport {
  const baseScore = 65 + Math.random() * 30;
  const overallScore = Math.round(baseScore * 10) / 10;
  
  return {
    id: 'report_' + idea.id,
    ideaId: idea.id,
    userId: idea.userId,
    title: idea.title,
    description: idea.description,
    category: idea.category,
    marketPotential: 72 + Math.random() * 20,
    techFeasibility: 68 + Math.random() * 25,
    competitorAnalysis: `There are ${Math.floor(3 + Math.random() * 8)} direct competitors in this space. Key differentiators include your unique value proposition and go-to-market strategy.`,
    targetMarket: `Primary market: ${idea.category === 'SaaS' ? 'Mid-market to enterprise companies' : idea.category === 'Healthcare' ? 'Healthcare providers and individuals' : 'Broad consumer market'}. TAM: $${Math.floor(10 + Math.random() * 90)}B`,
    uniqueValue: `The solution offers ${Math.random() > 0.5 ? 'superior user experience and' : ''} innovative features that address key pain points in the market.`,
    businessModel: `Recommended model: ${['Subscription (SaaS)', 'Freemium', 'Marketplace commission', 'Hybrid'][Math.floor(Math.random() * 4)]}. Consider diversifying revenue streams for sustainability.`,
    riskFactors: `Key risks include market adoption challenges, competitive pressure, and regulatory considerations. Mitigation strategies should focus on product differentiation and early customer validation.`,
    nextSteps: `1. Conduct customer discovery interviews\n2. Build MVP\n3. Validate product-market fit\n4. Develop go-to-market strategy\n5. Secure initial funding`,
    overallScore,
    recommendations: [
      'Focus on user acquisition and retention metrics',
      'Develop a clear competitive differentiation strategy',
      'Build partnerships with key industry players',
      'Consider regulatory implications early',
      'Plan for scalability from day one',
    ],
    createdAt: idea.createdAt,
    updatedAt: new Date().toISOString(),
    
    // Fallback Metrics
    buildDifficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
    estimatedMvpCost: ['Free (Self-built)', '$100 - $500', '$500 - $1,500', '$1,500 - $3,000'][Math.floor(Math.random() * 4)],
    timeToBuild: ['1-2 weeks', '3-4 weeks', '1-2 months'][Math.floor(Math.random() * 3)],
    first5Features: [
      'User Registration & Profile creation',
      'Core dashboard interface showing key analytics',
      'Integration with main utility database/API',
      'Interactive report creation and sharing options',
      'Settings panel for simple user preferences'
    ],
    biggestRisk: 'High competition in existing markets and potential low retention rate if the primary pain point isn\'t sufficiently painful.',
    realityCheck: 'This idea may fail because users may not pay unless the problem is extremely painful and alternative workarounds are unavailable.',
    competitorComparison: [
      { competitor: 'Competitor A', price: '$29/mo', strength: 'Established user base', weakness: 'Slow product iteration', opportunity: 'Target underserved niche' },
      { competitor: 'Competitor B', price: 'Free tier / Paid', strength: 'High brand awareness', weakness: 'Poor user experience', opportunity: 'Offer a clean, modern UI' }
    ],
    mvpRoadmap: [
      { week: 'Week 1', tasks: 'Research, target customer customer interviews, and simple landing page validation' },
      { week: 'Week 2', tasks: 'Core database layout and basic dashboard implementation' },
      { week: 'Week 3', tasks: 'Feature development, integrations, and initial testing' },
      { week: 'Week 4', tasks: 'Polishing, deployment, and launching to early waitlist users' }
    ],
    pivotSuggestions: [
      `Reposition as a B2B productivity tool instead of B2C.`,
      `Focus purely on a niche sector (e.g. healthcare, education) instead of a general audience.`
    ],
    first100UsersStrategy: [
      { platform: 'Reddit/LinkedIn', strategy: 'Share case studies and offer free early access to professionals in related subreddits/groups.' },
      { platform: 'WhatsApp communities', strategy: 'Reach out to local student/founder chats with a direct, personal product demo.' },
      { platform: 'Direct outreach', strategy: 'Email 50 target users directly to get feedback and secure initial beta signups.' }
    ]
  };
}

export const mockComments: Comment[] = [
  {
    id: 'comment_1',
    reportId: 'report_idea_1',
    userId: 'user_4',
    userName: 'Alex Park',
    userAvatar: 'https://avatar.vercel.sh/alex@example.com?s=96',
    content: 'Great analysis! I think the market potential is even higher than estimated.',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comment_2',
    reportId: 'report_idea_1',
    userId: 'user_5',
    userName: 'Lisa Wang',
    userAvatar: 'https://avatar.vercel.sh/lisa@example.com?s=96',
    content: 'Have you considered the competitive landscape with existing tools?',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];
