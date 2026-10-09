'use client';

import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Project, 
  ProjectStage, 
  RequirementBadge,
  FounderProfile 
} from '@/lib/community-types';
import { 
  getStoredProjects, 
  getStoredFounders,
  COMMUNITY_STAGES, 
  REQUIREMENT_OPTIONS,
  resetToDemoData
} from '@/lib/community-data';
import { CATEGORIES } from '@/lib/mock-data';
import { calculateProjectRelevance } from '@/lib/matching';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Plus, 
  Search, 
  Sparkles, 
  SlidersHorizontal,
  ExternalLink,
  Layers,
  Award,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Compass
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function CommunityHomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<FounderProfile | null>(null);
  const [supportedProjects, setSupportedProjects] = useState<string[]>([]);
  const [savedProjects, setSavedProjects] = useState<string[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedRequirement, setSelectedRequirement] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevant' | 'updated' | 'newest' | 'discussed' | 'supported' | 'prototype'>('relevant');
  const [feedTab, setFeedTab] = useState<'all' | 'recommended' | 'investment' | 'prototypes'>('all');
  
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const loadedProjects = getStoredProjects();
    setProjects(loadedProjects);

    const founders = getStoredFounders();
    if (user) {
      const myProfile = founders.find(f => f.id === user.id || f.username.toLowerCase() === user.email.split('@')[0].toLowerCase());
      setCurrentUserProfile(myProfile || null);

      const storedSupports = localStorage.getItem(`ideacheck_supported_${user.id}`);
      if (storedSupports) {
        try { setSupportedProjects(JSON.parse(storedSupports)); } catch (e) {}
      }
    }
  }, [user]);

  const handleSupport = (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    const hasSupported = supportedProjects.includes(projectId);
    let updated = [...supportedProjects];
    if (hasSupported) {
      updated = updated.filter(id => id !== projectId);
    } else {
      updated.push(projectId);
    }

    setSupportedProjects(updated);
    localStorage.setItem(`ideacheck_supported_${user.id}`, JSON.stringify(updated));

    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          supportersCount: p.supportersCount + (hasSupported ? -1 : 1),
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ideacheck_community_projects', JSON.stringify(updatedProjects));
    }
  };

  const handleResetDemoData = () => {
    resetToDemoData();
    setProjects(getStoredProjects());
  };

  // Filter & Sort Pipeline
  const filteredAndSortedProjects = useMemo(() => {
    return projects.filter(p => {
      if (p.visibility === 'private') return false;

      // Tab Filters
      if (feedTab === 'investment' && !p.fundingInfo?.seekingInvestment) return false;
      if (feedTab === 'prototypes' && (p.prototypeMedia?.length === 0 && p.prototypeLinks?.length === 0)) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchTagline = p.tagline.toLowerCase().includes(q);
        const matchFounder = p.founderName.toLowerCase().includes(q);
        const matchProblem = p.problemStatement.toLowerCase().includes(q);
        const matchCategory = p.category.toLowerCase().includes(q);
        const matchIndustry = p.industry?.toLowerCase().includes(q);
        if (!matchName && !matchTagline && !matchFounder && !matchProblem && !matchCategory && !matchIndustry) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

      // Stage filter
      if (selectedStage !== 'all' && p.stage !== selectedStage) return false;

      // Requirement filter
      if (selectedRequirement !== 'all' && !p.requirements?.includes(selectedRequirement as RequirementBadge)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'updated') return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      if (sortBy === 'discussed') return b.commentsCount - a.commentsCount;
      if (sortBy === 'supported') return b.supportersCount - a.supportersCount;
      if (sortBy === 'prototype') return (b.prototypeLinks?.length || 0) - (a.prototypeLinks?.length || 0);

      // Default: Relevant to Me / AI match
      const matchA = calculateProjectRelevance(a, currentUserProfile).score;
      const matchB = calculateProjectRelevance(b, currentUserProfile).score;
      return matchB - matchA;
    });
  }, [projects, feedTab, searchQuery, selectedCategory, selectedStage, selectedRequirement, sortBy, currentUserProfile]);

  const getStageColor = (stage: ProjectStage) => {
    switch (stage) {
      case 'Idea': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'Research': return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      case 'Prototype': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300';
      case 'MVP': return 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
      case 'Beta': return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
      case 'Launched': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
      case 'Growing': return 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
      default: return 'bg-secondary text-foreground';
    }
  };

  if (!isHydrated) {
    return <div className="min-h-screen flex items-center justify-center">Loading Startup Ecosystem...</div>;
  }

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-16">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/10 via-background to-background border-b border-border/40">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>The Evidence-Driven Startup Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]">
            Discover Ideas. Test Prototypes. <span className="text-primary">Build Validated Startups.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Where founders demonstrate what they can build, receive structured feedback, test demand in Validation Labs, and connect with collaborators and investors.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/submit">
              <Button size="lg" className="gap-2 text-sm sm:text-base font-bold shadow-lg shadow-primary/25 px-8 rounded-xl">
                <Plus className="w-5 h-5" />
                <span>Share Your Project</span>
              </Button>
            </Link>
            <Link href="/community/leaderboard">
              <Button variant="outline" size="lg" className="gap-2 text-sm sm:text-base font-semibold rounded-xl">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Ecosystem Leaderboard</span>
              </Button>
            </Link>
          </div>

          {/* Philosophy Lifecycle */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Discover</span>
            <span>→</span>
            <span className="text-primary font-bold">Evaluate</span>
            <span>→</span>
            <span>Connect</span>
            <span>→</span>
            <span className="text-emerald-400 font-bold">Test</span>
            <span>→</span>
            <span>Improve</span>
            <span>→</span>
            <span>Build</span>
            <span>→</span>
            <span className="text-primary font-bold">Grow</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Feed Selection Tabs */}
        <div className="flex items-center justify-between border-b border-border/80 pb-3 overflow-x-auto gap-4">
          <div className="flex items-center gap-2 min-w-max">
            <Button
              variant={feedTab === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFeedTab('all')}
              className="rounded-xl font-semibold text-xs"
            >
              All Projects
            </Button>
            <Button
              variant={feedTab === 'recommended' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => { setFeedTab('recommended'); setSortBy('relevant'); }}
              className="rounded-xl font-semibold text-xs gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Recommended For You</span>
            </Button>
            <Button
              variant={feedTab === 'investment' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFeedTab('investment')}
              className="rounded-xl font-semibold text-xs gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Investment Ready</span>
            </Button>
            <Button
              variant={feedTab === 'prototypes' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFeedTab('prototypes')}
              className="rounded-xl font-semibold text-xs gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Prototypes Available</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium shrink-0">
            <span>Showing {filteredAndSortedProjects.length} startups</span>
          </div>
        </div>

        {/* Search & Comprehensive Filters */}
        <div className="space-y-4 bg-card border border-border/80 rounded-2xl p-4 sm:p-6 shadow-sm">
          {/* Top Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search startups, taglines, technologies, or founder names (e.g. Next.js, AI, Biometrics, Sarah Chen)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-background text-xs sm:text-sm rounded-xl"
            />
          </div>

          {/* Filter Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Stage */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Project Stage</label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Stages</option>
                {COMMUNITY_STAGES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Requirement Badge */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Founder Needs</label>
              <select
                value={selectedRequirement}
                onChange={(e) => setSelectedRequirement(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Needs</option>
                {REQUIREMENT_OPTIONS.map(req => (
                  <option key={req} value={req}>{req}</option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs font-medium text-foreground focus:ring-1 focus:ring-primary"
              >
                <option value="relevant">Relevant to Me 🎯</option>
                <option value="updated">Recently Updated ⚡</option>
                <option value="newest">Newest First 📅</option>
                <option value="discussed">Most Discussed 💬</option>
                <option value="supported">Most Supported ❤️</option>
                <option value="prototype">Prototype Available 🚀</option>
              </select>
            </div>
          </div>
        </div>

        {/* Personalized Discovery Explanation Banner */}
        {feedTab === 'recommended' && (
          <div className="p-4 bg-primary/10 border border-primary/25 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0" />
              <p className="text-xs text-foreground leading-relaxed">
                <strong className="text-primary">Personalized Recommendations:</strong> Ranked by overlap between your technical skills, collaboration interests, and each founder's stated needs.
              </p>
            </div>
          </div>
        )}

        {/* Project Cards Feed */}
        {filteredAndSortedProjects.length === 0 ? (
          <Card className="p-12 text-center border-dashed rounded-2xl bg-card/50 space-y-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">No startup projects matched criteria</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                Try loosening your filters or search query. Or launch your own startup project!
              </p>
            </div>
            <Link href="/submit">
              <Button size="sm" className="gap-2 rounded-xl text-xs font-bold">
                <Plus className="w-4 h-4" />
                <span>Share Your Project</span>
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAndSortedProjects.map((project) => {
              const isSupported = supportedProjects.includes(project.id);
              const relevance = calculateProjectRelevance(project, currentUserProfile);

              return (
                <Card
                  key={project.id}
                  className="group relative bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl rounded-2xl overflow-hidden flex flex-col p-6 space-y-4"
                >
                  {/* Top Bar: Logo, Category, Stage, Validation Score */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {project.logoUrl ? (
                        <img
                          src={project.logoUrl}
                          alt={project.name}
                          className="w-12 h-12 rounded-xl object-cover border border-border shadow-sm group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-black text-xl flex items-center justify-center border border-primary/20">
                          {project.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <Link href={`/community/${project.id}`}>
                          <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                            {project.name}
                            {project.featured && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                Featured
                              </span>
                            )}
                          </h3>
                        </Link>
                        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{project.category}</span>
                          <span>•</span>
                          <span>{project.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStageColor(project.stage)}`}>
                        {project.stage}
                      </span>
                      {project.validationScore > 0 && (
                        <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {project.validationScore}/100 Score
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs sm:text-sm text-foreground/90 font-medium line-clamp-2 leading-relaxed">
                    {project.tagline}
                  </p>

                  {/* Transparent Recommendation Note if High Relevance */}
                  {relevance.score >= 50 && (
                    <div className="p-2.5 bg-primary/5 border border-primary/15 rounded-xl text-[11px] text-primary flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{relevance.explanation}</span>
                    </div>
                  )}

                  {/* Requirements Badges */}
                  {project.requirements && project.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.requirements.slice(0, 3).map((req) => (
                        <span
                          key={req}
                          className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-secondary text-secondary-foreground border border-border"
                        >
                          {req}
                        </span>
                      ))}
                      {project.requirements.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground">
                          +{project.requirements.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Prototype Indicator Banner */}
                  {(project.prototypeLinks?.length > 0 || project.prototypeMedia?.length > 0) && (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-semibold text-foreground">Working Prototype Available</span>
                      {project.prototypeLinks[0] && (
                        <span className="text-muted-foreground">({project.prototypeLinks[0].type})</span>
                      )}
                    </div>
                  )}

                  {/* Founder Profile Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto">
                    <Link href={`/profile/${project.founderUsername}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <img
                        src={project.founderAvatar}
                        alt={project.founderName}
                        className="w-6 h-6 rounded-full object-cover border border-border"
                      />
                      <div>
                        <p className="text-xs font-bold text-foreground leading-tight">{project.founderName}</p>
                        <p className="text-[10px] text-muted-foreground">@{project.founderUsername}</p>
                      </div>
                    </Link>

                    {project.fundingInfo?.seekingInvestment && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        Raising {project.fundingInfo.amountSeeking || 'Round'}
                      </span>
                    )}
                  </div>

                  {/* Bottom Stats & CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handleSupport(project.id, e)}
                        className={`flex items-center gap-1 transition-colors font-semibold ${
                          isSupported ? 'text-rose-500' : 'hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSupported ? 'fill-current' : ''}`} />
                        <span>{project.supportersCount}</span>
                      </button>

                      <Link href={`/community/${project.id}#discussion`} className="flex items-center gap-1 hover:text-foreground transition-colors font-medium">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{project.commentsCount}</span>
                      </Link>

                      <span className="flex items-center gap-1 text-muted-foreground/70">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{project.viewsCount}</span>
                      </span>
                    </div>

                    <Link href={`/community/${project.id}`}>
                      <Button size="sm" variant="secondary" className="gap-1 text-xs font-bold rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <span>View Project</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <MobileNav />
    </main>
  );
}
