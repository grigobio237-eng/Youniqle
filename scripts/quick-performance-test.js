// 빠른 성능 테스트 스크립트
const os = require('os');
const http = require('http');

console.log('📊 시스템 성능 정보');
console.log('='.repeat(50));

// 시스템 정보
console.log('💻 시스템 정보:');
console.log(`  - OS: ${os.platform()} ${os.arch()}`);
console.log(`  - Node.js: ${process.version}`);
console.log(`  - CPU 코어: ${os.cpus().length}개`);
console.log(`  - 총 메모리: ${Math.round(os.totalmem() / 1024 / 1024)} MB`);
console.log('');

// 메모리 사용량
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const memUsagePercent = (usedMem / totalMem) * 100;

console.log('💾 메모리 사용량:');
console.log(`  - 총 메모리: ${Math.round(totalMem / 1024 / 1024)} MB`);
console.log(`  - 사용 중: ${Math.round(usedMem / 1024 / 1024)} MB (${memUsagePercent.toFixed(2)}%)`);
console.log(`  - 여유: ${Math.round(freeMem / 1024 / 1024)} MB`);
console.log('');

// CPU 정보
const cpus = os.cpus();
console.log('🖥️ CPU 정보:');
console.log(`  - 모델: ${cpus[0].model}`);
console.log(`  - 코어 수: ${cpus.length}개`);
console.log(`  - 속도: ${cpus[0].speed} MHz`);
console.log('');

// 로드 평균
const loadAvg = os.loadavg();
console.log('📈 시스템 로드:');
console.log(`  - 1분 평균: ${loadAvg[0].toFixed(2)}`);
console.log(`  - 5분 평균: ${loadAvg[1].toFixed(2)}`);
console.log(`  - 15분 평균: ${loadAvg[2].toFixed(2)}`);
console.log('');

// API 응답 시간 테스트
console.log('🌐 API 응답 시간 테스트:');
const testUrls = [
  'http://localhost:3000/api/products?page=1&limit=5',
  'http://localhost:3000/api/recommendations?limit=5',
  'http://localhost:3000/api/admin/analytics?startDate=2024-01-01&endDate=2024-12-31'
];

async function testApiResponse(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          url: url.split('/').pop(),
          statusCode: res.statusCode,
          responseTime,
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url: url.split('/').pop(),
        statusCode: 0,
        responseTime: Date.now() - startTime,
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url: url.split('/').pop(),
        statusCode: 0,
        responseTime: Date.now() - startTime,
        success: false,
        error: 'Timeout'
      });
    });
  });
}

async function runApiTests() {
  for (const url of testUrls) {
    const result = await testApiResponse(url);
    console.log(`  - ${result.url}: ${result.success ? '✅' : '❌'} ${result.responseTime}ms (${result.statusCode})`);
    if (result.error) {
      console.log(`    에러: ${result.error}`);
    }
  }
}

runApiTests().then(() => {
  console.log('');
  console.log('✅ 성능 테스트 완료');
  
  // 성능 평가
  console.log('');
  console.log('🏆 성능 평가:');
  
  if (memUsagePercent < 50) {
    console.log('✅ 메모리 사용률이 낮습니다 (50% 미만)');
  } else if (memUsagePercent < 80) {
    console.log('⚠️ 메모리 사용률이 보통입니다 (50-80%)');
  } else {
    console.log('❌ 메모리 사용률이 높습니다 (80% 이상)');
  }
  
  if (loadAvg[0] < 1) {
    console.log('✅ 시스템 로드가 낮습니다 (1 미만)');
  } else if (loadAvg[0] < 2) {
    console.log('⚠️ 시스템 로드가 보통입니다 (1-2)');
  } else {
    console.log('❌ 시스템 로드가 높습니다 (2 이상)');
  }
});














