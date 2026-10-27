import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { updateMessageRequest } from '@/lib/messages-store';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (status !== 'accepted' && status !== 'declined') {
      return NextResponse.json({ error: 'Status must be accepted or declined' }, { status: 400 });
    }

    const updated = updateMessageRequest(id, user.id, status);
    return NextResponse.json({ request: updated });
  } catch (error: any) {
    console.error('Error updating message request:', error);
    const statusCode = error.message?.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to update request' }, { status: statusCode });
  }
}
