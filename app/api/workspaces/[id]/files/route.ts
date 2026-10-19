import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { uploadFile } from '@/lib/workspace-store';

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
    const { originalFilename, contentType, fileSize, description, folderId, fileDataUrl } = body;

    if (!originalFilename || !contentType || typeof fileSize !== 'number') {
      return NextResponse.json({ error: 'originalFilename, contentType, and fileSize are required.' }, { status: 400 });
    }

    const file = uploadFile({
      workspaceId: id,
      userId: user.id,
      originalFilename,
      contentType,
      fileSize,
      description,
      folderId,
      fileDataUrl,
    });

    return NextResponse.json({ file }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    const status = error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to upload file' }, { status });
  }
}
