import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Question from '@/models/Question';
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

    const { id: questionId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: '답변 내용을 입력해주세요.' }, { status: 400 });
    }

    if (content.trim().length > 500) {
      return NextResponse.json({ error: '답변은 500자 이하로 입력해주세요.' }, { status: 400 });
    }

    await connectDB();

    // 사용자 정보 조회
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 문의 조회
    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 답변 권한 확인
    const isOfficial = ['admin', 'partner'].includes(user.role);
    
    // 일반 사용자는 본인 문의에만 답변 가능
    if (!isOfficial && question.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ 
        error: '본인의 문의에만 답변할 수 있습니다.' 
      }, { status: 403 });
    }

    // 답변 추가
    question.answers.push({
      userId: user._id,
      content: content.trim(),
      isOfficial,
      createdAt: new Date(),
    });

    // 문의 상태 업데이트
    if (isOfficial) {
      question.status = 'answered';
    }

    await question.save();

    // 답변이 추가된 문의를 사용자 정보와 함께 조회
    const updatedQuestion = await Question.findById(questionId)
      .populate('userId', 'name avatar')
      .populate('answers.userId', 'name avatar role');

    return NextResponse.json({ 
      message: '답변이 등록되었습니다.',
      question: updatedQuestion 
    });

  } catch (error) {
    console.error('답변 등록 오류:', error);
    return NextResponse.json(
      { error: '답변 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
