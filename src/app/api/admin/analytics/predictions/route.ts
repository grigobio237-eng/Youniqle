import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { PredictionModel, Prediction } from '@/models/PredictiveAnalytics';
import { PredictiveAnalyticsEngine } from '@/lib/predictiveAnalyticsEngine';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const modelType = searchParams.get('modelType');
    const status = searchParams.get('status');

    // 필터 구성
    const filter: any = {};
    if (modelType) filter.modelType = modelType;
    if (status) filter.status = status;

    // 예측 모델 조회
    const models = await PredictionModel.find(filter)
      .populate('metadata.createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await PredictionModel.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: {
        models,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Prediction models fetch error:', error);
    return NextResponse.json(
      { error: '예측 모델을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

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

    const modelData = await request.json();

    // 필수 필드 검증
    if (!modelData.name || !modelData.modelType || !modelData.targetVariable) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 예측 모델 생성
    const model = new PredictionModel({
      ...modelData,
      metadata: {
        ...modelData.metadata,
        createdBy: decoded.userId,
        environment: 'production'
      }
    });

    await model.save();

    return NextResponse.json({
      success: true,
      data: model,
      message: '예측 모델이 생성되었습니다.'
    });

  } catch (error) {
    console.error('Prediction model creation error:', error);
    return NextResponse.json(
      { error: '예측 모델 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}











