'use client';

import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ModerationReport, VerificationRequest } from '@/lib/community-types';
import { 
  getStoredReports, 
  resolveReport, 
  dismissReport,
  getStoredVerificationRequests,
  updateVerificationRequestStatus,
  getStoredProjects,
  getStoredFeedback,
  getStoredCampaigns,
  getStoredCollaborations
} from '@/lib/community-data';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Check, 
  X, 
  Sparkles, 
  Users, 
  Layers, 
  Star, 
  FlaskConical, 
  ExternalLink,
  ShieldCheck,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

export default function AdminModerationPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'verifications'>('overview');

  // Metrics
  const [projectCount, setProjectCount] = useState(0);
  const [prototypeCount, setPrototypeCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [campaignCount, setCampaignCount] = useState(0);
  const [collabCount, setCollabCount] = useState(0);

  useEffect(() => {
    // Check admin or allow mock admin demo access
    if (!isLoading && user && user.role !== 'admin') {
      // In dev / investor review, we can let user view admin or sign in as admin
      // router.push('/');
    }

    setReports(getStoredReports());
    setVerificationRequests(getStoredVerificationRequests());

    const projs = getStoredProjects();
    setProjectCount(projs.length);
    setPrototypeCount(projs.filter(p => (p.prototypeMedia?.length || 0) > 0 || (p.prototypeLinks?.length || 0) > 0).length);
    setFeedbackCount(getStoredFeedback().length);
    setCampaignCount(getStoredCampaigns().length);
    setCollabCount(getStoredCollaborations().filter(c => c.status === 'accepted').length);
  }, [user, isLoading, router]);

  const handleResolve = (id: string) => {
    resolveReport(id);
    setReports(getStoredReports());
  };

  const handleDismiss = (id: string) => {
    dismissReport(id);
    setReports(getStoredReports());
  };

  const handleVerify = (id: string, status: 'approved' | 'rejected') => {
    updateVerificationRequestStatus(id, status);
    setVerificationRequests(getStoredVerificationRequests());
  };

  const pendingReports = reports.filter(r => r.status === 'pending');
  const pendingVerifications = verificationRequests.filter(v => v.status === 'pending');

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-16">
      <Header />

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">Admin Ecosystem Intelligence & Moderation</h1>
              <p className="text-xs text-muted-foreground">Monitor platform health, verify founder credentials, and protect community standards.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              Admin Mode Active
            </span>
          </div>
        </div>

        {/* Ecosystem Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <Card className="p-4 bg-card border-border rounded-2xl space-y-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" /> Active Startups
            </span>
            <p className="text-xl font-black text-foreground">{projectCount}</p>
          </Card>

          <Card className="p-4 bg-card border-border rounded-2xl space-y-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Prototypes Ready
            </span>
            <p className="text-xl font-black text-foreground">{prototypeCount}</p>
          </Card>

          <Card className="p-4 bg-card border-border rounded-2xl space-y-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" /> Total Reviews
            </span>
            <p className="text-xl font-black text-foreground">{feedbackCount}</p>
          </Card>

          <Card className="p-4 bg-card border-border rounded-2xl space-y-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-indigo-400" /> Validation Labs
            </span>
            <p className="text-xl font-black text-foreground">{campaignCount}</p>
          </Card>

          <Card className="p-4 bg-card border-border rounded-2xl space-y-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" /> Collaborations
            </span>
            <p className="text-xl font-black text-foreground">{collabCount}</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-1 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-bold rounded-xl transition-all ${
              activeTab === 'overview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            System Metrics
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'verifications' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verification Queue ({pendingVerifications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'moderation' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Reported Content ({pendingReports.length})</span>
          </button>
        </div>

        {/* TAB 1: SYSTEM OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-foreground">Platform Health & Evidence Quality</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                IdeaCheck AI enforces evidence-based startup credibility. Founders must demonstrate working prototypes, customer interview transcripts, or measurable validation metrics before receiving verification badges.
              </p>

              <div className="grid md:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-4 bg-muted/30 border border-border/50 rounded-xl space-y-1.5">
                  <span className="font-bold text-foreground block">Verified Founder Standards</span>
                  <p className="text-muted-foreground">
                    Requires verified identity, at least 1 working prototype demo, and 3+ corroborated milestone updates.
                  </p>
                </div>
                <div className="p-4 bg-muted/30 border border-border/50 rounded-xl space-y-1.5">
                  <span className="font-bold text-foreground block">Spam & Financial Promotion Filter</span>
                  <p className="text-muted-foreground">
                    Automated AI moderation analyzes new project submissions for unsolicited crypto tokens or get-rich-quick claims.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: VERIFICATION QUEUE */}
        {activeTab === 'verifications' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground">Pending Founder Verification Requests</h2>

            {verificationRequests.length === 0 ? (
              <Card className="p-10 text-center border-dashed rounded-2xl">
                <p className="text-xs text-muted-foreground">No verification requests queued.</p>
              </Card>
            ) : (
              verificationRequests.map(v => (
                <Card key={v.id} className="p-5 bg-card border-border rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground">{v.userName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase">
                          {v.type} verification
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{v.notes}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a href={v.evidenceUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1">
                          <span>Inspect Evidence</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>

                      {v.status === 'pending' ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleVerify(v.id, 'rejected')} className="text-xs text-rose-500 rounded-xl">
                            Reject
                          </Button>
                          <Button size="sm" onClick={() => handleVerify(v.id, 'approved')} className="text-xs font-bold gap-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white">
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Badge</span>
                          </Button>
                        </>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          v.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {v.status}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 3: MODERATION QUEUE */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground">Content Moderation & Spam Flags</h2>

            {reports.length === 0 ? (
              <Card className="p-10 text-center border-dashed rounded-2xl">
                <p className="text-xs text-muted-foreground">All moderation flags resolved.</p>
              </Card>
            ) : (
              reports.map(rep => (
                <Card key={rep.id} className="p-5 bg-card border-border rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground">{rep.targetTitle}</h3>
                        <p className="text-xs text-muted-foreground">Reported Reason: <span className="font-semibold text-foreground">{rep.reason}</span></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {rep.status === 'pending' ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleDismiss(rep.id)} className="text-xs rounded-xl">
                            <X className="w-3.5 h-3.5" />
                            <span>Dismiss</span>
                          </Button>
                          <Button size="sm" onClick={() => handleResolve(rep.id)} className="text-xs font-bold gap-1 bg-rose-500 hover:bg-rose-600 rounded-xl text-white">
                            <Check className="w-3.5 h-3.5" />
                            <span>Remove Content</span>
                          </Button>
                        </>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground">
                          {rep.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {rep.aiFlagReason && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs text-primary font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>{rep.aiFlagReason}</span>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      <MobileNav />
    </main>
  );
}
