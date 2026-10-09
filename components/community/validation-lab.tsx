'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ValidationCampaign, 
  CampaignSubmission, 
  ValidationQuestion,
  Project 
} from '@/lib/community-types';
import { 
  getStoredCampaigns, 
  saveStoredCampaign, 
  submitCampaignResponse,
  saveStoredNotification 
} from '@/lib/community-data';
import { trackEvent } from '@/lib/analytics';
import { useAuth } from '@/lib/auth-context';
import { 
  FlaskConical, 
  Users, 
  CheckCircle2, 
  Plus, 
  Clock, 
  FileText, 
  Sparkles, 
  Download, 
  ChevronRight, 
  X, 
  BarChart, 
  Check, 
  Calendar 
} from 'lucide-react';

interface ValidationLabProps {
  project: Project;
  isOwner: boolean;
}

export function ValidationLab({ project, isOwner }: ValidationLabProps) {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<ValidationCampaign[]>(() => getStoredCampaigns(project.id));
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeTestCampaign, setActiveTestCampaign] = useState<ValidationCampaign | null>(null);
  const [selectedSubmissionsCampaign, setSelectedSubmissionsCampaign] = useState<ValidationCampaign | null>(null);
  
  // Test Taker State
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  // New Campaign Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ValidationCampaign['type']>('prototype_testing');
  const [newDesc, setNewDesc] = useState('');
  const [newAudience, setNewAudience] = useState('');
  const [newEligibility, setNewEligibility] = useState('');
  const [newQuestions, setNewQuestions] = useState<ValidationQuestion[]>([
    { id: 'q1', question: 'What was your first impression of the user experience?', type: 'rating' },
    { id: 'q2', question: 'Does this effectively solve your workflow pain point?', type: 'choice', options: ['Completely', 'Partially', 'Not at all'] },
    { id: 'q3', question: 'What missing feature would prevent you from using this daily?', type: 'text' }
  ]);
  const [creatingCampaign, setCreatingCampaign] = useState(false);

  const handleStartTest = (camp: ValidationCampaign) => {
    setActiveTestCampaign(camp);
    setAnswers({});
    setTestSuccess(false);
    trackEvent('campaign_joined', { campaignId: camp.id, campaignTitle: camp.title }, user?.id, project.id);
  };

  const handleAnswerChange = (qId: string, val: any) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmitTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTestCampaign) return;
    setSubmittingTest(true);

    const submission: CampaignSubmission = {
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      campaignId: activeTestCampaign.id,
      projectId: project.id,
      userId: user?.id || 'anon_' + Math.random().toString(36).substring(2, 6),
      userName: user?.name || 'Community Tester',
      answers,
      feedbackThemes: Object.values(answers).filter(v => typeof v === 'string').map(v => String(v).slice(0, 30)),
      createdAt: new Date().toISOString()
    };

    submitCampaignResponse(submission);
    trackEvent('campaign_completed', { campaignId: activeTestCampaign.id }, user?.id, project.id);

    // Notify founder
    saveStoredNotification({
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      userId: project.founderId,
      type: 'validation_response',
      title: 'New Validation Lab Test Completed',
      message: `${user?.name || 'A community tester'} submitted responses for "${activeTestCampaign.title}".`,
      link: `/community/${project.id}`,
      read: false,
      createdAt: new Date().toISOString()
    });

    setSubmittingTest(false);
    setTestSuccess(true);
    setCampaigns(getStoredCampaigns(project.id));
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreatingCampaign(true);

    const newCamp: ValidationCampaign = {
      id: 'camp_' + Math.random().toString(36).substring(2, 9),
      projectId: project.id,
      projectTitle: project.name,
      founderId: project.founderId,
      title: newTitle,
      type: newType,
      description: newDesc,
      targetAudience: newAudience,
      eligibilityCriteria: newEligibility,
      questions: newQuestions,
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      visitsCount: 1,
      signupsCount: 0,
      completedTestsCount: 0,
      submissions: []
    };

    saveStoredCampaign(newCamp);
    setCampaigns(getStoredCampaigns(project.id));
    setCreateModalOpen(false);
    setCreatingCampaign(false);
    // Reset form
    setNewTitle('');
    setNewDesc('');
  };

  const exportSubmissionsCSV = (camp: ValidationCampaign) => {
    if (!camp.submissions || camp.submissions.length === 0) return;
    const headers = ['Submission ID', 'Tester Name', 'Date', ...camp.questions.map(q => `"${q.question.replace(/"/g, '""')}"`)];
    const rows = camp.submissions.map(s => {
      const answersCol = camp.questions.map(q => `"${String(s.answers[q.id] || '').replace(/"/g, '""')}"`);
      return [s.id, `"${s.userName}"`, s.createdAt, ...answersCol].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${project.name.toLowerCase().replace(/\s+/g, '_')}_validation_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Lab Header & Founder Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-primary/5 border border-primary/20 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Real-World Validation Lab</h3>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl">
            Structured experiments designed to test customer willingness, prototype usability, and market demand with genuine participants.
          </p>
        </div>

        {isOwner && (
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2 font-bold rounded-xl shadow-md shadow-primary/20 shrink-0">
            <Plus className="w-4 h-4" />
            <span>Launch Validation Campaign</span>
          </Button>
        )}
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <Card className="p-12 text-center border-dashed rounded-2xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <FlaskConical className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">No active validation campaigns</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            The founder has not launched a validation experiment yet. When active, community members can test the prototype and submit evidence.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map(camp => (
            <Card key={camp.id} className="p-5 bg-card border-border rounded-2xl hover:border-primary/40 transition-all space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                      {camp.type.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active Campaign
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-foreground">{camp.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{camp.description}</p>
                </div>

                {/* Campaign Action */}
                <div className="flex items-center gap-2 shrink-0">
                  {isOwner && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedSubmissionsCampaign(camp)}
                      className="text-xs font-semibold rounded-xl gap-1.5"
                    >
                      <BarChart className="w-3.5 h-3.5 text-primary" />
                      <span>Responses ({camp.submissions?.length || 0})</span>
                    </Button>
                  )}

                  <Button 
                    size="sm" 
                    onClick={() => handleStartTest(camp)}
                    className="text-xs font-bold rounded-xl gap-1.5 shadow-sm"
                  >
                    <span>Participate & Test</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Campaign Metadata & Progress */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Target Audience</span>
                  <span className="font-medium text-foreground truncate block">{camp.targetAudience || 'Early Adopters'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Eligibility</span>
                  <span className="font-medium text-foreground truncate block">{camp.eligibilityCriteria || 'Open to all'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Tests Completed</span>
                  <span className="font-bold text-primary">{camp.completedTestsCount || camp.submissions?.length || 0} participants</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Started</span>
                  <span className="font-medium text-muted-foreground">{camp.startDate}</span>
                </div>
              </div>

              {/* Feedback Themes Preview if any */}
              {camp.feedbackThemes && camp.feedbackThemes.length > 0 && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Observed Themes:
                  </span>
                  {camp.feedbackThemes.map((theme, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-secondary text-[11px] text-secondary-foreground font-medium">
                      {theme}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* MODAL: Participate / Take Test */}
      {activeTestCampaign && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-card border-border rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-bold text-base text-foreground">{activeTestCampaign.title}</h3>
                  <p className="text-xs text-muted-foreground">Submit evidence-based usability and demand feedback</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTestCampaign(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {testSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground">Validation Response Submitted!</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Your answers were securely logged into the founder's Validation Lab. Thank you for helping build validated software!
                  </p>
                  <Button onClick={() => setActiveTestCampaign(null)} className="rounded-xl font-bold">
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitTest} className="space-y-6">
                  <div className="p-4 bg-muted/40 rounded-xl space-y-2 border border-border/60">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experiment Goal</h5>
                    <p className="text-xs text-foreground/90">{activeTestCampaign.description}</p>
                    <p className="text-[11px] text-primary font-medium">
                      Eligibility: {activeTestCampaign.eligibilityCriteria}
                    </p>
                  </div>

                  <div className="space-y-5">
                    {activeTestCampaign.questions.map((q, idx) => (
                      <div key={q.id} className="space-y-2 p-3.5 bg-secondary/30 rounded-xl border border-border/40">
                        <Label className="text-xs font-semibold text-foreground flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          {q.question}
                        </Label>

                        {q.type === 'rating' && (
                          <div className="flex items-center gap-2 pt-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                              <button
                                type="button"
                                key={val}
                                onClick={() => handleAnswerChange(q.id, val)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                  answers[q.id] === val
                                    ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/40'
                                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        )}

                        {q.type === 'choice' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {q.options?.map(opt => (
                              <button
                                type="button"
                                key={opt}
                                onClick={() => handleAnswerChange(q.id, opt)}
                                className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                                  answers[q.id] === opt
                                    ? 'bg-primary/10 border-primary text-primary font-bold'
                                    : 'bg-muted/50 border-border text-foreground hover:bg-muted'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}

                        {q.type === 'text' && (
                          <Textarea
                            placeholder="Provide honest, constructive feedback..."
                            value={answers[q.id] || ''}
                            onChange={e => handleAnswerChange(q.id, e.target.value)}
                            className="text-xs rounded-xl bg-background"
                            rows={3}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setActiveTestCampaign(null)} className="rounded-xl text-xs">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submittingTest} className="rounded-xl font-bold text-xs gap-1.5">
                      {submittingTest ? 'Submitting...' : 'Submit Validation Data'}
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: Founder Submissions & CSV Export */}
      {selectedSubmissionsCampaign && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl bg-card border-border rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-bold text-base text-foreground">Campaign Responses & Evidence</h3>
                  <p className="text-xs text-muted-foreground">{selectedSubmissionsCampaign.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => exportSubmissionsCSV(selectedSubmissionsCampaign)}
                  className="text-xs font-semibold rounded-xl gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span>Export CSV</span>
                </Button>
                <button 
                  onClick={() => setSelectedSubmissionsCampaign(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {(!selectedSubmissionsCampaign.submissions || selectedSubmissionsCampaign.submissions.length === 0) ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No submissions yet for this experiment.
                </div>
              ) : (
                selectedSubmissionsCampaign.submissions.map((sub, i) => (
                  <Card key={sub.id || i} className="p-4 bg-muted/30 border-border rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span>{sub.userName}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {selectedSubmissionsCampaign.questions.map(q => (
                        <div key={q.id}>
                          <span className="text-[11px] font-semibold text-muted-foreground block">{q.question}</span>
                          <span className="text-xs text-foreground font-medium">
                            {sub.answers[q.id] !== undefined ? String(sub.answers[q.id]) : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: Create Validation Campaign */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-xl bg-card border-border rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">Create Validation Experiment</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Experiment Title</Label>
                <Input 
                  placeholder="e.g. Prototype Usability & Speed Test" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  required 
                  className="rounded-xl text-xs" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Campaign Type</Label>
                <select 
                  value={newType} 
                  onChange={e => setNewType(e.target.value as any)}
                  className="w-full p-2.5 bg-input border border-border rounded-xl text-xs text-foreground"
                >
                  <option value="prototype_testing">Prototype Testing</option>
                  <option value="customer_interviews">Customer Interviews</option>
                  <option value="short_survey">Short Survey</option>
                  <option value="waitlist_recruitment">Waitlist Recruitment</option>
                  <option value="usability_testing">Usability Testing</option>
                  <option value="problem_validation">Problem Validation</option>
                  <option value="pricing_research">Pricing & Willingness-To-Pay Research</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Description & Objective</Label>
                <Textarea 
                  placeholder="Explain clearly what you want testers to try and evaluate..." 
                  value={newDesc} 
                  onChange={e => setNewDesc(e.target.value)} 
                  required 
                  className="rounded-xl text-xs" 
                  rows={3} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Target Audience</Label>
                  <Input 
                    placeholder="e.g. React Developers" 
                    value={newAudience} 
                    onChange={e => setNewAudience(e.target.value)} 
                    className="rounded-xl text-xs" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Eligibility Criteria</Label>
                  <Input 
                    placeholder="e.g. Active GitHub user" 
                    value={newEligibility} 
                    onChange={e => setNewEligibility(e.target.value)} 
                    className="rounded-xl text-xs" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={creatingCampaign} className="rounded-xl font-bold text-xs">
                  {creatingCampaign ? 'Launching...' : 'Publish Campaign'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
