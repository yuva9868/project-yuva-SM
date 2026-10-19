import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { revokeInvitation } from '@/lib/workspace-store';

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
    const { invitationId } = body;

    if (!invitationId) {
      return NextResponse.json({ error: 'invitationId is required.' }, { status: 400 });
    }

    revokeInvitation(id, user.id, invitationId);
    return NextResponse.json({ success: true, message: 'Invitation revoked.' });
  } catch (error: any) {
    console.error('Error revoking invitation:', error);
    const status = error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to revoke invitation' }, { status });
  }
}
