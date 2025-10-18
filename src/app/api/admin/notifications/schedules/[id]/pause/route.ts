import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationScheduler } from '@/lib/notificationScheduler';
import { connectDB } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const schedule = await NotificationScheduler.pauseSchedule(id);
    
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Pause notification schedule error:', error);
    if (error instanceof Error && error.message === 'Schedule not found') {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }
    if (error instanceof Error && error.message.includes('only pause pending')) {
      return NextResponse.json(
        { error: 'Can only pause pending schedules' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to pause notification schedule' },
      { status: 500 }
    );
  }
}













