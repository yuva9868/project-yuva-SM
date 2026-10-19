import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { listUserWorkspaces, createWorkspace } from '@/lib/workspace-store';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const workspaces = listUserWorkspaces(user.id);
    return NextResponse.json({ workspaces });
  } catch (error: any) {
    console.error('Error listing workspaces:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, logo_path, cover_image, linked_project_id, linked_project_title } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Workspace name must be at least 2 characters.' }, { status: 400 });
    }

    const workspace = createWorkspace({
      name: name.trim(),
      description: (description || '').trim(),
      logo_path,
      cover_image,
      linked_project_id,
      linked_project_title,
      owner: user,
    });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
