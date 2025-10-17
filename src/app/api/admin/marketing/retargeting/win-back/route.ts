import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { RetargetingSystem } from '@/lib/retargetingSystem';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaignData = await request.json();

    // 필수 필드 검증
    if (!campaignData.name || !campaignData.targetSegments || !campaignData.offers) {
      return NextResponse.json(
        { error: 'Missing required fields: name, targetSegments, offers' },
        { status: 400 }
      );
    }

    const campaignId = await RetargetingSystem.createWinBackCampaign(campaignData);

    return NextResponse.json({
      success: true,
      campaignId,
      message: 'Win-back campaign created successfully'
    });

  } catch (error) {
    console.error('Error creating win-back campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create win-back campaign' },
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
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 실제 구현에서는 데이터베이스에서 위백 캠페인 조회
    const campaigns: any[] = [];

    return NextResponse.json({
      campaigns,
      total: campaigns.length,
      page,
      limit
    });

  } catch (error) {
    console.error('Error fetching win-back campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch win-back campaigns' },
      { status: 500 }
    );
  }
}
