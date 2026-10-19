'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { WorkspaceProvider, useWorkspace } from '@/components/workspaces/workspace-context';
import { WorkspaceSidebar } from '@/components/workspaces/workspace-sidebar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, Menu, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function WorkspaceLayoutInner({ children }: { children: React.ReactNode }) {
  const { workspaceData, isLoading, error } = useWorkspace();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 flex">
          <div className="hidden lg:block w-64 p-4 border-r border-border space-y-4">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-8 rounded-lg" />
          </div>
          <div className="flex-1 p-6 space-y-6">
            <Skeleton className="h-28 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !workspaceData) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-28 max-w-xl mx-auto px-4 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-foreground">Access Restricted</h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {error || 'You do not have permission to access this private workspace, or it has been deleted.'}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link href="/workspaces">
              <Button size="sm" className="gap-2 font-bold text-xs rounded-xl">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to My Workspaces</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="pt-16 flex-1 flex">
        {/* Persistent Desktop Sidebar & Mobile Drawer */}
        <WorkspaceSidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Top Sub-bar */}
          <div className="lg:hidden flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/50 backdrop-blur-sm sticky top-16 z-30">
            <div className="flex items-center gap-2 truncate">
              <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs font-bold truncate text-foreground">
                {workspaceData.workspace.name}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileSidebarOpen(true)}
              className="gap-1.5 text-xs font-bold rounded-lg h-8"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Menu</span>
            </Button>
          </div>

          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <WorkspaceLayoutInner>{children}</WorkspaceLayoutInner>
    </WorkspaceProvider>
  );
}
