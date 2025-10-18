import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationScheduler } from '@/lib/notificationScheduler';
import { connectDB } from '@/lib/db';

export async function GET(
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
    const schedule = await NotificationScheduler.getSchedule(id);
    
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Get notification schedule error:', error);
    if (error instanceof Error && error.message === 'Schedule not found') {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch notification schedule' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const updateData = await request.json();
    
    const schedule = await NotificationScheduler.updateSchedule(id, updateData);
    
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Update notification schedule error:', error);
    if (error instanceof Error && error.message === 'Schedule not found') {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }
    if (error instanceof Error && error.message.includes('while sending')) {
      return NextResponse.json(
        { error: 'Cannot update schedule while sending' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update notification schedule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const success = await NotificationScheduler.deleteSchedule(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete notification schedule error:', error);
    if (error instanceof Error && error.message.includes('while sending')) {
      return NextResponse.json(
        { error: 'Cannot delete schedule while sending' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete notification schedule' },
      { status: 500 }
    );
  }
}













