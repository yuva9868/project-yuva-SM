import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { deleteMessage } from '@/lib/messages-store';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { id, messageId } = await params;
    const deleted = deleteMessage(id, user.id, messageId);

    return NextResponse.json({ message: deleted });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    const status = error.message?.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to delete message' }, { status });
  }
}
