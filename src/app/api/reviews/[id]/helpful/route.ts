import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';
import User from '@/models/User';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { id: reviewId } = await params;

    await connectDB();

    // 리뷰 조회
    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }
    const userId = user._id.toString();

    // 이미 도움됨을 눌렀는지 확인
    const hasVoted = review.helpfulUsers.includes(userId);

    if (hasVoted) {
      // 이미 투표한 경우 취소
      review.helpfulUsers = review.helpfulUsers.filter(
        (id: any) => id.toString() !== userId
      );
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      // 투표 추가
      review.helpfulUsers.push(userId);
      review.helpfulCount += 1;
    }

    await review.save();

    return NextResponse.json({ 
      message: hasVoted ? '도움됨을 취소했습니다.' : '도움됨을 추가했습니다.',
      helpfulCount: review.helpfulCount,
      hasVoted: !hasVoted
    });

  } catch (error) {
    console.error('도움됨 투표 오류:', error);
    return NextResponse.json(
      { error: '도움됨 투표 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
