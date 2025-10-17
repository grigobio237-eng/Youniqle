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

    const { testId, userSegments = [] } = await request.json();

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 });
    }

    const userId = (session.user as any).id || session.user.email;
    const variantId = await AdvancedABTesting.assignParticipant(testId, userId, userSegments);

    if (!variantId) {
      return NextResponse.json({
        assigned: false,
        message: 'User not assigned to test'
      });
    }

    return NextResponse.json({
      assigned: true,
      testId,
      variantId,
      userId
    });

  } catch (error) {
    console.error('Error assigning participant to A/B test:', error);
    return NextResponse.json(
      { error: 'Failed to assign participant' },
      { status: 500 }
    );
  }
}











