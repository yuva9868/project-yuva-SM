'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Project, FundingExpression } from '@/lib/community-types';
import { 
  getStoredFundingExpressions, 
  saveStoredFundingExpression, 
  saveStoredNotification 
} from '@/lib/community-data';
import { trackEvent } from '@/lib/analytics';
import { useAuth } from '@/lib/auth-context';
import { 
  DollarSign, 
  TrendingUp, 
  FileText, 
  ShieldCheck, 
  ExternalLink, 
  Lock, 
  Send, 
  AlertTriangle, 
  Check, 
  PieChart, 
  Layers, 
  Users 
} from 'lucide-react';

interface InvestorRoomProps {
  project: Project;
  isOwner: boolean;
}

export function InvestorRoom({ project, isOwner }: InvestorRoomProps) {
  const { user } = useAuth();
  const [expressions, setExpressions] = useState<FundingExpression[]>(() => 
    getStoredFundingExpressions(project.id)
  );

  const [expressModalOpen, setExpressModalOpen] = useState(false);
  const [investorName, setInvestorName] = useState(user?.name || '');
  const [firmName, setFirmName] = useState('');
  const [checkSize, setCheckSize] = useState('$50k - $100k');
  const [notes, setNotes] = useState('');
  const [requestDeck, setRequestDeck] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  const funding = project.fundingInfo || { seekingInvestment: false };

  const handleExpressInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!investorName.trim()) return;
    setIsSubmitting(true);

    const expr: FundingExpression = {
      id: 'fund_' + Math.random().toString(36).substring(2, 9),
      projectId: project.id,
      projectTitle: project.name,
      investorId: user?.id || 'inv_' + Math.random().toString(36).substring(2, 6),
      investorName,
      investorFirm: firmName.trim() ? firmName : undefined,
      checkSizeRange: checkSize,
      notes,
      pitchDeckRequested: requestDeck,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    saveStoredFundingExpression(expr);
    trackEvent('funding_interest_expressed', { checkSize, investorName }, user?.id, project.id);

    // Notify founder
    saveStoredNotification({
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      userId: project.founderId,
      type: 'collaboration_request',
      title: 'New Investment Expression of Interest',
      message: `${investorName} (${checkSize}) expressed interest in ${project.name}.`,
      link: `/community/${project.id}`,
      read: false,
      createdAt: new Date().toISOString()
    });

    setIsSubmitting(false);
    setSuccessSubmitted(true);
    setExpressions(getStoredFundingExpressions(project.id));
  };

  return (
    <div className="space-y-6">
      {/* Executive Pitch Summary Banner */}
      <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5 border-border rounded-2xl space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                Investor Discovery Room
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-muted text-foreground">
                Stage: {funding.stage || project.stage}
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground">{project.name} Investment Overview</h3>
            <p className="text-xs text-muted-foreground max-w-xl">{project.tagline}</p>
          </div>

          {!isOwner && (
            <Button 
              onClick={() => setExpressModalOpen(true)}
              className="gap-2 font-bold rounded-xl shadow-md shadow-primary/20 shrink-0 bg-primary text-primary-foreground"
            >
              <Send className="w-4 h-4" />
              <span>Express Investment Interest</span>
            </Button>
          )}
        </div>

        {/* Core Financial & Round Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/40 rounded-xl border border-border/60">
          <div>
            <span className="text-[11px] text-muted-foreground block font-medium">Target Round</span>
            <span className="text-base font-black text-foreground">{funding.amountSeeking || 'Undisclosed'}</span>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block font-medium">Round Stage</span>
            <span className="text-base font-black text-primary">{funding.stage || 'Pre-Seed'}</span>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block font-medium">Monthly Traction</span>
            <span className="text-base font-black text-foreground">{funding.revenue || 'Pre-revenue'}</span>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block font-medium">Validation Score</span>
            <span className="text-base font-black text-emerald-400">{project.validationScore}/100</span>
          </div>
        </div>
      </Card>

      {/* Grid: Business Model, Traction, Use of Funds */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Business Model & Market */}
        <Card className="p-5 bg-card border-border rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-foreground font-bold text-sm">
            <PieChart className="w-4 h-4 text-primary" />
            <span>Business Model & Target Economics</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {funding.businessModel || 'Usage-based B2B SaaS model targeting dev tooling budgets and API execution quotas.'}
          </p>

          <div className="space-y-2 pt-2 border-t border-border/50 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Target Customers</span>
            <p className="text-foreground/90 font-medium">{project.targetUsers || 'Technical startups, agencies, and backend engineers.'}</p>
          </div>
        </Card>

        {/* Capital Allocation & Use of Funds */}
        <Card className="p-5 bg-card border-border rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-foreground font-bold text-sm">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Intended Use of Funds</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {funding.useOfFunds || 'Engineering hiring, cloud GPU training infrastructure, security audits (SOC2), and go-to-market developer relations.'}
          </p>

          <div className="space-y-2 pt-2 border-t border-border/50 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Reported Traction</span>
            <p className="text-foreground/90 font-medium">{funding.currentTraction || 'Active prototype with 140+ early developer signups.'}</p>
          </div>
        </Card>
      </div>

      {/* Pitch Deck & Confidential Documents */}
      <Card className="p-5 bg-card border-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-foreground">Pitch Deck & Cap Table Materials</h4>
            <p className="text-xs text-muted-foreground">
              {funding.pitchDeckUrl ? 'Founder has attached confidential pitch deck link.' : 'Pitch deck available upon verified NDA or intro request.'}
            </p>
          </div>
        </div>

        {funding.pitchDeckUrl ? (
          <a href={funding.pitchDeckUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="gap-2 rounded-xl text-xs font-bold">
              <span>View Pitch Deck</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setExpressModalOpen(true)} className="gap-2 rounded-xl text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Request Pitch Deck</span>
          </Button>
        )}
      </Card>

      {/* Founder View: Received Expressions of Interest */}
      {isOwner && (
        <Card className="p-5 bg-card border-border rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-bold text-foreground">Investor Inquiries Received ({expressions.length})</h4>
            </div>
          </div>

          {expressions.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No investor expressions of interest submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {expressions.map(expr => (
                <div key={expr.id} className="p-3.5 bg-muted/40 rounded-xl border border-border/50 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-foreground">{expr.investorName} {expr.investorFirm ? `• ${expr.investorFirm}` : ''}</span>
                    <span className="text-primary font-black">{expr.checkSizeRange}</span>
                  </div>
                  {expr.notes && <p className="text-muted-foreground">{expr.notes}</p>}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <span>{expr.pitchDeckRequested ? 'Requested pitch deck access' : 'General interest'}</span>
                    <span>{new Date(expr.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Regulatory Disclaimer */}
      <div className="p-4 bg-muted/20 border border-border/40 rounded-xl text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-foreground">Regulatory Disclaimer:</strong> The information provided in this Investor Room is for informational, peer-review, and discovery purposes only. IdeaCheck AI is not a registered broker-dealer, investment advisor, or crowdfunding platform. Expressions of interest do not represent binding investment commitments.
        </p>
      </div>

      {/* MODAL: Express Interest */}
      {expressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-foreground">Express Investment Interest</h3>
              </div>
              <button onClick={() => setExpressModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            {successSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-foreground">Interest Sent to Founder</h4>
                <p className="text-xs text-muted-foreground">
                  The founder has been notified and can follow up directly through verified channels.
                </p>
                <Button onClick={() => setExpressModalOpen(false)} className="rounded-xl font-bold text-xs">
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleExpressInterest} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Your Name</Label>
                  <Input 
                    value={investorName} 
                    onChange={e => setInvestorName(e.target.value)} 
                    required 
                    className="rounded-xl text-xs" 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Fund / Angel Entity (Optional)</Label>
                  <Input 
                    placeholder="e.g. Horizon Ventures or Angel" 
                    value={firmName} 
                    onChange={e => setFirmName(e.target.value)} 
                    className="rounded-xl text-xs" 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Typical Check Size</Label>
                  <select 
                    value={checkSize} 
                    onChange={e => setCheckSize(e.target.value)}
                    className="w-full p-2 bg-input border border-border rounded-xl text-xs text-foreground"
                  >
                    <option value="$10k - $25k">$10k - $25k (Early Angel)</option>
                    <option value="$25k - $50k">$25k - $50k (Angel / Syndicate)</option>
                    <option value="$50k - $100k">$50k - $100k (Angel / Pre-Seed)</option>
                    <option value="$100k - $250k">$100k - $250k (Institutional Seed)</option>
                    <option value="$250k+">$250k+ (Lead Investor)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Notes / Questions for Founder</Label>
                  <Textarea 
                    placeholder="What interested you about this startup? Request an intro call or pitch deck..." 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    className="rounded-xl text-xs" 
                    rows={3} 
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setExpressModalOpen(false)} className="rounded-xl text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold text-xs gap-1.5">
                    {isSubmitting ? 'Sending...' : 'Submit Interest'}
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
