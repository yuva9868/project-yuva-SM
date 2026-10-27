import { User } from './auth-context';
import {
  ConversationWithDetails,
  Conversation,
  Message,
  MessageAttachment,
  MessageRequest,
  UserBlock,
  UserMessagingPrivacy,
  ProjectContextSummary,
} from './messaging-types';

function getAuthHeaders(user: User | null): HeadersInit {
  if (!user) return {};
  return {
    'x-user-id': user.id,
    'x-user-email': user.email,
    'x-user-name': user.name,
    'x-user-avatar': user.avatar || '',
  };
}

export class MessagingApiError extends Error {
  status: number;
  constructor(message: string, status: number = 400) {
    super(message);
    this.name = 'MessagingApiError';
    this.status = status;
  }
}

export async function apiListConversations(
  user: User,
  query?: string,
  filter?: 'all' | 'unread' | 'requests'
): Promise<{ conversations: ConversationWithDetails[]; totalUnread: number }> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (filter) params.set('filter', filter);

  const res = await fetch(`/api/messages/conversations?${params.toString()}`, {
    headers: { ...getAuthHeaders(user) },
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new MessagingApiError(data.error || 'Failed to load conversations', res.status);
  return data;
}

export async function apiGetConversation(
  conversationId: string,
  user: User,
  options: { limit?: number; before?: string } = {}
): Promise<{
  conversation: Conversation;
  otherParticipant: ConversationWithDetails['otherParticipant'];
  participants: any[];
  messages: Message[];
  hasMore: boolean;
  requestStatus?: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined';
  requestId?: string;
  isMuted: boolean;
}> {
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', options.limit.toString());
  if (options.before) params.set('before', options.before);

  const res = await fetch(`/api/messages/conversations/${conversationId}?${params.toString()}`, {
    headers: { ...getAuthHeaders(user) },
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new MessagingApiError(data.error || 'Failed to load conversation', res.status);
  return data;
}

export async function apiFindOrCreateConversation(
  targetUserId: string,
  user: User,
  projectContext?: {
    projectId: string;
    projectTitle: string;
    projectTagline?: string;
    projectStage?: string;
    projectLogoUrl?: string;
  }
): Promise<{ conversation: Conversation; isNew: boolean }> {
  const res = await fetch('/api/messages/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ targetUserId, projectContext }),
  });
  const data = await res.json();
  if (!res.ok) throw new MessagingApiError(data.error || 'Failed to start conversation', res.status);
  return data;
}

export async function apiSendMessage(
  conversationId: string,
  user: User,
  payload: {
    content: string;
    messageType?: 'text' | 'project_share' | 'workspace_invite' | 'system';
    replyToId?: string;
    attachments?: MessageAttachment[];
    clientMessageId?: string;
  }
): Promise<{ message: Message }> {
  const res = await fetch(`/api/messages/conversations/${conversationId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new MessagingApiError(data.error || 'Failed to send message', res.status);
  return data;
}

export async function apiMarkConversationRead(conversationId: string, user: User): Promise<void> {
  await fetch(`/api/messages/conversations/${conversationId}/read`, {
    method: 'PATCH',
    headers: { ...getAuthHeaders(user) },
  }).catch(() => {});
}

export async function apiDeleteMessage(
  conversationId: string,
  messageId: string,
  user: User
): Promise<{ message: Message }> {
  const res = await fetch(`/api/messages/conversations/${conversationId}/messages/${messageId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders(user) },
  });
  const data = await res.json();
  if (!res.ok) throw new MessagingApiError(data.error || 'Failed to delete message', res.status);
  return data;
}

export async function apiToggleMute(conversationId: string, user: User): Promise<{ isMuted: boolean }> {
  const res = await fetch(`/api/messages/conversations/${conversationId}/mute`, {
    method: 'POST',
    headers: { ...getAuthHeaders(user) },
  });
  const data = await res.json();
  if (!res.ok) throw new MessagingApiError(data.error || 'Failed to toggle mute', res.status);
  return data;
}

export async function apiInviteToWorkspace(
  conversationId: string,
  user: User,
  workspaceId: string,
  role: 'ADMIN' | 'EDITOR' | 'VIEWER' = 'VIEWER'
): Promise<{ message: Message }> {
  const res = await fetch(`/api/messages/conversations/${conversationId}/workspace-invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ workspaceId, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new MessagingApiError(data.error || 'Failed to invite to workspace', res.status);
  return data;
}

export async function apiRespondToWorkspaceInvite(
  conversationId: string,
  user: User,
  messageId: string,
  accept: boolean
): Promise<void> {
  const res = await fetch(`/api/messages/conversations/${conversationId}/workspace-invite/respond`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ messageId, accept }),
  });
  const data = await res.json();
  if (!res.ok) throw new MessagingApiError(data.error || 'Failed to respond to invitation', res.status);
}

export async function apiUpdateMessageRequest(
  requestId: string,
  user: User,
  status: 'accepted' | 'declined'
): Promise<{ request: MessageRequest }> {
  const res = await fetch(`/api/messages/requests/${requestId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new MessagingApiError(data.error || 'Failed to update request', res.status);
  return data;
}

export async function apiBlockUser(targetUserId: string, user: User, targetUserName?: string): Promise<void> {
  const res = await fetch('/api/messages/block', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify({ targetUserId, targetUserName }),
  });
  const data = await res.json();
  if (!res.ok) throw new MessagingApiError(data.error || 'Failed to block user', res.status);
}

export async function apiUnblockUser(targetUserId: string, user: User): Promise<void> {
  const res = await fetch(`/api/messages/block?targetUserId=${encodeURIComponent(targetUserId)}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders(user) },
  });
  const data = await res.json();
  if (!res.ok) throw new MessagingApiError(data.error || 'Failed to unblock user', res.status);
}

export async function apiReportMessageOrUser(
  user: User,
  payload: {
    reportedUserId: string;
    conversationId: string;
    messageId?: string;
    reason: string;
    details?: string;
  }
): Promise<void> {
  const res = await fetch('/api/messages/report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new MessagingApiError(data.error || 'Failed to submit report', res.status);
}

export async function apiGetUnreadCount(user: User): Promise<number> {
  try {
    const res = await fetch('/api/messages/unread-count', {
      headers: { ...getAuthHeaders(user) },
      cache: 'no-store',
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.unreadCount || 0;
  } catch {
    return 0;
  }
}

export async function apiPingPresence(user: User, isOnline: boolean = true): Promise<void> {
  try {
    await fetch('/api/messages/presence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(user),
      },
      body: JSON.stringify({ isOnline }),
    });
  } catch {}
}

export async function apiGetPrivacySettings(user: User): Promise<UserMessagingPrivacy> {
  const res = await fetch('/api/messages/privacy', {
    headers: { ...getAuthHeaders(user) },
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new MessagingApiError(data.error || 'Failed to get privacy settings', res.status);
  return data.settings;
}

export async function apiUpdatePrivacySettings(
  user: User,
  settings: Partial<UserMessagingPrivacy>
): Promise<UserMessagingPrivacy> {
  const res = await fetch('/api/messages/privacy', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
    },
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok) throw new MessagingApiError(data.error || 'Failed to update privacy settings', res.status);
  return data.settings;
}
