import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sharp from 'sharp';

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
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: '파일 크기는 10MB를 초과할 수 없습니다.' }, { status: 400 });
    }

    // 허용된 파일 타입
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '지원되지 않는 파일 형식입니다.' }, { status: 400 });
    }

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `${folder}/${fileName}`;

    // 이미지 최적화
    let optimizedBuffer: Buffer;
    let optimizedType: string;
    let optimizedSize: number;

    try {
      const imageBuffer = Buffer.from(await file.arrayBuffer());
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();

      // 이미지 크기 제한 (최대 2048px)
      const maxDimension = 2048;
      let width = metadata.width;
      let height = metadata.height;

      if (width && height) {
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            width = maxDimension;
            height = Math.round((metadata.height! * maxDimension) / metadata.width!);
          } else {
            height = maxDimension;
            width = Math.round((metadata.width! * maxDimension) / metadata.height!);
          }
        }
      }

      // 이미지 최적화 설정
      const optimizedImage = image
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 85,
          progressive: true,
          mozjpeg: true
        })
        .png({
          quality: 85,
          progressive: true,
          compressionLevel: 9
        })
        .webp({
          quality: 85,
          effort: 6
        });

      // 원본 파일 타입에 따라 최적화
      if (file.type === 'image/png') {
        optimizedBuffer = await optimizedImage.png().toBuffer();
        optimizedType = 'image/png';
      } else if (file.type === 'image/webp') {
        optimizedBuffer = await optimizedImage.webp().toBuffer();
        optimizedType = 'image/webp';
      } else {
        // JPEG, GIF, AVIF는 JPEG로 변환
        optimizedBuffer = await optimizedImage.jpeg().toBuffer();
        optimizedType = 'image/jpeg';
      }

      optimizedSize = optimizedBuffer.length;

      console.log(`이미지 최적화 완료: ${file.size} bytes → ${optimizedSize} bytes (${Math.round((1 - optimizedSize / file.size) * 100)}% 감소)`);

    } catch (error) {
      console.error('이미지 최적화 실패, 원본 파일 사용:', error);
      // 최적화 실패 시 원본 파일 사용
      optimizedBuffer = Buffer.from(await file.arrayBuffer());
      optimizedType = file.type;
      optimizedSize = file.size;
    }

    // Vercel Blob에 최적화된 파일 업로드
    const blob = await put(filePath, optimizedBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: fileName,
      originalSize: file.size,
      optimizedSize: optimizedSize,
      type: optimizedType,
      compressionRatio: Math.round((1 - optimizedSize / file.size) * 100),
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


