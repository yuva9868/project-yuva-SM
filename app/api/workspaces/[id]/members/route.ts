import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { createInvitation, updateMemberRole, removeMember } from '@/lib/workspace-store';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { email, role } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid recipient email address is required.' }, { status: 400 });
    }

    if (!['ADMIN', 'EDITOR', 'VIEWER'].includes(role)) {
      return NextResponse.json({ error: 'Valid role (ADMIN, EDITOR, VIEWER) is required.' }, { status: 400 });
    }

    const invitation = createInvitation({
      workspaceId: id,
      adminId: user.id,
      email: email.trim(),
      role,
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error: any) {
    console.error('Error inviting member:', error);
    const status = error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to invite member' }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { targetUserId, newRole } = body;

    if (!targetUserId || !['ADMIN', 'EDITOR', 'VIEWER'].includes(newRole)) {
      return NextResponse.json({ error: 'targetUserId and valid newRole are required.' }, { status: 400 });
    }

    const updatedMember = updateMemberRole(id, user.id, targetUserId, newRole);
    return NextResponse.json({ member: updatedMember });
  } catch (error: any) {
    console.error('Error updating member role:', error);
    const status = error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to update member role' }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId is required.' }, { status: 400 });
    }

    removeMember(id, user.id, targetUserId);
    return NextResponse.json({ success: true, message: 'Member removed from workspace.' });
  } catch (error: any) {
    console.error('Error removing member:', error);
    const status = error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to remove member' }, { status });
  }
}
