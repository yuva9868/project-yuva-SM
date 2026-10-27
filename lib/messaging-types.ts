export type ConversationType = 'direct' | 'group';

export interface ProjectContextSummary {
  id: string;
  name: string;
  tagline: string;
  stage: string;
  founderId: string;
  founderName: string;
  founderAvatar?: string;
  logoUrl?: string;
  category?: string;
  url: string;
}

export interface WorkspaceInviteSummary {
  workspaceId: string;
  workspaceName: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  invitationToken?: string;
  description?: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'project' | 'workspace_invite' | 'link';
  url?: string;
  name?: string;
  size?: number;
  mimeType?: string;
  caption?: string;
  projectData?: ProjectContextSummary;
  workspaceInviteData?: WorkspaceInviteSummary;
}

export interface MessageReplyReference {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
}

export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  clientMessageId?: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderEmail?: string;
  content: string;
  messageType: 'text' | 'project_share' | 'workspace_invite' | 'system';
  replyTo?: MessageReplyReference | null;
  attachments?: MessageAttachment[];
  deletedAt?: string | null;
  status: MessageDeliveryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  conversationId: string;
  userId: string;
  joinedAt: string;
  lastReadAt: string;
  mutedAt?: string | null;
  isPinned?: boolean;
  user?: {
    id: string;
    name: string;
    username: string;
    email?: string;
    avatar?: string;
    bio?: string;
    role?: string;
    skills?: string[];
    badges?: string[];
    location?: string;
    collaborationStatus?: string;
    isOnline?: boolean;
    lastSeenAt?: string;
  };
}

export interface Conversation {
  id: string;
  type: ConversationType;
  participantIds: string[];
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  lastMessageContent?: string;
  lastMessageSenderId?: string;
  // Project context when conversation was initiated from a project
  projectId?: string;
  projectTitle?: string;
  projectTagline?: string;
  projectStage?: string;
  projectLogoUrl?: string;
  isArchived?: boolean;
}

export interface ConversationWithDetails {
  conversation: Conversation;
  otherParticipant: ConversationParticipant['user'];
  participants: ConversationParticipant[];
  unreadCount: number;
  lastMessage?: Message;
  isMuted: boolean;
  requestStatus?: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined';
  requestId?: string;
}

export interface MessageRequest {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  initialMessage: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}

export interface UserBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  blockedName?: string;
  createdAt: string;
}

export interface MessageReport {
  id: string;
  reporterId: string;
  reporterEmail?: string;
  reportedUserId: string;
  conversationId: string;
  messageId?: string;
  reason: 'spam' | 'harassment' | 'scam' | 'inappropriate' | 'other';
  details?: string;
  createdAt: string;
}

export interface UserMessagingPrivacy {
  userId: string;
  allowMessagesFrom: 'everyone' | 'community' | 'verified_only';
  showReadReceipts: boolean;
  showOnlineStatus: boolean;
}

export interface UserPresence {
  userId: string;
  lastSeenAt: string;
  isOnline: boolean;
}
