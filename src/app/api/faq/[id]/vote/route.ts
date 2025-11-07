import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FAQ from '@/models/FAQ';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// FAQ 도움이 됨/안됨 투표
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { id: faqId } = await params;
    const { helpful } = await request.json();

    if (typeof helpful !== 'boolean') {
      return NextResponse.json({ error: 'helpful 값이 올바르지 않습니다.' }, { status: 400 });
    }

    const faq = await FAQ.findById(faqId);

    if (!faq) {
      return NextResponse.json({ error: 'FAQ를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (helpful) {
      faq.helpful = (faq.helpful || 0) + 1;
    } else {
      faq.notHelpful = (faq.notHelpful || 0) + 1;
    }

    await faq.save();

    return NextResponse.json({
      success: true,
      message: '투표가 완료되었습니다.',
      data: {
        helpful: faq.helpful,
        notHelpful: faq.notHelpful,
      },
    });
  } catch (error: any) {
    console.error('FAQ 투표 오류:', error);
    return NextResponse.json(
      { error: error.message || '투표에 실패했습니다.' },
      { status: 500 }
    );
  }
}

