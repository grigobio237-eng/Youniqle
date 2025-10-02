# 📊 데이터베이스 마이그레이션 가이드

## 🎯 완료된 작업

### ✅ 데이터 마이그레이션 완료
- `test` 데이터베이스의 모든 사용자를 `youniqle` 데이터베이스로 성공적으로 마이그레이션
- 총 4명의 사용자가 마이그레이션됨
- 기존 `grigobio237@gmail.com` 계정과 통합

### 📋 최종 사용자 목록 (youniqle 데이터베이스)
1. **grigobio237@gmail.com** (그리고바이오) - 역할: admin
2. **sin93101190@gmail.com** (신연수) - 역할: member (파트너 승인됨)
3. **admin@youniqle.com** (관리자) - 역할: admin
4. **partner@youniqle.com** (김파트너) - 역할: user
5. **user@youniqle.com** (이유저) - 역할: user

---

## 🔧 환경 변수 설정

### 1. .env.local 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# MongoDB 연결 설정 (youniqle 데이터베이스)
MONGODB_URI=mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/youniqle?retryWrites=true&w=majority&appName=Cluster0

# NextAuth.js 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# JWT 시크릿 키
JWT_SECRET=your-jwt-secret-key-here

# OAuth 설정 (Google)
GOOGLE_CLIENT_ID=102136527081-vljs45ri64p6vaigc756p0fe6nu9gkkg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-9Jz8x8x8x8x8x8x8x8x8x8x8x8x8x8x8

# OAuth 설정 (Kakao)
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# OAuth 설정 (Naver)
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret

# 이메일 설정
EMAIL_FROM=noreply@youniqle.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Vercel Blob Storage (선택사항)
BLOB_READ_WRITE_TOKEN=your-blob-token
```

### 2. Vercel 환경 변수 설정
배포된 애플리케이션에도 동일한 환경 변수를 설정하세요:

1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Environment Variables
3. 다음 변수들을 추가:
   - `MONGODB_URI` (youniqle 데이터베이스로 변경)
   - `NEXTAUTH_SECRET`
   - `JWT_SECRET`
   - OAuth 설정들

---

## 🧪 테스트 방법

### 1. 로컬 테스트
```bash
# 환경 변수 설정 후 서버 재시작
npm run dev
```

### 2. 데이터베이스 연결 확인
```bash
node scripts/test-mongodb-connection.js
```

### 3. 사용자 데이터 확인
```bash
node scripts/check-users.js
```

---

## 🔐 관리자 권한 설정

### 허용된 관리자 계정
1. **admin@youniqle.com** (역할: admin)
2. **grigobio237@gmail.com** (역할: admin)

### 파트너 승인 계정
1. **sin93101190@gmail.com** (파트너 상태: approved)
2. **partner@youniqle.com** (파트너 상태: approved)

---

## 🚀 배포 후 확인사항

### 1. 관리자 로그인 테스트
- `admin@youniqle.com` / `admin123!`
- `grigobio237@gmail.com` (구글 소셜 로그인)

### 2. 파트너 로그인 테스트
- `sin93101190@gmail.com` (구글 소셜 로그인)
- `partner@youniqle.com` / `partner123!`

### 3. 일반 사용자 테스트
- `user@youniqle.com` / `user123!`

---

## ⚠️ 주의사항

1. **환경 변수 보안**: `.env.local` 파일은 Git에 커밋하지 마세요
2. **데이터베이스 백업**: 마이그레이션 전 데이터 백업 권장
3. **OAuth 설정**: 실제 서비스용 OAuth 클라이언트 ID/Secret 사용
4. **시크릿 키**: 강력한 랜덤 문자열로 생성

---

## 📞 문제 해결

### 연결 오류 시
1. MongoDB Atlas 네트워크 접근 설정 확인
2. 사용자 권한 확인
3. 연결 문자열 형식 확인

### 인증 오류 시
1. JWT_SECRET 설정 확인
2. NextAuth 설정 확인
3. OAuth 설정 확인

---

이제 모든 데이터가 `youniqle` 데이터베이스에 통합되어 일관된 서비스가 가능합니다! 🎉
