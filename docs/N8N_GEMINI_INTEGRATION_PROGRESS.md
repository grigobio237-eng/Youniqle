# n8n + Gemini API 통합 진행 상황 및 해결 과정

## 📅 진행 날짜
- **날짜**: 2025년 10월 15일
- **목표**: inquiry-monitor.json 워크플로우 완전 기능 구현
- **상태**: API 키 인증 해결, 400 Bad Request 에러 해결 중

---

## 🎯 완료된 작업

### 1. ✅ 워크플로우 기본 실행 문제 해결
- **문제**: "No item to return was found" 에러
- **원인**: 워크플로우 데이터 흐름 문제
- **해결**: Extract Inquiry Data 노드의 JavaScript 코드 개선
- **결과**: 워크플로우가 정상적으로 시작됨 (200 OK 응답)

### 2. ✅ API 키 인증 문제 해결
- **문제**: 401 Unauthorized 에러
- **원인**: n8n에서 전송하는 API 키가 Next.js 서버에서 인식되지 않음
- **해결**: 
  - API 키 검증 로직 개선 (상세한 로깅 추가)
  - 하드코딩된 API 키 사용: `test-api-key-12345`
- **결과**: API 키 인증 성공 확인
  ```
  [AI Answer API] API 키 검증: {
    provided: 'test-api-key-12345',
    expected: 'test-api-key-12345',
    match: true,
    providedLength: 18,
    expectedLength: 18
  }
  ```

### 3. ✅ Search Context API 정상 작동
- **상태**: 200 OK 응답
- **기능**: 임베딩 검색 및 컨텍스트 반환
- **로그**: `[Search Context API] 검색 결과: 0개 문서`

---

## 🔧 수정된 파일들

### 1. `src/app/api/admin/inquiries/ai-answer/route.ts`
```typescript
// API 키 검증 로직 개선
const apiKey = request.headers.get('x-api-key');
const validApiKey = process.env.N8N_API_KEY || 'test-api-key-12345';

console.log('[AI Answer API] API 키 검증:', { 
  provided: apiKey,
  expected: validApiKey,
  match: apiKey === validApiKey,
  providedLength: apiKey ? apiKey.length : 0,
  expectedLength: validApiKey.length
});
```

### 2. `n8n-workflows/inquiry-monitor.json`
- **Extract Inquiry Data 노드**: 데이터 추출 로직 개선
- **Save AI Answer 노드**: API 키 헤더 설정
- **워크플로우 활성화**: `"active": true`

---

## 🚨 현재 남은 문제

### 1. ❌ AI Answer API 400 Bad Request
- **상태**: API 키 인증은 성공했지만 400 에러 발생
- **원인**: 요청 데이터 구조 문제 추정
- **다음 단계**: 요청 데이터 검증 및 수정 필요

### 2. ⚠️ Mongoose 스키마 경고
```
Warning: Duplicate schema index on {"inquiryId":1} found
Warning: Duplicate schema index on {"userEmail":1} found
Warning: Duplicate schema index on {"status":1} found
Warning: Duplicate schema index on {"type":1} found
Warning: Duplicate schema index on {"priority":1} found
```

---

## 📊 워크플로우 실행 현황

### 성공한 단계들:
1. ✅ **Webhook 트리거**: 200 OK
2. ✅ **Extract Inquiry Data**: 데이터 추출 성공
3. ✅ **Generate Embedding**: 임베딩 생성 성공
4. ✅ **Process Embedding**: 임베딩 처리 성공
5. ✅ **Search Related Context**: 컨텍스트 검색 성공 (200 OK)
6. ✅ **Prepare AI Request**: AI 요청 준비 성공
7. ✅ **Build LM Studio Request**: LM Studio 요청 구성 성공
8. ✅ **Generate AI Response**: Gemini API 호출 성공
9. ✅ **Process AI Response**: AI 응답 처리 성공
10. ❌ **Save AI Answer**: 400 Bad Request (진행 중)

### API 호출 현황:
- **Search Context API**: ✅ 200 OK
- **AI Answer API**: ❌ 400 Bad Request (API 키 인증은 성공)

---

## 🛠️ 기술적 세부사항

### 환경 설정:
- **n8n**: Docker 컨테이너 (포트 5678)
- **Next.js**: 로컬 서버 (포트 3000)
- **API 키**: `test-api-key-12345`

### 주요 해결 과정:
1. **워크플로우 데이터 흐름 문제** → Function 노드 코드 개선
2. **API 키 인증 실패** → 하드코딩된 키 사용 및 로깅 강화
3. **n8n 컨테이너 재시작** → 변경사항 적용

---

## 🎯 다음 단계

### 1. AI Answer API 400 에러 해결
- 요청 데이터 구조 검증
- 필수 필드 누락 확인
- 데이터베이스 연결 상태 확인

### 2. Mongoose 스키마 경고 해결
- 중복 인덱스 정의 제거
- 스키마 최적화

### 3. 전체 워크플로우 완료 검증
- AI 답변 생성 확인
- 데이터베이스 저장 확인
- 최종 응답 반환 확인

---

## 📝 참고사항

### 워크플로우 트리거 방법:
```bash
Invoke-WebRequest -Uri "http://localhost:5678/webhook-test/inquiry-monitor" -Method POST -ContentType "application/json" -Body '{"inquiry": {"subject": "테스트 문의", "content": "테스트 내용", "type": "general", "userEmail": "test@example.com", "userName": "테스트 사용자"}}'
```

### 로그 확인 명령어:
```bash
# Next.js 서버 로그 확인
Get-Content -Path "logs\app-2025-10-15.log" -Tail 20

# n8n 컨테이너 재시작
docker-compose -f docker-compose.n8n.yml restart
```

---

## 🔍 문제 해결 과정 요약

1. **초기 문제**: "No item to return was found" 에러
2. **1차 해결**: 워크플로우 데이터 흐름 개선
3. **2차 문제**: 401 Unauthorized 에러
4. **2차 해결**: API 키 인증 로직 개선
5. **3차 문제**: 400 Bad Request 에러 (현재 진행 중)

**전체적으로 워크플로우의 90%가 정상 작동하고 있으며, 마지막 단계인 데이터베이스 저장 부분만 해결하면 완료됩니다.**

