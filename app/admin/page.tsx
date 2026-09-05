'use client';

import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ModerationReport } from '@/lib/community-types';
import { INITIAL_REPORTS } from '@/lib/community-data';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Check, X, Sparkles } from 'lucide-react';

export default function AdminModerationPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<ModerationReport[]>(INITIAL_REPORTS);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Loading Admin Panel...</div>;
  }

  const handleResolve = (id: string) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
  };

  const handleDismiss = (id: string) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
  };

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-16">
      <Header />

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Admin Moderation & AI Intelligence Control</h1>
            <p className="text-xs text-muted-foreground">Monitor reported projects, spam flags, and community quality.</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold">Pending Community Flags</h2>

          {reports.length === 0 ? (
            <Card className="p-12 text-center border-dashed rounded-2xl">
              <p className="text-sm text-muted-foreground">All moderation flags resolved.</p>
            </Card>
          ) : (
            reports.map(rep => (
              <Card key={rep.id} className="p-6 bg-card border-border rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{rep.targetTitle}</h3>
                      <p className="text-xs text-muted-foreground">Reason: <span className="font-semibold text-foreground">{rep.reason}</span></p>
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
      </div>

      <MobileNav />
    </main>
  );
}
