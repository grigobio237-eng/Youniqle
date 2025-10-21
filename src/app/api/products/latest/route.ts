import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';

// 최신 상품 조회 (신상품)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');
    const category = searchParams.get('category');

    await connectDB();

    let query: any = {
      status: 'active',
      approvalStatus: 'approved'
    };

    if (category) {
      query.category = category;
    }

    // 최신순으로 상품 조회
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        products,
        total: products.length
      }
    });

  } catch (error) {
    console.error('Latest products fetch error:', error);
    return NextResponse.json(
      { error: '최신 상품 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
