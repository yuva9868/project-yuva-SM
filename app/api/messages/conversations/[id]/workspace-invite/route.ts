import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { inviteToWorkspaceFromChat } from '@/lib/messages-store';

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
    const { workspaceId, role } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    const message = inviteToWorkspaceFromChat(id, user, workspaceId, role || 'VIEWER');
    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating workspace invite in chat:', error);
    return NextResponse.json({ error: error.message || 'Failed to create workspace invitation' }, { status: 400 });
  }
}
