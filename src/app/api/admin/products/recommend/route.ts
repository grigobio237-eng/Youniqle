import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';

// 관리자 추천 상품 설정
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, featuredByAdmin, adminRecommendationReason } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 관리자 추천 설정 업데이트
    product.featuredByAdmin = featuredByAdmin || false;
    if (adminRecommendationReason) {
      product.adminRecommendationReason = adminRecommendationReason;
    }

    await product.save();

    return NextResponse.json({
      success: true,
      message: featuredByAdmin ? '상품이 관리자 추천으로 설정되었습니다.' : '관리자 추천이 해제되었습니다.',
      product: {
        _id: product._id,
        name: product.name,
        featuredByAdmin: product.featuredByAdmin,
        adminRecommendationReason: product.adminRecommendationReason
      }
    });

  } catch (error) {
    console.error('Admin product recommendation error:', error);
    return NextResponse.json(
      { error: '관리자 추천 설정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 관리자 추천 상품 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const featured = searchParams.get('featured');

    await connectDB();

    let query: any = {};
    if (featured !== null) {
      query.featuredByAdmin = featured === 'true';
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Admin recommended products fetch error:', error);
    return NextResponse.json(
      { error: '관리자 추천 상품 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
