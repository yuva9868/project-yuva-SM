import {
  Workspace,
  WorkspaceFullData,
  WorkspaceRole,
  WorkspaceInvitation,
  WorkspaceFolder,
  WorkspaceFile,
  WorkspaceTask,
  WorkspaceAnnouncement,
  WorkspaceComment,
} from './workspace-types';
import { User } from './auth-context';

function getAuthHeaders(user: User | null): HeadersInit {
  if (!user) return {};
  return {
    'x-user-id': user.id,
    'x-user-email': user.email,
    'x-user-name': user.name,
    'x-user-avatar': user.avatar || '',
  };
}

export class WorkspaceApiError extends Error {
  status: number;
  constructor(message: string, status: number = 400) {
    super(message);
    this.name = 'WorkspaceApiError';
    this.status = status;
  }
}

export async function apiListWorkspaces(user: User): Promise<Array<Workspace & { userRole: WorkspaceRole; memberCount: number }>> {
  const res = await fetch('/api/workspaces', {
    headers: { ...getAuthHeaders(user) },
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to list workspaces', res.status);
  return data.workspaces;
}

export async function apiGetWorkspace(workspaceId: string, user: User): Promise<WorkspaceFullData> {
  const res = await fetch(`/api/workspaces/${workspaceId}`, {
    headers: { ...getAuthHeaders(user) },
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to get workspace', res.status);
  return data;
}

export async function apiCreateWorkspace(
  params: {
    name: string;
    description: string;
    logo_path?: string;
    cover_image?: string;
    linked_project_id?: string;
    linked_project_title?: string;
  },
  user: User
): Promise<Workspace> {
  const res = await fetch('/api/workspaces', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to create workspace', res.status);
  return data.workspace;
}

export async function apiUpdateWorkspace(
  workspaceId: string,
  updates: Partial<Pick<Workspace, 'name' | 'description' | 'logo_path' | 'cover_image' | 'settings' | 'linked_project_id' | 'linked_project_title'>>,
  user: User
): Promise<Workspace> {
  const res = await fetch(`/api/workspaces/${workspaceId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to update workspace', res.status);
  return data.workspace;
}

export async function apiArchiveWorkspace(workspaceId: string, archive: boolean, user: User): Promise<Workspace> {
  const res = await fetch(`/api/workspaces/${workspaceId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ archive }),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to archive workspace', res.status);
  return data.workspace;
}

export async function apiDeleteWorkspace(workspaceId: string, confirmedName: string, user: User): Promise<boolean> {
  const res = await fetch(`/api/workspaces/${workspaceId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ confirmedName }),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to delete workspace', res.status);
  return true;
}

// ================= MEMBERS & INVITATIONS =================

export async function apiInviteMember(
  workspaceId: string,
  params: { email: string; role: WorkspaceRole },
  user: User
): Promise<WorkspaceInvitation> {
  const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to invite member', res.status);
  return data.invitation;
}

export async function apiRevokeInvitation(workspaceId: string, invitationId: string, user: User): Promise<boolean> {
  const res = await fetch(`/api/workspaces/${workspaceId}/invitations`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ invitationId }),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to revoke invitation', res.status);
  return true;
}

export async function apiGetInvitationDetails(token: string): Promise<{ invitation: WorkspaceInvitation; workspace: Workspace }> {
  const res = await fetch(`/api/workspaces/invitations/${token}`, {
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to lookup invitation', res.status);
  return data;
}

export async function apiAcceptInvitation(token: string, user: User): Promise<{ workspace: Workspace }> {
  const res = await fetch(`/api/workspaces/invitations/${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ action: 'accept' }),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to accept invitation', res.status);
  return data;
}

export async function apiDeclineInvitation(token: string, user: User): Promise<boolean> {
  const res = await fetch(`/api/workspaces/invitations/${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ action: 'decline' }),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to decline invitation', res.status);
  return true;
}

export async function apiUpdateMemberRole(
  workspaceId: string,
  targetUserId: string,
  newRole: WorkspaceRole,
  user: User
): Promise<void> {
  const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ targetUserId, newRole }),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to update member role', res.status);
}

export async function apiRemoveMember(workspaceId: string, targetUserId: string, user: User): Promise<void> {
  const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ targetUserId }),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to remove member', res.status);
}

export async function apiTransferOwnership(workspaceId: string, newOwnerId: string, user: User): Promise<void> {
  const res = await fetch(`/api/workspaces/${workspaceId}/members/transfer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ newOwnerId }),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to transfer ownership', res.status);
}

// ================= FOLDERS & FILES =================

export async function apiCreateFolder(
  workspaceId: string,
  name: string,
  parentFolderId: string | null,
  user: User
): Promise<WorkspaceFolder> {
  const res = await fetch(`/api/workspaces/${workspaceId}/folders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ name, parentFolderId }),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to create folder', res.status);
  return data.folder;
}

export async function apiRenameFolder(workspaceId: string, folderId: string, newName: string, user: User): Promise<WorkspaceFolder> {
  const res = await fetch(`/api/workspaces/${workspaceId}/folders`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ folderId, newName }),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to rename folder', res.status);
  return data.folder;
}

export async function apiDeleteFolder(workspaceId: string, folderId: string, user: User): Promise<void> {
  const res = await fetch(`/api/workspaces/${workspaceId}/folders`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ folderId }),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to delete folder', res.status);
}

export async function apiUploadFile(
  workspaceId: string,
  params: {
    originalFilename: string;
    contentType: string;
    fileSize: number;
    description?: string;
    folderId?: string | null;
    fileDataUrl?: string;
  },
  user: User
): Promise<WorkspaceFile> {
  const res = await fetch(`/api/workspaces/${workspaceId}/files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to upload file', res.status);
  return data.file;
}

export async function apiRenameFile(
  workspaceId: string,
  fileId: string,
  newFilename: string,
  description: string | undefined,
  user: User
): Promise<WorkspaceFile> {
  const res = await fetch(`/api/workspaces/${workspaceId}/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ newFilename, description }),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to rename file', res.status);
  return data.file;
}

export async function apiMoveFile(
  workspaceId: string,
  fileId: string,
  targetFolderId: string | null,
  user: User
): Promise<WorkspaceFile> {
  const res = await fetch(`/api/workspaces/${workspaceId}/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ targetFolderId }),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to move file', res.status);
  return data.file;
}

export async function apiDeleteFile(workspaceId: string, fileId: string, user: User): Promise<void> {
  const res = await fetch(`/api/workspaces/${workspaceId}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(user),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to delete file', res.status);
}

export async function apiDownloadFile(workspaceId: string, fileId: string, user: User): Promise<void> {
  const res = await fetch(`/api/workspaces/${workspaceId}/files/${fileId}/download`, {
    headers: {
      ...getAuthHeaders(user),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Download failed' }));
    throw new WorkspaceApiError(errorData.error || 'Download failed or permission denied.', res.status);
  }

  // Handle stream or blob download
  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition');
  let filename = 'download';
  if (disposition && disposition.indexOf('filename=') !== -1) {
    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) filename = match[1];
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// ================= TASKS, ANNOUNCEMENTS, COMMENTS =================

export async function apiCreateTask(
  workspaceId: string,
  taskData: {
    title: string;
    description: string;
    status?: WorkspaceTask['status'];
    priority?: WorkspaceTask['priority'];
    assignedTo?: string | null;
    dueDate?: string | null;
  },
  user: User
): Promise<WorkspaceTask> {
  const res = await fetch(`/api/workspaces/${workspaceId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify(taskData),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to create task', res.status);
  return data.task;
}

export async function apiUpdateTask(
  workspaceId: string,
  taskId: string,
  updates: Partial<Pick<WorkspaceTask, 'title' | 'description' | 'status' | 'priority' | 'assigned_to' | 'due_date'>>,
  user: User
): Promise<WorkspaceTask> {
  const res = await fetch(`/api/workspaces/${workspaceId}/tasks`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ taskId, updates }),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to update task', res.status);
  return data.task;
}

export async function apiDeleteTask(workspaceId: string, taskId: string, user: User): Promise<void> {
  const res = await fetch(`/api/workspaces/${workspaceId}/tasks`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ taskId }),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to delete task', res.status);
}

export async function apiAddAnnouncement(
  workspaceId: string,
  params: { title: string; content: string; pinned?: boolean },
  user: User
): Promise<WorkspaceAnnouncement> {
  const res = await fetch(`/api/workspaces/${workspaceId}/announcements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to post announcement', res.status);
  return data.announcement;
}

export async function apiDeleteAnnouncement(workspaceId: string, announcementId: string, user: User): Promise<void> {
  const res = await fetch(`/api/workspaces/${workspaceId}/announcements`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ announcementId }),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to delete announcement', res.status);
}

export async function apiAddComment(
  workspaceId: string,
  params: { taskId?: string | null; fileId?: string | null; content: string },
  user: User
): Promise<WorkspaceComment> {
  const res = await fetch(`/api/workspaces/${workspaceId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new WorkspaceApiError(data.error || 'Failed to add comment', res.status);
  return data.comment;
}
