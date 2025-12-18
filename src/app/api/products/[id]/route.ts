import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();

    const product = await Product.findOne({
      $or: [
        { _id: id },
        { slug: id },
      ],
      status: 'active',
      approvalStatus: 'approved', // 승인된 상품만 일반 사용자에게 노출
    }).lean();

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 펀딩 상품인 경우 참여자 수와 총 펀딩 금액 계산
    let fundingStats = {
      participantCount: 0,
      totalFundingAmount: 0
    };

    if ((product as any).isFunding) {
      const Order = (await import('@/models/Order')).default;
      const stats = await Order.aggregate([
        { $unwind: '$items' },
        {
          $match: {
            'items.productId': (product as any)._id,
            status: { $nin: ['cancelled', 'refunded'] } // 취소/환불 제외
          }
        },
        {
          $group: {
            _id: null,
            participantCount: { $sum: 1 },
            totalFundingAmount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        }
      ]);

      if (stats.length > 0) {
        fundingStats = {
          participantCount: stats[0].participantCount,
          totalFundingAmount: stats[0].totalFundingAmount
        };
      }
    }

    // Transform _id to id for frontend compatibility
    const transformedProduct = {
      ...product,
      id: (product as any)._id,
      ...fundingStats // 펀딩 통계 추가
    };

    return NextResponse.json({ product: transformedProduct });
  } catch (error) {
    console.error('Get product error:', error);

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

