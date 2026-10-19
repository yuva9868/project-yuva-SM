'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from '@/components/workspaces/workspace-context';
import { WorkspaceTask, TaskStatus, TaskPriority } from '@/lib/workspace-types';
import { apiUpdateTask } from '@/lib/workspace-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
  Plus,
  Search,
  Filter,
  Calendar,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { CreateTaskDialog } from '@/components/workspaces/create-task-dialog';
import { TaskDetailModal } from '@/components/workspaces/task-detail-modal';

const COLUMNS: Array<{ id: TaskStatus; label: string; color: string }> = [
  { id: 'todo', label: 'To Do', color: 'border-l-muted-foreground' },
  { id: 'in_progress', label: 'In Progress', color: 'border-l-primary' },
  { id: 'in_review', label: 'In Review', color: 'border-l-purple-500' },
  { id: 'completed', label: 'Completed', color: 'border-l-emerald-500' },
];

export default function WorkspaceTasksPage() {
  const { user } = useAuth();
  const { workspaceData, userRole, refreshWorkspace } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>('todo');
  const [selectedTask, setSelectedTask] = useState<WorkspaceTask | null>(null);

  if (!workspaceData) return null;

  const { workspace: ws, tasks, members } = workspaceData;

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Assignee
      if (assigneeFilter !== 'all') {
        if (assigneeFilter === 'unassigned' && t.assigned_to) return false;
        if (assigneeFilter !== 'unassigned' && t.assigned_to !== assigneeFilter) return false;
      }

      // Priority
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

      return true;
    });
  }, [tasks, searchQuery, assigneeFilter, priorityFilter]);

  const handleQuickAdvance = async (task: WorkspaceTask, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    let nextStatus: TaskStatus = 'in_progress';
    if (task.status === 'todo') nextStatus = 'in_progress';
    else if (task.status === 'in_progress') nextStatus = 'in_review';
    else if (task.status === 'in_review') nextStatus = 'completed';
    else return;

    try {
      await apiUpdateTask(ws.id, task.id, { status: nextStatus }, user);
      toast.success(`Shifted to ${nextStatus.replace('_', ' ')}`);
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task.');
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[9px] font-black uppercase">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] font-black uppercase">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[9px] font-black uppercase">Medium</Badge>;
      case 'low':
      default:
        return <Badge className="bg-muted text-muted-foreground text-[9px] font-black uppercase">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-foreground">Workspace Task Board</h1>
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
              {tasks.filter(t => t.status === 'completed').length} of {tasks.length} Shipped
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Coordinate sprints, deliverables, and confidential product launches with your team.
          </p>
        </div>

        {userRole !== 'VIEWER' && (
          <Button
            size="sm"
            onClick={() => {
              setCreateDefaultStatus('todo');
              setCreateDialogOpen(true);
            }}
            className="gap-2 text-xs font-bold rounded-xl shadow-md shadow-primary/20 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-muted/40 border-border text-xs h-9"
          />
        </div>

        {/* Assignee */}
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="bg-muted/40 border-border text-xs h-9">
            <SelectValue placeholder="All Assignees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.user_id} value={m.user_id}>
                {m.user_name} ({m.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority */}
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="bg-muted/40 border-border text-xs h-9">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-3 flex flex-col min-h-[450px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.id === 'completed' ? 'bg-emerald-400' : col.id === 'in_review' ? 'bg-purple-400' : col.id === 'in_progress' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                  <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider">
                    {col.label}
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="flex-1 space-y-2.5 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border/50 rounded-xl my-4">
                    No tasks in {col.label.toLowerCase()}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <Card
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`p-3.5 bg-card border-border hover:border-primary/50 transition-all rounded-xl cursor-pointer space-y-2.5 group shadow-sm hover:shadow-md hover:shadow-primary/5 border-l-4 ${col.color}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {task.title}
                        </h4>
                        {getPriorityBadge(task.priority)}
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          {task.assigned_to_name ? (
                            <div className="flex items-center gap-1" title={task.assigned_to_name}>
                              <img
                                src={task.assigned_to_avatar || `https://avatar.vercel.sh/${task.assigned_to}?s=32`}
                                alt={task.assigned_to_name}
                                className="w-4 h-4 rounded-full object-cover"
                              />
                              <span className="truncate max-w-[80px] font-medium text-foreground">
                                {task.assigned_to_name.split(' ')[0]}
                              </span>
                            </div>
                          ) : (
                            <span className="italic">Unassigned</span>
                          )}
                        </div>

                        {task.due_date && (
                          <div className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3 text-primary" />
                            <span>{new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Advance Button */}
                      {userRole !== 'VIEWER' && task.status !== 'completed' && (
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={(e) => handleQuickAdvance(task, e)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline transition-colors"
                          >
                            <span>Move Next</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>

              {/* Add Task Button at bottom of column */}
              {userRole !== 'VIEWER' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCreateDefaultStatus(col.id);
                    setCreateDialogOpen(true);
                  }}
                  className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground justify-center gap-1.5 rounded-xl border border-dashed border-border/60 hover:border-primary/40 h-8"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultStatus={createDefaultStatus}
      />

      <TaskDetailModal
        task={selectedTask}
        open={Boolean(selectedTask)}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </div>
  );
}
