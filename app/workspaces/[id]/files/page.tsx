'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from '@/components/workspaces/workspace-context';
import { WorkspaceFile, WorkspaceFolder } from '@/lib/workspace-types';
import { apiDownloadFile, apiDeleteFolder } from '@/lib/workspace-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
  Folder,
  FolderPlus,
  Upload,
  Search,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Download,
  Trash2,
  ChevronRight,
  Eye,
  Filter,
  ArrowUpDown,
  Lock,
  ShieldCheck,
  FolderLock
} from 'lucide-react';
import { UploadFileDialog } from '@/components/workspaces/upload-file-dialog';
import { CreateFolderDialog } from '@/components/workspaces/create-folder-dialog';
import { FilePreviewModal } from '@/components/workspaces/file-preview-modal';

export default function WorkspaceFilesPage() {
  const { user } = useAuth();
  const { workspaceData, userRole, refreshWorkspace } = useWorkspace();

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<WorkspaceFile | null>(null);

  if (!workspaceData) return null;

  const { workspace: ws, folders, files } = workspaceData;

  // Folder Breadcrumb calculation
  const breadcrumbs = useMemo(() => {
    const crumbs: Array<{ id: string | null; name: string }> = [
      { id: null, name: 'Root Directory' }
    ];
    if (!currentFolderId) return crumbs;

    const findFolder = (id: string): WorkspaceFolder | undefined => folders.find(f => f.id === id);
    const trail: WorkspaceFolder[] = [];
    let cur = findFolder(currentFolderId);
    while (cur) {
      trail.unshift(cur);
      cur = cur.parent_folder_id ? findFolder(cur.parent_folder_id) : undefined;
    }

    trail.forEach(f => crumbs.push({ id: f.id, name: f.name }));
    return crumbs;
  }, [currentFolderId, folders]);

  // Current Folders
  const displayedFolders = useMemo(() => {
    return folders.filter(f => f.parent_folder_id === currentFolderId);
  }, [folders, currentFolderId]);

  // Current Files with search, type filter, sort
  const displayedFiles = useMemo(() => {
    return files
      .filter(f => {
        // Folder match
        const matchesFolder = f.folder_id === currentFolderId;
        if (!matchesFolder) return false;

        // Search match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = f.original_filename.toLowerCase().includes(q);
          const matchesDesc = (f.description || '').toLowerCase().includes(q);
          if (!matchesName && !matchesDesc) return false;
        }

        // Type filter
        if (typeFilter !== 'all') {
          if (typeFilter === 'image' && !f.content_type.startsWith('image/')) return false;
          if (typeFilter === 'pdf' && f.content_type !== 'application/pdf') return false;
          if (typeFilter === 'sheet' && !f.content_type.includes('sheet') && !f.content_type.includes('csv')) return false;
          if (typeFilter === 'doc' && !f.content_type.includes('word') && !f.content_type.includes('text')) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'name') cmp = a.original_filename.localeCompare(b.original_filename);
        else if (sortBy === 'size') cmp = a.file_size - b.file_size;
        else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [files, currentFolderId, searchQuery, typeFilter, sortBy, sortOrder]);

  const handleDownload = async (file: WorkspaceFile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await apiDownloadFile(ws.id, file.id, user);
      toast.success(`Downloaded "${file.original_filename}"`);
    } catch (err: any) {
      toast.error(err.message || 'Download denied by workspace policy.');
    }
  };

  const handleDeleteFolder = async (folder: WorkspaceFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (!confirm(`Are you sure you want to delete folder "${folder.name}" and all its contents?`)) return;

    try {
      await apiDeleteFolder(ws.id, folder.id, user);
      toast.success('Folder deleted.');
      refreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete folder.');
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-indigo-400" />;
    if (contentType === 'application/pdf') return <FileText className="w-5 h-5 text-rose-500" />;
    if (contentType.includes('sheet') || contentType.includes('csv')) return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    return <FileText className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-foreground">Private File Storage</h1>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] uppercase font-bold">
              Confidential
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Encrypted object repository for term sheets, pitch decks, cap tables, and intellectual property.
          </p>
        </div>

        {userRole !== 'VIEWER' && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateFolderDialogOpen(true)}
              className="gap-2 text-xs font-bold rounded-xl"
            >
              <FolderPlus className="w-3.5 h-3.5 text-primary" />
              <span>New Folder</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setUploadDialogOpen(true)}
              className="gap-2 text-xs font-bold rounded-xl shadow-md shadow-primary/20"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Files</span>
            </Button>
          </div>
        )}
      </div>

      {/* Breadcrumbs Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap bg-muted/30 p-2.5 rounded-xl border border-border/60">
        <FolderLock className="w-4 h-4 text-primary shrink-0" />
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <div key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />}
              {isLast ? (
                <span className="font-bold text-foreground">{crumb.name}</span>
              ) : (
                <button
                  onClick={() => setCurrentFolderId(crumb.id)}
                  className="font-medium hover:text-primary hover:underline transition-colors"
                >
                  {crumb.name}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="sm:col-span-2 relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3" />
          <Input
            placeholder="Search files by name or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-muted/40 border-border text-xs h-9"
          />
        </div>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="bg-muted/40 border-border text-xs h-9">
            <SelectValue placeholder="All File Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All File Types</SelectItem>
            <SelectItem value="pdf">PDF Documents</SelectItem>
            <SelectItem value="image">Images & Visuals</SelectItem>
            <SelectItem value="sheet">Spreadsheets & CSV</SelectItem>
            <SelectItem value="doc">Word & Text Documents</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Options */}
        <Select
          value={`${sortBy}-${sortOrder}`}
          onValueChange={(val) => {
            const [sb, so] = val.split('-');
            setSortBy(sb as any);
            setSortOrder(so as any);
          }}
        >
          <SelectTrigger className="bg-muted/40 border-border text-xs h-9">
            <SelectValue placeholder="Sort files" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="size-desc">Size (Largest)</SelectItem>
            <SelectItem value="size-asc">Size (Smallest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Folders Row */}
      {displayedFolders.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Folders ({displayedFolders.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayedFolders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => setCurrentFolderId(folder.id)}
                className="p-3.5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all flex items-center justify-between cursor-pointer group shadow-sm hover:shadow-primary/5"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Folder className="w-5 h-5 text-primary group-hover:scale-105 transition-transform shrink-0" />
                  <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                    {folder.name}
                  </span>
                </div>

                {userRole === 'ADMIN' && (
                  <button
                    onClick={(e) => handleDeleteFolder(folder, e)}
                    title="Delete folder"
                    className="p-1 text-muted-foreground hover:text-rose-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Files ({displayedFiles.length})
          </span>
          {files.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              Total {files.length} {files.length === 1 ? 'file' : 'files'} across workspace
            </span>
          )}
        </div>

        {displayedFiles.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">No files in this directory</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery
                  ? `No files match your query "${searchQuery}".`
                  : 'Upload confidential startup documents, slide decks, or cap tables to collaborate with teammates.'}
              </p>
            </div>
            {userRole !== 'VIEWER' && !searchQuery && (
              <Button
                size="sm"
                onClick={() => setUploadDialogOpen(true)}
                className="gap-2 text-xs font-bold rounded-xl mt-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload First File</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border/60">
            {displayedFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => setPreviewFile(file)}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-muted/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center shrink-0 border border-border/50 group-hover:border-primary/40 transition-colors">
                    {getFileIcon(file.content_type)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground text-xs group-hover:text-primary transition-colors truncate">
                      {file.original_filename}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <span>{(file.file_size / 1024 / 1024).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>Uploaded by {file.uploaded_by_name}</span>
                      <span>•</span>
                      <span>{new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewFile(file);
                    }}
                    className="text-xs h-8 gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={(e) => handleDownload(file, e)}
                    className="text-xs font-bold h-8 gap-1 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <UploadFileDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        defaultFolderId={currentFolderId}
      />

      <CreateFolderDialog
        open={createFolderDialogOpen}
        onOpenChange={setCreateFolderDialogOpen}
        currentFolderId={currentFolderId}
      />

      <FilePreviewModal
        file={previewFile}
        open={Boolean(previewFile)}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      />
    </div>
  );
}
