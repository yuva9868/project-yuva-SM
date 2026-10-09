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

export type VerificationStatus = 'not_verified' | 'pending' | 'verified' | 'rejected';

export interface VerificationIndicator {
  identity: VerificationStatus;
  skill: VerificationStatus;
  portfolio: VerificationStatus;
  completedCollaborationsCount: number;
  confirmedMilestonesCount: number;
  helpfulFeedbackCount: number;
  mentoringContributionsCount: number;
}

export interface Endorsement {
  id: string;
  endorserId: string;
  endorserName: string;
  endorserAvatar: string;
  relationship: string;
  content: string;
  skillOrProject: string;
  date: string;
}

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
  easeOfUse?: number; // 1-10
  technicalImplementation?: number; // 1-10
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
  whatWorksWell?: string;
  whatIsConfusing?: string;
  whatWouldImprove?: string;
  wouldPersonallyUse?: 'Yes' | 'Maybe' | 'No';
  additionalInfoNeeded?: string;
  helpfulVotes?: string[]; // user IDs who upvoted
  ownerReply?: {
    content: string;
    createdAt: string;
    founderName: string;
  };
  isAnonymous: boolean;
  status?: 'published' | 'reported';
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
  businessModel?: string;
  pitchDeckUrl?: string;
}

export interface ValidationMetricItem {
  label: string;
  value: string;
  isEvidenceSupported: boolean; // false = self-reported, true = evidence verified
  proofUrl?: string;
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
  badges: Array<'Top Contributor' | 'Helpful Reviewer' | 'Founder' | 'Builder' | 'Mentor' | 'Investor' | 'Verified Founder' | 'Experienced' | 'Verified Skill' | 'Completed Collaborator' | 'Verified Identity'>;
  verifiedType?: 'Founder' | 'Investor' | 'Mentor' | 'Developer' | 'Designer' | 'Experienced';
  credibility?: VerificationIndicator;
  endorsements?: Endorsement[];
  profileCompletionPercentage?: number;
  privacySettings?: {
    showEmail?: boolean;
    showLocation?: boolean;
    showLinks?: boolean;
    showMilestones?: boolean;
  };
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in_progress' | 'planned';
  isVerified: boolean;
  metric?: string;
  evidenceLink?: string;
  visibility: 'public' | 'private';
}

export interface ValidationQuestion {
  id: string;
  question: string;
  type: 'text' | 'rating' | 'choice';
  options?: string[];
}

export interface CampaignSubmission {
  id: string;
  campaignId: string;
  projectId: string;
  userId: string;
  userName: string;
  answers: Record<string, string | number>;
  feedbackThemes?: string[];
  createdAt: string;
}

export interface ValidationCampaign {
  id: string;
  projectId: string;
  projectTitle?: string;
  founderId: string;
  title: string;
  type: 'prototype_testing' | 'customer_interviews' | 'short_survey' | 'waitlist_recruitment' | 'usability_testing' | 'problem_validation' | 'pricing_research';
  description: string;
  targetAudience: string;
  eligibilityCriteria: string;
  questions: ValidationQuestion[];
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'draft';
  visitsCount: number;
  signupsCount: number;
  completedTestsCount: number;
  submissions: CampaignSubmission[];
  feedbackThemes?: string[];
}

export interface FundingExpression {
  id: string;
  projectId: string;
  projectTitle: string;
  investorId: string;
  investorName: string;
  investorFirm?: string;
  checkSizeRange: string;
  notes: string;
  pitchDeckRequested: boolean;
  status: 'pending' | 'reviewed' | 'connected';
  createdAt: string;
}

export interface WorkspaceTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  assigneeName?: string;
  assigneeAvatar?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
}

export interface WorkspaceResource {
  id: string;
  projectId: string;
  title: string;
  url: string;
  category: 'Design' | 'Repository' | 'Documentation' | 'Meeting' | 'Other';
  addedBy: string;
  createdAt: string;
}

export interface WorkspaceNote {
  id: string;
  projectId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface MentorProfile {
  id: string;
  userId: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  expertise: string[];
  industries: string[];
  availability: string;
  isVerifiedMentor: boolean;
  sessionsCount: number;
  rating: number;
  linkedin?: string;
}

export interface MentorSessionRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  founderId: string;
  founderName: string;
  topic: string;
  details: string;
  preferredTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'declined';
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'identity' | 'skill' | 'portfolio' | 'mentor';
  evidenceUrl: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  userId?: string;
  projectId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
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
  targetUsers?: string;

  // Media & Links
  logoUrl?: string;
  prototypeMedia: PrototypeMedia[];
  prototypeLinks: PrototypeLink[];
  builtDescription?: string;

  // Needs & Requirements
  requirements: RequirementBadge[];
  requirementDetails: string;

  // Validation Metrics & Evidence
  validationMetrics?: ValidationMetricItem[];

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
    avgEaseOfUse?: number;
    avgTechnicalImplementation?: number;
    commonThemes: string[];
    actionableSuggestions?: string[];
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
  reasonForReachingOut?: string;
  proposedContribution?: string;
  availabilityCommitment?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'support' | 'comment' | 'follow' | 'collaboration_request' | 'feedback' | 'mention' | 'trending' | 'saved' | 'ai_recommendation' | 'milestone' | 'validation_response' | 'mentor_request' | 'collaboration_accepted';
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
