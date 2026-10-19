import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/workspace-server-auth';
import { createTask, updateTask, deleteTask } from '@/lib/workspace-store';

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
    const { title, description, status, priority, assignedTo, dueDate } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Task title is required.' }, { status: 400 });
    }

    const task = createTask({
      workspaceId: id,
      userId: user.id,
      title: title.trim(),
      description: (description || '').trim(),
      status,
      priority,
      assignedTo,
      dueDate,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    const status = error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to create task' }, { status });
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
    const { taskId, updates } = body;

    if (!taskId || !updates) {
      return NextResponse.json({ error: 'taskId and updates are required.' }, { status: 400 });
    }

    const task = updateTask(id, user.id, taskId, updates);
    return NextResponse.json({ task });
  } catch (error: any) {
    console.error('Error updating task:', error);
    const status = error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to update task' }, { status });
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
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required.' }, { status: 400 });
    }

    deleteTask(id, user.id, taskId);
    return NextResponse.json({ success: true, message: 'Task deleted.' });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    const status = error.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: error.message || 'Failed to delete task' }, { status });
  }
}
