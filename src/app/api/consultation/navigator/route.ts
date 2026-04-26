import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import NavigatorConsultation from '@/models/NavigatorConsultation';
import User from '@/models/User';
import { NotificationService } from '@/lib/notificationService';

export const dynamic = 'force-dynamic';

// GET: 상담 목록 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode'); // 'admin', 'navigator', 'user'

    let user = session?.user;
    if (!user) {
      const { verifyAdminToken } = await import('@/lib/auth');
      const adminAuth = await verifyAdminToken(req as any);
      if (adminAuth.success) {
        user = adminAuth.user as any;
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query: any = {};
    const userRole = (user as any).role;
    const isNavigator = (user as any).isNavigator;

    if (mode === 'admin' && (userRole === 'admin' || userRole === 'superadmin')) {
      // 모든 상담 조회
    } else if (mode === 'navigator' && (isNavigator || userRole === 'admin' || userRole === 'superadmin')) {
      const { default: User } = await import('@/models/User');
      const me = await User.findById((user as any).id);
      query = { navigatorId: me.referralCode };
    } else {
      // 본인 상담만 조회
      query = { userId: (user as any).id };
    }

    const consultations = await NavigatorConsultation.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, consultations });

  } catch (error) {
    console.error('Failed to fetch consultations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: 새로운 상담 요청 생성
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    const user = await User.findById((session.user as any).id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 담당 네비게이터 찾기 (유저 프로필의 passInfo 혹은 recentNavigator)
    const navigatorCode = user.passInfo?.navigatorId || user.recentNavigator || 'ADMIN';

    const ticketId = `TKT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const newConsultation = new NavigatorConsultation({
      ticketId,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      navigatorId: navigatorCode,
      reportId: data.reportId,
      question: data.question,
      status: 'pending'
    });

    await newConsultation.save();

    // 네비게이터 또는 관리자에게 알림 발송
    if (navigatorCode === 'ADMIN') {
      // 모든 관리자에게 알림 (본사 직접 관리 티켓)
      const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
      for (const admin of admins) {
        await NotificationService.sendNotification({
          userId: admin._id.toString(),
          type: 'admin',
          category: 'urgent',
          title: '🚨 [본사직접] 신규 상담 요청 접수',
          message: `담당 네비게이터가 없는 유저(${user.name})의 상담 티켓(${ticketId})이 접수되었습니다.`,
          data: { ticketId, type: 'navigator_consultation' },
          source: 'System'
        });
      }
    } else {
      const navigator = await User.findOne({ referralCode: navigatorCode });
      if (navigator) {
        await NotificationService.sendNotification({
          userId: navigator._id.toString(),
          type: 'admin',
          category: 'urgent',
          title: '🚩 새로운 상담 요청이 접수되었습니다',
          message: `${user.name}고객님으로부터 신규 상담 티켓(${ticketId})이 도착했습니다.`,
          data: { ticketId, type: 'navigator_consultation' },
          source: 'System'
        });
      }
    }

    return NextResponse.json({ success: true, ticketId });

  } catch (error) {
    console.error('Failed to create consultation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: 상담 업데이트 (답변, 상태 변경, 독촉)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    const { id, action, answer } = data;

    const consultation = await NavigatorConsultation.findById(id);
    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    if (action === 'answer') {
      consultation.answer = answer;
      consultation.status = 'answered';
      consultation.answeredAt = new Date();
      consultation.answeredBy = (session.user as any).role === 'admin' ? 'admin' : 'navigator';
      await consultation.save();

      // 사용자에게 답변 알림
      await NotificationService.sendNotification({
        userId: consultation.userId.toString(),
        type: 'system',
        category: 'success',
        title: '✅ 상담 답변이 도착했습니다',
        message: `요청하신 상담 티켓(${consultation.ticketId})에 대한 답변이 등록되었습니다.`,
        data: { ticketId: consultation.ticketId },
        source: 'System'
      });
    } 
    else if (action === 'nudge') {
      // 독촉 로직 (관리자만 가능)
      if ((session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      consultation.nudgeCount += 1;
      consultation.lastNudgedAt = new Date();
      await consultation.save();

      // 네비게이터에게 강력 독촉 알림
      const navigator = await User.findOne({ referralCode: consultation.navigatorId });
      if (navigator) {
        await NotificationService.sendNotification({
          userId: navigator._id.toString(),
          type: 'admin',
          category: 'urgent',
          title: '⚠️ [긴급] 상담 응대 독촉 알림',
          message: `${consultation.userName} 고객님의 상담 티켓이 아직 보류 중입니다. 빠른 응대 부탁드립니다.`,
          data: { ticketId: consultation.ticketId },
          source: 'Admin'
        });
      }
    }
    else if (action === 'complete') {
      consultation.status = 'completed';
      await consultation.save();
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to update consultation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
