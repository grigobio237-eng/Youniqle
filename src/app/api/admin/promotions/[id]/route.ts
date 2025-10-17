import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Promotion from '@/models/Promotion';
import Order from '@/models/Order';
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
    const promotion = await Promotion.findById(id)
      .populate('createdBy', 'name email')
      .populate('targetIds')
      .populate('bundleProducts.productId', 'name price')
      .populate('buyXGetY.getProductId', 'name price');

    if (!promotion) {
      return NextResponse.json(
        { error: '프로모션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 프로모션 사용 통계
    const usageStats = await Order.aggregate([
      {
        $match: {
          'promotions.promotionId': promotion._id
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          totalDiscount: { $sum: '$promotions.discountAmount' }
        }
      }
    ]);

    // 일별 사용 통계 (최근 30일)
    const dailyStats = await Order.aggregate([
      {
        $match: {
          'promotions.promotionId': promotion._id,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
          discount: { $sum: '$promotions.discountAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    return NextResponse.json({
      promotion,
      stats: usageStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        totalDiscount: 0
      },
      dailyStats
    });

  } catch (error) {
    console.error('Admin promotion detail fetch error:', error);
    return NextResponse.json(
      { error: '프로모션 상세 정보를 가져올 수 없습니다.' },
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

    // 날짜 유효성 검증
    if (updateData.startDate && updateData.endDate) {
      const startDate = new Date(updateData.startDate);
      const endDate = new Date(updateData.endDate);
      
      if (startDate >= endDate) {
        return NextResponse.json(
          { error: '시작일은 종료일보다 이전이어야 합니다.' },
          { status: 400 }
        );
      }
    }

    // 할인 값 검증
    if (updateData.type === 'discount') {
      if (updateData.discountType === 'percentage' && (updateData.discountValue < 0 || updateData.discountValue > 100)) {
        return NextResponse.json(
          { error: '퍼센트 할인은 0-100 사이의 값이어야 합니다.' },
          { status: 400 }
        );
      }
      
      if (updateData.discountType === 'fixed' && updateData.discountValue < 0) {
        return NextResponse.json(
          { error: '고정 할인 금액은 0 이상이어야 합니다.' },
          { status: 400 }
        );
      }
    }

    const promotion = await Promotion.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!promotion) {
      return NextResponse.json(
        { error: '프로모션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '프로모션이 수정되었습니다.',
      promotion
    });

  } catch (error) {
    console.error('Admin promotion update error:', error);
    return NextResponse.json(
      { error: '프로모션 수정 중 오류가 발생했습니다.' },
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
    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return NextResponse.json(
        { error: '프로모션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용된 프로모션인지 확인
    if (promotion.usageCount > 0) {
      return NextResponse.json(
        { error: '사용된 프로모션은 삭제할 수 없습니다. 취소하세요.' },
        { status: 400 }
      );
    }

    await Promotion.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: '프로모션이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Admin promotion delete error:', error);
    return NextResponse.json(
      { error: '프로모션 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
