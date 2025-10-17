import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ABTestAdvancedStats } from '@/lib/abTestAdvancedStats';
import ABTest from '@/models/ABTest';
import { connectDB } from '@/lib/db';

export async function GET(
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
    
    // 테스트 존재 확인
    const test = await ABTest.findById(id);
    if (!test) {
      return NextResponse.json({ error: 'A/B 테스트를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 고급 통계 계산
    const advancedStats = await ABTestAdvancedStats.calculateAdvancedStats(id);

    return NextResponse.json({
      success: true,
      data: advancedStats
    });

  } catch (error) {
    console.error('Advanced stats error:', error);
    return NextResponse.json(
      { error: '고급 통계 계산 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

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
    const { action } = await request.json();

    switch (action) {
      case 'auto_terminate':
        const terminated = await ABTestAdvancedStats.checkAutoTermination(id);
        return NextResponse.json({
          success: true,
          terminated,
          message: terminated ? '테스트가 자동으로 종료되었습니다.' : '자동 종료 조건을 만족하지 않습니다.'
        });

      case 'force_stop':
        await ABTest.findByIdAndUpdate(id, {
          status: 'completed',
          endDate: new Date()
        });
        return NextResponse.json({
          success: true,
          message: '테스트가 강제로 종료되었습니다.'
        });

      case 'extend_test':
        const { days } = await request.json();
        const test = await ABTest.findById(id);
        if (test && test.endDate) {
          const newEndDate = new Date(test.endDate);
          newEndDate.setDate(newEndDate.getDate() + days);
          await ABTest.findByIdAndUpdate(id, { endDate: newEndDate });
        }
        return NextResponse.json({
          success: true,
          message: `테스트가 ${days}일 연장되었습니다.`
        });

      default:
        return NextResponse.json({ error: '유효하지 않은 액션입니다.' }, { status: 400 });
    }

  } catch (error) {
    console.error('Advanced stats action error:', error);
    return NextResponse.json(
      { error: '액션 실행 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
