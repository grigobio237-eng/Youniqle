import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Question from '@/models/Question';
import Product from '@/models/Product';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!productId) {
      return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
    }

    await connectDB();

    const questions = await Question.find({ 
      productId,
      isPrivate: false // 공개 문의만 조회
    })
      .populate('userId', 'name avatar')
      .populate('answers.userId', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Question.countDocuments({ 
      productId,
      isPrivate: false 
    });

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('문의 조회 오류:', error);
    return NextResponse.json(
      { error: '문의 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, title, content, isPrivate } = body;

    if (!productId || !title || !content) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    if (title.length > 100) {
      return NextResponse.json({ error: '제목은 100자 이하로 입력해주세요.' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: '내용은 1000자 이하로 입력해주세요.' }, { status: 400 });
    }

    await connectDB();

    // 상품 존재 확인
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 사용자 정보 조회
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 문의 생성
    const question = new Question({
      productId,
      userId: user._id,
      title: title.trim(),
      content: content.trim(),
      isPrivate: isPrivate || false,
    });

    await question.save();

    // 생성된 문의를 사용자 정보와 함께 조회
    const savedQuestion = await Question.findById(question._id)
      .populate('userId', 'name avatar')
      .populate('answers.userId', 'name avatar role');

    return NextResponse.json({ 
      message: '문의가 등록되었습니다.',
      question: savedQuestion 
    }, { status: 201 });

  } catch (error) {
    console.error('문의 등록 오류:', error);
    return NextResponse.json(
      { error: '문의 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
