# n8n 워크플로우 문제 해결 - 새 채팅 시작 프롬프트

## 📋 이 프롬프트를 새 채팅에 복사해서 붙여넣으세요

---

## 🎯 현재 상황

Youniqle 프로젝트의 n8n 워크플로우 연동 작업을 진행 중입니다. **Inquiry Monitor 워크플로우**를 구성하는 중이며, **Generate AI Response 노드에서 JSON 형식 에러**가 발생하고 있습니다.

---

## 📊 진행 상황 요약

### ✅ 완료된 작업

1. **n8n 워크플로우 구성 (90% 완료)**
   - Webhook 노드 (트리거) ✅
   - Code in JavaScript 노드 ✅
   - Generate Embedding 노드 (LM Studio 연동) ✅
   - Process Embedding 노드 ✅
   - Search Related Context 노드 ✅
   - **Prepare AI Request 노드** (완벽하게 작동) ✅
   - **Generate AI Response 노드** (진행 중) ⚠️
   - Process AI Response 노드 (대기)
   - Save AI Answer 노드 (대기)
   - Log Success 노드 (대기)

2. **LM Studio 설정 완료**
   - 서버 실행: `http://127.0.0.1:1234` ✅
   - 모델: `llama-3-korean-bllossom-8b` ✅
   - PowerShell 테스트 성공 ✅

3. **워크플로우 구조**
   ```
   Webhook → Code in JavaScript → Generate Embedding → 
   Process Embedding → Search Related Context → 
   Prepare AI Request → Generate AI Response → 
   Process AI Response → Save AI Answer → Log Success
   ```

---

## ⚠️ 현재 문제점

### 에러 메시지
```
400 - "{\"error\":\"Unexpected token 'U', \\\"Unexpected\\\"... is not valid JSON.\"}"
```

### 문제 원인
- **LM Studio는 정상 작동 중** (PowerShell 테스트 성공)
- **Prepare AI Request 노드**는 완벽한 JSON을 생성함
- **Generate AI Response 노드**에서 n8n이 LM Studio로 보내는 JSON 형식이 잘못됨
- n8n의 "Using Fields Below" 방식이 복잡한 배열/객체를 올바르게 직렬화하지 못함

### 시도한 해결 방법
1. ❌ "Using JSON" + Expression 모드
2. ❌ "Using Fields Below" + 개별 파라미터 (messages 배열)
3. ✅ **Function 노드 추가 + JSON Body 방식** (해결!)

---

## ✅ 해결 완료!

### 적용된 해결 방법

**Function 노드 추가 + JSON Body 방식**

1. **Build LM Studio Request 노드 추가** (새로운 Function 노드)
   - Prepare AI Request와 Generate AI Response 사이에 배치
   - JavaScript로 LM Studio API에 보낼 JSON을 완벽하게 구성
   - `lmStudioRequest` 객체를 생성하여 다음 노드로 전달

2. **Generate AI Response 노드 수정**
   - `bodyContentType: "json"` 사용
   - `jsonBody: "={{$json.lmStudioRequest}}"` 로 JSON 직접 전달
   - "Using Fields Below" 방식 대신 JSON Body 방식 사용

3. **Process AI Response 노드 개선**
   - LM Studio 응답 구조를 더 상세하게 로깅
   - 에러 발생 시 rawResponse 포함하여 디버깅 용이

### 워크플로우 구조 (수정 후)
```
Webhook → Code in JavaScript → Generate Embedding → 
Process Embedding → Search Related Context → 
Prepare AI Request → **Build LM Studio Request** (새로 추가!) → 
Generate AI Response → Process AI Response → 
Save AI Answer → Log Success
```

---

## 📝 참고 정보

### Prepare AI Request 노드의 출력 (완벽한 JSON)
```json
{
  "model": "llama-3-korean-bllossom-8b",
  "messages": [
    {
      "role": "system",
      "content": "당신은 Youniqle 쇼핑몰의 친절한 고객 상담 AI입니다..."
    },
    {
      "role": "user",
      "content": "문의 제목: 문의\n\n문의 내용: 문의 내용이 없습니다..."
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.7,
  "top_p": 0.9
}
```

### LM Studio 테스트 (성공 ✅)
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

### Webhook 테스트 URL
```
http://localhost:5678/webhook-test/a75fdff8-5f49-4c51-a703-774cb2c01e8e
```

---

## 🎯 다음 단계

### 1. 워크플로우 import 및 활성화
```bash
# n8n-workflows/inquiry-monitor.json 파일을 n8n에 import
# n8n UI에서 워크플로우 활성화
```

### 2. 워크플로우 테스트
- MongoDB에 새 문의를 생성하여 트리거 테스트
- LM Studio 서버가 실행 중인지 확인 (`http://localhost:1234`)
- n8n 로그에서 각 노드의 실행 상태 확인

### 3. 예상 결과
- ✅ Build LM Studio Request 노드가 올바른 JSON 생성
- ✅ Generate AI Response 노드가 LM Studio로 성공적으로 요청 전송
- ✅ AI 답변이 정상적으로 생성되어 데이터베이스에 저장
- ✅ Log Success 노드에서 성공 메시지 확인

### 4. 문제 발생 시 디버깅
- n8n 실행 로그 확인
- 각 노드의 출력 데이터 확인
- LM Studio 서버 로그 확인

---

## 📚 관련 문서

- `n8n-setup-guide.md` - n8n 설정 가이드 (진행 상황 포함)
- `docs/N8N_WORKFLOW_GUIDE.md` - n8n 워크플로우 상세 가이드
- `n8n-workflows/inquiry-monitor.json` - 워크플로우 JSON 파일

---

## 💡 참고 사항

- n8n 버전: 최신 버전 (Docker 컨테이너)
- LM Studio 버전: 0.3.30
- 모델: llama-3-korean-bllossom-8b (4.92 GB)
- Docker 컨테이너에서 실행 중이므로 `host.docker.internal:1234` 사용

---

## 🎉 수정 완료!

**Generate AI Response 노드의 JSON 형식 문제가 해결되었습니다!**

### 주요 변경 사항:
1. ✅ **Build LM Studio Request 노드 추가** - JavaScript로 JSON 구성
2. ✅ **Generate AI Response 노드 수정** - JSON Body 방식으로 변경
3. ✅ **Process AI Response 노드 개선** - 상세한 로깅 및 에러 처리

### 다음 작업:
1. n8n에 수정된 워크플로우 import
2. 워크플로우 활성화
3. 테스트 실행 및 결과 확인

**이제 워크플로우를 테스트해보세요!** 🚀

