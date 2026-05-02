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

    // 4. 스캔 타임라인에 데이터 추가 (기존 호환성 유지)
    const newEntry = {
      type,
      imageUrl: imageUrl || (type === 'POST_OP' ? '' : undefined),
      score: score || 0,
      summary: summary || '',
      metrics: metrics || {},
      createdAt: new Date()
    };

    user.scanTimeline.push(newEntry);
    
    // 5. 새로운 LifeSnap DB 구조에 독립적으로 저장 (미래 마이페이지 아카이브용 확장)
    const LifeSnap = (await import('@/models/LifeSnap')).default;
    const snapCategory = ['MEAL', 'HYDRATION', 'SKIN', 'SLEEP', 'ACTIVITY', 'ROUTINE', 'BODY', 'MEDICAL_DOC', 'OTHER'].includes(type) ? type : 'OTHER';
    
    await LifeSnap.create({
        userId: user._id,
        category: snapCategory,
        imageUrl: imageUrl || '',
        score: score || 0,
        summary: summary || '',
        metrics: metrics || {},
        isMasked: type === 'MEDICAL_DOC' // 병원 서류인 경우 마스킹 처리 플래그
    });

    // 6. 게이미피케이션 (포인트 및 스트릭 보상)
    let rewardPoints = 0;
    let streakBonusPoints = 0;
    let gamificationMessage = '';
    let currentStreak = user.gamification?.currentStreak || 0;

    if (snapCategory !== 'OTHER') {
        if (!user.gamification) {
            user.gamification = { currentStreak: 0, highestStreak: 0, todayCategories: [] };
        }

        const now = new Date();
        const lastDate = user.gamification.lastSnapDate;
        let isSameDay = false;
        let isNextDay = false;

        if (lastDate) {
            const todayStr = now.toLocaleDateString();
            const lastStr = new Date(lastDate).toLocaleDateString();
            isSameDay = todayStr === lastStr;
            
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            isNextDay = yesterday.toLocaleDateString() === lastStr;
        }

        // 날짜가 바뀌었으면 카테고리 초기화
        if (!isSameDay) {
            user.gamification.todayCategories = [];
            
            if (isNextDay) {
                user.gamification.currentStreak += 1;
            } else if (!lastDate) { // 첫 기록
                user.gamification.currentStreak = 1;
            } else { // 이틀 이상 지남 (스트릭 끊김)
                user.gamification.currentStreak = 1;
            }

            if (user.gamification.currentStreak > user.gamification.highestStreak) {
                user.gamification.highestStreak = user.gamification.currentStreak;
            }
        }

        currentStreak = user.gamification.currentStreak;

        // 오늘 이미 이 카테고리로 보상을 받았는지 확인 (중복 보상 방지)
        if (!user.gamification.todayCategories.includes(snapCategory)) {
            user.gamification.todayCategories.push(snapCategory);
            
            // 포인트 차등 지급 (병원서류 10P, 일반 1P)
            rewardPoints = snapCategory === 'MEDICAL_DOC' ? 10 : 1;
            user.points += rewardPoints;
            gamificationMessage = snapCategory === 'MEDICAL_DOC' ? '🏥 병원서류 특별 보상 10P 적립!' : `✅ 기록 인증 1P 적립!`;
            
            // 스트릭 보너스 로직 (오늘 첫 적립일 때만 계산)
            if (user.gamification.todayCategories.length === 1) {
                 if (currentStreak > 0 && currentStreak % 30 === 0) {
                     streakBonusPoints = 100;
                     gamificationMessage = `🎉 30일 연속 달성! 보너스 100P 지급!`;
                 } else if (currentStreak > 0 && currentStreak % 7 === 0) {
                     streakBonusPoints = 10;
                     gamificationMessage = `🎉 7일 연속 달성! 보너스 10P 지급!`;
                 }
                 user.points += streakBonusPoints;
            }

            // 트랜잭션 기록
            const totalEarned = rewardPoints + streakBonusPoints;
            if (totalEarned > 0) {
                const PointTransaction = (await import('@/models/PointTransaction')).default;
                await PointTransaction.create({
                    userId: user._id,
                    type: 'earned',
                    amount: totalEarned,
                    description: `라이프 스냅 보상 (${snapCategory}) ${streakBonusPoints > 0 ? '+ 연속 기록 보너스' : ''}`,
                    balance: user.points
                });
            }
        }
        
        user.gamification.lastSnapDate = now;
    }

    // 최종 유저 데이터 저장 (스캔 타임라인 + 게이미피케이션 포인트 통합 저장)
    await user.save({ validateBeforeSave: false });

    return NextResponse.json({
      success: true,
      message: '스캔 타임라인에 성공적으로 기록되었습니다.',
      data: {
        imageUrl,
        gamification: {
            rewardPoints,
            streakBonusPoints,
            gamificationMessage,
            currentStreak,
            totalPoints: user.points
        },
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
