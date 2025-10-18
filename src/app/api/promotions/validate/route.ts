import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { PromotionEngine } from '@/lib/promotionEngine';
import User from '@/models/User';
import Order from '@/models/Order';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { cartItems, totalAmount, userId } = await request.json();

    // 입력 검증
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: '장바구니에 상품이 없습니다.' },
        { status: 400 }
      );
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: '주문 금액이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 조회 (선택사항)
    let userGrade, orderCount, totalSpent;
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        userGrade = user.grade;
        
        // 주문 통계 조회
        const orderStats = await Order.aggregate([
          { 
            $match: { 
              userId: user._id,
              status: { $in: ['delivered', 'completed'] }
            }
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              total: { $sum: '$totalAmount' }
            }
          }
        ]);

        if (orderStats.length > 0) {
          orderCount = orderStats[0].count;
          totalSpent = orderStats[0].total;
        } else {
          orderCount = 0;
          totalSpent = 0;
        }
      }
    }

    // 프로모션 컨텍스트 생성
    const context = {
      userId,
      cartItems,
      totalAmount,
      userGrade,
      orderCount,
      totalSpent
    };

    // 적용 가능한 프로모션 찾기
    const applicablePromotions = await PromotionEngine.findApplicablePromotions(context);

    return NextResponse.json({
      success: true,
      promotions: applicablePromotions,
      totalDiscount: applicablePromotions.reduce((sum, promo) => sum + (promo.discountAmount || 0), 0),
      finalAmount: totalAmount - applicablePromotions.reduce((sum, promo) => sum + (promo.discountAmount || 0), 0)
    });

  } catch (error) {
    console.error('Promotion validation API error:', error);
    return NextResponse.json(
      { error: '프로모션 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}













