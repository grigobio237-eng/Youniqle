import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // DB 연결 시 타임아웃 설정 (3초)
    const dbPromise = connectDB();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Connection Timeout')), 3000));
    await Promise.race([dbPromise, timeoutPromise]);

    // 승인 대기 중인 파트너 수 조회
    const pendingPartnersCount = await User.countDocuments({
      partnerStatus: 'pending'
    }).maxTimeMS(3000); // 쿼리 타임아웃 3초

    return NextResponse.json({
      notifications: [],
      stats: {
        total: pendingPartnersCount,
        unread: pendingPartnersCount,
        recent: 0,
        pending: pendingPartnersCount,
        sent: 0,
        delivered: 0,
        failed: 0,
        successRate: 0
      },
      pagination: {
        pages: 1,
        current: 1,
        total: 0,
        limit: 10
      },
      pendingPartners: pendingPartnersCount,
      total: pendingPartnersCount
    });

  } catch (error) {
    console.error('Notifications fetch error:', error);
    // 에러 발생 시 520/500 대신 빈 데이터 반환하여 프론트엔드 크래시 방지
    return NextResponse.json({
      notifications: [],
      stats: { total: 0, unread: 0, pending: 0, recent: 0 },
      pendingPartners: 0,
      total: 0
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

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

    // 관리자 권한 확인
    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { templateId, recipients, variables } = await request.json();

    if (!templateId || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json(
        { error: '템플릿 ID와 수신자 목록이 필요합니다.' },
        { status: 400 }
      );
    }

    // 간단한 알림 발송 테스트
    const { NotificationService } = await import('@/lib/notificationService');

    const results = [];
    for (const recipient of recipients) {
      try {
        const result = await NotificationService.sendNotification({
          userId: recipient,
          type: 'marketing',
          category: 'info',
          title: '테스트 알림',
          message: `안녕하세요! ${variables?.userName || '사용자'}님, ${variables?.productName || '상품'}에 대한 알림입니다.`,
          data: variables,
          priority: 5,
          source: 'admin-panel'
        });
        results.push({ recipient, success: result });
      } catch (error) {
        results.push({
          recipient,
          success: false,
          error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
        });
      }
    }

    return NextResponse.json({
      message: '알림 발송이 완료되었습니다.',
      results
    });

  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      {
        error: '알림 발송 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

















