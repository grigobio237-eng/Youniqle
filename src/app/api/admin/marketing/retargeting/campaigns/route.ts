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
    if (!campaignData.name || !campaignData.type || !campaignData.content) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, content' },
        { status: 400 }
      );
    }

    // 사용자 ID 가져오기
    const user = await require('mongoose').model('User').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const campaignId = await RetargetingSystem.createRetargetingCampaign({
      ...campaignData,
      createdBy: user._id.toString()
    });

    return NextResponse.json({
      success: true,
      campaignId,
      message: 'Retargeting campaign created successfully'
    });

  } catch (error) {
    console.error('Error creating retargeting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create retargeting campaign' },
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

    // 실제 구현에서는 데이터베이스에서 리타겟팅 캠페인 조회
    const campaigns: any[] = [];

    return NextResponse.json({
      campaigns,
      total: campaigns.length,
      page,
      limit
    });

  } catch (error) {
    console.error('Error fetching retargeting campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch retargeting campaigns' },
      { status: 500 }
    );
  }
}
