import { NextRequest, NextResponse } from 'next/server';
import { PersonalizationInsight } from '@/models/Personalization';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 개인화 인사이트 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const insightType = searchParams.get('type');
    const impact = searchParams.get('impact');
    const isActionable = searchParams.get('actionable');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: any = {
      $or: [
        { userId: session.user.email },
        { segmentId: { $in: [] } } // 사용자가 속한 세그먼트
      ]
    };

    if (insightType) {
      query.insightType = insightType;
    }

    if (impact) {
      query.impact = impact;
    }

    if (isActionable !== null) {
      query.isActionable = isActionable === 'true';
    }

    const insights = await PersonalizationInsight.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Insights fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 인사이트 해결 표시
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { insightId, resolved } = await request.json();

    const insight = await PersonalizationInsight.findById(insightId);
    if (!insight) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 });
    }

    // 사용자 권한 확인
    if (insight.userId && insight.userId.toString() !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    insight.isResolved = resolved;
    if (resolved) {
      insight.resolvedAt = new Date();
    }

    await insight.save();

    return NextResponse.json({
      success: true,
      message: 'Insight status updated successfully'
    });

  } catch (error) {
    console.error('Insight update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
