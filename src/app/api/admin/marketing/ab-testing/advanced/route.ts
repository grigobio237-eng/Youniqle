import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { AdvancedABTesting } from '@/lib/advancedABTesting';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testData = await request.json();

    // 필수 필드 검증
    if (!testData.name || !testData.variants || !testData.metrics) {
      return NextResponse.json(
        { error: 'Missing required fields: name, variants, metrics' },
        { status: 400 }
      );
    }

    // 사용자 ID 가져오기
    const user = await require('mongoose').model('User').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const testId = await AdvancedABTesting.createMultivariateTest({
      ...testData,
      createdBy: user._id.toString()
    });

    return NextResponse.json({
      success: true,
      testId,
      message: 'Advanced A/B test created successfully'
    });

  } catch (error) {
    console.error('Error creating advanced A/B test:', error);
    return NextResponse.json(
      { error: 'Failed to create advanced A/B test' },
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
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 실제 구현에서는 데이터베이스에서 고급 A/B 테스트 조회
    const tests: any[] = [];

    return NextResponse.json({
      tests,
      total: tests.length,
      page,
      limit
    });

  } catch (error) {
    console.error('Error fetching advanced A/B tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advanced A/B tests' },
      { status: 500 }
    );
  }
}
