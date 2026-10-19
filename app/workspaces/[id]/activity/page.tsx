'use client';

import { useState, useMemo } from 'react';
import { useWorkspace } from '@/components/workspaces/workspace-context';
import { ActivityAction } from '@/lib/workspace-types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity as ActivityIcon,
  FileUp,
  Trash2,
  Edit,
  UserPlus,
  Users,
  CheckCircle2,
  CheckSquare,
  Megaphone,
  Settings,
  Lock,
  ArrowRightLeft,
  Calendar,
  Filter
} from 'lucide-react';

export default function WorkspaceActivityPage() {
  const { workspaceData } = useWorkspace();
  const [filterType, setFilterType] = useState('all');

  if (!workspaceData) return null;

  const { workspace: ws, activities } = workspaceData;

  const filteredActivities = useMemo(() => {
    if (filterType === 'all') return activities;
    return activities.filter((act) => act.resource_type === filterType);
  }, [activities, filterType]);

  const getActivityIcon = (action: ActivityAction) => {
    switch (action) {
      case 'file_uploaded':
        return <FileUp className="w-4 h-4 text-primary" />;
      case 'file_deleted':
      case 'folder_deleted':
        return <Trash2 className="w-4 h-4 text-rose-500" />;
      case 'task_created':
        return <CheckSquare className="w-4 h-4 text-blue-400" />;
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'member_invited':
      case 'invitation_accepted':
        return <UserPlus className="w-4 h-4 text-indigo-400" />;
      case 'role_changed':
      case 'member_removed':
        return <Users className="w-4 h-4 text-amber-500" />;
      case 'announcement_published':
        return <Megaphone className="w-4 h-4 text-amber-400" />;
      case 'ownership_transferred':
        return <ArrowRightLeft className="w-4 h-4 text-rose-400" />;
      case 'workspace_updated':
        return <Settings className="w-4 h-4 text-primary" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-primary" />;
    }
  };

  const formatActionMessage = (act: typeof activities[0]) => {
    const meta = act.metadata || {};
    switch (act.action) {
      case 'workspace_created':
        return `created the private workspace "${meta.name || ws.name}"`;
      case 'workspace_updated':
        return `updated workspace settings and security configuration`;
      case 'workspace_archived':
        return `archived this workspace`;
      case 'workspace_unarchived':
        return `unarchived this workspace`;
      case 'member_invited':
        return `invited ${meta.email} as ${meta.role}`;
      case 'invitation_accepted':
        return `accepted the invitation and joined the workspace as ${meta.role}`;
      case 'invitation_revoked':
        return `revoked the pending invitation for ${meta.email}`;
      case 'member_removed':
        return `removed ${meta.target_name || 'member'} from the workspace`;
      case 'role_changed':
        return `changed ${meta.target_name || 'member'}'s role to ${meta.new_role}`;
      case 'ownership_transferred':
        return `transferred workspace ownership to ${meta.new_owner_name || 'new owner'}`;
      case 'folder_created':
        return `created folder "${meta.name}"`;
      case 'folder_deleted':
        return `deleted folder "${meta.name}"`;
      case 'file_uploaded':
        return `uploaded confidential asset "${meta.filename}"`;
      case 'file_renamed':
        return `renamed file to "${meta.new_name}"`;
      case 'file_moved':
        return `moved file "${meta.filename}"`;
      case 'file_deleted':
        return `deleted file "${meta.filename}"`;
      case 'task_created':
        return `created task "${meta.title}"`;
      case 'task_status_changed':
        return `shifted task "${meta.title}" to ${meta.status?.replace('_', ' ')}`;
      case 'task_completed':
        return `completed task "${meta.title}"`;
      case 'task_deleted':
        return `deleted task "${meta.title}"`;
      case 'announcement_published':
        return `published announcement "${meta.title}"`;
      case 'comment_added':
        return `added a comment on a ${meta.target || 'item'}`;
      default:
        return act.action.replace(/_/g, ' ');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-foreground">Audit Log & Activity</h1>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] uppercase font-bold">
              Compliance Trail
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable chronological record of file modifications, role adjustments, and security events.
          </p>
        </div>

        {/* Filter by Category */}
        <div className="w-48">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-muted/40 border-border text-xs h-9">
              <SelectValue placeholder="All Activities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="file">Files & Storage</SelectItem>
              <SelectItem value="folder">Folders</SelectItem>
              <SelectItem value="task">Tasks & Sprints</SelectItem>
              <SelectItem value="member">Teammates & Roles</SelectItem>
              <SelectItem value="announcement">Announcements</SelectItem>
              <SelectItem value="settings">Settings & Security</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <Card className="p-6 bg-card border-border rounded-2xl">
        {filteredActivities.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
            <ActivityIcon className="w-8 h-8 text-muted-foreground/40 mx-auto" />
            <p>No activity recorded in this category yet.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
            {filteredActivities.map((act) => (
              <div key={act.id} className="relative flex items-start gap-4 text-xs group">
                {/* Timeline Node Icon */}
                <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-card border-2 border-border group-hover:border-primary flex items-center justify-center shrink-0 transition-colors shadow-sm">
                  {getActivityIcon(act.action)}
                </div>

                <div className="flex-1 space-y-1 bg-muted/20 p-3 rounded-xl border border-border/50 group-hover:border-primary/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="text-foreground">
                      <strong className="font-extrabold text-foreground">{act.actor_name}</strong>{' '}
                      <span className="text-muted-foreground">{formatActionMessage(act)}</span>
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                      {new Date(act.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider inline-block">
                    {act.resource_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
