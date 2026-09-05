'use client';

import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FounderProfile, Project } from '@/lib/community-types';
import { INITIAL_FOUNDERS, getStoredProjects } from '@/lib/community-data';
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
  ExternalLink
} from 'lucide-react';

export default function FounderProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const username = params.username as string;

  const [founder, setFounder] = useState<FounderProfile | null>(null);
  const [founderProjects, setFounderProjects] = useState<Project[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    // Find founder profile from initial list or fallback created from user
    const found = INITIAL_FOUNDERS.find(f => f.username.toLowerCase() === username?.toLowerCase());
    
    if (found) {
      setFounder(found);
    } else if (user) {
      setFounder({
        id: user.id,
        username: user.email.split('@')[0],
        name: user.name,
        avatar: user.avatar || `https://avatar.vercel.sh/${user.email}?s=96`,
        bio: 'Building innovative tools and exploring startup opportunities.',
        location: 'San Francisco, CA',
        skills: ['Next.js', 'React', 'TypeScript', 'Product Design'],
        interests: ['AI/ML', 'SaaS', 'DevTools'],
        projectsCount: 1,
        experience: 'Founder & Full-stack builder.',
        links: {},
        followersCount: 142,
        followingCount: 68,
        collaborationStatus: 'Open to connecting with developers & investors',
        collaborationInterests: ['Co-founder', 'Developer', 'Investor'],
        reputationScore: 420,
        badges: ['Verified Founder', 'Builder'],
        verifiedType: 'Founder',
      });
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

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-16">
      <Header />

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
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{founder.location}</span>
                </p>
              </div>
            </div>

            {/* Follow & Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant={isFollowing ? 'outline' : 'default'}
                onClick={() => setIsFollowing(!isFollowing)}
                className="gap-2 font-bold rounded-xl"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isFollowing ? 'Following' : 'Follow Founder'}</span>
              </Button>

              <Link href="/submit">
                <Button variant="outline" className="gap-2 font-bold rounded-xl">
                  <Plus className="w-4 h-4" />
                  <span>Propose Project</span>
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-sm text-foreground/90 leading-relaxed font-medium">
            {founder.bio}
          </p>

          {/* Reputation Score & Badges */}
          <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-extrabold flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Reputation Score: {founder.reputationScore} pts</span>
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

        {/* Status & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Created Projects */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Projects by {founder.name}
              </h2>

              {founderProjects.length === 0 ? (
                <Card className="p-8 text-center border-dashed rounded-2xl">
                  <p className="text-sm text-muted-foreground">No public projects created yet.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {founderProjects.map(proj => (
                    <Card key={proj.id} className="p-5 bg-card border-border hover:border-primary/50 transition-all rounded-2xl space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link href={`/community/${proj.id}`} className="font-bold text-lg text-foreground hover:text-primary transition-colors">
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
                            <span>View</span>
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Collaboration Status</h3>
              <p className="text-xs font-semibold text-foreground">{founder.collaborationStatus}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {founder.collaborationInterests.map(ci => (
                  <span key={ci} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary">
                    Need: {ci}
                  </span>
                ))}
              </div>
            </Card>

            {/* Skills & Interests */}
            <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Technical Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {founder.skills.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-foreground">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Interests</h3>
                <div className="flex flex-wrap gap-1.5">
                  {founder.interests.map(i => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground">
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <MobileNav />
    </main>
  );
}
