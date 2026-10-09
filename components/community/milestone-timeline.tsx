'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Project, ProjectMilestone } from '@/lib/community-types';
import { 
  getStoredMilestones, 
  saveStoredMilestone, 
  deleteStoredMilestone,
  saveStoredNotification
} from '@/lib/community-data';
import { trackEvent } from '@/lib/analytics';
import { 
  Milestone as MilestoneIcon, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Plus, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  Trash2,
  TrendingUp
} from 'lucide-react';

interface MilestoneTimelineProps {
  project: Project;
  isOwner: boolean;
}

export function MilestoneTimeline({ project, isOwner }: MilestoneTimelineProps) {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(() => getStoredMilestones(project.id));
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ProjectMilestone['status']>('completed');
  const [metric, setMetric] = useState('');
  const [evidenceLink, setEvidenceLink] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newMilestone: ProjectMilestone = {
      id: 'mstone_' + Math.random().toString(36).substring(2, 9),
      projectId: project.id,
      title,
      description,
      date,
      status,
      isVerified,
      metric: metric.trim() ? metric : undefined,
      evidenceLink: evidenceLink.trim() ? evidenceLink : undefined,
      visibility: 'public'
    };

    saveStoredMilestone(newMilestone);
    trackEvent('milestone_published', { title: newMilestone.title }, undefined, project.id);
    setMilestones(getStoredMilestones(project.id));
    setAddModalOpen(false);

    // Reset
    setTitle('');
    setDescription('');
    setMetric('');
    setEvidenceLink('');
  };

  const handleDelete = (id: string) => {
    deleteStoredMilestone(id);
    setMilestones(getStoredMilestones(project.id));
  };

  const completedCount = milestones.filter(m => m.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header & Milestone Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-card border border-border rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <MilestoneIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Execution & Milestone Timeline</h3>
            <p className="text-xs text-muted-foreground">
              {completedCount} of {milestones.length} milestones shipped • Evidence-backed execution history
            </p>
          </div>
        </div>

        {isOwner && (
          <Button onClick={() => setAddModalOpen(true)} className="gap-2 font-bold rounded-xl text-xs shadow-md shadow-primary/20 shrink-0">
            <Plus className="w-4 h-4" />
            <span>Post Progress Milestone</span>
          </Button>
        )}
      </div>

      {/* Timeline Stream */}
      {milestones.length === 0 ? (
        <Card className="p-10 text-center border-dashed rounded-2xl space-y-2">
          <Clock className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-sm font-semibold">No milestones recorded yet</p>
          <p className="text-xs text-muted-foreground">The founder has not published project progress updates yet.</p>
        </Card>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {milestones.map((mstone, idx) => (
            <div key={mstone.id || idx} className="relative group">
              {/* Dot */}
              <div className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center ${
                mstone.status === 'completed' 
                  ? 'bg-emerald-500 text-white' 
                  : mstone.status === 'in_progress'
                  ? 'bg-primary text-white'
                  : 'bg-muted-foreground'
              }`}>
                {mstone.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
              </div>

              <Card className="p-5 bg-card border-border rounded-2xl space-y-3 group-hover:border-primary/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        mstone.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : mstone.status === 'in_progress'
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {mstone.status.replace('_', ' ')}
                      </span>

                      {mstone.isVerified ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified Evidence</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-secondary-foreground">
                          Self-Reported
                        </span>
                      )}

                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-auto">
                        <Calendar className="w-3 h-3" />
                        {mstone.date}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-foreground pt-1">{mstone.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{mstone.description}</p>
                  </div>

                  {isOwner && (
                    <button 
                      onClick={() => handleDelete(mstone.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      title="Delete Milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Evidence & Metrics Bar */}
                {(mstone.metric || mstone.evidenceLink) && (
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/50 text-xs">
                    {mstone.metric && (
                      <div className="flex items-center gap-1.5 text-primary font-bold bg-primary/5 px-2.5 py-1 rounded-lg">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{mstone.metric}</span>
                      </div>
                    )}

                    {mstone.evidenceLink && (
                      <a 
                        href={mstone.evidenceLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground underline decoration-primary/40 underline-offset-2 transition-colors ml-auto text-[11px]"
                      >
                        <span>Inspect Evidence Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Post New Milestone */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-card border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <MilestoneIcon className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">Publish Project Milestone</h3>
              </div>
              <button onClick={() => setAddModalOpen(false)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Milestone Title</Label>
                <Input 
                  placeholder="e.g. Shipped Interactive Alpha Sandbox" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                  className="rounded-xl text-xs" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Description</Label>
                <Textarea 
                  placeholder="What was built or validated? Be specific about outcomes..." 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  required 
                  className="rounded-xl text-xs" 
                  rows={3} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Status</Label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full p-2 bg-input border border-border rounded-xl text-xs text-foreground"
                  >
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Date</Label>
                  <Input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    className="rounded-xl text-xs" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Measured Metric (Optional)</Label>
                  <Input 
                    placeholder="e.g. 50 active testers" 
                    value={metric} 
                    onChange={e => setMetric(e.target.value)} 
                    className="rounded-xl text-xs" 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Evidence Link (Optional)</Label>
                  <Input 
                    placeholder="https://github.com/..." 
                    value={evidenceLink} 
                    onChange={e => setEvidenceLink(e.target.value)} 
                    className="rounded-xl text-xs" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl font-bold text-xs">
                  Save Milestone
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
