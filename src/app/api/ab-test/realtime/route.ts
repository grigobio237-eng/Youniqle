import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ABTestAdvancedStats } from '@/lib/abTestAdvancedStats';
import { connectDB } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId, eventType, variantName, metadata } = await request.json();

    if (!testId || !eventType || !variantName) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 실시간 이벤트 처리
    const result = await ABTestAdvancedStats.processRealtimeEvent(
      testId,
      eventType,
      variantName,
      session.user.email || ''
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.stats,
        eventId: result.eventId
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Real-time event error:', error);
    return NextResponse.json(
      { error: '실시간 이벤트 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');

    if (!testId) {
      return NextResponse.json(
        { error: '테스트 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 실시간 통계 조회
    const stats = await ABTestAdvancedStats.calculateAdvancedStats(testId);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Real-time stats error:', error);
    return NextResponse.json(
      { error: '실시간 통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
