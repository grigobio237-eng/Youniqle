import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Content from '@/models/Content';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const platform = searchParams.get('platform') || 'all';
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || 'all';
    const sort = searchParams.get('sort') || 'newest';

    await connectDB();

    // 검색 조건 구성
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (platform !== 'all') {
      filter.platform = platform;
    }
    
    if (type !== 'all') {
      filter.type = type;
    }
    
    if (status !== 'all') {
      filter.status = status;
    }

    // 정렬 조건 구성
    let sortCondition: any = {};
    switch (sort) {
      case 'newest':
        sortCondition = { createdAt: -1 };
        break;
      case 'oldest':
        sortCondition = { createdAt: 1 };
        break;
      case 'views':
        sortCondition = { views: -1 };
        break;
      case 'likes':
        sortCondition = { likes: -1 };
        break;
      case 'title':
        sortCondition = { title: 1 };
        break;
      default:
        sortCondition = { createdAt: -1 };
    }

    // 콘텐츠 목록 조회
    const contents = await Content.find(filter)
      .sort(sortCondition)
      .limit(100);

    const contentsData = contents.map(content => ({
      id: content._id.toString(),
      title: content.title,
      description: content.description,
      content: content.content,
      platform: content.platform,
      type: content.type,
      url: content.url,
      thumbnail: content.thumbnail,
      images: content.images,
      videos: content.videos,
      views: content.views,
      likes: content.likes,
      comments: content.comments,
      publishedAt: content.publishedAt,
      status: content.status,
      tags: content.tags,
      category: content.category,
      featured: content.featured,
      authorName: content.authorName,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt
    }));

    return NextResponse.json({ contents: contentsData });

  } catch (error) {
    console.error('Admin content fetch error:', error);
    return NextResponse.json(
      { error: '콘텐츠 목록을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      title,
      description,
      content,
      platform,
      type,
      url,
      thumbnail,
      images,
      videos,
      tags,
      category,
      featured,
      status
    } = await request.json();

    // 필수 필드 검증
    if (!title || !description || !platform || !type || !category) {
      return NextResponse.json(
        { error: '필수 필드를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    await connectDB();

    // 새 콘텐츠 생성
    const newContent = new Content({
      title,
      description,
      content,
      platform,
      type,
      url,
      thumbnail,
      images: images || [],
      videos: videos || [],
      tags: tags || [],
      category,
      featured: featured || false,
      status: status || 'draft',
      publishedAt: new Date(),
      views: 0,
      likes: 0,
      comments: 0
    });

    await newContent.save();

    return NextResponse.json({
      message: '콘텐츠가 성공적으로 생성되었습니다.',
      content: {
        id: newContent._id.toString(),
        title: newContent.title,
        platform: newContent.platform,
        type: newContent.type,
        status: newContent.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Admin content create error:', error);
    return NextResponse.json(
      { error: '콘텐츠 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}














