import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { addAnnouncement, deleteAnnouncement } from '@/lib/workspace-store';

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
    const { title, content, pinned } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 });
    }

    const ann = addAnnouncement({
      workspaceId: id,
      userId: user.id,
      title: title.trim(),
      content: content.trim(),
      pinned: pinned ?? false,
    });

    return NextResponse.json({ announcement: ann }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding announcement:', error);
    const status = error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to add announcement' }, { status });
  }
}

export async function DELETE(
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
    const { announcementId } = body;

    if (!announcementId) {
      return NextResponse.json({ error: 'announcementId is required.' }, { status: 400 });
    }

    deleteAnnouncement(id, user.id, announcementId);
    return NextResponse.json({ success: true, message: 'Announcement deleted.' });
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    const status = error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to delete announcement' }, { status });
  }
}
