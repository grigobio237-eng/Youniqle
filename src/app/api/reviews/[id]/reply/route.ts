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
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: '답변 내용을 입력해주세요.' }, { status: 400 });
    }

    await connectDB();

    // 사용자 정보 조회
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 관리자 또는 파트너만 답변 가능
    if (!['admin', 'partner'].includes(user.role)) {
      return NextResponse.json({ 
        error: '관리자 또는 파트너만 답변할 수 있습니다.' 
      }, { status: 403 });
    }

    // 리뷰 조회
    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 답변 추가
    review.replies.push({
      userId: user._id,
      content: content.trim(),
      createdAt: new Date(),
    });

    await review.save();

    // 답변이 추가된 리뷰를 사용자 정보와 함께 조회
    const updatedReview = await Review.findById(reviewId)
      .populate('userId', 'name avatar')
      .populate('replies.userId', 'name avatar role');

    return NextResponse.json({ 
      message: '답변이 추가되었습니다.',
      review: updatedReview 
    });

  } catch (error) {
    console.error('리뷰 답변 작성 오류:', error);
    return NextResponse.json(
      { error: '리뷰 답변 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
