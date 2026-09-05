export type ProjectStage = 
  | 'Idea' 
  | 'Research' 
  | 'Prototype' 
  | 'MVP' 
  | 'Beta' 
  | 'Launched' 
  | 'Growing';

export type RequirementBadge = 
  | 'Looking for Feedback'
  | 'Looking for Early Users'
  | 'Looking for Co-founder'
  | 'Looking for Developers'
  | 'Looking for Designers'
  | 'Looking for Marketing help'
  | 'Looking for Mentors'
  | 'Looking for Investment'
  | 'Looking for Funding'
  | 'Looking for Business partner'
  | 'Looking for Technical review'
  | 'Looking for Market validation';

export interface PrototypeLink {
  label: string;
  url: string;
  type: 'Vercel' | 'GitHub' | 'Figma' | 'Website' | 'YouTube' | 'Product Hunt' | 'App Store' | 'Other';
}

export interface StructuredFeedbackRatings {
  problemClarity: number; // 1-10
  solution: number; // 1-10
  targetMarket: number; // 1-10
  productUx: number; // 1-10
  businessPotential: number; // 1-10
  differentiation: number; // 1-10
}

export interface StructuredFeedback {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userBadge?: string;
  ratings: StructuredFeedbackRatings;
  writtenImprovement: string;
  writtenConcerns: string;
  writtenUseReason: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface PrototypeMedia {
  id: string;
  url: string;
  caption: string;
  type: 'image' | 'video';
}

export interface ProjectFundingInfo {
  seekingInvestment: boolean;
  stage?: string;
  amountSeeking?: string;
  equityOffered?: string;
  useOfFunds?: string;
  currentTraction?: string;
  revenue?: string;
  users?: string;
}

export interface FounderProfile {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  skills: string[];
  interests: string[];
  projectsCount: number;
  experience: string;
  education?: string;
  links: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  followersCount: number;
  followingCount: number;
  collaborationStatus: string;
  collaborationInterests: Array<'Co-founder' | 'Developer' | 'Designer' | 'Marketing' | 'Investor' | 'Mentor'>;
  reputationScore: number;
  badges: Array<'Top Contributor' | 'Helpful Reviewer' | 'Founder' | 'Builder' | 'Mentor' | 'Investor' | 'Verified Founder' | 'Experienced'>;
  verifiedType?: 'Founder' | 'Investor' | 'Mentor' | 'Developer' | 'Designer' | 'Experienced';
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  category: string;
  industry: string;
  location: string;
  stage: ProjectStage;
  
  // Founder info
  founderId: string;
  founderName: string;
  founderUsername: string;
  founderAvatar: string;
  founderBadges?: string[];

  // Problem & Solution
  problemStatement: string;
  whoExperiences: string;
  currentSolutions: string;
  solutionStatement: string;
  differentiator: string;
  uniqueAdvantage: string;

  // Media & Links
  logoUrl?: string;
  prototypeMedia: PrototypeMedia[];
  prototypeLinks: PrototypeLink[];

  // Needs & Requirements
  requirements: RequirementBadge[];
  requirementDetails: string;

  // Funding
  fundingInfo: ProjectFundingInfo;

  // Visibility & Stats
  visibility: 'public' | 'community' | 'private';
  validationScore: number; // 0-100
  supportersCount: number;
  commentsCount: number;
  viewsCount: number;
  uniqueViewersCount: number;
  prototypeClicksCount: number;
  externalClicksCount: number;
  savedCount: number;

  // Feedback summary averages
  feedbackSummary?: {
    totalReviews: number;
    avgProblemClarity: number;
    avgSolution: number;
    avgTargetMarket: number;
    avgProductUx: number;
    avgBusinessPotential: number;
    avgDifferentiation: number;
    commonThemes: string[];
  };

  createdAt: string;
  updatedAt: string;
  featured?: boolean;
}

export interface CollaborationRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  recipientId: string;
  recipientName: string;
  projectId: string;
  projectTitle: string;
  role: 'Co-founder' | 'Developer' | 'Designer' | 'Marketing' | 'Mentor' | 'Investor';
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'support' | 'comment' | 'follow' | 'collaboration_request' | 'feedback' | 'mention' | 'trending' | 'saved' | 'ai_recommendation';
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export interface ModerationReport {
  id: string;
  reporterId: string;
  targetType: 'project' | 'comment' | 'user';
  targetId: string;
  targetTitle: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  aiFlagReason?: string;
  createdAt: string;
}
