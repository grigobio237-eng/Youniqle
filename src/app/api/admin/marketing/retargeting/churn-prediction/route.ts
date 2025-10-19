import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { RetargetingSystem } from '@/lib/retargetingSystem';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const riskLevel = searchParams.get('riskLevel');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (userId) {
      // 특정 사용자 이탈 예측
      const prediction = await RetargetingSystem.predictChurn(userId);
      return NextResponse.json(prediction);
    } else {
      // 전체 사용자 이탈 예측 (샘플 데이터)
      const sampleData = Array.from({ length: limit }, (_, i) => {
        const churnProbability = Math.random();
        const riskLevels = ['low', 'medium', 'high', 'critical'];
        const riskLevel = churnProbability > 0.8 ? 'critical' : 
                         churnProbability > 0.6 ? 'high' : 
                         churnProbability > 0.3 ? 'medium' : 'low';
        
        return {
          userId: `user_${i + 1}`,
          churnProbability: Math.round(churnProbability * 100) / 100,
          riskLevel,
          factors: [
            {
              factor: 'inactivity',
              impact: Math.random() * 0.5 + 0.3,
              description: `마지막 활동으로부터 ${Math.floor(Math.random() * 60) + 1}일 경과`
            },
            {
              factor: 'low_purchase_frequency',
              impact: Math.random() * 0.4 + 0.2,
              description: '구매 빈도가 낮음'
            }
          ],
          recommendedActions: riskLevel === 'critical' ? 
            ['즉시 위백 캠페인 실행', '개인화된 할인 쿠폰 발송'] :
            riskLevel === 'high' ?
            ['리타겟팅 캠페인 실행', '관심 상품 추천 이메일 발송'] :
            ['뉴스레터 발송', '새로운 상품 소개'],
          lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          daysSinceLastActivity: Math.floor(Math.random() * 60) + 1,
          predictedChurnDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
        };
      });

      // 위험도별 통계
      const riskStats = sampleData.reduce((acc: any, user) => {
        const level = user.riskLevel;
        if (!acc[level]) {
          acc[level] = { count: 0, avgProbability: 0, totalProbability: 0 };
        }
        acc[level].count++;
        acc[level].totalProbability += user.churnProbability;
        acc[level].avgProbability = acc[level].totalProbability / acc[level].count;
        return acc;
      }, {});

      // 필터링 적용
      let filteredData = sampleData;
      if (riskLevel && riskLevel !== 'all') {
        filteredData = sampleData.filter(user => user.riskLevel === riskLevel);
      }

      return NextResponse.json({
        users: filteredData,
        riskStats,
        totalUsers: sampleData.length,
        filteredCount: filteredData.length,
        analysisDate: new Date()
      });
    }

  } catch (error) {
    console.error('Error predicting churn:', error);
    return NextResponse.json(
      { error: 'Failed to predict churn' },
      { status: 500 }
    );
  }
}














