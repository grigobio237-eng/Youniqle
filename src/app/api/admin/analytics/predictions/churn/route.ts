import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { PredictiveAnalyticsEngine } from '@/lib/predictiveAnalyticsEngine';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '관리자 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.type !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    await connectDB();

    const { userId, modelId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 고객 이탈 예측 실행
    const prediction = await PredictiveAnalyticsEngine.predictCustomerChurn(userId, modelId);

    return NextResponse.json({
      success: true,
      data: prediction,
      message: '고객 이탈 예측이 완료되었습니다.'
    });

  } catch (error) {
    console.error('Customer churn prediction error:', error);
    return NextResponse.json(
      { error: '고객 이탈 예측에 실패했습니다.' },
      { status: 500 }
    );
  }
}













