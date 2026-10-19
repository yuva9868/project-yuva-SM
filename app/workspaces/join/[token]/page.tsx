'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiGetInvitationDetails, apiAcceptInvitation, apiDeclineInvitation } from '@/lib/workspace-client';
import { WorkspaceInvitation, Workspace } from '@/lib/workspace-types';
import { toast } from 'sonner';
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Edit3,
  Eye,
  ArrowRight,
  UserCheck,
  Mail,
  Loader2,
  LogIn
} from 'lucide-react';
import Link from 'next/link';

export default function JoinWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { user, isLoading: authLoading } = useAuth();

  const [inviteData, setInviteData] = useState<{
    invitation: WorkspaceInvitation;
    workspace: Workspace;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!token) return;

    const loadInvite = async () => {
      try {
        setError(null);
        const data = await apiGetInvitationDetails(token);
        setInviteData(data);
      } catch (err: any) {
        setError(err.message || 'Invitation is invalid, expired, or has already been used.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!user) {
      toast.error('Please sign in to accept this invitation.');
      router.push(`/login?redirect=/workspaces/join/${token}`);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await apiAcceptInvitation(token, user);
      toast.success(`Welcome to ${res.workspace.name}! You have joined as ${inviteData?.invitation.role}.`);
      router.push(`/workspaces/${res.workspace.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept invitation.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to decline this invitation?')) return;

    setIsProcessing(true);
    try {
      await apiDeclineInvitation(token, user);
      toast.info('Invitation declined.');
      router.push('/workspaces');
    } catch (err: any) {
      toast.error(err.message || 'Failed to decline invitation.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 max-w-md mx-auto px-4 space-y-4 text-center">
          <Skeleton className="w-16 h-16 rounded-2xl mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !inviteData) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 max-w-md mx-auto px-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-foreground">Invitation Invalid or Expired</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error || 'This workspace invitation token is no longer valid. It may have expired, been revoked, or already accepted.'}
          </p>
          <div className="pt-2">
            <Link href="/workspaces">
              <Button size="sm" className="font-bold text-xs rounded-xl">
                Go to My Workspaces
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { invitation: inv, workspace: ws } = inviteData;
  const isEmailMatching = user && user.email.toLowerCase() === inv.email.toLowerCase();

  return (
    <main className="min-h-screen bg-background pb-20">
      <Header />

      <div className="pt-28 max-w-lg mx-auto px-4 space-y-6">
        <Card className="p-6 sm:p-8 bg-card border-border rounded-3xl shadow-xl space-y-6 text-center">
          {/* Workspace Avatar */}
          <div className="space-y-3">
            {ws.logo_path ? (
              <img
                src={ws.logo_path}
                alt={ws.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/30 mx-auto shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 text-primary flex items-center justify-center font-black text-3xl mx-auto shadow-lg">
                {ws.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 inline-flex items-center gap-1">
                <Lock className="w-3 h-3" /> Confidential Workspace Invitation
              </span>
              <h1 className="text-2xl font-black text-foreground">{ws.name}</h1>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {ws.description || 'You have been invited to collaborate in this private team space.'}
              </p>
            </div>
          </div>

          {/* Invitation Metadata */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs text-left space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Invited By:</span>
              <span className="font-bold text-foreground">{inv.invited_by_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Assigned Role:</span>
              <Badge className="font-black uppercase tracking-wider text-[10px] bg-primary/20 text-primary border-primary/30">
                {inv.role}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Invited Recipient:</span>
              <span className="font-mono text-xs font-semibold text-foreground">{inv.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Token Expiration:</span>
              <span className="text-[11px] text-muted-foreground">{new Date(inv.expires_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* User Authentication Status */}
          {!user ? (
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-3">
              <p className="text-xs text-foreground font-semibold">
                Please sign in to verify your identity and accept this invitation.
              </p>
              <div className="flex gap-2">
                <Link href={`/login?redirect=/workspaces/join/${token}`} className="flex-1">
                  <Button size="sm" className="w-full text-xs font-bold gap-2 rounded-xl">
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In to Accept</span>
                  </Button>
                </Link>
                <Link href={`/register?redirect=/workspaces/join/${token}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl">
                    Register New Account
                  </Button>
                </Link>
              </div>
            </div>
          ) : !isEmailMatching ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-left space-y-2">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Email Mismatch</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                This invitation was created specifically for <strong className="text-foreground">{inv.email}</strong>, but you are currently signed in as <strong className="text-foreground">{user.email}</strong>.
              </p>
              <p className="text-[10px] text-muted-foreground">
                To accept, please sign out and sign in using the matching email address.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleAccept}
                disabled={isProcessing}
                size="lg"
                className="w-full font-black text-xs rounded-xl shadow-lg shadow-primary/20 gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Joining Workspace...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Invitation & Join Team</span>
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={handleDecline}
                disabled={isProcessing}
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-rose-500"
              >
                Decline Invitation
              </Button>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
