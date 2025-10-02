import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: '삭제할 파일 URL이 제공되지 않았습니다.' }, { status: 400 });
    }

    // Vercel Blob URL인지 확인
    if (!url.includes('blob.vercel-storage.com')) {
      return NextResponse.json({ error: '유효하지 않은 파일 URL입니다.' }, { status: 400 });
    }

    // 파일 삭제
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({
      success: true,
      message: '파일이 성공적으로 삭제되었습니다.',
    });

  } catch (error) {
    console.error('File delete error:', error);
    return NextResponse.json(
      { error: '파일 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}















