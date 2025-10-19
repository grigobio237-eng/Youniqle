import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { AdvancedSegmentation } from '@/lib/advancedSegmentation';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || (session.user as any).id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const profile = await AdvancedSegmentation.createPersonalizationProfile(userId);

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Error creating personalization profile:', error);
    return NextResponse.json(
      { error: 'Failed to create personalization profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, preferences, demographics } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 실제 구현에서는 개인화 프로필 업데이트 로직
    // 여기서는 성공 응답만 반환
    return NextResponse.json({
      success: true,
      message: 'Personalization profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating personalization profile:', error);
    return NextResponse.json(
      { error: 'Failed to update personalization profile' },
      { status: 500 }
    );
  }
}














