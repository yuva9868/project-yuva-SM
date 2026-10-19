'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiCreateWorkspace } from '@/lib/workspace-client';
import { getStoredProjects } from '@/lib/community-data';
import { Project } from '@/lib/community-types';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Lock, Plus, Upload, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (workspaceId: string) => void;
}

export function CreateWorkspaceDialog({ open, onOpenChange, onSuccess }: CreateWorkspaceDialogProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [linkedProjectId, setLinkedProjectId] = useState<string>('none');
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const allProjects = getStoredProjects();
      setUserProjects(allProjects);
    }
  }, [user]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo image must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a workspace.');
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      toast.error('Please enter a workspace name with at least 2 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedProject = linkedProjectId !== 'none' 
        ? userProjects.find(p => p.id === linkedProjectId) 
        : undefined;

      const created = await apiCreateWorkspace(
        {
          name: name.trim(),
          description: description.trim(),
          logo_path: logoUrl || undefined,
          cover_image: coverImageUrl || undefined,
          linked_project_id: selectedProject ? selectedProject.id : undefined,
          linked_project_title: selectedProject ? selectedProject.name : undefined,
        },
        user
      );

      toast.success(`Private workspace "${created.name}" created! You are the Administrator.`);
      onOpenChange(false);
      setName('');
      setDescription('');
      setLogoUrl('');
      setLinkedProjectId('none');

      if (onSuccess) {
        onSuccess(created.id);
      } else {
        router.push(`/workspaces/${created.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create workspace.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-foreground">Create Private Workspace</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Confidential collaboration environment with role-based access control and encrypted file storage.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Workspace Name */}
          <div className="space-y-1.5">
            <Label htmlFor="ws-name" className="text-xs font-bold text-foreground">
              Workspace Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="ws-name"
              placeholder="e.g. IdeaCheck Core Founders"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted/50 border-border text-sm"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="ws-desc" className="text-xs font-bold text-foreground">
              Description & Purpose
            </Label>
            <Textarea
              id="ws-desc"
              placeholder="Describe what your team will collaborate on (e.g. Investor pitch materials, confidential code, and cap table)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-muted/50 border-border text-sm resize-none h-20"
            />
          </div>

          {/* Logo Upload or URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Workspace Logo / Icon</Label>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo preview" className="w-12 h-12 rounded-xl object-cover border border-primary/30" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/60 text-xs font-semibold hover:bg-muted transition-colors">
                      <Upload className="w-3.5 h-3.5 text-primary" />
                      <span>Upload Logo</span>
                    </span>
                    <input type="file" accept="image/*" onChange={handleLogoFileChange} className="hidden" />
                  </label>
                  <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG or WebP (max 2MB)</p>
                </div>
              </div>
            </div>

            {/* Link Startup Project */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                Link IdeaCheck Project (Optional)
              </Label>
              <Select value={linkedProjectId} onValueChange={setLinkedProjectId}>
                <SelectTrigger className="bg-muted/50 border-border text-xs">
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked project (Standalone)</SelectItem>
                  {userProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">Enables quick navigation between your startup and workspace.</p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-foreground">Private by Default:</span> Only you and explicitly invited team members can see or access this workspace. You will be assigned the <span className="text-primary font-bold">Admin</span> role with full management permissions.
            </div>
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
                  <span>Creating Workspace...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Workspace</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
