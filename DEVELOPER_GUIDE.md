# Youniqle 개발자 가이드

## 📖 목차

1. [개발 환경 설정](#개발-환경-설정)
2. [프로젝트 구조](#프로젝트-구조)
3. [코딩 컨벤션](#코딩-컨벤션)
4. [API 개발 가이드](#api-개발-가이드)
5. [데이터베이스 가이드](#데이터베이스-가이드)
6. [보안 및 성능](#보안-및-성능)
7. [테스트 가이드](#테스트-가이드)
8. [배포 가이드](#배포-가이드)

---

## 개발 환경 설정

### 🚀 필수 요구사항

#### 시스템 요구사항
- **Node.js**: 18.x 이상
- **npm**: 9.x 이상
- **MongoDB**: 5.0 이상
- **Redis**: 6.0 이상
- **Git**: 2.30 이상

#### 권장 개발 도구
- **IDE**: VS Code
- **브라우저**: Chrome, Firefox, Safari, Edge
- **데이터베이스 도구**: MongoDB Compass, RedisInsight
- **API 테스트**: Postman, Insomnia

### 🔧 환경 설정

#### 1. 프로젝트 클론 및 설치
```bash
# 저장소 클론
git clone https://github.com/your-org/youniqle.git
cd youniqle

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
```

#### 2. 환경 변수 설정
```env
# .env.local
# Database
MONGODB_URI=mongodb://localhost:27017/youniqle
REDIS_URL=redis://localhost:6379

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Authentication
JWT_SECRET=your-jwt-secret-key

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# External Services
OPENAI_API_KEY=your-openai-api-key
NICEPAY_MERCHANT_ID=your-nicepay-merchant-id
NICEPAY_API_KEY=your-nicepay-api-key

# Email Service
SMTP_HOST=smtp.hiworks.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
EMAIL_FROM=noreply@youniqle.com
```

#### 3. 데이터베이스 설정
```bash
# MongoDB 시작
mongod --dbpath /path/to/your/db

# Redis 시작
redis-server

# 데이터베이스 초기화 (선택사항)
npm run db:seed
```

#### 4. 개발 서버 실행
```bash
# 개발 서버 시작
npm run dev

# 또는 특정 포트로 실행
npm run dev -- -p 3001
```

### 🛠️ VS Code 설정

#### 권장 확장 프로그램
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "mongodb.mongodb-vscode",
    "ms-vscode.vscode-json"
  ]
}
```

#### VS Code 설정 파일
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

---

## 프로젝트 구조

### 📁 디렉토리 구조

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API 라우트
│   │   ├── auth/                 # 인증 API
│   │   ├── admin/                # 관리자 API
│   │   ├── marketing/            # 마케팅 API
│   │   ├── products/             # 상품 API
│   │   ├── orders/               # 주문 API
│   │   ├── notifications/        # 알림 API
│   │   └── personalization/      # 개인화 API
│   ├── admin/                    # 관리자 페이지
│   ├── partner/                  # 파트너 페이지
│   ├── products/                 # 상품 페이지
│   ├── content/                  # 콘텐츠 페이지
│   └── me/                       # 마이페이지
├── components/                   # 재사용 가능한 컴포넌트
│   ├── ui/                       # 기본 UI 컴포넌트
│   ├── admin/                    # 관리자 컴포넌트
│   ├── analytics/                # 분석 컴포넌트
│   ├── notifications/            # 알림 컴포넌트
│   ├── recommendations/          # 추천 컴포넌트
│   └── marketing/                # 마케팅 컴포넌트
├── lib/                          # 유틸리티 함수
│   ├── auth.ts                   # 인증 관련
│   ├── db.ts                     # 데이터베이스 연결
│   ├── validators.ts             # 입력 검증
│   ├── rateLimiter.ts            # Rate Limiting
│   ├── security.ts               # 보안 미들웨어
│   ├── cache.ts                  # Redis 캐싱
│   ├── performanceMonitor.ts     # 성능 모니터링
│   ├── imageOptimizer.ts         # 이미지 최적화
│   └── dbOptimizer.ts            # DB 최적화
├── models/                       # Mongoose 모델
├── hooks/                        # 커스텀 훅
├── types/                        # TypeScript 타입 정의
└── styles/                       # 스타일 파일
```

### 🏗️ 아키텍처 패턴

#### 1. 계층화 아키텍처
```
Presentation Layer (Pages/Components)
    ↓
Business Logic Layer (API Routes)
    ↓
Data Access Layer (Models/Services)
    ↓
Database Layer (MongoDB/Redis)
```

#### 2. 컴포넌트 구조
```
Component/
├── index.tsx          # 메인 컴포넌트
├── types.ts           # 타입 정의
├── hooks.ts           # 커스텀 훅
├── utils.ts           # 유틸리티 함수
└── styles.module.css  # 스타일 (필요시)
```

---

## 코딩 컨벤션

### 📝 TypeScript 컨벤션

#### 네이밍 규칙
```typescript
// 변수 및 함수: camelCase
const userName = 'john';
const getUserData = () => {};

// 상수: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// 인터페이스: PascalCase with I prefix
interface IUser {
  id: string;
  name: string;
  email: string;
}

// 타입: PascalCase
type UserRole = 'admin' | 'partner' | 'user';

// 열거형: PascalCase
enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed'
}
```

#### 함수 작성 규칙
```typescript
// 화살표 함수 사용
const calculateTotal = (items: OrderItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

// 비동기 함수
const fetchUserData = async (userId: string): Promise<IUser> => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

// 제네릭 함수
const createApiResponse = <T>(data: T, message: string): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
};
```

### 🎨 React 컨벤션

#### 컴포넌트 작성 규칙
```typescript
// 함수형 컴포넌트 사용
interface UserCardProps {
  user: IUser;
  onEdit?: (user: IUser) => void;
  onDelete?: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onEdit, 
  onDelete 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = useCallback(() => {
    onEdit?.(user);
  }, [user, onEdit]);

  const handleDelete = useCallback(async () => {
    setIsLoading(true);
    try {
      await onDelete?.(user.id);
    } finally {
      setIsLoading(false);
    }
  }, [user.id, onDelete]);

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <div className="actions">
        <button onClick={handleEdit}>Edit</button>
        <button onClick={handleDelete} disabled={isLoading}>
          {isLoading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default UserCard;
```

#### 훅 사용 규칙
```typescript
// 커스텀 훅 작성
const useUserData = (userId: string) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await fetchUserData(userId);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  return { user, loading, error };
};
```

### 🎯 API 컨벤션

#### API 라우트 작성 규칙
```typescript
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRateLimitMiddleware } from '@/lib/rateLimiter';
import { createSecurityMiddleware } from '@/lib/security';
import { InputValidator, commonSchemas } from '@/lib/validators';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting 적용
    const rateLimitCheck = await createRateLimitMiddleware('global')(request);
    if (rateLimitCheck) return rateLimitCheck;

    // 보안 검증
    const securityCheck = createSecurityMiddleware()(request);
    if (securityCheck) return securityCheck;

    // 쿼리 파라미터 검증
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    
    const validator = new InputValidator(commonSchemas.userQuery);
    const validationResult = validator.validate(query);
    
    if (!validationResult.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validationResult.errors 
        },
        { status: 400 }
      );
    }

    const validatedQuery = validationResult.sanitizedData;
    
    // 데이터베이스 쿼리
    const users = await User.find(validatedQuery)
      .select('-passwordHash')
      .limit(validatedQuery.limit || 10)
      .skip((validatedQuery.page - 1) * (validatedQuery.limit || 10));

    const totalUsers = await User.countDocuments(validatedQuery);

    return NextResponse.json({
      users,
      pagination: {
        page: validatedQuery.page || 1,
        limit: validatedQuery.limit || 10,
        total: totalUsers,
        pages: Math.ceil(totalUsers / (validatedQuery.limit || 10))
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 에러 처리 규칙
```typescript
// 에러 타입 정의
interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// 에러 생성 함수
const createApiError = (
  code: string, 
  message: string, 
  details?: any
): ApiError => ({
  code,
  message,
  details
});

// 에러 응답 생성
const createErrorResponse = (error: ApiError, status: number) => {
  return NextResponse.json(error, { status });
};

// 사용 예시
if (!user) {
  return createErrorResponse(
    createApiError('USER_NOT_FOUND', 'User not found'),
    404
  );
}
```

---

## API 개발 가이드

### 🚀 API 설계 원칙

#### RESTful API 설계
```typescript
// 리소스 기반 URL 설계
GET    /api/users              # 사용자 목록 조회
GET    /api/users/{id}         # 특정 사용자 조회
POST   /api/users              # 사용자 생성
PUT    /api/users/{id}         # 사용자 전체 수정
PATCH  /api/users/{id}         # 사용자 부분 수정
DELETE /api/users/{id}         # 사용자 삭제

// 중첩 리소스
GET    /api/users/{id}/orders  # 사용자의 주문 목록
POST   /api/users/{id}/orders  # 사용자 주문 생성
```

#### API 버전 관리
```typescript
// URL 버전 관리
GET /api/v1/users
GET /api/v2/users

// 헤더 버전 관리
Accept: application/vnd.youniqle.v1+json
API-Version: 1.0
```

### 📊 API 응답 형식

#### 표준 응답 형식
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// 성공 응답 예시
{
  "success": true,
  "data": {
    "users": [...],
    "total": 100
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123456",
    "version": "1.0"
  }
}

// 에러 응답 예시
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Invalid email format"
    }
  },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123456",
    "version": "1.0"
  }
}
```

### 🔐 인증 및 권한

#### JWT 토큰 처리
```typescript
// 토큰 생성
const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '24h',
    issuer: 'youniqle',
    audience: 'youniqle-users'
  });
};

// 토큰 검증
const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// 미들웨어에서 토큰 검증
const authenticateToken = (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No token provided');
  }
  
  return verifyToken(token);
};
```

#### 권한 검증
```typescript
// 권한 레벨 정의
enum PermissionLevel {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin'
}

// 권한 검증 함수
const checkPermission = (
  userRole: string, 
  requiredRole: string
): boolean => {
  const roleHierarchy = {
    'user': 1,
    'partner': 2,
    'admin': 3
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// 권한 미들웨어
const requirePermission = (requiredRole: string) => {
  return (req: NextRequest) => {
    const user = authenticateToken(req);
    
    if (!checkPermission(user.role, requiredRole)) {
      throw new Error('Insufficient permissions');
    }
    
    return user;
  };
};
```

### 📝 입력 검증

#### Zod 스키마 정의
```typescript
import { z } from 'zod';

// 사용자 생성 스키마
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number').optional(),
  role: z.enum(['user', 'partner', 'admin']).default('user')
});

// 상품 쿼리 스키마
const productQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});
```

#### 검증 미들웨어
```typescript
const validateRequest = (schema: z.ZodSchema) => {
  return (req: NextRequest) => {
    try {
      const body = req.json();
      const validatedData = schema.parse(body);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors
          }
        };
      }
      throw error;
    }
  };
};
```

---

## 데이터베이스 가이드

### 🗄️ MongoDB 모델 설계

#### 모델 정의 예시
```typescript
// src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role: 'user' | 'partner' | 'admin';
  grade: 'cedar' | 'rooter' | 'bloomer' | 'glower' | 'ecosoul';
  points: number;
  addresses: Address[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema({
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const UserSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: { type: String, required: true },
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  phone: { 
    type: String,
    trim: true,
    match: /^\+?[0-9]{10,15}$/
  },
  role: { 
    type: String, 
    enum: ['user', 'partner', 'admin'],
    default: 'user'
  },
  grade: { 
    type: String, 
    enum: ['cedar', 'rooter', 'bloomer', 'glower', 'ecosoul'],
    default: 'cedar'
  },
  points: { type: Number, default: 0, min: 0 },
  addresses: [AddressSchema],
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.passwordHash;
      return ret;
    }
  }
});

// 인덱스 설정
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ points: -1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
```

#### 관계형 데이터 모델링
```typescript
// src/models/Order.ts
export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentInfo: PaymentInfo;
  status: OrderStatus;
  partnerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  name: { type: String, required: true },
  image: { type: String }
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true, min: 0 },
  shippingAddress: AddressSchema,
  paymentInfo: {
    method: { type: String, required: true },
    transactionId: { type: String },
    status: { type: String, required: true }
  },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'],
    default: 'pending'
  },
  partnerId: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// 인덱스 설정
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ partnerId: 1 });
OrderSchema.index({ createdAt: -1 });
```

### 🔍 쿼리 최적화

#### 인덱스 전략
```typescript
// 복합 인덱스
UserSchema.index({ role: 1, isActive: 1, createdAt: -1 });

// 텍스트 검색 인덱스
ProductSchema.index({ 
  name: 'text', 
  description: 'text',
  category: 'text' 
});

// 부분 인덱스
OrderSchema.index(
  { status: 1, createdAt: -1 },
  { partialFilterExpression: { status: { $in: ['pending', 'processing'] } } }
);
```

#### 쿼리 최적화 예시
```typescript
// 비효율적인 쿼리
const users = await User.find({})
  .sort({ createdAt: -1 })
  .limit(10);

// 효율적인 쿼리
const users = await User.find({ isActive: true })
  .select('name email role createdAt')
  .sort({ createdAt: -1 })
  .limit(10);

// 집계 쿼리
const orderStats = await Order.aggregate([
  {
    $match: {
      createdAt: { $gte: new Date('2024-01-01') }
    }
  },
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalAmount: { $sum: '$totalAmount' }
    }
  },
  {
    $sort: { count: -1 }
  }
]);
```

### 🚀 Redis 캐싱

#### 캐시 전략
```typescript
// 캐시 키 생성
const generateCacheKey = (prefix: string, ...params: any[]): string => {
  return `${prefix}:${params.join(':')}`;
};

// 캐시 조회
const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

// 캐시 저장
const setCachedData = async <T>(
  key: string, 
  data: T, 
  ttl: number = 3600
): Promise<void> => {
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

// 캐시 무효화
const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};
```

#### 캐시 적용 예시
```typescript
// 상품 목록 조회 with 캐싱
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams);
  
  // 캐시 키 생성
  const cacheKey = generateCacheKey('products', JSON.stringify(query));
  
  // 캐시에서 조회
  const cachedData = await getCachedData(cacheKey);
  if (cachedData) {
    return NextResponse.json(cachedData);
  }
  
  // 데이터베이스에서 조회
  const products = await Product.find(query).limit(10);
  
  // 캐시에 저장
  await setCachedData(cacheKey, products, 300); // 5분 TTL
  
  return NextResponse.json(products);
}
```

---

## 보안 및 성능

### 🛡️ 보안 구현

#### Rate Limiting
```typescript
// Rate Limiting 미들웨어
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: 'Too many requests from this IP'
};

const rateLimiter = new RateLimiter(rateLimitConfig);

export const rateLimitMiddleware = async (req: NextRequest) => {
  const clientId = getClientIdentifier(req);
  const { allowed, remaining, reset } = await rateLimiter.check(clientId);
  
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitConfig.max.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      }
    );
  }
  
  return null;
};
```

#### 입력 검증 및 살균
```typescript
// XSS 방지
const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// SQL Injection 방지 (MongoDB는 NoSQL이지만 유사한 공격 방지)
const sanitizeQuery = (query: any): any => {
  // MongoDB 쿼리 객체 검증
  if (typeof query === 'string') {
    return sanitizeInput(query);
  }
  
  if (typeof query === 'object' && query !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(query)) {
      sanitized[sanitizeInput(key)] = sanitizeQuery(value);
    }
    return sanitized;
  }
  
  return query;
};
```

#### CORS 설정
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400'
};

export const corsMiddleware = (req: NextRequest) => {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }
  
  return null;
};
```

### ⚡ 성능 최적화

#### 이미지 최적화
```typescript
// Sharp를 사용한 이미지 최적화
import sharp from 'sharp';

const optimizeImage = async (
  inputBuffer: Buffer,
  options: {
    width?: number;
    height?: number;
    format?: 'jpeg' | 'png' | 'webp' | 'avif';
    quality?: number;
  }
): Promise<Buffer> => {
  const { width, height, format = 'webp', quality = 80 } = options;
  
  let sharpInstance = sharp(inputBuffer);
  
  if (width || height) {
    sharpInstance = sharpInstance.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }
  
  switch (format) {
    case 'jpeg':
      sharpInstance = sharpInstance.jpeg({ quality });
      break;
    case 'png':
      sharpInstance = sharpInstance.png({ quality });
      break;
    case 'webp':
      sharpInstance = sharpInstance.webp({ quality });
      break;
    case 'avif':
      sharpInstance = sharpInstance.avif({ quality });
      break;
  }
  
  return await sharpInstance.toBuffer();
};
```

#### 데이터베이스 쿼리 최적화
```typescript
// 쿼리 성능 모니터링
const monitorQuery = async <T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const start = Date.now();
  
  try {
    const result = await queryFn();
    const duration = Date.now() - start;
    
    // 성능 메트릭 기록
    console.log(`Query ${queryName} completed in ${duration}ms`);
    
    if (duration > 1000) {
      console.warn(`Slow query detected: ${queryName} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`Query ${queryName} failed after ${duration}ms:`, error);
    throw error;
  }
};

// 사용 예시
const users = await monitorQuery('getUsers', () => 
  User.find({ isActive: true })
    .select('name email')
    .limit(10)
    .lean()
);
```

---

## 테스트 가이드

### 🧪 테스트 설정

#### Jest 설정
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### 테스트 유틸리티
```typescript
// src/__tests__/utils/testUtils.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export const setupTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
};

export const teardownTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

export const createTestUser = async (overrides = {}) => {
  const User = require('@/models/User').default;
  
  return await User.create({
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    name: 'Test User',
    role: 'user',
    ...overrides
  });
};
```

#### API 테스트 예시
```typescript
// src/__tests__/api/users.test.ts
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/users/route';
import { setupTestDB, teardownTestDB, createTestUser } from '../utils/testUtils';

describe('/api/users', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/users', () => {
    it('should return users list', async () => {
      // 테스트 데이터 생성
      await createTestUser({ email: 'user1@example.com' });
      await createTestUser({ email: 'user2@example.com' });

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.users).toHaveLength(2);
    });

    it('should handle pagination', async () => {
      const request = new NextRequest('http://localhost:3000/api/users?page=1&limit=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(1);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'Password123!',
        name: 'New User'
      };

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe(userData.email);
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

---

## 배포 가이드

### 🚀 Vercel 배포

#### 배포 설정
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "JWT_SECRET": "@jwt_secret",
    "NEXTAUTH_SECRET": "@nextauth_secret"
  }
}
```

#### 환경 변수 설정
```bash
# Vercel CLI를 사용한 환경 변수 설정
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add REDIS_URL
vercel env add OPENAI_API_KEY
```

#### 배포 스크립트
```bash
#!/bin/bash
# deploy.sh

echo "🚀 배포 시작..."

# 1. 테스트 실행
echo "1. 테스트 실행 중..."
npm test
if [ $? -ne 0 ]; then
  echo "❌ 테스트 실패. 배포를 중단합니다."
  exit 1
fi

# 2. 빌드 실행
echo "2. 빌드 실행 중..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ 빌드 실패. 배포를 중단합니다."
  exit 1
fi

# 3. Vercel 배포
echo "3. Vercel 배포 중..."
vercel --prod

echo "✅ 배포 완료!"
```

### 🐳 Docker 배포

#### Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/youniqle
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:6.0-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:
```

---

## 📚 추가 자료

### 🔗 관련 문서
- [사용자 메뉴얼](./USER_MANUAL.md)
- [테스트 가이드](./TESTING_GUIDE.md)
- [API 문서](./API_DOCUMENTATION.md)

### 🛠️ 개발 도구
- [Next.js 공식 문서](https://nextjs.org/docs)
- [MongoDB 공식 문서](https://docs.mongodb.com/)
- [Redis 공식 문서](https://redis.io/documentation)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)

### 📞 지원 및 문의
- **이메일**: suchwawa@sapienet.com
- **전화**: 1577-0729
- **GitHub Issues**: 프로젝트 저장소의 Issues 탭

---

*이 개발자 가이드는 Youniqle 플랫폼의 개발에 필요한 모든 정보를 제공합니다. 지속적으로 업데이트되며, 새로운 기능이나 변경사항이 있을 때마다 반영됩니다.*















