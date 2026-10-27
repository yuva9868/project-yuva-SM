import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { listUserConversations } from '@/lib/messages-store';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const conversations = listUserConversations(user.id);
    const unreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

    return NextResponse.json({ unreadCount });
  } catch (error: any) {
    return NextResponse.json({ unreadCount: 0 });
  }
}
