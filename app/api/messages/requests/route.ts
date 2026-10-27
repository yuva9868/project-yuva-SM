import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { getMessagesDb } from '@/lib/messages-store';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const db = getMessagesDb();
    const pendingRequests = db.requests.filter(r => r.recipientId === user.id && r.status === 'pending');

    return NextResponse.json({ requests: pendingRequests });
  } catch (error: any) {
    console.error('Error fetching message requests:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
