import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { getConversationWithMessages, sendMessage } from '@/lib/messages-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const before = searchParams.get('before') || undefined;

    const data = getConversationWithMessages(id, user.id, { limit, before });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    const status = error.message?.includes('Unauthorized') ? 403 : 404;
    return NextResponse.json({ error: error.message || 'Failed to fetch conversation' }, { status });
  }
}

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
    const { content, messageType, replyToId, attachments, clientMessageId } = body;

    if ((!content || typeof content !== 'string' || content.trim().length === 0) && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: 'Message content or attachment is required' }, { status: 400 });
    }

    const message = sendMessage(id, user, {
      content: content || '',
      messageType,
      replyToId,
      attachments,
      clientMessageId,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    console.error('Error sending message:', error);
    const status = error.message?.includes('blocked') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to send message' }, { status });
  }
}
