'use client';

import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  Project, 
  StructuredFeedback, 
  CollaborationRequest 
} from '@/lib/community-types';
import { 
  getStoredProjects, 
  getStoredFeedback, 
  saveStoredFeedback,
  upvoteFeedback,
  replyToFeedback,
  reportFeedback,
  saveStoredCollaboration,
  INITIAL_FOUNDERS
} from '@/lib/community-data';
import { FeedbackModal } from '@/components/community/feedback-modal';
import { CollaborationModal } from '@/components/community/collaboration-modal';
import { ValidationLab } from '@/components/community/validation-lab';
import { MilestoneTimeline } from '@/components/community/milestone-timeline';
import { InvestorRoom } from '@/components/community/investor-room';
import { WorkspacePanel } from '@/components/community/workspace-panel';
import { AIIntelligenceTab } from '@/components/community/ai-intelligence-tab';
import { trackEvent } from '@/lib/analytics';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Eye, 
  Share2, 
  Sparkles, 
  ExternalLink, 
  Star, 
  Users, 
  CheckCircle2, 
  Layers, 
  ArrowLeft, 
  X, 
  Target, 
  DollarSign, 
  ShieldCheck, 
  TrendingUp,
  UserPlus,
  FlaskConical,
  Milestone as MilestoneIcon,
  ThumbsUp,
  MessageCircle,
  AlertTriangle,
  Send,
  Lock
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [feedbackList, setFeedbackList] = useState<StructuredFeedback[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // UI Modals & Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'prototype' | 'validation' | 'feedback' | 'milestones' | 'investor' | 'workspace' | 'ai_intel'>('overview');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [collabModalOpen, setCollabModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // User Actions State
  const [isSupported, setIsSupported] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const projects = getStoredProjects();
    const found = projects.find(p => p.id === projectId);
    
    if (found) {
      setProject(found);
      const fb = getStoredFeedback(projectId);
      setFeedbackList(fb);

      // Increment view count
      const updated = projects.map(p => p.id === projectId ? { ...p, viewsCount: p.viewsCount + 1 } : p);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ideacheck_community_projects', JSON.stringify(updated));
      }
      trackEvent('project_viewed', { projectId }, user?.id, projectId);
    }

    if (user) {
      const storedSupports = localStorage.getItem(`ideacheck_supported_${user.id}`);
      if (storedSupports) {
        try {
          const list: string[] = JSON.parse(storedSupports);
          setIsSupported(list.includes(projectId));
        } catch (e) {}
      }
    }
  }, [projectId, user]);

  if (!project) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 text-center max-w-md mx-auto space-y-4">
          <p className="text-muted-foreground">Startup project not found.</p>
          <Link href="/community">
            <Button variant="outline">Back to Community</Button>
          </Link>
        </div>
      </main>
    );
  }

  const isOwner = Boolean(user && (user.id === project.founderId || user.email.split('@')[0] === project.founderUsername));

  const handleSupportToggle = () => {
    if (!user) { router.push('/login'); return; }
    
    const nextState = !isSupported;
    setIsSupported(nextState);

    const storedSupports = localStorage.getItem(`ideacheck_supported_${user.id}`);
    let list: string[] = storedSupports ? JSON.parse(storedSupports) : [];
    if (nextState) list.push(projectId);
    else list = list.filter(id => id !== projectId);
    localStorage.setItem(`ideacheck_supported_${user.id}`, JSON.stringify(list));

    const updatedProjects = getStoredProjects().map(p => 
      p.id === projectId ? { ...p, supportersCount: p.supportersCount + (nextState ? 1 : -1) } : p
    );
    setProject(prev => prev ? { ...prev, supportersCount: prev.supportersCount + (nextState ? 1 : -1) } : null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ideacheck_community_projects', JSON.stringify(updatedProjects));
    }
    showToast(nextState ? 'Project added to supported startups!' : 'Removed from supported startups.');
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Project link copied to clipboard!');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) { router.push('/login'); return; }

    const c = {
      id: 'c_' + Date.now(),
      userName: user.name,
      userAvatar: user.avatar,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [c, ...prev]);
    setNewComment('');
    setProject(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null);
    showToast('Comment posted.');
  };

  const handleFeedbackSubmitted = (newFb: StructuredFeedback) => {
    saveStoredFeedback(newFb);
    setFeedbackList(prev => [newFb, ...prev]);
    showToast('Thank you! Structured review published.');
  };

  const handleCollaborationSubmitted = (req: CollaborationRequest) => {
    saveStoredCollaboration(req);
    showToast(`Collaboration proposal submitted to ${project.founderName}!`);
  };

  const handleUpvoteFeedback = (fbId: string) => {
    if (!user) { router.push('/login'); return; }
    upvoteFeedback(fbId, user.id);
    setFeedbackList(getStoredFeedback(projectId));
  };

  const handleSendReply = (fbId: string) => {
    if (!replyText.trim() || !user) return;
    replyToFeedback(fbId, {
      content: replyText.trim(),
      createdAt: new Date().toISOString(),
      founderName: user.name
    });
    setReplyText('');
    setReplyingToId(null);
    setFeedbackList(getStoredFeedback(projectId));
    showToast('Founder reply posted.');
  };

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-16">
      <Header />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Link href="/community" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Startup Discovery</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <Card className="p-6 sm:p-8 bg-card border-border rounded-2xl shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-6">
              {project.logoUrl ? (
                <img
                  src={project.logoUrl}
                  alt={project.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-border shadow-md shrink-0"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 text-primary font-black text-3xl flex items-center justify-center border border-primary/20 shrink-0">
                  {project.name.charAt(0)}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{project.name}</h1>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    {project.stage} Stage
                  </span>
                  {project.validationScore > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {project.validationScore}/100 Validation Score
                    </span>
                  )}
                </div>

                <p className="text-base sm:text-lg font-medium text-muted-foreground max-w-3xl leading-relaxed">
                  {project.tagline}
                </p>

                {/* Founder Info */}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
                  <Link href={`/profile/${project.founderUsername}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img src={project.founderAvatar} alt={project.founderName} className="w-6 h-6 rounded-full object-cover border" />
                    <span className="font-bold text-foreground">{project.founderName}</span>
                    <span className="text-muted-foreground">(@{project.founderUsername})</span>
                  </Link>
                  <span>•</span>
                  <span>Category: <strong className="text-foreground">{project.category}</strong></span>
                  <span>•</span>
                  <span>Industry: <strong className="text-foreground">{project.industry}</strong></span>
                  <span>•</span>
                  <span>Location: <strong className="text-foreground">{project.location}</strong></span>
                </div>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant={isSupported ? 'default' : 'outline'}
                onClick={handleSupportToggle}
                className="gap-2 font-bold rounded-xl text-xs"
              >
                <Heart className={`w-4 h-4 ${isSupported ? 'fill-current' : ''}`} />
                <span>{isSupported ? 'Supported' : 'Support'}</span>
                <span className="text-xs bg-background/20 px-1.5 py-0.5 rounded-md">{project.supportersCount}</span>
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="rounded-xl text-muted-foreground hover:text-foreground"
                title="Share Startup"
              >
                <Share2 className="w-4 h-4" />
              </Button>

              {!isOwner && (
                <Button
                  variant="outline"
                  onClick={() => setCollabModalOpen(true)}
                  className="gap-2 font-semibold border-primary/40 text-primary hover:bg-primary/10 rounded-xl text-xs"
                >
                  <Users className="w-4 h-4" />
                  <span>Request Collaboration</span>
                </Button>
              )}

              <Button
                onClick={() => setFeedbackModalOpen(true)}
                className="gap-2 font-bold shadow-md shadow-primary/20 rounded-xl text-xs"
              >
                <Star className="w-4 h-4 fill-current" />
                <span>Give Structured Feedback</span>
              </Button>
            </div>
          </div>

          {/* Requirements Badges List */}
          {project.requirements && project.requirements.length > 0 && (
            <div className="pt-4 border-t border-border/60 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Founder seeking:</span>
              {project.requirements.map(req => (
                <span key={req} className="px-3 py-1 rounded-lg text-xs font-bold bg-secondary text-foreground border border-border">
                  {req}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Section Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2.5 font-bold rounded-xl transition-all shrink-0 ${
              activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            About & Solution
          </button>

          <button
            onClick={() => setActiveTab('prototype')}
            className={`px-3.5 py-2.5 font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'prototype' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Prototype ({project.prototypeMedia?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('validation')}
            className={`px-3.5 py-2.5 font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'validation' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
            <span>Validation Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-3.5 py-2.5 font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'feedback' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Feedback ({feedbackList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`px-3.5 py-2.5 font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'milestones' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <MilestoneIcon className="w-3.5 h-3.5" />
            <span>Progress Milestones</span>
          </button>

          <button
            onClick={() => setActiveTab('investor')}
            className={`px-3.5 py-2.5 font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'investor' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Investor Room</span>
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3.5 py-2.5 font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'workspace' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_intel')}
            className={`px-3.5 py-2.5 font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ai_intel' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Intel & Matching</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Problem */}
              <Card className="p-6 bg-card border-border rounded-2xl space-y-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Target className="w-5 h-5 text-rose-500" />
                  The Problem
                </h2>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                  {project.problemStatement}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-muted-foreground">
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="font-semibold text-foreground block mb-1">Who experiences this?</span>
                    <span>{project.whoExperiences}</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="font-semibold text-foreground block mb-1">Current Alternatives</span>
                    <span>{project.currentSolutions}</span>
                  </div>
                </div>
              </Card>

              {/* Solution */}
              <Card className="p-6 bg-card border-border rounded-2xl space-y-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  The Solution & Differentiation
                </h2>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                  {project.solutionStatement}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-muted-foreground">
                  <div className="p-3 bg-primary/5 border border-primary/15 rounded-xl">
                    <span className="font-semibold text-primary block mb-1">Differentiator</span>
                    <span className="text-foreground">{project.differentiator}</span>
                  </div>
                  <div className="p-3 bg-primary/5 border border-primary/15 rounded-xl">
                    <span className="font-semibold text-primary block mb-1">Unique Advantage</span>
                    <span className="text-foreground">{project.uniqueAdvantage}</span>
                  </div>
                </div>
              </Card>

              {/* What Has Been Built */}
              {project.builtDescription && (
                <Card className="p-6 bg-card border-border rounded-2xl space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    What Has Actually Been Built
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {project.builtDescription}
                  </p>
                </Card>
              )}

              {/* Validation Evidence Metrics Bar */}
              {project.validationMetrics && project.validationMetrics.length > 0 && (
                <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Validation Metrics & Traction Signals
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {project.validationMetrics.map((met, idx) => (
                      <div key={idx} className="p-3 bg-muted/30 border border-border/50 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground truncate">{met.label}</span>
                          {met.isEvidenceSupported ? (
                            <span className="text-emerald-400 font-bold" title="Evidence Verified">✓ Verified</span>
                          ) : (
                            <span className="text-muted-foreground" title="Self-Reported">Self-rep</span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-foreground block truncate">{met.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Interactive Prototype links */}
              {project.prototypeLinks && project.prototypeLinks.length > 0 && (
                <Card className="p-6 bg-gradient-to-r from-primary/10 via-background to-background border-primary/20 rounded-2xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      Live Prototype & Working Links
                    </h3>
                    <p className="text-xs text-muted-foreground">Test the interactive code, app, or canvas built by the founder.</p>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {project.prototypeLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-md transition-all"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column Sidebar */}
            <div className="space-y-6">
              {/* Founder Profile Card */}
              <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Founder</h3>
                <div className="flex items-center gap-3">
                  <img src={project.founderAvatar} alt={project.founderName} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                  <div>
                    <Link href={`/profile/${project.founderUsername}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                      {project.founderName}
                    </Link>
                    <p className="text-xs text-muted-foreground">@{project.founderUsername}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  Full-stack founder building evidence-validated products on IdeaCheck AI.
                </p>
                <Link href={`/profile/${project.founderUsername}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl">
                    View Founder Credibility Passport
                  </Button>
                </Link>
              </Card>

              {/* Engagement Stats */}
              <Card className="p-6 bg-card border-border rounded-2xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ecosystem Engagement</h3>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-lg font-black text-foreground block">{project.supportersCount}</span>
                    <span className="text-[10px] text-muted-foreground">Supporters</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-lg font-black text-foreground block">{project.viewsCount}</span>
                    <span className="text-[10px] text-muted-foreground">Views</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-lg font-black text-foreground block">{project.prototypeClicksCount}</span>
                    <span className="text-[10px] text-muted-foreground">Prototype Clicks</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-lg font-black text-foreground block">{feedbackList.length}</span>
                    <span className="text-[10px] text-muted-foreground">Reviews</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: PROTOTYPE GALLERY */}
        {activeTab === 'prototype' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Prototype Screenshots & Media</h2>
                <p className="text-xs text-muted-foreground">High-resolution interface captures of the working implementation.</p>
              </div>
            </div>

            {(!project.prototypeMedia || project.prototypeMedia.length === 0) ? (
              <Card className="p-12 text-center border-dashed rounded-2xl">
                <p className="text-xs text-muted-foreground">No screenshot media uploaded yet for this prototype.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.prototypeMedia.map((media) => (
                  <Card
                    key={media.id}
                    onClick={() => setLightboxImage(media.url)}
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-border hover:border-primary transition-all duration-300 shadow-md"
                  >
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={media.url}
                        alt={media.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-2">
                        <Eye className="w-5 h-5" />
                        <span>Enlarge Screenshot</span>
                      </div>
                    </div>
                    <div className="p-4 bg-card">
                      <p className="text-xs font-semibold text-foreground">{media.caption}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VALIDATION LAB */}
        {activeTab === 'validation' && (
          <ValidationLab project={project} isOwner={isOwner} />
        )}

        {/* TAB 4: STRUCTURED FEEDBACK */}
        {activeTab === 'feedback' && (
          <div className="space-y-8">
            {/* Feedback Dashboard Summary */}
            {project.feedbackSummary && (
              <Card className="p-6 bg-card border-border rounded-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      Aggregated Community Ratings ({project.feedbackSummary.totalReviews} Reviews)
                    </h3>
                    <p className="text-xs text-muted-foreground">Calculated across 7 standard product dimensions</p>
                  </div>
                  <Button size="sm" onClick={() => setFeedbackModalOpen(true)} className="gap-2 rounded-xl font-bold text-xs">
                    <Star className="w-4 h-4" />
                    <span>Give Feedback</span>
                  </Button>
                </div>

                {/* Ratings Progress Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  {[
                    { label: 'Problem Clarity', score: project.feedbackSummary.avgProblemClarity },
                    { label: 'Solution Fit', score: project.feedbackSummary.avgSolution },
                    { label: 'Ease of Use', score: project.feedbackSummary.avgEaseOfUse || 8.5 },
                    { label: 'Design & UX', score: project.feedbackSummary.avgProductUx },
                    { label: 'Technical Implementation', score: project.feedbackSummary.avgTechnicalImplementation || 8.8 },
                    { label: 'Target Market', score: project.feedbackSummary.avgTargetMarket },
                    { label: 'Business Potential', score: project.feedbackSummary.avgBusinessPotential },
                    { label: 'Differentiation', score: project.feedbackSummary.avgDifferentiation },
                  ].map(stat => (
                    <div key={stat.label} className="p-3 bg-muted/30 border border-border/50 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="truncate">{stat.label}</span>
                        <span className="font-extrabold text-primary">{stat.score} / 10</span>
                      </div>
                      <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${(stat.score / 10) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Written Feedback List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">Verified Community Feedback Stream</h3>
                <span className="text-xs text-muted-foreground">{feedbackList.length} reviews</span>
              </div>

              {feedbackList.length === 0 ? (
                <Card className="p-10 text-center border-dashed rounded-2xl space-y-3">
                  <p className="text-xs text-muted-foreground">No structured feedback submitted yet. Be the first to evaluate this project!</p>
                  <Button size="sm" onClick={() => setFeedbackModalOpen(true)} className="rounded-xl font-bold text-xs gap-1.5">
                    <Star className="w-3.5 h-3.5" />
                    <span>Give Feedback</span>
                  </Button>
                </Card>
              ) : (
                feedbackList.map((fb) => (
                  <Card key={fb.id} className="p-6 bg-card border-border rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div className="flex items-center gap-3">
                        <img src={fb.userAvatar} alt={fb.userName} className="w-8 h-8 rounded-full object-cover border" />
                        <div>
                          <span className="font-bold text-xs text-foreground">{fb.userName}</span>
                          {fb.userBadge && (
                            <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {fb.userBadge}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                        <button 
                          onClick={() => handleUpvoteFeedback(fb.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] transition-colors ${
                            (fb.helpfulVotes || []).includes(user?.id || '')
                              ? 'bg-primary/10 border-primary text-primary font-bold'
                              : 'bg-muted/30 border-border hover:bg-muted text-muted-foreground'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Helpful ({(fb.helpfulVotes || []).length})</span>
                        </button>
                      </div>
                    </div>

                    {/* Qualitative Answers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-muted/30 border border-border/40 rounded-xl space-y-1">
                        <span className="font-bold text-primary block">What Works Well</span>
                        <p className="text-foreground/90">{fb.whatWorksWell || fb.writtenUseReason}</p>
                      </div>
                      <div className="p-3 bg-muted/30 border border-border/40 rounded-xl space-y-1">
                        <span className="font-bold text-amber-500 block">Confusion & Friction</span>
                        <p className="text-foreground/90">{fb.whatIsConfusing || fb.writtenConcerns}</p>
                      </div>
                      <div className="p-3 bg-muted/30 border border-border/40 rounded-xl space-y-1">
                        <span className="font-bold text-emerald-400 block">Suggested Improvements</span>
                        <p className="text-foreground/90">{fb.whatWouldImprove || fb.writtenImprovement}</p>
                      </div>
                    </div>

                    {/* Founder Reply if any */}
                    {fb.ownerReply && (
                      <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl text-xs space-y-1 pl-4 border-l-4 border-l-primary">
                        <div className="flex items-center justify-between text-[11px] text-primary font-bold">
                          <span>Founder Response • {fb.ownerReply.founderName}</span>
                          <span className="text-muted-foreground font-normal">{new Date(fb.ownerReply.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-foreground/90">{fb.ownerReply.content}</p>
                      </div>
                    )}

                    {/* Reply Input for Owner */}
                    {isOwner && !fb.ownerReply && (
                      <div className="pt-2">
                        {replyingToId === fb.id ? (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Write a public reply as founder..."
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              rows={2}
                              className="text-xs rounded-xl"
                            />
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setReplyingToId(null)} className="text-xs">Cancel</Button>
                              <Button size="sm" onClick={() => handleSendReply(fb.id)} className="text-xs font-bold">Post Reply</Button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setReplyingToId(fb.id)}
                            className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Reply to this reviewer</span>
                          </button>
                        )}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: MILESTONES */}
        {activeTab === 'milestones' && (
          <MilestoneTimeline project={project} isOwner={isOwner} />
        )}

        {/* TAB 6: INVESTOR ROOM */}
        {activeTab === 'investor' && (
          <InvestorRoom project={project} isOwner={isOwner} />
        )}

        {/* TAB 7: WORKSPACE */}
        {activeTab === 'workspace' && (
          <WorkspacePanel project={project} isOwner={isOwner} />
        )}

        {/* TAB 8: AI INTEL & MATCHING */}
        {activeTab === 'ai_intel' && (
          <AIIntelligenceTab project={project} feedbackList={feedbackList} />
        )}

        {/* Discussion Section */}
        <Card id="discussion" className="p-6 sm:p-8 bg-card border-border rounded-2xl space-y-6">
          <h3 className="text-base font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Public Questions & Community Discussion ({project.commentsCount})
          </h3>

          <form onSubmit={handleAddComment} className="space-y-3">
            <Textarea
              placeholder="Ask the founder a question or leave public feedback..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="text-xs rounded-xl"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" className="gap-2 font-bold rounded-xl text-xs">
                <span>Post Comment</span>
              </Button>
            </div>
          </form>

          <div className="space-y-3 pt-3 border-t border-border">
            {comments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No comments posted yet. Start the conversation!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="p-3.5 bg-muted/20 border border-border/40 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <img src={c.userAvatar || `https://avatar.vercel.sh/${c.userName}?s=96`} alt={c.userName} className="w-5 h-5 rounded-full" />
                    <span className="font-bold text-foreground">{c.userName}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-foreground/90 pl-7">{c.content}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Lightbox Image Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={lightboxImage} alt="Prototype Lightbox" className="w-full h-full object-contain" />
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white bg-black/60 rounded-full">
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        projectId={project.id}
        projectTitle={project.name}
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />

      <CollaborationModal
        isOpen={collabModalOpen}
        onClose={() => setCollabModalOpen(false)}
        projectId={project.id}
        projectTitle={project.name}
        recipientId={project.founderId}
        recipientName={project.founderName}
        onCollaborationSubmitted={handleCollaborationSubmitted}
      />

      <MobileNav />
    </main>
  );
}
