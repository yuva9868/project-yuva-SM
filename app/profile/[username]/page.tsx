'use client';

import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FounderProfile, Project, VerificationRequest } from '@/lib/community-types';
import { 
  INITIAL_FOUNDERS, 
  getStoredProjects, 
  getStoredFounders, 
  saveStoredFounderProfile,
  saveStoredVerificationRequest,
  saveStoredNotification
} from '@/lib/community-data';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Award, 
  MapPin, 
  Globe, 
  Github, 
  Twitter, 
  Linkedin, 
  Users, 
  Plus, 
  CheckCircle2, 
  Briefcase, 
  Layers, 
  Heart, 
  MessageCircle, 
  Eye, 
  ExternalLink, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Quote, 
  Settings, 
  X, 
  Check, 
  Sparkles,
  Milestone as MilestoneIcon
} from 'lucide-react';

export default function FounderProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const username = params.username as string;

  const [founder, setFounder] = useState<FounderProfile | null>(null);
  const [founderProjects, setFounderProjects] = useState<Project[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Verification request form state
  const [verifyType, setVerifyType] = useState<VerificationRequest['type']>('skill');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifySubmitted, setVerifySubmitted] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    const allFounders = getStoredFounders();
    const found = allFounders.find(f => f.username.toLowerCase() === username?.toLowerCase());
    
    if (found) {
      setFounder(found);
    } else if (user) {
      const mockFounder: FounderProfile = {
        id: user.id,
        username: user.email.split('@')[0],
        name: user.name,
        avatar: user.avatar || `https://avatar.vercel.sh/${user.email}?s=96`,
        bio: 'Building innovative tools and exploring startup opportunities on IdeaCheck AI.',
        location: 'San Francisco, CA',
        skills: ['TypeScript', 'Next.js', 'React', 'Product Design'],
        interests: ['AI/ML', 'SaaS', 'DevTools'],
        projectsCount: 1,
        experience: 'Founder & Full-stack builder.',
        education: 'BS in Computer Science',
        links: {
          github: 'https://github.com',
          linkedin: 'https://linkedin.com',
        },
        followersCount: 142,
        followingCount: 68,
        collaborationStatus: 'Open to connecting with developers & investors',
        collaborationInterests: ['Co-founder', 'Developer', 'Investor'],
        reputationScore: 520,
        badges: ['Builder', 'Top Contributor', 'Verified Skill'],
        verifiedType: 'Founder',
        credibility: {
          identity: 'verified',
          skill: 'verified',
          portfolio: 'pending',
          completedCollaborationsCount: 2,
          confirmedMilestonesCount: 3,
          helpfulFeedbackCount: 8,
          mentoringContributionsCount: 1,
        },
        endorsements: [],
        profileCompletionPercentage: 85,
        privacySettings: {
          showEmail: false,
          showLocation: true,
          showLinks: true,
          showMilestones: true,
        }
      };
      setFounder(mockFounder);
    }

    const projects = getStoredProjects();
    const fp = projects.filter(p => 
      p.founderUsername.toLowerCase() === username?.toLowerCase() || 
      p.founderId === (found ? found.id : user?.id)
    );
    setFounderProjects(fp);
  }, [username, user]);

  if (!founder) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 text-center max-w-md mx-auto space-y-4">
          <p className="text-muted-foreground">Founder profile not found.</p>
          <Link href="/community">
            <Button variant="outline">Back to Community</Button>
          </Link>
        </div>
      </main>
    );
  }

  const isSelf = user?.id === founder.id || (user && user.email.split('@')[0] === founder.username);
  const credibility = founder.credibility || {
    identity: 'not_verified',
    skill: 'not_verified',
    portfolio: 'not_verified',
    completedCollaborationsCount: 0,
    confirmedMilestonesCount: 0,
    helpfulFeedbackCount: 0,
    mentoringContributionsCount: 0,
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    showToast(isFollowing ? `Unfollowed ${founder.name}` : `Following ${founder.name}!`);
  };

  const handleRequestVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceUrl.trim()) return;

    const req: VerificationRequest = {
      id: 'ver_' + Math.random().toString(36).substring(2, 9),
      userId: founder.id,
      userName: founder.name,
      type: verifyType,
      evidenceUrl,
      notes: verifyNotes,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    saveStoredVerificationRequest(req);
    setVerifySubmitted(true);
    showToast('Verification request submitted for admin review!');
  };

  const completionPct = founder.profileCompletionPercentage || 85;

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-16">
      <Header />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        {/* Profile Header Banner */}
        <Card className="p-6 sm:p-8 bg-card border-border rounded-2xl shadow-lg space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={founder.avatar}
                alt={founder.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-primary/20 shadow-md"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground">{founder.name}</h1>
                  {founder.verifiedType && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {founder.verifiedType}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-muted-foreground">@{founder.username}</p>
                {founder.location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{founder.location}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              {isSelf ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setVerifyModalOpen(true)}
                    className="gap-2 font-bold rounded-xl text-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>Request Verification</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPrivacyModalOpen(true)}
                    className="rounded-xl text-muted-foreground hover:text-foreground"
                    title="Privacy Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant={isFollowing ? 'outline' : 'default'}
                  onClick={handleFollowToggle}
                  className="gap-2 font-bold rounded-xl text-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isFollowing ? 'Following' : 'Follow Founder'}</span>
                </Button>
              )}

              <Link href="/submit">
                <Button className="gap-2 font-bold rounded-xl text-xs shadow-md shadow-primary/20">
                  <Plus className="w-4 h-4" />
                  <span>Share New Project</span>
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-sm text-foreground/90 leading-relaxed font-medium">
            {founder.bio}
          </p>

          {/* Social Links Bar */}
          {founder.links && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {founder.links.github && (
                <a href={founder.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              )}
              {founder.links.linkedin && (
                <a href={founder.links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                  <span>LinkedIn</span>
                </a>
              )}
              {founder.links.twitter && (
                <a href={founder.links.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="w-3.5 h-3.5 text-sky-400" />
                  <span>Twitter</span>
                </a>
              )}
              {founder.links.website && (
                <a href={founder.links.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Website</span>
                </a>
              )}
            </div>
          )}

          {/* Profile Completion Bar */}
          {isSelf && (
            <div className="p-3.5 bg-muted/30 border border-border/50 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Founder Credibility Passport Completion</span>
                <span className="font-extrabold text-primary">{completionPct}%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${completionPct}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tip: Add professional endorsements and submit verification evidence to increase investor and collaborator trust.
              </p>
            </div>
          )}

          {/* Badges & Stats Bar */}
          <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-extrabold flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Reputation: {founder.reputationScore} pts</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {founder.badges.map((b) => (
                  <span key={b} className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-secondary text-foreground border border-border">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
              <span><strong>{founder.followersCount}</strong> Followers</span>
              <span><strong>{founder.followingCount}</strong> Following</span>
              <span><strong>{founderProjects.length}</strong> Projects</span>
            </div>
          </div>
        </Card>

        {/* SECTION 2: FOUNDER CREDIBILITY PANEL */}
        <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-foreground">Credibility Passport & Evidence Indicators</h3>
            </div>
            <span className="text-xs text-muted-foreground">Independently verified track record</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
            {/* Identity */}
            <div className="p-3.5 bg-muted/30 border border-border/60 rounded-xl space-y-1">
              <span className="text-muted-foreground text-[11px] block">Identity Verification</span>
              <span className={`inline-flex items-center gap-1 font-bold ${
                credibility.identity === 'verified' ? 'text-emerald-400' :
                credibility.identity === 'pending' ? 'text-amber-400' : 'text-muted-foreground'
              }`}>
                {credibility.identity === 'verified' && <Check className="w-3.5 h-3.5" />}
                {credibility.identity === 'pending' && <Clock className="w-3.5 h-3.5" />}
                <span className="capitalize">{credibility.identity.replace('_', ' ')}</span>
              </span>
            </div>

            {/* Skill */}
            <div className="p-3.5 bg-muted/30 border border-border/60 rounded-xl space-y-1">
              <span className="text-muted-foreground text-[11px] block">Technical Skill Status</span>
              <span className={`inline-flex items-center gap-1 font-bold ${
                credibility.skill === 'verified' ? 'text-emerald-400' :
                credibility.skill === 'pending' ? 'text-amber-400' : 'text-muted-foreground'
              }`}>
                {credibility.skill === 'verified' && <Check className="w-3.5 h-3.5" />}
                <span className="capitalize">{credibility.skill.replace('_', ' ')}</span>
              </span>
            </div>

            {/* Collaborations */}
            <div className="p-3.5 bg-muted/30 border border-border/60 rounded-xl space-y-1">
              <span className="text-muted-foreground text-[11px] block">Completed Collaborations</span>
              <span className="text-base font-black text-primary block">
                {credibility.completedCollaborationsCount} projects
              </span>
            </div>

            {/* Confirmed Milestones */}
            <div className="p-3.5 bg-muted/30 border border-border/60 rounded-xl space-y-1">
              <span className="text-muted-foreground text-[11px] block">Confirmed Milestones</span>
              <span className="text-base font-black text-foreground block">
                {credibility.confirmedMilestonesCount} shipped
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2 text-xs">
            <div className="p-3 bg-muted/20 rounded-xl flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Helpful Feedback Given:</span>
              <span className="font-bold text-foreground">{credibility.helpfulFeedbackCount} reviews</span>
            </div>
            <div className="p-3 bg-muted/20 rounded-xl flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Mentoring Contributions:</span>
              <span className="font-bold text-foreground">{credibility.mentoringContributionsCount} sessions</span>
            </div>
            <div className="p-3 bg-muted/20 rounded-xl flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Portfolio Verification:</span>
              <span className="font-bold capitalize text-primary">{credibility.portfolio.replace('_', ' ')}</span>
            </div>
          </div>
        </Card>

        {/* SECTION 3: COLLABORATOR ENDORSEMENTS & REFERENCES */}
        {founder.endorsements && founder.endorsements.length > 0 && (
          <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <Quote className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">Peer References & Collaborator Endorsements</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {founder.endorsements.map(end => (
                <div key={end.id} className="p-4 bg-muted/30 border border-border/60 rounded-xl space-y-3 text-xs">
                  <p className="text-foreground/90 italic leading-relaxed">"{end.content}"</p>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <img src={end.endorserAvatar} alt={end.endorserName} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <span className="font-bold text-foreground block">{end.endorserName}</span>
                        <span className="text-[10px] text-muted-foreground">{end.relationship}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-primary">{end.skillOrProject}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* SECTION 4: PROJECTS & SKILLS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Created Projects */}
            <div className="space-y-4">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Active Projects by {founder.name} ({founderProjects.length})
              </h2>

              {founderProjects.length === 0 ? (
                <Card className="p-8 text-center border-dashed rounded-2xl">
                  <p className="text-xs text-muted-foreground">No public projects created yet.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {founderProjects.map(proj => (
                    <Card key={proj.id} className="p-5 bg-card border-border hover:border-primary/50 transition-all rounded-2xl space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link href={`/community/${proj.id}`} className="font-bold text-base text-foreground hover:text-primary transition-colors">
                            {proj.name}
                          </Link>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{proj.tagline}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                          {proj.stage}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500" /> {proj.supportersCount}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {proj.commentsCount}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {proj.viewsCount}</span>
                        </div>
                        <Link href={`/community/${proj.id}`}>
                          <Button size="sm" variant="ghost" className="gap-1 text-xs font-bold">
                            <span>Inspect Project</span>
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Skills & Collaboration */}
          <div className="space-y-6">
            {/* Collaboration Status */}
            <Card className="p-6 bg-card border-border rounded-2xl space-y-3 border-l-4 border-l-primary">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Collaboration Readiness</h3>
              <p className="text-xs font-semibold text-foreground">{founder.collaborationStatus}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {founder.collaborationInterests.map(ci => (
                  <span key={ci} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary">
                    Open to: {ci}
                  </span>
                ))}
              </div>
            </Card>

            {/* Technical Skills */}
            <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Technical Skills & Stacks</h3>
                <div className="flex flex-wrap gap-1.5">
                  {founder.skills.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-foreground">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Industry Interests</h3>
                <div className="flex flex-wrap gap-1.5">
                  {founder.interests.map(i => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground">
                      {i}
                    </span>
                  ))}
                </div>
              </div>

              {founder.experience && (
                <div className="pt-2 border-t border-border/40 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Experience</span>
                  <p className="text-muted-foreground">{founder.experience}</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* MODAL: Request Verification */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Submit Credibility Verification Proof</h3>
              </div>
              <button onClick={() => setVerifyModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            {verifySubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-foreground">Verification Queued</h4>
                <p className="text-xs text-muted-foreground">
                  Our ecosystem reviewers and administrators will verify your evidence URL within 24-48 hours.
                </p>
                <Button onClick={() => { setVerifyModalOpen(false); setVerifySubmitted(false); }} className="rounded-xl font-bold text-xs">
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRequestVerification} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Verification Area</Label>
                  <select 
                    value={verifyType} 
                    onChange={e => setVerifyType(e.target.value as any)}
                    className="w-full p-2 bg-input border border-border rounded-xl text-xs text-foreground"
                  >
                    <option value="skill">Technical Skill (GitHub commits / repos)</option>
                    <option value="identity">Founder Identity (LinkedIn / Government profile)</option>
                    <option value="portfolio">Portfolio Track Record (Live production apps)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Proof / Evidence URL</Label>
                  <Input 
                    placeholder="https://github.com/... or https://linkedin.com/in/..." 
                    value={evidenceUrl} 
                    onChange={e => setEvidenceUrl(e.target.value)} 
                    required 
                    className="rounded-xl text-xs" 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Verification Notes</Label>
                  <Textarea 
                    placeholder="Describe your role, contribution, and any context for the reviewer..." 
                    value={verifyNotes} 
                    onChange={e => setVerifyNotes(e.target.value)} 
                    rows={3} 
                    className="rounded-xl text-xs" 
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setVerifyModalOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                  <Button type="submit" className="rounded-xl font-bold text-xs">Submit Request</Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* MODAL: Privacy Controls */}
      {privacyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-card border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">Profile Privacy Preferences</h3>
              <button onClick={() => setPrivacyModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground">Control which fields are visible to unregistered guests.</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-primary" />
                <span>Show City Location publicly</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-primary" />
                <span>Show Portfolio & Social Links</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-primary" />
                <span>Display Shipped Milestones on Passport</span>
              </label>
            </div>
            <div className="flex justify-end pt-2 border-t border-border">
              <Button onClick={() => { setPrivacyModalOpen(false); showToast('Privacy preferences saved.'); }} className="rounded-xl text-xs font-bold">
                Save Preferences
              </Button>
            </div>
          </Card>
        </div>
      )}

      <MobileNav />
    </main>
  );
}
