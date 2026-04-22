import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Notice from '@/models/Notice';
import { verifyAuth } from '@/lib/auth';

// 공지사항 목록 조회 (관리자)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') },
      ];
    }

    const notices = await Notice.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('authorId', 'name email')
      .lean();

    const total = await Notice.countDocuments(filter);

    // 통계
    const stats = await Notice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        stats,
      },
    });
  } catch (error: any) {
    console.error('Error fetching notices:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '공지사항 조회 실패' } },
      { status: 500 }
    );
  }
}

// 공지사항 생성 (관리자)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      title,
      content,
      summary,
      type,
      category,
      tags,
      isPinned,
      isImportant,
      isPopup,
      targetAudience,
      popupSettings,
      attachments,
      thumbnailImage,
      images,
      startDate,
      endDate,
      status,
    } = body;

    // 유효성 검사
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '제목과 내용은 필수입니다.' } },
        { status: 400 }
      );
    }

    // 공지사항 생성
    const notice = await Notice.create({
      title,
      content,
      summary,
      type: type || 'general',
      category,
      tags: tags || [],
      status: status || 'draft',
      isPinned: isPinned || false,
      isImportant: isImportant || false,
      isPopup: isPopup || false,
      targetAudience: targetAudience || 'all',
      popupSettings,
      authorId: user.id,
      authorName: user.name,
      attachments,
      thumbnailImage,
      images,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      publishedAt: status === 'published' ? new Date() : undefined,
    });

    return NextResponse.json({
      success: true,
      data: { notice },
      message: '공지사항이 생성되었습니다.',
    });
  } catch (error: any) {
    console.error('Error creating notice:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '공지사항 생성 실패' } },
      { status: 500 }
    );
  }
}



