import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Content from '@/models/Content';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contentId } = await params;
    await connectDB();

    const content = await Content.findById(contentId);

    if (!content) {
      return NextResponse.json(
        { error: '콘텐츠를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const contentData = {
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
    };

    return NextResponse.json(contentData);

  } catch (error) {
    console.error('Admin content detail error:', error);
    return NextResponse.json(
      { error: '콘텐츠 정보를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contentId } = await params;
    const { action, data } = await request.json();

    await connectDB();

    const content = await Content.findById(contentId);
    if (!content) {
      return NextResponse.json(
        { error: '콘텐츠를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'update':
        // 콘텐츠 정보 업데이트
        if (data.title) content.title = data.title;
        if (data.description) content.description = data.description;
        if (data.content !== undefined) content.content = data.content;
        if (data.platform) content.platform = data.platform;
        if (data.type) content.type = data.type;
        if (data.url !== undefined) content.url = data.url;
        if (data.thumbnail !== undefined) content.thumbnail = data.thumbnail;
        if (data.images) content.images = data.images;
        if (data.videos) content.videos = data.videos;
        if (data.tags) content.tags = data.tags;
        if (data.category) content.category = data.category;
        if (data.status) content.status = data.status;
        break;

      case 'toggle-status':
        // 상태 토글
        if (content.status === 'published') {
          content.status = 'draft';
        } else if (content.status === 'draft') {
          content.status = 'published';
          content.publishedAt = new Date();
        }
        break;

      case 'toggle-featured':
        // 인기 설정 토글
        content.featured = !content.featured;
        break;

      case 'archive':
        // 보관
        content.status = 'archived';
        break;

      case 'add-views':
        // 조회수 증가
        content.views += data.views || 1;
        break;

      default:
        return NextResponse.json(
          { error: '알 수 없는 작업입니다.' },
          { status: 400 }
        );
    }

    await content.save();

    return NextResponse.json({
      message: '콘텐츠 정보가 업데이트되었습니다.',
      content: {
        id: content._id.toString(),
        title: content.title,
        status: content.status,
        featured: content.featured,
        views: content.views
      }
    });

  } catch (error) {
    console.error('Admin content update error:', error);
    return NextResponse.json(
      { error: '콘텐츠 정보 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contentId } = await params;
    await connectDB();

    const content = await Content.findById(contentId);
    if (!content) {
      return NextResponse.json(
        { error: '콘텐츠를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    await Content.findByIdAndDelete(contentId);

    return NextResponse.json({
      message: '콘텐츠가 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Admin content delete error:', error);
    return NextResponse.json(
      { error: '콘텐츠 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
