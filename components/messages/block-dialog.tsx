'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserX } from 'lucide-react';

interface BlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserName: string;
  onConfirmBlock: () => Promise<void>;
}

export function BlockDialog({ isOpen, onClose, targetUserName, onConfirmBlock }: BlockDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBlock = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmBlock();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to block user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-rose-500">
            <UserX className="w-5 h-5" />
            <span>Block {targetUserName}?</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            They will no longer be able to send you direct messages, message requests, or view your online availability. You can unblock them at any time.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBlock}
            disabled={isSubmitting}
            className="font-bold"
          >
            {isSubmitting ? 'Blocking...' : 'Block User'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
