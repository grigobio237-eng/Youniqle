import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Policy from '@/models/Policy';
import { verifyAuth } from '@/lib/auth';

/**
 * GET: 특정 정책 상세 조회 (Type 기반)
 * URL: /api/admin/policies/[id]  <- 여기서 id 자리에 'TERMS', 'PRIVACY' 등이 들어옴
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    await connectDB();

    const resolvedParams = await context.params;
    const { id } = resolvedParams;
    
    // id가 MongoDB ObjectId 형태가 아닐 경우(보통 대문자 Type), Type으로 검색
    // 만약 ObjectId 형태라면 id로 검색할 수도 있지만, 현재 기획상 에디터는 Type으로 접근함
    const policy = await Policy.findOne({ 
      $or: [
        { type: id.toUpperCase() },
        { _id: id.length === 24 ? id : undefined }
      ],
      isActive: true 
    }).lean();

    return NextResponse.json({
      success: true,
      data: { policy },
    });
  } catch (error: any) {
    console.error('정책 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '정책 상세 조회 실패' } },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 특정 정책 삭제 (_id 기반)
 * URL: /api/admin/policies/[id] <- 여기서 id 자리에 MongoDB _id가 들어옴
 */
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    await connectDB();
    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    const deleted = await Policy.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: '삭제할 약관을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: '선택한 약관이 성공적으로 삭제되었습니다.' });
  } catch (error: any) {
    console.error('정책 삭제 오류:', error);
    return NextResponse.json({ success: false, error: '약관 삭제 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
