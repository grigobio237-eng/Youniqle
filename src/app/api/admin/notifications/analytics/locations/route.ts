import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationAnalyticsEngine } from '@/lib/notificationAnalyticsEngine';
import { connectDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const type = searchParams.get('type') || undefined;
    const category = searchParams.get('category') || undefined;
    const templateId = searchParams.get('templateId') || undefined;
    const scheduleId = searchParams.get('scheduleId') || undefined;
    
    const filters = {
      startDate,
      endDate,
      type,
      category,
      templateId,
      scheduleId
    };
    
    const locationAnalytics = await NotificationAnalyticsEngine.getLocationAnalytics(filters);
    
    return NextResponse.json(locationAnalytics);
  } catch (error) {
    console.error('Get notification location analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification location analytics' },
      { status: 500 }
    );
  }
}














