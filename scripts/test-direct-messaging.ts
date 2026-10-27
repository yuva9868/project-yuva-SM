import {
  findOrCreateConversation,
  listUserConversations,
  getConversationWithMessages,
  sendMessage,
  markConversationRead,
  deleteMessage,
  toggleConversationMute,
  blockUser,
  unblockUser,
  reportMessageOrConversation,
  updateMessageRequest,
  updatePresence,
  getMessagesDb,
  inviteToWorkspaceFromChat,
  respondToWorkspaceInviteInChat,
} from '../lib/messages-store';
import { AuthenticatedUser } from '../lib/workspace-server-auth';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ ${message}`);
  }
}

async function runTests() {
  console.log('--- Starting IdeaCheck AI Direct Messaging Test Suite ---\n');

  const userSarah: AuthenticatedUser = {
    id: 'user_sarah',
    email: 'sarah@ideacheck.ai',
    name: 'Sarah Chen',
    role: 'user',
  };

  const userAlex: AuthenticatedUser = {
    id: 'user_alex',
    email: 'alex@ideacheck.ai',
    name: 'Alex Vance',
    role: 'user',
  };

  const userElena: AuthenticatedUser = {
    id: 'user_elena',
    email: 'elena@ideacheck.ai',
    name: 'Elena Rostova',
    role: 'user',
  };

  const testId = 'user_test_' + Date.now();
  const userTest: AuthenticatedUser = {
    id: testId,
    email: `${testId.replace('user_', '')}@ideacheck.ai`,
    name: 'Test Founder',
    role: 'user',
  };

  // TEST 1: Start conversation between Sarah and Test Founder
  console.log('Test 1: Start conversation from public profile');
  const conv1 = findOrCreateConversation(userSarah, userTest.id);
  assert(Boolean(conv1.conversation.id), 'Conversation was created with valid ID');
  assert(conv1.isNew === true, 'Is marked as a new conversation');

  // TEST 2: Existing conversation is reused (No duplicates)
  console.log('\nTest 2: Reusing existing conversation');
  const conv1Reuse = findOrCreateConversation(userSarah, userTest.id);
  assert(conv1Reuse.conversation.id === conv1.conversation.id, 'Same conversation ID is returned');
  assert(conv1Reuse.isNew === false, 'Conversation is not recreated');

  // TEST 3: Start conversation with Project Context
  console.log('\nTest 3: Project-aware conversation initiation');
  const projectContext = {
    projectId: 'proj_ai_validation_copilot',
    projectTitle: 'AI Startup Validation Copilot',
    projectTagline: 'LLM agents for customer discovery',
    projectStage: 'Beta',
  };
  const convProj = findOrCreateConversation(userSarah, userElena.id, projectContext);
  assert(convProj.conversation.projectTitle === 'AI Startup Validation Copilot', 'Project context title is stored');
  assert(convProj.conversation.projectId === 'proj_ai_validation_copilot', 'Project ID is linked to conversation');

  // TEST 4: Send and Receive Messages between two users
  console.log('\nTest 4: Exchanging messages between authenticated users');
  const msg1 = sendMessage(conv1.conversation.id, userSarah, {
    content: 'Hello! Welcome to IdeaCheck AI. Let us build together.',
    clientMessageId: 'test_client_id_1',
  });
  assert(msg1.content === 'Hello! Welcome to IdeaCheck AI. Let us build together.', 'Message content matches');
  assert(msg1.senderId === userSarah.id, 'Sender is Sarah');

  // Idempotency: verify sending with same clientMessageId returns existing without duplicating
  const msg1Duplicate = sendMessage(conv1.conversation.id, userSarah, {
    content: 'Hello! Welcome to IdeaCheck AI. Let us build together.',
    clientMessageId: 'test_client_id_1',
  });
  assert(msg1Duplicate.id === msg1.id, 'Idempotency prevents duplicate message on retry');

  // Reply from Test Founder
  const msg2 = sendMessage(conv1.conversation.id, userTest, {
    content: 'Thanks Sarah! Loving the platform.',
    replyToId: msg1.id,
  });
  assert(msg2.replyTo?.id === msg1.id, 'Reply references parent message ID');
  assert(msg2.replyTo?.senderName === 'Sarah Chen', 'Reply references parent author name');

  // TEST 5: Unread count and mark as read
  console.log('\nTest 5: Unread count calculation and read receipts');
  const listSarah = listUserConversations(userSarah.id);
  const convSarahItem = listSarah.find(c => c.conversation.id === conv1.conversation.id);
  assert(convSarahItem?.unreadCount === 1, 'Sarah has 1 unread message from Test Founder');

  markConversationRead(conv1.conversation.id, userSarah.id);
  const listSarahAfterRead = listUserConversations(userSarah.id);
  const convSarahItemAfter = listSarahAfterRead.find(c => c.conversation.id === conv1.conversation.id);
  assert(convSarahItemAfter?.unreadCount === 0, 'Unread count becomes 0 after marking conversation read');

  // TEST 6: Message search and filter
  console.log('\nTest 6: Conversation search');
  const searchResults = listUserConversations(userSarah.id, 'Welcome');
  assert(searchResults.some(c => c.conversation.id === conv1.conversation.id), 'Search finds conversation by message content');

  // TEST 7: Soft delete / unsend message
  console.log('\nTest 7: Unsend / delete own message');
  const deletedMsg = deleteMessage(conv1.conversation.id, userSarah.id, msg1.id);
  assert(deletedMsg.content === 'This message was deleted', 'Content shows deleted message notice');
  assert(Boolean(deletedMsg.deletedAt), 'deletedAt timestamp is set');

  // Verify unauthorized user cannot delete someone else's message
  let unauthorizedDeleteFailed = false;
  try {
    deleteMessage(conv1.conversation.id, userElena.id, msg2.id);
  } catch {
    unauthorizedDeleteFailed = true;
  }
  assert(unauthorizedDeleteFailed, 'Unauthorized user is prevented from deleting another user message');

  // TEST 8: Workspace invitation inside chat
  console.log('\nTest 8: Workspace invitation card in conversation');
  const wsInviteMsg = inviteToWorkspaceFromChat(conv1.conversation.id, userSarah, 'ws_ideacheck_core', 'EDITOR');
  assert(wsInviteMsg.messageType === 'workspace_invite', 'Message type is workspace_invite');
  const inviteAtt = wsInviteMsg.attachments?.[0];
  assert(inviteAtt?.type === 'workspace_invite', 'Attachment contains workspace invite card');
  assert(inviteAtt?.workspaceInviteData?.workspaceName === 'IdeaCheck Core Founders', 'Workspace name attached correctly');

  // Respond to invitation
  respondToWorkspaceInviteInChat(conv1.conversation.id, userTest, wsInviteMsg.id, true);
  const convWithInvite = getConversationWithMessages(conv1.conversation.id, userSarah.id);
  const updatedInviteMsg = convWithInvite.messages.find(m => m.id === wsInviteMsg.id);
  assert(updatedInviteMsg?.attachments?.[0].workspaceInviteData?.status === 'accepted', 'Workspace invite status updated to accepted');

  // TEST 9: Security & Blocking
  console.log('\nTest 9: Block and anti-abuse restrictions');
  blockUser(userSarah.id, userTest.id);
  
  let blockedSendFailed = false;
  try {
    sendMessage(conv1.conversation.id, userTest, { content: 'Should fail because blocked' });
  } catch (err: any) {
    blockedSendFailed = err.message.includes('blocked');
  }
  assert(blockedSendFailed, 'Blocked user is rejected when trying to send message');

  // Unblock
  unblockUser(userSarah.id, userTest.id);
  const msgAfterUnblock = sendMessage(conv1.conversation.id, userTest, { content: 'Able to message again after unblock' });
  assert(msgAfterUnblock.content === 'Able to message again after unblock', 'Message succeeds after unblocking');

  // TEST 10: Unauthorized conversation access
  console.log('\nTest 10: Conversation membership authorization');
  let unauthorizedReadFailed = false;
  try {
    getConversationWithMessages(conv1.conversation.id, userElena.id);
  } catch (err: any) {
    unauthorizedReadFailed = err.message.includes('Unauthorized');
  }
  assert(unauthorizedReadFailed, 'Non-participant cannot read private conversation');

  console.log('\n🎉 ALL DIRECT MESSAGING TESTS PASSED SUCCESSFULLY! 🎉\n');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
