import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { AdvancedSegmentation } from '@/lib/advancedSegmentation';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '365');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (userId) {
      // 특정 사용자 RFM 분석
      const rfmAnalysis = await AdvancedSegmentation.performRFMAnalysis(userId, days);
      return NextResponse.json(rfmAnalysis);
    } else {
      // 전체 사용자 RFM 분석 (샘플 데이터)
      const sampleData = Array.from({ length: limit }, (_, i) => ({
        userId: `user_${i + 1}`,
        recency: Math.floor(Math.random() * 365),
        frequency: Math.floor(Math.random() * 50),
        monetary: Math.floor(Math.random() * 2000000),
        rfmScore: `${Math.floor(Math.random() * 5) + 1}${Math.floor(Math.random() * 5) + 1}${Math.floor(Math.random() * 5) + 1}`,
        segment: ['Champions', 'Loyal Customers', 'Potential Loyalists', 'New Customers', 'At Risk', 'Lost Customers'][Math.floor(Math.random() * 6)]
      }));

      // 세그먼트별 통계
      const segmentStats = sampleData.reduce((acc: any, user) => {
        const segment = user.segment;
        if (!acc[segment]) {
          acc[segment] = { count: 0, totalRevenue: 0, avgFrequency: 0, avgRecency: 0 };
        }
        acc[segment].count++;
        acc[segment].totalRevenue += user.monetary;
        acc[segment].avgFrequency += user.frequency;
        acc[segment].avgRecency += user.recency;
        return acc;
      }, {});

      // 평균 계산
      Object.keys(segmentStats).forEach(segment => {
        const stats = segmentStats[segment];
        stats.avgFrequency = Math.round(stats.avgFrequency / stats.count);
        stats.avgRecency = Math.round(stats.avgRecency / stats.count);
      });

      return NextResponse.json({
        users: sampleData,
        segmentStats,
        totalUsers: sampleData.length,
        analysisDate: new Date(),
        period: `${days} days`
      });
    }

  } catch (error) {
    console.error('Error performing RFM analysis:', error);
    return NextResponse.json(
      { error: 'Failed to perform RFM analysis' },
      { status: 500 }
    );
  }
}















