import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdvancedMarketingAutomation, MarketingEvent } from '@/lib/advancedMarketingAutomation';

export async function POST(request: NextRequest) {
  try {
    // JWT 토큰으로 사용자 인증
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다.' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userId = null;

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    const eventData = await request.json();
    
    // 이벤트 데이터 검증
    if (!eventData.eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType' },
        { status: 400 }
      );
    }

    // userId를 토큰에서 가져온 값으로 설정
    eventData.userId = userId;

    const event: MarketingEvent = {
      userId: eventData.userId,
      eventType: eventData.eventType,
      timestamp: new Date(),
      metadata: eventData.metadata || {}
    };

    // 마케팅 자동화 엔진에 이벤트 전달
    await AdvancedMarketingAutomation.addEvent(event);

    return NextResponse.json({ 
      success: true, 
      message: 'Event processed successfully',
      eventId: event.metadata.sessionId || 'unknown'
    });

  } catch (error) {
    console.error('Error processing marketing event:', error);
    return NextResponse.json(
      { error: 'Failed to process event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const eventType = searchParams.get('eventType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 실제 구현에서는 데이터베이스에서 이벤트 조회
    const events: any[] = [];

    return NextResponse.json({
      events,
      total: events.length,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching marketing events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
