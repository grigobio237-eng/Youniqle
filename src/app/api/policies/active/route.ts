import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Policy from '@/models/Policy';

// 클라이언트 등에서 호출할 현재 적용 중(isActive: true)인 최신 약관 목록 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // isActive가 true인 정책만 가져옵니다. 
    // 필요없는 백엔드 메타데이터(수정한 사람 ID 등)는 제외합니다.
    const activePolicies = await Policy.find({ isActive: true })
      .select('type title content version effectiveDate isRequired updatedAt')
      .lean();

    // 프론트엔드에서 편하게 접근할 수 있도록 type을 키값으로 하는 객체로 포맷팅
    // 예: { TERMS: { ... }, PRIVACY: { ... } }
    const policyMap = activePolicies.reduce((acc: any, policy) => {
      acc[policy.type] = policy;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: { 
        policies: activePolicies,
        policyMap 
      },
    });
  } catch (error: any) {
    console.error('Error fetching active policies:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '최신 정책을 불러오지 못했습니다.' } },
      { status: 500 }
    );
  }
}
