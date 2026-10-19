'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from './workspace-context';
import { apiCreateFolder } from '@/lib/workspace-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { FolderPlus, Loader2, Plus } from 'lucide-react';

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFolderId?: string | null;
}

export function CreateFolderDialog({ open, onOpenChange, currentFolderId }: CreateFolderDialogProps) {
  const { user } = useAuth();
  const { workspaceData, refreshWorkspace } = useWorkspace();

  const [name, setName] = useState('');
  const [parentFolderId, setParentFolderId] = useState<string>(currentFolderId || 'root');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!workspaceData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      toast.error('Folder name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const parent = parentFolderId === 'root' ? null : parentFolderId;
      await apiCreateFolder(workspaceData.workspace.id, name.trim(), parent, user);
      toast.success(`Folder "${name}" created!`);
      refreshWorkspace();
      setName('');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create folder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-foreground">Create Folder</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Organize confidential assets into secure directories.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="folder-name" className="text-xs font-bold text-foreground">
              Folder Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="folder-name"
              placeholder="e.g. Legal & Cap Table"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted/50 border-border text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Parent Location</Label>
            <Select value={parentFolderId} onValueChange={setParentFolderId}>
              <SelectTrigger className="bg-muted/50 border-border text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">📁 Root Level</SelectItem>
                {workspaceData.folders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    📁 {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="gap-2 text-xs font-bold shadow-md shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Folder</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
