'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from '@/components/workspaces/workspace-context';
import {
  apiUpdateWorkspace,
  apiArchiveWorkspace,
  apiDeleteWorkspace,
} from '@/lib/workspace-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Settings,
  ShieldAlert,
  Archive,
  Trash2,
  Lock,
  Save,
  Loader2,
  Upload,
  AlertTriangle,
  ArrowRightLeft,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { workspaceData, userRole, refreshWorkspace } = useWorkspace();

  const [name, setName] = useState(workspaceData?.workspace.name || '');
  const [description, setDescription] = useState(workspaceData?.workspace.description || '');
  const [logoUrl, setLogoUrl] = useState(workspaceData?.workspace.logo_path || '');
  const [allowViewerDownload, setAllowViewerDownload] = useState(
    workspaceData?.workspace.settings.allowViewerDownload ?? false
  );
  const [allowEditorDownload, setAllowEditorDownload] = useState(
    workspaceData?.workspace.settings.allowEditorDownload ?? true
  );

  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteName, setConfirmDeleteName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!workspaceData) return null;

  const ws = workspaceData.workspace;
  const isOwner = ws.owner_id === user?.id;

  if (userRole !== 'ADMIN') {
    return (
      <div className="p-8 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-black text-foreground">Admin Access Required</h2>
        <p className="text-xs text-muted-foreground">
          Only workspace administrators can modify settings, security rules, and destructive policies.
        </p>
      </div>
    );
  }

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      toast.error('Workspace name cannot be empty.');
      return;
    }

    setIsSavingGeneral(true);
    try {
      await apiUpdateWorkspace(
        ws.id,
        {
          name: name.trim(),
          description: description.trim(),
          logo_path: logoUrl,
          settings: {
            ...ws.settings,
            allowViewerDownload,
            allowEditorDownload,
          },
        },
        user
      );
      toast.success('Workspace settings updated successfully!');
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings.');
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleToggleArchive = async () => {
    if (!user) return;
    const isCurrentlyArchived = Boolean(ws.archived_at);
    const actionText = isCurrentlyArchived ? 'unarchive' : 'archive';

    if (!confirm(`Are you sure you want to ${actionText} this workspace?`)) return;

    setIsArchiving(true);
    try {
      await apiArchiveWorkspace(ws.id, !isCurrentlyArchived, user);
      toast.success(`Workspace ${isCurrentlyArchived ? 'unarchived' : 'archived'}.`);
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${actionText} workspace.`);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!user) return;
    if (confirmDeleteName !== ws.name) {
      toast.error('Workspace name does not match.');
      return;
    }

    setIsDeleting(true);
    try {
      await apiDeleteWorkspace(ws.id, confirmDeleteName, user);
      toast.success('Workspace permanently deleted.');
      router.push('/workspaces');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete workspace.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="border-b border-border/80 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-foreground">Workspace Administration & Security</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure confidential parameters, download permissions, and repository governance.
        </p>
      </div>

      {/* General Settings */}
      <Card className="p-6 bg-card border-border rounded-2xl space-y-5">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Settings className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-sm text-foreground">General Profile</h2>
        </div>

        <form onSubmit={handleSaveGeneral} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ws-name" className="text-xs font-bold text-foreground">
              Workspace Name
            </Label>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted/40 border-border text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ws-desc" className="text-xs font-bold text-foreground">
              Workspace Description & Mission
            </Label>
            <Textarea
              id="ws-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-muted/40 border-border text-xs resize-none h-20"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ws-logo" className="text-xs font-bold text-foreground">
              Workspace Logo URL
            </Label>
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-border" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xs font-bold">
                  {ws.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <Input
                id="ws-logo"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="bg-muted/40 border-border text-xs flex-1"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isSavingGeneral}
              size="sm"
              className="gap-2 text-xs font-bold rounded-xl shadow-md shadow-primary/20"
            >
              {isSavingGeneral ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Profile Changes</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* Security & Confidentiality Policies */}
      <Card className="p-6 bg-card border-border rounded-2xl space-y-5">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Lock className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-sm text-foreground">Confidentiality & Download Access Controls</h2>
        </div>

        <div className="space-y-4 text-xs">
          {/* Allow Viewer Download Toggle */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-bold text-foreground block">Allow Viewers to Download Files</span>
              <p className="text-[11px] text-muted-foreground">
                When disabled, Viewers can read project details and task descriptions, but the server will strictly reject any file download or binary stream attempts.
              </p>
            </div>
            <Switch
              checked={allowViewerDownload}
              onCheckedChange={setAllowViewerDownload}
            />
          </div>

          {/* Allow Editor Download Toggle */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-bold text-foreground block">Allow Editors to Download Files</span>
              <p className="text-[11px] text-muted-foreground">
                Enables team contributors with Editor role to download uploaded confidential assets.
              </p>
            </div>
            <Switch
              checked={allowEditorDownload}
              onCheckedChange={setAllowEditorDownload}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveGeneral}
              disabled={isSavingGeneral}
              size="sm"
              className="gap-2 text-xs font-bold rounded-xl"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Security Policies</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Teammates Quick Access */}
      <Card className="p-6 bg-card border-border rounded-2xl flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="font-bold text-sm text-foreground">Member & Role Management</h3>
          <p className="text-xs text-muted-foreground">
            Configure member roles (Admin, Editor, Viewer) and single-use invitation tokens.
          </p>
        </div>
        <Link href={`/workspaces/${ws.id}/members`}>
          <Button variant="outline" size="sm" className="text-xs font-bold rounded-xl">
            Manage Members
          </Button>
        </Link>
      </Card>

      {/* Danger Zone: Archive & Deletion */}
      <Card className="p-6 bg-card border-rose-500/30 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-rose-500/20 pb-3">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <h2 className="font-bold text-sm text-rose-500">Danger Zone</h2>
        </div>

        <div className="space-y-4 text-xs">
          {/* Archive Workspace */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/20 border border-border/60">
            <div>
              <span className="font-bold text-foreground block">
                {ws.archived_at ? 'Unarchive Workspace' : 'Archive Workspace'}
              </span>
              <p className="text-[11px] text-muted-foreground">
                {ws.archived_at
                  ? 'Restore full active collaboration for this workspace.'
                  : 'Freezes workspace activity and hides from normal active lists.'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleArchive}
              disabled={isArchiving}
              className="text-xs font-bold rounded-xl shrink-0"
            >
              <Archive className="w-3.5 h-3.5 mr-1" />
              <span>{ws.archived_at ? 'Unarchive' : 'Archive'}</span>
            </Button>
          </div>

          {/* Delete Workspace */}
          {isOwner ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <div>
                <span className="font-bold text-rose-500 block">Permanently Delete Workspace</span>
                <p className="text-[11px] text-muted-foreground">
                  Permanently deletes all confidential files, folders, task boards, comments, and member records. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteModalOpen(true)}
                className="text-xs font-bold rounded-xl shrink-0 shadow-md shadow-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                <span>Delete Workspace</span>
              </Button>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground italic">
              Only the workspace owner ({workspaceData.members.find(m => m.user_id === ws.owner_id)?.user_name || 'Owner'}) can permanently delete this workspace.
            </p>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[480px] bg-card border-rose-500/30">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-rose-500">Delete Workspace Permanently</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  This action is irreversible and immediately wipes all confidential files.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1 text-muted-foreground">
              <span className="font-bold text-foreground">The following records will be destroyed:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>{workspaceData.files.length} uploaded confidential files and storage keys</li>
                <li>{workspaceData.tasks.length} task deliverables and sprint logs</li>
                <li>All member access permissions and invite tokens</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                To confirm, type <strong className="text-primary font-mono">{ws.name}</strong> below:
              </Label>
              <Input
                value={confirmDeleteName}
                onChange={(e) => setConfirmDeleteName(e.target.value)}
                placeholder={ws.name}
                className="bg-muted/50 border-border text-xs"
              />
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteWorkspace}
                disabled={isDeleting || confirmDeleteName !== ws.name}
                className="gap-2 text-xs font-bold shadow-md shadow-rose-500/20"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting Workspace...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
