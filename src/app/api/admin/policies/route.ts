import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Policy from '@/models/Policy';
import { verifyAuth } from '@/lib/auth';

// 전체 정책 목록 조회 (관리자)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // default is true
    const type = searchParams.get('type');

    const filter: any = {};
    if (activeOnly) filter.isActive = true;
    if (type) filter.type = type.toUpperCase();

    const policies = await Policy.find(filter)
      .sort({ type: 1, version: -1 })
      .populate('authorId', 'name email')
      .lean();

    return NextResponse.json({
      success: true,
      data: { policies },
    });
  } catch (error: any) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '약관/정책 조회 실패' } },
      { status: 500 }
    );
  }
}

// 신규 정책 생성 또는 기존 정책 버전업 (관리자)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { type, title, content, effectiveDate, isRequired } = body;

    if (!type || !title || !content) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '종류(Type), 제목, 내용은 필수입니다.' } },
        { status: 400 }
      );
    }

    const upperType = type.trim().toUpperCase();

    // 트랜잭션 대신 순차적 처리를 사용하여 버전업 구현 (일반 환경 호환성 위해)
    // 1. 해당 타입의 최신 버전을 찾습니다.
    const latestPolicy = await Policy.findOne({ type: upperType }).sort({ version: -1 });
    
    // 2. 새 버전 번호 할당
    // 부동소수점 이슈 없이 +1 하드코딩
    const newVersion = latestPolicy ? Number((latestPolicy.version + 1.0).toFixed(1)) : 1.0;

    // 3. 기존 활성 정책들을 비활성(보관) 처리
    if (latestPolicy) {
      await Policy.updateMany({ type: upperType }, { $set: { isActive: false } });
    }

    // 4. 새 버전 정책 생성
    const policy = await Policy.create({
      type: upperType,
      title,
      content,
      version: newVersion,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      isRequired: isRequired || false,
      isActive: true, // 등록 즉시 최신이 됨
      authorId: user.id
    });

    return NextResponse.json({
      success: true,
      data: { policy },
      message: `${upperType} 버전 ${newVersion}이 새로 발급 및 적용되었습니다.`,
    });
  } catch (error: any) {
    console.error('Error creating/updating policy:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '정책 생성 및 버전업 실패' } },
      { status: 500 }
    );
  }
}
