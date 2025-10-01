import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Content from '@/models/Content';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // 콘텐츠 조회
    const content = await Content.findById(id).lean() as any;

    if (!content) {
      return NextResponse.json(
        { success: false, error: '콘텐츠를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 조회수 증가 (선택적)
    await Content.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return NextResponse.json({
      success: true,
      content: {
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
        authorId: content.authorId,
        authorName: content.authorName,
        partnerId: content.partnerId,
        partnerName: content.partnerName,
        partnerEmail: content.partnerEmail,
        createdAt: content.createdAt,
        updatedAt: content.updatedAt,
      }
    });

  } catch (error) {
    console.error('Content Detail API Error:', error);
    return NextResponse.json(
      { success: false, error: '콘텐츠를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // 콘텐츠 업데이트
    const updatedContent = await Content.findByIdAndUpdate(
      id,
      body,
      { new: true }
    ).lean();

    if (!updatedContent) {
      return NextResponse.json(
        { success: false, error: '콘텐츠를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      content: updatedContent
    });

  } catch (error) {
    console.error('Content Update API Error:', error);
    return NextResponse.json(
      { success: false, error: '콘텐츠 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // 콘텐츠 삭제
    const deletedContent = await Content.findByIdAndDelete(id).lean();

    if (!deletedContent) {
      return NextResponse.json(
        { success: false, error: '콘텐츠를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '콘텐츠가 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Content Delete API Error:', error);
    return NextResponse.json(
      { success: false, error: '콘텐츠 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
