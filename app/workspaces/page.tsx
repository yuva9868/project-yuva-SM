'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Workspace, WorkspaceRole } from '@/lib/workspace-types';
import { apiListWorkspaces } from '@/lib/workspace-client';
import { WorkspaceCard } from '@/components/workspaces/workspace-card';
import { WorkspaceEmptyState } from '@/components/workspaces/workspace-empty-state';
import { CreateWorkspaceDialog } from '@/components/workspaces/create-workspace-dialog';
import { Lock, Plus, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkspacesListPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [workspaces, setWorkspaces] = useState<Array<Workspace & { userRole: WorkspaceRole; memberCount: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const loadWorkspaces = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const list = await apiListWorkspaces(user);
      setWorkspaces(list);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadWorkspaces();
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      <Header />

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* Page Hero Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Lock className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Private Team Workspaces</h1>
              <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30 uppercase tracking-wider">
                Confidential
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Isolated, encrypted collaboration environments for startup founders, advisors, and core development teams.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadWorkspaces}
              className="gap-2 text-xs font-bold rounded-xl"
              title="Refresh workspaces"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2 text-xs font-bold rounded-xl shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workspace</span>
            </Button>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-56 rounded-2xl bg-card border border-border" />
            <Skeleton className="h-56 rounded-2xl bg-card border border-border" />
            <Skeleton className="h-56 rounded-2xl bg-card border border-border" />
          </div>
        ) : workspaces.length === 0 ? (
          <WorkspaceEmptyState onCreateClick={() => setCreateDialogOpen(true)} />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing <strong>{workspaces.length}</strong> active workspaces</span>
              <span className="flex items-center gap-1.5 text-primary font-semibold">
                <Shield className="w-3.5 h-3.5" /> End-to-end access isolation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((ws) => (
                <WorkspaceCard key={ws.id} workspace={ws} />
              ))}
            </div>
          </div>
        )}
      </div>

      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={(id) => {
          loadWorkspaces();
          router.push(`/workspaces/${id}`);
        }}
      />
    </main>
  );
}
