import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import PostCareSurvey from '@/models/PostCareSurvey';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const survey = await PostCareSurvey.findById(params.id)
      .populate('user', 'name email image')
      .lean();

    if (!survey) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // 권한 확인: 본인의 리포트거나 관리자/네비게이터인 경우만 허용
    const isOwner = (survey.user as any)._id.toString() === (session.user as any).id;
    const isStaff = (session.user as any).role === 'admin' || (session.user as any).isNavigator;

    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ survey });

  } catch (error) {
    console.error('Failed to fetch post-care survey detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
