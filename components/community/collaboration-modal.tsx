'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CollaborationRequest } from '@/lib/community-types';
import { useAuth } from '@/lib/auth-context';
import { trackEvent } from '@/lib/analytics';
import { X, Users, Send, CheckCircle2 } from 'lucide-react';

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  recipientId: string;
  recipientName: string;
  onCollaborationSubmitted: (req: CollaborationRequest) => void;
}

export function CollaborationModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  recipientId,
  recipientName,
  onCollaborationSubmitted,
}: CollaborationModalProps) {
  const { user } = useAuth();
  
  const [role, setRole] = useState<'Co-founder' | 'Developer' | 'Designer' | 'Marketing' | 'Mentor' | 'Investor'>('Developer');
  const [message, setMessage] = useState('');
  const [reasonForReachingOut, setReasonForReachingOut] = useState('');
  const [proposedContribution, setProposedContribution] = useState('');
  const [availabilityCommitment, setAvailabilityCommitment] = useState('5 - 10 hours/week');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const roles: Array<'Co-founder' | 'Developer' | 'Designer' | 'Marketing' | 'Mentor' | 'Investor'> = [
    'Co-founder',
    'Developer',
    'Designer',
    'Marketing',
    'Mentor',
    'Investor',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const req: CollaborationRequest = {
      id: 'collab_' + Date.now(),
      senderId: user?.id || 'user_guest',
      senderName: user?.name || 'Community Builder',
      senderUsername: user?.name ? user.name.toLowerCase().replace(/\s+/g, '') : 'builder',
      senderAvatar: user?.avatar || 'https://avatar.vercel.sh/builder?s=96',
      recipientId,
      recipientName,
      projectId,
      projectTitle,
      role,
      message: message.trim() || `I would like to collaborate on ${projectTitle} as a ${role}.`,
      reasonForReachingOut: reasonForReachingOut.trim(),
      proposedContribution: proposedContribution.trim(),
      availabilityCommitment,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    trackEvent('collaboration_requested', { projectId, role, recipientName }, user?.id, projectId);

    setTimeout(() => {
      onCollaborationSubmitted(req);
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-lg bg-card border-border shadow-2xl rounded-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Request Collaboration</h2>
              <p className="text-xs text-muted-foreground">Propose joining <span className="font-semibold text-foreground">{projectTitle}</span></p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Desired Role</Label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                    role === r
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                      : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Why are you reaching out to this project?</Label>
            <Input
              placeholder="e.g. Passionate about developer tools and experienced with OpenAPI pipelines..."
              value={reasonForReachingOut}
              onChange={(e) => setReasonForReachingOut(e.target.value)}
              className="text-xs rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">What concrete contribution can you deliver?</Label>
            <Textarea
              placeholder="e.g. Build the frontend VS Code webview or optimize the database ORM generator..."
              value={proposedContribution}
              onChange={(e) => setProposedContribution(e.target.value)}
              rows={2}
              className="text-xs rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Availability Commitment</Label>
            <select
              value={availabilityCommitment}
              onChange={(e) => setAvailabilityCommitment(e.target.value)}
              className="w-full p-2 bg-input border border-border rounded-xl text-xs text-foreground"
            >
              <option value="2 - 5 hours/week">2 - 5 hours / week (Advisory / Part-time)</option>
              <option value="5 - 10 hours/week">5 - 10 hours / week (Active Contributor)</option>
              <option value="15 - 20 hours/week">15 - 20 hours / week (Core Collaborator)</option>
              <option value="Full-time">Full-time (Co-founder search)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Personal Introduction Message</Label>
            <Textarea
              placeholder="A brief greeting to the founder..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="text-xs rounded-xl"
              required
            />
          </div>

          <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-[11px] text-muted-foreground flex items-center gap-2">
            <Send className="w-4 h-4 text-primary shrink-0" />
            <span>The founder will review your request. On acceptance, you'll unlock the private workspace.</span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold text-xs gap-1.5">
              {isSubmitting ? 'Sending Request...' : 'Send Request'}
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
