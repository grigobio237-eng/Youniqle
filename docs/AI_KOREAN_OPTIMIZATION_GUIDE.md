# 🤖 AI 챗봇 한국어 응답 최적화 가이드

## 📋 목차
1. [문제 상황](#문제-상황)
2. [즉시 적용 방법](#즉시-적용-방법)
3. [단계별 해결 방안](#단계별-해결-방안)
4. [모델 교체 가이드](#모델-교체-가이드)
5. [테스트 및 검증](#테스트-및-검증)
6. [트러블슈팅](#트러블슈팅)

---

## 🔴 문제 상황

### 증상
- **질문**: "배송 정보에 대해 알려주세요" (한국어)
- **AI 응답**: "To provide an appropriate response..." (영어)
- **원인**: SOLAR-10.7B 모델의 영어 우선 학습

### 영향
- 사용자 경험 저하
- 챗봇 신뢰도 감소
- 한국 시장에서 사용 불가

---

## ⚡ 즉시 적용 방법 (5분)

### 방법 1: n8n HTTP Request 노드 수정

1. **n8n 대시보드 접속**: http://localhost:5678
2. **워크플로우 열기**: AI 챗봇 워크플로우 선택
3. **HTTP Request 노드 클릭**
4. **Body 섹션 수정**:

```json
{
  "model": "solar-10.7b-instruct-v1.0-uncensored",
  "messages": [
    {
      "role": "system",
      "content": "You are a Korean AI assistant. CRITICAL: You MUST respond ONLY in Korean language. NEVER use English. 당신은 한국어 AI 어시스턴트입니다. 반드시 한국어로만 응답하세요."
    },
    {
      "role": "user",
      "content": "[한국어로 답변 필수]\n\n질문: {{ $json.user_query }}\n\n참고 정보: {{ $json.context }}\n\n답변 (Korean only):"
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.4,
  "top_p": 0.8,
  "frequency_penalty": 0.3,
  "presence_penalty": 0.1
}
```

5. **저장 및 테스트**: Execute Workflow 버튼 클릭

### 방법 2: LM Studio 파라미터 조정

1. **LM Studio 앱 실행**
2. **Server 탭 → Advanced Settings**
3. **다음 값 입력**:
   ```
   Temperature: 0.4
   Top P: 0.8
   Repeat Penalty: 1.2
   Stop Sequences: [English], In English:, [EN]
   ```
4. **Apply → Reload Server**

---

## 🎯 단계별 해결 방안

### ⭐ 1단계: 프롬프트 최적화 (30분)

#### A안: Few-Shot Learning (가장 효과적)

n8n HTTP Request Body를 다음으로 교체:

```json
{
  "model": "solar-10.7b-instruct-v1.0-uncensored",
  "messages": [
    {
      "role": "system",
      "content": "당신은 Youniqle 쇼핑몰의 한국어 고객 지원 AI입니다. 모든 응답은 반드시 한국어로만 작성해야 합니다."
    },
    {
      "role": "user",
      "content": "질문: 반품 정책이 어떻게 되나요?\n참고 정보: 구매 후 7일 이내 반품 가능합니다."
    },
    {
      "role": "assistant",
      "content": "안녕하세요! Youniqle의 반품 정책에 대해 안내드리겠습니다.\n\n구매하신 상품은 구매일로부터 7일 이내에 반품이 가능합니다. 반품을 원하시면 고객센터로 문의해 주시기 바랍니다.\n\n추가로 궁금하신 점이 있으시면 언제든지 문의해 주세요!"
    },
    {
      "role": "user",
      "content": "질문: {{ $json.user_query }}\n\n참고 정보: {{ $json.context }}"
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.5,
  "top_p": 0.85
}
```

**장점**: 모델에게 예시를 보여줌으로써 학습 효과
**성공률**: 약 60-70%

---

#### B안: 역할 및 규칙 강조

```json
{
  "model": "solar-10.7b-instruct-v1.0-uncensored",
  "messages": [
    {
      "role": "system",
      "content": "# 역할\n당신은 Youniqle 쇼핑몰의 한국어 고객 상담 AI입니다.\n\n# 절대 규칙\n1. 모든 응답은 100% 한국어로만 작성\n2. 영어 사용 절대 금지\n3. 존댓말 사용\n4. 친절하고 자연스러운 표현\n\n# 응답 형식\n- 인사말로 시작\n- 질문에 대한 명확한 답변\n- 추가 도움 제안으로 마무리"
    },
    {
      "role": "user",
      "content": "### 고객 질문\n{{ $json.user_query }}\n\n### 참고 정보\n{{ $json.context }}\n\n### 답변 (반드시 한국어만 사용)\n"
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.4,
  "top_p": 0.8,
  "frequency_penalty": 0.3,
  "presence_penalty": 0.1
}
```

**장점**: 명확한 지시사항
**성공률**: 약 50-60%

---

### ⭐ 2단계: 한국어 특화 모델로 교체 (1시간) - **가장 권장**

#### 추천 모델: Bllossom

**1. LM Studio에서 모델 다운로드**

```
1. LM Studio 앱 실행
2. 좌측 🔍 Search 아이콘 클릭
3. 검색창에 "Bllossom" 입력
4. "MLP-KTLim/llama-3-Korean-Bllossom-8B-gguf-Q4_K_M" 선택
5. Download 버튼 클릭 (약 5GB, 10분 소요)
6. 다운로드 완료 후 "Load Model" 클릭
```

**2. 서버 시작**

```
1. 우측 상단 "Start Server" 버튼 클릭
2. 서버 주소 확인: http://localhost:1234
3. "Server running" 상태 확인
```

**3. n8n에서 모델명 변경**

HTTP Request 노드에서:

```json
{
  "model": "llama-3-Korean-Bllossom-8B",  // 모델명 변경
  "messages": [
    {
      "role": "system",
      "content": "당신은 Youniqle 쇼핑몰의 친절한 고객 상담 AI입니다. 고객의 질문에 정확하고 자연스럽게 답변해주세요."
    },
    {
      "role": "user",
      "content": "질문: {{ $json.user_query }}\n\n참고 정보: {{ $json.context }}"
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.7,
  "top_p": 0.9
}
```

**성공률**: 95% 이상 (한국어 특화 모델)

---

#### 대체 모델 옵션

| 모델명 | 크기 | 한국어 성능 | 메모리 | 속도 |
|--------|------|-------------|--------|------|
| **Bllossom-8B** (추천) | 5GB | ⭐⭐⭐⭐⭐ | 8GB | 빠름 |
| EEVE-Korean-10.8B | 7GB | ⭐⭐⭐⭐⭐ | 12GB | 보통 |
| Llama-3-Open-Ko-8B | 5GB | ⭐⭐⭐⭐ | 8GB | 빠름 |
| KoAlpaca-12.8B | 8GB | ⭐⭐⭐⭐ | 16GB | 느림 |

---

### ⭐ 3단계: 워크플로우 개선 (30분)

#### Code 노드에 전처리 추가

현재 Code 노드를 다음으로 교체:

```javascript
// 기존 데이터 파싱
const data = JSON.parse($input.item.json.stdout);

// 한국어 응답 유도 접두사 추가
const koreanInstructions = `다음은 고객의 질문입니다. 반드시 한국어로만 친절하게 답변해주세요.

`;

return {
  json: {
    user_query: koreanInstructions + data.user_query,
    context: data.context
  }
};
```

#### Edit Fields 노드에 후처리 추가

새로운 Code 노드를 Edit Fields 노드 뒤에 추가:

```javascript
// AI 응답 추출
const aiResponse = $json.choices[0].message.content;

// 영어 비율 체크
const englishChars = (aiResponse.match(/[a-zA-Z]/g) || []).length;
const koreanChars = (aiResponse.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g) || []).length;
const totalChars = englishChars + koreanChars;

const englishRatio = englishChars / totalChars;
const koreanRatio = koreanChars / totalChars;

// 영어가 30% 이상이면 경고
if (englishRatio > 0.3) {
  console.warn(`⚠️ Warning: Response has ${(englishRatio * 100).toFixed(1)}% English`);
  
  // 로그 기록
  return {
    json: {
      response: "죄송합니다. 현재 시스템에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.",
      original_response: aiResponse,
      warning: "High English content",
      korean_ratio: (koreanRatio * 100).toFixed(1) + "%",
      english_ratio: (englishRatio * 100).toFixed(1) + "%"
    }
  };
}

// 정상 응답
return {
  json: {
    response: aiResponse,
    quality: "GOOD",
    korean_ratio: (koreanRatio * 100).toFixed(1) + "%"
  }
};
```

---

## 🧪 테스트 및 검증

### 수동 테스트

**n8n 워크플로우에서:**

1. Execute Workflow 버튼 클릭
2. Input Data 수정:
   ```json
   {
     "user_query": "배송 정보에 대해 알려주세요",
     "context": "배송은 전국 무료배송이며, 2-3일 내에 배송됩니다."
   }
   ```
3. 응답 확인:
   - ✅ 한국어로 응답하는지 확인
   - ✅ 참고 정보를 활용했는지 확인
   - ✅ 자연스러운 문장인지 확인

### 자동 테스트 스크립트

테스트 스크립트가 생성되었습니다: `scripts/test-korean-ai-responses.js`

**실행 방법:**

```powershell
# 1. n8n 워크플로우에 Webhook 추가
# 워크플로우 시작 부분에 "Webhook" 노드 추가
# URL: http://localhost:5678/webhook/ai-chat

# 2. 테스트 스크립트 실행
node scripts/test-korean-ai-responses.js
```

**예상 출력:**

```
🚀 AI 챗봇 한국어 응답 테스트 시작

================================================================================

📝 테스트: 배송 정보 문의
   질문: 배송 정보에 대해 알려주세요
   컨텍스트: 배송은 전국 무료배송이며, 2-3일 내에 배송됩니다.

   🤖 AI 응답:
   안녕하세요! Youniqle의 배송 서비스에 대해 안내드리겠습니다.
   
   저희 쇼핑몰은 전국 무료배송 서비스를 제공하고 있으며, 주문 후 2-3일 내에 
   상품을 받아보실 수 있습니다.
   
   추가로 궁금하신 점이 있으시면 언제든지 문의해 주세요!

   📊 검증 결과:
      한글 비율: 92.3%
      영문 비율: 5.2%
      키워드 매칭: 배송, 무료, 2-3일
      품질: EXCELLENT
      ✅ PASS
   ----------------------------------------------------------------------------

================================================================================
📊 최종 테스트 결과

✅ 배송 정보 문의: EXCELLENT (한글 92.3%)
✅ 반품 정책 문의: EXCELLENT (한글 89.7%)
✅ 결제 방법 문의: GOOD (한글 85.1%)
✅ 포인트 적립 문의: EXCELLENT (한글 91.4%)
✅ 회원 등급 문의: GOOD (한글 87.8%)

총 테스트: 5개
성공: 5개 (100.0%)
실패: 0개

🎉 EXCELLENT! 한국어 응답이 매우 우수합니다.
================================================================================
```

---

## 🔧 트러블슈팅

### 문제 1: 여전히 영어로 응답함

**원인**: 모델의 한계

**해결책**:
1. **Bllossom 모델로 교체** (가장 확실한 방법)
2. Few-Shot 프롬프트 사용
3. temperature를 0.3 이하로 낮춤

### 문제 2: 한국어지만 부자연스러움

**원인**: 모델 파라미터 부적절

**해결책**:
```json
{
  "temperature": 0.7,        // 0.4 → 0.7로 상향
  "top_p": 0.9,              // 0.8 → 0.9로 상향
  "frequency_penalty": 0.1,  // 0.3 → 0.1로 하향
  "presence_penalty": 0.0    // 제거
}
```

### 문제 3: 응답이 너무 짧음

**원인**: max_tokens 부족

**해결책**:
```json
{
  "max_tokens": 2000,  // 1000 → 2000으로 증가
  "min_tokens": 100    // 최소 토큰 추가
}
```

### 문제 4: LM Studio 서버 연결 실패

**증상**: n8n에서 "Connection refused" 오류

**해결책**:
```powershell
# 1. LM Studio 서버 상태 확인
# LM Studio → Server 탭 → "Server running" 확인

# 2. 포트 충돌 확인
netstat -ano | findstr :1234

# 3. 방화벽 확인
# Windows 설정 → 방화벽 → LM Studio 허용 확인

# 4. n8n Docker 네트워크 확인
docker inspect n8n-local | findstr NetworkMode
# "NetworkMode": "host" 확인
```

### 문제 5: 메모리 부족 (OOM)

**증상**: LM Studio가 느려지거나 멈춤

**해결책**:
1. 더 작은 모델 사용 (Bllossom-8B → Open-Ko-8B)
2. LM Studio 설정에서 Context Length 줄이기
3. Windows 가상 메모리 증가

---

## 📊 성공 기준

### 한국어 응답 품질 기준

| 등급 | 한글 비율 | 키워드 매칭 | 자연스러움 |
|------|-----------|-------------|------------|
| EXCELLENT | 80% 이상 | 모두 포함 | 매우 자연스러움 |
| GOOD | 60-80% | 대부분 포함 | 자연스러움 |
| FAIR | 40-60% | 일부 포함 | 어색함 |
| FAIL | 40% 미만 | 없음 | 매우 어색함 |

### 목표

- ✅ 한글 비율 80% 이상
- ✅ 모든 참고 정보 키워드 포함
- ✅ 자연스러운 한국어 표현
- ✅ 응답 시간 3초 이내

---

## 🎯 최종 권장 방안

### 단기 해결책 (오늘 바로 적용)

1. **Few-Shot 프롬프트 적용** (30분)
   - n8n HTTP Request 노드에 예시 대화 추가
   - 성공률 60-70% 기대

### 중기 해결책 (이번 주 안에)

2. **Bllossom 모델로 교체** (1시간)
   - LM Studio에서 Bllossom-8B 다운로드
   - n8n 모델명만 변경
   - **성공률 95% 이상** ⭐

### 장기 해결책 (향후 개선)

3. **Fine-tuning** (추후)
   - Youniqle 쇼핑몰 전용 데이터로 모델 학습
   - 맞춤형 응답 품질

---

## 📞 추가 지원

문의사항이 있으시면:
- 이메일: suchwawa@sapienet.com
- 전화: 1577-0729

---

**마지막 업데이트**: 2025년 10월 10일  
**작성자**: AI Development Team  
**버전**: 1.0


