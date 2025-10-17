// 헬스 체크 엔드포인트
import { NextRequest, NextResponse } from 'next/server';
import cache from '@/lib/cache';
import connectDB from '@/lib/db';

// 기본 헬스 체크
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 기본 상태 확인
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // 데이터베이스 연결 확인
    let database = { status: 'unknown', responseTime: 0 };
    try {
      const dbStartTime = Date.now();
      await connectDB();
      database = {
        status: 'healthy',
        responseTime: Date.now() - dbStartTime,
      };
    } catch (error) {
      const dbStartTime = Date.now();
      database = {
        status: 'unhealthy',
        responseTime: Date.now() - dbStartTime,
      };
      health.status = 'degraded';
    }

    // 캐시 상태 확인
    let cacheStatus = { status: 'unknown', responseTime: 0 };
    try {
      const cacheStartTime = Date.now();
      const stats = await cache.getStats();
      cacheStatus = {
        status: stats ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - cacheStartTime,
      };
    } catch (error) {
      const cacheStartTime = Date.now();
      cacheStatus = {
        status: 'unhealthy',
        responseTime: Date.now() - cacheStartTime,
      };
    }

    // 메모리 상태 확인
    const memUsage = process.memoryUsage();
    const memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
    };

    // 전체 응답 시간
    const totalResponseTime = Date.now() - startTime;

    // 최종 상태 결정
    if (database.status === 'unhealthy') {
      health.status = 'unhealthy';
    } else if (cacheStatus.status === 'unhealthy' || totalResponseTime > 5000) {
      health.status = 'degraded';
    }

    const response = {
      ...health,
      checks: {
        database,
        cache: cacheStatus,
        memory,
        responseTime: totalResponseTime,
      },
    };

    // 로그 기록 (간단한 콘솔 로그)
    console.log(`🏥 헬스 체크 완료: ${health.status} (${totalResponseTime}ms)`);

    return NextResponse.json(response, {
      status: health.status === 'unhealthy' ? 503 : 200,
    });

  } catch (error) {
    console.error('🏥 헬스 체크 실패:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: '헬스 체크 중 오류가 발생했습니다.',
      responseTime: Date.now() - startTime,
    }, { status: 503 });
  }
}

// 상세 헬스 체크 (관리자용)
export async function POST(request: NextRequest) {
  try {
    // 기본 헬스 체크와 동일하지만 더 상세한 정보 포함
    const startTime = Date.now();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // 메모리 상태 확인
    const memUsage = process.memoryUsage();
    const memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
    };

    const totalResponseTime = Date.now() - startTime;

    const response = {
      ...health,
      checks: {
        memory,
        responseTime: totalResponseTime,
      },
      detailed: true,
    };

    console.log(`🏥 상세 헬스 체크 완료: ${health.status} (${totalResponseTime}ms)`);

    return NextResponse.json(response, {
      status: health.status === 'unhealthy' ? 503 : 200,
    });
  } catch (error) {
    console.error('🏥 상세 헬스 체크 실패:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: '상세 헬스 체크 중 오류가 발생했습니다.',
    }, { status: 503 });
  }
}
