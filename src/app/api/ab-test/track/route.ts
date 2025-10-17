import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ABTest from '@/models/ABTest';
import ABTestEvent from '@/models/ABTestEvent';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const data = await request.json();
    const { testId, variantName, eventType, eventValue, eventData, sessionId } = data;

    // 필수 필드 검증
    if (!testId || !variantName || !eventType || !sessionId) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // A/B 테스트 존재 확인
    const test = await ABTest.findById(testId);
    if (!test) {
      return NextResponse.json(
        { error: 'A/B 테스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 테스트가 실행 중인지 확인
    if (test.status !== 'running') {
      return NextResponse.json(
        { error: '실행 중인 테스트가 아닙니다.' },
        { status: 400 }
      );
    }

    // 변형 존재 확인
    const variant = test.variants.find((v: any) => v.name === variantName);
    if (!variant) {
      return NextResponse.json(
        { error: '유효하지 않은 변형입니다.' },
        { status: 400 }
      );
    }

    // 사용자 ID 추출 (선택적)
    let userId = null;
    const token = request.cookies.get('token')?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        if (decoded.type === 'user') {
          userId = decoded.id;
        }
      } catch (error) {
        // 토큰이 유효하지 않아도 계속 진행
      }
    }

    // 사용자 정보 조회 (사용자 ID가 있는 경우)
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }

    // 사용자 세그먼트 확인 (타겟 오디언스 필터링)
    if (test.targetAudience && user) {
      const targetAudience = test.targetAudience;
      
      // 나이 필터링
      if (targetAudience.minAge && user.age && user.age < targetAudience.minAge) {
        return NextResponse.json({ success: true, message: '타겟 오디언스에 해당하지 않습니다.' });
      }
      if (targetAudience.maxAge && user.age && user.age > targetAudience.maxAge) {
        return NextResponse.json({ success: true, message: '타겟 오디언스에 해당하지 않습니다.' });
      }

      // 성별 필터링
      if (targetAudience.gender && targetAudience.gender !== 'all' && user.gender !== targetAudience.gender) {
        return NextResponse.json({ success: true, message: '타겟 오디언스에 해당하지 않습니다.' });
      }

      // 신규/기존 사용자 필터링
      if (targetAudience.newUsers && user.createdAt) {
        const daysSinceRegistration = Math.ceil((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceRegistration > 30) { // 30일 이상이면 기존 사용자
          return NextResponse.json({ success: true, message: '타겟 오디언스에 해당하지 않습니다.' });
        }
      }
      if (targetAudience.returningUsers && user.createdAt) {
        const daysSinceRegistration = Math.ceil((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceRegistration <= 30) { // 30일 이하면 신규 사용자
          return NextResponse.json({ success: true, message: '타겟 오디언스에 해당하지 않습니다.' });
        }
      }
    }

    // 요청 정보 추출
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const referrer = request.headers.get('referer') || '';

    // UTM 파라미터 추출
    const url = new URL(request.url);
    const utmSource = url.searchParams.get('utm_source');
    const utmMedium = url.searchParams.get('utm_medium');
    const utmCampaign = url.searchParams.get('utm_campaign');

    // 디바이스 타입 감지
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/iPad|Tablet/.test(userAgent)) {
      deviceType = 'tablet';
    }

    // 브라우저 및 OS 정보 추출 (간단한 방법)
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                   userAgent.includes('Firefox') ? 'Firefox' :
                   userAgent.includes('Safari') ? 'Safari' :
                   userAgent.includes('Edge') ? 'Edge' : 'Other';

    const os = userAgent.includes('Windows') ? 'Windows' :
              userAgent.includes('Mac') ? 'macOS' :
              userAgent.includes('Linux') ? 'Linux' :
              userAgent.includes('Android') ? 'Android' :
              userAgent.includes('iOS') ? 'iOS' : 'Other';

    // 이벤트 생성
    const event = new ABTestEvent({
      testId,
      userId: userId || new mongoose.Types.ObjectId(), // 사용자 ID가 없으면 임시 ID 생성
      sessionId,
      variantName,
      eventType,
      eventValue,
      eventData,
      userAgent,
      ipAddress,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      deviceType,
      browser,
      os,
      timestamp: new Date()
    });

    await event.save();

    // A/B 테스트의 현재 샘플 크기 업데이트
    await ABTest.findByIdAndUpdate(testId, {
      $inc: { currentSampleSize: 1 }
    });

    return NextResponse.json({
      success: true,
      message: '이벤트가 추적되었습니다.',
      eventId: event._id
    });

  } catch (error) {
    console.error('AB test event tracking error:', error);
    return NextResponse.json(
      { error: '이벤트 추적에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 사용자별 변형 할당 API
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!testId || (!userId && !sessionId)) {
      return NextResponse.json(
        { error: '테스트 ID와 사용자 ID 또는 세션 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // A/B 테스트 조회
    const test = await ABTest.findById(testId);
    if (!test || test.status !== 'running') {
      return NextResponse.json(
        { error: '실행 중인 A/B 테스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 기존 할당 확인
    let existingAssignment = null;
    if (userId) {
      existingAssignment = await ABTestEvent.findOne({
        testId,
        userId,
        eventType: 'view'
      });
    } else if (sessionId) {
      existingAssignment = await ABTestEvent.findOne({
        testId,
        sessionId,
        eventType: 'view'
      });
    }

    if (existingAssignment) {
      return NextResponse.json({
        success: true,
        variant: existingAssignment.variantName,
        isNewAssignment: false
      });
    }

    // 변형 할당 (가중치 기반)
    const variant = assignVariant(test.variants);
    
    // 할당 이벤트 기록
    const assignmentEvent = new ABTestEvent({
      testId,
      userId: userId ? new mongoose.Types.ObjectId(userId) : new mongoose.Types.ObjectId(),
      sessionId: sessionId || `session_${Date.now()}_${Math.random()}`,
      variantName: variant.name,
      eventType: 'view',
      deviceType: 'desktop', // 기본값
      timestamp: new Date()
    });

    await assignmentEvent.save();

    return NextResponse.json({
      success: true,
      variant: variant.name,
      isNewAssignment: true,
      sessionId: assignmentEvent.sessionId
    });

  } catch (error) {
    console.error('Variant assignment error:', error);
    return NextResponse.json(
      { error: '변형 할당에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 가중치 기반 변형 할당 함수
function assignVariant(variants: any[]): any {
  const random = Math.random() * 100;
  let cumulativeWeight = 0;

  for (const variant of variants) {
    cumulativeWeight += variant.weight;
    if (random <= cumulativeWeight) {
      return variant;
    }
  }

  // 마지막 변형 반환 (안전장치)
  return variants[variants.length - 1];
}
