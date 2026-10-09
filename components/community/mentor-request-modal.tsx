'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MentorProfile, MentorSessionRequest } from '@/lib/community-types';
import { saveStoredMentorRequest, saveStoredNotification } from '@/lib/community-data';
import { useAuth } from '@/lib/auth-context';
import { X, Calendar, Send, CheckCircle2, Award } from 'lucide-react';

interface MentorRequestModalProps {
  mentor: MentorProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MentorRequestModal({ mentor, isOpen, onClose, onSuccess }: MentorRequestModalProps) {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [preferredTime, setPreferredTime] = useState('Next Tuesday 2:00 PM EST');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !mentor) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setIsSubmitting(true);

    const req: MentorSessionRequest = {
      id: 'mreq_' + Math.random().toString(36).substring(2, 9),
      mentorId: mentor.id,
      mentorName: mentor.name,
      founderId: user?.id || 'founder_guest',
      founderName: user?.name || 'Startup Founder',
      topic,
      details,
      preferredTime,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    saveStoredMentorRequest(req);

    saveStoredNotification({
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      userId: mentor.userId,
      type: 'mentor_request',
      title: 'New Mentorship Session Request',
      message: `${user?.name || 'A startup founder'} requested a session on "${topic}".`,
      link: '/dashboard?tab=mentorship',
      read: false,
      createdAt: new Date().toISOString()
    });

    setIsSubmitting(false);
    setIsSuccess(true);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-lg bg-card border-border shadow-2xl rounded-2xl overflow-hidden my-6">
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <img src={mentor.avatar} alt={mentor.name} className="w-10 h-10 rounded-full object-cover border border-border" />
            <div>
              <h2 className="text-base font-bold text-foreground">Request Office Hours</h2>
              <p className="text-xs text-muted-foreground">{mentor.name} • {mentor.title}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-foreground">Session Request Sent</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {mentor.name} will review your questions and reach out with confirmation details.
              </p>
              <Button onClick={onClose} className="rounded-xl font-bold text-xs">Close</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs space-y-1">
                <span className="font-bold text-primary block">Expertise Areas:</span>
                <p className="text-muted-foreground">{mentor.expertise.join(' • ')}</p>
                <span className="text-[11px] text-muted-foreground block pt-1">
                  Availability: {mentor.availability}
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Discussion Topic / Goal</Label>
                <Input 
                  placeholder="e.g. Pitch deck feedback or GTM pricing strategy..." 
                  value={topic} 
                  onChange={e => setTopic(e.target.value)} 
                  required 
                  className="rounded-xl text-xs" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Key Questions & Context</Label>
                <Textarea 
                  placeholder="Share details about your current traction, roadblocks, and exact questions..." 
                  value={details} 
                  onChange={e => setDetails(e.target.value)} 
                  required 
                  rows={3} 
                  className="rounded-xl text-xs" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Preferred Date / Time</Label>
                <Input 
                  placeholder="e.g. Next Tuesday 2:00 PM EST or flexible this week" 
                  value={preferredTime} 
                  onChange={e => setPreferredTime(e.target.value)} 
                  className="rounded-xl text-xs" 
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={onClose} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold text-xs gap-1.5">
                  {isSubmitting ? 'Requesting...' : 'Request Session'}
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
