// 성능 모니터링 스크립트
const os = require('os');
const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.startTime = Date.now();
    this.metrics = [];
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
    console.log('📊 성능 모니터링 시작...');
    console.log('Press Ctrl+C to stop monitoring');
    
    this.monitor();
  }

  monitor() {
    if (!this.isRunning) return;

    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;
    
    // 시스템 메모리 정보
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem) * 100;

    // CPU 정보
    const cpus = os.cpus();
    const cpuUsage = this.getCpuUsage();

    // Node.js 프로세스 정보
    const nodeProcesses = this.getNodeProcesses();

    const metrics = {
      timestamp,
      uptime: Math.floor(uptime / 1000),
      memory: {
        total: Math.round(totalMem / 1024 / 1024), // MB
        used: Math.round(usedMem / 1024 / 1024), // MB
        free: Math.round(freeMem / 1024 / 1024), // MB
        usagePercent: Math.round(memUsagePercent * 100) / 100
      },
      cpu: {
        cores: cpus.length,
        usage: cpuUsage
      },
      nodeProcesses: nodeProcesses.length,
      loadAverage: os.loadavg()
    };

    this.metrics.push(metrics);
    
    // 콘솔에 현재 상태 출력
    this.printCurrentStatus(metrics);
    
    // 5초마다 모니터링
    setTimeout(() => this.monitor(), 5000);
  }

  getCpuUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - Math.round(100 * idle / total);

    return Math.max(0, usage);
  }

  getNodeProcesses() {
    try {
      const { execSync } = require('child_process');
      const output = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', { encoding: 'utf8' });
      const lines = output.split('\n').filter(line => line.includes('node.exe'));
      return lines;
    } catch (error) {
      return [];
    }
  }

  printCurrentStatus(metrics) {
    console.clear();
    console.log('📊 실시간 성능 모니터링');
    console.log('='.repeat(50));
    console.log(`⏰ 시간: ${metrics.timestamp}`);
    console.log(`⏱️  모니터링 시간: ${metrics.uptime}초`);
    console.log('');
    console.log('💾 메모리 사용량:');
    console.log(`  - 총 메모리: ${metrics.memory.total} MB`);
    console.log(`  - 사용 중: ${metrics.memory.used} MB (${metrics.memory.usagePercent}%)`);
    console.log(`  - 여유: ${metrics.memory.free} MB`);
    console.log('');
    console.log('🖥️  CPU 정보:');
    console.log(`  - 코어 수: ${metrics.cpu.cores}개`);
    console.log(`  - 사용률: ${metrics.cpu.usage}%`);
    console.log('');
    console.log('📈 시스템 로드:');
    console.log(`  - 1분 평균: ${metrics.loadAverage[0].toFixed(2)}`);
    console.log(`  - 5분 평균: ${metrics.loadAverage[1].toFixed(2)}`);
    console.log(`  - 15분 평균: ${metrics.loadAverage[2].toFixed(2)}`);
    console.log('');
    console.log('🔧 Node.js 프로세스:');
    console.log(`  - 실행 중인 프로세스: ${metrics.nodeProcesses}개`);
    console.log('');
    console.log('Press Ctrl+C to stop and save report');
  }

  stop() {
    this.isRunning = false;
    console.log('\n📊 성능 모니터링 중지');
    this.generateReport();
  }

  generateReport() {
    if (this.metrics.length === 0) {
      console.log('❌ 수집된 메트릭이 없습니다.');
      return;
    }

    const report = this.analyzeMetrics();
    this.saveReport(report);
    this.printReport(report);
  }

  analyzeMetrics() {
    const memoryUsages = this.metrics.map(m => m.memory.usagePercent);
    const cpuUsages = this.metrics.map(m => m.cpu.usage);
    const nodeProcessCounts = this.metrics.map(m => m.nodeProcesses);

    return {
      duration: this.metrics[this.metrics.length - 1].uptime,
      samples: this.metrics.length,
      memory: {
        min: Math.min(...memoryUsages),
        max: Math.max(...memoryUsages),
        avg: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
        current: memoryUsages[memoryUsages.length - 1]
      },
      cpu: {
        min: Math.min(...cpuUsages),
        max: Math.max(...cpuUsages),
        avg: cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length,
        current: cpuUsages[cpuUsages.length - 1]
      },
      nodeProcesses: {
        min: Math.min(...nodeProcessCounts),
        max: Math.max(...nodeProcessCounts),
        avg: nodeProcessCounts.reduce((a, b) => a + b, 0) / nodeProcessCounts.length,
        current: nodeProcessCounts[nodeProcessCounts.length - 1]
      },
      recommendations: this.getRecommendations(memoryUsages, cpuUsages)
    };
  }

  getRecommendations(memoryUsages, cpuUsages) {
    const recommendations = [];
    
    const avgMemory = memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length;
    const maxMemory = Math.max(...memoryUsages);
    const avgCpu = cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length;
    const maxCpu = Math.max(...cpuUsages);

    if (avgMemory > 80) {
      recommendations.push('⚠️ 메모리 사용률이 높습니다. 메모리 최적화를 고려하세요.');
    }
    if (maxMemory > 90) {
      recommendations.push('🚨 메모리 사용률이 매우 높습니다. 즉시 조치가 필요합니다.');
    }
    if (avgCpu > 70) {
      recommendations.push('⚠️ CPU 사용률이 높습니다. CPU 집약적인 작업을 최적화하세요.');
    }
    if (maxCpu > 90) {
      recommendations.push('🚨 CPU 사용률이 매우 높습니다. 즉시 조치가 필요합니다.');
    }
    if (avgMemory < 30 && avgCpu < 30) {
      recommendations.push('✅ 시스템 리소스가 충분합니다. 더 많은 부하를 처리할 수 있습니다.');
    }

    return recommendations;
  }

  saveReport(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(__dirname, `performance-report-${timestamp}.json`);
    
    const fullReport = {
      generatedAt: new Date().toISOString(),
      summary: report,
      rawMetrics: this.metrics
    };

    fs.writeFileSync(reportFile, JSON.stringify(fullReport, null, 2));
    console.log(`📄 상세 보고서 저장: ${reportFile}`);
  }

  printReport(report) {
    console.log('\n📊 성능 모니터링 보고서');
    console.log('='.repeat(50));
    console.log(`⏱️  모니터링 시간: ${report.duration}초`);
    console.log(`📈 샘플 수: ${report.samples}개`);
    console.log('');
    console.log('💾 메모리 사용률:');
    console.log(`  - 최소: ${report.memory.min.toFixed(2)}%`);
    console.log(`  - 최대: ${report.memory.max.toFixed(2)}%`);
    console.log(`  - 평균: ${report.memory.avg.toFixed(2)}%`);
    console.log(`  - 현재: ${report.memory.current.toFixed(2)}%`);
    console.log('');
    console.log('🖥️  CPU 사용률:');
    console.log(`  - 최소: ${report.cpu.min.toFixed(2)}%`);
    console.log(`  - 최대: ${report.cpu.max.toFixed(2)}%`);
    console.log(`  - 평균: ${report.cpu.avg.toFixed(2)}%`);
    console.log(`  - 현재: ${report.cpu.current.toFixed(2)}%`);
    console.log('');
    console.log('🔧 Node.js 프로세스:');
    console.log(`  - 최소: ${report.nodeProcesses.min}개`);
    console.log(`  - 최대: ${report.nodeProcesses.max}개`);
    console.log(`  - 평균: ${report.nodeProcesses.avg.toFixed(2)}개`);
    console.log(`  - 현재: ${report.nodeProcesses.current}개`);
    console.log('');
    
    if (report.recommendations.length > 0) {
      console.log('💡 권장사항:');
      report.recommendations.forEach(rec => console.log(`  ${rec}`));
    }
  }
}

// 모니터링 시작
const monitor = new PerformanceMonitor();

// Ctrl+C로 중지
process.on('SIGINT', () => {
  monitor.stop();
  process.exit(0);
});

monitor.start();














