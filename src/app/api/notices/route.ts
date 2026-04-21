import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Notice from '@/models/Notice';

// 공지사항 목록 조회 (사용자)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // 필터 조건 (게시된 공지사항만)
    const filter: any = { status: 'published' };
    
    // 노출 기간 체크
    const now = new Date();
    filter.$or = [
      { startDate: { $exists: false }, endDate: { $exists: false } },
      { startDate: { $lte: now }, endDate: { $gte: now } },
      { startDate: { $lte: now }, endDate: { $exists: false } },
      { startDate: { $exists: false }, endDate: { $gte: now } },
    ];

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: new RegExp(search, 'i') },
          { content: new RegExp(search, 'i') },
          { summary: new RegExp(search, 'i') },
          { tags: new RegExp(search, 'i') },
        ],
      });
    }

    // 고정 공지사항 조회
    const pinnedNotices = await Notice.find({ ...filter, isPinned: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    // 일반 공지사항 조회
    const regularNotices = await Notice.find({ ...filter, isPinned: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const [total, typeCounts] = await Promise.all([
      Notice.countDocuments({ ...filter, isPinned: false }),
      Notice.aggregate([
        { $match: { ...filter, isPinned: false } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        pinnedNotices,
        notices: regularNotices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        summary: {
          typeCounts: typeCounts.reduce<Record<string, number>>((acc, item) => {
            acc[item._id as string] = item.count;
            return acc;
          }, {}),
        },
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



