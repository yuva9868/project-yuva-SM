'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { StructuredFeedback, StructuredFeedbackRatings } from '@/lib/community-types';
import { useAuth } from '@/lib/auth-context';
import { trackEvent } from '@/lib/analytics';
import { X, Star, Sparkles, MessageSquare, CheckCircle2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  onFeedbackSubmitted: (feedback: StructuredFeedback) => void;
}

export function FeedbackModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  onFeedbackSubmitted,
}: FeedbackModalProps) {
  const { user } = useAuth();
  
  const [ratings, setRatings] = useState<StructuredFeedbackRatings>({
    problemClarity: 8,
    solution: 8,
    targetMarket: 8,
    productUx: 8,
    businessPotential: 8,
    differentiation: 8,
    easeOfUse: 8,
    technicalImplementation: 8,
  });

  const [whatWorksWell, setWhatWorksWell] = useState('');
  const [whatIsConfusing, setWhatIsConfusing] = useState('');
  const [whatWouldImprove, setWhatWouldImprove] = useState('');
  const [wouldPersonallyUse, setWouldPersonallyUse] = useState<'Yes' | 'Maybe' | 'No'>('Yes');
  const [additionalInfoNeeded, setAdditionalInfoNeeded] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRatingChange = (key: keyof StructuredFeedbackRatings, val: number) => {
    setRatings(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newFeedback: StructuredFeedback = {
      id: 'fb_' + Date.now(),
      projectId,
      userId: user?.id || 'user_guest',
      userName: isAnonymous ? 'Anonymous Reviewer' : user?.name || 'Community Reviewer',
      userAvatar: isAnonymous 
        ? 'https://avatar.vercel.sh/anonymous?s=96'
        : user?.avatar || 'https://avatar.vercel.sh/user?s=96',
      userBadge: isAnonymous ? 'Community Reviewer' : 'Verified Builder',
      ratings,
      writtenImprovement: whatWouldImprove.trim() || 'No specific improvements requested.',
      writtenConcerns: whatIsConfusing.trim() || 'No major friction noted.',
      writtenUseReason: wouldPersonallyUse === 'Yes' ? 'Would personally use this product.' : 'Evaluating as peer reviewer.',
      whatWorksWell: whatWorksWell.trim(),
      whatIsConfusing: whatIsConfusing.trim(),
      whatWouldImprove: whatWouldImprove.trim(),
      wouldPersonallyUse,
      additionalInfoNeeded: additionalInfoNeeded.trim(),
      helpfulVotes: [],
      isAnonymous,
      status: 'published',
      createdAt: new Date().toISOString(),
    };

    trackEvent('feedback_submitted', { projectId, ratings }, user?.id, projectId);

    setTimeout(() => {
      onFeedbackSubmitted(newFeedback);
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  const ratingFields: Array<{ key: keyof StructuredFeedbackRatings; label: string; desc: string }> = [
    { key: 'problemClarity', label: '1. Problem Clarity', desc: 'Is the core pain point well defined and urgent?' },
    { key: 'solution', label: '2. Solution Fit', desc: 'Does the prototype directly solve the problem?' },
    { key: 'easeOfUse', label: '3. Ease of Use', desc: 'Is the workflow frictionless to understand and test?' },
    { key: 'productUx', label: '4. Design & UX', desc: 'Visual clarity, ergonomics, and typography.' },
    { key: 'technicalImplementation', label: '5. Technical Architecture', desc: 'Feasibility, performance, and stack choice.' },
    { key: 'differentiation', label: '6. Differentiation', desc: 'Uniqueness vs existing alternatives.' },
    { key: 'businessPotential', label: '7. Business Potential', desc: 'Monetization realism and scalability.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl bg-card border-border shadow-2xl rounded-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Submit Structured Feedback</h2>
              <p className="text-xs text-muted-foreground">Evaluating: <span className="font-semibold text-foreground">{projectTitle}</span></p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quantitative Ratings */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              Category Ratings (1 - 10)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {ratingFields.map(({ key, label, desc }) => (
                <div key={key} className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{label}</span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                      {ratings[key]} / 10
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">{desc}</p>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={ratings[key] || 8}
                    onChange={(e) => handleRatingChange(key, parseInt(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <hr className="border-border/60" />

          {/* Qualitative Questions */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Actionable Founder Feedback
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">What works well?</Label>
              <Textarea
                placeholder="What was the most compelling feature or aspect of this prototype?"
                value={whatWorksWell}
                onChange={(e) => setWhatWorksWell(e.target.value)}
                rows={2}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">What is confusing or friction-filled?</Label>
              <Textarea
                placeholder="Where did you get stuck? What assumptions seem unclear?"
                value={whatIsConfusing}
                onChange={(e) => setWhatIsConfusing(e.target.value)}
                rows={2}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">What would you improve?</Label>
              <Textarea
                placeholder="Specific UI, technical, or messaging suggestions..."
                value={whatWouldImprove}
                onChange={(e) => setWhatWouldImprove(e.target.value)}
                rows={2}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-2 pt-1">
              <Label className="text-xs font-semibold">Would you personally use this product?</Label>
              <div className="flex gap-2">
                {(['Yes', 'Maybe', 'No'] as const).map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setWouldPersonallyUse(option)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      wouldPersonallyUse === option
                        ? 'bg-primary/10 border-primary text-primary shadow-sm'
                        : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">What additional information is needed?</Label>
              <Textarea
                placeholder="Questions about pricing, security compliance, roadmap, or integrations..."
                value={additionalInfoNeeded}
                onChange={(e) => setAdditionalInfoNeeded(e.target.value)}
                rows={2}
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(!!checked)}
            />
            <Label htmlFor="anonymous" className="text-xs text-muted-foreground cursor-pointer">
              Submit feedback anonymously (Founder receives scores & critique without your name)
            </Label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold text-xs gap-1.5">
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
