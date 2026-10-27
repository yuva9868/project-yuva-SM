import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { respondToWorkspaceInviteInChat } from '@/lib/messages-store';

export async function POST(
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
    const { messageId, accept } = body;

    if (!messageId || typeof accept !== 'boolean') {
      return NextResponse.json({ error: 'messageId and accept (boolean) are required' }, { status: 400 });
    }

    const systemMessage = respondToWorkspaceInviteInChat(id, user, messageId, accept);
    return NextResponse.json({ success: true, message: systemMessage });
  } catch (error: any) {
    console.error('Error responding to workspace invite in chat:', error);
    return NextResponse.json({ error: error.message || 'Failed to respond to invitation' }, { status: 400 });
  }
}
