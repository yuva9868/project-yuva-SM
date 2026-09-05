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
  NotificationItem 
} from '@/lib/community-types';
import { 
  getStoredProjects, 
  getStoredFeedback, 
  getStoredCollaborations,
  getStoredNotifications
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
  ArrowUpRight 
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

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const allProjects = getStoredProjects();
      const userProjects = allProjects.filter(p => p.founderId === user.id || p.founderUsername === user.email.split('@')[0]);
      setMyProjects(userProjects.length > 0 ? userProjects : [allProjects[0]]); // fallback to first mock project for demo

      const allFeedback = getStoredFeedback();
      setFeedbackReceived(allFeedback);

      const allCollabs = getStoredCollaborations(user.id);
      setCollaborations(allCollabs);

      const allNotifs = getStoredNotifications(user.id);
      setNotifications(allNotifs);
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

  // Aggregate metrics
  const totalViews = myProjects.reduce((acc, p) => acc + p.viewsCount, 0);
  const totalSupporters = myProjects.reduce((acc, p) => acc + p.supportersCount, 0);
  const totalPrototypeClicks = myProjects.reduce((acc, p) => acc + p.prototypeClicksCount, 0);

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-16">
      <Header />

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* User Header Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/20" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">Welcome back, {user.name}</h1>
              <p className="text-xs text-muted-foreground">Manage your startup projects, feedback, and collaboration proposals.</p>
            </div>
          </div>

          <Link href="/submit">
            <Button size="sm" className="gap-2 font-bold shadow-md shadow-primary/20 rounded-xl">
              <Plus className="w-4 h-4" />
              <span>Share New Project</span>
            </Button>
          </Link>
        </div>

        {/* High Level Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card border-border rounded-2xl space-y-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-primary" /> Total Views
            </span>
            <p className="text-2xl font-black text-foreground">{totalViews}</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +18% this week
            </span>
          </Card>

          <Card className="p-4 bg-card border-border rounded-2xl space-y-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" /> Supporters
            </span>
            <p className="text-2xl font-black text-foreground">{totalSupporters}</p>
            <span className="text-[10px] text-muted-foreground">Across all projects</span>
          </Card>

          <Card className="p-4 bg-card border-border rounded-2xl space-y-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-500" /> Prototype Clicks
            </span>
            <p className="text-2xl font-black text-foreground">{totalPrototypeClicks}</p>
            <span className="text-[10px] text-muted-foreground">Interactive demo trials</span>
          </Card>

          <Card className="p-4 bg-card border-border rounded-2xl space-y-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> Reputation
            </span>
            <p className="text-2xl font-black text-foreground">945 pts</p>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Top 5% Contributor</span>
          </Card>
        </div>

        {/* Dashboard Section Tabs */}
        <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1">
          {[
            { id: 'projects', label: 'My Projects', icon: Layers, badge: myProjects.length },
            { id: 'collaboration', label: 'Collaboration Requests', icon: Users, badge: collaborations.filter(c => c.status === 'pending').length },
            { id: 'feedback', label: 'Feedback Received', icon: Star, badge: feedbackReceived.length },
            { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.filter(n => !n.read).length },
            { id: 'reputation', label: 'Badges & Reputation', icon: Award },
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
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

        {/* TAB 1: MY PROJECTS & ANALYTICS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Your Startup Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myProjects.map(proj => (
                <Card key={proj.id} className="p-6 bg-card border-border rounded-2xl space-y-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{proj.category}</span>
                      <h3 className="text-xl font-bold text-foreground">{proj.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{proj.tagline}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
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
                      <span className="font-bold text-foreground block">{proj.prototypeClicksCount}</span>
                      <span className="text-[10px] text-muted-foreground">Demo Clicks</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <Link href={`/community/${proj.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold rounded-xl">
                        <span>Open Details Page</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Link href={`/report/${proj.id}`}>
                      <Button size="sm" variant="secondary" className="gap-1.5 text-xs font-bold rounded-xl">
                        <BarChart3 className="w-3.5 h-3.5 text-primary" />
                        <span>AI Validation Report</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: COLLABORATION REQUESTS INBOX */}
        {activeTab === 'collaboration' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Incoming & Outgoing Collaboration Proposals</h2>
            {collaborations.length === 0 ? (
              <Card className="p-12 text-center border-dashed rounded-2xl">
                <p className="text-sm text-muted-foreground">No active collaboration requests.</p>
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
                          <p className="text-xs text-primary font-semibold">Role Offered: {collab.role} for project {collab.projectTitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {collab.status === 'pending' ? (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateCollabStatus(collab.id, 'declined')} className="text-xs text-rose-500 hover:bg-rose-50 rounded-xl">
                              <X className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </Button>
                            <Button size="sm" onClick={() => handleUpdateCollabStatus(collab.id, 'accepted')} className="text-xs font-bold gap-1 rounded-xl">
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept & Connect</span>
                            </Button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            collab.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                          }`}>
                            Status: {collab.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-xl text-xs text-foreground/90 font-medium">
                      &quot;{collab.message}&quot;
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FEEDBACK RECEIVED */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Feedback Dashboard</h2>
            {feedbackReceived.length === 0 ? (
              <Card className="p-12 text-center border-dashed rounded-2xl">
                <p className="text-sm text-muted-foreground">No structured feedback received yet.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {feedbackReceived.map(fb => (
                  <Card key={fb.id} className="p-6 bg-card border-border rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={fb.userAvatar} alt={fb.userName} className="w-8 h-8 rounded-full border" />
                        <span className="font-bold text-xs text-foreground">{fb.userName}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-muted/40 rounded-xl">
                        <span className="font-bold text-primary block">Improvements</span>
                        <p>{fb.writtenImprovement}</p>
                      </div>
                      <div className="p-3 bg-muted/40 rounded-xl">
                        <span className="font-bold text-amber-500 block">Concerns</span>
                        <p>{fb.writtenConcerns}</p>
                      </div>
                      <div className="p-3 bg-muted/40 rounded-xl">
                        <span className="font-bold text-emerald-500 block">Use Case</span>
                        <p>{fb.writtenUseReason}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: REPUTATION & BADGES */}
        {activeTab === 'reputation' && (
          <div className="space-y-6">
            <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Community Reputation & Trust</h2>
                  <p className="text-xs text-muted-foreground">Reputation is earned through constructive feedback, quality projects, and successful collaborations.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-muted/40 rounded-xl space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Top Contributor Badge</span>
                  <p className="text-sm font-bold text-foreground">Unlocked ✓</p>
                </div>
                <div className="p-4 bg-muted/40 rounded-xl space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Helpful Reviewer Badge</span>
                  <p className="text-sm font-bold text-foreground">Unlocked ✓</p>
                </div>
                <div className="p-4 bg-muted/40 rounded-xl space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Verified Founder Badge</span>
                  <p className="text-sm font-bold text-foreground">Active ✓</p>
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
