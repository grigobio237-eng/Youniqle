import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Content from '@/models/Content';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const filter: any = { status: 'published' };
    
    if (platform) {
      filter.platform = platform;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }

    // 콘텐츠 조회
    const contents = await Content.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 전체 개수 조회
    const total = await Content.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: contents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Content API Error:', error);
    return NextResponse.json(
      { success: false, error: '콘텐츠를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      platform,
      url,
      thumbnail,
      views = 0,
      likes = 0,
      publishedAt,
      tags = [],
      category,
      featured = false
    } = body;

    // 필수 필드 검증
    if (!title || !description || !platform || !url || !publishedAt || !category) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 새 콘텐츠 생성
    const content = new Content({
      title,
      description,
      platform,
      url,
      thumbnail,
      views,
      likes,
      publishedAt: new Date(publishedAt),
      tags,
      category,
      featured
    });

    await content.save();

    return NextResponse.json({
      success: true,
      data: content,
      message: '콘텐츠가 성공적으로 생성되었습니다.'
    });

  } catch (error) {
    console.error('Content Creation Error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: '입력 데이터가 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '콘텐츠 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
