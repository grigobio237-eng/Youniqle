import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Content from '@/models/Content';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contentId } = await params;
    
    // 파트너 토큰 검증
    const token = request.cookies.get('partner-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '파트너 토큰이 필요합니다.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    await connectDB();

    // 콘텐츠 조회 및 권한 확인
    const content = await Content.findOne({ 
      _id: contentId, 
      partnerId: decoded.id 
    });

    if (!content) {
      return NextResponse.json(
        { error: '콘텐츠를 찾을 수 없거나 접근 권한이 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
    });

  } catch (error) {
    console.error('파트너 콘텐츠 조회 오류:', error);
    return NextResponse.json(
      { error: '콘텐츠 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contentId } = await params;
    
    // 파트너 토큰 검증
    const token = request.cookies.get('partner-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '파트너 토큰이 필요합니다.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, name: string };

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

    // 콘텐츠 조회 및 권한 확인
    const existingContent = await Content.findOne({ 
      _id: contentId, 
      partnerId: decoded.id 
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: '콘텐츠를 찾을 수 없거나 수정 권한이 없습니다.' },
        { status: 404 }
      );
    }

    // 상태 변경 시 publishedAt 업데이트
    const updateData: any = {
      title,
      description,
      content: content || '',
      platform: platform || 'community',
      type: type || 'text',
      url: url || '',
      thumbnail: thumbnail || '',
      images: images || [],
      videos: videos || [],
      status: status || 'draft',
      tags: tags || [],
      category,
      featured: featured || false,
      updatedAt: new Date(),
    };

    // 상태가 draft에서 published로 변경되거나 새로 발행하는 경우
    if (status === 'published' && existingContent.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    // 콘텐츠 수정
    const updatedContent = await Content.findByIdAndUpdate(
      contentId,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      message: '콘텐츠가 성공적으로 수정되었습니다.',
      content: {
        id: updatedContent._id.toString(),
        title: updatedContent.title,
        description: updatedContent.description,
        platform: updatedContent.platform,
        type: updatedContent.type,
        status: updatedContent.status,
        category: updatedContent.category,
        updatedAt: updatedContent.updatedAt,
      }
    });

  } catch (error) {
    console.error('파트너 콘텐츠 수정 오류:', error);
    return NextResponse.json(
      { error: '콘텐츠 수정에 실패했습니다.' },
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
    
    // 파트너 토큰 검증
    const token = request.cookies.get('partner-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '파트너 토큰이 필요합니다.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    await connectDB();

    // 콘텐츠 조회 및 권한 확인
    const content = await Content.findOne({ 
      _id: contentId, 
      partnerId: decoded.id 
    });

    if (!content) {
      return NextResponse.json(
        { error: '콘텐츠를 찾을 수 없거나 삭제 권한이 없습니다.' },
        { status: 404 }
      );
    }

    // 연관된 이미지 삭제 (Vercel Blob에서)
    if (content.images && content.images.length > 0) {
      try {
        for (const imageUrl of content.images) {
          // URL에서 파일명 추출
          const fileName = imageUrl.split('/').pop();
          if (fileName) {
            await fetch('/api/upload/delete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ fileName }),
            });
          }
        }
      } catch (error) {
        console.error('이미지 삭제 중 오류:', error);
        // 이미지 삭제 실패해도 콘텐츠는 삭제 진행
      }
    }

    // 콘텐츠 삭제
    await Content.findByIdAndDelete(contentId);

    return NextResponse.json({
      message: '콘텐츠가 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('파트너 콘텐츠 삭제 오류:', error);
    return NextResponse.json(
      { error: '콘텐츠 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}





