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
  saveStoredCollaboration,
  INITIAL_FOUNDERS
} from '@/lib/community-data';
import { FeedbackModal } from '@/components/community/feedback-modal';
import { CollaborationModal } from '@/components/community/collaboration-modal';
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
  UserPlus
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
  const [activeTab, setActiveTab] = useState<'overview' | 'prototype' | 'feedback' | 'needs' | 'ai_intel'>('overview');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [collabModalOpen, setCollabModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // User Actions State
  const [isSupported, setIsSupported] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
  };

  const handleFeedbackSubmitted = (newFb: StructuredFeedback) => {
    saveStoredFeedback(newFb);
    setFeedbackList(prev => [newFb, ...prev]);
  };

  const handleCollaborationSubmitted = (req: CollaborationRequest) => {
    saveStoredCollaboration(req);
    alert(`Collaboration request submitted to ${project.founderName}!`);
  };

  // AI Recommended Members for "People who can help"
  const recommendedHelpers = INITIAL_FOUNDERS.filter(f => f.id !== project.founderId);

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-16">
      <Header />

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
                      {project.validationScore}/100 Validation
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
                  <span>Location: <strong className="text-foreground">{project.location}</strong></span>
                </div>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant={isSupported ? 'default' : 'outline'}
                onClick={handleSupportToggle}
                className="gap-2 font-bold rounded-xl"
              >
                <Heart className={`w-4 h-4 ${isSupported ? 'fill-current' : ''}`} />
                <span>{isSupported ? 'Supported' : 'Support'}</span>
                <span className="text-xs bg-background/20 px-1.5 py-0.5 rounded-md">{project.supportersCount}</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setCollabModalOpen(true)}
                className="gap-2 font-semibold border-primary/40 text-primary hover:bg-primary/10 rounded-xl"
              >
                <Users className="w-4 h-4" />
                <span>Request Collaboration</span>
              </Button>

              <Button
                onClick={() => setFeedbackModalOpen(true)}
                className="gap-2 font-bold shadow-md shadow-primary/20 rounded-xl"
              >
                <Star className="w-4 h-4 fill-current" />
                <span>Give Feedback</span>
              </Button>
            </div>
          </div>

          {/* Requirements Badges List */}
          {project.requirements && project.requirements.length > 0 && (
            <div className="pt-4 border-t border-border/60 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Founder looking for:</span>
              {project.requirements.map(req => (
                <span key={req} className="px-3 py-1 rounded-lg text-xs font-bold bg-secondary text-foreground border border-border">
                  {req}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            About & Solution
          </button>

          <button
            onClick={() => setActiveTab('prototype')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'prototype' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Prototype Gallery ({project.prototypeMedia.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'feedback' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Star className="w-4 h-4 fill-current" />
            <span>Structured Feedback ({feedbackList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('needs')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'needs' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Needs & Funding</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_intel')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'ai_intel' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Match & Intel</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Problem */}
              <Card className="p-6 bg-card border-border rounded-2xl space-y-3">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Target className="w-5 h-5 text-rose-500" />
                  The Problem
                </h2>
                <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                  {project.problemStatement}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-muted-foreground">
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="font-semibold text-foreground block mb-1">Who experiences this?</span>
                    <span>{project.whoExperiences}</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="font-semibold text-foreground block mb-1">Existing workarounds</span>
                    <span>{project.currentSolutions}</span>
                  </div>
                </div>
              </Card>

              {/* Solution */}
              <Card className="p-6 bg-card border-border rounded-2xl space-y-3">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  The Solution & Differentiator
                </h2>
                <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                  {project.solutionStatement}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-muted-foreground">
                  <div className="p-3 bg-primary/5 border border-primary/15 rounded-xl">
                    <span className="font-semibold text-primary block mb-1">Key Differentiator</span>
                    <span className="text-foreground">{project.differentiator}</span>
                  </div>
                  <div className="p-3 bg-primary/5 border border-primary/15 rounded-xl">
                    <span className="font-semibold text-primary block mb-1">Unique Advantage</span>
                    <span className="text-foreground">{project.uniqueAdvantage}</span>
                  </div>
                </div>
              </Card>

              {/* Interactive Prototype links banner */}
              {project.prototypeLinks.length > 0 && (
                <Card className="p-6 bg-gradient-to-r from-primary/10 via-background to-background border-primary/20 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary" />
                        Live Prototype & Links
                      </h3>
                      <p className="text-xs text-muted-foreground">Test the interactive demo built by the founder.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {project.prototypeLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-md transition-transform hover:scale-105"
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
                    <Link href={`/profile/${project.founderUsername}`} className="font-bold text-base text-foreground hover:text-primary transition-colors">
                      {project.founderName}
                    </Link>
                    <p className="text-xs text-muted-foreground">@{project.founderUsername}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  Ex-engineer building tools for startups & founders worldwide.
                </p>
                <Link href={`/profile/${project.founderUsername}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl">
                    View Founder Profile
                  </Button>
                </Link>
              </Card>

              {/* Engagement Stats */}
              <Card className="p-6 bg-card border-border rounded-2xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ecosystem Activity</h3>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-lg font-black text-foreground block">{project.supportersCount}</span>
                    <span className="text-[10px] text-muted-foreground">Supporters</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-lg font-black text-foreground block">{project.viewsCount}</span>
                    <span className="text-[10px] text-muted-foreground">Project Views</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-lg font-black text-foreground block">{project.prototypeClicksCount}</span>
                    <span className="text-[10px] text-muted-foreground">Demo Clicks</span>
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
                <h2 className="text-xl font-bold">Prototype Screenshots & Media</h2>
                <p className="text-xs text-muted-foreground">Click any image to view in full resolution.</p>
              </div>
            </div>

            {project.prototypeMedia.length === 0 ? (
              <Card className="p-12 text-center border-dashed rounded-2xl">
                <p className="text-sm text-muted-foreground">No media uploaded yet for this prototype.</p>
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
                        <span>Click to Enlarge</span>
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

        {/* TAB 3: STRUCTURED FEEDBACK */}
        {activeTab === 'feedback' && (
          <div className="space-y-8">
            {/* Feedback Dashboard Summary */}
            {project.feedbackSummary && (
              <Card className="p-6 bg-card border-border rounded-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    Aggregated Community Ratings ({project.feedbackSummary.totalReviews} Reviews)
                  </h3>
                  <Button size="sm" onClick={() => setFeedbackModalOpen(true)} className="gap-2">
                    <Star className="w-4 h-4" />
                    <span>Give Your Feedback</span>
                  </Button>
                </div>

                {/* Ratings Progress Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Problem Clarity', score: project.feedbackSummary.avgProblemClarity },
                    { label: 'Solution Fit', score: project.feedbackSummary.avgSolution },
                    { label: 'Target Market', score: project.feedbackSummary.avgTargetMarket },
                    { label: 'Product & UX', score: project.feedbackSummary.avgProductUx },
                    { label: 'Business Potential', score: project.feedbackSummary.avgBusinessPotential },
                    { label: 'Differentiation', score: project.feedbackSummary.avgDifferentiation },
                  ].map(stat => (
                    <div key={stat.label} className="p-3.5 bg-muted/40 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>{stat.label}</span>
                        <span className="font-extrabold text-primary">{stat.score} / 10</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${(stat.score / 10) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Written Feedback List */}
            <div className="space-y-4">
              <h3 className="text-base font-bold">Community Feedback Log</h3>
              {feedbackList.length === 0 ? (
                <Card className="p-8 text-center border-dashed rounded-2xl">
                  <p className="text-sm text-muted-foreground">No structured feedback submitted yet. Be the first to evaluate this project!</p>
                  <Button size="sm" onClick={() => setFeedbackModalOpen(true)} className="mt-4 gap-2">
                    <Star className="w-4 h-4" />
                    <span>Give Feedback</span>
                  </Button>
                </Card>
              ) : (
                feedbackList.map((fb) => (
                  <Card key={fb.id} className="p-6 bg-card border-border rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={fb.userAvatar} alt={fb.userName} className="w-8 h-8 rounded-full object-cover border" />
                        <div>
                          <span className="font-bold text-sm text-foreground">{fb.userName}</span>
                          {fb.userBadge && (
                            <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {fb.userBadge}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                        <span className="font-bold text-primary block">Suggested Improvements</span>
                        <p className="text-foreground">{fb.writtenImprovement}</p>
                      </div>
                      <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                        <span className="font-bold text-amber-600 dark:text-amber-400 block">Concerns & Risks</span>
                        <p className="text-foreground">{fb.writtenConcerns}</p>
                      </div>
                      <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Why Use Product</span>
                        <p className="text-foreground">{fb.writtenUseReason}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: NEEDS & FUNDING */}
        {activeTab === 'needs' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Community Needs */}
            <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Community Requirements
              </h2>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {project.requirementDetails || 'The founder is seeking user feedback, testing, and potential co-founders to help take this startup forward.'}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {project.requirements.map(req => (
                  <span key={req} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    {req}
                  </span>
                ))}
              </div>

              <Button onClick={() => setCollabModalOpen(true)} className="w-full gap-2 font-bold mt-4">
                <Users className="w-4 h-4" />
                <span>Submit Collaboration Proposal</span>
              </Button>
            </Card>

            {/* Funding Info */}
            <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Investment & Traction
              </h2>

              {project.fundingInfo?.seekingInvestment ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">Seeking Investment</span>
                    <span className="font-extrabold text-sm text-foreground">{project.fundingInfo.amountSeeking} ({project.fundingInfo.stage})</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/40 rounded-xl">
                      <span className="font-bold text-foreground block">Equity Offered</span>
                      <span className="text-muted-foreground">{project.fundingInfo.equityOffered || 'N/A'}</span>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-xl">
                      <span className="font-bold text-foreground block">Current Traction</span>
                      <span className="text-muted-foreground">{project.fundingInfo.currentTraction || 'MVP Beta'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="font-bold text-foreground block mb-1">Use of Funds</span>
                    <span className="text-muted-foreground">{project.fundingInfo.useOfFunds}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">This project is currently bootstrapped or not actively raising investment rounds.</p>
              )}
            </Card>
          </div>
        )}

        {/* TAB 5: AI COMMUNITY MATCHING */}
        {activeTab === 'ai_intel' && (
          <div className="space-y-6">
            <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">AI Recommended Collaborators & Mentors</h2>
                  <p className="text-xs text-muted-foreground">Matched based on required skills, tech stack, and background.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {recommendedHelpers.map((helper) => (
                  <Card key={helper.id} className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={helper.avatar} alt={helper.name} className="w-10 h-10 rounded-full object-cover border" />
                      <div>
                        <p className="font-bold text-xs text-foreground">{helper.name}</p>
                        <p className="text-[10px] text-muted-foreground">{helper.verifiedType}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{helper.bio}</p>
                    <div className="flex flex-wrap gap-1">
                      {helper.skills.slice(0, 3).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded text-[9px] bg-background border font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Discussion & Comments Thread */}
        <Card id="discussion" className="p-6 sm:p-8 bg-card border-border rounded-2xl space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Startup Discussion ({project.commentsCount})
          </h3>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="space-y-3">
            <Textarea
              placeholder="Ask a question or share a thought on this project..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="text-sm rounded-xl"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" className="gap-2 font-bold rounded-xl">
                <span>Post Comment</span>
              </Button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4 pt-4 border-t border-border">
            {comments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No comments posted yet. Start the conversation!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="p-4 bg-muted/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <img src={c.userAvatar} alt={c.userName} className="w-6 h-6 rounded-full" />
                    <span className="font-bold text-xs text-foreground">{c.userName}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{new Date(c.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-foreground/90 pl-8">{c.content}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Lightbox Image Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={lightboxImage} alt="Prototype Lightbox" className="w-full h-full object-contain" />
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white bg-black/50 rounded-full">
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
