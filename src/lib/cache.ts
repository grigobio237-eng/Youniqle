// Redis 캐싱 시스템
import Redis from 'ioredis';

class CacheManager {
  private redis: Redis | null = null;
  private isConnected = false;
  private memoryCache = new Map<string, { value: any; expires: number }>(); // 메모리 캐시 fallback

  constructor() {
    this.initializeRedis();
    this.startMemoryCacheCleanup();
  }

  // 메모리 캐시 정리 (만료된 항목 제거)
  private startMemoryCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, cached] of this.memoryCache.entries()) {
        if (now > cached.expires) {
          this.memoryCache.delete(key);
        }
      }
    }, 60000); // 1분마다 정리
  }

  private initializeRedis() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          // 최대 5회만 재시도
          if (times > 5) {
            console.log('❌ Redis 연결 실패: 최대 재시도 횟수 초과, 메모리 캐시로 전환');
            return null; // 재시도 중단
          }
          const delay = Math.min(times * 100, 2000);
          console.log(`Redis 연결 재시도: ${times}회, ${delay}ms 후`);
          return delay;
        },
  lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 5000, // 타임아웃 단축
        commandTimeout: 3000,
        enableReadyCheck: false, // Ready 체크 비활성화
    });

    this.redis.on('connect', () => {
        console.log('✅ Redis 연결 성공');
      this.isConnected = true;
    });

    this.redis.on('error', (error) => {
        console.error('❌ Redis 연결 오류:', error.message);
      this.isConnected = false;
    });

    this.redis.on('close', () => {
        console.log('🔌 Redis 연결 종료');
      this.isConnected = false;
      });

    } catch (error) {
      console.error('❌ Redis 초기화 실패:', error);
      this.redis = null;
    }
  }

  // 캐시 연결 확인
  private async ensureConnection(): Promise<boolean> {
    if (!this.redis) {
      console.log('⚠️ Redis가 초기화되지 않았습니다.');
      return false;
    }

    if (!this.isConnected) {
      try {
        // 이미 연결 중인지 확인
        if (this.redis.status === 'connecting') {
          // 연결 중이면 잠시 대기 후 재시도
          await new Promise(resolve => setTimeout(resolve, 100));
          return this.isConnected;
        }
        
        await this.redis.connect();
        return true;
      } catch (error) {
        // 이미 연결된 경우 무시
        if (error instanceof Error && error.message?.includes('already connecting/connected')) {
          return true;
        }
        console.error('❌ Redis 연결 실패:', error);
        return false;
      }
    }

    return true;
  }

  // 캐시에 데이터 저장
  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    try {
      const connected = await this.ensureConnection();
      if (!connected) {
        // Redis 연결 실패 시 메모리 캐시 사용
        const expires = Date.now() + (ttl * 1000);
        this.memoryCache.set(key, { value, expires });
        console.log(`📝 메모리 캐시 저장: ${key} (TTL: ${ttl}s)`);
        return true;
      }

      const serializedValue = JSON.stringify(value);
      await this.redis!.setex(key, ttl, serializedValue);
      
      console.log(`📝 Redis 캐시 저장: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      // Redis 오류 시 메모리 캐시로 fallback
      const expires = Date.now() + (ttl * 1000);
      this.memoryCache.set(key, { value, expires });
      console.log(`📝 Redis 오류로 메모리 캐시 저장: ${key} (TTL: ${ttl}s)`);
      return true;
    }
  }

  // 캐시에서 데이터 조회
  async get(key: string): Promise<any | null> {
    try {
      const connected = await this.ensureConnection();
      if (!connected) {
        // Redis 연결 실패 시 메모리 캐시에서 조회
        const cached = this.memoryCache.get(key);
        if (!cached) return null;
        
        if (Date.now() > cached.expires) {
          this.memoryCache.delete(key);
          return null;
        }
        
        console.log(`📖 메모리 캐시 조회: ${key}`);
        return cached.value;
      }

      const value = await this.redis!.get(key);
      if (value === null) return null;

      const parsedValue = JSON.parse(value);
      console.log(`📖 Redis 캐시 조회: ${key}`);
      return parsedValue;
    } catch (error) {
      // Redis 오류 시 메모리 캐시에서 조회
      const cached = this.memoryCache.get(key);
      if (!cached) return null;
      
      if (Date.now() > cached.expires) {
        this.memoryCache.delete(key);
        return null;
      }
      
      console.log(`📖 Redis 오류로 메모리 캐시 조회: ${key}`);
      return cached.value;
    }
  }

  // 캐시에서 데이터 삭제
  async del(key: string): Promise<boolean> {
    try {
      const connected = await this.ensureConnection();
      if (!connected) return false;

      await this.redis!.del(key);
      console.log(`🗑️ 캐시 삭제: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ 캐시 삭제 실패: ${key}`, error);
      return false;
    }
  }

  // 패턴으로 캐시 삭제
  async delPattern(pattern: string): Promise<boolean> {
    try {
      const connected = await this.ensureConnection();
      if (!connected) return false;

      const keys = await this.redis!.keys(pattern);
      if (keys.length > 0) {
        await this.redis!.del(...keys);
        console.log(`🗑️ 패턴 캐시 삭제: ${pattern} (${keys.length}개)`);
      }
      return true;
    } catch (error) {
      console.error(`❌ 패턴 캐시 삭제 실패: ${pattern}`, error);
      return false;
    }
  }

  // 캐시 TTL 확인
  async ttl(key: string): Promise<number> {
    try {
      const connected = await this.ensureConnection();
      if (!connected) return -1;

      return await this.redis!.ttl(key);
    } catch (error) {
      console.error(`❌ TTL 조회 실패: ${key}`, error);
      return -1;
    }
  }

  // 캐시 존재 확인
  async exists(key: string): Promise<boolean> {
    try {
      const connected = await this.ensureConnection();
      if (!connected) return false;

      const result = await this.redis!.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`❌ 캐시 존재 확인 실패: ${key}`, error);
      return false;
    }
  }

  // 캐시 키 목록 조회
  async keys(pattern: string = '*'): Promise<string[]> {
    try {
      const connected = await this.ensureConnection();
      if (!connected) return [];

      return await this.redis!.keys(pattern);
    } catch (error) {
      console.error(`❌ 키 목록 조회 실패: ${pattern}`, error);
      return [];
    }
  }

  // 캐시 통계 조회
  async getStats(): Promise<any> {
    try {
      const connected = await this.ensureConnection();
      if (!connected) return null;

      const info = await this.redis!.info();
      const keys = await this.redis!.keys('*');

      return {
        connected: this.isConnected,
        keyCount: keys.length,
        memory: info.match(/used_memory_human:([^\r\n]+)/)?.[1] || 'N/A',
        uptime: info.match(/uptime_in_seconds:(\d+)/)?.[1] || 'N/A',
        connectedClients: info.match(/connected_clients:(\d+)/)?.[1] || 'N/A'
      };
    } catch (error) {
      console.error('❌ 캐시 통계 조회 실패:', error);
      return null;
    }
  }

  // 캐시 연결 종료
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.disconnect();
      this.isConnected = false;
      console.log('🔌 Redis 연결 종료');
    }
  }
}

// 싱글톤 인스턴스
const cacheManager = new CacheManager();

// 캐시 키 생성 헬퍼 함수들
export const CacheKeys = {
  // 상품 관련
  products: (page: number, limit: number, filters?: any) => 
    `products:${page}:${limit}:${JSON.stringify(filters || {})}`,
  product: (id: string) => `product:${id}`,
  productSearch: (query: string, page: number, limit: number) => 
    `product_search:${query}:${page}:${limit}`,
  
  // 사용자 관련
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user_profile:${id}`,
  
  // 주문 관련
  userOrders: (userId: string, page: number, limit: number) => 
    `user_orders:${userId}:${page}:${limit}`,
  order: (id: string) => `order:${id}`,
  
  // 장바구니 관련
  cart: (userId: string) => `cart:${userId}`,
  
  // 추천 관련
  recommendations: (userId: string, type: string, limit: number) => 
    `recommendations:${userId}:${type}:${limit}`,
  personalizedRecommendations: (userId: string, limit: number) => 
    `personalized_recommendations:${userId}:${limit}`,
  
  // 분석 관련
  analytics: (type: string, range: string) => `analytics:${type}:${range}`,
  
  // 알림 관련
  userNotifications: (userId: string, page: number, limit: number) => 
    `user_notifications:${userId}:${page}:${limit}`,
};

// 캐시 래퍼 함수들
export const cache = {
  // 기본 캐시 작업
  set: (key: string, value: any, ttl: number = 3600) => 
    cacheManager.set(key, value, ttl),
  get: (key: string) => cacheManager.get(key),
  del: (key: string) => cacheManager.del(key),
  delPattern: (pattern: string) => cacheManager.delPattern(pattern),
  exists: (key: string) => cacheManager.exists(key),
  ttl: (key: string) => cacheManager.ttl(key),
  
  // 상품 캐시
  setProducts: (page: number, limit: number, products: any, filters?: any, ttl: number = 1800) => 
    cacheManager.set(CacheKeys.products(page, limit, filters), products, ttl),
  getProducts: (page: number, limit: number, filters?: any) => 
    cacheManager.get(CacheKeys.products(page, limit, filters)),
  
  // 사용자 캐시
  setUser: (id: string, user: any, ttl: number = 3600) => 
    cacheManager.set(CacheKeys.user(id), user, ttl),
  getUser: (id: string) => cacheManager.get(CacheKeys.user(id)),
  
  // 추천 캐시
  setRecommendations: (userId: string, type: string, limit: number, recommendations: any, ttl: number = 1800) => 
    cacheManager.set(CacheKeys.recommendations(userId, type, limit), recommendations, ttl),
  getRecommendations: (userId: string, type: string, limit: number) => 
    cacheManager.get(CacheKeys.recommendations(userId, type, limit)),
  
  // 분석 캐시
  setAnalytics: (type: string, range: string, data: any, ttl: number = 300) => 
    cacheManager.set(CacheKeys.analytics(type, range), data, ttl),
  getAnalytics: (type: string, range: string) => 
    cacheManager.get(CacheKeys.analytics(type, range)),
  
  // 통계
  getStats: () => cacheManager.getStats(),
  
  // 키 목록 조회
  keys: (pattern: string = '*') => cacheManager.keys(pattern),
  
  // 연결 종료
  disconnect: () => cacheManager.disconnect(),
};

// getCacheManager 함수 추가
export function getCacheManager() {
  return cache;
}

export default cache;