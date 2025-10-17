// Redis 연결 테스트 스크립트
const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

async function testRedisConnection() {
  let redis = null;
  
  try {
    console.log('🔴 Redis 연결 테스트 시작...');
    console.log('Redis URL:', process.env.REDIS_URL ? '설정됨' : '설정되지 않음');
    
    // Redis 연결 설정
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: process.env.REDIS_DB || 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    };
    
    redis = new Redis(redisConfig);
    
    // 연결 이벤트 리스너
    redis.on('connect', () => {
      console.log('✅ Redis 연결 성공');
    });
    
    redis.on('error', (err) => {
      console.error('❌ Redis 연결 오류:', err.message);
    });
    
    // PING 테스트
    const pong = await redis.ping();
    console.log('🏓 PING 응답:', pong);
    
    // 기본 정보 조회
    const info = await redis.info('server');
    console.log('📊 Redis 서버 정보:');
    const lines = info.split('\r\n');
    lines.forEach(line => {
      if (line.includes('redis_version') || line.includes('uptime_in_seconds') || line.includes('connected_clients')) {
        console.log(`  - ${line}`);
      }
    });
    
    // 메모리 사용량 확인
    const memoryInfo = await redis.info('memory');
    const memoryLines = memoryInfo.split('\r\n');
    console.log('💾 메모리 사용량:');
    memoryLines.forEach(line => {
      if (line.includes('used_memory_human') || line.includes('used_memory_peak_human')) {
        console.log(`  - ${line}`);
      }
    });
    
    // 데이터베이스 크기 확인
    const dbSize = await redis.dbsize();
    console.log(`📈 데이터베이스 크기: ${dbSize}개 키`);
    
    // 샘플 데이터 테스트
    const testKey = 'test:connection';
    const testValue = 'test-value-' + Date.now();
    
    await redis.set(testKey, testValue, 'EX', 60); // 60초 후 만료
    const retrievedValue = await redis.get(testKey);
    
    if (retrievedValue === testValue) {
      console.log('✅ 데이터 읽기/쓰기 테스트 성공');
    } else {
      console.log('❌ 데이터 읽기/쓰기 테스트 실패');
    }
    
    // 테스트 키 삭제
    await redis.del(testKey);
    
    // 캐시 테스트
    const cacheKey = 'cache:test';
    const cacheValue = { message: 'Hello Redis!', timestamp: new Date().toISOString() };
    
    await redis.setex(cacheKey, 30, JSON.stringify(cacheValue)); // 30초 후 만료
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      console.log('✅ JSON 캐시 테스트 성공:', parsedData.message);
    } else {
      console.log('❌ JSON 캐시 테스트 실패');
    }
    
    // 캐시 키 삭제
    await redis.del(cacheKey);
    
    console.log('✅ Redis 테스트 완료');
    
  } catch (error) {
    console.error('❌ Redis 연결 실패:', error.message);
    
    // Redis가 설치되지 않은 경우 안내
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Redis가 설치되지 않았거나 실행되지 않고 있습니다.');
      console.log('   Windows에서 Redis 설치 방법:');
      console.log('   1. Chocolatey: choco install redis-64');
      console.log('   2. 또는 Docker: docker run -d -p 6379:6379 redis:alpine');
    }
    
    process.exit(1);
  } finally {
    if (redis) {
      await redis.disconnect();
      console.log('🔌 Redis 연결 종료');
    }
  }
}

testRedisConnection();










