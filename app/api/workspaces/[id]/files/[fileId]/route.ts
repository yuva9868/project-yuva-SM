import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { renameFile, moveFile, deleteFile } from '@/lib/workspace-store';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { id, fileId } = await context.params;
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await req.json();

    // Check if moving file
    if (body.targetFolderId !== undefined) {
      const moved = moveFile(id, user.id, fileId, body.targetFolderId);
      return NextResponse.json({ file: moved });
    }

    // Rename file
    if (body.newFilename !== undefined) {
      const renamed = renameFile(id, user.id, fileId, body.newFilename, body.description);
      return NextResponse.json({ file: renamed });
    }

    return NextResponse.json({ error: 'No valid action provided' }, { status: 400 });
  } catch (error: any) {
    console.error('Error modifying file:', error);
    const status = error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to modify file' }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { id, fileId } = await context.params;
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    deleteFile(id, user.id, fileId);
    return NextResponse.json({ success: true, message: 'File deleted.' });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    const status = error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to delete file' }, { status });
  }
}
