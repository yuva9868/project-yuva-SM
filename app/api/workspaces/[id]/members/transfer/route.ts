import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { transferOwnership } from '@/lib/workspace-store';

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
    const { newOwnerId } = body;

    if (!newOwnerId) {
      return NextResponse.json({ error: 'newOwnerId is required.' }, { status: 400 });
    }

    const updated = transferOwnership(id, user.id, newOwnerId);
    return NextResponse.json({ success: true, workspace: updated });
  } catch (error: any) {
    console.error('Error transferring ownership:', error);
    const status = error.message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to transfer ownership' }, { status });
  }
}
