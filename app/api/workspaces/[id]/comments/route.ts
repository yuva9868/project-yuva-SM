import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { addComment } from '@/lib/workspace-store';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, fileId, content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content cannot be empty.' }, { status: 400 });
    }

    const comment = addComment({
      workspaceId: id,
      userId: user.id,
      taskId: taskId || null,
      fileId: fileId || null,
      content: content.trim(),
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding comment:', error);
    const status = error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to add comment' }, { status });
  }
}
