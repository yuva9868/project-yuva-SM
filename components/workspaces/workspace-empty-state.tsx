'use client';

import { Button } from '@/components/ui/button';
import { Lock, Plus, Shield, Users, FileText, CheckCircle2 } from 'lucide-react';

interface WorkspaceEmptyStateProps {
  onCreateClick: () => void;
}

export function WorkspaceEmptyState({ onCreateClick }: WorkspaceEmptyStateProps) {
  return (
    <div className="p-8 sm:p-12 text-center rounded-3xl border border-dashed border-border/80 bg-card/60 flex flex-col items-center max-w-xl mx-auto space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-lg shadow-primary/10">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-black text-foreground">No Private Workspaces Yet</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Private workspaces allow startup founders and core teammates to collaborate under confidential conditions. Upload sensitive pitch decks, assign private development tasks, and manage role-based team permissions.
        </p>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full text-left pt-2">
        <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>Strict RBAC</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Admins, Editors, and Viewers with server enforcement.</p>
        </div>

        <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Private Files</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Secure uploads, nested folders, and view-only limits.</p>
        </div>

        <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Task Kanban</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Sprint tracking, deadlines, and member assignments.</p>
        </div>
      </div>

      <Button
        onClick={onCreateClick}
        size="lg"
        className="gap-2 font-black text-xs rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30"
      >
        <Plus className="w-4 h-4" />
        <span>Create Your First Workspace</span>
      </Button>
    </div>
  );
}
