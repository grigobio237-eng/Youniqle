import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { StorageService } from '@/lib/storage';

export const dynamic = 'force-dynamic';
// [Debug] Firebase 초기화 상태 체크용 주석 추가

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json({ error: '파일이 제공되지 않았습니다.' }, { status: 400 });
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: '파일 크기는 10MB를 초과할 수 없습니다.' }, { status: 400 });
    }

    // 허용된 파일 타입
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '지원되지 않는 파일 형식입니다.' }, { status: 400 });
    }

    // 파일 읽기
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // StorageService를 통한 업로드 (WebP 변환 포함)
    const result = await StorageService.uploadImage(buffer, {
      folder,
      filename: file.name,
      useFirebase: true // Firebase로 강제 전환
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.filename,
      originalSize: file.size,
      optimizedSize: result.size,
      type: 'image/webp',
      compressionRatio: Math.round((1 - result.size / file.size) * 100),
    });

  } catch (error: any) {
    console.error('File upload error detailed stack:', error);
    return NextResponse.json(
      { error: `파일 업로드 중 오류가 발생했습니다: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}


