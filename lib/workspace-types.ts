export type WorkspaceRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export type WorkspaceVisibility = 'private';

export interface WorkspaceSettings {
  allowViewerDownload: boolean; // default: false
  allowEditorDownload: boolean; // default: true
  defaultRole: WorkspaceRole;   // default: 'VIEWER'
  notifyOnTaskCreated: boolean;
  notifyOnMemberJoin: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_path: string;
  cover_image?: string;
  owner_id: string;
  visibility: WorkspaceVisibility;
  linked_project_id?: string | null;
  linked_project_title?: string | null;
  settings: WorkspaceSettings;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
  invited_by: string;
  user_name: string;
  user_email: string;
  user_avatar: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceRole;
  token_hash: string;
  token?: string; // Plain token provided only upon creation for secure dev fallback link
  invited_by: string;
  invited_by_name: string;
  expires_at: string;
  accepted_at?: string | null;
  declined_at?: string | null;
  revoked_at?: string | null;
  created_at: string;
  status: InvitationStatus;
}

export interface WorkspaceFolder {
  id: string;
  workspace_id: string;
  parent_folder_id: string | null;
  name: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceFile {
  id: string;
  workspace_id: string;
  folder_id: string | null;
  storage_key: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  description: string;
  uploaded_by: string;
  uploaded_by_name: string;
  file_data_url?: string; // Secure local vault data URL when external S3/Supabase is pending
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface WorkspaceTask {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  assigned_to_name?: string;
  assigned_to_avatar?: string;
  created_by: string;
  created_by_name?: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceComment {
  id: string;
  workspace_id: string;
  task_id?: string | null;
  file_id?: string | null;
  author_id: string;
  author_name: string;
  author_avatar: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceAnnouncement {
  id: string;
  workspace_id: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  title: string;
  content: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export type ActivityAction = 
  | 'workspace_created'
  | 'workspace_updated'
  | 'workspace_archived'
  | 'workspace_unarchived'
  | 'member_invited'
  | 'invitation_accepted'
  | 'invitation_declined'
  | 'invitation_revoked'
  | 'member_removed'
  | 'role_changed'
  | 'ownership_transferred'
  | 'folder_created'
  | 'folder_renamed'
  | 'folder_deleted'
  | 'file_uploaded'
  | 'file_renamed'
  | 'file_moved'
  | 'file_deleted'
  | 'file_downloaded'
  | 'task_created'
  | 'task_updated'
  | 'task_status_changed'
  | 'task_completed'
  | 'task_deleted'
  | 'announcement_published'
  | 'announcement_deleted'
  | 'comment_added';

export interface WorkspaceActivity {
  id: string;
  workspace_id: string;
  actor_id: string;
  actor_name: string;
  actor_avatar?: string;
  action: ActivityAction;
  resource_type: 'workspace' | 'member' | 'invitation' | 'folder' | 'file' | 'task' | 'comment' | 'announcement' | 'settings';
  resource_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface WorkspaceFullData {
  workspace: Workspace;
  members: WorkspaceMember[];
  folders: WorkspaceFolder[];
  files: WorkspaceFile[];
  tasks: WorkspaceTask[];
  announcements: WorkspaceAnnouncement[];
  comments: WorkspaceComment[];
  activities: WorkspaceActivity[];
  invitations: WorkspaceInvitation[];
  userRole?: WorkspaceRole | null;
}
