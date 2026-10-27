import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { getUserPrivacySettings, updateUserPrivacySettings } from '@/lib/messages-store';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const settings = getUserPrivacySettings(user.id);
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const updated = updateUserPrivacySettings(user.id, body);
    return NextResponse.json({ settings: updated });
  } catch (error: any) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
