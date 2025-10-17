import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Promotion from '@/models/Promotion';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';

    // 현재 시간 기준으로 필터링
    const now = new Date();
    const filter: any = {
      status: status,
      startDate: { $lte: now },
      endDate: { $gte: now }
    };

    // 타입 필터
    if (type) {
      filter.type = type;
    }

    // 카테고리 필터 (해당 카테고리에 적용 가능한 프로모션)
    if (category) {
      filter.$or = [
        { targetType: 'all' },
        { targetType: 'categories', targetIds: { $in: [category] } },
        { applicableCategories: { $in: [category] } }
      ];
    }

    // 총 개수 조회
    const total = await Promotion.countDocuments(filter);

    // 프로모션 목록 조회
    const promotions = await Promotion.find(filter)
      .select('-createdBy -automation -stats -userConditions')
      .populate('targetIds', 'name price')
      .populate('bundleProducts.productId', 'name price')
      .populate('buyXGetY.getProductId', 'name price')
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // 사용자에게 보여줄 정보만 필터링
    const publicPromotions = promotions.map(promotion => ({
      _id: promotion._id,
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      maxDiscountAmount: promotion.maxDiscountAmount,
      minOrderAmount: promotion.minOrderAmount,
      bundleProducts: promotion.bundleProducts,
      buyXGetY: promotion.buyXGetY,
      flashSale: promotion.flashSale,
      targetType: promotion.targetType,
      targetIds: promotion.targetIds,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      timeRemaining: promotion.timeRemaining,
      isActive: promotion.isActive,
      progressPercentage: promotion.progressPercentage,
      tags: promotion.tags
    }));

    return NextResponse.json({
      promotions: publicPromotions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Public promotions fetch error:', error);
    return NextResponse.json(
      { error: '프로모션 목록을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}











