// 보안 테스트 스크립트
const http = require('http');
const https = require('https');
const { URL } = require('url');

class SecurityTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = [];
    this.adminToken = null;
    this.userToken = null;
    this.partnerToken = null;
  }

  async runSecurityTests() {
    console.log('🛡️ 보안 테스트 시작...');
    console.log('='.repeat(60));

    // 1. 인증 토큰 획득
    await this.getAuthTokens();

    // 2. SQL Injection 테스트
    await this.testSQLInjection();

    // 3. XSS 테스트
    await this.testXSS();

    // 4. CSRF 테스트
    await this.testCSRF();

    // 5. 인증 및 권한 테스트
    await this.testAuthentication();

    // 6. JWT 토큰 조작 테스트
    await this.testJWTManipulation();

    // 7. 입력 검증 테스트
    await this.testInputValidation();

    // 8. 파일 업로드 보안 테스트
    await this.testFileUploadSecurity();

    // 9. Rate Limiting 테스트
    await this.testRateLimiting();

    // 10. 헤더 보안 테스트
    await this.testSecurityHeaders();

    // 결과 출력
    this.printResults();
  }

  async getAuthTokens() {
    console.log('\n🔐 1. 인증 토큰 획득');
    
    try {
      // 관리자 로그인
      const adminResponse = await this.makeRequest('/api/auth/login', 'POST', {
        email: 'admin@youniqle.com',
        password: 'admin123!'
      });
      
      if (adminResponse.statusCode === 200) {
        this.adminToken = adminResponse.data?.token;
        console.log('✅ 관리자 토큰 획득 성공');
      } else {
        console.log('❌ 관리자 토큰 획득 실패');
      }

      // 사용자 로그인
      const userResponse = await this.makeRequest('/api/auth/login', 'POST', {
        email: 'user@youniqle.com',
        password: 'user123!'
      });
      
      if (userResponse.statusCode === 200) {
        this.userToken = userResponse.data?.token;
        console.log('✅ 사용자 토큰 획득 성공');
      } else {
        console.log('❌ 사용자 토큰 획득 실패');
      }

      // 파트너 로그인
      const partnerResponse = await this.makeRequest('/api/auth/login', 'POST', {
        email: 'partner@youniqle.com',
        password: 'partner123!'
      });
      
      if (partnerResponse.statusCode === 200) {
        this.partnerToken = partnerResponse.data?.token;
        console.log('✅ 파트너 토큰 획득 성공');
      } else {
        console.log('❌ 파트너 토큰 획득 실패');
      }

    } catch (error) {
      console.log('❌ 토큰 획득 중 오류:', error.message);
    }
  }

  async testSQLInjection() {
    console.log('\n💉 2. SQL Injection 테스트');
    
    const sqlInjectionPayloads = [
      "' OR 1=1 --",
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "' OR 1=1 LIMIT 1 --",
      "admin'--",
      "admin'/*",
      "' OR 1=1 #"
    ];

    for (const payload of sqlInjectionPayloads) {
      try {
        // 상품 검색 SQL Injection
        const response = await this.makeRequest(`/api/products?search=${encodeURIComponent(payload)}`, 'GET');
        
        this.recordTest('SQL Injection - 상품 검색', {
          payload,
          statusCode: response.statusCode,
          vulnerable: this.isVulnerable(response),
          details: response.data
        });

        // 로그인 SQL Injection
        const loginResponse = await this.makeRequest('/api/auth/login', 'POST', {
          email: `admin@youniqle.com${payload}`,
          password: 'admin123!'
        });

        this.recordTest('SQL Injection - 로그인', {
          payload,
          statusCode: loginResponse.statusCode,
          vulnerable: this.isVulnerable(loginResponse),
          details: loginResponse.data
        });

      } catch (error) {
        this.recordTest('SQL Injection', {
          payload,
          error: error.message,
          vulnerable: false
        });
      }
    }
  }

  async testXSS() {
    console.log('\n🚨 3. XSS 테스트');
    
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      '<script>document.location="http://evil.com"</script>',
      '<img src="x" onerror="alert(\'XSS\')">',
      '<body onload=alert("XSS")>'
    ];

    for (const payload of xssPayloads) {
      try {
        // 상품 검색 XSS
        const response = await this.makeRequest(`/api/products?search=${encodeURIComponent(payload)}`, 'GET');
        
        this.recordTest('XSS - 상품 검색', {
          payload,
          statusCode: response.statusCode,
          vulnerable: this.containsXSS(response.data, payload),
          details: response.data
        });

        // 리뷰 작성 XSS (토큰이 있는 경우)
        if (this.userToken) {
          const reviewResponse = await this.makeRequest('/api/reviews', 'POST', {
            productId: 'test-product-id',
            rating: 5,
            comment: payload
          }, this.userToken);

          this.recordTest('XSS - 리뷰 작성', {
            payload,
            statusCode: reviewResponse.statusCode,
            vulnerable: this.containsXSS(reviewResponse.data, payload),
            details: reviewResponse.data
          });
        }

      } catch (error) {
        this.recordTest('XSS', {
          payload,
          error: error.message,
          vulnerable: false
        });
      }
    }
  }

  async testCSRF() {
    console.log('\n🔄 4. CSRF 테스트');
    
    const csrfTests = [
      {
        name: 'CSRF 토큰 없이 주문 생성',
        url: '/api/orders',
        method: 'POST',
        data: { items: [], totalAmount: 0 },
        headers: {}
      },
      {
        name: '잘못된 CSRF 토큰으로 주문 생성',
        url: '/api/orders',
        method: 'POST',
        data: { items: [], totalAmount: 0 },
        headers: { 'X-CSRF-Token': 'invalid-token' }
      },
      {
        name: 'CSRF 토큰 없이 상품 생성',
        url: '/api/admin/products',
        method: 'POST',
        data: { name: 'Test Product', price: 1000 },
        headers: {}
      }
    ];

    for (const test of csrfTests) {
      try {
        const response = await this.makeRequest(test.url, test.method, test.data, this.adminToken, test.headers);
        
        this.recordTest(test.name, {
          statusCode: response.statusCode,
          vulnerable: response.statusCode === 200,
          details: response.data
        });

      } catch (error) {
        this.recordTest(test.name, {
          error: error.message,
          vulnerable: false
        });
      }
    }
  }

  async testAuthentication() {
    console.log('\n🔐 5. 인증 및 권한 테스트');
    
    const authTests = [
      {
        name: '토큰 없이 관리자 API 접근',
        url: '/api/admin/users',
        method: 'GET',
        token: null
      },
      {
        name: '사용자 토큰으로 관리자 API 접근',
        url: '/api/admin/users',
        method: 'GET',
        token: this.userToken
      },
      {
        name: '파트너 토큰으로 관리자 API 접근',
        url: '/api/admin/users',
        method: 'GET',
        token: this.partnerToken
      },
      {
        name: '토큰 없이 사용자 정보 접근',
        url: '/api/auth/me',
        method: 'GET',
        token: null
      },
      {
        name: '잘못된 토큰으로 사용자 정보 접근',
        url: '/api/auth/me',
        method: 'GET',
        token: 'invalid-token'
      }
    ];

    for (const test of authTests) {
      try {
        const response = await this.makeRequest(test.url, test.method, null, test.token);
        
        this.recordTest(test.name, {
          statusCode: response.statusCode,
          vulnerable: response.statusCode === 200,
          details: response.data
        });

      } catch (error) {
        this.recordTest(test.name, {
          error: error.message,
          vulnerable: false
        });
      }
    }
  }

  async testJWTManipulation() {
    console.log('\n🎫 6. JWT 토큰 조작 테스트');
    
    const jwtTests = [
      {
        name: '만료된 토큰 사용',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDB9.invalid'
      },
      {
        name: '잘못된 서명의 토큰 사용',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0In0.invalid'
      },
      {
        name: 'Base64 인코딩된 토큰 사용',
        token: 'dGVzdC10b2tlbg=='
      },
      {
        name: '빈 토큰 사용',
        token: ''
      },
      {
        name: 'null 토큰 사용',
        token: null
      }
    ];

    for (const test of jwtTests) {
      try {
        const response = await this.makeRequest('/api/auth/me', 'GET', null, test.token);
        
        this.recordTest(test.name, {
          statusCode: response.statusCode,
          vulnerable: response.statusCode === 200,
          details: response.data
        });

      } catch (error) {
        this.recordTest(test.name, {
          error: error.message,
          vulnerable: false
        });
      }
    }
  }

  async testInputValidation() {
    console.log('\n📝 7. 입력 검증 테스트');
    
    const inputTests = [
      {
        name: '매우 긴 입력값',
        url: '/api/products?search=' + 'A'.repeat(10000),
        method: 'GET'
      },
      {
        name: '특수 문자 입력',
        url: '/api/products?search=!@#$%^&*()_+{}|:"<>?[]\\;\',./',
        method: 'GET'
      },
      {
        name: 'SQL 키워드 입력',
        url: '/api/products?search=SELECT * FROM users',
        method: 'GET'
      },
      {
        name: '음수 가격으로 상품 생성',
        url: '/api/admin/products',
        method: 'POST',
        data: { name: 'Test', price: -1000 },
        token: this.adminToken
      },
      {
        name: '빈 문자열로 상품 생성',
        url: '/api/admin/products',
        method: 'POST',
        data: { name: '', price: 1000 },
        token: this.adminToken
      }
    ];

    for (const test of inputTests) {
      try {
        const response = await this.makeRequest(test.url, test.method, test.data, test.token);
        
        this.recordTest(test.name, {
          statusCode: response.statusCode,
          vulnerable: this.isInputValidationBypassed(response),
          details: response.data
        });

      } catch (error) {
        this.recordTest(test.name, {
          error: error.message,
          vulnerable: false
        });
      }
    }
  }

  async testFileUploadSecurity() {
    console.log('\n📁 8. 파일 업로드 보안 테스트');
    
    const fileTests = [
      {
        name: 'PHP 파일 업로드 시도',
        filename: 'test.php',
        content: '<?php echo "Hello World"; ?>'
      },
      {
        name: 'JavaScript 파일 업로드 시도',
        filename: 'test.js',
        content: 'alert("XSS");'
      },
      {
        name: '실행 가능한 파일 업로드 시도',
        filename: 'test.exe',
        content: 'MZ'
      },
      {
        name: '매우 큰 파일 업로드 시도',
        filename: 'large.txt',
        content: 'A'.repeat(10000000)
      }
    ];

    for (const test of fileTests) {
      try {
        // 파일 업로드 API가 있다면 테스트
        const response = await this.makeRequest('/api/upload', 'POST', {
          filename: test.filename,
          content: test.content
        }, this.adminToken);

        this.recordTest(test.name, {
          statusCode: response.statusCode,
          vulnerable: response.statusCode === 200,
          details: response.data
        });

      } catch (error) {
        this.recordTest(test.name, {
          error: error.message,
          vulnerable: false
        });
      }
    }
  }

  async testRateLimiting() {
    console.log('\n⏱️ 9. Rate Limiting 테스트');
    
    try {
      let successCount = 0;
      let failureCount = 0;
      
      // 10번의 빠른 요청
      for (let i = 0; i < 10; i++) {
        try {
          const response = await this.makeRequest('/api/auth/login', 'POST', {
            email: 'admin@youniqle.com',
            password: 'wrongpassword'
          });
          
          if (response.statusCode === 200) {
            successCount++;
          } else if (response.statusCode === 429) {
            failureCount++;
          }
        } catch (error) {
          failureCount++;
        }
      }

      this.recordTest('Rate Limiting', {
        successCount,
        failureCount,
        vulnerable: successCount > 5,
        details: `성공: ${successCount}, 실패: ${failureCount}`
      });

    } catch (error) {
      this.recordTest('Rate Limiting', {
        error: error.message,
        vulnerable: false
      });
    }
  }

  async testSecurityHeaders() {
    console.log('\n🔒 10. 보안 헤더 테스트');
    
    try {
      const response = await this.makeRequest('/api/products', 'GET');
      
      const securityHeaders = {
        'X-Content-Type-Options': response.headers['x-content-type-options'],
        'X-Frame-Options': response.headers['x-frame-options'],
        'X-XSS-Protection': response.headers['x-xss-protection'],
        'Strict-Transport-Security': response.headers['strict-transport-security'],
        'Content-Security-Policy': response.headers['content-security-policy']
      };

      this.recordTest('보안 헤더', {
        headers: securityHeaders,
        vulnerable: Object.values(securityHeaders).every(h => !h),
        details: securityHeaders
      });

    } catch (error) {
      this.recordTest('보안 헤더', {
        error: error.message,
        vulnerable: false
      });
    }
  }

  async makeRequest(url, method, data, token, additionalHeaders = {}) {
    return new Promise((resolve, reject) => {
      const fullUrl = new URL(url, this.baseUrl);
      
      const options = {
        hostname: fullUrl.hostname,
        port: fullUrl.port || (fullUrl.protocol === 'https:' ? 443 : 80),
        path: fullUrl.pathname + fullUrl.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SecurityTester/1.0',
          ...additionalHeaders
        }
      };

      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }

      const req = (fullUrl.protocol === 'https:' ? https : http).request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: parsedData
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: responseData
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  recordTest(testName, result) {
    this.results.push({
      testName,
      ...result,
      timestamp: new Date().toISOString()
    });
  }

  isVulnerable(response) {
    // SQL Injection 취약점 감지
    if (response.data && typeof response.data === 'string') {
      return response.data.includes('error') && 
             response.data.toLowerCase().includes('sql');
    }
    return false;
  }

  containsXSS(data, payload) {
    // XSS 취약점 감지
    if (data && typeof data === 'string') {
      return data.includes(payload) && !data.includes('&lt;') && !data.includes('&gt;');
    }
    return false;
  }

  isInputValidationBypassed(response) {
    // 입력 검증 우회 감지
    return response.statusCode === 200 && response.data && 
           (response.data.error === undefined || response.data.error === null);
  }

  printResults() {
    console.log('\n📊 보안 테스트 결과');
    console.log('='.repeat(60));

    const vulnerableTests = this.results.filter(r => r.vulnerable);
    const totalTests = this.results.length;

    console.log(`\n📈 테스트 통계:`);
    console.log(`  - 총 테스트: ${totalTests}개`);
    console.log(`  - 취약점 발견: ${vulnerableTests.length}개`);
    console.log(`  - 안전한 테스트: ${totalTests - vulnerableTests.length}개`);

    if (vulnerableTests.length > 0) {
      console.log(`\n🚨 발견된 취약점:`);
      vulnerableTests.forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.testName}`);
        if (test.details) {
          console.log(`     상세: ${JSON.stringify(test.details).substring(0, 100)}...`);
        }
      });
    } else {
      console.log(`\n✅ 발견된 취약점이 없습니다!`);
    }

    console.log(`\n💡 보안 권장사항:`);
    console.log(`  - 입력 검증 강화`);
    console.log(`  - 출력 인코딩 적용`);
    console.log(`  - CSRF 토큰 구현`);
    console.log(`  - Rate Limiting 적용`);
    console.log(`  - 보안 헤더 설정`);
    console.log(`  - JWT 토큰 검증 강화`);

    console.log(`\n✅ 보안 테스트 완료`);
  }
}

// 테스트 실행
async function runSecurityTests() {
  const tester = new SecurityTester();
  await tester.runSecurityTests();
}

// 스크립트가 직접 실행된 경우
if (require.main === module) {
  runSecurityTests().catch(console.error);
}

module.exports = SecurityTester;










