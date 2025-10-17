import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';
import CouponUsage from '@/models/CouponUsage';
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
    const coupon = await Coupon.findById(id)
      .populate('createdBy', 'name email')
      .populate('applicableProducts', 'name price')
      .populate('excludedProducts', 'name price');

    if (!coupon) {
      return NextResponse.json(
        { error: '쿠폰을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용 기록 조회
    const usageHistory = await CouponUsage.find({ couponId: id })
      .populate('userId', 'name email')
      .populate('orderId', 'orderNumber totalAmount')
      .sort({ usedAt: -1 })
      .limit(50);

    // 사용 통계
    const usageStats = await CouponUsage.aggregate([
      { $match: { couponId: coupon._id } },
      {
        $group: {
          _id: null,
          totalUsage: { $sum: 1 },
          totalDiscount: { $sum: '$discountAmount' },
          avgDiscount: { $avg: '$discountAmount' }
        }
      }
    ]);

    return NextResponse.json({
      coupon,
      usageHistory,
      stats: usageStats[0] || {
        totalUsage: 0,
        totalDiscount: 0,
        avgDiscount: 0
      }
    });

  } catch (error) {
    console.error('Admin coupon detail fetch error:', error);
    return NextResponse.json(
      { error: '쿠폰 상세 정보를 가져올 수 없습니다.' },
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

    // 쿠폰 코드 변경 시 중복 확인
    if (updateData.code) {
      const existingCoupon = await Coupon.findOne({ 
        code: updateData.code.toUpperCase(),
        _id: { $ne: id }
      });
      
      if (existingCoupon) {
        return NextResponse.json(
          { error: '이미 존재하는 쿠폰 코드입니다.' },
          { status: 409 }
        );
      }
      
      updateData.code = updateData.code.toUpperCase();
    }

    // 유효성 검증
    if (updateData.type === 'percentage' && (updateData.value < 0 || updateData.value > 100)) {
      return NextResponse.json(
        { error: '퍼센트 할인은 0-100 사이의 값이어야 합니다.' },
        { status: 400 }
      );
    }

    if (updateData.type === 'fixed' && updateData.value < 0) {
      return NextResponse.json(
        { error: '고정 할인 금액은 0 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return NextResponse.json(
        { error: '쿠폰을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '쿠폰이 수정되었습니다.',
      coupon
    });

  } catch (error) {
    console.error('Admin coupon update error:', error);
    return NextResponse.json(
      { error: '쿠폰 수정 중 오류가 발생했습니다.' },
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
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { error: '쿠폰을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용된 쿠폰인지 확인
    if (coupon.usageCount > 0) {
      return NextResponse.json(
        { error: '사용된 쿠폰은 삭제할 수 없습니다. 비활성화하세요.' },
        { status: 400 }
      );
    }

    await Coupon.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: '쿠폰이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Admin coupon delete error:', error);
    return NextResponse.json(
      { error: '쿠폰 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
