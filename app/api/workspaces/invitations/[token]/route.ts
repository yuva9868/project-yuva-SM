import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { getInvitationByToken, acceptInvitation, declineInvitation } from '@/lib/workspace-store';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const result = getInvitationByToken(token);
    if (!result) {
      return NextResponse.json({ error: 'Invitation not found or invalid token.' }, { status: 404 });
    }

    const { invitation, workspace } = result;

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        invited_by_name: invitation.invited_by_name,
        expires_at: invitation.expires_at,
        status: invitation.status,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        logo_path: workspace.logo_path,
      },
    });
  } catch (error: any) {
    console.error('Error looking up invitation:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: You must sign in to accept or decline an invitation.' }, { status: 401 });
    }

    const body = await req.json();
    const action = body.action || 'accept';

    if (action === 'decline') {
      declineInvitation(token, user.email);
      return NextResponse.json({ success: true, message: 'Invitation declined.' });
    }

    const result = acceptInvitation({
      token,
      user,
    });

    return NextResponse.json({ success: true, workspace: result.workspace });
  } catch (error: any) {
    console.error('Error processing invitation:', error);
    return NextResponse.json({ error: error.message || 'Failed to process invitation' }, { status: 400 });
  }
}
