import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { createFolder, renameFolder, deleteFolder } from '@/lib/workspace-store';

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
    const { name, parentFolderId } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Folder name is required.' }, { status: 400 });
    }

    const folder = createFolder({
      workspaceId: id,
      userId: user.id,
      name: name.trim(),
      parentFolderId: parentFolderId || null,
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating folder:', error);
    const status = error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to create folder' }, { status });
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
    const { folderId, newName } = body;

    if (!folderId || !newName) {
      return NextResponse.json({ error: 'folderId and newName are required.' }, { status: 400 });
    }

    const folder = renameFolder(id, user.id, folderId, newName);
    return NextResponse.json({ folder });
  } catch (error: any) {
    console.error('Error renaming folder:', error);
    const status = error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to rename folder' }, { status });
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
    const { folderId } = body;

    if (!folderId) {
      return NextResponse.json({ error: 'folderId is required.' }, { status: 400 });
    }

    deleteFolder(id, user.id, folderId);
    return NextResponse.json({ success: true, message: 'Folder deleted.' });
  } catch (error: any) {
    console.error('Error deleting folder:', error);
    const status = error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to delete folder' }, { status });
  }
}
