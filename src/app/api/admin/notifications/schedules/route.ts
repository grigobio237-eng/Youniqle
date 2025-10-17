import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationScheduler } from '@/lib/notificationScheduler';
import { connectDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const search = searchParams.get('search') || undefined;
    
    const filters = {
      status,
      type,
      priority,
      search
    };
    
    const result = await NotificationScheduler.getSchedules(filters, page, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get notification schedules error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification schedules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const scheduleData = await request.json();
    
    // 필수 필드 검증
    if (!scheduleData.templateId || !scheduleData.name || !scheduleData.type || !scheduleData.target || !scheduleData.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const schedule = await NotificationScheduler.createSchedule(scheduleData, (session.user as any).id || session.user.email || '');
    
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Create notification schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification schedule' },
      { status: 500 }
    );
  }
}
