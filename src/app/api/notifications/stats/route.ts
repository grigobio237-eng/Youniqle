import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { NotificationService } from '@/lib/notificationService';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.type !== 'user') {
      return NextResponse.json(
        { error: '사용자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // 일수

    // 알림 통계 조회
    const stats = await NotificationService.getNotificationStats(decoded.id);
    
    // 읽지 않은 알림 개수
    const unreadCount = await NotificationService.getUnreadCount(decoded.id);

    // 기간별 통계 (최근 N일)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const periodStats = await NotificationService.getUserNotifications(decoded.id, 1, 1000, undefined, undefined);

    return NextResponse.json({
      total: stats.total,
      unread: unreadCount,
      periodStats,
      byType: stats.byType.reduce((acc: any, item: any) => {
        if (!acc[item.type]) {
          acc[item.type] = { total: 0, unread: 0 };
        }
        acc[item.type].total++;
        if (item.status !== 'read') {
          acc[item.type].unread++;
        }
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    return NextResponse.json(
      { error: '알림 통계를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}
