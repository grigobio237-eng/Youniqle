import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Promotion from '@/models/Promotion';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // 필터 조건 구성
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // 총 개수 조회
    const total = await Promotion.countDocuments(filter);

    // 프로모션 목록 조회
    const promotions = await Promotion.find(filter)
      .populate('createdBy', 'name email')
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // 통계 정보
    const stats = await Promotion.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' },
          totalRevenue: { $sum: '$stats.totalRevenue' }
        }
      }
    ]);

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalUsage: stat.totalUsage,
        totalRevenue: stat.totalRevenue
      };
      return acc;
    }, {} as Record<string, { count: number; totalUsage: number; totalRevenue: number }>);

    // 활성 프로모션 통계
    const activePromotions = await Promotion.find({ status: 'active' });
    const now = new Date();
    const activeCount = activePromotions.filter(p => 
      p.startDate <= now && p.endDate >= now
    ).length;

    return NextResponse.json({
      promotions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total: total,
        active: activeCount,
        draft: statusStats.draft?.count || 0,
        paused: statusStats.paused?.count || 0,
        completed: statusStats.completed?.count || 0,
        cancelled: statusStats.cancelled?.count || 0,
        totalUsage: Object.values(statusStats).reduce((sum, stat: any) => sum + (stat.totalUsage || 0), 0),
        totalRevenue: Object.values(statusStats).reduce((sum, stat: any) => sum + (stat.totalRevenue || 0), 0)
      }
    });

  } catch (error) {
    console.error('Admin promotions fetch error:', error);
    return NextResponse.json(
      { error: '프로모션 목록을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const promotionData = await request.json();

    // 입력 검증
    if (!promotionData.name || !promotionData.type || !promotionData.startDate || !promotionData.endDate) {
      return NextResponse.json(
        { error: '필수 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 날짜 유효성 검증
    const startDate = new Date(promotionData.startDate);
    const endDate = new Date(promotionData.endDate);
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: '시작일은 종료일보다 이전이어야 합니다.' },
        { status: 400 }
      );
    }

    // 할인 값 검증
    if (promotionData.type === 'discount') {
      if (promotionData.discountType === 'percentage' && (promotionData.discountValue < 0 || promotionData.discountValue > 100)) {
        return NextResponse.json(
          { error: '퍼센트 할인은 0-100 사이의 값이어야 합니다.' },
          { status: 400 }
        );
      }
      
      if (promotionData.discountType === 'fixed' && promotionData.discountValue < 0) {
        return NextResponse.json(
          { error: '고정 할인 금액은 0 이상이어야 합니다.' },
          { status: 400 }
        );
      }
    }

    // 플래시 세일 검증
    if (promotionData.type === 'flash_sale') {
      if (!promotionData.flashSale || !promotionData.flashSale.originalPrice || !promotionData.flashSale.salePrice) {
        return NextResponse.json(
          { error: '플래시 세일 설정이 필요합니다.' },
          { status: 400 }
        );
      }
      
      if (promotionData.flashSale.originalPrice <= promotionData.flashSale.salePrice) {
        return NextResponse.json(
          { error: '원가가 세일가보다 높아야 합니다.' },
          { status: 400 }
        );
      }
    }

    // 프로모션 생성
    const promotion = new Promotion({
      ...promotionData,
      createdBy: decoded.id,
      startDate,
      endDate
    });

    await promotion.save();

    return NextResponse.json({
      success: true,
      message: '프로모션이 생성되었습니다.',
      promotion
    });

  } catch (error) {
    console.error('Admin promotion creation error:', error);
    return NextResponse.json(
      { error: '프로모션 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
