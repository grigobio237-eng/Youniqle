import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Diagnosis from '@/models/Diagnosis';
import MedicalPassPin from '@/models/MedicalPassPin';
import PreConsultation from '@/models/PreConsultation';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const code = resolvedParams.code?.trim();

    if (!code) {
      return NextResponse.json({ error: '코드가 제공되지 않았습니다.' }, { status: 400 });
    }

    // referralCode로 회원 조회 (대소문자 구분 없이 검색)
    const member = await User.findOne({ 
      referralCode: { $regex: new RegExp(`^${code}$`, 'i') }, 
      isDeleted: { $ne: true } 
    })
      .select('name email referralCode referredBy grade tier points createdAt diagnosisResults')
      .lean();

    if (!member) {
      return NextResponse.json({ error: '유효하지 않은 코드입니다.' }, { status: 404 });
    }

    // 세션 확인 (세션 없어도 기본 페이지 표시 허용)
    const session = await getServerSession(authOptions);

    let viewerRole: 'self' | 'partner' | 'guest' = 'guest';
    let referrerName: string | null = null;

    if (session?.user) {
      const viewer = await User.findOne({ email: session.user.email })
        .select('role partnerStatus referralCode')
        .lean() as any;

      if (viewer) {
        if (viewer.referralCode === code) {
          viewerRole = 'self';
        } else if (['admin', 'superadmin'].includes(viewer.role)) {
          // 관리자는 파트너와 동일하게 모든 정보를 볼 수 있도록 허용
          viewerRole = 'partner';
        } else if (viewer.role === 'partner' && viewer.partnerStatus === 'approved') {
          viewerRole = 'partner';
        }

        // --- 네비게이터 바인딩 로직 추가 ---
        // 스캔한 대상이 네비게이터인 경우, 현재 뷰어의 recentNavigator 업데이트
        const targetMember = await User.findOne({ 
          referralCode: { $regex: new RegExp(`^${code}$`, 'i') },
          isNavigator: true 
        }).select('_id').lean() as any;

        if (targetMember && viewer._id.toString() !== targetMember._id.toString()) {
          await User.findByIdAndUpdate(viewer._id, {
            recentNavigator: code.toUpperCase()
          });
          console.log(`[API/Member] Updated recentNavigator for ${viewer.email} to ${code}`);
        }
      }
    }

    // 소개인(referrer) 정보 조회
    if ((member as any).referredBy) {
      const referrer = await User.findOne({ referralCode: (member as any).referredBy })
        .select('name')
        .lean() as any;
      if (referrer) {
        referrerName = referrer.name;
      }
    }

    // 최신 진단 결과 (기본 정보 리턴용)
    const diagnosisResults = (member as any).diagnosisResults || [];
    const latestDiagnosis = diagnosisResults.length > 0
      ? diagnosisResults[diagnosisResults.length - 1]
      : null;

    // ─── PIN 검증 및 메디컬 데이터 조회 ───────────────────────────
    const url = new URL(request.url);
    const pin = url.searchParams.get('pin');
    let medicalHistory = null;
    let preConsultation = null;
    let isMedicalAuthenticated = false;

    if (pin) {
      const pinDoc = await MedicalPassPin.findOne({ 
        userId: (member as any)._id,
        pin: pin
      });

      if (pinDoc) {
        isMedicalAuthenticated = true;
        // 문진 전체 히스토리 조회
        medicalHistory = await Diagnosis.find({ userId: (member as any)._id })
          .sort({ createdAt: -1 })
          .lean();
        
        // 최신 사전 문진(임상 데이터) 조회
        preConsultation = await PreConsultation.findOne({ user: (member as any)._id })
          .sort({ createdAt: -1 })
          .lean();
      }
    }

    return NextResponse.json({
      viewerRole,
      member: {
        name: (member as any).name,
        grade: (member as any).grade,
        tier: (member as any).tier,
        referralCode: (member as any).referralCode,
        referredBy: (member as any).referredBy || null,
        referrerName,
        memberSince: (member as any).createdAt,
        latestDiagnosisScore: latestDiagnosis?.totalScore ?? null,
      },
      medicalHistory,
      preConsultation,
      isMedicalAuthenticated
    });
  } catch (error) {
    console.error('[member/[code]] Error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
