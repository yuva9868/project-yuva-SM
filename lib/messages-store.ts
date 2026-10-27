import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Conversation,
  ConversationParticipant,
  Message,
  MessageRequest,
  UserBlock,
  MessageReport,
  UserMessagingPrivacy,
  UserPresence,
  ConversationWithDetails,
  MessageAttachment,
  ProjectContextSummary,
  WorkspaceInviteSummary
} from './messaging-types';
import { AuthenticatedUser } from './workspace-server-auth';
import { INITIAL_FOUNDERS } from './community-data';
import { createInvitation, acceptInvitation, canAdmin, canEdit, getDb as getWorkspaceDb } from './workspace-store';

interface MessagesDatabase {
  conversations: Conversation[];
  participants: ConversationParticipant[];
  messages: Message[];
  requests: MessageRequest[];
  blocks: UserBlock[];
  reports: MessageReport[];
  privacySettings: UserMessagingPrivacy[];
  presences: UserPresence[];
}

const MESSAGES_DB_FILE = path.join(process.cwd(), '.workspace_data', 'messages.json');

// Memory rate limit tracker: userId -> array of timestamps
const rateLimitTracker = new Map<string, number[]>();

function ensureDir() {
  const dir = path.dirname(MESSAGES_DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Initial realistic seed data representing active startup founders on IdeaCheck AI
function getInitialMessagesDb(): MessagesDatabase {
  const now = Date.now();
  const time = (offsetMinutes: number) => new Date(now - offsetMinutes * 60 * 1000).toISOString();

  const conv1Id = 'conv_sarah_alex_1';
  const conv2Id = 'conv_sarah_marcus_2';
  const conv3Id = 'conv_alex_elena_3';

  return {
    conversations: [
      {
        id: conv1Id,
        type: 'direct',
        participantIds: ['user_sarah', 'user_alex'],
        createdAt: time(120),
        updatedAt: time(5),
        lastMessageAt: time(5),
        lastMessageContent: 'Awesome, reviewing the Figma flow right now! Ready to integrate the workspace API.',
        lastMessageSenderId: 'user_sarah',
        projectId: 'proj_ai_validation_copilot',
        projectTitle: 'AI Startup Validation Copilot',
        projectTagline: 'LLM agents that run customer discovery & simulated competitor audits',
        projectStage: 'Beta',
        projectLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: conv2Id,
        type: 'direct',
        participantIds: ['user_sarah', 'user_marcus'],
        createdAt: time(1440),
        updatedAt: time(45),
        lastMessageAt: time(45),
        lastMessageContent: 'I checked out your DevTool submission. Would love to explore a co-founder partnership.',
        lastMessageSenderId: 'user_marcus',
        projectId: 'proj_ai_validation_copilot',
        projectTitle: 'AI Startup Validation Copilot',
        projectTagline: 'LLM agents that run customer discovery & simulated competitor audits',
        projectStage: 'Beta',
      },
      {
        id: conv3Id,
        type: 'direct',
        participantIds: ['user_alex', 'user_elena'],
        createdAt: time(2880),
        updatedAt: time(300),
        lastMessageAt: time(300),
        lastMessageContent: 'Thank you for the investor feedback on our traction metrics. We reached 1,200 active founders this week.',
        lastMessageSenderId: 'user_alex',
      }
    ],
    participants: [
      {
        conversationId: conv1Id,
        userId: 'user_sarah',
        joinedAt: time(120),
        lastReadAt: time(2),
      },
      {
        conversationId: conv1Id,
        userId: 'user_alex',
        joinedAt: time(120),
        lastReadAt: time(6),
      },
      {
        conversationId: conv2Id,
        userId: 'user_sarah',
        joinedAt: time(1440),
        lastReadAt: time(100),
      },
      {
        conversationId: conv2Id,
        userId: 'user_marcus',
        joinedAt: time(1440),
        lastReadAt: time(45),
      },
      {
        conversationId: conv3Id,
        userId: 'user_alex',
        joinedAt: time(2880),
        lastReadAt: time(300),
      },
      {
        conversationId: conv3Id,
        userId: 'user_elena',
        joinedAt: time(2880),
        lastReadAt: time(310),
      }
    ],
    messages: [
      {
        id: 'msg_101',
        conversationId: conv1Id,
        senderId: 'user_alex',
        senderName: 'Alex Vance',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: 'Hi Sarah! Loved the AI Startup Validation Copilot launch on the community feed.',
        messageType: 'text',
        status: 'read',
        createdAt: time(45),
        updatedAt: time(45),
      },
      {
        id: 'msg_102',
        conversationId: conv1Id,
        senderId: 'user_sarah',
        senderName: 'Sarah Chen',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: 'Thanks Alex! We just published the interactive demo and prototype link. Here is the project card:',
        messageType: 'project_share',
        attachments: [
          {
            id: 'att_proj_1',
            type: 'project',
            projectData: {
              id: 'proj_ai_validation_copilot',
              name: 'AI Startup Validation Copilot',
              tagline: 'LLM agents that run customer discovery & simulated competitor audits',
              stage: 'Beta',
              founderId: 'user_sarah',
              founderName: 'Sarah Chen',
              founderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
              category: 'Developer Tools & AI',
              url: '/community/proj_ai_validation_copilot'
            }
          }
        ],
        status: 'read',
        createdAt: time(35),
        updatedAt: time(35),
      },
      {
        id: 'msg_103',
        conversationId: conv1Id,
        senderId: 'user_alex',
        senderName: 'Alex Vance',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: 'The architecture looks pristine. I checked the prototype at https://github.com/ideacheck-ai/copilot-demo — I can help build the Next.js real-time collaborative workspace!',
        messageType: 'text',
        replyTo: {
          id: 'msg_102',
          senderId: 'user_sarah',
          senderName: 'Sarah Chen',
          content: 'Thanks Alex! We just published the interactive demo and prototype link.'
        },
        status: 'read',
        createdAt: time(20),
        updatedAt: time(20),
      },
      {
        id: 'msg_104',
        conversationId: conv1Id,
        senderId: 'user_sarah',
        senderName: 'Sarah Chen',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: 'Awesome, reviewing the Figma flow right now! Ready to integrate the workspace API.',
        messageType: 'text',
        status: 'read',
        createdAt: time(5),
        updatedAt: time(5),
      },
      {
        id: 'msg_201',
        conversationId: conv2Id,
        senderId: 'user_marcus',
        senderName: 'Marcus Thorne',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        content: 'I checked out your DevTool submission. Would love to explore a co-founder partnership.',
        messageType: 'text',
        status: 'sent',
        createdAt: time(45),
        updatedAt: time(45),
      },
      {
        id: 'msg_301',
        conversationId: conv3Id,
        senderId: 'user_alex',
        senderName: 'Alex Vance',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: 'Thank you for the investor feedback on our traction metrics. We reached 1,200 active founders this week.',
        messageType: 'text',
        status: 'read',
        createdAt: time(300),
        updatedAt: time(300),
      }
    ],
    requests: [
      {
        id: 'req_marcus_sarah_1',
        conversationId: conv2Id,
        senderId: 'user_marcus',
        senderName: 'Marcus Thorne',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        recipientId: 'user_sarah',
        initialMessage: 'I checked out your DevTool submission. Would love to explore a co-founder partnership.',
        status: 'pending',
        createdAt: time(45),
        updatedAt: time(45),
      }
    ],
    blocks: [],
    reports: [],
    privacySettings: [
      {
        userId: 'user_sarah',
        allowMessagesFrom: 'everyone',
        showReadReceipts: true,
        showOnlineStatus: true,
      },
      {
        userId: 'user_alex',
        allowMessagesFrom: 'everyone',
        showReadReceipts: true,
        showOnlineStatus: true,
      }
    ],
    presences: [
      {
        userId: 'user_sarah',
        lastSeenAt: new Date().toISOString(),
        isOnline: true,
      },
      {
        userId: 'user_alex',
        lastSeenAt: time(3),
        isOnline: true,
      },
      {
        userId: 'user_elena',
        lastSeenAt: time(25),
        isOnline: false,
      },
      {
        userId: 'user_marcus',
        lastSeenAt: time(60),
        isOnline: false,
      }
    ]
  };
}

export function getMessagesDb(): MessagesDatabase {
  ensureDir();
  if (!fs.existsSync(MESSAGES_DB_FILE)) {
    const initial = getInitialMessagesDb();
    fs.writeFileSync(MESSAGES_DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(MESSAGES_DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading messages DB, resetting to initial:', e);
    const initial = getInitialMessagesDb();
    fs.writeFileSync(MESSAGES_DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

export function saveMessagesDb(db: MessagesDatabase): void {
  ensureDir();
  fs.writeFileSync(MESSAGES_DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// User Profile Resolver (matches founders from community-data or generates safe fallback)
export function getUserProfileSummary(userId: string): {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  badges?: string[];
  location?: string;
  collaborationStatus?: string;
  isOnline?: boolean;
  lastSeenAt?: string;
} {
  const db = getMessagesDb();
  const founder = INITIAL_FOUNDERS.find(f => f.id === userId || f.username.toLowerCase() === userId.toLowerCase());
  const presence = db.presences.find(p => p.userId === userId);

  // Check if presence is recent (within 5 minutes)
  const isOnline = presence ? (Date.now() - new Date(presence.lastSeenAt).getTime() < 5 * 60 * 1000 && presence.isOnline) : false;

  if (founder) {
    return {
      id: founder.id,
      name: founder.name,
      username: founder.username,
      email: `${founder.username}@ideacheck.ai`,
      avatar: founder.avatar,
      bio: founder.bio,
      skills: founder.skills,
      badges: founder.badges,
      location: founder.location,
      collaborationStatus: founder.collaborationStatus,
      isOnline,
      lastSeenAt: presence?.lastSeenAt,
    };
  }

  // Fallback for dynamically logged in user
  const cleanId = userId.replace('user_', '');
  const cleanName = cleanId.charAt(0).toUpperCase() + cleanId.slice(1);
  return {
    id: userId,
    name: cleanName,
    username: cleanId.toLowerCase(),
    email: `${cleanId.toLowerCase()}@ideacheck.ai`,
    avatar: `https://avatar.vercel.sh/${userId}?s=96`,
    bio: 'Founder & Community Member on IdeaCheck AI.',
    skills: ['Founder', 'Innovation', 'Startup'],
    badges: ['Builder'],
    location: 'Remote',
    collaborationStatus: 'Open to connecting',
    isOnline,
    lastSeenAt: presence?.lastSeenAt,
  };
}

// Rate Limiter: max 30 messages in 60 seconds
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxLimit = 35;

  let timestamps = rateLimitTracker.get(userId) || [];
  timestamps = timestamps.filter(t => now - t < windowMs);

  if (timestamps.length >= maxLimit) {
    return false;
  }

  timestamps.push(now);
  rateLimitTracker.set(userId, timestamps);
  return true;
}

// Check if blocked
export function isUserBlocked(userA: string, userB: string): boolean {
  const db = getMessagesDb();
  return db.blocks.some(
    b => (b.blockerId === userA && b.blockedId === userB) ||
         (b.blockerId === userB && b.blockedId === userA)
  );
}

export function isDirectlyBlockedBy(blockerId: string, targetId: string): boolean {
  const db = getMessagesDb();
  return db.blocks.some(b => b.blockerId === blockerId && b.blockedId === targetId);
}

// Block user
export function blockUser(blockerId: string, blockedId: string, blockedName?: string): UserBlock {
  const db = getMessagesDb();
  const existing = db.blocks.find(b => b.blockerId === blockerId && b.blockedId === blockedId);
  if (existing) return existing;

  const newBlock: UserBlock = {
    id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    blockerId,
    blockedId,
    blockedName: blockedName || getUserProfileSummary(blockedId).name,
    createdAt: new Date().toISOString(),
  };

  db.blocks.push(newBlock);
  saveMessagesDb(db);
  return newBlock;
}

// Unblock user
export function unblockUser(blockerId: string, blockedId: string): boolean {
  const db = getMessagesDb();
  const initialLen = db.blocks.length;
  db.blocks = db.blocks.filter(b => !(b.blockerId === blockerId && b.blockedId === blockedId));
  if (db.blocks.length !== initialLen) {
    saveMessagesDb(db);
    return true;
  }
  return false;
}

// List user blocks
export function listUserBlocks(userId: string): UserBlock[] {
  const db = getMessagesDb();
  return db.blocks.filter(b => b.blockerId === userId);
}

// Report message or conversation
export function reportMessageOrConversation(reporter: AuthenticatedUser, data: {
  reportedUserId: string;
  conversationId: string;
  messageId?: string;
  reason: 'spam' | 'harassment' | 'scam' | 'inappropriate' | 'other';
  details?: string;
}): MessageReport {
  const db = getMessagesDb();
  const report: MessageReport = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    reporterId: reporter.id,
    reporterEmail: reporter.email,
    reportedUserId: data.reportedUserId,
    conversationId: data.conversationId,
    messageId: data.messageId,
    reason: data.reason,
    details: data.details,
    createdAt: new Date().toISOString(),
  };

  db.reports.push(report);
  saveMessagesDb(db);
  return report;
}

// Presence Heartbeat
export function updatePresence(userId: string, isOnline: boolean = true): void {
  const db = getMessagesDb();
  const existing = db.presences.find(p => p.userId === userId);
  const now = new Date().toISOString();

  if (existing) {
    existing.lastSeenAt = now;
    existing.isOnline = isOnline;
  } else {
    db.presences.push({
      userId,
      lastSeenAt: now,
      isOnline,
    });
  }
  saveMessagesDb(db);
}

// Privacy Settings
export function getUserPrivacySettings(userId: string): UserMessagingPrivacy {
  const db = getMessagesDb();
  const found = db.privacySettings.find(p => p.userId === userId);
  if (found) return found;

  const defaultSetting: UserMessagingPrivacy = {
    userId,
    allowMessagesFrom: 'everyone',
    showReadReceipts: true,
    showOnlineStatus: true,
  };
  db.privacySettings.push(defaultSetting);
  saveMessagesDb(db);
  return defaultSetting;
}

export function updateUserPrivacySettings(userId: string, updates: Partial<UserMessagingPrivacy>): UserMessagingPrivacy {
  const db = getMessagesDb();
  let found = db.privacySettings.find(p => p.userId === userId);
  if (!found) {
    found = {
      userId,
      allowMessagesFrom: updates.allowMessagesFrom || 'everyone',
      showReadReceipts: updates.showReadReceipts !== false,
      showOnlineStatus: updates.showOnlineStatus !== false,
    };
    db.privacySettings.push(found);
  } else {
    Object.assign(found, updates);
  }
  saveMessagesDb(db);
  return found;
}

// Find or Create Direct Conversation between two users
export function findOrCreateConversation(
  userA: AuthenticatedUser,
  userBId: string,
  projectContext?: {
    projectId: string;
    projectTitle: string;
    projectTagline?: string;
    projectStage?: string;
    projectLogoUrl?: string;
  }
): { conversation: Conversation; isNew: boolean } {
  if (userA.id === userBId) {
    throw new Error('You cannot start a direct conversation with yourself.');
  }

  // Check blocks
  if (isDirectlyBlockedBy(userBId, userA.id)) {
    throw new Error('Unable to message this user: You have been blocked.');
  }
  if (isDirectlyBlockedBy(userA.id, userBId)) {
    throw new Error('You have blocked this user. Unblock them first to send a message.');
  }

  const db = getMessagesDb();
  
  // Look for existing direct conversation with exact same pair
  const existing = db.conversations.find(c => {
    if (c.type !== 'direct') return false;
    return c.participantIds.length === 2 &&
           c.participantIds.includes(userA.id) &&
           c.participantIds.includes(userBId);
  });

  const now = new Date().toISOString();

  if (existing) {
    // If conversation exists but has no project context and a new project context was provided, update it
    if (!existing.projectId && projectContext?.projectId) {
      existing.projectId = projectContext.projectId;
      existing.projectTitle = projectContext.projectTitle;
      existing.projectTagline = projectContext.projectTagline;
      existing.projectStage = projectContext.projectStage;
      existing.projectLogoUrl = projectContext.projectLogoUrl;
      existing.updatedAt = now;
      saveMessagesDb(db);
    }
    return { conversation: existing, isNew: false };
  }

  // Create new conversation
  const convId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
  const newConv: Conversation = {
    id: convId,
    type: 'direct',
    participantIds: [userA.id, userBId],
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
    projectId: projectContext?.projectId,
    projectTitle: projectContext?.projectTitle,
    projectTagline: projectContext?.projectTagline,
    projectStage: projectContext?.projectStage,
    projectLogoUrl: projectContext?.projectLogoUrl,
  };

  const participantA: ConversationParticipant = {
    conversationId: convId,
    userId: userA.id,
    joinedAt: now,
    lastReadAt: now,
  };

  const participantB: ConversationParticipant = {
    conversationId: convId,
    userId: userBId,
    joinedAt: now,
    lastReadAt: new Date(Date.now() - 1000).toISOString(),
  };

  db.conversations.push(newConv);
  db.participants.push(participantA, participantB);

  // Check if target user requires a message request
  const recipientPrivacy = getUserPrivacySettings(userBId);
  const existingSharedConvs = db.conversations.filter(c => 
    c.id !== convId && c.participantIds.includes(userA.id) && c.participantIds.includes(userBId)
  );

  // If first time messaging and not already interconnected, create a pending MessageRequest
  if (existingSharedConvs.length === 0) {
    const newReq: MessageRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      conversationId: convId,
      senderId: userA.id,
      senderName: userA.name,
      senderAvatar: userA.avatar,
      recipientId: userBId,
      initialMessage: projectContext ? `Reached out regarding ${projectContext.projectTitle}` : 'Started a conversation',
      status: recipientPrivacy.allowMessagesFrom === 'verified_only' ? 'pending' : 'accepted',
      createdAt: now,
      updatedAt: now,
    };
    db.requests.push(newReq);
  }

  saveMessagesDb(db);
  return { conversation: newConv, isNew: true };
}

// List user conversations with rich participant info & unread count
export function listUserConversations(
  userId: string,
  searchQuery?: string,
  filter?: 'all' | 'unread' | 'requests'
): ConversationWithDetails[] {
  const db = getMessagesDb();
  
  // Find all conversations containing this user
  const userConvs = db.conversations.filter(c => c.participantIds.includes(userId) && !c.isArchived);

  const results: ConversationWithDetails[] = [];

  for (const conv of userConvs) {
    const otherParticipantId = conv.participantIds.find(p => p !== userId) || userId;
    const participantRecord = db.participants.find(p => p.conversationId === conv.id && p.userId === userId);
    const otherParticipantSummary = getUserProfileSummary(otherParticipantId);
    
    const convParticipants = db.participants
      .filter(p => p.conversationId === conv.id)
      .map(p => ({
        ...p,
        user: getUserProfileSummary(p.userId),
      }));

    // Find last message
    const convMessages = db.messages
      .filter(m => m.conversationId === conv.id && !m.deletedAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const lastMessage = convMessages[0];

    // Calculate unread count
    const lastReadAt = participantRecord?.lastReadAt ? new Date(participantRecord.lastReadAt).getTime() : 0;
    const unreadCount = db.messages.filter(m => 
      m.conversationId === conv.id &&
      m.senderId !== userId &&
      !m.deletedAt &&
      new Date(m.createdAt).getTime() > lastReadAt
    ).length;

    // Check message request status
    const req = db.requests.find(r => r.conversationId === conv.id);
    let requestStatus: ConversationWithDetails['requestStatus'] = 'none';
    if (req) {
      if (req.status === 'pending') {
        requestStatus = req.senderId === userId ? 'pending_sent' : 'pending_received';
      } else {
        requestStatus = req.status;
      }
    }

    const item: ConversationWithDetails = {
      conversation: conv,
      otherParticipant: otherParticipantSummary,
      participants: convParticipants,
      unreadCount,
      lastMessage,
      isMuted: Boolean(participantRecord?.mutedAt),
      requestStatus,
      requestId: req?.id,
    };

    // Filter check
    if (filter === 'unread' && unreadCount === 0) continue;
    if (filter === 'requests' && requestStatus !== 'pending_received') continue;

    // Search query check
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const matchesName = otherParticipantSummary.name.toLowerCase().includes(q);
      const matchesUsername = otherParticipantSummary.username.toLowerCase().includes(q);
      const matchesProject = conv.projectTitle?.toLowerCase().includes(q) || false;
      const matchesAnyMsg = db.messages.some(
        m => m.conversationId === conv.id && !m.deletedAt && m.content.toLowerCase().includes(q)
      );

      if (!matchesName && !matchesUsername && !matchesProject && !matchesAnyMsg) {
        continue;
      }
    }

    results.push(item);
  }

  // Sort by latest activity
  results.sort((a, b) => {
    const timeA = new Date(a.conversation.lastMessageAt || a.conversation.updatedAt).getTime();
    const timeB = new Date(b.conversation.lastMessageAt || b.conversation.updatedAt).getTime();
    return timeB - timeA;
  });

  return results;
}

// Get Conversation details + Messages with Pagination
export function getConversationWithMessages(
  conversationId: string,
  userId: string,
  options: { limit?: number; before?: string } = {}
): {
  conversation: Conversation;
  otherParticipant: ReturnType<typeof getUserProfileSummary>;
  participants: ConversationParticipant[];
  messages: Message[];
  hasMore: boolean;
  requestStatus?: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined';
  requestId?: string;
  isMuted: boolean;
} {
  const db = getMessagesDb();
  const conv = db.conversations.find(c => c.id === conversationId);
  if (!conv) {
    throw new Error('Conversation not found');
  }

  if (!conv.participantIds.includes(userId)) {
    throw new Error('Unauthorized: You are not a participant in this conversation.');
  }

  const otherParticipantId = conv.participantIds.find(p => p !== userId) || userId;
  const otherParticipantSummary = getUserProfileSummary(otherParticipantId);
  const myParticipant = db.participants.find(p => p.conversationId === conversationId && p.userId === userId);

  const participants = db.participants
    .filter(p => p.conversationId === conversationId)
    .map(p => ({
      ...p,
      user: getUserProfileSummary(p.userId),
    }));

  // Fetch and paginate messages
  let allMessages = db.messages
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (options.before) {
    const beforeTime = new Date(options.before).getTime();
    allMessages = allMessages.filter(m => new Date(m.createdAt).getTime() < beforeTime);
  }

  const limit = options.limit || 50;
  const totalCount = allMessages.length;
  const paginatedMessages = allMessages.slice(Math.max(0, totalCount - limit));
  const hasMore = totalCount > limit;

  // Check request
  const req = db.requests.find(r => r.conversationId === conversationId);
  let requestStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined' = 'none';
  if (req) {
    if (req.status === 'pending') {
      requestStatus = req.senderId === userId ? 'pending_sent' : 'pending_received';
    } else {
      requestStatus = req.status;
    }
  }

  return {
    conversation: conv,
    otherParticipant: otherParticipantSummary,
    participants,
    messages: paginatedMessages,
    hasMore,
    requestStatus,
    requestId: req?.id,
    isMuted: Boolean(myParticipant?.mutedAt),
  };
}

// Send a Message
export function sendMessage(
  conversationId: string,
  sender: AuthenticatedUser,
  params: {
    content: string;
    messageType?: 'text' | 'project_share' | 'workspace_invite' | 'system';
    replyToId?: string;
    attachments?: MessageAttachment[];
    clientMessageId?: string;
  }
): Message {
  if (!checkRateLimit(sender.id)) {
    throw new Error('Rate limit exceeded. Please wait a few moments before sending more messages.');
  }

  const db = getMessagesDb();
  const conv = db.conversations.find(c => c.id === conversationId);
  if (!conv) throw new Error('Conversation not found');

  if (!conv.participantIds.includes(sender.id)) {
    throw new Error('Unauthorized: You are not a participant in this conversation.');
  }

  const otherParticipantId = conv.participantIds.find(p => p !== sender.id);
  if (otherParticipantId) {
    if (isDirectlyBlockedBy(otherParticipantId, sender.id)) {
      throw new Error('Message failed: You have been blocked by this user.');
    }
    if (isDirectlyBlockedBy(sender.id, otherParticipantId)) {
      throw new Error('Cannot send message: You have blocked this user.');
    }
  }

  // Idempotency: prevent double sending with clientMessageId
  if (params.clientMessageId) {
    const existing = db.messages.find(m => m.conversationId === conversationId && m.clientMessageId === params.clientMessageId);
    if (existing) return existing;
  }

  const now = new Date().toISOString();

  // Find parent reply reference if replying
  let replyReference = null;
  if (params.replyToId) {
    const parent = db.messages.find(m => m.id === params.replyToId);
    if (parent) {
      replyReference = {
        id: parent.id,
        senderId: parent.senderId,
        senderName: parent.senderName,
        content: parent.content.slice(0, 150),
      };
    }
  }

  const newMsg: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
    clientMessageId: params.clientMessageId,
    conversationId,
    senderId: sender.id,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    senderEmail: sender.email,
    content: params.content.trim(),
    messageType: params.messageType || 'text',
    replyTo: replyReference,
    attachments: params.attachments || [],
    status: 'sent',
    createdAt: now,
    updatedAt: now,
  };

  db.messages.push(newMsg);

  // Update conversation last message info
  conv.lastMessageAt = now;
  conv.lastMessageContent = params.content.trim() || (params.attachments?.length ? 'Shared an attachment' : 'Sent a message');
  conv.lastMessageSenderId = sender.id;
  conv.updatedAt = now;

  // Mark sender participant as read
  const senderParticipant = db.participants.find(p => p.conversationId === conversationId && p.userId === sender.id);
  if (senderParticipant) {
    senderParticipant.lastReadAt = now;
  }

  // If there was a pending request and the recipient replied, accept it automatically
  const req = db.requests.find(r => r.conversationId === conversationId && r.status === 'pending');
  if (req && req.recipientId === sender.id) {
    req.status = 'accepted';
    req.updatedAt = now;
  }

  // Update sender presence
  updatePresence(sender.id, true);

  saveMessagesDb(db);
  return newMsg;
}

// Mark Conversation Read
export function markConversationRead(conversationId: string, userId: string): void {
  const db = getMessagesDb();
  const participant = db.participants.find(p => p.conversationId === conversationId && p.userId === userId);
  if (participant) {
    participant.lastReadAt = new Date().toISOString();
    saveMessagesDb(db);
  }
}

// Delete / Unsend Message (Soft delete)
export function deleteMessage(conversationId: string, userId: string, messageId: string): Message {
  const db = getMessagesDb();
  const msg = db.messages.find(m => m.id === messageId && m.conversationId === conversationId);
  if (!msg) throw new Error('Message not found');

  if (msg.senderId !== userId) {
    throw new Error('Unauthorized: You can only delete your own messages.');
  }

  const now = new Date().toISOString();
  msg.deletedAt = now;
  msg.content = 'This message was deleted';
  msg.attachments = [];
  msg.updatedAt = now;

  // If this was the last message, update preview
  const conv = db.conversations.find(c => c.id === conversationId);
  if (conv && conv.lastMessageSenderId === userId) {
    conv.lastMessageContent = 'This message was deleted';
    conv.updatedAt = now;
  }

  saveMessagesDb(db);
  return msg;
}

// Toggle Mute
export function toggleConversationMute(conversationId: string, userId: string): boolean {
  const db = getMessagesDb();
  const participant = db.participants.find(p => p.conversationId === conversationId && p.userId === userId);
  if (!participant) throw new Error('Participant not found');

  const now = new Date().toISOString();
  if (participant.mutedAt) {
    participant.mutedAt = null;
  } else {
    participant.mutedAt = now;
  }

  saveMessagesDb(db);
  return Boolean(participant.mutedAt);
}

// Update Message Request (Accept or Decline)
export function updateMessageRequest(requestId: string, recipientId: string, status: 'accepted' | 'declined'): MessageRequest {
  const db = getMessagesDb();
  const req = db.requests.find(r => r.id === requestId);
  if (!req) throw new Error('Message request not found');

  if (req.recipientId !== recipientId) {
    throw new Error('Unauthorized: Only the recipient can accept or decline this request.');
  }

  req.status = status;
  req.updatedAt = new Date().toISOString();

  // If declined, archive conversation
  if (status === 'declined') {
    const conv = db.conversations.find(c => c.id === req.conversationId);
    if (conv) {
      conv.isArchived = true;
    }
  }

  saveMessagesDb(db);
  return req;
}

// Invite to Workspace directly from Chat
export function inviteToWorkspaceFromChat(
  conversationId: string,
  sender: AuthenticatedUser,
  workspaceId: string,
  role: 'ADMIN' | 'EDITOR' | 'VIEWER' = 'VIEWER'
): Message {
  const db = getMessagesDb();
  const conv = db.conversations.find(c => c.id === conversationId);
  if (!conv) throw new Error('Conversation not found');

  const otherParticipantId = conv.participantIds.find(p => p !== sender.id);
  if (!otherParticipantId) throw new Error('No recipient found in conversation');

  // Verify sender has permission in workspace
  if (!canAdmin(workspaceId, sender.id) && !canEdit(workspaceId, sender.id)) {
    throw new Error('You do not have permission to invite members to this workspace.');
  }

  // Get recipient profile and workspace details
  const recipient = getUserProfileSummary(otherParticipantId);
  const wsDb = getWorkspaceDb();
  const workspace = wsDb.workspaces.find(w => w.id === workspaceId);
  if (!workspace) throw new Error('Workspace not found');

  // Create real workspace invitation
  const invite = createInvitation({
    workspaceId,
    adminId: sender.id,
    email: `${recipient.username}@ideacheck.ai`,
    role,
  });

  // Attach invitation card to message
  const inviteAttachment: MessageAttachment = {
    id: `att_ws_${Date.now()}`,
    type: 'workspace_invite',
    workspaceInviteData: {
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      role,
      invitationToken: invite.token,
      description: workspace.description,
      status: 'pending',
    }
  };

  return sendMessage(conversationId, sender, {
    content: `I've invited you to join our private workspace: "${workspace.name}" as a ${role}.`,
    messageType: 'workspace_invite',
    attachments: [inviteAttachment],
  });
}

// Respond to Workspace Invite inside Chat
export function respondToWorkspaceInviteInChat(
  conversationId: string,
  user: AuthenticatedUser,
  messageId: string,
  accept: boolean
): Message {
  const db = getMessagesDb();
  const msg = db.messages.find(m => m.id === messageId && m.conversationId === conversationId);
  if (!msg) throw new Error('Message not found');

  const inviteAttachment = msg.attachments?.find(a => a.type === 'workspace_invite' && a.workspaceInviteData);
  if (!inviteAttachment || !inviteAttachment.workspaceInviteData) {
    throw new Error('Workspace invitation attachment not found');
  }

  const token = inviteAttachment.workspaceInviteData.invitationToken;
  if (!token) throw new Error('Invitation token missing');

  if (accept) {
    acceptInvitation({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
    inviteAttachment.workspaceInviteData.status = 'accepted';
  } else {
    inviteAttachment.workspaceInviteData.status = 'declined';
  }

  saveMessagesDb(db);

  // Send a system acknowledgment message in chat
  return sendMessage(conversationId, user, {
    content: accept 
      ? `Accepted invitation to join "${inviteAttachment.workspaceInviteData.workspaceName}"!`
      : `Declined invitation to join "${inviteAttachment.workspaceInviteData.workspaceName}".`,
    messageType: 'system',
  });
}
