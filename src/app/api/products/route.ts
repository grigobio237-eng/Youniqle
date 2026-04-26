import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import cache, { CacheKeys } from '@/lib/cache';
import { productQuerySchema } from '@/lib/schemas';
import { createErrorResponse } from '@/lib/serverErrorHandler';
import { withRateLimit, rateLimiters } from '@/lib/rateLimiter';

async function getProductsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);

    // Zod 검증 적용
    const validation = productQuerySchema.safeParse(query);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: '검색 조건이 유효하지 않습니다.',
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const validatedQuery = validation.data;

    // 캐시 키 생성
    const cacheKey = CacheKeys.products(
      validatedQuery.page || 1,
      validatedQuery.limit || 20,
      { ...validatedQuery }
    );

    // 캐시에서 데이터 조회
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      console.log('📖 상품 목록 캐시 히트');
      return NextResponse.json(cachedData);
    }

    await connectDB();

    // 세션 확인 (관리자 여부 체크)
    const { getServerSession } = await import('next-auth/next');
    const { authOptions } = await import('@/lib/auth');
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'superadmin';
    const isPreview = isAdmin && validatedQuery.preview;

    // Build filter object
    const filter: any = {};

    // 일반 사용자: 승인된 활성 상품만 노출
    if (!isPreview) {
      filter.status = 'active';
      filter.approvalStatus = 'approved';
    }

    if (validatedQuery.q || validatedQuery.search) {
      const searchTerm = validatedQuery.q || validatedQuery.search;
      filter.$text = { $search: searchTerm };
    }

    if (validatedQuery.category) {
      filter.category = validatedQuery.category;
    }

    // Funding Filter
    if (validatedQuery.isFunding !== undefined) {
      filter.isFunding = validatedQuery.isFunding;
    } else {
      filter.isFunding = { $ne: true };
    }

    // Build sort object
    let sort: any = { createdAt: -1 };
    switch (validatedQuery.sort) {
      case 'price_asc': sort = { price: 1 }; break;
      case 'price_desc': sort = { price: -1 }; break;
      case 'popular': sort = { createdAt: -1 }; break;
      case 'newest':
      default: sort = { createdAt: -1 }; break;
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

    // Transform _id to id
    const transformedProducts = products.map((product: any) => ({
      ...product,
      id: product._id,
    }));

    const responseData = {
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // 캐시에 저장 (30분)
    await cache.set(cacheKey, responseData, 1800);
    console.log('📝 상품 목록 캐시 저장');

    return NextResponse.json(responseData);
  } catch (error) {
    return createErrorResponse(error as Error, 500, request);
  }
}

// Rate Limiting 적용 (분당 200회)
export const GET = withRateLimit(rateLimiters.search, getProductsHandler);


