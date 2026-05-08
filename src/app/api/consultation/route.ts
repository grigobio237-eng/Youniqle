import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import PreConsultation from '@/models/PreConsultation';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await req.json();
    
    // 유저의 recentNavigator 값이 세션에 있다면 (네비게이터 추천으로 온 유저), 이를 기록
    const navigatorCode = (session.user as any)?.recentNavigator || '';

    // 3. AI 리포트 가이드 실시간 생성
    console.log('🤖 유니클 리커버리 리포트 생성 중...');
    const aiGuide = await GeminiAIEngine.generateMedicalInterviewGuide(data);
    
    const newConsultation = new PreConsultation({
      user: (session.user as any).id,
      navigator: navigatorCode,
      expectation: data.expectation,
      medicalHistory: data.medicalHistory,
      anxiety: data.anxiety,
      visitPlan: data.visitPlan,
      investment: data.investment,
      medicalCategory: data.medicalCategory,
      aiGuide: aiGuide // 분석 결과 저장
    });

    await newConsultation.save();
    console.log('✅ 리포트 저장 완료:', newConsultation._id);

    return NextResponse.json({ 
      success: true, 
      consultationId: newConsultation._id 
    });

  } catch (error) {
    console.error('Failed to save pre-consultation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(req.url);
    const mode = url.searchParams.get('mode'); // 'admin' 혹은 'navigator'

    let user = session?.user;
    const clinicPassword = req.headers.get('x-clinic-password');

    // 1. 임시 비밀번호 인증 (계정 없는 의료진용)
    const isTempClinicAuthorized = clinicPassword === '1234';

    // 2. 관리자 토큰 확인 (로그인된 관리자용)
    if (!user && !isTempClinicAuthorized) {
      const { verifyAdminToken } = await import('@/lib/auth');
      const adminAuth = await verifyAdminToken(req as any);
      if (adminAuth.success) {
        user = adminAuth.user as any;
      }
    }

    if (!user && !isTempClinicAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userIdParam = url.searchParams.get('userId');

    let query = {};

    // 1. 관리자 또는 의료기관 담당자(비밀번호 인증 포함)인 경우
    const { AccessControl } = await import('@/lib/logic/access-control');
    if (isTempClinicAuthorized || AccessControl.isClinicStaff(user)) {
      if (userIdParam) {
        query = { user: userIdParam };
      } else {
        // 관리자가 전체를 보거나, 네비게이터 모드일 때 필터링
        if ((user as any).isNavigator || mode === 'navigator') {
          const { default: User } = await import('@/models/User');
          const me = await User.findById((user as any).id);
          if (me) query = { navigator: me.referralCode };
        }
      }
    } 
    // 2. 일반 유저인 경우 본인의 데이터만 조회
    else {
      query = { user: (session.user as any).id };
    }

    const consultations = await PreConsultation.find(query)
      .populate('user', 'name email image')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ consultations });

  } catch (error) {
    console.error('Failed to fetch pre-consultations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
