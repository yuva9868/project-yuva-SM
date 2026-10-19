import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { getWorkspaceFull, updateWorkspace, archiveWorkspace, deleteWorkspace } from '@/lib/workspace-store';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const data = getWorkspaceFull(id, user.id);
    if (!data) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this private workspace or it does not exist.' },
        { status: 403 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
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

    // Check if archiving
    if (typeof body.archive === 'boolean') {
      const updated = archiveWorkspace(id, user.id, body.archive);
      return NextResponse.json({ workspace: updated });
    }

    const updated = updateWorkspace(id, user.id, body);
    return NextResponse.json({ workspace: updated });
  } catch (error: any) {
    console.error('Error updating workspace:', error);
    const status = error.message.includes('Unauthorized') || error.message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to update workspace' }, { status });
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
    const confirmedName = body.confirmedName || '';

    deleteWorkspace(id, user.id, confirmedName);
    return NextResponse.json({ success: true, message: 'Workspace deleted permanently.' });
  } catch (error: any) {
    console.error('Error deleting workspace:', error);
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to delete workspace' }, { status });
  }
}
