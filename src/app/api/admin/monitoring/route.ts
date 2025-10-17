// 관리자 모니터링 대시보드 API
import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/authMiddleware';
import performanceMonitor from '@/lib/monitoring';
import logger from '@/lib/logger';
import notificationService from '@/lib/notifications';
import cache from '@/lib/cache';

async function getMonitoringDataHandler(request: NextRequest, user: any) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const limit = parseInt(searchParams.get('limit') || '100');

    logger.info('api', '모니터링 데이터 조회', { type, limit }, { userId: user.id });

    switch (type) {
      case 'overview':
        return await getOverviewData();
      case 'performance':
        return await getPerformanceData(limit);
      case 'alerts':
        return await getAlertsData(limit);
      case 'logs':
        return await getLogsData(limit);
      case 'cache':
        return await getCacheData();
      case 'system':
        return await getSystemData();
      default:
        return NextResponse.json(
          { error: '지원하지 않는 모니터링 타입입니다.' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('api', '모니터링 데이터 조회 실패', error as Error, { userId: user.id });
    return NextResponse.json(
      { error: '모니터링 데이터를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 개요 데이터
async function getOverviewData() {
  const currentStatus = performanceMonitor.getCurrentStatus();
  const alertStats = notificationService.getAlertStats();
  const cacheStats = await cache.getStats();

  return NextResponse.json({
    status: currentStatus?.status || 'unknown',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: currentStatus?.memory || { used: 0, total: 0, percentage: 0 },
    cpu: currentStatus?.cpu || { loadAverage: [0, 0, 0], usage: 0 },
    api: currentStatus?.api || { responseTime: 0, averageResponseTime: 0 },
    cache: {
      ...currentStatus?.cache,
      ...cacheStats,
    },
    alerts: {
      total: alertStats.total,
      resolved: alertStats.resolved,
      unresolved: alertStats.unresolved,
      bySeverity: alertStats.bySeverity,
    },
  });
}

// 성능 데이터
async function getPerformanceData(limit: number) {
  const metrics = performanceMonitor.getMetricsHistory(limit);
  const currentStatus = performanceMonitor.getCurrentStatus();

  // 성능 통계 계산
  const responseTimes = metrics
    .filter(m => m.api.responseTime > 0)
    .map(m => m.api.responseTime);

  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
    : 0;

  const maxResponseTime = responseTimes.length > 0 
    ? Math.max(...responseTimes) 
    : 0;

  const minResponseTime = responseTimes.length > 0 
    ? Math.min(...responseTimes) 
    : 0;

  // 메모리 사용량 통계
  const memoryUsage = metrics.map(m => m.memory.percentage);
  const avgMemoryUsage = memoryUsage.length > 0 
    ? memoryUsage.reduce((sum, usage) => sum + usage, 0) / memoryUsage.length 
    : 0;

  const maxMemoryUsage = memoryUsage.length > 0 
    ? Math.max(...memoryUsage) 
    : 0;

  // CPU 사용량 통계
  const cpuUsage = metrics.map(m => m.cpu.usage);
  const avgCpuUsage = cpuUsage.length > 0 
    ? cpuUsage.reduce((sum, usage) => sum + usage, 0) / cpuUsage.length 
    : 0;

  const maxCpuUsage = cpuUsage.length > 0 
    ? Math.max(...cpuUsage) 
    : 0;

  return NextResponse.json({
    current: currentStatus,
    metrics: metrics.map(m => ({
      timestamp: m.timestamp,
      memory: m.memory,
      cpu: m.cpu,
      api: m.api,
      cache: m.cache,
    })),
    statistics: {
      responseTime: {
        average: Math.round(avgResponseTime),
        min: minResponseTime,
        max: maxResponseTime,
        count: responseTimes.length,
      },
      memory: {
        average: Math.round(avgMemoryUsage * 100) / 100,
        max: maxMemoryUsage,
        count: memoryUsage.length,
      },
      cpu: {
        average: Math.round(avgCpuUsage * 100) / 100,
        max: maxCpuUsage,
        count: cpuUsage.length,
      },
    },
  });
}

// 알림 데이터
async function getAlertsData(limit: number) {
  const alerts = notificationService.getAlerts(limit);
  const stats = notificationService.getAlertStats();

  return NextResponse.json({
    alerts: alerts.map(alert => ({
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      timestamp: alert.timestamp,
      resolved: alert.resolved,
      resolvedAt: alert.resolvedAt,
      metadata: alert.metadata,
    })),
    stats,
  });
}

// 로그 데이터
async function getLogsData(limit: number) {
  const logFiles = logger.getLogFiles();
  const recentLogs = logFiles.length > 0 
    ? logger.readLogFile(logFiles[0], limit)
    : [];

  const parsedLogs = recentLogs
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(log => log !== null)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  return NextResponse.json({
    logs: parsedLogs,
    files: logFiles,
    total: parsedLogs.length,
  });
}

// 캐시 데이터
async function getCacheData() {
  const stats = await cache.getStats();
  const keys = await cache.keys('*');

  // 캐시 키 분석
  const keyAnalysis = keys.reduce((acc, key) => {
    const parts = key.split(':');
    const category = parts[0] || 'unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    stats,
    keys: {
      total: keys.length,
      byCategory: keyAnalysis,
    },
    sampleKeys: keys.slice(0, 20),
  });
}

// 시스템 데이터
async function getSystemData() {
  const os = require('os');
  const currentStatus = performanceMonitor.getCurrentStatus();

  return NextResponse.json({
    platform: {
      os: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: process.uptime(),
    },
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
    },
    cpu: {
      cores: os.cpus().length,
      model: os.cpus()[0]?.model || 'Unknown',
      loadAverage: os.loadavg(),
    },
    process: {
      pid: process.pid,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    },
    monitoring: {
      active: performanceMonitor.isMonitoringActive(),
      status: currentStatus?.status || 'unknown',
    },
  });
}

// 알림 해결
async function resolveAlertHandler(request: NextRequest, user: any) {
  try {
    const { alertId } = await request.json();

    if (!alertId) {
      return NextResponse.json(
        { error: '알림 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const resolved = notificationService.resolveAlert(alertId);

    if (resolved) {
      logger.info('api', '알림 해결됨', { alertId }, { userId: user.id });
      return NextResponse.json({ success: true, message: '알림이 해결되었습니다.' });
    } else {
      return NextResponse.json(
        { error: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
  } catch (error) {
    logger.error('api', '알림 해결 실패', error as Error, { userId: user.id });
    return NextResponse.json(
      { error: '알림 해결에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 모니터링 시작/중지
async function toggleMonitoringHandler(request: NextRequest, user: any) {
  try {
    const { action } = await request.json();

    if (action === 'start') {
      performanceMonitor.startMonitoring();
      logger.info('api', '모니터링 시작', {}, { userId: user.id });
      return NextResponse.json({ success: true, message: '모니터링이 시작되었습니다.' });
    } else if (action === 'stop') {
      performanceMonitor.stopMonitoring();
      logger.info('api', '모니터링 중지', {}, { userId: user.id });
      return NextResponse.json({ success: true, message: '모니터링이 중지되었습니다.' });
    } else {
      return NextResponse.json(
        { error: '지원하지 않는 액션입니다.' },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error('api', '모니터링 토글 실패', error as Error, { userId: user.id });
    return NextResponse.json(
      { error: '모니터링 상태 변경에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getMonitoringDataHandler);
export const POST = withAdminAuth(async (request: NextRequest, user: any) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'resolve-alert':
      return resolveAlertHandler(request, user);
    case 'toggle-monitoring':
      return toggleMonitoringHandler(request, user);
    default:
      return NextResponse.json(
        { error: '지원하지 않는 액션입니다.' },
        { status: 400 }
      );
  }
});










