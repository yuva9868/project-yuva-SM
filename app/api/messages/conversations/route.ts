import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { listUserConversations, findOrCreateConversation } from '@/lib/messages-store';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || undefined;
    const filter = (searchParams.get('filter') as 'all' | 'unread' | 'requests') || 'all';

    const conversations = listUserConversations(user.id, search, filter);
    const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

    return NextResponse.json({ conversations, totalUnread });
  } catch (error: any) {
    console.error('Error listing conversations:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { targetUserId, projectContext } = body;

    if (!targetUserId || typeof targetUserId !== 'string') {
      return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
    }

    const result = findOrCreateConversation(user, targetUserId, projectContext);
    return NextResponse.json(result, { status: result.isNew ? 201 : 200 });
  } catch (error: any) {
    console.error('Error finding/creating conversation:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 400 });
  }
}
