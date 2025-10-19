import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

const AutomationRuleModel = mongoose.models.AutomationRule || mongoose.model('AutomationRule', new mongoose.Schema({}));

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y
    const ruleId = searchParams.get('ruleId');

    // 기간 계산
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // 기본 통계
    const totalRules = await AutomationRuleModel.countDocuments();
    const activeRules = await AutomationRuleModel.countDocuments({ status: 'active' });
    const inactiveRules = await AutomationRuleModel.countDocuments({ status: 'inactive' });
    const draftRules = await AutomationRuleModel.countDocuments({ status: 'draft' });

    // 기간별 통계
    const rulesInPeriod = await AutomationRuleModel.find({
      createdAt: { $gte: startDate }
    });

    // 이벤트 타입별 통계
    const eventTypeStats = await AutomationRuleModel.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$trigger.eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 액션 타입별 통계
    const actionTypeStats = await AutomationRuleModel.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$actions' },
      { $group: { _id: '$actions.type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 성과 통계 (실제 구현에서는 실행 로그에서 계산)
    const performanceStats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      topPerformingRules: [],
      recentExecutions: []
    };

    // 규칙별 상세 통계
    const ruleStats = await AutomationRuleModel.find({ status: 'active' })
      .select('name stats totalTriggers totalActions successRate lastTriggered')
      .sort({ 'stats.totalTriggers': -1 })
      .limit(10);

    // 시간대별 실행 통계 (실제 구현에서는 실행 로그에서 계산)
    const hourlyStats = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      executions: Math.floor(Math.random() * 100), // 임시 데이터
      successRate: Math.random() * 100
    }));

    // 요일별 실행 통계
    const dailyStats = Array.from({ length: 7 }, (_, i) => ({
      day: ['일', '월', '화', '수', '목', '금', '토'][i],
      executions: Math.floor(Math.random() * 200), // 임시 데이터
      successRate: Math.random() * 100
    }));

    return NextResponse.json({
      overview: {
        totalRules,
        activeRules,
        inactiveRules,
        draftRules,
        rulesCreatedInPeriod: rulesInPeriod.length
      },
      eventTypeStats,
      actionTypeStats,
      performanceStats,
      ruleStats,
      hourlyStats,
      dailyStats,
      period,
      startDate,
      endDate: now
    });

  } catch (error) {
    console.error('Error fetching automation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automation stats' },
      { status: 500 }
    );
  }
}














