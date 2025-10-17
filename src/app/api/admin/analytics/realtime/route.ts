import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { RealtimeAnalyticsEngine } from '@/lib/realtimeAnalytics';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인 (개발 중에는 임시로 주석 처리)
    // const token = request.cookies.get('admin-token')?.value;
    // if (!token) {
    //   return NextResponse.json(
    //     { error: '관리자 인증이 필요합니다.' },
    //     { status: 401 }
    //   );
    // }

    // const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    // if (decoded.type !== 'admin') {
    //   return NextResponse.json(
    //     { error: '관리자 권한이 필요합니다.' },
    //     { status: 403 }
    //   );
    // }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '1h';
    
    // period에 따른 날짜 범위 설정
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1h':
        startDate.setHours(now.getHours() - 1);
        break;
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setHours(now.getHours() - 1);
    }
    
    // 필터 파라미터 파싱
    const filters = {
      startDate: startDate,
      endDate: now,
      eventTypes: searchParams.get('eventTypes')?.split(','),
      eventCategories: searchParams.get('eventCategories')?.split(','),
      userIds: searchParams.get('userIds')?.split(','),
      sessionIds: searchParams.get('sessionIds')?.split(','),
      deviceTypes: searchParams.get('deviceTypes')?.split(','),
      countries: searchParams.get('countries')?.split(','),
      utmSources: searchParams.get('utmSources')?.split(','),
      utmCampaigns: searchParams.get('utmCampaigns')?.split(','),
      segmentIds: searchParams.get('segmentIds')?.split(','),
      abTestIds: searchParams.get('abTestIds')?.split(',')
    };

    // 실시간 지표 조회
    const metrics = await RealtimeAnalyticsEngine.getRealtimeMetrics(filters);

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Realtime analytics fetch error:', error);
    return NextResponse.json(
      { error: '실시간 분석 데이터를 가져올 수 없습니다.', details: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 이벤트 추적 API
    const eventData = await request.json();
    
    // 필수 필드 검증
    if (!eventData.eventType || !eventData.sessionId) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    await connectDB();

    // 이벤트 추적
    await RealtimeAnalyticsEngine.trackEvent(eventData);

    return NextResponse.json({
      success: true,
      message: '이벤트가 추적되었습니다.'
    });

  } catch (error) {
    console.error('Event tracking error:', error);
    return NextResponse.json(
      { error: '이벤트 추적에 실패했습니다.' },
      { status: 500 }
    );
  }
}

