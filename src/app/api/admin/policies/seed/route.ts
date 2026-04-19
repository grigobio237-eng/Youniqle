import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Policy from '@/models/Policy';
import { CONSENT_TEXTS } from '@/constants/consents';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    await connectDB();

    const policiesToSeed = [
      { key: 'terms', type: 'TERMS', title: '유니클(Youniqle) 서비스 이용약관', isRequired: true },
      { key: 'privacy', type: 'PRIVACY', title: '유니클(Youniqle) 개인정보 처리방침', isRequired: true },
      { key: 'sensitive', type: 'SENSITIVE', title: '건강 관련 민감정보 수집 및 이용 동의', isRequired: true },
      { key: 'thirdParty', type: 'THIRD_PARTY', title: '제휴기관 예약 요청 전달 및 개인정보 제3자 제공 동의', isRequired: false },
      { key: 'marketing', type: 'MARKETING', title: '광고성 정보 수신 동의', isRequired: false },
      { key: 'passRefund', type: 'PASS_REFUND', title: '유니클 PASS 결제·환불 특약', isRequired: false },
    ];

    let seededCount = 0;

    for (const item of policiesToSeed) {
      const exists = await Policy.findOne({ type: item.type });
      if (!exists) {
        // @ts-ignore
        const rawContent = CONSENT_TEXTS[item.key];
        // 줄바꿈 문자를 간단한 <br/>로 치환 (WYSIWYG 호환을 위해)
        const htmlContent = rawContent.replace(/\n/g, '<br/>');

        await Policy.create({
          type: item.type,
          title: item.title,
          content: htmlContent,
          version: 1.0,
          isActive: true,
          isRequired: item.isRequired,
        });
        seededCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${seededCount}개의 초기 약관 마이그레이션이 완료되었습니다.`,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
