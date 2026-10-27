import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { updatePresence, getMessagesDb } from '@/lib/messages-store';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const isOnline = body.isOnline !== false;

    updatePresence(user.id, isOnline);
    return NextResponse.json({ success: true, isOnline });
  } catch (error: any) {
    console.error('Error updating presence:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const db = getMessagesDb();
    const activePresences = db.presences.filter(p => {
      const diff = Date.now() - new Date(p.lastSeenAt).getTime();
      return diff < 5 * 60 * 1000 && p.isOnline;
    });

    return NextResponse.json({ presences: activePresences });
  } catch (error: any) {
    console.error('Error fetching presences:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
