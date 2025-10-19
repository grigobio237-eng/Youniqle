// API 부하 테스트 스크립트
const http = require('http');
const https = require('https');
const { URL } = require('url');

class LoadTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = [];
    this.isRunning = false;
  }

  async runLoadTest(options = {}) {
    const {
      duration = 30, // 초
      concurrency = 10,
      requestsPerSecond = 5
    } = options;

    console.log('🚀 API 부하 테스트 시작...');
    console.log(`⏱️  테스트 시간: ${duration}초`);
    console.log(`👥 동시 연결: ${concurrency}개`);
    console.log(`📊 초당 요청: ${requestsPerSecond}개`);
    console.log('');

    this.isRunning = true;
    this.results = [];
    const startTime = Date.now();
    const endTime = startTime + (duration * 1000);

    // 테스트 시나리오 정의
    const scenarios = [
      { name: '상품 목록 조회', url: '/api/products?page=1&limit=10', method: 'GET' },
      { name: '상품 페이지네이션', url: '/api/products?page=2&limit=5', method: 'GET' },
      { name: '추천 상품 조회', url: '/api/recommendations?limit=5', method: 'GET' },
      { name: '분석 데이터 조회', url: '/api/admin/analytics?startDate=2024-01-01&endDate=2024-12-31', method: 'GET' }
    ];

    // 로그인 테스트용 데이터
    const loginData = JSON.stringify({
      email: 'admin@youniqle.com',
      password: 'admin123!'
    });

    // 동시 요청 실행
    const promises = [];
    for (let i = 0; i < concurrency; i++) {
      promises.push(this.runWorker(scenarios, loginData, endTime, requestsPerSecond));
    }

    // 모든 워커 완료 대기
    await Promise.all(promises);

    this.isRunning = false;
    const totalTime = Date.now() - startTime;
    
    console.log('\n✅ 부하 테스트 완료');
    this.generateReport(totalTime);
  }

  async runWorker(scenarios, loginData, endTime, requestsPerSecond) {
    const delay = 1000 / requestsPerSecond; // 요청 간 지연 시간

    while (this.isRunning && Date.now() < endTime) {
      // 랜덤 시나리오 선택
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      
      try {
        const result = await this.makeRequest(scenario.url, scenario.method, scenario.name);
        this.results.push(result);
      } catch (error) {
        this.results.push({
          name: scenario.name,
          url: scenario.url,
          method: scenario.method,
          statusCode: 0,
          responseTime: 0,
          error: error.message,
          timestamp: Date.now()
        });
      }

      // 요청 간 지연
      await this.sleep(delay);
    }
  }

  async makeRequest(url, method, name) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const fullUrl = new URL(url, this.baseUrl);
      
      const options = {
        hostname: fullUrl.hostname,
        port: fullUrl.port || (fullUrl.protocol === 'https:' ? 443 : 80),
        path: fullUrl.pathname + fullUrl.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LoadTester/1.0'
        }
      };

      const req = (fullUrl.protocol === 'https:' ? https : http).request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          resolve({
            name,
            url,
            method,
            statusCode: res.statusCode,
            responseTime,
            contentLength: data.length,
            timestamp: startTime
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateReport(totalTime) {
    if (this.results.length === 0) {
      console.log('❌ 테스트 결과가 없습니다.');
      return;
    }

    const successfulRequests = this.results.filter(r => r.statusCode >= 200 && r.statusCode < 300);
    const failedRequests = this.results.filter(r => r.statusCode < 200 || r.statusCode >= 300);
    
    const responseTimes = successfulRequests.map(r => r.responseTime);
    const sortedResponseTimes = responseTimes.sort((a, b) => a - b);

    const report = {
      totalRequests: this.results.length,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      successRate: (successfulRequests.length / this.results.length) * 100,
      totalTime: totalTime / 1000,
      requestsPerSecond: this.results.length / (totalTime / 1000),
      responseTime: {
        min: Math.min(...responseTimes),
        max: Math.max(...responseTimes),
        avg: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        p50: this.percentile(sortedResponseTimes, 50),
        p90: this.percentile(sortedResponseTimes, 90),
        p95: this.percentile(sortedResponseTimes, 95),
        p99: this.percentile(sortedResponseTimes, 99)
      },
      statusCodes: this.getStatusCodeDistribution(),
      errors: this.getErrorDistribution()
    };

    this.printReport(report);
    this.saveReport(report);
  }

  percentile(sortedArray, percentile) {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[index] || 0;
  }

  getStatusCodeDistribution() {
    const distribution = {};
    this.results.forEach(result => {
      const code = result.statusCode;
      distribution[code] = (distribution[code] || 0) + 1;
    });
    return distribution;
  }

  getErrorDistribution() {
    const errors = {};
    this.results
      .filter(r => r.error)
      .forEach(result => {
        const error = result.error;
        errors[error] = (errors[error] || 0) + 1;
      });
    return errors;
  }

  printReport(report) {
    console.log('\n📊 부하 테스트 보고서');
    console.log('='.repeat(50));
    console.log(`📈 총 요청 수: ${report.totalRequests}개`);
    console.log(`✅ 성공한 요청: ${report.successfulRequests}개`);
    console.log(`❌ 실패한 요청: ${report.failedRequests}개`);
    console.log(`📊 성공률: ${report.successRate.toFixed(2)}%`);
    console.log(`⏱️  총 테스트 시간: ${report.totalTime.toFixed(2)}초`);
    console.log(`🚀 초당 요청 수: ${report.requestsPerSecond.toFixed(2)}개`);
    console.log('');
    
    console.log('⏱️  응답 시간 통계:');
    console.log(`  - 최소: ${report.responseTime.min}ms`);
    console.log(`  - 최대: ${report.responseTime.max}ms`);
    console.log(`  - 평균: ${report.responseTime.avg.toFixed(2)}ms`);
    console.log(`  - 50%ile: ${report.responseTime.p50}ms`);
    console.log(`  - 90%ile: ${report.responseTime.p90}ms`);
    console.log(`  - 95%ile: ${report.responseTime.p95}ms`);
    console.log(`  - 99%ile: ${report.responseTime.p99}ms`);
    console.log('');

    if (Object.keys(report.statusCodes).length > 0) {
      console.log('📊 상태 코드 분포:');
      Object.entries(report.statusCodes).forEach(([code, count]) => {
        console.log(`  - ${code}: ${count}개`);
      });
      console.log('');
    }

    if (Object.keys(report.errors).length > 0) {
      console.log('❌ 에러 분포:');
      Object.entries(report.errors).forEach(([error, count]) => {
        console.log(`  - ${error}: ${count}개`);
      });
      console.log('');
    }

    // 성능 평가
    this.evaluatePerformance(report);
  }

  evaluatePerformance(report) {
    console.log('🏆 성능 평가:');
    
    if (report.successRate >= 99) {
      console.log('✅ 우수한 안정성 (성공률 99% 이상)');
    } else if (report.successRate >= 95) {
      console.log('⚠️ 양호한 안정성 (성공률 95% 이상)');
    } else {
      console.log('❌ 안정성 개선 필요 (성공률 95% 미만)');
    }

    if (report.responseTime.avg < 200) {
      console.log('✅ 우수한 응답 시간 (평균 200ms 미만)');
    } else if (report.responseTime.avg < 500) {
      console.log('⚠️ 양호한 응답 시간 (평균 500ms 미만)');
    } else {
      console.log('❌ 응답 시간 개선 필요 (평균 500ms 이상)');
    }

    if (report.responseTime.p95 < 1000) {
      console.log('✅ 우수한 95%ile 응답 시간 (1000ms 미만)');
    } else if (report.responseTime.p95 < 2000) {
      console.log('⚠️ 양호한 95%ile 응답 시간 (2000ms 미만)');
    } else {
      console.log('❌ 95%ile 응답 시간 개선 필요 (2000ms 이상)');
    }
  }

  saveReport(report) {
    const fs = require('fs');
    const path = require('path');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(__dirname, `load-test-report-${timestamp}.json`);
    
    const fullReport = {
      generatedAt: new Date().toISOString(),
      summary: report,
      rawResults: this.results
    };

    fs.writeFileSync(reportFile, JSON.stringify(fullReport, null, 2));
    console.log(`📄 상세 보고서 저장: ${reportFile}`);
  }
}

// 테스트 실행
async function runLoadTest() {
  const tester = new LoadTester();
  
  // 다양한 부하 테스트 시나리오
  const scenarios = [
    { duration: 10, concurrency: 5, requestsPerSecond: 2, name: '가벼운 부하' },
    { duration: 20, concurrency: 10, requestsPerSecond: 5, name: '중간 부하' },
    { duration: 30, concurrency: 20, requestsPerSecond: 10, name: '높은 부하' }
  ];

  for (const scenario of scenarios) {
    console.log(`\n🧪 ${scenario.name} 테스트 시작...`);
    await tester.runLoadTest(scenario);
    console.log(`\n⏸️  ${scenario.name} 테스트 완료. 5초 대기...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

// 스크립트가 직접 실행된 경우
if (require.main === module) {
  runLoadTest().catch(console.error);
}

module.exports = LoadTester;













