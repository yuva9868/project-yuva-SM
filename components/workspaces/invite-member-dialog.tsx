'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from './workspace-context';
import { apiInviteMember } from '@/lib/workspace-client';
import { WorkspaceRole } from '@/lib/workspace-types';
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
import { 
  UserPlus, 
  Copy, 
  Check, 
  ShieldAlert, 
  Loader2, 
  Mail, 
  ShieldCheck, 
  Edit3, 
  Eye,
  Info
} from 'lucide-react';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({ open, onOpenChange }: InviteMemberDialogProps) {
  const { user } = useAuth();
  const { workspaceData, refreshWorkspace } = useWorkspace();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('VIEWER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInviteLink, setCreatedInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!workspaceData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const inv = await apiInviteMember(
        workspaceData.workspace.id,
        { email: email.trim(), role },
        user
      );

      toast.success(`Invitation generated for ${email}!`);
      
      // Generate development fallback link
      const inviteUrl = `${window.location.origin}/workspaces/join/${inv.token}`;
      setCreatedInviteLink(inviteUrl);
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to invite member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (createdInviteLink) {
      navigator.clipboard.writeText(createdInviteLink);
      setCopied(true);
      toast.success('Invitation link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setCreatedInviteLink(null);
    setEmail('');
    setRole('VIEWER');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-foreground">Invite Teammate</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Grant confidential access to <strong className="text-foreground">{workspaceData.workspace.name}</strong>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {createdInviteLink ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Check className="w-4 h-4" />
                <span>Invitation Token Created Successfully!</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Because direct SMTP email dispatch is running in development mode, use the single-use invite link below to invite your teammate.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Single-Use Invite Link</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={createdInviteLink}
                  className="bg-muted/70 text-xs font-mono select-all border-border"
                />
                <Button
                  type="button"
                  onClick={handleCopyLink}
                  className="gap-1.5 text-xs font-bold shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Expires in 7 days. Recipient must verify they own the invited email ({email}).
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button onClick={handleClose} className="w-full text-xs font-bold">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="invite-email" className="text-xs font-bold text-foreground">
                Teammate's Email Address <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="name@startup.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-muted/50 border-border text-sm"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="invite-role" className="text-xs font-bold text-foreground">
                Assigned Role & Permissions
              </Label>
              <Select value={role} onValueChange={(val) => setRole(val as WorkspaceRole)}>
                <SelectTrigger id="invite-role" className="bg-muted/50 border-border text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      <span className="font-bold">ADMIN</span>
                      <span className="text-muted-foreground text-[10px]">— Full workspace control & members</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="EDITOR">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold">EDITOR</span>
                      <span className="text-muted-foreground text-[10px]">— Upload files, create tasks & folders</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="VIEWER">
                    <div className="flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-bold">VIEWER</span>
                      <span className="text-muted-foreground text-[10px]">— Read-only access to files & discussions</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Info notice */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Development Notice: A secure, single-use cryptographically signed link will be generated instantly for immediate sharing.
              </p>
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="gap-2 text-xs font-bold shadow-md shadow-primary/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Invitation...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Generate Invitation</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
