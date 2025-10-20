import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationI18n } from '@/lib/notificationI18n';
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
    
    const { id: templateId } = await params;
    const stats = await NotificationI18n.getTranslationStats(templateId);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get translation stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translation stats' },
      { status: 500 }
    );
  }
}















