import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { routineId } = await req.json();
    if (!routineId) {
      return NextResponse.json({ error: '루틴 ID가 필요합니다.' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Reset routines if it's a new day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = user.dailyStats?.lastResetDate ? new Date(user.dailyStats.lastResetDate) : null;
    
    if (!lastReset || lastReset < today) {
        user.dailyStats.completedRoutines = [];
        user.dailyStats.lastResetDate = new Date();
    }

    // Toggle routine
    const index = user.dailyStats.completedRoutines.indexOf(routineId);
    if (index === -1) {
        user.dailyStats.completedRoutines.push(routineId);
        // Award points if needed (e.g., 2pt per routine or 5pt for all 3)
        // For now, points are awarded via the checklist completion logic on frontend
    } else {
        user.dailyStats.completedRoutines.splice(index, 1);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      completedRoutines: user.dailyStats.completedRoutines
    });

  } catch (error: any) {
    console.error('Routine update error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
