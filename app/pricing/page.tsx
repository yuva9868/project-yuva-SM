'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle2, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 0,
    period: 'Free',
    description: 'Perfect for exploring ideas',
    features: [
      'Up to 5 ideas per month',
      'Basic validation reports',
      'Community access',
      'Email support',
      'Basic analytics',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: 29,
    period: '/month',
    description: 'For serious entrepreneurs',
    features: [
      'Unlimited ideas',
      'Advanced validation reports',
      'Priority support',
      'Advanced analytics',
      'Export reports to PDF',
      'API access',
      'Team collaboration',
      'Custom insights',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    period: '/month',
    description: 'For teams and corporations',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom branding',
      'Dedicated account manager',
      'White-label option',
      'Advanced security',
      'Custom integrations',
      'SLA guaranteed',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Choose the plan that fits your needs. Upgrade or downgrade anytime. No credit card required to start.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className="text-sm text-muted-foreground">Monthly</span>
              <div className="bg-secondary rounded-lg p-1 flex">
                <button className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium">
                  Monthly
                </button>
                <button className="px-4 py-2 rounded text-sm text-muted-foreground font-medium">
                  Annual
                </button>
              </div>
              <span className="text-sm text-muted-foreground">
                Save 20%
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, idx) => (
              <Card
                key={idx}
                className={`p-8 relative flex flex-col ${
                  plan.popular ? 'ring-2 ring-primary transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6 pt-2">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                </div>

                <Link href="/register" className="mb-6 block w-full">
                  <Button
                    size="lg"
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {[
                {
                  q: 'Can I switch plans anytime?',
                  a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards, PayPal, and bank transfers for annual subscriptions.',
                },
                {
                  q: 'Is there a free trial?',
                  a: 'Yes, Pro and Enterprise plans come with a 14-day free trial. No credit card required.',
                },
                {
                  q: 'What happens if I cancel?',
                  a: 'You can cancel anytime. You&apos;ll have access until the end of your current billing period.',
                },
              ].map((item, idx) => (
                <Card key={idx} className="p-6">
                  <h3 className="font-semibold mb-2">{item.q}</h3>
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to validate your ideas?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of entrepreneurs using IdeaCheck to make better decisions about their business ideas.
            </p>
            <Link href="/register">
              <Button size="lg">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
