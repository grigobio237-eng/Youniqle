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

    // 1. Pass 정보 확인 (기존에는 저장을 막았으나, 이제 이력 저장 자체는 허용하고 멤버십 여부는 메타데이터로만 활용할 수 있음)
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 2. 사용량 체크 및 포인트 소진 로직
    const { AccessControl, FEATURE_COSTS } = await import('@/lib/logic/access-control');
    await AccessControl.checkAndResetDailyStats(user);

    const body = await req.json();
    const { type, imageData, score, summary, metrics, usePoints } = body;

    const canUse = AccessControl.canUseFeature(user, 'scanner');
    const cost = FEATURE_COSTS.scanner;

    if (!canUse) {
        if (usePoints && user.points >= cost) {
            user.points -= cost;
            console.log(`[Scan Save] User ${userId} used ${cost} points for extra scan.`);
        } else {
            return NextResponse.json({ 
                error: '일일 무료 사용량을 초과했습니다.',
                code: 'LIMIT_EXCEEDED',
                pointsRequired: cost,
                currentPoints: user.points
            }, { status: 403 });
        }
    } else {
        if (!user.dailyStats) {
            user.dailyStats = { scannerCount: 0, diagnosisCount: 0, webtoonCount: 0, lastResetDate: new Date() };
        }
        user.dailyStats.scannerCount += 1;
    }

    // 3. 데이터 추출 (이미 body에서 추출함)

    if (!type) {
      return NextResponse.json({ error: '필수 데이터가 누락되었습니다.' }, { status: 400 });
    }

    // 3. 이미지 업로드 (데이터가 있을 경우에만 실행)
    let imageUrl = '';
    if (imageData && imageData.startsWith('data:image')) {
        const timestamp = Date.now();
        const storagePath = `scans/${userId}/${type.toLowerCase()}_${timestamp}.webp`;
        console.log(`[Scan Save] Uploading image for user ${userId}, type: ${type}`);
        imageUrl = await uploadImageToFirebase(imageData, storagePath);
    }

    // 4. 스캔 타임라인에 데이터 추가
    const newEntry = {
      type,
      imageUrl: imageUrl || (type === 'POST_OP' ? '' : undefined), // POST_OP는 사진 없어도 됨
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
