import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Content from '@/models/Content';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function GET(request: NextRequest) {
  try {
    // 파트너 토큰 검증
    const token = request.cookies.get('partner-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '파트너 토큰이 필요합니다.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    await connectDB();

    // URL 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const platform = searchParams.get('platform');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'newest';

    // 쿼리 조건 구성
    const query: any = { partnerId: decoded.id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (platform && platform !== 'all') {
      query.platform = platform;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    // 정렬 조건
    let sortCondition: any = { createdAt: -1 };
    switch (sort) {
      case 'oldest':
        sortCondition = { createdAt: 1 };
        break;
      case 'views':
        sortCondition = { views: -1 };
        break;
      case 'likes':
        sortCondition = { likes: -1 };
        break;
      case 'newest':
      default:
        sortCondition = { createdAt: -1 };
        break;
    }

    // 파트너의 콘텐츠만 조회
    const contents = await Content.find(query)
      .sort(sortCondition)
      .limit(100);

    return NextResponse.json({
      contents: contents.map(content => ({
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
        createdAt: content.createdAt,
        updatedAt: content.updatedAt,
      }))
    });

  } catch (error) {
    console.error('파트너 콘텐츠 조회 오류:', error);
    return NextResponse.json(
      { error: '콘텐츠 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 파트너 토큰 검증
    const token = request.cookies.get('partner-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '파트너 토큰이 필요합니다.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, email: string, name: string };

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
      status,
      tags,
      category,
      featured
    } = await request.json();

    // 필수 필드 검증
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: '제목, 설명, 카테고리는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    await connectDB();

    // 파트너 정보 조회
    const User = (await import('@/models/User')).default;
    const partner = await User.findById(decoded.id);
    const partnerEmail = partner?.email || '';
    const partnerName = partner?.name || decoded.name;

    // YouTube 썸네일 자동 추출 함수
    const getYouTubeThumbnail = (url: string) => {
      if (!url) return '';
      
      const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      
      return '';
    };

    // 썸네일 자동 추출
    const extractedThumbnail = thumbnail || (url ? getYouTubeThumbnail(url) : '');

    // 새 콘텐츠 생성
    const newContent = new Content({
      title,
      description,
      content: content || '',
      platform: platform || 'video', // 동영상 콘텐츠 기본값
      type: type || 'link',
      url: url || '',
      thumbnail: extractedThumbnail,
      images: images || [],
      videos: videos || [],
      views: 0,
      likes: 0,
      comments: 0,
      publishedAt: new Date(), // 파트너 콘텐츠는 등록 즉시 발행
      status: 'published', // 파트너 콘텐츠는 자동으로 발행 상태로 설정
      tags: tags || [],
      category,
      featured: featured || false,
      partnerId: decoded.id,
      partnerName,
      partnerEmail,
    });

    await newContent.save();

    return NextResponse.json({
      message: '콘텐츠가 성공적으로 등록되었습니다.',
      content: {
        id: newContent._id.toString(),
        title: newContent.title,
        description: newContent.description,
        platform: newContent.platform,
        type: newContent.type,
        status: newContent.status,
        category: newContent.category,
        createdAt: newContent.createdAt,
      }
    });

  } catch (error) {
    console.error('파트너 콘텐츠 등록 오류:', error);
    return NextResponse.json(
      { error: '콘텐츠 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}


