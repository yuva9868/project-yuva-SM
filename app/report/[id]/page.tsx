'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ValidationReport, mockIdeas, Idea } from '@/lib/mock-data';
import Link from 'next/link';
import { 
  ArrowLeft, Share2, Download, MessageCircle, ThumbsUp, Bookmark, 
  Lock, Unlock, Printer, Edit3, AlertTriangle, CheckSquare, Square, 
  Users2, Shuffle, CheckCircle, HelpCircle, HardDrive, Clock, DollarSign
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading } = useAuth();
  
  const [idea, setIdea] = useState<Idea | null>(null);
  const [activeReport, setActiveReport] = useState<ValidationReport | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number>(-1); // -1 means latest
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [completedFeatures, setCompletedFeatures] = useState<number[]>([]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user && isHydrated) {
      router.push('/login');
      return;
    }

    if (user && isHydrated) {
      const stored = localStorage.getItem(`ideacheck_ideas_${user.id}`) || '[]';
      try {
        const ideas = JSON.parse(stored);
        const foundIdea = ideas.find((i: any) => i.id === params.id);
        if (foundIdea) {
          setIdea(foundIdea);
          setActiveReport(foundIdea.report);
          setIsSaved(foundIdea.savedByUser || false);
          setIsPublic(foundIdea.isPublic || false);
          setSelectedVersion(-1); // default to current latest
        }
      } catch (e) {
        console.error('Failed to parse ideas:', e);
      }
    }
  }, [user, isLoading, isHydrated, params.id, router]);

  // Handle switching report versions
  const handleVersionChange = (versionIndex: number) => {
    if (!idea) return;
    setSelectedVersion(versionIndex);
    
    if (versionIndex === -1) {
      // Latest version
      setActiveReport(idea.report || null);
    } else {
      // Historical version
      const hist = idea.history?.[versionIndex];
      if (hist) {
        setActiveReport(hist.report);
      }
    }
  };

  // Toggle public/private privacy
  const handlePrivacyToggle = () => {
    if (!user || !idea) return;

    const newPublicState = !isPublic;
    setIsPublic(newPublicState);

    // 1. Update idea in user's dashboard list
    const stored = localStorage.getItem(`ideacheck_ideas_${user.id}`) || '[]';
    try {
      const ideas = JSON.parse(stored);
      const updatedIdeas = ideas.map((i: any) => {
        if (i.id === idea.id) {
          return { ...i, isPublic: newPublicState };
        }
        return i;
      });
      localStorage.setItem(`ideacheck_ideas_${user.id}`, JSON.stringify(updatedIdeas));
      
      // Update local state
      setIdea({ ...idea, isPublic: newPublicState });
    } catch (e) {
      console.error(e);
    }

    // 2. Add/Remove from global community ideas list
    const storedComm = localStorage.getItem('ideacheck_community_ideas') || '[]';
    try {
      let commIdeas = JSON.parse(storedComm);
      
      if (newPublicState) {
        // Publish to community
        const exists = commIdeas.some((i: any) => i.id === idea.id);
        if (!exists) {
          commIdeas.push({
            id: idea.id,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar || `https://avatar.vercel.sh/${user.name}?s=96`,
            title: idea.title,
            description: idea.description,
            category: idea.category,
            votes: 1, // Auto self-vote
            comments: 0,
            saved: false,
            report: activeReport || idea.report,
            createdAt: idea.createdAt || new Date().toISOString(),
          });
          
          // Also set self voted
          const storedVotes = localStorage.getItem(`ideacheck_voted_ideas_${user.id}`) || '[]';
          const voted = JSON.parse(storedVotes);
          if (!voted.includes(idea.id)) {
            voted.push(idea.id);
            localStorage.setItem(`ideacheck_voted_ideas_${user.id}`, JSON.stringify(voted));
          }
        }
      } else {
        // Unpublish from community
        commIdeas = commIdeas.filter((i: any) => i.id !== idea.id);
      }
      localStorage.setItem('ideacheck_community_ideas', JSON.stringify(commIdeas));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDiscussInCommunity = () => {
    if (!user || !idea) return;
    
    // Automatically make public if discussing
    if (!isPublic) {
      handlePrivacyToggle();
    }
    router.push(`/community/${idea.id}`);
  };

  const handleToggleFeature = (index: number) => {
    if (completedFeatures.includes(index)) {
      setCompletedFeatures(completedFeatures.filter(i => i !== index));
    } else {
      setCompletedFeatures([...completedFeatures, index]);
    }
  };

  const scoreData = activeReport ? [
    { name: 'Market', value: Math.round(activeReport.marketPotential || 0) },
    { name: 'Tech', value: Math.round(activeReport.techFeasibility || 0) },
    { name: 'Overall', value: Math.round(activeReport.overallScore || 0) },
  ] : [];

  const roadmapData = [
    { phase: 'Discovery', score: 20 },
    { phase: 'MVP', score: 40 },
    { phase: 'Launch', score: 60 },
    { phase: 'Growth', score: 80 },
    { phase: 'Scale', score: 90 },
  ];

  if (isLoading || !isHydrated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !activeReport || !idea) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 text-center">
          <p className="text-muted-foreground text-lg">Report not found.</p>
          <Link href="/dashboard" className="text-primary mt-4 inline-block hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="no-print">
        <Header />
      </div>

      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-20 print:pt-4 print:pb-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Back button (Hidden in Print) */}
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 no-print">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Action Toolbar (Hidden in Print) */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 rounded-xl border border-border bg-card no-print">
            
            {/* Version History Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">Report Version:</span>
              <select
                value={selectedVersion}
                onChange={(e) => handleVersionChange(Number(e.target.value))}
                className="px-3 py-1.5 border border-input rounded-md bg-background text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value={-1}>Latest Version</option>
                {idea.history?.map((hist, index) => (
                  <option key={index} value={index}>
                    Version {index + 1} ({new Date(hist.date).toLocaleDateString()}) - Score: {Math.round(hist.score)}%
                  </option>
                ))}
              </select>
            </div>

            {/* Print and Actions */}
            <div className="flex items-center gap-2">
              <Button 
                onClick={handlePrivacyToggle} 
                variant="outline" 
                size="sm" 
                className={`gap-2 ${isPublic ? 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10' : ''}`}
              >
                {isPublic ? (
                  <>
                    <Unlock className="w-4 h-4" /> Public (Shared)
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Private (Only You)
                  </>
                )}
              </Button>

              <Link href={`/submit?edit=${idea.id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit3 className="w-4 h-4" /> Improve Idea
                </Button>
              </Link>

              <Button onClick={() => window.print()} variant="outline" size="sm" className="gap-2">
                <Printer className="w-4 h-4" /> Print / Export PDF
              </Button>
            </div>
          </div>

          {/* PRINT-ONLY HEADER */}
          <div className="hidden print:block text-center border-b border-border/80 pb-6 mb-8">
            <h1 className="text-3xl font-extrabold text-foreground">IdeaCheck Business Validation Report</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Generated by AI-Powered insights on {new Date(activeReport.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Main Title & Categories */}
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
                  {activeReport.category}
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-foreground">{activeReport.title}</h1>
                <p className="text-muted-foreground text-sm">
                  Created {new Date(activeReport.createdAt).toLocaleDateString()} 
                  {selectedVersion !== -1 && ` • Viewing Version ${selectedVersion + 1}`}
                </p>
              </div>
            </div>
          </div>

          {/* Overall Validation Score Card */}
          <Card className="p-8 mb-8 bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20 shadow-lg">
            <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
              <div className="md:border-r border-border/40">
                <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                <p className="text-5xl font-black text-primary">{Math.round(activeReport.overallScore)}%</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {activeReport.overallScore >= 75
                    ? 'Excellent validation potential'
                    : activeReport.overallScore >= 60
                    ? 'Good validation potential'
                    : 'Moderate validation potential'}
                </p>
              </div>
              <div className="md:border-r border-border/40">
                <p className="text-sm text-muted-foreground mb-2">Market Potential</p>
                <p className="text-5xl font-black text-accent">{Math.round(activeReport.marketPotential)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tech Feasibility</p>
                <p className="text-5xl font-black text-primary">{Math.round(activeReport.techFeasibility)}%</p>
              </div>
            </div>
          </Card>

          {/* PRACTICAL METRICS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-5 flex flex-col justify-between border-border/50 shadow-sm">
              <div className="flex items-center gap-2 text-primary">
                <HardDrive className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Build Difficulty</span>
              </div>
              <div className="mt-2">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-extrabold ${
                  activeReport.buildDifficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                  activeReport.buildDifficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                  'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                }`}>
                  {activeReport.buildDifficulty || 'Medium'}
                </span>
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-border/50 shadow-sm">
              <div className="flex items-center gap-2 text-primary">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Est. MVP Cost</span>
              </div>
              <div className="mt-2 text-lg font-bold text-foreground">
                {activeReport.estimatedMvpCost || '$500 - $1,500'}
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-border/50 shadow-sm">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Time to Build</span>
              </div>
              <div className="mt-2 text-lg font-bold text-foreground">
                {activeReport.timeToBuild || '3-4 weeks'}
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-border/50 shadow-sm col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Biggest Risk</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground line-clamp-2" title={activeReport.biggestRisk}>
                {activeReport.biggestRisk || 'Market adoption resistance'}
              </div>
            </Card>
          </div>

          {/* REALITY CHECK WARNING BOX */}
          {activeReport.realityCheck && (
            <Card className="p-6 mb-8 border-rose-500/30 bg-rose-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <AlertTriangle className="w-24 h-24 text-rose-500" />
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-rose-500 mb-1">Reality Check: Why it might fail</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {activeReport.realityCheck}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Competitor Comparison Table */}
          {activeReport.competitorComparison && activeReport.competitorComparison.length > 0 && (
            <Card className="p-6 mb-8 border-border/50">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-primary" /> Competitor Comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground uppercase text-xs font-semibold">
                      <th className="py-3 px-2">Competitor</th>
                      <th className="py-3 px-2">Price</th>
                      <th className="py-3 px-2">Strength</th>
                      <th className="py-3 px-2">Weakness</th>
                      <th className="py-3 px-2 text-primary">Your Opportunity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReport.competitorComparison.map((comp, idx) => (
                      <tr key={idx} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                        <td className="py-3 px-2 font-semibold text-foreground">{comp.competitor}</td>
                        <td className="py-3 px-2 text-muted-foreground">{comp.price}</td>
                        <td className="py-3 px-2 text-xs text-muted-foreground">{comp.strength}</td>
                        <td className="py-3 px-2 text-xs text-muted-foreground">{comp.weakness}</td>
                        <td className="py-3 px-2 text-xs text-primary font-medium">{comp.opportunity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* First 5 Features checklist */}
          {activeReport.first5Features && activeReport.first5Features.length > 0 && (
            <Card className="p-6 mb-8 border-border/50">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" /> First 5 Features to Build (MVP)
              </h2>
              <div className="grid sm:grid-cols-1 gap-3">
                {activeReport.first5Features.map((feat, idx) => {
                  const isDone = completedFeatures.includes(idx);
                  return (
                    <div 
                      key={idx}
                      onClick={() => handleToggleFeature(idx)}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all duration-300 ${
                        isDone 
                          ? 'bg-emerald-500/5 border-emerald-500/30 text-muted-foreground line-through' 
                          : 'bg-background hover:bg-secondary/40 border-border/60 hover:border-primary/40'
                      }`}
                    >
                      <button className="shrink-0 mt-0.5">
                        {isDone ? (
                          <CheckSquare className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Square className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      <span className="text-sm font-medium">{feat}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* MVP Roadmap Weeks */}
          {activeReport.mvpRoadmap && activeReport.mvpRoadmap.length > 0 && (
            <Card className="p-6 mb-8 border-border/50">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Weekly MVP Roadmap
              </h2>
              <div className="relative border-l border-border pl-6 space-y-8 ml-4">
                {activeReport.mvpRoadmap.map((roadmap, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle marker */}
                    <div className="absolute -left-[35px] mt-1.5 w-4.5 h-4.5 rounded-full bg-background border-2 border-primary flex items-center justify-center font-bold text-[9px] text-primary">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-foreground">{roadmap.week}</h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {roadmap.tasks}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* First 100 Users Strategy */}
          {activeReport.first100UsersStrategy && activeReport.first100UsersStrategy.length > 0 && (
            <Card className="p-6 mb-8 border-border/50">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users2 className="w-5 h-5 text-primary" /> First 100 Users Strategy
              </h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Suggested platforms and precise strategies to validate and gain initial traction.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {activeReport.first100UsersStrategy.map((strat, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border/50 bg-secondary/20">
                    <h4 className="font-extrabold text-sm text-primary mb-2 uppercase tracking-wide">
                      {strat.platform}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {strat.strategy}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Pivot Suggestions */}
          {activeReport.pivotSuggestions && activeReport.pivotSuggestions.length > 0 && (
            <Card className="p-6 mb-8 border-border/50 bg-secondary/10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <Shuffle className="w-5 h-5 text-primary" /> Alternate Pivot Options
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                If the overall score is low, consider scaling back or adapting your idea to these alternate versions:
              </p>
              <ul className="space-y-3">
                {activeReport.pivotSuggestions.map((pivot, idx) => (
                  <li key={idx} className="p-3 bg-card rounded-lg border border-border/40 text-sm text-muted-foreground leading-relaxed flex items-start gap-3">
                    <span className="font-extrabold text-primary shrink-0">#{idx + 1}</span>
                    <span>{pivot}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Detailed analysis cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Target Market Analysis</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{activeReport.targetMarket}</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Unique Value</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{activeReport.uniqueValue}</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Business Model</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{activeReport.businessModel}</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Competitor Analysis</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{activeReport.competitorAnalysis}</p>
            </Card>
          </div>

          {/* Recommendations list */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
            <ul className="space-y-2">
              {activeReport.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <span className="text-primary font-semibold">{idx + 1}.</span>
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Risk Factors */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Risk Factors & Mitigation</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{activeReport.riskFactors}</p>
          </Card>

          {/* Actions (Hidden in Print) */}
          <div className="flex gap-3 no-print">
            <Button onClick={handleDiscussInCommunity} className="flex-1 gap-2">
              <MessageCircle className="w-4 h-4" />
              Discuss in Community
            </Button>
            <Button 
              onClick={() => setIsSaved(!isSaved)}
              variant="outline" 
              className={`gap-2 ${isSaved ? 'text-primary border-primary/30 bg-primary/5' : ''}`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" className="gap-2">
              <ThumbsUp className="w-4 h-4" />
              Helpful
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
