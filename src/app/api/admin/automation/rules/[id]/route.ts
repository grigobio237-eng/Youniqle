import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AutomationRule from '@/models/AutomationRule';
import jwt from 'jsonwebtoken';

export async function GET(
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
    const rule = await AutomationRule.findById(id)
      .populate('metadata.createdBy', 'name email');

    if (!rule) {
      return NextResponse.json(
        { error: '자동화 규칙을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rule
    });

  } catch (error) {
    console.error('Automation rule fetch error:', error);
    return NextResponse.json(
      { error: '자동화 규칙을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const updateData = await request.json();

    const rule = await AutomationRule.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).populate('metadata.createdBy', 'name email');

    if (!rule) {
      return NextResponse.json(
        { error: '자동화 규칙을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rule,
      message: '자동화 규칙이 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('Automation rule update error:', error);
    return NextResponse.json(
      { error: '자동화 규칙 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const rule = await AutomationRule.findByIdAndDelete(id);

    if (!rule) {
      return NextResponse.json(
        { error: '자동화 규칙을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '자동화 규칙이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Automation rule deletion error:', error);
    return NextResponse.json(
      { error: '자동화 규칙 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
