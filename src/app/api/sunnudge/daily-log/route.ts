import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { SunNudgeDailyLog } from '@/models/SunNudgeDailyLog';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in first.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { activityType, firstApplyTime, didReapply, missedParts } = body;

    if (!activityType || !firstApplyTime || !didReapply) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // 포인트를 지급하는 가상의 로직 연동 가능
    const earnedPoints = 100;

    const newLog = await SunNudgeDailyLog.create({
      userId: session.user.id,
      activityType,
      firstApplyTime,
      didReapply,
      missedParts: missedParts || [],
      sunPointEarned: earnedPoints,
    });

    // TODO: (선택) 여기서 User DB의 points를 +100 업데이트 해주는 로직 추가 가능

    return NextResponse.json(
      {
        message: 'Daily sun check recorded successfully!',
        logId: newLog._id,
        pointsEarned: earnedPoints,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('SunNudge Daily Log API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while saving daily log' },
      { status: 500 }
    );
  }
}
