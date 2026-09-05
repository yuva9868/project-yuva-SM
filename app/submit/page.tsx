'use client';

import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Project, 
  ProjectStage, 
  RequirementBadge,
  PrototypeLink,
  PrototypeMedia 
} from '@/lib/community-types';
import { 
  getStoredProjects, 
  saveStoredProjects,
  COMMUNITY_STAGES, 
  REQUIREMENT_OPTIONS 
} from '@/lib/community-data';
import { CATEGORIES } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  Plus, 
  Trash2, 
  Layers, 
  Target, 
  DollarSign, 
  Eye, 
  Link as LinkIcon,
  AlertCircle
} from 'lucide-react';

export default function SubmitProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Step 1: Basic Information
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0] || 'SaaS');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('San Francisco, CA');
  const [stage, setStage] = useState<ProjectStage>('MVP');

  // Step 2: The Problem
  const [problemStatement, setProblemStatement] = useState('');
  const [whoExperiences, setWhoExperiences] = useState('');
  const [currentSolutions, setCurrentSolutions] = useState('');

  // Step 3: The Solution
  const [solutionStatement, setSolutionStatement] = useState('');
  const [differentiator, setDifferentiator] = useState('');
  const [uniqueAdvantage, setUniqueAdvantage] = useState('');

  // Step 4: Prototype & Demos
  const [prototypeMedia, setPrototypeMedia] = useState<PrototypeMedia[]>([
    {
      id: 'm_1',
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      caption: 'Main Dashboard & Command Center Preview',
      type: 'image',
    }
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [prototypeLinks, setPrototypeLinks] = useState<PrototypeLink[]>([
    { label: 'Live Demo Link', url: 'https://demo.example.com', type: 'Vercel' }
  ]);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState<PrototypeLink['type']>('Vercel');

  // Step 5: What Do You Need?
  const [selectedRequirements, setSelectedRequirements] = useState<RequirementBadge[]>([
    'Looking for Feedback',
    'Looking for Early Users'
  ]);
  const [requirementDetails, setRequirementDetails] = useState('');

  // Step 6: Funding
  const [seekingInvestment, setSeekingInvestment] = useState(false);
  const [fundingStage, setFundingStage] = useState('Pre-Seed');
  const [amountSeeking, setAmountSeeking] = useState('$250,000');
  const [equityOffered, setEquityOffered] = useState('10%');
  const [useOfFunds, setUseOfFunds] = useState('');
  const [currentTraction, setCurrentTraction] = useState('');
  const [revenue, setRevenue] = useState('');
  const [usersCount, setUsersCount] = useState('');

  // Step 7: Visibility & Submission
  const [visibility, setVisibility] = useState<'public' | 'community' | 'private'>('public');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollToWizardTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handleNextStep = () => {
    setValidationError(null);

    if (currentStep === 1) {
      if (!name.trim()) {
        setValidationError('Please provide a startup project name.');
        return;
      }
      if (!tagline.trim()) {
        setValidationError('Please provide a short tagline describing your startup.');
        return;
      }
    } else if (currentStep === 2) {
      if (!problemStatement.trim()) {
        setValidationError('Please explain the problem your startup solves.');
        return;
      }
    } else if (currentStep === 3) {
      if (!solutionStatement.trim()) {
        setValidationError('Please describe your product solution.');
        return;
      }
    } else if (currentStep === 5) {
      if (selectedRequirements.length === 0) {
        setValidationError('Please select at least one requirement badge (e.g. Looking for Feedback).');
        return;
      }
    }

    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
      scrollToWizardTop();
    }
  };

  const handlePrevStep = () => {
    setValidationError(null);
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      scrollToWizardTop();
    }
  };

  const handleJumpToStep = (targetStep: number) => {
    if (targetStep < currentStep) {
      setValidationError(null);
      setCurrentStep(targetStep);
      scrollToWizardTop();
    } else {
      handleNextStep();
    }
  };

  const toggleRequirement = (req: RequirementBadge) => {
    if (selectedRequirements.includes(req)) {
      setSelectedRequirements(selectedRequirements.filter(r => r !== req));
    } else {
      setSelectedRequirements([...selectedRequirements, req]);
    }
  };

  const handleAddMedia = () => {
    if (!customImageUrl.trim()) return;
    setPrototypeMedia([
      ...prototypeMedia,
      {
        id: 'm_' + Date.now(),
        url: customImageUrl.trim(),
        caption: 'Uploaded Prototype Screenshot',
        type: 'image',
      }
    ]);
    setCustomImageUrl('');
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    setPrototypeLinks([
      ...prototypeLinks,
      {
        label: newLinkLabel.trim() || 'Demo Link',
        url: newLinkUrl.trim(),
        type: newLinkType,
      }
    ]);
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      setValidationError('Please accept the community guideline terms before publishing.');
      return;
    }

    setIsSubmitting(true);

    const newProjId = 'proj_' + Date.now();
    const newProject: Project = {
      id: newProjId,
      name: name.trim() || 'My New Startup',
      tagline: tagline.trim() || 'A game-changing product for the market',
      category,
      industry: industry.trim() || category,
      location,
      stage,

      founderId: user?.id || 'user_founder',
      founderName: user?.name || 'Anonymous Founder',
      founderUsername: user?.name ? user.name.toLowerCase().replace(/\s+/g, '') : 'founder',
      founderAvatar: user?.avatar || 'https://avatar.vercel.sh/founder?s=96',
      founderBadges: ['Verified Founder'],

      problemStatement: problemStatement.trim() || 'Identified a key pain point in current workflow.',
      whoExperiences: whoExperiences.trim() || 'Early adopters and professionals.',
      currentSolutions: currentSolutions.trim() || 'Manual workarounds.',

      solutionStatement: solutionStatement.trim() || 'Building an automated solution.',
      differentiator: differentiator.trim() || 'Unique technological approach.',
      uniqueAdvantage: uniqueAdvantage.trim() || 'First-mover advantage in niche market.',

      logoUrl: prototypeMedia[0]?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
      prototypeMedia,
      prototypeLinks,

      requirements: selectedRequirements,
      requirementDetails: requirementDetails.trim() || 'Seeking feedback and community support.',

      fundingInfo: {
        seekingInvestment,
        stage: seekingInvestment ? fundingStage : undefined,
        amountSeeking: seekingInvestment ? amountSeeking : undefined,
        equityOffered: seekingInvestment ? equityOffered : undefined,
        useOfFunds: seekingInvestment ? useOfFunds : undefined,
        currentTraction: seekingInvestment ? currentTraction : undefined,
        revenue: seekingInvestment ? revenue : undefined,
        users: seekingInvestment ? usersCount : undefined,
      },

      visibility,
      validationScore: 88,
      supportersCount: 1,
      commentsCount: 0,
      viewsCount: 10,
      uniqueViewersCount: 8,
      prototypeClicksCount: 2,
      externalClicksCount: 1,
      savedCount: 0,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      const currentProjects = getStoredProjects();
      saveStoredProjects([newProject, ...currentProjects]);
      setIsSubmitting(false);
      router.push(`/community/${newProjId}`);
    }, 600);
  };

  const stepsList = [
    { num: 1, title: 'Basic Info' },
    { num: 2, title: 'The Problem' },
    { num: 3, title: 'The Solution' },
    { num: 4, title: 'Prototype' },
    { num: 5, title: 'Needs' },
    { num: 6, title: 'Funding' },
    { num: 7, title: 'Publish' },
  ];

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-16">
      <Header />

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Step-by-Step Startup Submission</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground">Share Your Startup Project</h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Present your startup to serious founders, developers, designers, mentors, and investors.
          </p>
        </div>

        {/* Wizard Progress Bar */}
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2 min-w-max">
            {stepsList.map((st) => {
              const isCurrent = currentStep === st.num;
              const isDone = currentStep > st.num;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => handleJumpToStep(st.num)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                      : isDone
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isDone ? 'bg-primary text-primary-foreground' : 'border border-current'
                  }`}>
                    {isDone ? <Check className="w-3 h-3" /> : st.num}
                  </span>
                  <span>{st.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation Warning Alert */}
        {validationError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Main Step Form Card */}
        <Card className="p-6 sm:p-8 bg-card border-border rounded-2xl shadow-lg">
          <form onSubmit={handleSubmitProject} className="space-y-6">
            {/* STEP 1: BASIC INFO */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-bold text-foreground">Step 1 — Basic Project Information</h2>
                  <p className="text-xs text-muted-foreground">What is the startup name and stage?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold">Project Name *</Label>
                    <Input
                      placeholder="e.g. FlowSmith AI"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setValidationError(null); }}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Short Tagline *</Label>
                    <Input
                      placeholder="e.g. Autonomous AI workflow builder that generates production backend APIs"
                      value={tagline}
                      onChange={(e) => { setTagline(e.target.value); setValidationError(null); }}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold">Category</Label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-10 px-3 mt-1 rounded-md border border-input bg-background text-sm text-foreground"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold">Industry / Niche</Label>
                      <Input
                        placeholder="e.g. Developer Tools & Automation"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold">Location</Label>
                      <Input
                        placeholder="e.g. San Francisco, CA or Remote"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold">Project Stage *</Label>
                      <select
                        value={stage}
                        onChange={(e) => setStage(e.target.value as ProjectStage)}
                        className="w-full h-10 px-3 mt-1 rounded-md border border-input bg-background text-sm text-foreground font-semibold"
                      >
                        {COMMUNITY_STAGES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: THE PROBLEM */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-bold text-foreground">Step 2 — The Problem</h2>
                  <p className="text-xs text-muted-foreground">What painful issue are you solving?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold">What problem are you solving? *</Label>
                    <Textarea
                      placeholder="Describe the core friction, inefficiency, or pain point users face daily..."
                      value={problemStatement}
                      onChange={(e) => { setProblemStatement(e.target.value); setValidationError(null); }}
                      rows={3}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Who experiences this problem?</Label>
                    <Input
                      placeholder="e.g. Backend developers, technical CTOs, SMB owners..."
                      value={whoExperiences}
                      onChange={(e) => setWhoExperiences(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">How are people solving this problem today?</Label>
                    <Textarea
                      placeholder="e.g. Manual spreadsheets, hiring expensive agencies, or using outdated tools..."
                      value={currentSolutions}
                      onChange={(e) => setCurrentSolutions(e.target.value)}
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: THE SOLUTION */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-bold text-foreground">Step 3 — The Solution</h2>
                  <p className="text-xs text-muted-foreground">What is your unique product approach?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold">What is your solution? *</Label>
                    <Textarea
                      placeholder="Explain what your product does and how it solves the problem..."
                      value={solutionStatement}
                      onChange={(e) => { setSolutionStatement(e.target.value); setValidationError(null); }}
                      rows={3}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">What makes your solution different?</Label>
                    <Input
                      placeholder="e.g. 10x faster execution, 100% open source, zero code lock-in..."
                      value={differentiator}
                      onChange={(e) => setDifferentiator(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">What is your unique advantage?</Label>
                    <Input
                      placeholder="e.g. Proprietary AI model fine-tuning, domain expertise, patents..."
                      value={uniqueAdvantage}
                      onChange={(e) => setUniqueAdvantage(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: PROTOTYPE & DEMOS */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-bold text-foreground">Step 4 — Prototype & Screenshots</h2>
                  <p className="text-xs text-muted-foreground">Show what you have actually built (Building &gt; Posting).</p>
                </div>

                {/* Upload Simulator */}
                <div className="space-y-4">
                  <Label className="text-xs font-semibold">Add Screenshot Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste image URL (Unsplash, Imgur, Vercel Blob...)"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddMedia} className="gap-2 shrink-0 font-bold">
                      <Upload className="w-4 h-4" />
                      <span>Add Image</span>
                    </Button>
                  </div>

                  {/* Media Preview Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {prototypeMedia.map((m) => (
                      <div key={m.id} className="relative group rounded-xl overflow-hidden border border-border bg-muted aspect-video">
                        <img src={m.url} alt={m.caption} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPrototypeMedia(prototypeMedia.filter(item => item.id !== m.id))}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <hr className="border-border/60" />

                  {/* External Prototype Demo Links */}
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold">Add Interactive Demo Links</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        placeholder="Link Label (e.g. Vercel Demo)"
                        value={newLinkLabel}
                        onChange={(e) => setNewLinkLabel(e.target.value)}
                      />
                      <Input
                        placeholder="https://..."
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <select
                          value={newLinkType}
                          onChange={(e) => setNewLinkType(e.target.value as any)}
                          className="h-10 px-2 rounded-md border text-xs bg-background"
                        >
                          <option value="Vercel">Vercel</option>
                          <option value="GitHub">GitHub</option>
                          <option value="Figma">Figma</option>
                          <option value="Website">Website</option>
                          <option value="YouTube">YouTube</option>
                          <option value="App Store">App Store</option>
                        </select>
                        <Button type="button" onClick={handleAddLink} size="sm" className="shrink-0">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {prototypeLinks.map((l, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-lg text-xs font-semibold bg-secondary text-foreground border border-border flex items-center gap-2">
                          <LinkIcon className="w-3 h-3 text-primary" />
                          <span>{l.label} ({l.type})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: WHAT DO YOU NEED? */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-bold text-foreground">Step 5 — What Do You Need From Community?</h2>
                  <p className="text-xs text-muted-foreground">Select all that apply to help matched members discover you.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {REQUIREMENT_OPTIONS.map((req) => {
                    const isChecked = selectedRequirements.includes(req);
                    return (
                      <div
                        key={req}
                        onClick={() => { toggleRequirement(req); setValidationError(null); }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 select-none ${
                          isChecked
                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                            : 'border-border bg-card text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <Checkbox checked={isChecked} className="pointer-events-none" />
                        <span className="text-xs font-semibold">{req}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-semibold">Tell the community exactly what you need</Label>
                  <Textarea
                    placeholder="e.g. I have built the first MVP version and need feedback from engineers who handle large API payloads. I am also looking for a Product Marketing co-founder..."
                    value={requirementDetails}
                    onChange={(e) => setRequirementDetails(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* STEP 6: FUNDING */}
            {currentStep === 6 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-bold text-foreground">Step 6 — Investment & Funding Details</h2>
                  <p className="text-xs text-muted-foreground">Are you seeking funding from investors?</p>
                </div>

                <div className="space-y-4">
                  <div 
                    onClick={() => setSeekingInvestment(!seekingInvestment)}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all select-none ${
                      seekingInvestment ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-muted/30 border-border text-foreground'
                    }`}
                  >
                    <Checkbox
                      id="seeking"
                      checked={seekingInvestment}
                      className="pointer-events-none"
                    />
                    <Label htmlFor="seeking" className="text-sm font-bold cursor-pointer pointer-events-none">
                      Yes, our startup is actively seeking investment / fundraising
                    </Label>
                  </div>

                  {seekingInvestment && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs font-semibold">Funding Stage</Label>
                          <select
                            value={fundingStage}
                            onChange={(e) => setFundingStage(e.target.value)}
                            className="w-full h-10 px-3 mt-1 rounded-md border text-xs bg-background"
                          >
                            <option value="Pre-Seed">Pre-Seed</option>
                            <option value="Seed">Seed</option>
                            <option value="Series A">Series A</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">Amount Seeking</Label>
                          <Input
                            placeholder="$250,000"
                            value={amountSeeking}
                            onChange={(e) => setAmountSeeking(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">Equity Offered (Optional)</Label>
                          <Input
                            placeholder="10%"
                            value={equityOffered}
                            onChange={(e) => setEquityOffered(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold">Use of Funds</Label>
                        <Textarea
                          placeholder="e.g. 70% Core AI engineering & GPU servers, 30% User acquisition..."
                          value={useOfFunds}
                          onChange={(e) => setUseOfFunds(e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 7: VISIBILITY & PUBLISH */}
            {currentStep === 7 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-bold text-foreground">Step 7 — Visibility & Final Review</h2>
                  <p className="text-xs text-muted-foreground">Set project privacy and publish to the ecosystem.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Visibility Settings</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'public', label: 'Public Ecosystem', desc: 'Visible to all community members & web' },
                        { key: 'community', label: 'Members Only', desc: 'Visible only to signed-in founders' },
                        { key: 'private', label: 'Private Workspace', desc: 'Draft viewable only by you' },
                      ].map((item) => (
                        <div
                          key={item.key}
                          onClick={() => setVisibility(item.key as any)}
                          className={`p-3 rounded-xl border cursor-pointer text-xs space-y-1 transition-all select-none ${
                            visibility === item.key
                              ? 'border-primary bg-primary/10 text-primary font-bold'
                              : 'border-border bg-card text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          <span className="block font-bold">{item.label}</span>
                          <span className="text-[10px] font-normal leading-tight block">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div 
                    onClick={() => { setAgreedTerms(!agreedTerms); setValidationError(null); }}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all select-none ${
                      agreedTerms ? 'bg-primary/10 border-primary' : 'bg-primary/5 border-primary/20'
                    }`}
                  >
                    <Checkbox
                      id="terms"
                      checked={agreedTerms}
                      className="mt-0.5 pointer-events-none"
                    />
                    <Label htmlFor="terms" className="text-xs text-foreground cursor-pointer leading-relaxed pointer-events-none">
                      I confirm that this is a real startup project/prototype and agree to receive constructive feedback and collaboration requests from verified community members.
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  className="gap-2 font-bold rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 7 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="gap-2 font-bold shadow-md shadow-primary/20 rounded-xl px-6"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !agreedTerms}
                  className="gap-2 font-bold shadow-lg shadow-primary/30 px-8 rounded-xl"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Publishing Startup...' : 'Publish to Ecosystem'}</span>
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>

      <MobileNav />
    </main>
  );
}
