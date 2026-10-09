'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Project, 
  WorkspaceTask, 
  WorkspaceResource, 
  WorkspaceNote 
} from '@/lib/community-types';
import { 
  getStoredWorkspaceTasks, 
  saveStoredWorkspaceTask, 
  updateWorkspaceTaskStatus,
  getStoredWorkspaceResources,
  saveStoredWorkspaceResource,
  getStoredWorkspaceNotes,
  saveStoredWorkspaceNote,
  getStoredCollaborations
} from '@/lib/community-data';
import { useAuth } from '@/lib/auth-context';
import { 
  Layers, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Users, 
  Link as LinkIcon, 
  ExternalLink, 
  Lock, 
  Send, 
  Check, 
  X, 
  AlertCircle 
} from 'lucide-react';

interface WorkspacePanelProps {
  project: Project;
  isOwner: boolean;
}

export function WorkspacePanel({ project, isOwner }: WorkspacePanelProps) {
  const { user } = useAuth();
  
  // Check if current user is an accepted collaborator
  const collabs = getStoredCollaborations(user?.id);
  const isAcceptedCollab = collabs.some(c => 
    c.projectId === project.id && 
    (c.senderId === user?.id || c.recipientId === user?.id) && 
    c.status === 'accepted'
  );

  const hasAccess = isOwner || isAcceptedCollab;

  const [tasks, setTasks] = useState<WorkspaceTask[]>(() => getStoredWorkspaceTasks(project.id));
  const [resources, setResources] = useState<WorkspaceResource[]>(() => getStoredWorkspaceResources(project.id));
  const [notes, setNotes] = useState<WorkspaceNote[]>(() => getStoredWorkspaceNotes(project.id));

  // Modals & form states
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState(user?.name || project.founderName);
  const [taskPriority, setTaskPriority] = useState<WorkspaceTask['priority']>('medium');

  // Resource form
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resCat, setResCat] = useState<WorkspaceResource['category']>('Repository');

  if (!hasAccess) {
    return (
      <Card className="p-12 text-center border-dashed rounded-2xl space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-bold text-foreground">Private Collaborator Workspace</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            This workspace is reserved for {project.founderName} and accepted collaborators on {project.name}.
          </p>
        </div>
        <p className="text-xs text-primary font-semibold">
          Submit a collaboration request in the "Needs & Team" tab to join the project workspace.
        </p>
      </Card>
    );
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: WorkspaceTask = {
      id: 'task_' + Math.random().toString(36).substring(2, 9),
      projectId: project.id,
      title: taskTitle,
      description: taskDesc,
      status: 'todo',
      assigneeName: taskAssignee,
      priority: taskPriority,
      createdAt: new Date().toISOString()
    };

    saveStoredWorkspaceTask(newTask);
    setTasks(getStoredWorkspaceTasks(project.id));
    setTaskModalOpen(false);
    setTaskTitle('');
    setTaskDesc('');
  };

  const handleStatusChange = (taskId: string, newStatus: WorkspaceTask['status']) => {
    updateWorkspaceTaskStatus(project.id, taskId, newStatus);
    setTasks(getStoredWorkspaceTasks(project.id));
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resUrl.trim()) return;

    const newRes: WorkspaceResource = {
      id: 'res_' + Math.random().toString(36).substring(2, 9),
      projectId: project.id,
      title: resTitle,
      url: resUrl,
      category: resCat,
      addedBy: user?.name || 'Team Member',
      createdAt: new Date().toISOString()
    };

    saveStoredWorkspaceResource(newRes);
    setResources(getStoredWorkspaceResources(project.id));
    setResourceModalOpen(false);
    setResTitle('');
    setResUrl('');
  };

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    const newNote: WorkspaceNote = {
      id: 'note_' + Math.random().toString(36).substring(2, 9),
      projectId: project.id,
      authorName: user?.name || 'Team Member',
      authorAvatar: user?.avatar || `https://avatar.vercel.sh/${user?.email || 'team'}?s=96`,
      content: newNoteContent,
      createdAt: new Date().toISOString()
    };

    saveStoredWorkspaceNote(newNote);
    setNotes(getStoredWorkspaceNotes(project.id));
    setNewNoteContent('');
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-card border border-border rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{project.name} Collaboration Workspace</h3>
            <p className="text-xs text-muted-foreground">
              Internal tasks, sprint board, shared repositories, and team discussion.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setResourceModalOpen(true)} className="rounded-xl text-xs gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-primary" />
            <span>Add Resource</span>
          </Button>
          <Button size="sm" onClick={() => setTaskModalOpen(true)} className="rounded-xl text-xs font-bold gap-1.5 shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* TO DO */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-muted-foreground">
            <span>To Do ({todoTasks.length})</span>
            <span className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <div className="space-y-2.5">
            {todoTasks.map(t => (
              <Card key={t.id} className="p-4 bg-card border-border rounded-xl space-y-2 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="text-xs font-bold text-foreground">{t.title}</h5>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                    {t.priority}
                  </span>
                </div>
                {t.description && <p className="text-[11px] text-muted-foreground">{t.description}</p>}
                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px]">
                  <span className="text-muted-foreground">{t.assigneeName}</span>
                  <button 
                    onClick={() => handleStatusChange(t.id, 'in_progress')}
                    className="text-primary hover:underline font-bold"
                  >
                    Start →
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* IN PROGRESS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-primary">
            <span>In Progress ({inProgressTasks.length})</span>
            <span className="w-2 h-2 rounded-full bg-primary" />
          </div>
          <div className="space-y-2.5">
            {inProgressTasks.map(t => (
              <Card key={t.id} className="p-4 bg-card border-primary/30 rounded-xl space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="text-xs font-bold text-foreground">{t.title}</h5>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                    {t.priority}
                  </span>
                </div>
                {t.description && <p className="text-[11px] text-muted-foreground">{t.description}</p>}
                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px]">
                  <span className="text-muted-foreground">{t.assigneeName}</span>
                  <button 
                    onClick={() => handleStatusChange(t.id, 'done')}
                    className="text-emerald-400 hover:underline font-bold"
                  >
                    Done ✓
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* DONE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-emerald-400">
            <span>Completed ({doneTasks.length})</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="space-y-2.5">
            {doneTasks.map(t => (
              <Card key={t.id} className="p-4 bg-card/60 border-border rounded-xl space-y-2 opacity-85">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="text-xs font-bold text-foreground line-through decoration-muted-foreground/60">{t.title}</h5>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
                {t.description && <p className="text-[11px] text-muted-foreground">{t.description}</p>}
                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                  <span>{t.assigneeName}</span>
                  <span>Completed</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Shared Resources & Discussion Grid */}
      <div className="grid md:grid-cols-2 gap-6 pt-4">
        {/* Shared Team Resources */}
        <Card className="p-5 bg-card border-border rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Shared Resources & Repositories</h4>
            <span className="text-[11px] text-primary font-bold">{resources.length} links</span>
          </div>

          <div className="space-y-2">
            {resources.map(res => (
              <a 
                key={res.id} 
                href={res.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border/60 transition-colors text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary text-secondary-foreground font-semibold">
                    {res.category}
                  </span>
                  <span className="font-medium text-foreground truncate">{res.title}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2" />
              </a>
            ))}
          </div>
        </Card>

        {/* Sprint Discussion Notes */}
        <Card className="p-5 bg-card border-border rounded-2xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Team Updates & Sprint Log</h4>
          
          <form onSubmit={handlePostNote} className="flex gap-2">
            <Input 
              placeholder="Post a quick sync update..." 
              value={newNoteContent} 
              onChange={e => setNewNoteContent(e.target.value)} 
              className="text-xs rounded-xl" 
            />
            <Button size="sm" type="submit" className="rounded-xl px-3 shrink-0">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>

          <div className="space-y-2 max-h-52 overflow-y-auto pt-1">
            {notes.map(note => (
              <div key={note.id} className="p-3 bg-muted/20 border border-border/40 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                  <span className="font-bold text-foreground">{note.authorName}</span>
                  <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-foreground/90">{note.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* MODAL: New Task */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">Create Workspace Task</h3>
              <button onClick={() => setTaskModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Task Title</Label>
                <Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required className="rounded-xl text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Description</Label>
                <Textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} className="rounded-xl text-xs" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Assignee</Label>
                  <Input value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} className="rounded-xl text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Priority</Label>
                  <select 
                    value={taskPriority} 
                    onChange={e => setTaskPriority(e.target.value as any)}
                    className="w-full p-2 bg-input border border-border rounded-xl text-xs text-foreground"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setTaskModalOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl font-bold text-xs">Create Task</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: New Resource */}
      {resourceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">Add Shared Resource</h3>
              <button onClick={() => setResourceModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleAddResource} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Resource Title</Label>
                <Input placeholder="e.g. GitHub Core Repo" value={resTitle} onChange={e => setResTitle(e.target.value)} required className="rounded-xl text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">URL</Label>
                <Input placeholder="https://..." value={resUrl} onChange={e => setResUrl(e.target.value)} required className="rounded-xl text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category</Label>
                <select 
                  value={resCat} 
                  onChange={e => setResCat(e.target.value as any)}
                  className="w-full p-2 bg-input border border-border rounded-xl text-xs text-foreground"
                >
                  <option value="Repository">Repository</option>
                  <option value="Design">Design</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setResourceModalOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl font-bold text-xs">Save Resource</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
