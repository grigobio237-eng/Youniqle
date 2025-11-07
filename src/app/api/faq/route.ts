import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FAQ from '@/models/FAQ';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// FAQ 목록 조회 (사용자 + 관리자)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // 관리자용
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};

    // 사용자는 active만 볼 수 있음
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user && (session.user as any).role === 'admin';
    
    if (!isAdmin) {
      query.status = 'active';
    } else if (status) {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [faqs, total] = await Promise.all([
      FAQ.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .lean(),
      FAQ.countDocuments(query),
    ]);

    // 조회수 증가 (사용자만)
    if (!isAdmin && faqs.length > 0) {
      await FAQ.updateMany(
        { _id: { $in: faqs.map((f: any) => f._id) } },
        { $inc: { views: 1 } }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        faqs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('FAQ 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || 'FAQ 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// FAQ 생성 (관리자만)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { question, answer, category, order, status, tags } = await request.json();

    if (!question || !answer || !category) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
    }

    const faq = await FAQ.create({
      question,
      answer,
      category,
      order: order || 0,
      status: status || 'active',
      tags: tags || [],
      createdBy: (session.user as any).id,
    });

    return NextResponse.json({
      success: true,
      message: 'FAQ가 생성되었습니다.',
      data: faq,
    });
  } catch (error: any) {
    console.error('FAQ 생성 오류:', error);
    return NextResponse.json(
      { error: error.message || 'FAQ 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

