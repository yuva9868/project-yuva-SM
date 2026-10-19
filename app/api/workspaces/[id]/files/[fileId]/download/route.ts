import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { getDb, canDownloadFile, canView } from '@/lib/workspace-store';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { id, fileId } = await context.params;
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required to download confidential files.' }, { status: 401 });
    }

    if (!canView(id, user.id)) {
      return NextResponse.json({ error: 'Forbidden: You are not a member of this workspace.' }, { status: 403 });
    }

    if (!canDownloadFile(id, user.id)) {
      return NextResponse.json(
        { error: 'Forbidden: File download policy restricts Viewers from downloading files in this private workspace.' },
        { status: 403 }
      );
    }

    const db = getDb();
    const file = db.files.find(f => f.id === fileId && f.workspace_id === id);
    if (!file) {
      return NextResponse.json({ error: 'File not found.' }, { status: 404 });
    }

    // Prepare file content
    let fileBuffer: Buffer;
    if (file.file_data_url && file.file_data_url.startsWith('data:')) {
      const base64Data = file.file_data_url.split(',')[1];
      fileBuffer = Buffer.from(base64Data, 'base64');
    } else {
      // Generate synthetic valid file payload for prototype / demo files
      const demoText = `Confidential Document: ${file.original_filename}\nWorkspace: ${id}\nAuthor: ${file.uploaded_by_name}\nClassification: Confidential & Proprietary\n\n${file.description || 'Verified private asset.'}`;
      fileBuffer = Buffer.from(demoText, 'utf-8');
    }

    // Return file with secure binary headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': file.content_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.original_filename)}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error downloading file:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
