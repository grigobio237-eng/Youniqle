import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { RecommendationEngine } from '@/lib/recommendationEngine';
import jwt from 'jsonwebtoken';
import cache, { CacheKeys } from '@/lib/cache';
import { withRateLimit, rateLimiters } from '@/lib/rateLimiter';

async function getRecommendationsHandler(request: NextRequest) {
  try {
    await connectDB();
    
    // 인증 확인 (선택적)
    const token = request.cookies.get('token')?.value;
    let userId = null;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        userId = decoded.userId;
      } catch (error) {
        // 토큰이 유효하지 않으면 익명 사용자로 처리
        console.log('Invalid token, proceeding as anonymous user');
      }
    }

    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get('itemType') as 'product' | 'content' | 'category' | 'brand' || 'product';
    const algorithm = searchParams.get('algorithm') || 'personalized';
    const limit = parseInt(searchParams.get('limit') || '10');
    const excludeIds = searchParams.get('excludeIds')?.split(',') || [];
    const pageUrl = searchParams.get('pageUrl');
    const sessionId = searchParams.get('sessionId');
    const deviceType = searchParams.get('deviceType') as 'desktop' | 'mobile' | 'tablet' || 'desktop';

    // 캐시 키 생성
    const cacheKey = CacheKeys.recommendations(
      userId || 'anonymous', 
      itemType, 
      limit
    );

    // 캐시에서 데이터 조회
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      console.log('📖 추천 결과 캐시 히트');
      return NextResponse.json(cachedData);
    }

    const requestData = {
      userId: userId,
      itemType,
      limit,
      excludeIds,
      context: {
        pageUrl: pageUrl || undefined,
        sessionId: sessionId || undefined,
        deviceType
      }
    };

    let recommendations;

    // 알고리즘에 따른 추천 생성
    switch (algorithm) {
      case 'collaborative':
        recommendations = await RecommendationEngine.getCollaborativeRecommendations(requestData);
        break;
      case 'content_based':
        recommendations = await RecommendationEngine.getContentBasedRecommendations(requestData);
        break;
      case 'hybrid':
        recommendations = await RecommendationEngine.getHybridRecommendations(requestData);
        break;
      case 'popular':
        recommendations = await RecommendationEngine.getPopularRecommendations(requestData);
        break;
      case 'trending':
        recommendations = await RecommendationEngine.getTrendingRecommendations(requestData);
        break;
      case 'frequently_bought_together':
        recommendations = await RecommendationEngine.getFrequentlyBoughtTogetherRecommendations(requestData);
        break;
      case 'recently_viewed':
        recommendations = await RecommendationEngine.getRecentlyViewedRecommendations(requestData);
        break;
      case 'personalized':
      default:
        recommendations = await RecommendationEngine.getPersonalizedRecommendations(requestData);
        break;
    }

    const responseData = {
      success: true,
      data: {
        recommendations,
        algorithm,
        itemType,
        count: recommendations.length,
        generatedAt: new Date().toISOString()
      }
    };

    // 캐시에 저장 (30분)
    await cache.set(cacheKey, responseData, 1800);
    console.log('📝 추천 결과 캐시 저장');

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Recommendation fetch error:', error);
    return NextResponse.json(
      { error: '추천을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

// Rate Limiting 적용 (분당 50회)
export const GET = withRateLimit(rateLimiters.recommendations, getRecommendationsHandler);

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // NextAuth 세션으로 사용자 인증 (선택적)
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    const session = await getServerSession(authOptions);
    
    let userId = null;
    if (session?.user?.email) {
      const { default: User } = await import('@/models/User');
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        userId = user._id.toString();
      }
    }

    const { 
      itemId, 
      itemType, 
      eventType, 
      itemData, 
      context 
    } = await request.json();

    // 필수 필드 검증
    if (!itemId || !itemType || !eventType) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 사용자 행동 데이터 저장
    const behaviorData = {
      userId: userId || 'anonymous',
      sessionId: context?.sessionId || 'unknown',
      eventType,
      itemId,
      itemType,
      itemData,
      context: {
        pageUrl: context?.pageUrl || 'unknown',
        referrer: context?.referrer,
        userAgent: context?.userAgent || 'unknown',
        deviceType: context?.deviceType || 'desktop',
        screenResolution: context?.screenResolution,
        language: context?.language || 'ko',
        timezone: context?.timezone || 'Asia/Seoul'
      },
      behaviorData: {
        duration: context?.duration,
        scrollDepth: context?.scrollDepth,
        clickPosition: context?.clickPosition,
        searchQuery: context?.searchQuery,
        filterCriteria: context?.filterCriteria,
        sortCriteria: context?.sortCriteria,
        quantity: context?.quantity,
        value: context?.value
      },
      metadata: {
        source: 'web',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production'
      }
    };

    // UserBehavior 모델을 사용하여 데이터 저장
    const { default: UserBehavior } = await import('@/models/UserBehavior');
    const behavior = new UserBehavior(behaviorData);
    await behavior.save();

    return NextResponse.json({
      success: true,
      message: '사용자 행동이 기록되었습니다.'
    });

  } catch (error) {
    console.error('Behavior tracking error:', error);
    return NextResponse.json(
      { error: '사용자 행동 기록에 실패했습니다.' },
      { status: 500 }
    );
  }
}
