'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CollaborationRequest } from '@/lib/community-types';
import { useAuth } from '@/lib/auth-context';
import { X, Users, Send } from 'lucide-react';

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
      message: message.trim() || `I am interested in collaborating on ${projectTitle} as a ${role}. Let's connect!`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      onCollaborationSubmitted(req);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-lg bg-background border-border shadow-2xl rounded-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Request Collaboration</h2>
              <p className="text-xs text-muted-foreground">Connecting with founder <span className="font-semibold text-foreground">{recipientName}</span></p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Select your role or contribution area</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                    role === r
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Introduce yourself & state how you can help</Label>
            <Textarea
              placeholder="e.g. Hi! I'm a full-stack React/Node developer with experience building SaaS tools. I saw your prototype and would love to assist with your frontend MVP..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="text-sm"
              required
            />
          </div>

          <div className="p-3 bg-muted/50 rounded-xl border border-border/60 text-[11px] text-muted-foreground flex items-center gap-2">
            <Send className="w-4 h-4 text-primary shrink-0" />
            <span>The founder will receive your proposal in their User Dashboard inbox and notification drawer.</span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? 'Sending Proposal...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
