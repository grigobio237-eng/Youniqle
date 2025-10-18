# Google Geocoding API 설정 가이드

## 1. Google Cloud Console에서 API 키 설정

### 1.1 Google Cloud Console 접속
- https://console.cloud.google.com 접속
- Google 계정으로 로그인

### 1.2 프로젝트 선택 또는 생성
1. 상단의 프로젝트 선택 드롭다운 클릭
2. "새 프로젝트" 클릭하여 새 프로젝트 생성
3. 프로젝트 이름: `Youniqle Address Search`
4. "만들기" 클릭

### 1.3 Geocoding API 활성화
1. 좌측 메뉴에서 "API 및 서비스" → "라이브러리" 클릭
2. "Geocoding API" 검색
3. "Geocoding API" 클릭
4. "사용" 버튼 클릭

### 1.4 API 키 생성
1. 좌측 메뉴에서 "API 및 서비스" → "사용자 인증 정보" 클릭
2. "사용자 인증 정보 만들기" → "API 키" 클릭
3. 생성된 API 키 복사

### 1.5 API 키 제한 설정 (권장)
1. 생성된 API 키 옆의 연필 아이콘 클릭
2. "애플리케이션 제한사항" 설정:
   - "HTTP 리퍼러(웹사이트)" 선택
   - 웹사이트 추가: `https://www.grigobio.co.kr/*`
   - 개발용: `http://localhost:3000/*`
3. "API 제한사항" 설정:
   - "키 제한" 선택
   - "Geocoding API" 선택
4. "저장" 클릭

## 2. 환경변수 설정

### 2.1 .env.local 파일 생성/수정
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용 추가:

```env
# Google Geocoding API (Gemini API 키와 동일한 키 사용 가능)
GOOGLE_API_KEY=발급받은_Google_API_키
# 또는 기존 Gemini API 키 사용
GEMINI_API_KEY=기존_Gemini_API_키

# 기존 환경변수들
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 2.2 Vercel 환경변수 설정 (배포용)
1. Vercel 대시보드 접속
2. 프로젝트 선택 → Settings → Environment Variables
3. 다음 변수들 추가:
   - `GOOGLE_API_KEY`: 발급받은 Google API 키
   - 또는 `GEMINI_API_KEY`: 기존 Gemini API 키

## 3. API 사용량 및 제한

### 3.1 무료 사용량
- **월 무료 사용량**: 40,000건
- **초당 요청 한도**: 50건
- **일일 요청 한도**: 40,000건

### 3.2 유료 사용량
- 월 40,000건 초과 시 유료
- 상세한 가격은 Google Cloud Console에서 확인

## 4. 테스트 방법

### 4.1 로컬 테스트
1. 환경변수 설정 후 개발 서버 재시작
2. 체크아웃 페이지에서 주소 검색 테스트
3. 브라우저 개발자 도구 콘솔에서 API 호출 로그 확인

### 4.2 검색 가능한 주소 예시
- **한국 주소**: "명일동", "강남구", "부산", "대구"
- **해외 주소**: "Tokyo", "New York", "London", "Paris"
- **영어 주소**: "Seoul, South Korea", "Tokyo, Japan"
- **한글 주소**: "서울특별시 강남구", "부산광역시 해운대구"

## 5. 장점

### 5.1 전 세계 주소 지원
- ✅ **전 세계 모든 국가** 주소 검색
- ✅ **다국어 지원** (한국어, 영어, 일본어 등)
- ✅ **정확한 좌표** 정보 제공
- ✅ **상세한 주소 구성요소** (국가, 시/도, 시/군/구, 도로명 등)

### 5.2 국외 사용자 친화적
- ✅ **해외 배송** 시 주소 입력 편의
- ✅ **다국어 주소** 자동 변환
- ✅ **국제 우편번호** 지원
- ✅ **GPS 좌표** 정보 제공

### 5.3 안정성
- ✅ **Google의 안정적인 인프라**
- ✅ **높은 가용성** (99.9% 이상)
- ✅ **빠른 응답 속도**
- ✅ **확장성**

## 6. 문제 해결

### 6.1 API 키가 설정되지 않은 경우
- 로컬 데이터베이스로 자동 폴백
- 한국 주요 지역 주소만 검색 가능

### 6.2 API 호출 실패 시
- 자동으로 로컬 데이터베이스로 폴백
- 안정적인 서비스 제공

### 6.3 검색 결과가 없는 경우
- 다른 검색어로 시도
- 수동으로 주소 입력 가능

## 7. Gemini API 키 사용 가능 여부

### 7.1 동일한 API 키 사용 가능
- Google의 모든 API는 동일한 API 키 사용 가능
- Gemini API 키를 Google Maps API로도 사용 가능
- 별도의 API 키 발급 불필요

### 7.2 권한 설정
- Gemini API 키에 Geocoding API 권한 추가 필요
- Google Cloud Console에서 API 활성화 필요

## 8. 사용 예시

### 8.1 한국 주소 검색
```
검색어: "명일동"
결과: "서울특별시 강동구 명일동 123-45"
```

### 8.2 해외 주소 검색
```
검색어: "Tokyo"
결과: "Tokyo, Japan"
```

### 8.3 영어 주소 검색
```
검색어: "Seoul, South Korea"
결과: "Seoul, South Korea"
```
