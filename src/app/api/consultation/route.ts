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

    // [성능 최적화 완료] Gemini 2.5 Flash 모델의 초고속 응답(약 3초)을 활용하여 즉시 리포트 생성
    console.log('🤖 유니클 리커버리 리포트 즉시 생성 중 (Gemini 2.0 Flash)...');
    
    let aiGuide = null;
    try {
      aiGuide = await GeminiAIEngine.generateMedicalInterviewGuide(data);
    } catch (aiError) {
      console.error('⚠️ AI Report Generation failed, but proceeding with save:', aiError);
      // AI 실패 시 빈 가이드 혹은 기본 가이드 설정 가능
    }
    
    const newConsultation = new PreConsultation({
      user: (session.user as any).id,
      navigator: navigatorCode,
      medicalCategory: data.medicalCategory,
      chiefComplaint: data.chiefComplaint,
      dynamicAnswers: data.dynamicAnswers,
      medicalHistory: data.medicalHistory,
      lifestyle: data.lifestyle,
      expectation: data.expectation,
      visitPlan: data.visitPlan,
      investment: data.investment,
      aiGuide: aiGuide
    });

    await newConsultation.save();
    console.log('✅ 상담 데이터 저장 완료:', newConsultation._id);

    return NextResponse.json({ 
      success: true, 
      consultationId: newConsultation._id,
      aiGenerated: !!aiGuide
    });

  } catch (error: any) {
    console.error('Failed to save pre-consultation:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error.message || '상담 저장 실패'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    await connectDB();

    const url = new URL(req.url);
    const mode = url.searchParams.get('mode'); // 'admin' 혹은 'navigator'
    const clinicPassword = req.headers.get('x-clinic-password');

    let user = session?.user;
    let isTempClinicAuthorized = false;
    let authorizedHospitalId = null;

    // 1. Check against dynamic Hospital codes
    if (clinicPassword) {
      const { default: Hospital } = await import('@/models/Hospital');
      const hospital = await Hospital.findOne({ code: clinicPassword, isActive: true });
      if (hospital) {
        isTempClinicAuthorized = true;
        authorizedHospitalId = hospital._id;
      }
    }

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
        if (user && ((user as any).isNavigator || mode === 'navigator')) {
          const { default: User } = await import('@/models/User');
          const me = await User.findById((user as any).id);
          if (me) query = { navigator: me.referralCode };
        }
      }

      // Log the visit if authorized via hospital code
      if (isTempClinicAuthorized && authorizedHospitalId && userIdParam) {
        const { default: HospitalVisitLog } = await import('@/models/HospitalVisitLog');
        await HospitalVisitLog.create({
          hospitalId: authorizedHospitalId,
          userId: userIdParam,
          accessType: 'patient-detail',
          timestamp: new Date()
        });
      }
    } 
    // 2. 일반 유저인 경우 본인의 데이터만 조회
    else if (user) {
      query = { user: (user as any).id };
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
