'use client';

import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { INITIAL_FOUNDERS } from '@/lib/community-data';
import Link from 'next/link';
import { useState } from 'react';
import { Trophy, Award, Star, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LeaderboardPage() {
  const [filterCategory, setFilterCategory] = useState<'all' | 'founders' | 'reviewers' | 'mentors'>('all');

  const sortedFounders = [...INITIAL_FOUNDERS].sort((a, b) => b.reputationScore - a.reputationScore);

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-16">
      <Header />

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Trophy className="w-4 h-4 fill-current" />
            <span>Community Reputation & Trust Rankings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground">Top Ecosystem Contributors</h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Rewarding quality startup projects, detailed feedback, mentoring, and authentic collaboration.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Top Overall' },
            { key: 'founders', label: 'Top Founders' },
            { key: 'reviewers', label: 'Top Reviewers' },
            { key: 'mentors', label: 'Top Mentors & Investors' },
          ].map(tab => (
            <Button
              key={tab.key}
              variant={filterCategory === tab.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory(tab.key as any)}
              className="rounded-xl font-bold text-xs"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Leaderboard Table / Cards */}
        <Card className="p-6 bg-card border-border rounded-2xl shadow-lg space-y-4">
          <div className="space-y-3">
            {sortedFounders.map((founder, idx) => (
              <div
                key={founder.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/50 transition-all gap-4"
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                    idx === 0 ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' :
                    idx === 1 ? 'bg-slate-300 text-slate-900' :
                    idx === 2 ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    #{idx + 1}
                  </div>

                  <img src={founder.avatar} alt={founder.name} className="w-10 h-10 rounded-full object-cover border shrink-0" />

                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/profile/${founder.username}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                        {founder.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">(@{founder.username})</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{founder.bio}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-black text-amber-600 dark:text-amber-400 block">{founder.reputationScore} pts</span>
                    <span className="text-[10px] text-muted-foreground">{founder.verifiedType}</span>
                  </div>

                  <Link href={`/profile/${founder.username}`}>
                    <Button size="sm" variant="ghost" className="rounded-xl">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <MobileNav />
    </main>
  );
}
