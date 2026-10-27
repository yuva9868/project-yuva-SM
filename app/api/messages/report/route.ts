import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { reportMessageOrConversation } from '@/lib/messages-store';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { reportedUserId, conversationId, messageId, reason, details } = body;

    if (!reportedUserId || !conversationId || !reason) {
      return NextResponse.json({ error: 'reportedUserId, conversationId, and reason are required' }, { status: 400 });
    }

    const report = reportMessageOrConversation(user, {
      reportedUserId,
      conversationId,
      messageId,
      reason,
      details,
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting report:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit report' }, { status: 400 });
  }
}
