import { NextRequest, NextResponse } from 'next/server';
import { PersonalizationEngine } from '@/lib/personalizationEngine';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 개인화 추천 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const { itemType, limit, context, algorithms } = await request.json();

    const recommendationRequest = {
      userId: session?.user?.email || 'anonymous',
      itemType: itemType || 'product',
      limit: limit || 10,
      context: context || {},
      algorithms: algorithms || ['collaborative', 'content_based', 'popular']
    };

    const result = await PersonalizationEngine.generatePersonalizedRecommendations(recommendationRequest);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Recommendations generation error:', error);
    
    // 익명 사용자에게는 기본 추천 제공
    try {
      const fallbackResult = await PersonalizationEngine.generatePersonalizedRecommendations({
        userId: 'anonymous',
        itemType: 'product',
        limit: 10,
        context: { page: 'home' },
        algorithms: ['popular']
      });
      
      return NextResponse.json({
        success: true,
        data: fallbackResult,
        fallback: true
      });
    } catch (fallbackError) {
      console.error('Fallback recommendations error:', fallbackError);
      return NextResponse.json({ 
        error: 'Internal server error',
        fallback: false 
      }, { status: 500 });
    }
  }
}

// 추천 피드백 기록
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recommendationId, feedback, clicked, purchased } = await request.json();

    const { UserProfile } = await import('@/models/Personalization');
    const profile = await UserProfile.findOne({ userId: session.user.email });
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 추천 히스토리 업데이트
    const recommendation = profile.recommendationHistory.find((rec: any) => rec.recommendationId === recommendationId);
    if (recommendation) {
      if (feedback) recommendation.feedback = feedback;
      if (clicked !== undefined) recommendation.clicked = clicked;
      if (purchased !== undefined) recommendation.purchased = purchased;
    }

    await profile.save();

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully'
    });

  } catch (error) {
    console.error('Feedback recording error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
