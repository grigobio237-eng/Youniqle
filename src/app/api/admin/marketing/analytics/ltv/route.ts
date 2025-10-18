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
    const limit = parseInt(searchParams.get('limit') || '100');

    if (userId) {
      // 특정 사용자 LTV 분석
      const ltvAnalysis = await AdvancedSegmentation.calculateCustomerLTV(userId);
      return NextResponse.json(ltvAnalysis);
    } else {
      // 전체 사용자 LTV 분석 (샘플 데이터)
      const sampleData = Array.from({ length: limit }, (_, i) => {
        const totalRevenue = Math.floor(Math.random() * 5000000);
        const totalOrders = Math.floor(Math.random() * 100);
        const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
        const customerLifespan = Math.floor(Math.random() * 1000);
        const ltv = totalRevenue;
        const predictedLtv = Math.floor(ltv * (1 + Math.random() * 2));

        return {
          userId: `user_${i + 1}`,
          totalRevenue,
          totalOrders,
          averageOrderValue: avgOrderValue,
          customerLifespan,
          ltv,
          predictedLtv,
          segment: predictedLtv >= 1000000 ? 'VIP' : 
                  predictedLtv >= 500000 ? 'High Value' : 
                  predictedLtv >= 200000 ? 'Medium Value' : 
                  predictedLtv >= 100000 ? 'Low Value' : 'New Customer'
        };
      });

      // 세그먼트별 통계
      const segmentStats = sampleData.reduce((acc: any, user) => {
        const segment = user.segment;
        if (!acc[segment]) {
          acc[segment] = { 
            count: 0, 
            totalLTV: 0, 
            avgLTV: 0, 
            avgOrders: 0, 
            avgLifespan: 0 
          };
        }
        acc[segment].count++;
        acc[segment].totalLTV += user.ltv;
        acc[segment].avgOrders += user.totalOrders;
        acc[segment].avgLifespan += user.customerLifespan;
        return acc;
      }, {});

      // 평균 계산
      Object.keys(segmentStats).forEach(segment => {
        const stats = segmentStats[segment];
        stats.avgLTV = Math.round(stats.totalLTV / stats.count);
        stats.avgOrders = Math.round(stats.avgOrders / stats.count);
        stats.avgLifespan = Math.round(stats.avgLifespan / stats.count);
      });

      // 전체 통계
      const totalStats = {
        totalUsers: sampleData.length,
        totalLTV: sampleData.reduce((sum, user) => sum + user.ltv, 0),
        avgLTV: Math.round(sampleData.reduce((sum, user) => sum + user.ltv, 0) / sampleData.length),
        avgOrders: Math.round(sampleData.reduce((sum, user) => sum + user.totalOrders, 0) / sampleData.length),
        avgLifespan: Math.round(sampleData.reduce((sum, user) => sum + user.customerLifespan, 0) / sampleData.length)
      };

      return NextResponse.json({
        users: sampleData,
        segmentStats,
        totalStats,
        analysisDate: new Date()
      });
    }

  } catch (error) {
    console.error('Error calculating LTV:', error);
    return NextResponse.json(
      { error: 'Failed to calculate LTV' },
      { status: 500 }
    );
  }
}













