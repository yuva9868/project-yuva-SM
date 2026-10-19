import assert from 'assert';
import {
  createWorkspace,
  getWorkspaceFull,
  listUserWorkspaces,
  updateWorkspace,
  createInvitation,
  getInvitationByToken,
  acceptInvitation,
  revokeInvitation,
  updateMemberRole,
  removeMember,
  transferOwnership,
  createFolder,
  uploadFile,
  renameFile,
  moveFile,
  deleteFile,
  canDownloadFile,
  createTask,
  updateTask,
  deleteTask,
  addAnnouncement,
  addComment,
  archiveWorkspace,
  deleteWorkspace,
  getDb,
  canAdmin,
  canEdit,
  canView,
  isLastAdmin
} from '../lib/workspace-store';

console.log('================================================================');
console.log('STARTING PRIVATE TEAM WORKSPACES VERIFICATION SUITE');
console.log('================================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}\n`);
    testsFailed++;
  }
}

// 1. Workspace Creation & Creator Role
runTest('1. Workspace creation assigns creator as Admin and Owner', () => {
  const ws = createWorkspace({
    name: 'Apollo Stealth Lab',
    description: 'Secret aerospace algorithm repository',
    owner: {
      id: 'user_founder_1',
      name: 'Founder One',
      email: 'founder1@apollo.space',
    },
  });

  assert.ok(ws.id.startsWith('ws_'));
  assert.strictEqual(ws.owner_id, 'user_founder_1');
  assert.strictEqual(ws.visibility, 'private');

  const full = getWorkspaceFull(ws.id, 'user_founder_1');
  assert.ok(full !== null);
  assert.strictEqual(full.userRole, 'ADMIN');
  assert.strictEqual(full.members.length, 1);
  assert.strictEqual(full.members[0].role, 'ADMIN');
});

// 2. Multi-workspace isolation & privacy (Anti-IDOR)
runTest('2. Private isolation between Account A and Account B (Anti-IDOR)', () => {
  const wsA = createWorkspace({
    name: 'Confidential Alpha Corp',
    description: 'Alpha secrets',
    owner: { id: 'user_alpha', name: 'Alpha Lead', email: 'lead@alpha.com' },
  });

  const wsB = createWorkspace({
    name: 'Confidential Beta Corp',
    description: 'Beta secrets',
    owner: { id: 'user_beta', name: 'Beta Lead', email: 'lead@beta.com' },
  });

  // User Beta should NOT be able to access Workspace A
  const betaAccessToAlpha = getWorkspaceFull(wsA.id, 'user_beta');
  assert.strictEqual(betaAccessToAlpha, null, 'User Beta must be denied access to Workspace A');

  // User Alpha should NOT be able to access Workspace B
  const alphaAccessToBeta = getWorkspaceFull(wsB.id, 'user_alpha');
  assert.strictEqual(alphaAccessToBeta, null, 'User Alpha must be denied access to Workspace B');
});

// 3. Secure Invitations with Token Hashing & Expiration
runTest('3. Invitation flow, token generation, single-use and email matching', () => {
  const ws = createWorkspace({
    name: 'Fintech Series A',
    description: 'Banking partners only',
    owner: { id: 'user_fintech_lead', name: 'Fintech Lead', email: 'lead@fintech.io' },
  });

  // Admin creates invitation for partner
  const inv = createInvitation({
    workspaceId: ws.id,
    adminId: 'user_fintech_lead',
    email: 'advisor@venture.com',
    role: 'EDITOR',
  });

  assert.ok(inv.token, 'Must return plain token for link generation');
  assert.ok(inv.token_hash, 'Must store token hash');
  assert.notStrictEqual(inv.token, inv.token_hash, 'Token and hash must not be identical');

  // Non-member trying to accept with wrong email should fail
  let mismatchError = false;
  try {
    acceptInvitation({
      token: inv.token!,
      user: { id: 'user_intruder', email: 'intruder@evil.com', name: 'Intruder' },
    });
  } catch (err: any) {
    mismatchError = true;
    assert.ok(err.message.includes('Email mismatch'), 'Must reject email mismatch');
  }
  assert.ok(mismatchError, 'Must fail on email mismatch');

  // Accept with valid matching email
  const accepted = acceptInvitation({
    token: inv.token!,
    user: { id: 'user_advisor', email: 'advisor@venture.com', name: 'Dr. Advisor' },
  });
  assert.strictEqual(accepted.member.role, 'EDITOR');
  assert.strictEqual(accepted.member.user_id, 'user_advisor');

  // Single-use check: Second accept must fail
  let secondAcceptError = false;
  try {
    acceptInvitation({
      token: inv.token!,
      user: { id: 'user_advisor', email: 'advisor@venture.com', name: 'Dr. Advisor' },
    });
  } catch (err: any) {
    secondAcceptError = true;
    assert.ok(err.message.includes('already been accepted'));
  }
  assert.ok(secondAcceptError, 'Token must not be reusable');
});

// 4. Duplicate Membership Prevention
runTest('4. Duplicate membership prevention', () => {
  const ws = createWorkspace({
    name: 'Security Vault',
    description: 'Testing duplicate membership',
    owner: { id: 'user_owner', name: 'Owner', email: 'owner@vault.io' },
  });

  let duplicateInvError = false;
  try {
    createInvitation({
      workspaceId: ws.id,
      adminId: 'user_owner',
      email: 'owner@vault.io', // already owner
      role: 'EDITOR',
    });
  } catch (err: any) {
    duplicateInvError = true;
    assert.ok(err.message.includes('already a member'));
  }
  assert.ok(duplicateInvError, 'Cannot invite an existing member');
});

// 5. Role-based permissions & Last Admin guard
runTest('5. Last administrator protection and RBAC demotion restrictions', () => {
  const ws = createWorkspace({
    name: 'Guardian Workspace',
    description: 'Safeguard tests',
    owner: { id: 'user_solo_admin', name: 'Solo Admin', email: 'solo@guardian.io' },
  });

  // Attempting to remove the sole admin must fail
  let removeError = false;
  try {
    removeMember(ws.id, 'user_solo_admin', 'user_solo_admin');
  } catch (err: any) {
    removeError = true;
    assert.ok(err.message.includes('Cannot remove the last Administrator'));
  }
  assert.ok(removeError, 'Must prevent removing last administrator');

  // Attempting to demote sole admin to VIEWER must fail
  let demoteError = false;
  try {
    updateMemberRole(ws.id, 'user_solo_admin', 'user_solo_admin', 'VIEWER');
  } catch (err: any) {
    demoteError = true;
    assert.ok(err.message.includes('Cannot demote the only remaining Administrator'));
  }
  assert.ok(demoteError, 'Must prevent demoting last administrator');
});

// 6. Confidential File Upload and Validation
runTest('6. Confidential file upload and server MIME/size validation', () => {
  const ws = createWorkspace({
    name: 'Doc Repository',
    description: 'File upload tests',
    owner: { id: 'user_lead', name: 'Lead', email: 'lead@doc.io' },
  });

  // Valid PDF upload
  const file = uploadFile({
    workspaceId: ws.id,
    userId: 'user_lead',
    originalFilename: 'Seed_Deck_v3.pdf',
    contentType: 'application/pdf',
    fileSize: 1024 * 500, // 500 KB
    description: 'Initial seed pitch deck for angels',
  });

  assert.ok(file.id.startsWith('file_'));
  assert.ok(file.storage_key.includes('workspaces/'));
  assert.strictEqual(file.original_filename, 'Seed_Deck_v3.pdf');

  // Unsupported file type rejection (e.g. executable .exe)
  let invalidMimeError = false;
  try {
    uploadFile({
      workspaceId: ws.id,
      userId: 'user_lead',
      originalFilename: 'malware.exe',
      contentType: 'application/x-msdownload',
      fileSize: 1024,
    });
  } catch (err: any) {
    invalidMimeError = true;
    assert.ok(err.message.includes('Unsupported file type'));
  }
  assert.ok(invalidMimeError, 'Must reject untrusted/executable MIME types');
});

// 7. Download permission policy enforcement
runTest('7. Viewer download restriction vs allowance policy', () => {
  const ws = createWorkspace({
    name: 'Auditing Firm',
    description: 'Download policy test',
    owner: { id: 'user_senior_admin', name: 'Senior Partner', email: 'senior@audit.com' },
  });

  // Invite viewer
  const inv = createInvitation({
    workspaceId: ws.id,
    adminId: 'user_senior_admin',
    email: 'intern@audit.com',
    role: 'VIEWER',
  });

  acceptInvitation({
    token: inv.token!,
    user: { id: 'user_intern', email: 'intern@audit.com', name: 'Intern' },
  });

  // Upload file
  uploadFile({
    workspaceId: ws.id,
    userId: 'user_senior_admin',
    originalFilename: 'Audit_Finding.xlsx',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileSize: 1024 * 200,
  });

  // By default, allowViewerDownload is false
  const canInternDownloadDefault = canDownloadFile(ws.id, 'user_intern');
  assert.strictEqual(canInternDownloadDefault, false, 'Viewer should NOT be allowed to download by default');

  // Admin enables viewer download
  updateWorkspace(ws.id, 'user_senior_admin', {
    settings: {
      ...ws.settings,
      allowViewerDownload: true,
    },
  });

  const canInternDownloadNow = canDownloadFile(ws.id, 'user_intern');
  assert.strictEqual(canInternDownloadNow, true, 'Viewer should now be allowed to download');
});

// 8. Task board sprint tracking and comments
runTest('8. Task board creation, sprint status shifts, and threaded comments', () => {
  const ws = createWorkspace({
    name: 'Sprint Team',
    description: 'Sprint velocity tests',
    owner: { id: 'user_pm', name: 'Product Manager', email: 'pm@sprint.io' },
  });

  const task = createTask({
    workspaceId: ws.id,
    userId: 'user_pm',
    title: 'Design high-converting pricing table',
    description: 'Implement annual vs monthly toggle and credit card checkout',
    priority: 'high',
    status: 'todo',
  });

  assert.strictEqual(task.status, 'todo');
  assert.strictEqual(task.priority, 'high');

  // Shift status to in_progress
  const updatedTask = updateTask(ws.id, 'user_pm', task.id, { status: 'in_progress' });
  assert.strictEqual(updatedTask.status, 'in_progress');

  // Add comment on task
  const comment = addComment({
    workspaceId: ws.id,
    userId: 'user_pm',
    taskId: task.id,
    content: 'Figma mockups have been approved by design lead.',
  });
  assert.strictEqual(comment.task_id, task.id);
  assert.ok(comment.content.includes('Figma mockups'));
});

// 9. Ownership transfer
runTest('9. Authenticated and confirmed workspace ownership transfer', () => {
  const ws = createWorkspace({
    name: 'Venture Studio',
    description: 'Transfer tests',
    owner: { id: 'user_founder_orig', name: 'Original Founder', email: 'orig@studio.io' },
  });

  const inv = createInvitation({
    workspaceId: ws.id,
    adminId: 'user_founder_orig',
    email: 'successor@studio.io',
    role: 'ADMIN',
  });

  acceptInvitation({
    token: inv.token!,
    user: { id: 'user_successor', email: 'successor@studio.io', name: 'Successor' },
  });

  // Transfer ownership
  const transferred = transferOwnership(ws.id, 'user_founder_orig', 'user_successor');
  assert.strictEqual(transferred.owner_id, 'user_successor');

  // Successor can now manage workspace
  assert.strictEqual(canAdmin(ws.id, 'user_successor'), true);
});

// 10. Archive and confirmed permanent deletion
runTest('10. Archive toggle and permanent deletion with cascade cleanup', () => {
  const ws = createWorkspace({
    name: 'Temporary Sandbox Lab',
    description: 'Deletion tests',
    owner: { id: 'user_sandbox_owner', name: 'Sandbox Owner', email: 'sandbox@lab.io' },
  });

  // Archive
  const archived = archiveWorkspace(ws.id, 'user_sandbox_owner', true);
  assert.ok(archived.archived_at !== null, 'Workspace should be archived');

  // Unarchive
  const unarchived = archiveWorkspace(ws.id, 'user_sandbox_owner', false);
  assert.strictEqual(unarchived.archived_at, null, 'Workspace should be unarchived');

  // Deletion with wrong name should fail
  let nameMismatchError = false;
  try {
    deleteWorkspace(ws.id, 'user_sandbox_owner', 'Wrong Name');
  } catch (err: any) {
    nameMismatchError = true;
    assert.ok(err.message.includes('Confirmation mismatch'));
  }
  assert.ok(nameMismatchError, 'Must fail when name confirmation is incorrect');

  // Deletion with exact matching name
  const deleted = deleteWorkspace(ws.id, 'user_sandbox_owner', 'Temporary Sandbox Lab');
  assert.strictEqual(deleted, true);

  // Post-deletion verification: Workspace should no longer exist
  const postCheck = getWorkspaceFull(ws.id, 'user_sandbox_owner');
  assert.strictEqual(postCheck, null, 'Workspace must be completely removed');
});

console.log('\n================================================================');
console.log(`TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log('================================================================\n');

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
