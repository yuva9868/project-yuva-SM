'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Zap, BarChart3, Users, Brain, Mail } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function Home() {
  const { user } = useAuth();
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistError('');
    if (!waitlistEmail.trim()) {
      setWaitlistError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(waitlistEmail)) {
      setWaitlistError('Please enter a valid email address');
      return;
    }

    const stored = localStorage.getItem('ideacheck_waitlist') || '[]';
    try {
      const waitlist = JSON.parse(stored);
      if (!waitlist.includes(waitlistEmail.trim())) {
        waitlist.push(waitlistEmail.trim());
        localStorage.setItem('ideacheck_waitlist', JSON.stringify(waitlist));
      }
      setWaitlistSuccess(true);
      setWaitlistEmail('');
    } catch (err) {
      setWaitlistError('Failed to join waitlist. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                  Validate Your Ideas with{' '}
                  <span className="bg-gradient-to-r from-primary via-accent to-primary/70 bg-clip-text text-transparent">
                    AI-Powered Insights
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl text-balance">
                  Get comprehensive validation reports for your business ideas. Market analysis, feasibility assessment, and actionable recommendations in minutes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-2">
                      Go to Dashboard <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="gap-2">
                        Get Started Free <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href="#features">
                      <Button size="lg" variant="outline">
                        Learn More
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">5,000+</p>
                  <p className="text-sm text-muted-foreground">Ideas Validated</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">98%</p>
                  <p className="text-sm text-muted-foreground">User Satisfaction</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">24hrs</p>
                  <p className="text-sm text-muted-foreground">Avg Report Time</p>
                </div>
              </div>
            </div>

            {/* Visual Hero */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-full"></div>
              <div className="relative bg-card border border-border/50 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="h-3 bg-primary/30 rounded w-2/3"></div>
                  <div className="h-3 bg-primary/20 rounded w-full"></div>
                  <div className="h-3 bg-primary/20 rounded w-5/6"></div>
                  <div className="pt-4 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-secondary/50 rounded p-4">
                        <p className="text-sm text-muted-foreground">Market Score</p>
                        <p className="text-2xl font-bold text-primary mt-1">78%</p>
                      </div>
                      <div className="bg-secondary/50 rounded p-4">
                        <p className="text-sm text-muted-foreground">Tech Score</p>
                        <p className="text-2xl font-bold text-primary mt-1">85%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-secondary/20 border-y border-border/40">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
            <Mail className="w-3.5 h-3.5" />
            <span>Join waitlist for early access</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Be the First to Know</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Get early access to extreme business analysis tools, custom PDF exports, and premium version comparisons.
          </p>
          <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto justify-center">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter your email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                className="w-full bg-card"
                disabled={waitlistSuccess}
              />
            </div>
            <Button type="submit" disabled={waitlistSuccess} className="gap-2 shrink-0">
              {waitlistSuccess ? 'On the List!' : 'Join Waitlist'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
          {waitlistError && (
            <p className="text-destructive text-sm mt-2">{waitlistError}</p>
          )}
          {waitlistSuccess && (
            <p className="text-emerald-500 font-medium text-sm mt-2">
              ✓ Successfully joined the waitlist! We will notify you for early access.
            </p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Powerful Features for Entrepreneurs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to validate and develop your business ideas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI Analysis',
                description: 'Advanced AI algorithms analyze market potential, competition, and feasibility'
              },
              {
                icon: BarChart3,
                title: 'Market Insights',
                description: 'Get detailed market analysis, TAM estimation, and trend analysis'
              },
              {
                icon: Zap,
                title: 'Instant Reports',
                description: 'Generate comprehensive validation reports in minutes, not days'
              },
              {
                icon: Users,
                title: 'Community Feedback',
                description: 'Share ideas with other entrepreneurs and get valuable peer feedback'
              },
              {
                icon: CheckCircle2,
                title: 'Action Items',
                description: 'Get specific, actionable next steps tailored to your idea'
              },
              {
                icon: Users,
                title: 'Expert Guidance',
                description: 'Learn from successful entrepreneurs and industry experts'
              },
            ].map((feature, idx) => (
              <div key={idx} className="group bg-card border border-border/40 rounded-xl p-6 hover:border-primary/50 hover:bg-secondary/50 transition-all duration-300">
                <feature.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Validate Your Idea?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of entrepreneurs using IdeaCheck to make informed decisions about their business ideas.
          </p>
          {!user ? (
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Create New Idea <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Follow</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Twitter</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">LinkedIn</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2024 IdeaCheck. All rights reserved.</p>
            <p>Made with ♥ for entrepreneurs</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
