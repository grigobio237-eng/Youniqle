import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import SurveyResponse from '@/models/SurveyResponse';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: { shopId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.isNavigator && session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { shopId } = await params;
    await dbConnect();

    const responses = await SurveyResponse.find({ shopId });

    if (responses.length === 0) {
      return NextResponse.json({ 
        success: true, 
        stats: null,
        message: 'No leads found for this shop' 
      });
    }

    // 통계 계산 로직
    const getStats = (field: string) => {
      const counts: Record<string, number> = {};
      responses.forEach(r => {
        // @ts-ignore
        const val = r.answers[field];
        if (val) counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => ({ label, count }));
    };

    const stats = {
      totalLeads: responses.length,
      stressPoints: getStats('stressPoint'),
      priorities: getStats('priority'),
      interestAreas: getStats('interestArea'),
      budgets: getStats('budget'),
      disappointments: getStats('disappointment'),
      startMethods: getStats('startMethod'),
      recentLeads: responses.slice(-5).map(r => ({
        id: r._id,
        createdAt: r.createdAt,
        status: r.status
      }))
    };

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
