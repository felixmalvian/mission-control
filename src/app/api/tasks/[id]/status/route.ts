import { NextRequest, NextResponse } from 'next/server';
import { queryOne, run } from '@/lib/db';
import type { Task } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/tasks/[id]/status
 * 
 * Manually update task status with validation and logging.
 * This is the "escape hatch" for when tasks get stuck.
 * 
 * Allowed transitions:
 * - testing → review (tests passed, skip auto-test)
 * - testing → assigned (tests failed, retry)
 * - review → done (human approved)
 * - review → assigned (needs rework)
 * - any → done (force complete)
 * - any → inbox (reset)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const { status, reason } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const task = queryOne<Task>('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const validStatuses = ['pending_dispatch', 'planning', 'inbox', 'assigned', 'in_progress', 'testing', 'review', 'verification', 'done'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const oldStatus = task.status;

    // Update task status
    run(
      'UPDATE tasks SET status = ?, updated_at = ?, status_reason = ? WHERE id = ?',
      [status, now, reason || `Manually changed from ${oldStatus} to ${status}`, taskId]
    );

    // Log the status change
    run(
      `INSERT INTO task_activities (id, task_id, activity_type, message, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        taskId,
        'status_changed',
        `Status manually changed: ${oldStatus} → ${status}${reason ? ` (${reason})` : ''}`,
        JSON.stringify({ from: oldStatus, to: status, reason }),
        now
      ]
    );

    return NextResponse.json({
      success: true,
      task_id: taskId,
      old_status: oldStatus,
      new_status: status,
      message: `Task status updated to ${status}`
    });

  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
