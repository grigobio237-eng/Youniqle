import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AutomationRule from '@/models/AutomationRule';
import { AutomationEngine } from '@/lib/automationEngine';
import jwt from 'jsonwebtoken';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const rule = await AutomationRule.findById(id);
    if (!rule) {
      return NextResponse.json(
        { error: '자동화 규칙을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!rule.isActive) {
      return NextResponse.json(
        { error: '비활성화된 규칙은 실행할 수 없습니다.' },
        { status: 400 }
      );
    }

    const { context = {} } = await request.json();

    // 자동화 엔진을 통한 규칙 실행
    const automationEngine = AutomationEngine.getInstance();
    await automationEngine.executeRule(
      id,
      context,
      {
        type: 'api',
        data: { manual: true },
        timestamp: new Date()
      }
    );

    return NextResponse.json({
      success: true,
      message: '자동화 규칙이 실행되었습니다.'
    });

  } catch (error) {
    console.error('Automation rule execution error:', error);
    return NextResponse.json(
      { error: '자동화 규칙 실행에 실패했습니다.' },
      { status: 500 }
    );
  }
}
