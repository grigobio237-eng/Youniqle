import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { NotificationService } from '@/lib/notificationService';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // JWT 토큰으로 사용자 인증
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userId = null;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const result = await NotificationService.getUserNotifications(
      userId,
      page,
      limit,
      type || undefined,
      status || undefined
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { 
        error: '알림 목록을 가져올 수 없습니다.', 
        details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { action, notificationId } = await request.json();

    if (action === 'markAsRead' && notificationId) {
      const success = await NotificationService.markAsRead(notificationId, decoded.id);
      return NextResponse.json({
        success,
        message: success ? '알림이 읽음 처리되었습니다.' : '알림 읽음 처리에 실패했습니다.'
      });
    }

    if (action === 'markAllAsRead') {
      const success = await NotificationService.markAllAsRead(decoded.id);
      return NextResponse.json({
        success,
        message: success ? '모든 알림이 읽음 처리되었습니다.' : '알림 읽음 처리에 실패했습니다.'
      });
    }

    if (action === 'delete' && notificationId) {
      const success = await NotificationService.deleteNotification(notificationId, decoded.id);
      return NextResponse.json({
        success,
        message: success ? '알림이 삭제되었습니다.' : '알림 삭제에 실패했습니다.'
      });
    }

    return NextResponse.json(
      { error: '유효하지 않은 액션입니다.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Notification action error:', error);
    return NextResponse.json(
      { error: '알림 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
