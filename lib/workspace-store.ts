import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Workspace,
  WorkspaceMember,
  WorkspaceInvitation,
  WorkspaceFolder,
  WorkspaceFile,
  WorkspaceTask,
  WorkspaceComment,
  WorkspaceAnnouncement,
  WorkspaceActivity,
  WorkspaceRole,
  WorkspaceFullData,
  ActivityAction,
} from './workspace-types';

interface WorkspaceDatabase {
  workspaces: Workspace[];
  members: WorkspaceMember[];
  invitations: WorkspaceInvitation[];
  folders: WorkspaceFolder[];
  files: WorkspaceFile[];
  tasks: WorkspaceTask[];
  comments: WorkspaceComment[];
  announcements: WorkspaceAnnouncement[];
  activities: WorkspaceActivity[];
}

const DB_FILE_PATH = path.join(process.cwd(), '.workspace_data', 'db.json');

// Helper to ensure data directory exists
function ensureDbDir() {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Initial Seed Data for Demo & Experience
function getInitialDb(): WorkspaceDatabase {
  const ws1Id = 'ws_ideacheck_core';
  const ws2Id = 'ws_stealth_ai_lab';
  const now = new Date().toISOString();
  const pastDay = new Date(Date.now() - 86400000).toISOString();
  const pastTwoDays = new Date(Date.now() - 172800000).toISOString();

  return {
    workspaces: [
      {
        id: ws1Id,
        name: 'IdeaCheck Core Founders',
        slug: 'ideacheck-core-founders',
        description: 'Private executive workspace for IdeaCheck AI founding team, product roadmap, and seed investor documents.',
        logo_path: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        cover_image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&auto=format&fit=crop&q=80',
        owner_id: 'user_sarah',
        visibility: 'private',
        linked_project_id: 'proj_ai_validation_copilot',
        linked_project_title: 'AI Startup Validation Copilot',
        settings: {
          allowViewerDownload: true,
          allowEditorDownload: true,
          defaultRole: 'VIEWER',
          notifyOnTaskCreated: true,
          notifyOnMemberJoin: true,
        },
        created_at: pastTwoDays,
        updated_at: now,
      },
      {
        id: ws2Id,
        name: 'Stealth AI Security Lab',
        slug: 'stealth-ai-security-lab',
        description: 'Confidential security audits, proprietary model weights, and pentest results.',
        logo_path: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=150&auto=format&fit=crop&q=80',
        cover_image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
        owner_id: 'user_alex',
        visibility: 'private',
        settings: {
          allowViewerDownload: false,
          allowEditorDownload: true,
          defaultRole: 'VIEWER',
          notifyOnTaskCreated: true,
          notifyOnMemberJoin: true,
        },
        created_at: pastDay,
        updated_at: now,
      },
    ],
    members: [
      {
        id: 'mem_1',
        workspace_id: ws1Id,
        user_id: 'user_sarah',
        role: 'ADMIN',
        joined_at: pastTwoDays,
        invited_by: 'system',
        user_name: 'Sarah Chen',
        user_email: 'sarah@ideacheck.ai',
        user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'mem_2',
        workspace_id: ws1Id,
        user_id: 'user_alex',
        role: 'EDITOR',
        joined_at: pastDay,
        invited_by: 'user_sarah',
        user_name: 'Alex Rivera',
        user_email: 'alex@ideacheck.ai',
        user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'mem_3',
        workspace_id: ws1Id,
        user_id: 'user_priya',
        role: 'VIEWER',
        joined_at: pastDay,
        invited_by: 'user_sarah',
        user_name: 'Priya Sharma',
        user_email: 'priya@ideacheck.ai',
        user_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'mem_4',
        workspace_id: ws2Id,
        user_id: 'user_alex',
        role: 'ADMIN',
        joined_at: pastDay,
        invited_by: 'system',
        user_name: 'Alex Rivera',
        user_email: 'alex@ideacheck.ai',
        user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
    ],
    invitations: [
      {
        id: 'inv_1',
        workspace_id: ws1Id,
        email: 'partner@sequoia-demo.vc',
        role: 'VIEWER',
        token_hash: crypto.createHash('sha256').update('inv_demo_token_sequoia').digest('hex'),
        token: 'inv_demo_token_sequoia',
        invited_by: 'user_sarah',
        invited_by_name: 'Sarah Chen',
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
        created_at: now,
        status: 'pending',
      },
    ],
    folders: [
      {
        id: 'fold_pitch',
        workspace_id: ws1Id,
        parent_folder_id: null,
        name: 'Investor Materials & Pitch Decks',
        created_by: 'user_sarah',
        created_by_name: 'Sarah Chen',
        created_at: pastTwoDays,
        updated_at: pastTwoDays,
      },
      {
        id: 'fold_financials',
        workspace_id: ws1Id,
        parent_folder_id: null,
        name: 'Financial Projections & Term Sheets',
        created_by: 'user_sarah',
        created_by_name: 'Sarah Chen',
        created_at: pastDay,
        updated_at: pastDay,
      },
      {
        id: 'fold_sub_audits',
        workspace_id: ws1Id,
        parent_folder_id: 'fold_financials',
        name: 'Q3 Certified Audit Reports',
        created_by: 'user_alex',
        created_by_name: 'Alex Rivera',
        created_at: pastDay,
        updated_at: pastDay,
      },
    ],
    files: [
      {
        id: 'file_deck_2026',
        workspace_id: ws1Id,
        folder_id: 'fold_pitch',
        storage_key: 'workspaces/ws_ideacheck_core/files/seed_deck_series_a_confidential.pdf',
        original_filename: 'IdeaCheck_AI_Seed_Pitch_Deck_Confidential.pdf',
        content_type: 'application/pdf',
        file_size: 4892010, // ~4.9 MB
        description: 'Series Seed investor deck with traction, unit economics, and 18-month expansion model.',
        uploaded_by: 'user_sarah',
        uploaded_by_name: 'Sarah Chen',
        created_at: pastTwoDays,
        updated_at: pastTwoDays,
      },
      {
        id: 'file_cap_table',
        workspace_id: ws1Id,
        folder_id: 'fold_financials',
        storage_key: 'workspaces/ws_ideacheck_core/files/cap_table_proforma.xlsx',
        original_filename: 'IdeaCheck_CapTable_ProForma_2026.xlsx',
        content_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        file_size: 1245000,
        description: 'Full equity waterfall, option pool reserve, and investor SAFEs.',
        uploaded_by: 'user_sarah',
        uploaded_by_name: 'Sarah Chen',
        created_at: pastDay,
        updated_at: pastDay,
      },
      {
        id: 'file_architecture',
        workspace_id: ws1Id,
        folder_id: null,
        storage_key: 'workspaces/ws_ideacheck_core/files/ai_pipeline_architecture.png',
        original_filename: 'Architecture_MultiAgent_Workflow.png',
        content_type: 'image/png',
        file_size: 854000,
        description: 'System diagram for private multi-model validation pipeline.',
        uploaded_by: 'user_alex',
        uploaded_by_name: 'Alex Rivera',
        created_at: pastDay,
        updated_at: pastDay,
      },
    ],
    tasks: [
      {
        id: 'task_1',
        workspace_id: ws1Id,
        title: 'Review series seed lead investor term sheet',
        description: 'Finalize liquidation preference and board seat requirements before signing.',
        status: 'in_progress',
        priority: 'urgent',
        assigned_to: 'user_sarah',
        assigned_to_name: 'Sarah Chen',
        assigned_to_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        created_by: 'user_sarah',
        created_by_name: 'Sarah Chen',
        due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
        created_at: pastDay,
        updated_at: now,
      },
      {
        id: 'task_2',
        workspace_id: ws1Id,
        title: 'Complete SOC2 Type II audit readiness questionnaire',
        description: 'Ensure data encryption at rest and audit logging meet compliance standards.',
        status: 'todo',
        priority: 'high',
        assigned_to: 'user_alex',
        assigned_to_name: 'Alex Rivera',
        assigned_to_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        created_by: 'user_sarah',
        created_by_name: 'Sarah Chen',
        due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
        created_at: pastDay,
        updated_at: pastDay,
      },
      {
        id: 'task_3',
        workspace_id: ws1Id,
        title: 'Validate UX wireframes for enterprise team spaces',
        description: 'Verify role-based access controls and confidential download toggles.',
        status: 'in_review',
        priority: 'medium',
        assigned_to: 'user_priya',
        assigned_to_name: 'Priya Sharma',
        assigned_to_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        created_by: 'user_alex',
        created_by_name: 'Alex Rivera',
        due_date: new Date(Date.now() + 3 * 86400000).toISOString(),
        created_at: pastTwoDays,
        updated_at: pastDay,
      },
      {
        id: 'task_4',
        workspace_id: ws1Id,
        title: 'Draft proprietary prompt engineering IP defense patent',
        description: 'File provisional patent application with legal counsel.',
        status: 'completed',
        priority: 'high',
        assigned_to: 'user_sarah',
        assigned_to_name: 'Sarah Chen',
        assigned_to_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        created_by: 'user_sarah',
        created_by_name: 'Sarah Chen',
        due_date: pastDay,
        created_at: pastTwoDays,
        updated_at: pastDay,
      },
    ],
    comments: [
      {
        id: 'comm_1',
        workspace_id: ws1Id,
        task_id: 'task_1',
        file_id: null,
        author_id: 'user_alex',
        author_name: 'Alex Rivera',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: 'I checked clause 4.2 with our venture attorney; 1x non-participating preferred is standard and safe.',
        created_at: pastDay,
        updated_at: pastDay,
      },
      {
        id: 'comm_2',
        workspace_id: ws1Id,
        task_id: null,
        file_id: 'file_deck_2026',
        author_id: 'user_sarah',
        author_name: 'Sarah Chen',
        author_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        content: 'Please double-check slide 9 for our updated CAC and LTV projections before sharing externally.',
        created_at: pastDay,
        updated_at: pastDay,
      },
    ],
    announcements: [
      {
        id: 'ann_1',
        workspace_id: ws1Id,
        author_id: 'user_sarah',
        author_name: 'Sarah Chen',
        author_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        title: '🔒 Confidentiality Notice: Term Sheet Inbound',
        content: 'Team, please keep all discussions in this private workspace. Do not export cap table or financial models to public or unencrypted channels.',
        pinned: true,
        created_at: pastTwoDays,
        updated_at: pastTwoDays,
      },
    ],
    activities: [
      {
        id: 'act_1',
        workspace_id: ws1Id,
        actor_id: 'user_sarah',
        actor_name: 'Sarah Chen',
        actor_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        action: 'workspace_created',
        resource_type: 'workspace',
        resource_id: ws1Id,
        metadata: { name: 'IdeaCheck Core Founders' },
        created_at: pastTwoDays,
      },
      {
        id: 'act_2',
        workspace_id: ws1Id,
        actor_id: 'user_sarah',
        actor_name: 'Sarah Chen',
        actor_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        action: 'file_uploaded',
        resource_type: 'file',
        resource_id: 'file_deck_2026',
        metadata: { filename: 'IdeaCheck_AI_Seed_Pitch_Deck_Confidential.pdf' },
        created_at: pastTwoDays,
      },
      {
        id: 'act_3',
        workspace_id: ws1Id,
        actor_id: 'user_sarah',
        actor_name: 'Sarah Chen',
        actor_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        action: 'member_invited',
        resource_type: 'member',
        resource_id: 'mem_2',
        metadata: { name: 'Alex Rivera', role: 'EDITOR' },
        created_at: pastDay,
      },
      {
        id: 'act_4',
        workspace_id: ws1Id,
        actor_id: 'user_sarah',
        actor_name: 'Sarah Chen',
        actor_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        action: 'announcement_published',
        resource_type: 'announcement',
        resource_id: 'ann_1',
        metadata: { title: '🔒 Confidentiality Notice: Term Sheet Inbound' },
        created_at: pastTwoDays,
      },
    ],
  };
}

// In-memory cache for fast operations
let cachedDb: WorkspaceDatabase | null = null;

export function getDb(): WorkspaceDatabase {
  if (cachedDb) return cachedDb;

  try {
    ensureDbDir();
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      cachedDb = JSON.parse(content);
      return cachedDb!;
    }
  } catch (err) {
    console.error('Error reading workspace DB, initializing default seed:', err);
  }

  const initial = getInitialDb();
  saveDb(initial);
  cachedDb = initial;
  return cachedDb;
}

export function saveDb(db: WorkspaceDatabase): void {
  cachedDb = db;
  try {
    ensureDbDir();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving workspace DB:', err);
  }
}

// ==============================================================================
// PERMISSION & ROLE VERIFICATION ENGINE
// ==============================================================================

export function getMemberRecord(workspaceId: string, userId: string): WorkspaceMember | null {
  const db = getDb();
  return db.members.find(m => m.workspace_id === workspaceId && m.user_id === userId) || null;
}

export function getUserRoleInWorkspace(workspaceId: string, userId: string): WorkspaceRole | null {
  const member = getMemberRecord(workspaceId, userId);
  return member ? member.role : null;
}

export function canAdmin(workspaceId: string, userId: string): boolean {
  const role = getUserRoleInWorkspace(workspaceId, userId);
  return role === 'ADMIN';
}

export function canEdit(workspaceId: string, userId: string): boolean {
  const role = getUserRoleInWorkspace(workspaceId, userId);
  return role === 'ADMIN' || role === 'EDITOR';
}

export function canView(workspaceId: string, userId: string): boolean {
  const role = getUserRoleInWorkspace(workspaceId, userId);
  return role === 'ADMIN' || role === 'EDITOR' || role === 'VIEWER';
}

export function canDownloadFile(workspaceId: string, userId: string): boolean {
  const db = getDb();
  const ws = db.workspaces.find(w => w.id === workspaceId);
  if (!ws) return false;

  const role = getUserRoleInWorkspace(workspaceId, userId);
  if (!role) return false;

  if (role === 'ADMIN') return true;
  if (role === 'EDITOR') {
    return ws.settings.allowEditorDownload !== false;
  }
  if (role === 'VIEWER') {
    return ws.settings.allowViewerDownload === true;
  }
  return false;
}

// Prevent accidental removal of the last administrator
export function isLastAdmin(workspaceId: string, userId: string): boolean {
  const db = getDb();
  const admins = db.members.filter(m => m.workspace_id === workspaceId && m.role === 'ADMIN');
  return admins.length === 1 && admins[0].user_id === userId;
}

// ==============================================================================
// WORKSPACE SERVICE METHODS
// ==============================================================================

export function listUserWorkspaces(userId: string): Array<Workspace & { userRole: WorkspaceRole; memberCount: number }> {
  const db = getDb();
  const userMemberships = db.members.filter(m => m.user_id === userId);
  
  return userMemberships
    .map(mem => {
      const ws = db.workspaces.find(w => w.id === mem.workspace_id);
      if (!ws) return null;
      const count = db.members.filter(m => m.workspace_id === ws.id).length;
      return {
        ...ws,
        userRole: mem.role,
        memberCount: count,
      };
    })
    .filter((w): w is Workspace & { userRole: WorkspaceRole; memberCount: number } => w !== null);
}

export function getWorkspaceFull(workspaceId: string, userId: string): WorkspaceFullData | null {
  if (!canView(workspaceId, userId)) return null;

  const db = getDb();
  const ws = db.workspaces.find(w => w.id === workspaceId);
  if (!ws) return null;

  const userRole = getUserRoleInWorkspace(workspaceId, userId);
  const members = db.members.filter(m => m.workspace_id === workspaceId);
  const folders = db.folders.filter(f => f.workspace_id === workspaceId);
  const files = db.files.filter(f => f.workspace_id === workspaceId);
  const tasks = db.tasks.filter(t => t.workspace_id === workspaceId);
  const announcements = db.announcements.filter(a => a.workspace_id === workspaceId);
  const comments = db.comments.filter(c => c.workspace_id === workspaceId);
  const activities = db.activities.filter(a => a.workspace_id === workspaceId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  // Invitations only visible to admins
  const invitations = userRole === 'ADMIN' 
    ? db.invitations.filter(i => i.workspace_id === workspaceId)
    : [];

  return {
    workspace: ws,
    members,
    folders,
    files,
    tasks,
    announcements,
    comments,
    activities,
    invitations,
    userRole,
  };
}

export function createWorkspace(params: {
  name: string;
  description: string;
  logo_path?: string;
  cover_image?: string;
  linked_project_id?: string;
  linked_project_title?: string;
  owner: { id: string; name: string; email: string; avatar?: string };
}): Workspace {
  const db = getDb();
  const wsId = 'ws_' + crypto.randomUUID().slice(0, 12);
  const slug = params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + wsId.slice(-4);
  const now = new Date().toISOString();

  const newWorkspace: Workspace = {
    id: wsId,
    name: params.name,
    slug,
    description: params.description,
    logo_path: params.logo_path || `https://avatar.vercel.sh/${slug}?s=120`,
    cover_image: params.cover_image,
    owner_id: params.owner.id,
    visibility: 'private',
    linked_project_id: params.linked_project_id || null,
    linked_project_title: params.linked_project_title || null,
    settings: {
      allowViewerDownload: false,
      allowEditorDownload: true,
      defaultRole: 'VIEWER',
      notifyOnTaskCreated: true,
      notifyOnMemberJoin: true,
    },
    created_at: now,
    updated_at: now,
  };

  // Creator automatically assigned ADMIN role and owner
  const adminMember: WorkspaceMember = {
    id: 'mem_' + crypto.randomUUID().slice(0, 12),
    workspace_id: wsId,
    user_id: params.owner.id,
    role: 'ADMIN',
    joined_at: now,
    invited_by: 'system',
    user_name: params.owner.name,
    user_email: params.owner.email,
    user_avatar: params.owner.avatar || `https://avatar.vercel.sh/${params.owner.email}?s=96`,
  };

  // Default welcome announcement
  const welcomeAnnouncement: WorkspaceAnnouncement = {
    id: 'ann_' + crypto.randomUUID().slice(0, 12),
    workspace_id: wsId,
    author_id: params.owner.id,
    author_name: params.owner.name,
    author_avatar: adminMember.user_avatar,
    title: '👋 Welcome to your Private Workspace',
    content: 'This workspace is confidential and private by default. Only invited teammates with verified credentials can access files, tasks, and discussions.',
    pinned: true,
    created_at: now,
    updated_at: now,
  };

  // Activity log entry
  const activity: WorkspaceActivity = {
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: wsId,
    actor_id: params.owner.id,
    actor_name: params.owner.name,
    actor_avatar: adminMember.user_avatar,
    action: 'workspace_created',
    resource_type: 'workspace',
    resource_id: wsId,
    metadata: { name: params.name },
    created_at: now,
  };

  db.workspaces.push(newWorkspace);
  db.members.push(adminMember);
  db.announcements.push(welcomeAnnouncement);
  db.activities.push(activity);
  saveDb(db);

  return newWorkspace;
}

export function updateWorkspace(
  workspaceId: string,
  userId: string,
  updates: Partial<Pick<Workspace, 'name' | 'description' | 'logo_path' | 'cover_image' | 'settings' | 'linked_project_id' | 'linked_project_title'>>
): Workspace | null {
  if (!canAdmin(workspaceId, userId)) {
    throw new Error('Unauthorized: Only workspace administrators can edit workspace settings.');
  }

  const db = getDb();
  const ws = db.workspaces.find(w => w.id === workspaceId);
  if (!ws) return null;

  const user = db.members.find(m => m.workspace_id === workspaceId && m.user_id === userId);

  if (updates.name !== undefined) ws.name = updates.name;
  if (updates.description !== undefined) ws.description = updates.description;
  if (updates.logo_path !== undefined) ws.logo_path = updates.logo_path;
  if (updates.cover_image !== undefined) ws.cover_image = updates.cover_image;
  if (updates.linked_project_id !== undefined) ws.linked_project_id = updates.linked_project_id;
  if (updates.linked_project_title !== undefined) ws.linked_project_title = updates.linked_project_title;
  if (updates.settings) {
    ws.settings = { ...ws.settings, ...updates.settings };
  }
  ws.updated_at = new Date().toISOString();

  // Log activity
  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: workspaceId,
    actor_id: userId,
    actor_name: user?.user_name || 'Admin',
    actor_avatar: user?.user_avatar,
    action: 'workspace_updated',
    resource_type: 'settings',
    resource_id: workspaceId,
    created_at: new Date().toISOString(),
  });

  saveDb(db);
  return ws;
}

export function archiveWorkspace(workspaceId: string, userId: string, archive: boolean): Workspace | null {
  if (!canAdmin(workspaceId, userId)) {
    throw new Error('Unauthorized: Only administrators can archive or unarchive a workspace.');
  }

  const db = getDb();
  const ws = db.workspaces.find(w => w.id === workspaceId);
  if (!ws) return null;

  const user = db.members.find(m => m.workspace_id === workspaceId && m.user_id === userId);
  ws.archived_at = archive ? new Date().toISOString() : null;
  ws.updated_at = new Date().toISOString();

  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: workspaceId,
    actor_id: userId,
    actor_name: user?.user_name || 'Admin',
    action: archive ? 'workspace_archived' : 'workspace_unarchived',
    resource_type: 'workspace',
    resource_id: workspaceId,
    created_at: new Date().toISOString(),
  });

  saveDb(db);
  return ws;
}

export function deleteWorkspace(workspaceId: string, userId: string, confirmedName: string): boolean {
  const db = getDb();
  const ws = db.workspaces.find(w => w.id === workspaceId);
  if (!ws) throw new Error('Workspace not found.');

  // Strict: Only the workspace owner can permanently delete
  if (ws.owner_id !== userId) {
    throw new Error('Forbidden: Only the workspace owner can permanently delete the workspace.');
  }

  if (confirmedName !== ws.name) {
    throw new Error('Confirmation mismatch: You must type the exact workspace name to confirm permanent deletion.');
  }

  // Safe Cascade cleanup of all associated data
  db.workspaces = db.workspaces.filter(w => w.id !== workspaceId);
  db.members = db.members.filter(m => m.workspace_id !== workspaceId);
  db.invitations = db.invitations.filter(i => i.workspace_id !== workspaceId);
  db.folders = db.folders.filter(f => f.workspace_id !== workspaceId);
  db.files = db.files.filter(f => f.workspace_id !== workspaceId);
  db.tasks = db.tasks.filter(t => t.workspace_id !== workspaceId);
  db.comments = db.comments.filter(c => c.workspace_id !== workspaceId);
  db.announcements = db.announcements.filter(a => a.workspace_id !== workspaceId);
  db.activities = db.activities.filter(a => a.workspace_id !== workspaceId);

  saveDb(db);
  return true;
}

// ==============================================================================
// INVITATION & MEMBERSHIP ENGINE
// ==============================================================================

export function createInvitation(params: {
  workspaceId: string;
  adminId: string;
  email: string;
  role: WorkspaceRole;
}): WorkspaceInvitation {
  if (!canAdmin(params.workspaceId, params.adminId)) {
    throw new Error('Unauthorized: Only workspace administrators can invite members.');
  }

  const db = getDb();
  const emailLower = params.email.trim().toLowerCase();

  // Check if user is already a member
  const existingMember = db.members.find(
    m => m.workspace_id === params.workspaceId && m.user_email.toLowerCase() === emailLower
  );
  if (existingMember) {
    throw new Error(`User with email "${params.email}" is already a member of this workspace.`);
  }

  // Check if there is an active pending invitation
  const activeInv = db.invitations.find(
    i => i.workspace_id === params.workspaceId && i.email.toLowerCase() === emailLower && i.status === 'pending'
  );
  if (activeInv) {
    throw new Error(`An active invitation for "${params.email}" already exists.`);
  }

  const admin = db.members.find(m => m.workspace_id === params.workspaceId && m.user_id === params.adminId);
  const rawToken = crypto.randomBytes(24).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days expiration

  const invitation: WorkspaceInvitation = {
    id: 'inv_' + crypto.randomUUID().slice(0, 12),
    workspace_id: params.workspaceId,
    email: emailLower,
    role: params.role,
    token_hash: tokenHash,
    token: rawToken, // Provided for dev preview & immediate copy
    invited_by: params.adminId,
    invited_by_name: admin?.user_name || 'Admin',
    expires_at: expiresAt,
    status: 'pending',
    created_at: now,
  };

  db.invitations.push(invitation);

  // Log activity
  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: params.workspaceId,
    actor_id: params.adminId,
    actor_name: admin?.user_name || 'Admin',
    action: 'member_invited',
    resource_type: 'invitation',
    resource_id: invitation.id,
    metadata: { email: emailLower, role: params.role },
    created_at: now,
  });

  saveDb(db);
  return invitation;
}

export function getInvitationByToken(token: string): { invitation: WorkspaceInvitation; workspace: Workspace } | null {
  const db = getDb();
  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const inv = db.invitations.find(i => i.token_hash === tokenHash || i.token === token);
  if (!inv) return null;

  const ws = db.workspaces.find(w => w.id === inv.workspace_id);
  if (!ws) return null;

  // Check if expired
  if (inv.status === 'pending' && new Date(inv.expires_at) < new Date()) {
    inv.status = 'expired';
    saveDb(db);
  }

  return { invitation: inv, workspace: ws };
}

export function acceptInvitation(params: {
  token: string;
  user: { id: string; email: string; name: string; avatar?: string };
}): { workspace: Workspace; member: WorkspaceMember } {
  const tokenHash = crypto.createHash('sha256').update(params.token.trim()).digest('hex');
  const db = getDb();
  const inv = db.invitations.find(i => i.token_hash === tokenHash || i.token === params.token);

  if (!inv) throw new Error('Invalid or non-existent invitation token.');
  if (inv.status === 'revoked') throw new Error('This invitation has been revoked by the workspace administrator.');
  if (inv.status === 'accepted') throw new Error('This invitation has already been accepted.');
  if (new Date(inv.expires_at) < new Date()) {
    inv.status = 'expired';
    saveDb(db);
    throw new Error('This invitation token has expired. Please request a new invitation.');
  }

  // Security: Verify user's email matches the invited email
  const userEmail = params.user.email.trim().toLowerCase();
  if (inv.email.toLowerCase() !== userEmail) {
    throw new Error(`Email mismatch: This invitation was issued for ${inv.email}, but you are currently signed in as ${userEmail}.`);
  }

  // Prevent duplicate membership
  const existingMember = db.members.find(m => m.workspace_id === inv.workspace_id && m.user_id === params.user.id);
  if (existingMember) {
    inv.status = 'accepted';
    inv.accepted_at = new Date().toISOString();
    saveDb(db);
    const ws = db.workspaces.find(w => w.id === inv.workspace_id)!;
    return { workspace: ws, member: existingMember };
  }

  const now = new Date().toISOString();
  const newMember: WorkspaceMember = {
    id: 'mem_' + crypto.randomUUID().slice(0, 12),
    workspace_id: inv.workspace_id,
    user_id: params.user.id,
    role: inv.role,
    joined_at: now,
    invited_by: inv.invited_by,
    user_name: params.user.name,
    user_email: params.user.email,
    user_avatar: params.user.avatar || `https://avatar.vercel.sh/${params.user.email}?s=96`,
  };

  inv.status = 'accepted';
  inv.accepted_at = now;

  db.members.push(newMember);

  // Notify & Log activity
  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: inv.workspace_id,
    actor_id: params.user.id,
    actor_name: params.user.name,
    actor_avatar: newMember.user_avatar,
    action: 'invitation_accepted',
    resource_type: 'member',
    resource_id: newMember.id,
    metadata: { role: inv.role, email: params.user.email },
    created_at: now,
  });

  saveDb(db);
  const ws = db.workspaces.find(w => w.id === inv.workspace_id)!;
  return { workspace: ws, member: newMember };
}

export function declineInvitation(token: string, userEmail: string): boolean {
  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const db = getDb();
  const inv = db.invitations.find(i => i.token_hash === tokenHash || i.token === token);
  if (!inv) throw new Error('Invitation not found.');

  inv.status = 'declined';
  inv.declined_at = new Date().toISOString();
  saveDb(db);
  return true;
}

export function revokeInvitation(workspaceId: string, adminId: string, invitationId: string): boolean {
  if (!canAdmin(workspaceId, adminId)) {
    throw new Error('Unauthorized: Only administrators can revoke invitations.');
  }

  const db = getDb();
  const inv = db.invitations.find(i => i.id === invitationId && i.workspace_id === workspaceId);
  if (!inv) throw new Error('Invitation not found.');

  inv.status = 'revoked';
  inv.revoked_at = new Date().toISOString();

  const admin = db.members.find(m => m.workspace_id === workspaceId && m.user_id === adminId);
  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: workspaceId,
    actor_id: adminId,
    actor_name: admin?.user_name || 'Admin',
    action: 'invitation_revoked',
    resource_type: 'invitation',
    resource_id: invitationId,
    metadata: { email: inv.email },
    created_at: new Date().toISOString(),
  });

  saveDb(db);
  return true;
}

export function updateMemberRole(workspaceId: string, adminId: string, targetUserId: string, newRole: WorkspaceRole): WorkspaceMember {
  if (!canAdmin(workspaceId, adminId)) {
    throw new Error('Unauthorized: Only administrators can modify member roles.');
  }

  const db = getDb();
  const targetMember = db.members.find(m => m.workspace_id === workspaceId && m.user_id === targetUserId);
  if (!targetMember) throw new Error('Target member not found in this workspace.');

  // Guard: Cannot demote the last administrator
  if (targetMember.role === 'ADMIN' && newRole !== 'ADMIN' && isLastAdmin(workspaceId, targetUserId)) {
    throw new Error('Security restriction: Cannot demote the only remaining Administrator. Assign another Admin first.');
  }

  targetMember.role = newRole;

  const admin = db.members.find(m => m.workspace_id === workspaceId && m.user_id === adminId);
  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: workspaceId,
    actor_id: adminId,
    actor_name: admin?.user_name || 'Admin',
    action: 'role_changed',
    resource_type: 'member',
    resource_id: targetMember.id,
    metadata: { target_name: targetMember.user_name, new_role: newRole },
    created_at: new Date().toISOString(),
  });

  saveDb(db);
  return targetMember;
}

export function removeMember(workspaceId: string, adminId: string, targetUserId: string): boolean {
  if (!canAdmin(workspaceId, adminId)) {
    throw new Error('Unauthorized: Only administrators can remove members.');
  }

  // Guard: Cannot remove the last administrator
  if (isLastAdmin(workspaceId, targetUserId)) {
    throw new Error('Security restriction: Cannot remove the last Administrator of this workspace.');
  }

  const db = getDb();
  const targetMember = db.members.find(m => m.workspace_id === workspaceId && m.user_id === targetUserId);
  if (!targetMember) throw new Error('Member not found in this workspace.');

  db.members = db.members.filter(m => !(m.workspace_id === workspaceId && m.user_id === targetUserId));

  const admin = db.members.find(m => m.workspace_id === workspaceId && m.user_id === adminId);
  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: workspaceId,
    actor_id: adminId,
    actor_name: admin?.user_name || 'Admin',
    action: 'member_removed',
    resource_type: 'member',
    resource_id: targetMember.id,
    metadata: { target_name: targetMember.user_name, target_email: targetMember.user_email },
    created_at: new Date().toISOString(),
  });

  saveDb(db);
  return true;
}

export function transferOwnership(workspaceId: string, currentOwnerId: string, newOwnerId: string): Workspace {
  const db = getDb();
  const ws = db.workspaces.find(w => w.id === workspaceId);
  if (!ws) throw new Error('Workspace not found.');

  if (ws.owner_id !== currentOwnerId) {
    throw new Error('Forbidden: Only the current workspace owner can transfer ownership.');
  }

  const newOwnerMember = db.members.find(m => m.workspace_id === workspaceId && m.user_id === newOwnerId);
  if (!newOwnerMember) {
    throw new Error('New owner must already be an accepted member of this workspace.');
  }

  // Ensure new owner has ADMIN role
  newOwnerMember.role = 'ADMIN';
  ws.owner_id = newOwnerId;
  ws.updated_at = new Date().toISOString();

  const currentOwner = db.members.find(m => m.workspace_id === workspaceId && m.user_id === currentOwnerId);
  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: workspaceId,
    actor_id: currentOwnerId,
    actor_name: currentOwner?.user_name || 'Former Owner',
    action: 'ownership_transferred',
    resource_type: 'workspace',
    resource_id: workspaceId,
    metadata: { new_owner_id: newOwnerId, new_owner_name: newOwnerMember.user_name },
    created_at: new Date().toISOString(),
  });

  saveDb(db);
  return ws;
}

// ==============================================================================
// FOLDER & FILE MANAGEMENT ENGINE
// ==============================================================================

export function createFolder(params: {
  workspaceId: string;
  userId: string;
  name: string;
  parentFolderId?: string | null;
}): WorkspaceFolder {
  if (!canEdit(params.workspaceId, params.userId)) {
    throw new Error('Unauthorized: Viewers cannot create folders.');
  }

  const db = getDb();
  const user = db.members.find(m => m.workspace_id === params.workspaceId && m.user_id === params.userId);
  const now = new Date().toISOString();

  const folder: WorkspaceFolder = {
    id: 'fold_' + crypto.randomUUID().slice(0, 12),
    workspace_id: params.workspaceId,
    parent_folder_id: params.parentFolderId || null,
    name: params.name.trim(),
    created_by: params.userId,
    created_by_name: user?.user_name || 'Member',
    created_at: now,
    updated_at: now,
  };

  db.folders.push(folder);

  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: params.workspaceId,
    actor_id: params.userId,
    actor_name: user?.user_name || 'Member',
    action: 'folder_created',
    resource_type: 'folder',
    resource_id: folder.id,
    metadata: { name: folder.name },
    created_at: now,
  });

  saveDb(db);
  return folder;
}

export function renameFolder(workspaceId: string, userId: string, folderId: string, newName: string): WorkspaceFolder {
  if (!canEdit(workspaceId, userId)) {
    throw new Error('Unauthorized: Viewers cannot rename folders.');
  }

  const db = getDb();
  const folder = db.folders.find(f => f.id === folderId && f.workspace_id === workspaceId);
  if (!folder) throw new Error('Folder not found.');

  folder.name = newName.trim();
  folder.updated_at = new Date().toISOString();

  const user = db.members.find(m => m.workspace_id === workspaceId && m.user_id === userId);
  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: workspaceId,
    actor_id: userId,
    actor_name: user?.user_name || 'Member',
    action: 'folder_renamed',
    resource_type: 'folder',
    resource_id: folder.id,
    metadata: { new_name: folder.name },
    created_at: new Date().toISOString(),
  });

  saveDb(db);
  return folder;
}

export function deleteFolder(workspaceId: string, userId: string, folderId: string): boolean {
  if (!canAdmin(workspaceId, userId)) {
    throw new Error('Unauthorized: Only administrators can delete folders and their nested items.');
  }

  const db = getDb();
  const folder = db.folders.find(f => f.id === folderId && f.workspace_id === workspaceId);
  if (!folder) throw new Error('Folder not found.');

  // Find all recursive subfolders
  const getSubfolderIds = (parentId: string): string[] => {
    const sub = db.folders.filter(f => f.parent_folder_id === parentId);
    let ids: string[] = sub.map(f => f.id);
    for (const s of sub) {
      ids = ids.concat(getSubfolderIds(s.id));
    }
    return ids;
  };

  const allFolderIds = [folderId, ...getSubfolderIds(folderId)];

  // Clean up files in these folders
  db.files = db.files.filter(f => !(f.workspace_id === workspaceId && f.folder_id && allFolderIds.includes(f.folder_id)));
  // Delete folders
  db.folders = db.folders.filter(f => !(f.workspace_id === workspaceId && allFolderIds.includes(f.id)));

  const user = db.members.find(m => m.workspace_id === workspaceId && m.user_id === userId);
  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: workspaceId,
    actor_id: userId,
    actor_name: user?.user_name || 'Admin',
    action: 'folder_deleted',
    resource_type: 'folder',
    resource_id: folderId,
    metadata: { name: folder.name },
    created_at: new Date().toISOString(),
  });

  saveDb(db);
  return true;
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'text/csv',
  'text/plain',
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export function uploadFile(params: {
  workspaceId: string;
  userId: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  description?: string;
  folderId?: string | null;
  fileDataUrl?: string;
}): WorkspaceFile {
  if (!canEdit(params.workspaceId, params.userId)) {
    throw new Error('Unauthorized: Viewers do not have upload permissions.');
  }

  // Server-side MIME validation
  if (!ALLOWED_MIME_TYPES.includes(params.contentType)) {
    throw new Error(`Unsupported file type (${params.contentType}). Supported: PDF, PNG, JPG, WEBP, DOCX, XLSX, PPTX, CSV, TXT.`);
  }

  // Server-side size validation
  if (params.fileSize > MAX_FILE_SIZE) {
    throw new Error(`File exceeds maximum allowed size of 25MB.`);
  }

  const db = getDb();
  const user = db.members.find(m => m.workspace_id === params.workspaceId && m.user_id === params.userId);
  const now = new Date().toISOString();
  const sanitizedName = params.originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileId = 'file_' + crypto.randomUUID().slice(0, 12);
  const storageKey = `workspaces/${params.workspaceId}/files/${crypto.randomBytes(8).toString('hex')}_${sanitizedName}`;

  const file: WorkspaceFile = {
    id: fileId,
    workspace_id: params.workspaceId,
    folder_id: params.folderId || null,
    storage_key: storageKey,
    original_filename: sanitizedName,
    content_type: params.contentType,
    file_size: params.fileSize,
    description: params.description || '',
    uploaded_by: params.userId,
    uploaded_by_name: user?.user_name || 'Member',
    file_data_url: params.fileDataUrl,
    created_at: now,
    updated_at: now,
  };

  db.files.push(file);

  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: params.workspaceId,
    actor_id: params.userId,
    actor_name: user?.user_name || 'Member',
    action: 'file_uploaded',
    resource_type: 'file',
    resource_id: file.id,
    metadata: { filename: file.original_filename, size: file.file_size },
    created_at: now,
  });

  saveDb(db);
  return file;
}

export function renameFile(workspaceId: string, userId: string, fileId: string, newFilename: string, description?: string): WorkspaceFile {
  if (!canEdit(workspaceId, userId)) {
    throw new Error('Unauthorized: Viewers cannot rename files.');
  }

  const db = getDb();
  const file = db.files.find(f => f.id === fileId && f.workspace_id === workspaceId);
  if (!file) throw new Error('File not found in this workspace.');

  file.original_filename = newFilename.trim().replace(/[^a-zA-Z0-9._-]/g, '_');
  if (description !== undefined) file.description = description;
  file.updated_at = new Date().toISOString();

  const user = db.members.find(m => m.workspace_id === workspaceId && m.user_id === userId);
  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: workspaceId,
    actor_id: userId,
    actor_name: user?.user_name || 'Member',
    action: 'file_renamed',
    resource_type: 'file',
    resource_id: file.id,
    metadata: { new_name: file.original_filename },
    created_at: new Date().toISOString(),
  });

  saveDb(db);
  return file;
}

export function moveFile(workspaceId: string, userId: string, fileId: string, targetFolderId: string | null): WorkspaceFile {
  if (!canEdit(workspaceId, userId)) {
    throw new Error('Unauthorized: Viewers cannot move files.');
  }

  const db = getDb();
  const file = db.files.find(f => f.id === fileId && f.workspace_id === workspaceId);
  if (!file) throw new Error('File not found in this workspace.');

  if (targetFolderId) {
    const folderExists = db.folders.some(f => f.id === targetFolderId && f.workspace_id === workspaceId);
    if (!folderExists) throw new Error('Target folder not found in this workspace.');
  }

  file.folder_id = targetFolderId;
  file.updated_at = new Date().toISOString();

  const user = db.members.find(m => m.workspace_id === workspaceId && m.user_id === userId);
  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: workspaceId,
    actor_id: userId,
    actor_name: user?.user_name || 'Member',
    action: 'file_moved',
    resource_type: 'file',
    resource_id: file.id,
    metadata: { filename: file.original_filename, target_folder_id: targetFolderId },
    created_at: new Date().toISOString(),
  });

  saveDb(db);
  return file;
}

export function deleteFile(workspaceId: string, userId: string, fileId: string): boolean {
  const db = getDb();
  const file = db.files.find(f => f.id === fileId && f.workspace_id === workspaceId);
  if (!file) throw new Error('File not found.');

  // Only Admin or the original uploader can delete a file
  const userRole = getUserRoleInWorkspace(workspaceId, userId);
  if (userRole !== 'ADMIN' && file.uploaded_by !== userId) {
    throw new Error('Unauthorized: Only administrators or the original file uploader can delete this file.');
  }

  db.files = db.files.filter(f => f.id !== fileId);
  // Also clean up any comments on this file
  db.comments = db.comments.filter(c => c.file_id !== fileId);

  const user = db.members.find(m => m.workspace_id === workspaceId && m.user_id === userId);
  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: workspaceId,
    actor_id: userId,
    actor_name: user?.user_name || 'Member',
    action: 'file_deleted',
    resource_type: 'file',
    resource_id: fileId,
    metadata: { filename: file.original_filename },
    created_at: new Date().toISOString(),
  });

  saveDb(db);
  return true;
}

// ==============================================================================
// TASK BOARD ENGINE
// ==============================================================================

export function createTask(params: {
  workspaceId: string;
  userId: string;
  title: string;
  description: string;
  status?: WorkspaceTask['status'];
  priority?: WorkspaceTask['priority'];
  assignedTo?: string | null;
  dueDate?: string | null;
}): WorkspaceTask {
  if (!canEdit(params.workspaceId, params.userId)) {
    throw new Error('Unauthorized: Viewers cannot create tasks.');
  }

  const db = getDb();
  const creator = db.members.find(m => m.workspace_id === params.workspaceId && m.user_id === params.userId);

  // Validate assignee is an actual member of this workspace
  let assigneeMember: WorkspaceMember | undefined;
  if (params.assignedTo) {
    assigneeMember = db.members.find(m => m.workspace_id === params.workspaceId && m.user_id === params.assignedTo);
    if (!assigneeMember) {
      throw new Error('Task assignee must be a verified member of this workspace.');
    }
  }

  const now = new Date().toISOString();
  const task: WorkspaceTask = {
    id: 'task_' + crypto.randomUUID().slice(0, 12),
    workspace_id: params.workspaceId,
    title: params.title.trim(),
    description: params.description.trim(),
    status: params.status || 'todo',
    priority: params.priority || 'medium',
    assigned_to: params.assignedTo || null,
    assigned_to_name: assigneeMember?.user_name,
    assigned_to_avatar: assigneeMember?.user_avatar,
    created_by: params.userId,
    created_by_name: creator?.user_name || 'Member',
    due_date: params.dueDate || null,
    created_at: now,
    updated_at: now,
  };

  db.tasks.push(task);

  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: params.workspaceId,
    actor_id: params.userId,
    actor_name: creator?.user_name || 'Member',
    action: 'task_created',
    resource_type: 'task',
    resource_id: task.id,
    metadata: { title: task.title, priority: task.priority },
    created_at: now,
  });

  saveDb(db);
  return task;
}

export function updateTask(
  workspaceId: string,
  userId: string,
  taskId: string,
  updates: Partial<Pick<WorkspaceTask, 'title' | 'description' | 'status' | 'priority' | 'assigned_to' | 'due_date'>>
): WorkspaceTask {
  if (!canEdit(workspaceId, userId)) {
    throw new Error('Unauthorized: Viewers cannot update tasks.');
  }

  const db = getDb();
  const task = db.tasks.find(t => t.id === taskId && t.workspace_id === workspaceId);
  if (!task) throw new Error('Task not found in this workspace.');

  const updater = db.members.find(m => m.workspace_id === workspaceId && m.user_id === userId);

  if (updates.title !== undefined) task.title = updates.title.trim();
  if (updates.description !== undefined) task.description = updates.description.trim();
  if (updates.priority !== undefined) task.priority = updates.priority;
  if (updates.due_date !== undefined) task.due_date = updates.due_date;

  const oldStatus = task.status;
  if (updates.status !== undefined) {
    task.status = updates.status;
  }

  if (updates.assigned_to !== undefined) {
    if (updates.assigned_to) {
      const assigneeMember = db.members.find(m => m.workspace_id === workspaceId && m.user_id === updates.assigned_to);
      if (!assigneeMember) throw new Error('Assignee must be a member of this workspace.');
      task.assigned_to = updates.assigned_to;
      task.assigned_to_name = assigneeMember.user_name;
      task.assigned_to_avatar = assigneeMember.user_avatar;
    } else {
      task.assigned_to = null;
      task.assigned_to_name = undefined;
      task.assigned_to_avatar = undefined;
    }
  }

  task.updated_at = new Date().toISOString();

  const action: ActivityAction = updates.status && updates.status !== oldStatus 
    ? (updates.status === 'completed' ? 'task_completed' as ActivityAction : 'task_status_changed' as ActivityAction)
    : 'task_updated';

  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: workspaceId,
    actor_id: userId,
    actor_name: updater?.user_name || 'Member',
    action,
    resource_type: 'task',
    resource_id: task.id,
    metadata: { title: task.title, status: task.status },
    created_at: new Date().toISOString(),
  });

  saveDb(db);
  return task;
}

export function deleteTask(workspaceId: string, userId: string, taskId: string): boolean {
  if (!canEdit(workspaceId, userId)) {
    throw new Error('Unauthorized: Viewers cannot delete tasks.');
  }

  const db = getDb();
  const task = db.tasks.find(t => t.id === taskId && t.workspace_id === workspaceId);
  if (!task) throw new Error('Task not found.');

  db.tasks = db.tasks.filter(t => t.id !== taskId);
  db.comments = db.comments.filter(c => c.task_id !== taskId);

  const user = db.members.find(m => m.workspace_id === workspaceId && m.user_id === userId);
  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: workspaceId,
    actor_id: userId,
    actor_name: user?.user_name || 'Member',
    action: 'task_deleted',
    resource_type: 'task',
    resource_id: taskId,
    metadata: { title: task.title },
    created_at: new Date().toISOString(),
  });

  saveDb(db);
  return true;
}

// ==============================================================================
// ANNOUNCEMENTS & COMMENTS ENGINE
// ==============================================================================

export function addAnnouncement(params: {
  workspaceId: string;
  userId: string;
  title: string;
  content: string;
  pinned?: boolean;
}): WorkspaceAnnouncement {
  if (!canAdmin(params.workspaceId, params.userId)) {
    throw new Error('Unauthorized: Only administrators can publish announcements.');
  }

  const db = getDb();
  const admin = db.members.find(m => m.workspace_id === params.workspaceId && m.user_id === params.userId);
  const now = new Date().toISOString();

  const ann: WorkspaceAnnouncement = {
    id: 'ann_' + crypto.randomUUID().slice(0, 12),
    workspace_id: params.workspaceId,
    author_id: params.userId,
    author_name: admin?.user_name || 'Admin',
    author_avatar: admin?.user_avatar || '',
    title: params.title.trim(),
    content: params.content.trim(),
    pinned: params.pinned ?? false,
    created_at: now,
    updated_at: now,
  };

  db.announcements.push(ann);

  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: params.workspaceId,
    actor_id: params.userId,
    actor_name: admin?.user_name || 'Admin',
    action: 'announcement_published',
    resource_type: 'announcement',
    resource_id: ann.id,
    metadata: { title: ann.title },
    created_at: now,
  });

  saveDb(db);
  return ann;
}

export function deleteAnnouncement(workspaceId: string, userId: string, announcementId: string): boolean {
  if (!canAdmin(workspaceId, userId)) {
    throw new Error('Unauthorized: Only administrators can delete announcements.');
  }

  const db = getDb();
  db.announcements = db.announcements.filter(a => !(a.id === announcementId && a.workspace_id === workspaceId));
  saveDb(db);
  return true;
}

export function addComment(params: {
  workspaceId: string;
  userId: string;
  taskId?: string | null;
  fileId?: string | null;
  content: string;
}): WorkspaceComment {
  if (!canEdit(params.workspaceId, params.userId)) {
    throw new Error('Unauthorized: Viewers cannot post comments.');
  }

  const db = getDb();
  const author = db.members.find(m => m.workspace_id === params.workspaceId && m.user_id === params.userId);
  const now = new Date().toISOString();

  const comment: WorkspaceComment = {
    id: 'comm_' + crypto.randomUUID().slice(0, 12),
    workspace_id: params.workspaceId,
    task_id: params.taskId || null,
    file_id: params.fileId || null,
    author_id: params.userId,
    author_name: author?.user_name || 'Member',
    author_avatar: author?.user_avatar || '',
    content: params.content.trim(),
    created_at: now,
    updated_at: now,
  };

  db.comments.push(comment);

  db.activities.push({
    id: 'act_' + crypto.randomUUID().slice(0, 12),
    workspace_id: params.workspaceId,
    actor_id: params.userId,
    actor_name: author?.user_name || 'Member',
    action: 'comment_added',
    resource_type: 'comment',
    resource_id: comment.id,
    metadata: { target: params.taskId ? 'task' : 'file' },
    created_at: now,
  });

  saveDb(db);
  return comment;
}
