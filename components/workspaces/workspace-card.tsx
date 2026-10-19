'use client';

import Link from 'next/link';
import { Workspace, WorkspaceRole } from '@/lib/workspace-types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Users, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  Edit3, 
  Eye, 
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

interface WorkspaceCardProps {
  workspace: Workspace & { userRole: WorkspaceRole; memberCount: number };
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const getRoleBadge = (role: WorkspaceRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Admin (Owner)</span>
          </Badge>
        );
      case 'EDITOR':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Edit3 className="w-3 h-3" />
            <span>Editor</span>
          </Badge>
        );
      case 'VIEWER':
      default:
        return (
          <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>Viewer</span>
          </Badge>
        );
    }
  };

  return (
    <Card className="p-5 bg-card border-border hover:border-primary/40 transition-all rounded-2xl flex flex-col justify-between group shadow-sm hover:shadow-md hover:shadow-primary/5">
      <div className="space-y-4">
        {/* Header with Logo and Role Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {workspace.logo_path ? (
              <img
                src={workspace.logo_path}
                alt={workspace.name}
                className="w-12 h-12 rounded-xl object-cover border border-border group-hover:border-primary/40 transition-colors"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg border border-primary/20">
                {workspace.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {workspace.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Lock className="w-3 h-3 text-primary" /> Private
                </span>
                {workspace.archived_at && (
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded">
                    Archived
                  </span>
                )}
              </div>
            </div>
          </div>
          {getRoleBadge(workspace.userRole)}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
          {workspace.description || 'Confidential team space for strategic planning, file sharing, and project execution.'}
        </p>

        {/* Linked IdeaCheck Startup Project */}
        {workspace.linked_project_title && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-xl border border-border/60">
            <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-semibold text-foreground truncate">{workspace.linked_project_title}</span>
            <span className="text-[10px] text-muted-foreground ml-auto shrink-0">Linked Project</span>
          </div>
        )}

        {/* Metadata stats */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span><strong className="text-foreground">{workspace.memberCount}</strong> {workspace.memberCount === 1 ? 'member' : 'members'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground justify-end">
            <span className="text-[11px] text-muted-foreground">Created {new Date(workspace.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 flex items-center justify-between gap-2">
        <Link href={`/workspaces/${workspace.id}`} className="w-full">
          <Button className="w-full gap-2 font-bold text-xs rounded-xl shadow-sm group-hover:shadow-primary/20">
            <span>Open Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
