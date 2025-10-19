# n8n + Gemini API 연동 작업 - 새 채팅 시작 프롬프트

## 📋 이 프롬프트를 새 채팅에 복사해서 붙여넣으세요

---

## 🎯 현재 상황

Youniqle 프로젝트의 n8n 워크플로우를 **LM Studio에서 Gemini API로 전환**하는 작업을 진행 중입니다. 테스트 워크플로우가 거의 완성되었으며, 마지막 설정만 수정하면 작동할 것으로 예상됩니다.

---

## 📊 진행 상황 요약

### ✅ 완료된 작업

1. **n8n Docker 환경 설정**
   - Docker Compose 파일 생성: `docker-compose.n8n.yml`
   - 환경 변수 설정:
     - `GEMINI_API_KEY`: AIzaSyDjIcmr3GX_LtYm9n3vnCNfKCZkClOcumY
     - `N8N_BLOCK_ENV_ACCESS_IN_NODE`: false
     - `N8N_API_KEY`: test-api-key-12345
   - n8n 컨테이너 실행 중: `http://localhost:5678`

2. **Gemini API 모델 확인**
   - 사용 가능한 모델: `gemini-2.5-flash` (Stable version)
   - API 엔드포인트: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`

3. **워크플로우 파일 수정**
   - `n8n-workflows/test-gemini-simple.json` - 테스트 워크플로우
   - `n8n-workflows/inquiry-monitor.json` - 전체 워크플로우
   - 모든 `localhost` URL을 `host.docker.internal`로 변경
   - MongoDB 트리거를 Webhook 트리거로 변경
   - 모델 이름을 `gemini-2.5-flash`로 수정

4. **워크플로우 구조**
   ```
   Webhook → Build Gemini Request → Call Gemini API → 
   Process Response → Respond to Webhook
   ```

---

## ⚠️ 현재 문제점

### 마지막 남은 설정 문제

**Call Gemini API 노드의 Content Type 설정:**

- **현재 설정:** `text/html` ❌
- **올바른 설정:** `application/json` ✅

### 현재 상태

- ✅ 환경 변수: 정상 로드됨
- ✅ API 키: 정상 작동
- ✅ Body 설정: JSON 문자열로 구성됨
- ❌ Content Type: `text/html`로 잘못 설정됨

---

## 🔧 해결해야 할 사항

### 즉시 해결할 것 (1분 소요)

**Call Gemini API 노드 설정 수정:**

1. **n8n 워크플로우 에디터에서 Call Gemini API 노드 클릭**
2. **"Content Type" 필드 찾기** (Body Content Type 아래)
3. **"Content Type" 드롭다운 클릭**
4. **`application/json` 선택**
5. **"Save" 버튼 클릭**

### 예상 결과

Content Type을 `application/json`으로 변경하면:
- ✅ Gemini API가 정상적으로 JSON 요청을 수신
- ✅ AI 답변이 2-5초 내에 생성됨
- ✅ 워크플로우가 성공적으로 완료됨

---

## 📝 참고 정보

### 환경 변수 설정 (docker-compose.n8n.yml)

```yaml
environment:
  - GEMINI_API_KEY=AIzaSyDjIcmr3GX_LtYm9n3vnCNfKCZkClOcumY
  - N8N_BLOCK_ENV_ACCESS_IN_NODE=false
  - N8N_API_KEY=test-api-key-12345
```

### Gemini API 설정

- **URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- **Method:** POST
- **Headers:**
  - `Content-Type`: `application/json`
  - `x-goog-api-key`: `{{$env.GEMINI_API_KEY}}`
- **Body:** JSON 문자열 (`geminiRequestJson`)

### 워크플로우 파일 위치

- 테스트 워크플로우: `n8n-workflows/test-gemini-simple.json`
- 전체 워크플로우: `n8n-workflows/inquiry-monitor.json`

---

## 🎯 요청 사항

다음 사항을 도와주세요:

1. **Content Type 설정 수정**
   - Call Gemini API 노드의 Content Type을 `application/json`으로 변경
   - 워크플로우 재실행 및 테스트

2. **테스트 워크플로우 검증**
   - Webhook 트리거하여 전체 워크플로우가 정상 작동하는지 확인
   - Gemini API가 정상적으로 응답하는지 확인
   - AI 답변이 올바르게 생성되는지 확인

3. **전체 워크플로우 Import 및 테스트**
   - 테스트 워크플로우가 성공하면 `inquiry-monitor.json` import
   - 전체 워크플로우 테스트

4. **추가 문제 해결**
   - 문제가 발생하면 근본 원인을 파악하고 해결

---

## 📚 관련 문서

- `docker-compose.n8n.yml` - n8n Docker 설정 파일
- `n8n-workflows/test-gemini-simple.json` - 테스트 워크플로우
- `n8n-workflows/inquiry-monitor.json` - 전체 워크플로우
- `docs/N8N_CONTINUATION_PROMPT.md` - 이전 진행 상황

---

## 💡 참고 사항

- n8n 버전: 최신 버전 (Docker 컨테이너)
- Gemini API: v1beta
- 모델: gemini-2.5-flash (Stable version)
- Docker 컨테이너에서 실행 중이므로 `host.docker.internal` 사용

---

## 🎉 다음 단계

1. **Call Gemini API 노드의 Content Type을 `application/json`으로 변경**
2. **워크플로우 테스트 실행**
3. **성공하면 전체 워크플로우 import 및 테스트**
4. **실제 고객 문의에 대한 AI 답변 생성 테스트**

**위 정보를 바탕으로 마지막 설정을 완료하고 Gemini API 연동을 완성해주세요!** 🚀





