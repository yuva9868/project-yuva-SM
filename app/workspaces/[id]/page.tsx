'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from '@/components/workspaces/workspace-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Lock,
  Plus,
  Upload,
  UserPlus,
  CheckSquare,
  FileText,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Megaphone,
  Download,
  AlertCircle,
  Eye,
  Edit3,
  ExternalLink,
  Sparkles,
  Activity as ActivityIcon
} from 'lucide-react';
import { InviteMemberDialog } from '@/components/workspaces/invite-member-dialog';
import { CreateTaskDialog } from '@/components/workspaces/create-task-dialog';
import { UploadFileDialog } from '@/components/workspaces/upload-file-dialog';
import { AddAnnouncementDialog } from '@/components/workspaces/add-announcement-dialog';
import { apiDownloadFile } from '@/lib/workspace-client';
import { toast } from 'sonner';

export default function WorkspaceOverviewPage() {
  const { user } = useAuth();
  const { workspaceData, userRole } = useWorkspace();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);

  if (!workspaceData) return null;

  const { workspace: ws, members, files, tasks, announcements, activities } = workspaceData;
  const baseUrl = `/workspaces/${ws.id}`;

  const openTasks = tasks.filter(t => t.status !== 'completed');
  const recentFiles = files.slice(0, 5);
  const recentTasks = openTasks.slice(0, 5);
  const recentActivities = activities.slice(0, 6);
  const pinnedAnnouncements = announcements.filter(a => a.pinned);

  // Find upcoming deadlines
  const tasksWithDeadlines = openTasks
    .filter(t => t.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
  const nextDeadline = tasksWithDeadlines[0];

  const handleDownload = async (fileId: string, filename: string) => {
    if (!user) return;
    try {
      await apiDownloadFile(ws.id, fileId, user);
      toast.success(`Downloaded "${filename}"`);
    } catch (err: any) {
      toast.error(err.message || 'Download denied by workspace policy.');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[10px] font-bold">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] font-bold">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] font-bold">Medium</Badge>;
      case 'low':
      default:
        return <Badge className="bg-muted text-muted-foreground text-[10px] font-bold">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">Done</Badge>;
      case 'in_review':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px] font-bold">In Review</Badge>;
      case 'in_progress':
        return <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold">In Progress</Badge>;
      case 'todo':
      default:
        return <Badge className="bg-muted text-muted-foreground text-[10px] font-bold">To Do</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Workspace Header Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-card via-card to-primary/5 border border-border/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {ws.logo_path ? (
              <img
                src={ws.logo_path}
                alt={ws.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/30 shadow-md shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/20 text-primary flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                {ws.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {ws.name}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-2.5 py-0.5 rounded-full border border-primary/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Private Team Space
                </span>
                {ws.archived_at && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    Archived
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl">
                {ws.description || 'Private collaboration environment for confidential startup operations.'}
              </p>

              {/* Linked IdeaCheck Project */}
              {ws.linked_project_id && (
                <div className="pt-1 flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground text-[11px]">Linked Startup:</span>
                  <Link
                    href={`/community/${ws.linked_project_id}`}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline text-xs"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{ws.linked_project_title || 'View Startup Showcase'}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {userRole !== 'VIEWER' && (
              <>
                <Button
                  onClick={() => setUploadDialogOpen(true)}
                  size="sm"
                  variant="outline"
                  className="gap-2 font-bold text-xs rounded-xl"
                >
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  <span>Upload File</span>
                </Button>

                <Button
                  onClick={() => setTaskDialogOpen(true)}
                  size="sm"
                  variant="outline"
                  className="gap-2 font-bold text-xs rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5 text-primary" />
                  <span>Create Task</span>
                </Button>
              </>
            )}

            {userRole === 'ADMIN' && (
              <>
                <Button
                  onClick={() => setAnnouncementDialogOpen(true)}
                  size="sm"
                  variant="outline"
                  className="gap-2 font-bold text-xs rounded-xl"
                >
                  <Megaphone className="w-3.5 h-3.5 text-amber-500" />
                  <span>Announce</span>
                </Button>

                <Button
                  onClick={() => setInviteDialogOpen(true)}
                  size="sm"
                  className="gap-2 font-bold text-xs rounded-xl shadow-md shadow-primary/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite Teammate</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pinned Announcements Banner */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-3">
          {pinnedAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs"
            >
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <Megaphone className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-foreground text-sm">{ann.title}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(ann.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{ann.content}</p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                  <span>Posted by <strong className="text-foreground">{ann.author_name}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href={`${baseUrl}/files`}>
          <Card className="p-4 bg-card border-border hover:border-primary/40 transition-all rounded-2xl space-y-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" /> Confidential Files
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
            </span>
            <p className="text-2xl font-black text-foreground">{files.length}</p>
            <span className="text-[10px] text-muted-foreground">Encrypted assets</span>
          </Card>
        </Link>

        <Link href={`${baseUrl}/tasks`}>
          <Card className="p-4 bg-card border-border hover:border-primary/40 transition-all rounded-2xl space-y-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-400" /> Active Tasks
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
            </span>
            <p className="text-2xl font-black text-foreground">{openTasks.length}</p>
            <span className="text-[10px] text-emerald-400 font-bold">
              {tasks.filter(t => t.status === 'completed').length} completed
            </span>
          </Card>
        </Link>

        <Card className="p-4 bg-card border-border rounded-2xl space-y-1">
          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-500" /> Next Deadline
          </span>
          <p className="text-base font-black text-foreground truncate">
            {nextDeadline?.due_date ? new Date(nextDeadline.due_date).toLocaleDateString() : 'No deadlines'}
          </p>
          <span className="text-[10px] text-muted-foreground truncate block">
            {nextDeadline ? nextDeadline.title : 'All targets on schedule'}
          </span>
        </Card>

        <Link href={`${baseUrl}/members`}>
          <Card className="p-4 bg-card border-border hover:border-primary/40 transition-all rounded-2xl space-y-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> Teammates
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
            </span>
            <p className="text-2xl font-black text-foreground">{members.length}</p>
            <span className="text-[10px] text-muted-foreground">Verified collaborators</span>
          </Card>
        </Link>
      </div>

      {/* Main Grid: Left Column (Files & Tasks) + Right Column (Members & Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Files Card */}
          <Card className="p-5 bg-card border-border rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Recent Confidential Files</h3>
              </div>
              <Link href={`${baseUrl}/files`} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <span>View all files ({files.length})</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentFiles.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border/80 rounded-xl space-y-2">
                <p className="text-xs text-muted-foreground">No files uploaded yet.</p>
                {userRole !== 'VIEWER' && (
                  <Button size="sm" onClick={() => setUploadDialogOpen(true)} className="text-xs font-bold rounded-xl gap-1">
                    <Upload className="w-3 h-3" /> Upload First File
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentFiles.map((file) => (
                  <div key={file.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{file.original_filename}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {(file.file_size / 1024 / 1024).toFixed(2)} MB • Uploaded by {file.uploaded_by_name}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(file.id, file.original_filename)}
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-8 px-2.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Open Tasks Card */}
          <Card className="p-5 bg-card border-border rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-foreground">Open Tasks & Deliverables</h3>
              </div>
              <Link href={`${baseUrl}/tasks`} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <span>View task board ({tasks.length})</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border/80 rounded-xl space-y-2">
                <p className="text-xs text-muted-foreground">No open tasks right now.</p>
                {userRole !== 'VIEWER' && (
                  <Button size="sm" onClick={() => setTaskDialogOpen(true)} className="text-xs font-bold rounded-xl gap-1">
                    <Plus className="w-3 h-3" /> Create First Task
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentTasks.map((task) => (
                  <div key={task.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 space-y-1">
                      <p className="font-semibold text-foreground truncate">{task.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                        {task.due_date && (
                          <span className="flex items-center gap-1 text-[10px]">
                            <Calendar className="w-3 h-3" /> {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {task.assigned_to_name && (
                      <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground text-[11px]">
                        <img
                          src={task.assigned_to_avatar || `https://avatar.vercel.sh/${task.assigned_to}?s=32`}
                          alt={task.assigned_to_name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="hidden sm:inline font-medium">{task.assigned_to_name.split(' ')[0]}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (1 span) */}
        <div className="space-y-6">
          {/* Team Members Card */}
          <Card className="p-5 bg-card border-border rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Teammates ({members.length})
              </h3>
              {userRole === 'ADMIN' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setInviteDialogOpen(true)}
                  className="text-xs font-bold text-primary p-0 h-auto hover:bg-transparent hover:underline"
                >
                  + Invite
                </Button>
              )}
            </div>

            <div className="space-y-2.5">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={m.user_avatar}
                      alt={m.user_name}
                      className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{m.user_name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{m.user_email}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    m.role === 'ADMIN'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : m.role === 'EDITOR'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {m.role}
                  </span>
                </div>
              ))}
            </div>

            <Link href={`${baseUrl}/members`} className="block pt-2 border-t border-border/60">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl">
                Manage Teammates & Roles
              </Button>
            </Link>
          </Card>

          {/* Recent Activity Audit Feed */}
          <Card className="p-5 bg-card border-border rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-primary" /> Recent Activity
              </h3>
              <Link href={`${baseUrl}/activity`} className="text-xs font-bold text-primary hover:underline">
                View all
              </Link>
            </div>

            {recentActivities.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No activity recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 ring-4 ring-primary/10" />
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-foreground leading-snug">
                        <strong className="font-semibold">{act.actor_name}</strong>{' '}
                        <span className="text-muted-foreground">{act.action.replace(/_/g, ' ')}</span>
                      </p>
                      <span className="text-[10px] text-muted-foreground block">
                        {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Reusable Dialogs */}
      <InviteMemberDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />
      <CreateTaskDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} />
      <UploadFileDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />
      <AddAnnouncementDialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen} />
    </div>
  );
}
