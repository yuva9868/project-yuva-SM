'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Project, StructuredFeedback } from '@/lib/community-types';
import { findMatchingCollaborators } from '@/lib/matching';
import { getStoredFounders } from '@/lib/community-data';
import { 
  Sparkles, 
  Brain, 
  Target, 
  ShieldAlert, 
  Compass, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  ExternalLink, 
  Cpu, 
  Layers 
} from 'lucide-react';

interface AIIntelligenceTabProps {
  project: Project;
  feedbackList: StructuredFeedback[];
}

export function AIIntelligenceTab({ project, feedbackList }: AIIntelligenceTabProps) {
  const [intelData, setIntelData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [collaboratorMatches, setCollaboratorMatches] = useState<any[]>([]);

  const fetchAIIntelligence = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/project-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, feedbackList })
      });
      if (res.ok) {
        const data = await res.json();
        setIntelData(data);
      }
    } catch (e) {
      console.error('Failed to load AI intelligence:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIIntelligence();
    const founders = getStoredFounders();
    const matches = findMatchingCollaborators(project, founders);
    setCollaboratorMatches(matches);
  }, [project.id]);

  const pAnalysis = intelData?.projectAnalysis;
  const fIntel = intelData?.feedbackIntelligence;
  const cResearch = intelData?.competitorResearch;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">AI Project & Feedback Intelligence</h3>
            {intelData && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
                {intelData.isMock ? 'Grounded Demonstration Engine' : 'Live Claude Intelligence'}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground max-w-xl">
            Synthesizing problem definition, customer reviews, competitor landscape, and collaborator matching into actionable next steps.
          </p>
        </div>

        <Button 
          size="sm" 
          variant="outline"
          onClick={fetchAIIntelligence}
          disabled={loading}
          className="gap-2 rounded-xl text-xs font-semibold shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Synthesizing...' : 'Refresh Intel'}</span>
        </Button>
      </div>

      {loading && !intelData ? (
        <div className="space-y-4">
          <Card className="p-8 border-dashed rounded-2xl animate-pulse flex flex-col items-center justify-center space-y-3">
            <Brain className="w-8 h-8 text-primary/60 animate-bounce" />
            <p className="text-xs font-semibold text-muted-foreground">Running multi-factor project & feedback synthesis...</p>
          </Card>
        </div>
      ) : (
        <>
          {/* SECTION 1: FEEDBACK SYNTHESIS */}
          <Card className="p-6 bg-card border-border rounded-2xl space-y-5">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <h4 className="text-base font-bold text-foreground">Customer & Reviewer Feedback Intelligence</h4>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl border border-border/60 text-xs leading-relaxed text-foreground/90">
              {fIntel?.summary || 'Analyzing reviewer inputs...'}
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs">
              {/* Friction points */}
              <div className="space-y-2 p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Usability Friction & Bottlenecks
                </span>
                <ul className="space-y-1.5 pt-1">
                  {fIntel?.usabilityFrictionPoints?.map((item: string, i: number) => (
                    <li key={i} className="text-muted-foreground flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Experiment */}
              <div className="space-y-2 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Recommended Next Validation Experiment
                </span>
                <p className="text-foreground/90 leading-relaxed pt-1">
                  {fIntel?.recommendedExperiment || 'Test core CTA with 10 design partners.'}
                </p>
              </div>
            </div>
          </Card>

          {/* SECTION 2: PROBLEM CLARITY & ASSUMPTION TESTING */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-foreground">Problem Clarity Evaluation</h4>
                </div>
                <span className="text-sm font-black text-emerald-400">
                  {pAnalysis?.problemClarityScore || 88}/100
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pAnalysis?.clarityCritique}
              </p>

              <div className="space-y-2 pt-2 border-t border-border/50 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Primary Target Customers</span>
                <div className="flex flex-wrap gap-1.5">
                  {pAnalysis?.primaryTargetSegments?.map((seg: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-secondary text-[11px] text-secondary-foreground font-medium">
                      {seg}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold text-foreground">Critical Unverified Assumptions</h4>
              </div>
              <p className="text-xs text-muted-foreground">Assumptions that must be validated before scaling engineering expenditure:</p>
              <ul className="space-y-2 text-xs">
                {pAnalysis?.criticalUnverifiedAssumptions?.map((ass: string, i: number) => (
                  <li key={i} className="p-2.5 bg-muted/30 border border-border/40 rounded-xl text-foreground/90 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">#{i + 1}</span>
                    <span>{ass}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* SECTION 3: COMPETITOR ANALYSIS & DIFFERENTIATION */}
          <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" />
                <h4 className="text-base font-bold text-foreground">Competitive Landscape & Defensibility</h4>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Defensibility Score: </span>
                <span className="font-bold text-primary">{cResearch?.defensibilityScore || 85}/100</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {cResearch?.marketGapAnalysis}
            </p>

            <div className="grid md:grid-cols-2 gap-3 pt-2">
              {cResearch?.directCompetitors?.map((comp: any, idx: number) => (
                <div key={idx} className="p-4 bg-muted/30 border border-border/50 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-foreground">{comp.name}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">{comp.model}</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <p><strong className="text-foreground">Their Strength:</strong> {comp.strength}</p>
                    <p><strong className="text-foreground">Their Weakness:</strong> {comp.weakness}</p>
                  </div>
                  <p className="text-[11px] text-primary font-medium pt-1 border-t border-border/40">
                    <strong>Your Edge:</strong> {comp.differentiationEdge}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* SECTION 4: INTELLIGENT COLLABORATOR MATCHES */}
          <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-400" />
                <h4 className="text-base font-bold text-foreground">Intelligent Collaborator Matches</h4>
              </div>
              <span className="text-xs text-muted-foreground">Matched against project requirements</span>
            </div>

            {collaboratorMatches.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No community collaborator matches found for current requirements.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {collaboratorMatches.slice(0, 4).map((match, i) => (
                  <div key={i} className="p-4 bg-muted/20 border border-border/60 rounded-xl space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={match.founder.avatar} 
                          alt={match.founder.name} 
                          className="w-8 h-8 rounded-full object-cover border border-border" 
                        />
                        <div>
                          <span className="font-bold text-foreground block">{match.founder.name}</span>
                          <span className="text-[10px] text-muted-foreground">{match.matchedRole}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {match.score}% Match
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">{match.explanation}</p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {match.matchedSkills.map((sk: string, sIdx: number) => (
                        <span key={sIdx} className="px-1.5 py-0.5 rounded text-[10px] bg-secondary text-secondary-foreground font-semibold">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
