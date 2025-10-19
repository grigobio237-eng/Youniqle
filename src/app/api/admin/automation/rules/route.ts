import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AutomationRule from '@/models/AutomationRule';
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
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // 필터 구성
    const filter: any = {};
    if (category) filter['metadata.category'] = category;
    if (status) filter.isActive = status === 'active';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 자동화 규칙 조회
    const rules = await AutomationRule.find(filter)
      .populate('metadata.createdBy', 'name email')
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await AutomationRule.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: {
        rules,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Automation rules fetch error:', error);
    return NextResponse.json(
      { error: '자동화 규칙을 불러올 수 없습니다.' },
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

    const ruleData = await request.json();

    // 필수 필드 검증
    if (!ruleData.name || !ruleData.triggers || !ruleData.actions) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 자동화 규칙 생성
    const rule = new AutomationRule({
      ...ruleData,
      metadata: {
        ...ruleData.metadata,
        createdBy: decoded.userId,
        version: '1.0.0',
        environment: 'production'
      }
    });

    await rule.save();

    return NextResponse.json({
      success: true,
      data: rule,
      message: '자동화 규칙이 생성되었습니다.'
    });

  } catch (error) {
    console.error('Automation rule creation error:', error);
    return NextResponse.json(
      { error: '자동화 규칙 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}














