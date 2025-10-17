import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SecurityLogger } from '@/lib/security';
import { PerformanceMonitor } from '@/lib/performanceMonitor';
import { getCacheManager } from '@/lib/cache';
import { getDatabaseOptimizer } from '@/lib/dbOptimizer';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 보안 로그 조회
    const securityLogger = SecurityLogger.getInstance();
    const securityLogs = securityLogger.getLogs(undefined, 50);

    // 성능 모니터링 데이터 조회
    const performanceMonitor = PerformanceMonitor.getInstance();
    const performanceData = await performanceMonitor.getDashboardData();

    // 캐시 상태 조회
    const cacheManager = getCacheManager();
    const cacheStats = await cacheManager.getStats();

    // 데이터베이스 상태 조회
    const dbOptimizer = getDatabaseOptimizer();
    const dbStats = await dbOptimizer.getPerformanceMetrics();

    // 보안 이벤트 통계
    const securityStats = {
      totalEvents: securityLogs.length,
      violations: securityLogs.filter(log => log.type === 'security_violation').length,
      rateLimits: securityLogs.filter(log => log.type === 'rate_limit').length,
      invalidAuth: securityLogs.filter(log => log.type === 'invalid_auth').length,
      suspiciousActivity: securityLogs.filter(log => log.type === 'suspicious_activity').length
    };

    // 최근 보안 이벤트 (최근 24시간)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSecurityEvents = securityLogs.filter(log => 
      log.timestamp >= last24Hours
    );

    // IP별 보안 이벤트 통계
    const ipStats = recentSecurityEvents.reduce((acc, log) => {
      const ip = log.ip;
      if (!acc[ip]) {
        acc[ip] = { count: 0, types: new Set() };
      }
      acc[ip].count++;
      acc[ip].types.add(log.type);
      return acc;
    }, {} as Record<string, { count: number; types: Set<string> }>);

    const topSuspiciousIPs = Object.entries(ipStats)
      .map(([ip, stats]) => ({
        ip,
        count: stats.count,
        types: Array.from(stats.types)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 성능 알림 요약
    const criticalAlerts = performanceData.alerts.filter(alert => 
      alert.severity === 'critical'
    ).length;

    const highAlerts = performanceData.alerts.filter(alert => 
      alert.severity === 'high'
    ).length;

    // 시스템 상태 요약
    const systemHealth = {
      status: 'healthy' as 'healthy' | 'warning' | 'critical',
      issues: [] as string[]
    };

    // 에러율 체크
    if (performanceData.metrics.errorRate > 0.05) {
      systemHealth.status = 'warning';
      systemHealth.issues.push('High error rate detected');
    }

    // 메모리 사용량 체크
    if (performanceData.systemHealth.memory.percentage > 80) {
      systemHealth.status = 'critical';
      systemHealth.issues.push('High memory usage');
    }

    // 캐시 연결 상태 체크
    if (!performanceData.systemHealth.cache.connected) {
      systemHealth.status = 'warning';
      systemHealth.issues.push('Cache connection issues');
    }

    // 데이터베이스 연결 상태 체크
    if (!performanceData.systemHealth.database.connection.connected) {
      systemHealth.status = 'critical';
      systemHealth.issues.push('Database connection issues');
    }

    const dashboardData = {
      timestamp: new Date().toISOString(),
      systemHealth,
      security: {
        stats: securityStats,
        recentEvents: recentSecurityEvents.slice(0, 20),
        topSuspiciousIPs,
        alerts: {
          critical: criticalAlerts,
          high: highAlerts,
          total: performanceData.alerts.length
        }
      },
      performance: {
        metrics: performanceData.metrics,
        alerts: performanceData.alerts.slice(0, 10),
        systemHealth: performanceData.systemHealth
      },
      cache: cacheStats,
      database: dbStats
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Security dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
