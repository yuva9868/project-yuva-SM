'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserName: string;
  onSubmitReport: (reason: string, details?: string) => Promise<void>;
}

export function ReportDialog({ isOpen, onClose, targetUserName, onSubmitReport }: ReportDialogProps) {
  const [reason, setReason] = useState<string>('spam');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitReport(reason, details);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-rose-500">
            <ShieldAlert className="w-5 h-5" />
            <span>Report User or Message</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Help maintain a professional, respectful founder community. Reports are reviewed by community moderators.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Violation Type</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Unsolicited spam or mass promotion</SelectItem>
                <SelectItem value="harassment">Harassment or abusive language</SelectItem>
                <SelectItem value="scam">Scam, impersonation, or deceptive conduct</SelectItem>
                <SelectItem value="inappropriate">Inappropriate or prohibited content</SelectItem>
                <SelectItem value="other">Other policy violation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Additional Details (Optional)</Label>
            <Textarea
              placeholder="Describe what occurred with specific context..."
              value={details}
              onChange={e => setDetails(e.target.value)}
              className="h-20 text-xs bg-background/50 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="font-bold"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
