import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { blockUser, unblockUser, listUserBlocks } from '@/lib/messages-store';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const blocks = listUserBlocks(user.id);
    return NextResponse.json({ blocks });
  } catch (error: any) {
    console.error('Error fetching blocks:', error);
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
    const { targetUserId, targetUserName } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
    }

    const block = blockUser(user.id, targetUserId, targetUserName);
    return NextResponse.json({ block }, { status: 201 });
  } catch (error: any) {
    console.error('Error blocking user:', error);
    return NextResponse.json({ error: error.message || 'Failed to block user' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('targetUserId');

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId query param is required' }, { status: 400 });
    }

    const unblocked = unblockUser(user.id, targetUserId);
    return NextResponse.json({ success: unblocked });
  } catch (error: any) {
    console.error('Error unblocking user:', error);
    return NextResponse.json({ error: error.message || 'Failed to unblock user' }, { status: 400 });
  }
}
