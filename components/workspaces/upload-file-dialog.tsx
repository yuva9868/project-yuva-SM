'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from './workspace-context';
import { apiUploadFile } from '@/lib/workspace-client';
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
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Upload, 
  FileText, 
  X, 
  Loader2, 
  ShieldCheck, 
  FileUp, 
  FolderLock, 
  CheckCircle2 
} from 'lucide-react';

interface UploadFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFolderId?: string | null;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/csv',
  'text/plain',
];

export function UploadFileDialog({ open, onOpenChange, defaultFolderId }: UploadFileDialogProps) {
  const { user } = useAuth();
  const { workspaceData, refreshWorkspace } = useWorkspace();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [folderId, setFolderId] = useState<string>(defaultFolderId || 'root');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!workspaceData) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const validList: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.size > 25 * 1024 * 1024) {
        toast.error(`File "${f.name}" exceeds the 25MB limit.`);
        continue;
      }
      validList.push(f);
    }
    setSelectedFiles((prev) => [...prev, ...validList]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    try {
      const targetFolder = folderId === 'root' ? null : folderId;
      const total = selectedFiles.length;

      for (let i = 0; i < total; i++) {
        const file = selectedFiles[i];
        const dataUrl = await readFileAsDataUrl(file);

        // Advance progress
        setUploadProgress(Math.round(((i + 0.5) / total) * 90));

        await apiUploadFile(
          workspaceData.workspace.id,
          {
            originalFilename: file.name,
            contentType: file.type || 'application/octet-stream',
            fileSize: file.size,
            description: description.trim(),
            folderId: targetFolder,
            fileDataUrl: dataUrl,
          },
          user
        );

        setUploadProgress(Math.round(((i + 1) / total) * 100));
      }

      toast.success(`Successfully uploaded ${total} ${total === 1 ? 'file' : 'files'} securely!`);
      refreshWorkspace();
      onOpenChange(false);
      setSelectedFiles([]);
      setDescription('');
      setUploadProgress(0);
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload files.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-foreground">Upload Confidential Files</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Files are strictly isolated to <strong className="text-foreground">{workspaceData.workspace.name}</strong>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleUpload} className="space-y-4 pt-2">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center space-y-2 ${
              dragOver
                ? 'border-primary bg-primary/10'
                : 'border-border/80 hover:border-primary/50 bg-muted/30 hover:bg-muted/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground">Click to upload or drag and drop</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                PDF, PNG, JPG, WEBP, DOCX, XLSX, PPTX, CSV, TXT (max 25MB each)
              </p>
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              <span className="text-xs font-bold text-foreground">
                Selected Files ({selectedFiles.length}):
              </span>
              <div className="space-y-1.5">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-muted/50 border border-border/60 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate font-medium text-foreground">{file.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      disabled={isUploading}
                      className="p-1 hover:text-rose-500 rounded transition-colors text-muted-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target Folder & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Target Folder</Label>
              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger className="bg-muted/50 border-border text-xs">
                  <SelectValue />
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
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="file-desc" className="text-xs font-bold text-foreground">
                Description / Tags (Optional)
              </Label>
              <Input
                id="file-desc"
                placeholder="e.g. Approved by legal counsel"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-muted/50 border-border text-xs"
              />
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-foreground">
                <span>Uploading encrypted assets...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2 rounded-full" />
            </div>
          )}

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || selectedFiles.length === 0}
              className="gap-2 text-xs font-bold shadow-md shadow-primary/20"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
