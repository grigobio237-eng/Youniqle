import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

// 관리자 상품 승인/거부 API
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // JWT 토큰으로 인증 확인
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // JWT 토큰 검증
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: '서버 설정 오류가 발생했습니다.' }, { status: 500 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    } catch (jwtError) {
      return NextResponse.json({ error: '유효하지 않은 인증 토큰입니다.' }, { status: 401 });
    }

    if (decoded.type !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    await connectDB();

    // 관리자 권한 확인
    const user = await User.findById(decoded.id);

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { action, rejectionReason } = await request.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: '유효한 액션을 지정해주세요 (approve 또는 reject).' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 승인 또는 거부 처리
    if (action === 'approve') {
      product.approvalStatus = 'approved';
      product.rejectionReason = undefined;
      await product.save();

      // 캐시 무효화 (승인 시 즉시 사용자 페이지 반영)
      const { cache } = await import('@/lib/cache');
      await cache.delPattern('products:*');
      console.log(`🗑️ 상품 승인으로 인한 캐시 무효화 완료: ${id}`);

      return NextResponse.json({
        message: '상품이 승인되었습니다.',
        product: {
          id: product._id.toString(),
          name: product.name,
          approvalStatus: product.approvalStatus
        }
      });
    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: '거부 사유를 입력해주세요.' },
          { status: 400 }
        );
      }

      product.approvalStatus = 'rejected';
      product.rejectionReason = rejectionReason;
      await product.save();

      // 캐시 무효화
      const { cache } = await import('@/lib/cache');
      await cache.delPattern('products:*');
      console.log(`🗑️ 상품 거부로 인한 캐시 무효화 완료: ${id}`);

      return NextResponse.json({
        message: '상품이 거부되었습니다.',
        product: {
          id: product._id.toString(),
          name: product.name,
          approvalStatus: product.approvalStatus,
          rejectionReason: product.rejectionReason
        }
      });
    }

  } catch (error) {
    console.error('Failed to process product approval:', error);
    return NextResponse.json(
      { error: '상품 승인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

