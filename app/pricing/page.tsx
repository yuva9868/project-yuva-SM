'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CheckCircle2, Zap, ShieldCheck, Building2, Sparkles, Info } from 'lucide-react';
import { useState } from 'react';

const plans = [
  {
    name: 'Free Founder',
    price: 0,
    period: 'Free forever',
    description: 'Essential tools for early idea testing and community discovery.',
    badge: 'Community',
    features: [
      'Founder Credibility Passport profile',
      'Up to 2 public startup projects',
      '7-dimensional structured peer feedback',
      'Intelligent discovery & community matching',
      'Public prototype links & demo embeds',
      'Community leaderboard & activity tracking',
    ],
    cta: 'Start Building Free',
    href: '/register',
    popular: false,
  },
  {
    name: 'Pro Founder',
    price: 29,
    annualPrice: 24,
    period: '/month',
    description: 'For active founders proving traction, validation, and seeking capital.',
    badge: 'Most Popular',
    features: [
      'Everything in Free Founder',
      'Unlimited public & private projects',
      'AI Project Intelligence (risks, feedback themes, competitors)',
      'Real-World Validation Lab (unlimited experiments & tests)',
      'Exportable validation research (CSV participant submissions)',
      'Private Collaboration Workspaces (tasks, Kanban, resources)',
      'Investor Discovery Room & Expression of Interest pipeline',
      'Verified milestone badges & priority discovery feed',
    ],
    cta: 'Preview Pro Access',
    href: '/dashboard',
    popular: true,
  },
  {
    name: 'Organizations & Incubators',
    price: 149,
    annualPrice: 119,
    period: '/month',
    description: 'For accelerators, universities, incubators, and venture studios.',
    badge: 'Enterprise',
    features: [
      'Everything in Pro Founder',
      'Incubator & cohort oversight dashboard',
      'Cross-cohort founder progress tracking',
      'Mentor coordination & office hours management',
      'Standardized founder credibility scoring & verification',
      'Ecosystem analytics, retention & cohort export',
      'Role-based admin & mentor permissions',
      'Dedicated program manager onboarding',
    ],
    cta: 'Contact for Cohorts',
    href: 'mailto:cohorts@ideacheck.ai?subject=Incubator%20Plan%20Inquiry',
    popular: false,
  },
];

export default function PricingPage() {
  const [annualBilling, setAnnualBilling] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      <Header />

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-4 px-3 py-1 border-primary/40 text-primary bg-primary/10 gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Founder-First Monetization
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Invest in Your Startup's Validation
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Clear, honest tiers structured to support early-stage founders through every phase of building—from first problem hypothesis to investor-ready evidence.
          </p>

          {/* Monetization Preview Notice */}
          <div className="mt-6 inline-flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs text-left max-w-2xl">
            <Info className="w-4 h-4 flex-shrink-0 text-blue-400" />
            <span>
              <strong>Platform Notice:</strong> Monetization infrastructure (Stripe / LemonSqueezy) is currently in public staging preview. All core founder and validation features are actively available for test usage.
            </span>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`text-sm font-semibold transition-colors ${!annualBilling ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className={`w-12 h-6 rounded-full p-1 transition-colors relative ${annualBilling ? 'bg-primary' : 'bg-muted'}`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${annualBilling ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${annualBilling ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20 items-stretch">
          {plans.map((plan, idx) => {
            const displayPrice = plan.price === 0 
              ? 0 
              : annualBilling && plan.annualPrice 
              ? plan.annualPrice 
              : plan.price;

            return (
              <Card
                key={idx}
                className={`p-7 rounded-2xl flex flex-col relative transition-all duration-200 ${
                  plan.popular 
                    ? 'border-primary ring-1 ring-primary/40 bg-card/90 shadow-2xl shadow-primary/10 lg:-translate-y-2' 
                    : 'border-border/60 bg-card/60'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold tracking-tight">{plan.name}</h2>
                    {!plan.popular && (
                      <Badge variant="outline" className="text-[11px] font-medium border-border">
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground min-h-[32px]">{plan.description}</p>
                  
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight">${displayPrice}</span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {plan.price === 0 ? '' : annualBilling ? '/month (billed annually)' : plan.period}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <Link href={plan.href} className="w-full block">
                    <Button
                      size="lg"
                      className="w-full font-bold text-sm"
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>

                <div className="border-t border-border/60 pt-6 flex-1 flex flex-col justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    What's included:
                  </p>
                  <ul className="space-y-3 flex-1 mb-4">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Structured Tier Comparison</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Engineered for genuine startup progression from hypothesis to investment
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/60 bg-card/40">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 font-bold text-foreground">Capability</th>
                  <th className="p-4 font-semibold text-center text-foreground">Free Founder</th>
                  <th className="p-4 font-semibold text-center text-primary">Pro Founder</th>
                  <th className="p-4 font-semibold text-center text-foreground">Organizations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <tr>
                  <td className="p-4 font-medium">Founder Credibility Passport</td>
                  <td className="p-4 text-center text-muted-foreground">Standard</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">Priority Verification</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">Custom Cohort Badges</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Real-World Validation Lab</td>
                  <td className="p-4 text-center text-muted-foreground">1 Active Experiment</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">Unlimited Experiments</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">Cross-Cohort Research</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Validation CSV Export</td>
                  <td className="p-4 text-center text-muted-foreground">—</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">Full Export</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">Bulk Organization Export</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">AI Project Intelligence</td>
                  <td className="p-4 text-center text-muted-foreground">Basic Overview</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">Deep Themes & Risks</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">Cohort Benchmarking</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Private Collaboration Workspace</td>
                  <td className="p-4 text-center text-muted-foreground">—</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">Included (Kanban & Tasks)</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">Multi-Team Workspaces</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Investor Discovery Room</td>
                  <td className="p-4 text-center text-muted-foreground">Public overview only</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">Gated Pitch Deck & EOIs</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">Syndicate / Partner Access</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <Card className="p-5 border-border/60 bg-card/60">
              <h3 className="font-semibold text-sm mb-1.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Do I need to pay to get peer feedback or test prototypes?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No. IdeaCheck AI is built on community collaboration. Any founder can publish their idea, upload screenshots, link prototypes, receive 7-dimensional peer feedback, and recruit initial testers completely for free.
              </p>
            </Card>

            <Card className="p-5 border-border/60 bg-card/60">
              <h3 className="font-semibold text-sm mb-1.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                How are AI Project Intelligence insights generated?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our AI Project Intelligence runs directly on your project's problem statements, submitted prototype details, and actual structured feedback comments. We never fabricate numbers or market sizes; our system highlights repeated feedback themes, unaddressed assumptions, and suggested experiments based on real data.
              </p>
            </Card>

            <Card className="p-5 border-border/60 bg-card/60">
              <h3 className="font-semibold text-sm mb-1.5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                How does the Incubator & Accelerator tier work?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Incubator directors receive a centralized cohort dashboard to monitor student or founder progress, track milestone completion, oversee mentor office hours bookings, and export verifiable validation data for funding panels.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
