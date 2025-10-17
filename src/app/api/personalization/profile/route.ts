import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PersonalizationEngine } from '@/lib/personalizationEngine';

// 사용자 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email || 'anonymous';

    const profile = await PersonalizationEngine.createOrUpdateUserProfile(userId);
    
    if (!profile) {
      // 익명 사용자에게는 기본 프로필 반환
      return NextResponse.json({
        success: true,
        data: {
          userId: 'anonymous',
          preferences: {
            uiPreferences: {
              layout: 'grid',
              theme: 'light',
              language: 'ko',
              fontSize: 'medium',
              showRecommendations: true,
              showReviews: true
            },
            productCategories: [],
            brands: [],
            priceRange: { min: 0, max: 1000000 }
          },
          interests: {
            categories: [],
            brands: [],
            priceRange: { min: 0, max: 1000000 }
          },
          behavior: {
            browsingHistory: [],
            purchaseHistory: [],
            searchHistory: []
          },
          metadata: {
            isAnonymous: true,
            createdAt: new Date(),
            lastActive: new Date()
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 사용자 프로필 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: '로그인이 필요합니다.' 
      }, { status: 401 });
    }

    const { preferences, interests, behavior } = await request.json();
    
    const updatedProfile = await PersonalizationEngine.updateUserProfile(
      session.user.email,
      { preferences, interests, behavior }
    );

    return NextResponse.json({
      success: true,
      data: updatedProfile
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}