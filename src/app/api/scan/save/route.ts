import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { uploadImageToFirebase } from '@/lib/utils/firebase-storage';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: '사용자 ID를 찾을 수 없습니다.' }, { status: 400 });
    }

    // 1. Pass 정보 확인 (서버에서 다시 한 번 DB 조회하여 정확성 확보)
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const pass = user.passInfo;
    const isActivePass = pass && pass.status === 'ACTIVE' && pass.type !== 'NONE';

    if (!isActivePass) {
      return NextResponse.json({ 
        error: '스캔 타임라인 저장 권한이 없습니다. 유니클 Pass 회원이 되어보세요!',
        code: 'REQUIRE_MEMBERSHIP' 
      }, { status: 403 });
    }

    // 2. 데이터 추출
    const body = await req.json();
    const { type, imageData, score, summary, metrics } = body;

    if (!type || !imageData) {
      return NextResponse.json({ error: '필수 데이터가 누락되었습니다.' }, { status: 400 });
    }

    // 3. 이미지 Firebase Storage 업로드 (WebP 변환 로직 포함)
    const timestamp = Date.now();
    const storagePath = `scans/${userId}/${type.toLowerCase()}_${timestamp}.webp`;
    
    console.log(`[Scan Save] Uploading image for user ${userId}, type: ${type}`);
    const imageUrl = await uploadImageToFirebase(imageData, storagePath);

    // 4. 스캔 타임라인에 데이터 추가
    const newEntry = {
      type,
      imageUrl,
      score: score || 0,
      summary: summary || '',
      metrics: metrics || {},
      createdAt: new Date()
    };

    user.scanTimeline.push(newEntry);
    await user.save({ validateBeforeSave: false });

    return NextResponse.json({
      success: true,
      message: '스캔 타임라인에 성공적으로 기록되었습니다.',
      data: {
        imageUrl,
        createdAt: newEntry.createdAt
      }
    });

  } catch (error: any) {
    console.error('[Scan Save API] Critical Error:', error);
    return NextResponse.json({ 
        error: error.message || '데이터 저장 중 예기치 못한 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
