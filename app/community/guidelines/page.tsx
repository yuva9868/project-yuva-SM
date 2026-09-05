'use client';

import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Card } from '@/components/ui/card';
import { BookOpen, CheckCircle, XCircle, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function GuidelinesPage() {
  return (
    <main className="min-h-screen bg-background pb-24 md:pb-16">
      <Header />

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <BookOpen className="w-4 h-4" />
            <span>Professional Community Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground">IdeaCheck AI Community Guidelines</h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Our mission is to foster a high-integrity ecosystem where serious founders build real products, receive actionable advice, and find trusted collaborators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Encouraged Behaviors */}
          <Card className="p-6 bg-emerald-500/5 border-emerald-500/20 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              What We Encourage
            </h2>
            <ul className="space-y-3 text-xs text-foreground/90 font-medium">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">•</span>
                <span><strong>Constructive Feedback:</strong> Provide specific, actionable insights that help founders improve their product, UX, and market positioning.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">•</span>
                <span><strong>Authentic Prototypes:</strong> Show actual working builds, interactive demos, Figma designs, and code repositories.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">•</span>
                <span><strong>Clear Requirement Statements:</strong> Be transparent about what your startup needs (e.g. Technical Co-founder, Pre-Seed funding, UX review).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">•</span>
                <span><strong>Respectful Networking:</strong> Connect directly with members to build lasting professional relationships.</span>
              </li>
            </ul>
          </Card>

          {/* Discouraged Behaviors */}
          <Card className="p-6 bg-rose-500/5 border-rose-500/20 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              What Is strictly Prohibited
            </h2>
            <ul className="space-y-3 text-xs text-foreground/90 font-medium">
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-600">•</span>
                <span><strong>Spam & Self-Promotion:</strong> No generic marketing spam, affiliate links, or unrelated promotional dumping.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-600">•</span>
                <span><strong>Fake Financial Claims:</strong> Do not post misleading traction numbers, fake revenue stats, or deceptive funding requests.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-600">•</span>
                <span><strong>Plagiarism & Copying:</strong> Respect intellectual property and original works of fellow community builders.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-600">•</span>
                <span><strong>Harassment & Trolling:</strong> Toxic behavior or personal attacks will result in immediate account suspension.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <MobileNav />
    </main>
  );
}
