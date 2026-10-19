'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from './workspace-context';
import { WorkspaceFile, WorkspaceComment } from '@/lib/workspace-types';
import { apiDownloadFile, apiAddComment, apiRenameFile, apiMoveFile, apiDeleteFile } from '@/lib/workspace-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Trash2,
  Edit2,
  FolderInput,
  MessageSquare,
  Send,
  Calendar,
  User,
  ShieldAlert,
  Lock,
  Eye,
  FileCheck,
  X
} from 'lucide-react';

interface FilePreviewModalProps {
  file: WorkspaceFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilePreviewModal({ file, open, onOpenChange }: FilePreviewModalProps) {
  const { user } = useAuth();
  const { workspaceData, userRole, refreshWorkspace } = useWorkspace();

  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newFilename, setNewFilename] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isMoving, setIsMoving] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string>('root');

  if (!file || !workspaceData) return null;

  const comments = workspaceData.comments.filter(c => c.file_id === file.id);
  const isImage = file.content_type.startsWith('image/');
  const isPdf = file.content_type === 'application/pdf';
  const isDoc = file.content_type.includes('word') || file.content_type.includes('sheet') || file.content_type.includes('presentation') || file.content_type.includes('csv') || file.content_type.includes('text');

  const handleDownload = async () => {
    if (!user) return;
    try {
      await apiDownloadFile(workspaceData.workspace.id, file.id, user);
      toast.success(`Downloaded "${file.original_filename}"`);
    } catch (err: any) {
      toast.error(err.message || 'Download denied by workspace policy.');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await apiAddComment(
        workspaceData.workspace.id,
        {
          fileId: file.id,
          content: commentText.trim(),
        },
        user
      );
      toast.success('Comment posted!');
      setCommentText('');
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSaveRename = async () => {
    if (!user || !newFilename.trim()) return;
    try {
      await apiRenameFile(workspaceData.workspace.id, file.id, newFilename.trim(), newDescription, user);
      toast.success('File details updated!');
      setIsEditing(false);
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to rename file.');
    }
  };

  const handleSaveMove = async () => {
    if (!user) return;
    try {
      const folder = targetFolderId === 'root' ? null : targetFolderId;
      await apiMoveFile(workspaceData.workspace.id, file.id, folder, user);
      toast.success('File moved successfully!');
      setIsMoving(false);
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to move file.');
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!confirm(`Are you sure you want to permanently delete "${file.original_filename}"?`)) return;

    try {
      await apiDeleteFile(workspaceData.workspace.id, file.id, user);
      toast.success('File deleted.');
      onOpenChange(false);
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete file.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-start justify-between gap-3 sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-black text-foreground truncate">
                {file.original_filename}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                <span>{(file.file_size / 1024 / 1024).toFixed(2)} MB</span>
                <span>•</span>
                <span className="truncate">{file.content_type}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handleDownload}
              size="sm"
              className="gap-1.5 font-bold text-xs rounded-xl shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Visual Preview Box */}
          <div className="rounded-2xl border border-border/80 bg-muted/20 overflow-hidden flex flex-col items-center justify-center min-h-[220px] p-4 text-center">
            {isImage ? (
              <img
                src={file.file_data_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
                alt={file.original_filename}
                className="max-h-[350px] w-auto rounded-xl object-contain shadow-md"
              />
            ) : isPdf ? (
              <div className="space-y-3 py-6 max-w-sm mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-extrabold text-foreground text-sm">Confidential PDF Document</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Protected under IdeaCheck AI workspace encryption policies. Download to view full vector charts and investor disclosures.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={handleDownload} className="text-xs font-bold gap-1.5 rounded-xl">
                  <Eye className="w-3.5 h-3.5 text-primary" /> View Full Document
                </Button>
              </div>
            ) : (
              <div className="space-y-2 py-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-foreground text-sm">{file.original_filename}</h4>
                <p className="text-xs text-muted-foreground">Encrypted confidential asset ready for authorized download.</p>
              </div>
            )}
          </div>

          {/* Metadata & Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
              <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider text-muted-foreground">
                File Details
              </span>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded By:</span>
                  <span className="font-semibold text-foreground">{file.uploaded_by_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Upload Date:</span>
                  <span className="font-semibold text-foreground">{new Date(file.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage Key:</span>
                  <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[150px]">{file.storage_key}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
              <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider text-muted-foreground">
                Description & Notes
              </span>
              <p className="text-muted-foreground leading-relaxed italic">
                {file.description || 'No description provided for this file.'}
              </p>
            </div>
          </div>

          {/* Quick Admin/Editor Actions: Rename / Move / Delete */}
          {userRole !== 'VIEWER' && (
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">File Management Actions</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setNewFilename(file.original_filename);
                      setNewDescription(file.description);
                    }}
                    className="h-7 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Rename</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsMoving(!isMoving);
                      setTargetFolderId(file.folder_id || 'root');
                    }}
                    className="h-7 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <FolderInput className="w-3 h-3" />
                    <span>Move</span>
                  </Button>

                  {(userRole === 'ADMIN' || file.uploaded_by === user?.id) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDelete}
                      className="h-7 text-xs font-semibold gap-1 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Inline Rename Form */}
              {isEditing && (
                <div className="p-3 rounded-lg bg-card border border-border space-y-2 text-xs">
                  <Input
                    value={newFilename}
                    onChange={(e) => setNewFilename(e.target.value)}
                    placeholder="New filename"
                    className="text-xs h-8"
                  />
                  <Input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="New description"
                    className="text-xs h-8"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="h-7 text-xs">
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveRename} className="h-7 text-xs font-bold">
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {/* Inline Move Form */}
              {isMoving && (
                <div className="p-3 rounded-lg bg-card border border-border space-y-2 text-xs">
                  <Select value={targetFolderId} onValueChange={setTargetFolderId}>
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Select target folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">📁 Root Directory</SelectItem>
                      {workspaceData.folders.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          📁 {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => setIsMoving(false)} className="h-7 text-xs">
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveMove} className="h-7 text-xs font-bold">
                      Confirm Move
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments Discussion Thread */}
          <div className="space-y-3 pt-2 border-t border-border/80">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h4 className="font-bold text-xs text-foreground">File Discussion & Feedback ({comments.length})</h4>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic py-2">
                  No comments on this file yet. Start a discussion with your team below.
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={c.author_avatar} alt={c.author_name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="font-bold text-foreground">{c.author_name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-muted-foreground pl-7 leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            {userRole !== 'VIEWER' ? (
              <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Leave a comment for your team on this file..."
                  className="bg-muted/50 border-border text-xs h-9"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="gap-1.5 text-xs font-bold shrink-0 h-9"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </Button>
              </form>
            ) : (
              <p className="text-[11px] text-muted-foreground">Viewers have read-only access to comments.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
