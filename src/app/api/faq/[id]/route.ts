import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FAQ from '@/models/FAQ';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// FAQ 수정 (관리자만)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { id: faqId } = await params;
    const { question, answer, category, order, status, tags } = await request.json();

    const faq = await FAQ.findById(faqId);

    if (!faq) {
      return NextResponse.json({ error: 'FAQ를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (category !== undefined) faq.category = category;
    if (order !== undefined) faq.order = order;
    if (status !== undefined) faq.status = status;
    if (tags !== undefined) faq.tags = tags;
    faq.updatedBy = (session.user as any).id;

    await faq.save();

    return NextResponse.json({
      success: true,
      message: 'FAQ가 수정되었습니다.',
      data: faq,
    });
  } catch (error: any) {
    console.error('FAQ 수정 오류:', error);
    return NextResponse.json(
      { error: error.message || 'FAQ 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// FAQ 삭제 (관리자만)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { id: faqId } = await params;

    const faq = await FAQ.findByIdAndDelete(faqId);

    if (!faq) {
      return NextResponse.json({ error: 'FAQ를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ가 삭제되었습니다.',
    });
  } catch (error: any) {
    console.error('FAQ 삭제 오류:', error);
    return NextResponse.json(
      { error: error.message || 'FAQ 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

