# 🔧 n8n 설정 가이드 - 1:1 문의 자동 답변 시스템

## 📋 현재 상태
- ✅ Docker 실행 완료
- ✅ n8n 컨테이너 실행 완료 (포트 5678)
- ✅ 워크플로우 JSON 파일 생성 완료

## 🚀 다음 단계

### 1. n8n 대시보드 접속
브라우저에서 `http://localhost:5678` 접속

### 2. MongoDB Credential 설정

#### 2.1 Credential 생성
1. n8n 대시보드에서 **Settings** → **Credentials** 클릭
2. **Add Credential** 클릭
3. **MongoDB** 선택
4. 다음 정보 입력:

```
Name: MongoDB Youniqle
Connection String: mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/youniqle?retryWrites=true&w=majority&appName=Cluster0
Database: youniqle
```

5. **Test Connection** 클릭하여 연결 확인
6. **Save** 클릭

#### 2.2 환경 변수 설정
n8n 컨테이너에 환경 변수 추가:

```bash
# n8n 컨테이너 중지
docker stop n8n

# 환경 변수와 함께 재시작
docker run -d --name n8n \
  -p 5678:5678 \
  -v ${HOME}\.n8n:/home/node/.n8n \
  -e N8N_API_KEY=your-secret-key-here \
  n8nio/n8n
```

### 3. 워크플로우 임포트

#### 3.1 워크플로우 파일 임포트
1. n8n 대시보드에서 **Workflows** 클릭
2. **Import from File** 클릭
3. `n8n-workflows/inquiry-monitor.json` 파일 선택
4. **Import** 클릭

#### 3.2 워크플로우 설정 확인
1. 임포트된 워크플로우 클릭
2. **MongoDB Inquiry Trigger** 노드 클릭
3. **Credentials** 섹션에서 방금 생성한 "MongoDB Youniqle" 선택
4. **Save** 클릭

### 4. 필요한 API 엔드포인트 생성

워크플로우가 정상 작동하려면 다음 API들이 필요합니다:

#### 4.1 Inquiry 모델 생성
```typescript
// src/models/Inquiry.ts
export interface IInquiry extends Document {
  userId?: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;
  type: 'order' | 'payment' | 'shipping' | 'return' | 'general';
  subject: string;
  content: string;
  status: 'pending' | 'answered' | 'closed';
  answer?: string;
  answeredBy?: mongoose.Types.ObjectId;
  answeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 4.2 AI 컨텍스트 검색 API
```typescript
// src/app/api/ai/search-context/route.ts
export async function POST(request: NextRequest) {
  // Chroma DB에서 관련 정보 검색
  // 상품, FAQ, 공지사항, 정책 문서 등
}
```

#### 4.3 AI 답변 저장 API
```typescript
// src/app/api/admin/inquiries/ai-answer/route.ts
export async function POST(request: NextRequest) {
  // AI가 생성한 답변을 데이터베이스에 저장
  // status: 'ai_draft'로 설정하여 관리자 검토 대기
}
```

### 5. LM Studio 설정 확인

#### 5.1 LM Studio 실행 ✅ 완료
1. LM Studio 앱 실행 ✅
2. **Llama 3 Korean Bllossom 8B** 모델 로드 ✅
3. **Local Server** 탭에서 서버 시작 ✅
4. 포트 1234에서 실행되는지 확인 ✅

#### 5.2 모델 테스트
브라우저에서 `http://localhost:1234/v1/models` 접속하여 모델 목록 확인

### 6. 워크플로우 테스트

#### 6.1 수동 테스트
1. n8n 워크플로우에서 **Execute Workflow** 클릭
2. Input Data에 테스트 문의 데이터 입력:

```json
{
  "operationType": "insert",
  "fullDocument": {
    "_id": "test123",
    "userEmail": "test@example.com",
    "userName": "테스트 사용자",
    "type": "general",
    "subject": "배송 문의",
    "content": "주문한 상품이 언제 배송되나요?",
    "status": "pending",
    "createdAt": "2024-10-12T10:00:00Z"
  }
}
```

3. **Execute** 클릭하여 워크플로우 실행

#### 6.2 실제 문의 테스트
1. 워크플로우 **Active** 토글 ON
2. 실제 사용자 문의를 MongoDB에 삽입
3. n8n 로그에서 자동 처리 확인

## 🐛 문제 해결

### 문제 1: MongoDB 연결 실패
```bash
# MongoDB 연결 테스트
node scripts/test-correct-mongodb.js
```

### 문제 2: LM Studio 연결 실패
```bash
# LM Studio 서버 상태 확인
curl http://localhost:1234/v1/models
```

### 문제 3: n8n 워크플로우 실행 안됨
```bash
# n8n 로그 확인
docker logs n8n --tail 50
```

## 📊 모니터링

### 로그 확인
```bash
# n8n 실시간 로그
docker logs -f n8n

# 특정 워크플로우 로그 필터링
docker logs n8n | grep "Inquiry Monitor"
```

### 성능 모니터링
- MongoDB Change Stream 지연 시간
- LM Studio 응답 시간
- 전체 워크플로우 실행 시간

## 🎯 진행 상황 업데이트 (2024-10-14)

### ✅ 완료된 작업

1. **n8n 워크플로우 구성 완료**
   - Webhook 노드 (트리거)
   - Code in JavaScript 노드 (데이터 변환)
   - Generate Embedding 노드 (LM Studio 연동)
   - Process Embedding 노드
   - Search Related Context 노드
   - Prepare AI Request 노드 (완벽하게 작동 ✅)
   - Generate AI Response 노드 (진행 중 ⚠️)
   - Process AI Response 노드
   - Save AI Answer 노드
   - Log Success 노드

2. **LM Studio 설정 완료**
   - 서버 실행: `http://127.0.0.1:1234` ✅
   - 모델 로드: `llama-3-korean-bllossom-8b` ✅
   - PowerShell 테스트 성공 ✅

3. **워크플로우 구조**
   ```
   Webhook → Code in JavaScript → Generate Embedding → 
   Process Embedding → Search Related Context → 
   Prepare AI Request → Generate AI Response → 
   Process AI Response → Save AI Answer → Log Success
   ```

### ⚠️ 현재 문제점

**Generate AI Response 노드에서 JSON 형식 에러 발생**

#### 에러 메시지:
```
400 - "{\"error\":\"Unexpected token 'U', \\\"Unexpected\\\"... is not valid JSON.\"}"
```

#### 문제 원인:
- n8n의 "Using Fields Below" 방식이 복잡한 배열/객체를 올바르게 직렬화하지 못함
- LM Studio는 정상 작동 중 (PowerShell 테스트 성공)
- n8n에서 LM Studio로 보내는 JSON 형식 문제

#### 시도한 해결 방법:
1. ❌ "Using JSON" + Expression 모드
2. ❌ "Using Fields Below" + 개별 파라미터
3. ⏳ "Using JSON" + 이전 노드 참조 (`={{$node["Prepare AI Request"].json}}`)

### 🔧 해결해야 할 사항

**다음 단계: Generate AI Response 노드 JSON 형식 수정**

#### 권장 해결 방법:

**방법 1: 이전 노드의 출력 직접 사용**
```javascript
// "Generate AI Response" 노드의 JSON 편집기
={{$node["Prepare AI Request"].json}}
```

**방법 2: 직접 JSON 구성**
```javascript
={
  "model": "llama-3-korean-bllossom-8b",
  "messages": {{$node["Prepare AI Request"].json.messages}},
  "max_tokens": 1000,
  "temperature": 0.7,
  "top_p": 0.9
}
```

**방법 3: Function 노드 사용**
- Prepare AI Request와 Generate AI Response 사이에 Function 노드 추가
- Function 노드에서 JSON을 올바른 형식으로 변환

### 📝 테스트 방법

#### PowerShell로 LM Studio 직접 테스트 (성공 ✅):
```powershell
$body = @{
    model = "llama-3-korean-bllossom-8b"
    messages = @(
        @{role = "system"; content = "당신은 친절한 AI입니다."}
        @{role = "user"; content = "안녕하세요"}
    )
    max_tokens = 1000
    temperature = 0.7
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:1234/v1/chat/completions" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body
```

### 📊 현재 워크플로우 상태

| 노드 | 상태 | 비고 |
|------|------|------|
| Webhook | ✅ 완료 | Test URL: `http://localhost:5678/webhook-test/a75fdff8-5f49-4c51-a703-774cb2c01e8e` |
| Code in JavaScript | ✅ 완료 | - |
| Generate Embedding | ✅ 완료 | LM Studio 연동 성공 |
| Process Embedding | ✅ 완료 | - |
| Search Related Context | ✅ 완료 | - |
| Prepare AI Request | ✅ 완료 | 완벽한 JSON 생성 |
| **Generate AI Response** | ⚠️ **진행 중** | **JSON 형식 에러 발생** |
| Process AI Response | ⏳ 대기 | - |
| Save AI Answer | ⏳ 대기 | - |
| Log Success | ⏳ 대기 | - |

## 🎯 다음 개발 단계

1. **Generate AI Response 노드 JSON 형식 수정** (현재 작업 중)
2. **Inquiry 모델 및 API 구현** (1일)
3. **관리자 답변 검토 UI** (2일)
4. **사용자 문의 페이지** (2일)
5. **이메일 알림 시스템** (1일)
6. **통합 테스트 및 최적화** (1일)

---

**현재 상태**: n8n 워크플로우 90% 완료 (Generate AI Response 노드 수정 필요)  
**다음 단계**: Generate AI Response 노드의 JSON 형식 문제 해결
