import { NextRequest, NextResponse } from 'next/server';
import { InputValidator, commonSchemas } from '@/lib/validators';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import cache, { CacheKeys } from '@/lib/cache';
import { withRateLimit, rateLimiters } from '@/lib/rateLimiter';

async function getProductsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);

    const validator = new InputValidator(commonSchemas.productQuery);
    const validationResult = validator.validate(query);

    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: validationResult.errors.map(err => ({
            field: err.field,
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const validatedQuery = validationResult.sanitizedData;

    // 캐시 키 생성
    const cacheKey = CacheKeys.products(
      validatedQuery.page || 1,
      validatedQuery.limit || 20,
      {
        ...validatedQuery,
        pavilionFloorId: validatedQuery.pavilionFloorId || 'none'
      }
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
    const isAdmin = session?.user?.role === 'admin';
    const isPreview = isAdmin && searchParams.get('preview') === 'true';

    // Build filter object
    const filter: any = {};

    // 일반 사용자: 승인된 활성 상품만 노출
    // 관리자 프리뷰 모드가 아닌 경우 필터 적용
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
      // 기본값: 일반 상점에서는 펀딩 상품 제외 (isFunding이 true가 아닌 것들)
      filter.isFunding = { $ne: true };
    }

    // Pavilion Filter (Exclusivity)
    if (validatedQuery.pavilionFloorId) {
      filter.pavilionFloorId = validatedQuery.pavilionFloorId;
    } else {
      // 중요: pavilionFloorId가 명시되지 않은 일반 요청에서는 파빌리온 전용 상품을 제외함
      filter.pavilionFloorId = { $exists: false };
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

    // Transform _id to id for frontend compatibility
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

// Rate Limiting 적용 (분당 200회)
export const GET = withRateLimit(rateLimiters.search, getProductsHandler);


