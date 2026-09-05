'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { StructuredFeedback, StructuredFeedbackRatings } from '@/lib/community-types';
import { useAuth } from '@/lib/auth-context';
import { X, Star, Sparkles, MessageSquare } from 'lucide-react';

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
  });

  const [writtenImprovement, setWrittenImprovement] = useState('');
  const [writtenConcerns, setWrittenConcerns] = useState('');
  const [writtenUseReason, setWrittenUseReason] = useState('');
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
      userName: isAnonymous ? 'Anonymous Founder' : user?.name || 'Community Reviewer',
      userAvatar: isAnonymous 
        ? 'https://avatar.vercel.sh/anonymous?s=96'
        : user?.avatar || 'https://avatar.vercel.sh/user?s=96',
      userBadge: isAnonymous ? 'Community Reviewer' : 'Verified Builder',
      ratings,
      writtenImprovement: writtenImprovement.trim() || 'No specific improvements requested.',
      writtenConcerns: writtenConcerns.trim() || 'No critical concerns noted.',
      writtenUseReason: writtenUseReason.trim() || 'Interested in following progress.',
      isAnonymous,
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      onFeedbackSubmitted(newFeedback);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const ratingFields: Array<{ key: keyof StructuredFeedbackRatings; label: string; desc: string }> = [
    { key: 'problemClarity', label: '1. Problem Clarity', desc: 'Is the core user pain point clear and well defined?' },
    { key: 'solution', label: '2. Solution Fit', desc: 'Does the proposed solution directly solve the stated problem?' },
    { key: 'targetMarket', label: '3. Target Market', desc: 'Is there a clear, reachable target audience?' },
    { key: 'productUx', label: '4. Product & UX', desc: 'How intuitive and visual is the prototype / experience?' },
    { key: 'businessPotential', label: '5. Business Potential', desc: 'What is the potential for growth and sustainability?' },
    { key: 'differentiation', label: '6. Differentiation', desc: 'How unique is this compared to existing alternatives?' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl bg-background border-border shadow-2xl rounded-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Give Structured Feedback</h2>
              <p className="text-xs text-muted-foreground">Evaluating: <span className="font-semibold text-foreground">{projectTitle}</span></p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Structured Ratings 1-10 */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              Quantitative Assessment (Scale 1 - 10)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ratingFields.map(({ key, label, desc }) => (
                <div key={key} className="p-3.5 rounded-xl border border-border bg-card/50 space-y-2">
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
                    value={ratings[key]}
                    onChange={(e) => handleRatingChange(key, parseInt(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <hr className="border-border/60" />

          {/* Qualitative Feedback */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Qualitative Insights
            </h3>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">What would you improve?</Label>
              <Textarea
                placeholder="e.g., Focus on onboarding experience, add integration with Slack, adjust pricing model..."
                value={writtenImprovement}
                onChange={(e) => setWrittenImprovement(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">What potential risks or concerns do you see?</Label>
              <Textarea
                placeholder="e.g., High customer acquisition cost, potential competition from existing incumbents..."
                value={writtenConcerns}
                onChange={(e) => setWrittenConcerns(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">What would make you or your team use this product?</Label>
              <Textarea
                placeholder="e.g., A native browser extension, free tier for small teams..."
                value={writtenUseReason}
                onChange={(e) => setWrittenUseReason(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(!!checked)}
            />
            <Label htmlFor="anonymous" className="text-xs text-muted-foreground cursor-pointer">
              Submit feedback anonymously (Founder will see ratings & written advice without your profile name)
            </Label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
