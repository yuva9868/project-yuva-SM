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
  PrototypeMedia,
  ValidationMetricItem 
} from '@/lib/community-types';
import { 
  getStoredProjects, 
  saveStoredProjects, 
  COMMUNITY_STAGES, 
  REQUIREMENT_OPTIONS 
} from '@/lib/community-data';
import { CATEGORIES } from '@/lib/mock-data';
import { validateImageFile, readFileAsDataUrl } from '@/lib/storage';
import { trackEvent } from '@/lib/analytics';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  AlertCircle,
  ShieldCheck,
  FileText,
  Lock,
  Globe,
  Save
} from 'lucide-react';

export default function SubmitProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);

  // Step 1: Project Identity
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0] || 'SaaS');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('San Francisco, CA');
  const [stage, setStage] = useState<ProjectStage>('MVP');

  // Step 2: Problem & Solution
  const [problemStatement, setProblemStatement] = useState('');
  const [whoExperiences, setWhoExperiences] = useState('');
  const [currentSolutions, setCurrentSolutions] = useState('');
  const [solutionStatement, setSolutionStatement] = useState('');
  const [differentiator, setDifferentiator] = useState('');
  const [uniqueAdvantage, setUniqueAdvantage] = useState('');
  const [targetUsers, setTargetUsers] = useState('');

  // Step 3: Prototype & Evidence
  const [prototypeMedia, setPrototypeMedia] = useState<PrototypeMedia[]>([
    {
      id: 'm_init',
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      caption: 'Main Dashboard Interface Preview',
      type: 'image',
    }
  ]);
  const [builtDescription, setBuiltDescription] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [prototypeLinks, setPrototypeLinks] = useState<PrototypeLink[]>([
    { label: 'Interactive Sandbox / Demo', url: 'https://demo.example.com', type: 'Vercel' }
  ]);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState<PrototypeLink['type']>('Vercel');

  // Step 4: What the Founder Needs
  const [selectedRequirements, setSelectedRequirements] = useState<RequirementBadge[]>([
    'Looking for Feedback',
    'Looking for Early Users'
  ]);
  const [requirementDetails, setRequirementDetails] = useState('');

  // Step 5: Validation Evidence
  const [metricsList, setMetricsList] = useState<ValidationMetricItem[]>([
    { label: 'Customer Discovery Interviews', value: '12 completed interviews', isEvidenceSupported: true },
    { label: 'Prototype Testers', value: '25 weekly active testers', isEvidenceSupported: true }
  ]);
  const [newMetricLabel, setNewMetricLabel] = useState('');
  const [newMetricValue, setNewMetricValue] = useState('');
  const [newMetricVerified, setNewMetricVerified] = useState(false);

  // Step 6: Funding
  const [investmentStatus, setInvestmentStatus] = useState<'not_seeking' | 'considering_later' | 'actively_seeking'>('actively_seeking');
  const [fundingStage, setFundingStage] = useState('Pre-Seed');
  const [amountSeeking, setAmountSeeking] = useState('$250,000');
  const [equityOffered, setEquityOffered] = useState('10%');
  const [useOfFunds, setUseOfFunds] = useState('');
  const [businessModel, setBusinessModel] = useState('');
  const [pitchDeckUrl, setPitchDeckUrl] = useState('');

  // Step 7: Visibility & Publishing
  const [visibility, setVisibility] = useState<'public' | 'community' | 'private'>('public');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load draft on mount if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ideacheck_project_draft');
      if (saved) {
        try {
          const d = JSON.parse(saved);
          if (d.name) setName(d.name);
          if (d.tagline) setTagline(d.tagline);
          if (d.problemStatement) setProblemStatement(d.problemStatement);
          if (d.solutionStatement) setSolutionStatement(d.solutionStatement);
        } catch (e) {}
      }
    }
  }, []);

  const saveDraft = () => {
    if (typeof window === 'undefined') return;
    const draft = {
      name, tagline, category, industry, location, stage,
      problemStatement, whoExperiences, currentSolutions, solutionStatement,
      differentiator, uniqueAdvantage, targetUsers, builtDescription
    };
    localStorage.setItem('ideacheck_project_draft', JSON.stringify(draft));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2500);
  };

  const scrollToWizardTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  const handleNextStep = () => {
    setValidationError(null);

    if (currentStep === 1) {
      if (!name.trim()) { setValidationError('Please provide a startup project name.'); return; }
      if (!tagline.trim()) { setValidationError('Please provide a short tagline describing your startup.'); return; }
    } else if (currentStep === 2) {
      if (!problemStatement.trim()) { setValidationError('Please explain the problem your startup solves.'); return; }
      if (!solutionStatement.trim()) { setValidationError('Please describe your proposed solution.'); return; }
    } else if (currentStep === 4) {
      if (selectedRequirements.length === 0) {
        setValidationError('Please select at least one requirement badge.');
        return;
      }
      if (!requirementDetails.trim()) {
        setValidationError('Please describe specifically what you would like the community to help you with.');
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || 'Invalid file format or size exceeds 5MB.');
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        setPrototypeMedia(prev => [
          ...prev,
          {
            id: 'm_' + Math.random().toString(36).substring(2, 9),
            url: dataUrl,
            caption: file.name.replace(/\.[^/.]+$/, ''),
            type: 'image'
          }
        ]);
      } catch (err) {
        setUploadError('Failed to read and process image file.');
      }
    }
  };

  const handleRemoveMedia = (id: string) => {
    setPrototypeMedia(prev => prev.filter(m => m.id !== id));
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

  const handleAddMetric = () => {
    if (!newMetricLabel.trim() || !newMetricValue.trim()) return;
    setMetricsList([
      ...metricsList,
      {
        label: newMetricLabel.trim(),
        value: newMetricValue.trim(),
        isEvidenceSupported: newMetricVerified
      }
    ]);
    setNewMetricLabel('');
    setNewMetricValue('');
  };

  const toggleRequirement = (req: RequirementBadge) => {
    if (selectedRequirements.includes(req)) {
      setSelectedRequirements(selectedRequirements.filter(r => r !== req));
    } else {
      setSelectedRequirements([...selectedRequirements, req]);
    }
  };

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      setValidationError('Please accept the community guidelines before publishing.');
      return;
    }

    setIsSubmitting(true);
    const newProjId = 'proj_' + Date.now();

    const newProject: Project = {
      id: newProjId,
      name: name.trim() || 'My New Startup',
      tagline: tagline.trim() || 'A validated startup built on IdeaCheck AI',
      category,
      industry: industry.trim() || category,
      location,
      stage,

      founderId: user?.id || 'user_founder',
      founderName: user?.name || 'Anonymous Founder',
      founderUsername: user?.name ? user.name.toLowerCase().replace(/\s+/g, '') : 'founder',
      founderAvatar: user?.avatar || 'https://avatar.vercel.sh/founder?s=96',
      founderBadges: ['Builder'],

      problemStatement: problemStatement.trim() || 'Identified an urgent market problem.',
      whoExperiences: whoExperiences.trim() || 'Early adopters and target customers.',
      currentSolutions: currentSolutions.trim() || 'Manual workarounds and fragmented tools.',

      solutionStatement: solutionStatement.trim() || 'Building an evidence-validated product.',
      differentiator: differentiator.trim() || 'Key competitive differentiation.',
      uniqueAdvantage: uniqueAdvantage.trim() || 'Proprietary insight or execution speed.',
      targetUsers: targetUsers.trim() || 'Domain specialists and early adopters.',

      logoUrl: prototypeMedia[0]?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
      prototypeMedia,
      prototypeLinks,
      builtDescription: builtDescription.trim() || 'Early interactive prototype.',

      requirements: selectedRequirements,
      requirementDetails: requirementDetails.trim() || 'Looking for customer feedback and beta testers.',

      validationMetrics: metricsList,

      fundingInfo: {
        seekingInvestment: investmentStatus === 'actively_seeking',
        stage: investmentStatus === 'actively_seeking' ? fundingStage : undefined,
        amountSeeking: investmentStatus === 'actively_seeking' ? amountSeeking : undefined,
        equityOffered: investmentStatus === 'actively_seeking' ? equityOffered : undefined,
        useOfFunds: investmentStatus === 'actively_seeking' ? useOfFunds : undefined,
        businessModel: businessModel.trim() || undefined,
        pitchDeckUrl: pitchDeckUrl.trim() || undefined,
      },

      visibility,
      validationScore: 85,
      supportersCount: 1,
      commentsCount: 0,
      viewsCount: 1,
      uniqueViewersCount: 1,
      prototypeClicksCount: 0,
      externalClicksCount: 0,
      savedCount: 0,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featured: false,
    };

    const currentProjects = getStoredProjects();
    saveStoredProjects([newProject, ...currentProjects]);

    trackEvent('project_published', { projectId: newProjId, name: newProject.name }, user?.id, newProjId);

    // Clear draft
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ideacheck_project_draft');
    }

    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/community/${newProjId}`);
    }, 400);
  };

  const steps = [
    { num: 1, label: 'Identity' },
    { num: 2, label: 'Problem & Solution' },
    { num: 3, label: 'Prototype' },
    { num: 4, label: 'Needs' },
    { num: 5, label: 'Evidence' },
    { num: 6, label: 'Funding' },
    { num: 7, label: 'Publish' }
  ];

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-16">
      <Header />

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        {/* Wizard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                Guided Creator Studio
              </span>
              {draftSaved && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Draft Saved
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground pt-1">Share Your Startup Project</h1>
            <p className="text-xs text-muted-foreground">7-step evidence-driven workflow to attract testers, collaborators, and investors.</p>
          </div>

          <Button variant="outline" size="sm" onClick={saveDraft} className="gap-1.5 rounded-xl text-xs font-semibold shrink-0">
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </Button>
        </div>

        {/* Multi-Step Stepper Bar */}
        <div className="grid grid-cols-7 gap-1.5 p-1.5 bg-muted/30 border border-border rounded-2xl overflow-x-auto">
          {steps.map(s => (
            <button
              key={s.num}
              type="button"
              onClick={() => { if (s.num < currentStep) setCurrentStep(s.num); }}
              className={`py-2 px-1 text-center rounded-xl transition-all ${
                currentStep === s.num
                  ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                  : currentStep > s.num
                  ? 'bg-secondary text-foreground font-semibold'
                  : 'text-muted-foreground'
              }`}
            >
              <span className="text-[10px] block font-extrabold uppercase">Step {s.num}</span>
              <span className="text-[11px] truncate block">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* STEP 1: IDENTITY */}
        {currentStep === 1 && (
          <Card className="p-6 sm:p-8 bg-card border-border rounded-2xl space-y-5">
            <h3 className="text-base font-bold text-foreground">Step 1: Project Identity</h3>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Startup / Project Name *</Label>
              <Input placeholder="e.g. FlowSmith AI" value={name} onChange={e => setName(e.target.value)} required className="rounded-xl text-xs" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">One-Line Tagline *</Label>
              <Input placeholder="e.g. Autonomous AI workflow builder that turns natural language into production backend APIs" value={tagline} onChange={e => setTagline(e.target.value)} required className="rounded-xl text-xs" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Primary Category</Label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2.5 bg-input border border-border rounded-xl text-xs text-foreground">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Industry Niche</Label>
                <Input placeholder="e.g. Developer Tools & Cloud Automation" value={industry} onChange={e => setIndustry(e.target.value)} className="rounded-xl text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Current Project Stage</Label>
                <select value={stage} onChange={e => setStage(e.target.value as any)} className="w-full p-2.5 bg-input border border-border rounded-xl text-xs text-foreground">
                  {COMMUNITY_STAGES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Location (Optional)</Label>
                <Input placeholder="e.g. San Francisco, CA or Remote" value={location} onChange={e => setLocation(e.target.value)} className="rounded-xl text-xs" />
              </div>
            </div>
          </Card>
        )}

        {/* STEP 2: PROBLEM & SOLUTION */}
        {currentStep === 2 && (
          <Card className="p-6 sm:p-8 bg-card border-border rounded-2xl space-y-5">
            <h3 className="text-base font-bold text-foreground">Step 2: Problem & Proposed Solution</h3>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Problem Statement *</Label>
              <Textarea placeholder="What critical bottleneck or friction are people suffering from?" value={problemStatement} onChange={e => setProblemStatement(e.target.value)} rows={3} required className="rounded-xl text-xs" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Who Experiences This Problem?</Label>
                <Input placeholder="e.g. Backend developers, startup CTOs" value={whoExperiences} onChange={e => setWhoExperiences(e.target.value)} className="rounded-xl text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Existing Alternatives / Workarounds</Label>
                <Input placeholder="e.g. Manual Express coding or Zapier" value={currentSolutions} onChange={e => setCurrentSolutions(e.target.value)} className="rounded-xl text-xs" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Proposed Solution Statement *</Label>
              <Textarea placeholder="How does your product solve this problem differently?" value={solutionStatement} onChange={e => setSolutionStatement(e.target.value)} rows={3} required className="rounded-xl text-xs" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Key Differentiator</Label>
                <Input placeholder="e.g. Clean Git-versioned TypeScript code vs proprietary lock-in" value={differentiator} onChange={e => setDifferentiator(e.target.value)} className="rounded-xl text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target Users</Label>
                <Input placeholder="e.g. Full-stack engineers and software agencies" value={targetUsers} onChange={e => setTargetUsers(e.target.value)} className="rounded-xl text-xs" />
              </div>
            </div>
          </Card>
        )}

        {/* STEP 3: PROTOTYPE & EVIDENCE */}
        {currentStep === 3 && (
          <Card className="p-6 sm:p-8 bg-card border-border rounded-2xl space-y-6">
            <h3 className="text-base font-bold text-foreground">Step 3: Prototype, Media & Working Links</h3>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">What Has Actually Been Built?</Label>
              <Textarea placeholder="Describe the current build: e.g. Working Next.js web sandbox generating valid OpenAPI 3.1 specs in 3 seconds..." value={builtDescription} onChange={e => setBuiltDescription(e.target.value)} rows={2} className="rounded-xl text-xs" />
            </div>

            {/* Media Upload Area */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold">Upload Prototype Screenshots (Max 5MB per image)</Label>
              
              <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-6 text-center transition-colors">
                <Upload className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-xs font-semibold text-foreground">Drag and drop screenshots, or browse local files</p>
                <p className="text-[11px] text-muted-foreground mt-1">Supports PNG, JPG, WebP, SVG</p>
                <label className="mt-3 inline-block">
                  <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                  <span className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground cursor-pointer shadow-md">
                    Choose Screenshot Files
                  </span>
                </label>
              </div>

              {uploadError && (
                <p className="text-xs text-rose-400 font-semibold">{uploadError}</p>
              )}

              {/* Uploaded media previews */}
              {prototypeMedia.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {prototypeMedia.map(m => (
                    <div key={m.id} className="relative group rounded-xl overflow-hidden border border-border bg-muted/20">
                      <img src={m.url} alt={m.caption} className="w-full h-24 object-cover" />
                      <div className="p-2 text-[10px] text-foreground truncate">{m.caption}</div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveMedia(m.id)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-rose-400 hover:text-white"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Links */}
            <div className="space-y-3 pt-3 border-t border-border">
              <Label className="text-xs font-semibold">Interactive Prototype & Repository Links</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input placeholder="Label (e.g. Live Demo)" value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)} className="rounded-xl text-xs sm:w-1/3" />
                <Input placeholder="https://..." value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} className="rounded-xl text-xs sm:flex-1" />
                <select value={newLinkType} onChange={e => setNewLinkType(e.target.value as any)} className="p-2 bg-input border border-border rounded-xl text-xs text-foreground">
                  <option value="Vercel">Vercel</option>
                  <option value="GitHub">GitHub</option>
                  <option value="Figma">Figma</option>
                  <option value="Website">Website</option>
                  <option value="YouTube">YouTube</option>
                </select>
                <Button type="button" onClick={handleAddLink} size="sm" className="rounded-xl font-bold text-xs shrink-0">
                  <Plus className="w-3.5 h-3.5" /> Add Link
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {prototypeLinks.map((l, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-secondary text-xs font-semibold flex items-center gap-1.5">
                    <span>{l.label} ({l.type})</span>
                    <button type="button" onClick={() => setPrototypeLinks(prototypeLinks.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-rose-400">×</button>
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* STEP 4: WHAT THE FOUNDER NEEDS */}
        {currentStep === 4 && (
          <Card className="p-6 sm:p-8 bg-card border-border rounded-2xl space-y-5">
            <h3 className="text-base font-bold text-foreground">Step 4: What You Need from the Ecosystem</h3>
            
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select all that apply:</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {REQUIREMENT_OPTIONS.map(req => (
                  <button
                    key={req}
                    type="button"
                    onClick={() => toggleRequirement(req)}
                    className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                      selectedRequirements.includes(req)
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                        : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {req}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="text-xs font-semibold">What specifically would you like people to help you with? *</Label>
              <Textarea 
                placeholder="e.g. I have built an MVP and need 15 developers who experience this problem to test the code generator and share honest feedback. Also seeking a Go-To-Market co-founder..." 
                value={requirementDetails} 
                onChange={e => setRequirementDetails(e.target.value)} 
                rows={4} 
                required 
                className="rounded-xl text-xs" 
              />
            </div>
          </Card>
        )}

        {/* STEP 5: VALIDATION EVIDENCE */}
        {currentStep === 5 && (
          <Card className="p-6 sm:p-8 bg-card border-border rounded-2xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-foreground">Step 5: Validation Evidence & Traction Metrics</h3>
              <p className="text-xs text-muted-foreground">Optional, but builds immense credibility with investors and collaborators.</p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input placeholder="Metric (e.g. Waitlist Signups)" value={newMetricLabel} onChange={e => setNewMetricLabel(e.target.value)} className="rounded-xl text-xs sm:w-1/3" />
                <Input placeholder="Value (e.g. 140 developers)" value={newMetricValue} onChange={e => setNewMetricValue(e.target.value)} className="rounded-xl text-xs sm:flex-1" />
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer shrink-0 px-2">
                  <input type="checkbox" checked={newMetricVerified} onChange={e => setNewMetricVerified(e.target.checked)} className="accent-primary" />
                  <span>Evidence Verified</span>
                </label>
                <Button type="button" onClick={handleAddMetric} size="sm" className="rounded-xl font-bold text-xs shrink-0">
                  <Plus className="w-3.5 h-3.5" /> Add Metric
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5 pt-2">
                {metricsList.map((m, idx) => (
                  <div key={idx} className="p-3 bg-muted/30 border border-border/60 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-foreground block">{m.label}: {m.value}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {m.isEvidenceSupported ? '✓ Evidence-supported' : 'Self-reported'}
                      </span>
                    </div>
                    <button type="button" onClick={() => setMetricsList(metricsList.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-rose-400">×</button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* STEP 6: FUNDING */}
        {currentStep === 6 && (
          <Card className="p-6 sm:p-8 bg-card border-border rounded-2xl space-y-5">
            <h3 className="text-base font-bold text-foreground">Step 6: Funding & Investor Discovery</h3>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Are you currently seeking investment?</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'not_seeking', label: 'Not seeking investment' },
                  { id: 'considering_later', label: 'Considering later' },
                  { id: 'actively_seeking', label: 'Actively seeking investment' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setInvestmentStatus(opt.id as any)}
                    className={`p-3 rounded-xl text-xs font-medium text-center border transition-all ${
                      investmentStatus === opt.id
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                        : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {investmentStatus === 'actively_seeking' && (
              <div className="space-y-4 pt-2 border-t border-border/50 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Funding Stage</Label>
                    <select value={fundingStage} onChange={e => setFundingStage(e.target.value)} className="w-full p-2.5 bg-input border border-border rounded-xl text-xs text-foreground">
                      <option value="Pre-Seed">Pre-Seed</option>
                      <option value="Seed">Seed</option>
                      <option value="Series A">Series A</option>
                      <option value="Bootstrapped">Bootstrapped / Grant</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Amount Seeking</Label>
                    <Input placeholder="e.g. $500,000" value={amountSeeking} onChange={e => setAmountSeeking(e.target.value)} className="rounded-xl text-xs" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Equity / Instrument</Label>
                    <Input placeholder="e.g. SAFE (10%)" value={equityOffered} onChange={e => setEquityOffered(e.target.value)} className="rounded-xl text-xs" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Business Model</Label>
                  <Input placeholder="e.g. Usage-based SaaS at $39/seat/mo + Enterprise on-prem" value={businessModel} onChange={e => setBusinessModel(e.target.value)} className="rounded-xl text-xs" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Intended Use of Funds</Label>
                  <Textarea placeholder="e.g. 70% Core AI research and GPU compute infrastructure, 30% Developer outreach..." value={useOfFunds} onChange={e => setUseOfFunds(e.target.value)} rows={2} className="rounded-xl text-xs" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Pitch Deck Link (Optional)</Label>
                  <Input placeholder="https://docsend.com/view/..." value={pitchDeckUrl} onChange={e => setPitchDeckUrl(e.target.value)} className="rounded-xl text-xs" />
                </div>
              </div>
            )}
          </Card>
        )}

        {/* STEP 7: VISIBILITY & PUBLISHING */}
        {currentStep === 7 && (
          <Card className="p-6 sm:p-8 bg-card border-border rounded-2xl space-y-6">
            <h3 className="text-base font-bold text-foreground">Step 7: Project Visibility & Publishing Review</h3>

            <div className="space-y-3">
              <Label className="text-xs font-semibold">Who can see this project?</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'public', label: 'Public Ecosystem', icon: Globe, desc: 'Visible to everyone in discovery' },
                  { id: 'community', label: 'Registered Members', icon: ShieldCheck, desc: 'Visible only to signed-in members' },
                  { id: 'private', label: 'Private Workspace', icon: Lock, desc: 'Visible only to accepted team' }
                ].map(v => {
                  const Icon = v.icon;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVisibility(v.id as any)}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        visibility === v.id
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="font-bold text-xs block text-foreground">{v.label}</span>
                      <span className="text-[10px] text-muted-foreground block">{v.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-muted/30 border border-border/60 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-foreground block">Review Checklist:</span>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Project: <strong className="text-foreground">{name || 'Unnamed Startup'}</strong> ({category} • {stage})</li>
                <li>• Screenshots uploaded: <strong className="text-foreground">{prototypeMedia.length} files</strong></li>
                <li>• Founder needs: <strong className="text-foreground">{selectedRequirements.join(', ') || 'Feedback'}</strong></li>
                <li>• Investment: <strong className="text-foreground">{investmentStatus === 'actively_seeking' ? `Seeking ${amountSeeking}` : 'Not raising'}</strong></li>
              </ul>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Checkbox id="terms" checked={agreedTerms} onCheckedChange={checked => setAgreedTerms(!!checked)} />
              <Label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer">
                I agree to the IdeaCheck AI community guidelines. I confirm that all prototype links and validation metrics are accurate.
              </Label>
            </div>
          </Card>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="gap-2 rounded-xl text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </Button>

          {currentStep < 7 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              className="gap-2 rounded-xl font-bold text-xs shadow-md shadow-primary/20"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmitProject}
              disabled={isSubmitting}
              className="gap-2 rounded-xl font-bold text-xs shadow-md shadow-primary/20 bg-primary text-primary-foreground"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing Startup...' : 'Publish to Ecosystem'}</span>
            </Button>
          )}
        </div>
      </div>

      <MobileNav />
    </main>
  );
}
