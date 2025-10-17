import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { NotificationService } from '@/lib/notificationService';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.type !== 'user') {
      return NextResponse.json(
        { error: '사용자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    await connectDB();

    const settings = await NotificationService.getNotificationSettings(decoded.id);

    if (!settings) {
      return NextResponse.json(
        { error: '알림 설정을 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ settings });

  } catch (error) {
    console.error('Get notification settings error:', error);
    return NextResponse.json(
      { error: '알림 설정을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.type !== 'user') {
      return NextResponse.json(
        { error: '사용자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    await connectDB();

    const settings = await request.json();

    // 설정 유효성 검증
    if (settings.channels) {
      const validFrequencies = ['immediate', 'daily', 'weekly', 'never'];
      const validTimezones = ['Asia/Seoul', 'UTC', 'America/New_York', 'Europe/London'];

      // 채널별 설정 검증
      for (const [channel, config] of Object.entries(settings.channels)) {
        if (config && typeof config === 'object') {
          if ((config as any).frequency && !validFrequencies.includes((config as any).frequency)) {
            return NextResponse.json(
              { error: `유효하지 않은 ${channel} 알림 빈도입니다.` },
              { status: 400 }
            );
          }

          if ((config as any).quietHours && (config as any).quietHours.timezone && !validTimezones.includes((config as any).quietHours.timezone)) {
            return NextResponse.json(
              { error: `유효하지 않은 ${channel} 타임존입니다.` },
              { status: 400 }
            );
          }

          if ((config as any).quietHours && (config as any).quietHours.start && (config as any).quietHours.end) {
            const startTime = (config as any).quietHours.start;
            const endTime = (config as any).quietHours.end;
            
            // 시간 형식 검증 (HH:MM)
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
              return NextResponse.json(
                { error: `잘못된 ${channel} 조용한 시간 형식입니다. (HH:MM)` },
                { status: 400 }
              );
            }
          }
        }
      }
    }

    // 알림 타입별 설정 검증
    if (settings.types) {
      const validTypes = ['order', 'payment', 'shipping', 'promotion', 'newsletter', 'system', 'marketing', 'partner', 'admin'];
      
      for (const [type, config] of Object.entries(settings.types)) {
        if (!validTypes.includes(type)) {
          return NextResponse.json(
            { error: `유효하지 않은 알림 타입입니다: ${type}` },
            { status: 400 }
          );
        }

        if (config && typeof config === 'object') {
          const validChannels = ['email', 'push', 'sms', 'inApp'];
          for (const [channel, enabled] of Object.entries(config)) {
            if (!validChannels.includes(channel)) {
              return NextResponse.json(
                { error: `유효하지 않은 알림 채널입니다: ${channel}` },
                { status: 400 }
              );
            }
            if (typeof enabled !== 'boolean') {
              return NextResponse.json(
                { error: `${type}.${channel}은 boolean 값이어야 합니다.` },
                { status: 400 }
              );
            }
          }
        }
      }
    }

    // 긴급 알림 설정 검증
    if (settings.urgentNotifications) {
      const validChannels = ['email', 'push', 'sms'];
      if (settings.urgentNotifications.channels) {
        for (const channel of settings.urgentNotifications.channels) {
          if (!validChannels.includes(channel)) {
            return NextResponse.json(
              { error: `유효하지 않은 긴급 알림 채널입니다: ${channel}` },
              { status: 400 }
            );
          }
        }
      }
    }

    // 알림 요약 설정 검증
    if (settings.digest) {
      const validFrequencies = ['daily', 'weekly'];
      if (settings.digest.frequency && !validFrequencies.includes(settings.digest.frequency)) {
        return NextResponse.json(
          { error: '유효하지 않은 알림 요약 빈도입니다.' },
          { status: 400 }
        );
      }

      if (settings.digest.time) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(settings.digest.time)) {
          return NextResponse.json(
            { error: '잘못된 알림 요약 시간 형식입니다. (HH:MM)' },
            { status: 400 }
          );
        }
      }

      if (settings.digest.types) {
        const validTypes = ['order', 'payment', 'shipping', 'promotion', 'newsletter', 'system', 'marketing', 'partner', 'admin'];
        for (const type of settings.digest.types) {
          if (!validTypes.includes(type)) {
            return NextResponse.json(
              { error: `유효하지 않은 알림 요약 타입입니다: ${type}` },
              { status: 400 }
            );
          }
        }
      }
    }

    const success = await NotificationService.updateNotificationSettings(decoded.id, settings);

    if (!success) {
      return NextResponse.json(
        { error: '알림 설정 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '알림 설정이 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('Update notification settings error:', error);
    return NextResponse.json(
      { error: '알림 설정 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
