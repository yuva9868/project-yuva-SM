'use client';

import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { 
  Project, 
  StructuredFeedback, 
  CollaborationRequest, 
  NotificationItem,
  ValidationCampaign,
  WorkspaceTask,
  MentorSessionRequest 
} from '@/lib/community-types';
import { 
  getStoredProjects, 
  getStoredFeedback, 
  getStoredCollaborations,
  getStoredNotifications,
  getStoredCampaigns,
  getStoredWorkspaceTasks,
  getStoredMentorRequests
} from '@/lib/community-data';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { 
  Layers, 
  Star, 
  Users, 
  Bell, 
  Bookmark, 
  Award, 
  Plus, 
  Eye, 
  Heart, 
  MessageSquare, 
  Check, 
  X, 
  ExternalLink, 
  BarChart3, 
  TrendingUp, 
  ArrowUpRight,
  FlaskConical,
  Calendar,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

function DashboardContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'projects';

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [feedbackReceived, setFeedbackReceived] = useState<StructuredFeedback[]>([]);
  const [collaborations, setCollaborations] = useState<CollaborationRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [campaigns, setCampaigns] = useState<ValidationCampaign[]>([]);
  const [workspaceTasks, setWorkspaceTasks] = useState<WorkspaceTask[]>([]);
  const [mentorRequests, setMentorRequests] = useState<MentorSessionRequest[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const allProjects = getStoredProjects();
      const userProjects = allProjects.filter(p => p.founderId === user.id || p.founderUsername === user.email.split('@')[0]);
      setMyProjects(userProjects.length > 0 ? userProjects : [allProjects[0]]);

      const allFeedback = getStoredFeedback();
      setFeedbackReceived(allFeedback);

      const allCollabs = getStoredCollaborations();
      setCollaborations(allCollabs);

      const allNotifs = getStoredNotifications(user.id);
      setNotifications(allNotifs);

      const allCamps = getStoredCampaigns();
      setCampaigns(allCamps);

      const allTasks = allProjects.flatMap(p => getStoredWorkspaceTasks(p.id));
      setWorkspaceTasks(allTasks);

      const allMentorReqs = getStoredMentorRequests(user.id);
      setMentorRequests(allMentorReqs);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading User Workspace...</div>;
  }

  const handleUpdateCollabStatus = (id: string, newStatus: 'accepted' | 'declined') => {
    const updated = collaborations.map(c => c.id === id ? { ...c, status: newStatus } : c);
    setCollaborations(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ideacheck_community_collaborations', JSON.stringify(updated));
    }
  };

  const handleMarkAllNotifsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ideacheck_community_notifications', JSON.stringify(updated));
    }
  };

  // Aggregate metrics
  const totalViews = myProjects.reduce((acc, p) => acc + p.viewsCount, 0);
  const totalSupporters = myProjects.reduce((acc, p) => acc + p.supportersCount, 0);
  const totalPrototypeClicks = myProjects.reduce((acc, p) => acc + p.prototypeClicksCount, 0);

  // Actionable priority items
  const pendingCollabs = collaborations.filter(c => c.status === 'pending');
  const unreadNotifs = notifications.filter(n => !n.read);
  const unansweredFeedback = feedbackReceived.filter(f => !f.ownerReply);

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-16">
      <Header />

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* User Header Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={user.avatar || `https://avatar.vercel.sh/${user.email}?s=96`} alt={user.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/20" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground">{user.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {user.role === 'admin' ? 'Ecosystem Admin' : 'Founder'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Founder & Project Command Center • Evidence-driven progress</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/profile/${user.email.split('@')[0]}`}>
              <Button variant="outline" size="sm" className="gap-2 font-bold rounded-xl text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Credibility Passport</span>
              </Button>
            </Link>
            <Link href="/submit">
              <Button size="sm" className="gap-2 font-bold shadow-md shadow-primary/20 rounded-xl text-xs">
                <Plus className="w-4 h-4" />
                <span>Share New Project</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Actionable Priority Banner */}
        {(pendingCollabs.length > 0 || unansweredFeedback.length > 0) && (
          <div className="p-4 bg-primary/10 border border-primary/25 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/20 text-primary shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-foreground">Actionable Ecosystem Tasks:</span>
                <p className="text-muted-foreground">
                  {pendingCollabs.length > 0 && `${pendingCollabs.length} pending collaboration requests awaiting your reply. `}
                  {unansweredFeedback.length > 0 && `${unansweredFeedback.length} community reviews awaiting founder reply.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {pendingCollabs.length > 0 && (
                <Button size="sm" onClick={() => setActiveTab('collaboration')} className="rounded-xl font-bold text-[11px] h-8">
                  Review Proposals
                </Button>
              )}
            </div>
          </div>
        )}

        {/* High Level Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card border-border rounded-2xl space-y-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-primary" /> Total Project Views
            </span>
            <p className="text-2xl font-black text-foreground">{totalViews}</p>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +24% this week
            </span>
          </Card>

          <Card className="p-4 bg-card border-border rounded-2xl space-y-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" /> Supporters
            </span>
            <p className="text-2xl font-black text-foreground">{totalSupporters}</p>
            <span className="text-[10px] text-muted-foreground">Community backing</span>
          </Card>

          <Card className="p-4 bg-card border-border rounded-2xl space-y-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-400" /> Prototype Clicks
            </span>
            <p className="text-2xl font-black text-foreground">{totalPrototypeClicks}</p>
            <span className="text-[10px] text-muted-foreground">Interactive demo trials</span>
          </Card>

          <Card className="p-4 bg-card border-border rounded-2xl space-y-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> Reputation
            </span>
            <p className="text-2xl font-black text-foreground">945 pts</p>
            <span className="text-[10px] text-amber-500 font-bold">Top 5% Contributor</span>
          </Card>
        </div>

        {/* Dashboard Section Tabs */}
        <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1 text-xs">
          {[
            { id: 'projects', label: 'My Projects', icon: Layers, badge: myProjects.length },
            { id: 'campaigns', label: 'Validation Lab', icon: FlaskConical, badge: campaigns.length },
            { id: 'collaboration', label: 'Collaboration Proposals', icon: Users, badge: pendingCollabs.length },
            { id: 'feedback', label: 'Feedback Stream', icon: Star, badge: feedbackReceived.length },
            { id: 'workspace', label: 'Workspace Tasks', icon: CheckCircle2, badge: workspaceTasks.length },
            { id: 'mentorship', label: 'Office Hours', icon: Calendar, badge: mentorRequests.length },
            { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs.length },
            { id: 'reputation', label: 'Reputation & Badges', icon: Award },
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                  isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-background/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: MY PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Your Startup Projects</h2>
              <Link href="/submit">
                <Button size="sm" className="rounded-xl text-xs font-bold gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Startup</span>
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myProjects.map(proj => (
                <Card key={proj.id} className="p-6 bg-card border-border rounded-2xl space-y-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{proj.category}</span>
                      <h3 className="text-lg font-bold text-foreground">{proj.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{proj.tagline}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                      {proj.stage}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 bg-muted/40 rounded-xl">
                    <div>
                      <span className="font-bold text-foreground block">{proj.viewsCount}</span>
                      <span className="text-[10px] text-muted-foreground">Views</span>
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">{proj.supportersCount}</span>
                      <span className="text-[10px] text-muted-foreground">Supporters</span>
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">{proj.validationScore}/100</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Score</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <Link href={`/community/${proj.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold rounded-xl">
                        <span>View Project Page</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Link href={`/report/${proj.id}`}>
                      <Button size="sm" variant="secondary" className="gap-1.5 text-xs font-bold rounded-xl">
                        <BarChart3 className="w-3.5 h-3.5 text-primary" />
                        <span>AI Analysis Report</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: VALIDATION CAMPAIGNS */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-foreground">Validation Experiments & Campaigns</h2>
            <div className="grid gap-4">
              {campaigns.map(camp => (
                <Card key={camp.id} className="p-5 bg-card border-border rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase">
                          {camp.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-foreground">{camp.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{camp.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <span className="font-bold text-primary">{camp.completedTestsCount || camp.submissions?.length || 0} Responses</span>
                      <Link href={`/community/${camp.projectId}`}>
                        <Button size="sm" variant="outline" className="rounded-xl text-xs">
                          Inspect Lab
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COLLABORATION PROPOSALS */}
        {activeTab === 'collaboration' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-foreground">Collaboration Proposals Inbox</h2>
            {collaborations.length === 0 ? (
              <Card className="p-10 text-center border-dashed rounded-2xl">
                <p className="text-xs text-muted-foreground">No active collaboration requests.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {collaborations.map(collab => (
                  <Card key={collab.id} className="p-6 bg-card border-border rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={collab.senderAvatar} alt={collab.senderName} className="w-10 h-10 rounded-full object-cover border" />
                        <div>
                          <p className="font-bold text-sm text-foreground">{collab.senderName} <span className="text-xs text-muted-foreground">(@{collab.senderUsername})</span></p>
                          <p className="text-xs text-primary font-semibold">Desired Role: {collab.role} on {collab.projectTitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {collab.status === 'pending' ? (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateCollabStatus(collab.id, 'declined')} className="text-xs text-rose-500 rounded-xl">
                              <X className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </Button>
                            <Button size="sm" onClick={() => handleUpdateCollabStatus(collab.id, 'accepted')} className="text-xs font-bold gap-1 rounded-xl">
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept & Unlock Workspace</span>
                            </Button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            collab.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'
                          }`}>
                            Status: {collab.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 bg-muted/30 border border-border/40 rounded-xl text-xs space-y-1.5">
                      {collab.reasonForReachingOut && (
                        <p><strong className="text-foreground">Reason:</strong> {collab.reasonForReachingOut}</p>
                      )}
                      {collab.proposedContribution && (
                        <p><strong className="text-foreground">Proposed Contribution:</strong> {collab.proposedContribution}</p>
                      )}
                      {collab.availabilityCommitment && (
                        <p><strong className="text-foreground">Commitment:</strong> {collab.availabilityCommitment}</p>
                      )}
                      <p className="text-foreground/90 italic pt-1">&quot;{collab.message}&quot;</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FEEDBACK STREAM */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-foreground">Structured Reviews Received</h2>
            {feedbackReceived.length === 0 ? (
              <Card className="p-10 text-center border-dashed rounded-2xl">
                <p className="text-xs text-muted-foreground">No structured feedback received yet.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {feedbackReceived.map(fb => (
                  <Card key={fb.id} className="p-6 bg-card border-border rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img src={fb.userAvatar} alt={fb.userName} className="w-7 h-7 rounded-full border" />
                        <span className="font-bold text-foreground">{fb.userName}</span>
                      </div>
                      <span className="text-muted-foreground">{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-muted/40 rounded-xl">
                        <span className="font-bold text-primary block">Works Well</span>
                        <p>{fb.whatWorksWell || fb.writtenUseReason}</p>
                      </div>
                      <div className="p-3 bg-muted/40 rounded-xl">
                        <span className="font-bold text-amber-500 block">Friction</span>
                        <p>{fb.whatIsConfusing || fb.writtenConcerns}</p>
                      </div>
                      <div className="p-3 bg-muted/40 rounded-xl">
                        <span className="font-bold text-emerald-400 block">Improvements</span>
                        <p>{fb.whatWouldImprove || fb.writtenImprovement}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: WORKSPACE TASKS */}
        {activeTab === 'workspace' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-foreground">Workspace Tasks Across Your Projects</h2>
            <div className="grid md:grid-cols-3 gap-3 text-xs">
              {workspaceTasks.map(task => (
                <Card key={task.id} className="p-4 bg-card border-border rounded-xl space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-foreground">{task.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      task.status === 'done' ? 'bg-emerald-500/10 text-emerald-400' :
                      task.status === 'in_progress' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  {task.description && <p className="text-muted-foreground">{task.description}</p>}
                  <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                    Assignee: {task.assigneeName || 'Unassigned'}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: OFFICE HOURS & MENTORSHIP */}
        {activeTab === 'mentorship' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Mentorship & Office Hours Sessions</h2>
              <Link href="/mentors">
                <Button size="sm" className="rounded-xl text-xs font-bold">Browse Mentors</Button>
              </Link>
            </div>

            {mentorRequests.length === 0 ? (
              <Card className="p-10 text-center border-dashed rounded-2xl">
                <p className="text-xs text-muted-foreground">No active mentorship session requests. Explore our verified mentor network!</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {mentorRequests.map(m => (
                  <Card key={m.id} className="p-4 bg-card border-border rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-foreground">Session with {m.mentorName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary uppercase font-bold">
                        {m.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground"><strong className="text-foreground">Topic:</strong> {m.topic}</p>
                    <p className="text-muted-foreground"><strong className="text-foreground">Preferred Time:</strong> {m.preferredTime}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Notifications & Activity Feed</h2>
              <Button size="sm" variant="outline" onClick={handleMarkAllNotifsRead} className="rounded-xl text-xs">
                Mark all as read
              </Button>
            </div>

            <div className="space-y-2.5">
              {notifications.map(n => (
                <div key={n.id} className={`p-4 rounded-xl border text-xs transition-colors flex items-start justify-between gap-3 ${
                  n.read ? 'bg-card border-border/60 text-muted-foreground' : 'bg-primary/5 border-primary/20 text-foreground font-medium'
                }`}>
                  <div>
                    <span className="font-bold block text-foreground">{n.title}</span>
                    <p className="text-muted-foreground mt-0.5">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: REPUTATION & BADGES */}
        {activeTab === 'reputation' && (
          <div className="space-y-6">
            <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Reputation & Earned Badges</h2>
                  <p className="text-xs text-muted-foreground">Earned through verified milestone delivery, structured peer feedback, and completed collaborations.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-xs">
                <div className="p-4 bg-muted/30 border border-border/50 rounded-xl space-y-1">
                  <span className="font-bold text-foreground block">Verified Founder Badge</span>
                  <p className="text-emerald-400 font-semibold">Active ✓ (Milestones verified)</p>
                </div>
                <div className="p-4 bg-muted/30 border border-border/50 rounded-xl space-y-1">
                  <span className="font-bold text-foreground block">Helpful Reviewer Badge</span>
                  <p className="text-emerald-400 font-semibold">Active ✓ (8+ helpful upvotes)</p>
                </div>
                <div className="p-4 bg-muted/30 border border-border/50 rounded-xl space-y-1">
                  <span className="font-bold text-foreground block">Completed Collaborator</span>
                  <p className="text-primary font-semibold">Unlocked ✓ (2 projects shipped)</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <MobileNav />
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Workspace...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
