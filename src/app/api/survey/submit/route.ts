import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Shop from '@/models/Shop';
import SurveyResponse from '@/models/SurveyResponse';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shopCode, answers, entryCondition, partnerCode, version } = body;

    if (!shopCode || !answers) {
      return NextResponse.json({ success: false, error: 'Required fields missing' }, { status: 400 });
    }

    await dbConnect();

    // 1. 업소 코드를 기반으로 업소 및 네비게이터 정보 조회
    const shop = await Shop.findOne({ shopCode: shopCode.toUpperCase(), isActive: true });
    if (!shop) {
      return NextResponse.json({ success: false, error: 'Invalid or inactive shop code' }, { status: 404 });
    }

    // 2. 현재 로그인한 사용자가 있는지 확인 (로그인 유입의 경우)
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const userId = session?.user?.id || session?.user?._id;

    // 3. 설문 응답(리드) 저장
    const newResponse = new SurveyResponse({
      shopId: shop._id,
      navigatorId: shop.navigatorId,
      shopCode: shop.shopCode,
      partnerCode: partnerCode || 'default',
      version: version || '1.0',
      userId: userId || undefined,
      answers: {
        ...answers,
        entryCondition: entryCondition || ''
      },
      status: 'new'
    });

    await newResponse.save();

    return NextResponse.json({ 
        success: true, 
        message: 'Survey response submitted successfully',
        responseId: newResponse._id
    });
  } catch (error: any) {
    console.error("Survey Submission Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
