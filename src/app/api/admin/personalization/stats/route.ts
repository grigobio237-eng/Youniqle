import { NextRequest, NextResponse } from 'next/server';
import { UserProfile, PersonalizationRule, PersonalizationExperiment } from '@/models/Personalization';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 개인화 통계 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 기본 통계
    const [
      totalUsers,
      personalizedUsers,
      activeRules,
      runningExperiments,
      averagePersonalizationScore
    ] = await Promise.all([
      UserProfile.countDocuments(),
      UserProfile.countDocuments({ 'personalizationScore.overall': { $gt: 0.3 } }),
      PersonalizationRule.countDocuments({ isActive: true }),
      PersonalizationExperiment.countDocuments({ status: 'running' }),
      UserProfile.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$personalizationScore.overall' } } }
      ])
    ]);

    // 성과가 좋은 규칙 (CTR 기준)
    const topPerformingRules = await PersonalizationRule.find({
      isActive: true,
      'effectiveness.impressions': { $gt: 100 }
    })
    .sort({ 'effectiveness.clickThroughRate': -1 })
    .limit(5)
    .select('name effectiveness');

    // 개인화 점수 분포
    const personalizationScoreDistribution = await UserProfile.aggregate([
      {
        $bucket: {
          groupBy: '$personalizationScore.overall',
          boundaries: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            avgScore: { $avg: '$personalizationScore.overall' }
          }
        }
      }
    ]);

    // 규칙별 성과
    const rulePerformance = await PersonalizationRule.aggregate([
      {
        $group: {
          _id: '$ruleType',
          count: { $sum: 1 },
          avgCTR: { $avg: '$effectiveness.clickThroughRate' },
          avgConversion: { $avg: '$effectiveness.conversionRate' },
          totalImpressions: { $sum: '$effectiveness.impressions' }
        }
      }
    ]);

    // 실험 성과
    const experimentPerformance = await PersonalizationExperiment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: '$experimentType',
          count: { $sum: 1 },
          avgUsers: { $avg: '$results.totalUsers' },
          avgConversion: { $avg: '$results.variantResults.conversionRate' }
        }
      }
    ]);

    // 최근 활동
    const recentActivity = await UserProfile.find()
      .sort({ 'metadata.lastActive': -1 })
      .limit(10)
      .select('userId personalizationScore.overall metadata.lastActive');

    const stats = {
      totalUsers,
      personalizedUsers,
      activeRules,
      runningExperiments,
      averagePersonalizationScore: averagePersonalizationScore[0]?.avgScore || 0,
      personalizationRate: totalUsers > 0 ? (personalizedUsers / totalUsers) * 100 : 0,
      topPerformingRules: topPerformingRules.map(rule => ({
        name: rule.name,
        clickThroughRate: rule.effectiveness.clickThroughRate,
        conversionRate: rule.effectiveness.conversionRate
      })),
      personalizationScoreDistribution,
      rulePerformance,
      experimentPerformance,
      recentActivity: recentActivity.map(profile => ({
        userId: profile.userId,
        personalizationScore: profile.personalizationScore.overall,
        lastActive: profile.metadata.lastActive
      }))
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Personalization stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
