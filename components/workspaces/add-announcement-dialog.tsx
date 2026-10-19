'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from './workspace-context';
import { apiAddAnnouncement } from '@/lib/workspace-client';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Megaphone, Loader2, Plus } from 'lucide-react';

interface AddAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAnnouncementDialog({ open, onOpenChange }: AddAnnouncementDialogProps) {
  const { user } = useAuth();
  const { workspaceData, refreshWorkspace } = useWorkspace();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!workspaceData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim() || !content.trim()) {
      toast.error('Title and announcement content are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiAddAnnouncement(
        workspaceData.workspace.id,
        {
          title: title.trim(),
          content: content.trim(),
          pinned,
        },
        user
      );

      toast.success('Announcement published to workspace!');
      refreshWorkspace();
      onOpenChange(false);
      setTitle('');
      setContent('');
      setPinned(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to post announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-foreground">Post Workspace Announcement</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Broadcast critical updates, security warnings, or milestone celebrations to your team.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="ann-title" className="text-xs font-bold text-foreground">
              Announcement Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="ann-title"
              placeholder="e.g. 🔒 Confidential: Board Deck Review Completed"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-muted/50 border-border text-sm"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <Label htmlFor="ann-content" className="text-xs font-bold text-foreground">
              Message Content <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="ann-content"
              placeholder="Write your announcement details here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-muted/50 border-border text-sm resize-none h-24"
              required
            />
          </div>

          {/* Pinned Checkbox */}
          <div className="flex items-center space-x-2 p-3 bg-muted/40 rounded-xl border border-border/60">
            <Checkbox
              id="pinned"
              checked={pinned}
              onCheckedChange={(c) => setPinned(Boolean(c))}
            />
            <label
              htmlFor="pinned"
              className="text-xs font-semibold leading-none cursor-pointer text-foreground"
            >
              Pin to top of Workspace Overview
            </label>
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
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="gap-2 text-xs font-bold shadow-md shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Publish Announcement</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
