import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { AdvancedSegmentation } from '@/lib/advancedSegmentation';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, rules, behavioralPatterns } = await request.json();

    if (!name || !rules || !Array.isArray(rules)) {
      return NextResponse.json(
        { error: 'Missing required fields: name, rules' },
        { status: 400 }
      );
    }

    const segmentId = await AdvancedSegmentation.createAdvancedSegment(
      name,
      description,
      rules,
      behavioralPatterns
    );

    return NextResponse.json({
      success: true,
      segmentId,
      message: 'Advanced segment created successfully'
    });

  } catch (error) {
    console.error('Error creating advanced segment:', error);
    return NextResponse.json(
      { error: 'Failed to create advanced segment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    // 실제 구현에서는 데이터베이스에서 고급 세그먼트 조회
    const segments: any[] = [];

    return NextResponse.json({
      segments,
      total: segments.length
    });

  } catch (error) {
    console.error('Error fetching advanced segments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advanced segments' },
      { status: 500 }
    );
  }
}
