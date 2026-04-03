import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await dbConnect();
    const { code } = await params;

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
        } else if (viewer.role === 'partner' && viewer.partnerStatus === 'approved') {
          viewerRole = 'partner';
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

    // 최신 진단 결과
    const diagnosisResults = (member as any).diagnosisResults || [];
    const latestDiagnosis = diagnosisResults.length > 0
      ? diagnosisResults[diagnosisResults.length - 1]
      : null;

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
    });
  } catch (error) {
    console.error('[member/[code]] Error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
