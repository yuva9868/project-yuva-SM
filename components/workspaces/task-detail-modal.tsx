'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from './workspace-context';
import { WorkspaceTask, TaskStatus, TaskPriority } from '@/lib/workspace-types';
import { apiUpdateTask, apiDeleteTask, apiAddComment } from '@/lib/workspace-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  CheckSquare,
  Calendar,
  User,
  MessageSquare,
  Send,
  Trash2,
  Edit2,
  Clock,
  ArrowRight,
  Shield,
  CheckCircle2
} from 'lucide-react';

interface TaskDetailModalProps {
  task: WorkspaceTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailModal({ task, open, onOpenChange }: TaskDetailModalProps) {
  const { user } = useAuth();
  const { workspaceData, userRole, refreshWorkspace } = useWorkspace();

  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignedTo, setAssignedTo] = useState<string>('unassigned');
  const [dueDate, setDueDate] = useState('');

  if (!task || !workspaceData) return null;

  const comments = workspaceData.comments.filter(c => c.task_id === task.id);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!user) return;
    try {
      await apiUpdateTask(workspaceData.workspace.id, task.id, { status: newStatus }, user);
      toast.success(`Task shifted to "${newStatus.replace('_', ' ')}"`);
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task.');
    }
  };

  const handleStartEdit = () => {
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);
    setAssignedTo(task.assigned_to || 'unassigned');
    setDueDate(task.due_date ? task.due_date.slice(0, 10) : '');
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!user || !title.trim()) return;
    try {
      await apiUpdateTask(
        workspaceData.workspace.id,
        task.id,
        {
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          assigned_to: assignedTo !== 'unassigned' ? assignedTo : null,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
        },
        user
      );
      toast.success('Task details updated!');
      setIsEditing(false);
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task.');
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!confirm(`Are you sure you want to delete task "${task.title}"?`)) return;

    try {
      await apiDeleteTask(workspaceData.workspace.id, task.id, user);
      toast.success('Task deleted.');
      onOpenChange(false);
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete task.');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await apiAddComment(
        workspaceData.workspace.id,
        {
          taskId: task.id,
          content: commentText.trim(),
        },
        user
      );
      toast.success('Comment added to task!');
      setCommentText('');
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        <div className="p-5 border-b border-border flex items-start justify-between gap-3 sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-black text-foreground truncate">
                {task.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                <span>Created by {task.created_by_name || 'Member'}</span>
                <span>•</span>
                <span>{new Date(task.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {userRole !== 'VIEWER' && (
            <div className="flex items-center gap-2 shrink-0">
              {!isEditing && (
                <Button size="sm" variant="outline" onClick={handleStartEdit} className="h-8 text-xs font-bold gap-1">
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="h-8 text-xs font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 px-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Status Switcher Bar */}
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">Current Status:</span>
              <Badge className="capitalize font-bold text-xs bg-primary/20 text-primary border-primary/30">
                {task.status.replace('_', ' ')}
              </Badge>
            </div>

            {userRole !== 'VIEWER' && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-muted-foreground mr-1">Shift to:</span>
                {(['todo', 'in_progress', 'in_review', 'completed'] as TaskStatus[]).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={task.status === s ? 'default' : 'outline'}
                    disabled={task.status === s}
                    onClick={() => handleStatusChange(s)}
                    className="h-7 text-[10px] font-bold capitalize px-2 rounded-lg"
                  >
                    {s.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Edit Form or View Details */}
          {isEditing ? (
            <div className="p-4 rounded-2xl bg-card border border-border space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Task Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-xs" />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="text-xs h-20" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Priority</label>
                  <Select value={priority} onValueChange={(val) => setPriority(val as TaskPriority)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Assignee</label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {workspaceData.members.map((m) => (
                        <SelectItem key={m.user_id} value={m.user_id}>
                          {m.user_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Due Date</label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="text-xs" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="text-xs">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit} className="text-xs font-bold">
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Description
                </span>
                <p className="text-xs text-foreground leading-relaxed bg-muted/20 p-3.5 rounded-xl border border-border/50">
                  {task.description || 'No description provided.'}
                </p>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Priority</span>
                  <span className="font-bold capitalize text-foreground">{task.priority}</span>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Assignee</span>
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    {task.assigned_to_name ? (
                      <>
                        <img
                          src={task.assigned_to_avatar || `https://avatar.vercel.sh/${task.assigned_to}?s=32`}
                          alt={task.assigned_to_name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span>{task.assigned_to_name}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground italic font-normal">Unassigned</span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Deadline</span>
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date set'}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Comments Discussion Section */}
          <div className="space-y-3 pt-3 border-t border-border/80">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h4 className="font-bold text-xs text-foreground">Task Comments ({comments.length})</h4>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic py-2">
                  No discussion on this task yet. Post updates or questions below.
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={c.author_avatar} alt={c.author_name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="font-bold text-foreground">{c.author_name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-muted-foreground pl-7 leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {userRole !== 'VIEWER' ? (
              <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Post progress update or blocker..."
                  className="bg-muted/50 border-border text-xs h-9"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="gap-1.5 text-xs font-bold shrink-0 h-9"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </Button>
              </form>
            ) : (
              <p className="text-[11px] text-muted-foreground">Viewers have read-only access to comments.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
