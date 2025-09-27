import { NextRequest, NextResponse } from 'next/server';
import { productQuerySchema } from '@/lib/validators';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    
    const validatedQuery = productQuerySchema.parse(query);
    
    await connectDB();

    // Build filter object
    const filter: any = { status: 'active' };
    
    if (validatedQuery.q) {
      filter.$text = { $search: validatedQuery.q };
    }
    
    if (validatedQuery.category) {
      filter.category = validatedQuery.category;
    }

    // Build sort object
    let sort: any = { createdAt: -1 }; // default: newest first
    
    switch (validatedQuery.sort) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'popular':
        // For now, sort by createdAt. Later can be enhanced with view counts
        sort = { createdAt: -1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
        break;
    }

    // Pagination
    const page = validatedQuery.page || 1;
    const limit = validatedQuery.limit || 20;
    const skip = (page - 1) * limit;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: '검색 조건을 확인해주세요.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


