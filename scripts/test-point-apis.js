/**
 * 포인트 시스템 API 테스트 스크립트
 * 
 * 실행 방법: node scripts/test-point-apis.js
 */

const BASE_URL = 'http://localhost:3001';

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// 테스트 결과 저장
const results = {
  passed: 0,
  failed: 0,
  total: 0
};

// 로그 헬퍼
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  results.total++;
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`테스트 ${results.total}: ${name}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  results.passed++;
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  results.failed++;
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// API 호출 헬퍼
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return { response, data };
  } catch (error) {
    return { error: error.message };
  }
}

// 테스트 함수들
async function testHealthCheck() {
  logTest('서버 헬스 체크');
  
  const { response, data, error } = await apiCall('/api/health');
  
  if (error) {
    logError(`서버 연결 실패: ${error}`);
    return false;
  }
  
  if (response.ok) {
    logSuccess('서버가 정상 작동 중입니다.');
    logInfo(`상태: ${data.status}`);
    return true;
  } else {
    logError('서버 응답 이상');
    return false;
  }
}

async function testPointsHistoryAPI() {
  logTest('포인트 내역 조회 API (비인증 상태)');
  
  const { response, data } = await apiCall('/api/points/history');
  
  if (response.status === 401) {
    logSuccess('비인증 상태에서 401 반환 - 정상');
    logInfo(`응답: ${data.error}`);
    return true;
  } else {
    logError(`예상치 못한 응답: ${response.status}`);
    return false;
  }
}

async function testPointsUseAPI() {
  logTest('포인트 사용 API (비인증 상태)');
  
  const { response, data } = await apiCall('/api/points/use', {
    method: 'POST',
    body: JSON.stringify({
      amount: 100,
      orderAmount: 10000,
      description: '테스트 사용'
    })
  });
  
  if (response.status === 401) {
    logSuccess('비인증 상태에서 401 반환 - 정상');
    logInfo(`응답: ${data.error}`);
    return true;
  } else {
    logError(`예상치 못한 응답: ${response.status}`);
    return false;
  }
}

async function testAdminPointsAPI() {
  logTest('관리자 포인트 API (비인증 상태)');
  
  const { response, data } = await apiCall('/api/admin/points', {
    method: 'POST',
    body: JSON.stringify({
      userId: '507f1f77bcf86cd799439011',
      action: 'grant',
      amount: 1000,
      description: '테스트 지급'
    })
  });
  
  if (response.status === 401) {
    logSuccess('비인증 상태에서 401 반환 - 정상');
    logInfo(`응답: ${data.error}`);
    return true;
  } else {
    logError(`예상치 못한 응답: ${response.status}`);
    return false;
  }
}

async function testAdminPointsHistoryAPI() {
  logTest('관리자 포인트 내역 API (비인증 상태)');
  
  const { response, data } = await apiCall('/api/admin/points/history');
  
  if (response.status === 401) {
    logSuccess('비인증 상태에서 401 반환 - 정상');
    logInfo(`응답: ${data.error}`);
    return true;
  } else {
    logError(`예상치 못한 응답: ${response.status}`);
    return false;
  }
}

async function testPointExpireAPI() {
  logTest('포인트 만료 처리 API (비인증 상태)');
  
  const { response, data } = await apiCall('/api/points/expire', {
    method: 'POST'
  });
  
  if (response.status === 401) {
    logSuccess('비인증 상태에서 401 반환 - 정상 (CRON_SECRET 필요)');
    logInfo(`응답: ${data.error}`);
    return true;
  } else {
    logError(`예상치 못한 응답: ${response.status}`);
    return false;
  }
}

async function testReviewAPI() {
  logTest('리뷰 작성 API (비인증 상태)');
  
  const { response, data } = await apiCall('/api/reviews', {
    method: 'POST',
    body: JSON.stringify({
      productId: '507f1f77bcf86cd799439011',
      rating: 5,
      content: '테스트 리뷰',
      images: []
    })
  });
  
  if (response.status === 401) {
    logSuccess('비인증 상태에서 401 반환 - 정상');
    logInfo(`응답: ${data.error}`);
    return true;
  } else {
    logError(`예상치 못한 응답: ${response.status}`);
    return false;
  }
}

async function testCheckoutExpectedPoints() {
  logTest('체크아웃 페이지 접근 확인');
  
  const { response, error } = await apiCall('/checkout');
  
  if (error) {
    logError(`페이지 접근 실패: ${error}`);
    return false;
  }
  
  if (response.status === 200 || response.status === 307 || response.status === 308) {
    logSuccess('체크아웃 페이지 접근 가능 (로그인 리다이렉트 또는 정상)');
    return true;
  } else {
    logError(`예상치 못한 응답: ${response.status}`);
    return false;
  }
}

async function testAdminPointsPage() {
  logTest('관리자 포인트 관리 페이지 접근 확인');
  
  const { response, error } = await apiCall('/admin/points');
  
  if (error) {
    logError(`페이지 접근 실패: ${error}`);
    return false;
  }
  
  if (response.status === 200 || response.status === 307 || response.status === 308) {
    logSuccess('관리자 포인트 페이지 접근 가능');
    return true;
  } else {
    logError(`예상치 못한 응답: ${response.status}`);
    return false;
  }
}

async function testUserPointsPage() {
  logTest('사용자 포인트 내역 페이지 접근 확인');
  
  const { response, error } = await apiCall('/me/points');
  
  if (error) {
    logError(`페이지 접근 실패: ${error}`);
    return false;
  }
  
  if (response.status === 200 || response.status === 307 || response.status === 308) {
    logSuccess('사용자 포인트 내역 페이지 접근 가능');
    return true;
  } else {
    logError(`예상치 못한 응답: ${response.status}`);
    return false;
  }
}

// 메인 테스트 실행
async function runTests() {
  log('\n' + '🧪 포인트 시스템 API 테스트 시작'.padEnd(60, ' '), 'bright');
  log('='.repeat(60), 'cyan');
  
  const startTime = Date.now();
  
  // 기본 테스트
  await testHealthCheck();
  
  // API 엔드포인트 테스트
  await testPointsHistoryAPI();
  await testPointsUseAPI();
  await testAdminPointsAPI();
  await testAdminPointsHistoryAPI();
  await testPointExpireAPI();
  await testReviewAPI();
  
  // 페이지 접근 테스트
  await testCheckoutExpectedPoints();
  await testAdminPointsPage();
  await testUserPointsPage();
  
  // 결과 요약
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 테스트 결과 요약', 'bright');
  log('='.repeat(60), 'cyan');
  log(`총 테스트: ${results.total}개`, 'cyan');
  log(`✅ 성공: ${results.passed}개`, 'green');
  log(`❌ 실패: ${results.failed}개`, 'red');
  log(`⏱️  소요 시간: ${duration}초`, 'yellow');
  log('='.repeat(60), 'cyan');
  
  if (results.failed === 0) {
    log('\n🎉 모든 테스트 통과!', 'green');
  } else {
    log('\n⚠️  일부 테스트 실패. 위 로그를 확인하세요.', 'yellow');
  }
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// 에러 핸들링
process.on('unhandledRejection', (error) => {
  log('\n💥 예상치 못한 오류 발생:', 'red');
  console.error(error);
  process.exit(1);
});

// 실행
runTests().catch((error) => {
  log('\n💥 테스트 실행 중 오류:', 'red');
  console.error(error);
  process.exit(1);
});

