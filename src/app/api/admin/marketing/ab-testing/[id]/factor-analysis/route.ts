import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { AdvancedABTesting } from '@/lib/advancedABTesting';

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

    if (!require('mongoose').Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid test ID' }, { status: 400 });
    }

    const factorAnalysis = await AdvancedABTesting.performFactorAnalysis(id);

    return NextResponse.json({
      success: true,
      factorAnalysis,
      message: 'Factor analysis completed successfully'
    });

  } catch (error) {
    console.error('Error performing factor analysis:', error);
    return NextResponse.json(
      { error: 'Failed to perform factor analysis' },
      { status: 500 }
    );
  }
}















