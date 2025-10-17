import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { AdvancedMarketingAutomation } from '@/lib/advancedMarketingAutomation';
import mongoose from 'mongoose';

const AutomationRuleModel = mongoose.models.AutomationRule || mongoose.model('AutomationRule', new mongoose.Schema({}));

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { userId, testMode = false } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid rule ID' }, { status: 400 });
    }

    const rule = await AutomationRuleModel.findById(id);
    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    if (rule.status !== 'active') {
      return NextResponse.json(
        { error: 'Rule is not active' },
        { status: 400 }
      );
    }

    // 테스트 모드가 아닌 경우 사용자 ID 필수
    if (!testMode && !userId) {
      return NextResponse.json(
        { error: 'User ID is required for execution' },
        { status: 400 }
      );
    }

    // 테스트 이벤트 생성
    const testEvent = {
      userId: userId || 'test-user',
      eventType: rule.trigger.eventType,
      timestamp: new Date(),
      metadata: {
        testMode: true,
        ruleId: id,
        ...rule.trigger.conditions.reduce((acc: any, condition: any) => {
          acc[condition.field] = condition.value;
          return acc;
        }, {})
      }
    };

    // 자동화 실행
    await AdvancedMarketingAutomation.addEvent(testEvent);

    return NextResponse.json({
      success: true,
      message: testMode ? 'Test execution completed' : 'Rule executed successfully',
      executionId: testEvent.metadata.sessionId || 'unknown'
    });

  } catch (error) {
    console.error('Error executing automation rule:', error);
    return NextResponse.json(
      { error: 'Failed to execute automation rule' },
      { status: 500 }
    );
  }
}











