'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Briefcase, Shield, Send, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiListWorkspaces } from '@/lib/workspace-client';
import { Workspace } from '@/lib/workspace-types';

interface WorkspaceInviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  onSendInvite: (workspaceId: string, role: 'ADMIN' | 'EDITOR' | 'VIEWER') => Promise<void>;
}

export function WorkspaceInviteDialog({
  isOpen,
  onClose,
  recipientName,
  onSendInvite,
}: WorkspaceInviteDialogProps) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Array<Workspace & { userRole: string }>>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'EDITOR' | 'VIEWER'>('VIEWER');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setIsLoading(true);
      apiListWorkspaces(user)
        .then(list => {
          // Filter to workspaces where user has ADMIN or EDITOR rights
          const eligible = list.filter(w => w.userRole === 'ADMIN' || w.userRole === 'EDITOR');
          setWorkspaces(eligible);
          if (eligible.length > 0) {
            setSelectedWorkspaceId(eligible[0].id);
          }
        })
        .catch(err => {
          console.error('Failed to load workspaces:', err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, user]);

  const handleSubmit = async () => {
    if (!selectedWorkspaceId) return;
    setIsSubmitting(true);
    try {
      await onSendInvite(selectedWorkspaceId, selectedRole);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to send workspace invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Briefcase className="w-5 h-5 text-primary" />
            <span>Invite {recipientName} to Workspace</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Collaborate in a private workspace with shared tasks, documents, and real-time announcements.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Loading your workspaces...</div>
        ) : workspaces.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-sm font-semibold text-foreground">No Admin Workspaces Found</p>
            <p className="text-xs text-muted-foreground">
              You must be an Admin or Editor of a workspace to invite new collaborators.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Workspace</Label>
              <Select value={selectedWorkspaceId} onValueChange={setSelectedWorkspaceId}>
                <SelectTrigger className="w-full bg-background/50">
                  <SelectValue placeholder="Choose a workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map(w => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} ({w.userRole})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assign Role</Label>
              <Select value={selectedRole} onValueChange={(val: any) => setSelectedRole(val)}>
                <SelectTrigger className="w-full bg-background/50">
                  <SelectValue placeholder="Choose role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEWER">Viewer (Read-only access to files and tasks)</SelectItem>
                  <SelectItem value="EDITOR">Editor (Can create tasks, upload files, comment)</SelectItem>
                  <SelectItem value="ADMIN">Admin (Full management permissions)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 text-primary font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Strict Security Notice</span>
              </div>
              <p>
                The recipient will receive an interactive invitation card in this chat. Access is granted only when they click Accept.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || !selectedWorkspaceId} className="gap-1.5 font-bold">
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending...' : 'Send Invitation Card'}</span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
