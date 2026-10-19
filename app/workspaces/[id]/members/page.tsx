'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from '@/components/workspaces/workspace-context';
import { WorkspaceMember, WorkspaceRole, WorkspaceInvitation } from '@/lib/workspace-types';
import {
  apiUpdateMemberRole,
  apiRemoveMember,
  apiRevokeInvitation,
  apiTransferOwnership
} from '@/lib/workspace-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Users,
  UserPlus,
  ShieldCheck,
  Edit3,
  Eye,
  Trash2,
  Copy,
  Check,
  ShieldAlert,
  ArrowRightLeft,
  Mail,
  Clock,
  Ban,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { InviteMemberDialog } from '@/components/workspaces/invite-member-dialog';

export default function WorkspaceMembersPage() {
  const { user } = useAuth();
  const { workspaceData, userRole, refreshWorkspace } = useWorkspace();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedNewOwner, setSelectedNewOwner] = useState<string>('');
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  if (!workspaceData) return null;

  const { workspace: ws, members, invitations } = workspaceData;
  const isOwner = ws.owner_id === user?.id;

  const handleRoleChange = async (targetUserId: string, newRole: WorkspaceRole) => {
    if (!user) return;
    try {
      await apiUpdateMemberRole(ws.id, targetUserId, newRole, user);
      toast.success('Member role updated successfully!');
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update member role.');
    }
  };

  const handleRemoveMember = async (targetMember: WorkspaceMember) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to remove ${targetMember.user_name} from this workspace? They will immediately lose all access to private files and tasks.`)) {
      return;
    }

    try {
      await apiRemoveMember(ws.id, targetMember.user_id, user);
      toast.success(`${targetMember.user_name} removed from workspace.`);
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove member.');
    }
  };

  const handleRevokeInvitation = async (inv: WorkspaceInvitation) => {
    if (!user) return;
    try {
      await apiRevokeInvitation(ws.id, inv.id, user);
      toast.success(`Invitation for ${inv.email} revoked.`);
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke invitation.');
    }
  };

  const handleCopyInviteLink = (inv: WorkspaceInvitation) => {
    if (inv.token) {
      const url = `${window.location.origin}/workspaces/join/${inv.token}`;
      navigator.clipboard.writeText(url);
      setCopiedTokenId(inv.id);
      toast.success('Invitation link copied to clipboard!');
      setTimeout(() => setCopiedTokenId(null), 2000);
    } else {
      toast.info('Secure token hash stored. Resend invitation to create a new active link.');
    }
  };

  const handleTransferOwnership = async () => {
    if (!user || !selectedNewOwner) return;
    if (!transferConfirmed) {
      toast.error('Please check the confirmation box to proceed.');
      return;
    }

    setIsSubmittingTransfer(true);
    try {
      await apiTransferOwnership(ws.id, selectedNewOwner, user);
      toast.success('Workspace ownership transferred successfully!');
      setTransferDialogOpen(false);
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to transfer ownership.');
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-foreground">Team & Permissions</h1>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] uppercase font-bold">
              {members.length} Active {members.length === 1 ? 'Member' : 'Members'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Role-based access control (RBAC). Only invited and authenticated teammates have access.
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <div className="flex items-center gap-2">
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTransferDialogOpen(true)}
                className="gap-2 text-xs font-bold rounded-xl"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Transfer Ownership</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => setInviteDialogOpen(true)}
              className="gap-2 text-xs font-bold rounded-xl shadow-md shadow-primary/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Teammate</span>
            </Button>
          </div>
        )}
      </div>

      {/* Role Definitions Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-primary">
            <ShieldCheck className="w-4 h-4" />
            <span>ADMIN ROLE</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Full authority: Manage members, adjust roles, configure download security, upload/delete files, and manage announcements.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <Edit3 className="w-4 h-4" />
            <span>EDITOR ROLE</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Collaborator: Upload files, create folders, add & update tasks, post comments, and participate in sprints.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-blue-400">
            <Eye className="w-4 h-4" />
            <span>VIEWER ROLE</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Auditor/Observer: Read-only access to files and tasks. File download can be permitted or restricted by workspace policy.
          </p>
        </div>
      </div>

      {/* Active Members Table */}
      <Card className="p-5 bg-card border-border rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-sm text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Active Teammates ({members.length})
          </h2>
          <span className="text-[11px] text-muted-foreground">
            Strict server-side authorization enforced on every request
          </span>
        </div>

        <div className="rounded-xl border border-border/80 overflow-hidden divide-y divide-border/60">
          {members.map((member) => {
            const isTargetOwner = member.user_id === ws.owner_id;
            const isSelf = member.user_id === user?.id;

            return (
              <div
                key={member.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={member.user_avatar}
                    alt={member.user_name}
                    className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm truncate">{member.user_name}</span>
                      {isTargetOwner && (
                        <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[9px] font-black uppercase">
                          Workspace Owner
                        </Badge>
                      )}
                      {isSelf && (
                        <span className="text-[10px] text-muted-foreground">(You)</span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {member.user_email} • Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Role Switcher or Badge */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  {userRole === 'ADMIN' && !isTargetOwner ? (
                    <Select
                      value={member.role}
                      onValueChange={(val) => handleRoleChange(member.user_id, val as WorkspaceRole)}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs font-bold bg-muted/50 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                        <SelectItem value="EDITOR">EDITOR</SelectItem>
                        <SelectItem value="VIEWER">VIEWER</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      member.role === 'ADMIN'
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : member.role === 'EDITOR'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {member.role}
                    </span>
                  )}

                  {/* Remove Member Button */}
                  {userRole === 'ADMIN' && !isTargetOwner && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveMember(member)}
                      className="h-8 text-xs font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 px-2"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Pending Invitations Section (Admins Only) */}
      {userRole === 'ADMIN' && (
        <Card className="p-5 bg-card border-border rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" /> Pending Invitations ({invitations.filter(i => i.status === 'pending').length})
            </h2>
            <span className="text-[11px] text-muted-foreground">
              Single-use tokens with cryptographic verification
            </span>
          </div>

          {invitations.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-3 text-center border border-dashed border-border/60 rounded-xl">
              No pending invitations. Click "Invite Teammate" to invite collaborators.
            </p>
          ) : (
            <div className="rounded-xl border border-border/80 overflow-hidden divide-y divide-border/60">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground truncate">{inv.email}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded-full ${
                        inv.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : inv.status === 'accepted'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {inv.status}
                      </span>
                      <span className="text-[10px] text-primary font-bold">Role: {inv.role}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Invited by {inv.invited_by_name} • Expires {new Date(inv.expires_at).toLocaleDateString()}
                    </p>
                  </div>

                  {inv.status === 'pending' && (
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {inv.token && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyInviteLink(inv)}
                          className="h-8 text-xs font-bold gap-1.5 rounded-xl"
                        >
                          {copiedTokenId === inv.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copied Link</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Invite Link</span>
                            </>
                          )}
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRevokeInvitation(inv)}
                        className="h-8 text-xs font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 gap-1 rounded-xl"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Revoke</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Transfer Ownership Modal */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-foreground">Transfer Workspace Ownership</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Transfer full administrative control and ownership of <strong className="text-foreground">{ws.name}</strong>.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-muted-foreground space-y-1">
              <span className="font-bold text-foreground">Critical Notice:</span>
              <p className="text-[11px] leading-relaxed">
                The new owner will have unilateral authority over this workspace, including the ability to remove you, manage all confidential files, or delete the workspace.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Select New Owner</Label>
              <Select value={selectedNewOwner} onValueChange={setSelectedNewOwner}>
                <SelectTrigger className="bg-muted/50 border-border text-xs">
                  <SelectValue placeholder="Select active workspace member" />
                </SelectTrigger>
                <SelectContent>
                  {members
                    .filter((m) => m.user_id !== user?.id)
                    .map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.user_name} ({m.user_email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start gap-2 p-3 bg-muted/40 rounded-xl border border-border/60">
              <input
                type="checkbox"
                id="confirm-transfer"
                checked={transferConfirmed}
                onChange={(e) => setTransferConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-border"
              />
              <label htmlFor="confirm-transfer" className="text-xs text-foreground cursor-pointer font-medium leading-relaxed">
                I explicitly confirm that I want to transfer ownership of this workspace.
              </label>
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTransferDialogOpen(false)}
                disabled={isSubmittingTransfer}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTransferOwnership}
                disabled={isSubmittingTransfer || !selectedNewOwner || !transferConfirmed}
                className="gap-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-md shadow-amber-500/20"
              >
                {isSubmittingTransfer ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transferring...</span>
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Confirm Transfer</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <InviteMemberDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />
    </div>
  );
}
