import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { RetargetingSystem } from '@/lib/retargetingSystem';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cartData } = await request.json();

    if (!cartData) {
      return NextResponse.json({ error: 'Cart data is required' }, { status: 400 });
    }

    const userId = (session.user as any).id || session.user.email;
    await RetargetingSystem.handleAbandonedCart(userId, cartData);

    return NextResponse.json({
      success: true,
      message: 'Abandoned cart event processed successfully'
    });

  } catch (error) {
    console.error('Error handling abandoned cart:', error);
    return NextResponse.json(
      { error: 'Failed to handle abandoned cart' },
      { status: 500 }
    );
  }
}















