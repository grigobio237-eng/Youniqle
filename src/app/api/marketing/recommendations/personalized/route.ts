import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { RetargetingSystem } from '@/lib/retargetingSystem';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // JWT 토큰으로 사용자 인증
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다.' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userId = null;

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId') || userId;
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'all'; // all, product, content, campaign

    if (!requestedUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const recommendations = await RetargetingSystem.generatePersonalizedRecommendations(requestedUserId, limit);

    return NextResponse.json({
      success: true,
      recommendations,
      userId: requestedUserId,
      type,
      limit,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate personalized recommendations' },
      { status: 500 }
    );
  }
}

