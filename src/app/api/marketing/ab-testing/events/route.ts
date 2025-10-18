import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { AdvancedABTesting } from '@/lib/advancedABTesting';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId, eventType, metadata = {} } = await request.json();

    if (!testId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: testId, eventType' },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id || session.user.email;
    await AdvancedABTesting.recordEvent(testId, userId, eventType, metadata);

    return NextResponse.json({
      success: true,
      message: 'Event recorded successfully'
    });

  } catch (error) {
    console.error('Error recording A/B test event:', error);
    return NextResponse.json(
      { error: 'Failed to record event' },
      { status: 500 }
    );
  }
}













