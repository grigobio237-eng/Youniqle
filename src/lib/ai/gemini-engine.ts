import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NavigatorInput, NavigatorOutput, OmakaseInput, OmakaseOutput } from './types';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Real Gemini AI Engine for Recovery OS
export class GeminiAIEngine {

    // AI Model Configuration
    // Primary: gemini-2.0-flash-exp (Smartest, Experimental)
    // Secondary: gemini-1.5-flash (Stable, Reliable fallback)
    private static async generateWithFallback(
        prompt: string,
        systemInstruction?: string,
        temperature: number = 0.7
    ): Promise<string> {
        const models = ['gemini-2.0-flash-exp', 'gemini-1.5-flash'];
        let lastError: any;

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    ],
                    systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }], role: "model" } : undefined
                });

                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: temperature
                    }
                });
                const response = await result.response;
                const text = response.text();

                if (text) return text;

            } catch (error) {
                console.warn(`Model ${modelName} failed. Trying next...`, error);
                lastError = error;
                continue;
            }
        }

        throw lastError || new Error('All AI models failed');
    }

    // AI Navigator: Generate daily advice based on recovery scores
    static async generateNavigatorAdvice(input: NavigatorInput): Promise<NavigatorOutput> {
        try {
            const totalScore = Math.round(
                (input.scores.q1 + input.scores.q2 + input.scores.q3 + input.scores.q4 + input.scores.q5) / 5
            );

            const prompt = `당신은 회복(Recovery) 전문 코치입니다. 사용자의 회복 점수를 분석하고 따뜻하고 실용적인 조언을 제공해주세요.

## 사용자 회복 점수 (각 0-100점)
- 피로도: ${input.scores.q1}점
- 수면 질: ${input.scores.q2}점
- 붓기/부종: ${input.scores.q3}점
- 감정 상태: ${input.scores.q4}점
- 집중력: ${input.scores.q5}점
- 총 평균: ${totalScore}점
${input.yesterdayScore ? `- 어제 점수: ${input.yesterdayScore}점` : ''}

## 요청
아래 JSON 형식으로만 응답해주세요. 다른 텍스트는 추가하지 마세요.
{
  "comment": "오늘의 상태에 대한 따뜻한 한줄 코멘트 (30자 이내)",
  "actionItem": "오늘 딱 하나만 실천할 수 있는 회복 행동 추천 (50자 이내)",
  "tomorrowForecast": {
    "status": "내일의 상태 요약 (예: 회복 가속, 휴식 주의보, 리듬 안정)",
    "description": "오늘의 점수를 바탕으로 분석한 내일의 컨디션 예측 (100자 이내)",
    "energyLevel": 0에서 100 사이의 숫자 (기대 에너지 레벨)
  }
}`;

            const text = await this.generateWithFallback(prompt);

            // Parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    comment: parsed.comment || '오늘도 회복하는 하루 되세요!',
                    actionItem: parsed.actionItem || '자기 전 10분 스트레칭을 해보세요.',
                    recoveryScore: totalScore,
                    tomorrowForecast: parsed.tomorrowForecast || {
                        status: '분석 중',
                        description: '충분한 수면 후 내일 아침에 더 정확한 예측이 가능합니다.',
                        energyLevel: totalScore > 80 ? 90 : 70
                    }
                };
            }

            // Fallback if parsing fails
            return {
                comment: '오늘도 회복하는 하루 보내세요!',
                actionItem: '물 한 잔 마시고 깊게 숨을 쉬어보세요.',
                recoveryScore: totalScore
            };

        } catch (error) {
            console.error('Gemini Navigator Error:', error);
            // Fallback response
            const totalScore = Math.round(
                (input.scores.q1 + input.scores.q2 + input.scores.q3 + input.scores.q4 + input.scores.q5) / 5
            );
            return {
                comment: '오늘 하루도 천천히 회복해가요.',
                actionItem: '잠시 눈을 감고 5번 깊게 호흡해보세요.',
                recoveryScore: totalScore
            };
        }
    }

    // Omakase: Generate 3-tier recovery plans
    static async generateOmakasePlans(input: OmakaseInput): Promise<OmakaseOutput> {
        try {
            const prompt = `당신은 프리미엄 회복 컨시어지 서비스의 AI 플래너입니다. 고객의 상담 신청서를 바탕으로 3가지 맞춤형 회복 플랜을 설계해주세요.

## 고객 정보
- 주요 고민: ${input.painPoint}
- 목표: ${input.goal}
- 월 예산: ${input.budget === '30' ? '30만원 이하' : input.budget === '50' ? '30~70만원' : '70만원 이상'}
- 증상: ${input.symptoms.join(', ')}

## 요청
아래 JSON 형식으로만 응답해주세요. 다른 텍스트는 추가하지 마세요.
{
  "analysis": "고객 상태에 대한 1-2문장 분석",
  "plans": {
    "planA": {
      "planId": "plan-a-basic",
      "title": "Plan A: 기초 회복 (Reset)",
      "description": "기본 플랜 설명 (1문장)",
      "duration": "기간 (예: 4주)",
      "priceEstimate": "예상 비용 (예: 약 30만원)",
      "focusArea": "핵심 영역 (예: 수면 패턴 정상화)",
      "routine": ["루틴1", "루틴2", "루틴3"]
    },
    "planB": {
      "planId": "plan-b-standard",
      "title": "Plan B: 집중 균형 (Reborn)",
      "description": "밸런스형 플랜 설명 (1문장)",
      "duration": "기간",
      "priceEstimate": "예상 비용",
      "focusArea": "핵심 영역",
      "routine": ["루틴1", "루틴2", "루틴3"]
    },
    "planC": {
      "planId": "plan-c-premium",
      "title": "Plan C: 완전한 재설계 (Restart)",
      "description": "프리미엄 플랜 설명 (1문장)",
      "duration": "기간",
      "priceEstimate": "예상 비용",
      "focusArea": "핵심 영역",
      "routine": ["루틴1", "루틴2", "루틴3"]
    }
  }
}`;

            const text = await this.generateWithFallback(prompt);

            // Parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    analysis: parsed.analysis || `${input.goal}을 목표로 맞춤형 플랜을 설계했습니다.`,
                    plans: parsed.plans
                };
            }

            // Fallback if parsing fails - use default plans
            return GeminiAIEngine.getDefaultOmakasePlans(input);

        } catch (error) {
            console.error('Gemini Omakase Error:', error);
            return GeminiAIEngine.getDefaultOmakasePlans(input);
        }
    }

    // Fallback default plans
    private static getDefaultOmakasePlans(input: OmakaseInput): OmakaseOutput {
        return {
            analysis: `${input.goal}을(를) 목표로 하시는군요. ${input.painPoint} 문제 해결을 위한 3단계 맞춤형 회복 플랜을 설계했습니다.`,
            plans: {
                planA: {
                    planId: 'plan-a-basic',
                    title: 'Plan A: 기초 회복 (Reset)',
                    description: '부담 없이 시작할 수 있는 생활 밀착형 회복 플랜입니다.',
                    duration: '4주',
                    priceEstimate: '약 30만원',
                    focusArea: '기초 체력 및 수면 패턴 정상화',
                    routine: ['매일 아침 미온수 1잔', '취침 전 마그네슘 섭취', '주 2회 가벼운 유산소']
                },
                planB: {
                    planId: 'plan-b-standard',
                    title: 'Plan B: 집중 균형 (Reborn)',
                    description: '가장 추천하는 밸런스형 플랜으로, 확실한 변화를 유도합니다.',
                    duration: '8주',
                    priceEstimate: '약 60만원',
                    focusArea: '호르몬 밸런스 및 만성 피로 해결',
                    routine: ['개인 맞춤 영양제 패키지', '주 1회 순환 테라피', '수면 패턴 코칭']
                },
                planC: {
                    planId: 'plan-c-premium',
                    title: 'Plan C: 완전한 재설계 (Restart)',
                    description: '단기간 내에 최상의 컨디션으로 끌어올리는 인텐시브 코스입니다.',
                    duration: '12주',
                    priceEstimate: '약 120만원',
                    focusArea: '전신 해독 및 세포 재생',
                    routine: ['1:1 전담 코치 배정', '프리미엄 디톡스 프로그램', '심리 상담 및 명상 세션']
                }
            }
        };
    }
    // Daily Check-in Question Generator (Interactive)
    static async generateDailyCheckInQuestion(input: {
        userName: string;
        dayOfWeek: string;
        timeOfDay: string;
        recentContext?: string; // e.g., "yesterday sleep was bad"
    }): Promise<any> {
        if (!process.env.GEMINI_API_KEY) {
            return {
                greeting: `안녕하세요, ${input.userName}님!`,
                question: '오늘 컨디션은 어떠신가요?',
                options: [
                    { label: '아주 좋아요', value: 'good' },
                    { label: '보통이에요', value: 'normal' },
                    { label: '조금 피곤해요', value: 'tired' }
                ]
            };
        }

        try {
            const prompt = `
당신은 '유니클(Youniqle)'의 친근하고 세심한 **퍼스널 회복 코치**입니다.
사용자(${input.userName})에게 하루를 시작하는(또는 하루 중) 인사를 건네고, 컨디션을 체크하는 질문을 하나 던져주세요.

## 상황 정보
- 요일/시간: ${input.dayOfWeek} ${input.timeOfDay}
- 최근 컨텍스트: ${input.recentContext || '특이사항 없음'}

## 코칭 원칙
1. **따뜻하고 개인화된 인사**: 요일이나 시간대, 최근 컨텍스트를 반영해 자연스럽게 인사를 건네세요. (예: "월요일 아침이네요!", "어제 늦게 주무셨는데...")
2. **핵심 질문 1개**: 사용자가 부담 없이 답할 수 있는 컨디션 체크 질문을 1개만 하세요.
3. **간단한 선택지**: 답변하기 쉽게 3개의 선택지를 함께 제공하세요.

## 응답 형식 (JSON Only)
{
  "greeting": "따뜻한 인사말 (나-전달법, 1~2문장)",
  "question": "핵심 질문 (1문장)",
  "options": [
    { "label": "긍정 답변 (예: 상쾌해요!)", "value": "good", "emoji": "😊" },
    { "label": "중립 답변 (예: 평범해요)", "value": "normal", "emoji": "😐" },
    { "label": "부정 답변 (예: 몸이 무거워요)", "value": "bad", "emoji": "🫠" }
  ]
}`;

            const text = await this.generateWithFallback(prompt);
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Failed to parse daily check-in');

        } catch (error) {
            console.error('Gemini Check-in Error:', error);
            // Fallback
            return {
                greeting: `${input.userName}님, 안녕하세요!`,
                question: '오늘 몸 상태는 좀 어떠신가요?',
                options: [
                    { label: '가볍고 좋아요', value: 'good', emoji: '💪' },
                    { label: '그저 그래요', value: 'normal', emoji: '😐' },
                    { label: '많이 피곤하네요', value: 'bad', emoji: '💤' }
                ]
            };
        }
    }

    // Daily Question Generator
    static async generateDailyQuestions(theme: string, keywords: string): Promise<any[]> {
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is missing');
            throw new Error('GEMINI_API_KEY is not set');
        }

        try {
            const prompt = `당신은 회복 심리학 전문가입니다.
오늘의 테마는 "${theme}"이며, 핵심 키워드는 "${keywords}"입니다.
이 테마에 맞춰 사용자의 하루 컨디션을 점검할 수 있는 **5개의 객관식 질문**을 만들어주세요.

## 요구사항
1. 질문은 따뜻하고 공감가는 어조로 작성해주세요.
2. 각 질문에는 3개의 선택지가 있어야 합니다. (점수: 0=좋음, 3=보통, 5=나쁨)
3. 카테고리는 [피로, 수면, 몸, 감정, 집중, 관계, 자존감] 중에서 적절히 선택하거나 테마에 맞게 정해주세요.

## 응답 형식 (JSON Array)
[
  {
    "id": 1,
    "category": "카테고리",
    "text": "질문 내용",
    "options": [
      { "label": "나쁜 상태 (예: 너무 피곤해요)", "score": 5 },
      { "label": "보통 상태", "score": 3 },
      { "label": "좋은 상태", "score": 0 }
    ]
  },
  ...
]`;

            const text = await this.generateWithFallback(prompt);

            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback
            throw new Error('Failed to parse questions');
        } catch (error) {
            console.error('Gemini Question Error:', error);
            throw error; // Re-throw to be handled by API route
        }
    }
    // AI Chat Persona: Director Kim Mi-jeong
    static async generateChatResponse(message: string, context: { userName: string; grade: string }): Promise<string> {
        if (!process.env.GEMINI_API_KEY) {
            return "죄송합니다. 현재 AI 상담 연결이 원활하지 않습니다.";
        }

        try {
            const prompt = `
당신은 '유니클(Youniqle)' 회복 센터의 대표원장 **김미정**입니다.
사용자(${context.userName}, 등급: ${context.grade})가 1:1 라운지에서 당신에게 메시지를 보냈습니다.

## 페르소나 설정 (김미정 원장)
- **전문성**: 20년 경력의 재활/회복 의학 전문가. 의학적 지식이 풍부하지만 어려운 용어보다는 환자가 이해하기 쉬운 비유를 사용합니다.
- **철학**: "회복은 내 몸이 스스로 하는 일이고, 우리는 그것을 방해하는 요소를 치워줄 뿐입니다."
- **말투**: 
  - 따뜻하고 공감적이지만, 전문가로서의 확신이 문장에 묻어납니다.
  - "~요", "~죠" 등의 친근한 구어체를 사용합니다. (딱딱한 "하십시오"체 지양)
  - 가끔 환자를 '님'이나 '환자분' 대신 이름을 다정하게 부릅니다.
  - 이모지를 적절히 사용하여(1~2개) 딱딱하지 않게 대화합니다.

## 제약 사항
- 의료법상 구체적인 진단이나 약 처방은 "내원하셔서 정밀 검사를 받아보셔야 정확히 알 수 있습니다"라고 안내해야 합니다.
- 답변은 3~5문장 내외로 간결하게 작성하세요.
- **중요**: 매 답변마다 "안녕하세요, ${context.userName}님!"으로 시작하지 마세요. 대화가 이어지고 있다고 가정하고 자연스럽게 반응해주세요.
- 사용자의 이름은 문장 중간에 가끔식 친근하게 불러주세요. (예: "그렇죠, 연수님 생각은 어떠세요?")

## 사용자 메시지
"${message}"

## 답변 작성
위 페르소나를 유지하며 사용자에게 답변해주세요. 지금 막 인사를 나눈 상태가 아니라면, 바로 본론으로 들어가도 좋습니다.
`;

            return await this.generateWithFallback(prompt);

        } catch (error) {
            console.error('Gemini Chat Error:', error);
            return "저런, 잠시 연결 상태가 좋지 않네요. 잠시후 다시 말씀해 주시겠어요? 😌";
        }
    }
    // Product Description Generator
    static async generateProductDescriptionHtml(
        info: {
            name: string;
            price: string | number;
            category: string;
            keywords: string;
            images: string[];
            tone?: string;
            target?: string;
        }
    ): Promise<string> {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        try {
            const imagePrompt = info.images.length > 0
                ? `\n## 사용 가능한 이미지 (반드시 HTML 내에 적절히 배치할 것):\n${info.images.map((url, i) => `- 이미지${i + 1}: ${url}`).join('\n')}`
                : '\n## 이미지 없음: 텍스트 위주로 세련되게 디자인하세요.';

            const prompt = `
당신은 세계적인 이커머스 웹 에이전시의 수석 퍼블리셔이자 디자이너입니다.
다음 상품 정보를 바탕으로 **구매 전환율을 극대화할 수 있는 고품질의 HTML 상세페이지 소스**를 작성해주세요.

## 상품 정보
- 상품명: ${info.name}
- 카테고리: ${info.category}
- 가격: ${info.price}원
- 핵심 키워드/특징: ${info.keywords}
- 타겟 고객: ${info.target || '일반 대중'}
- 톤앤매너: ${info.tone || '신뢰감 있고 고급스러운'}
${imagePrompt}

## 디자인 요구사항 (필수)
1. **스타일링**: 
   - 외부 CSS 의존도를 낮추기 위해 **인라인 스타일(inline style)** 또는 범위가 지정된 **<style> 태그**를 사용하세요.
   - 모바일 친화적인 **반응형 디자인(max-width: 100%)**을 적용하세요.
   - 폰트는 가독성 좋은 산세리프 계열(Apple SD Gothic Neo, Pretendard, sans-serif)을 사용하세요.
2. **레이아웃 구조**:
   - **인트로**: 상품의 매력을 한눈에 보여주는 헤더 섹션 (메인 이미지 활용 권장).
   - **문제 제기 및 공감**: 소비자의 니즈를 자극하는 문구.
   - **솔루션/특징**: 핵심 기능을 아이콘이나 이미지와 함께 시각적으로 설명.
   - **디테일**: 스펙, 소재, 사이즈 등 상세 정보.
   - **아웃트로**: 브랜드 신뢰도를 높이는 마무리.
   - **구매 유도**: 하단에 구매 버튼 스타일의 요소 배치 (실제 버튼이 아닌 시각적 요소).
3. **이미지 배치**:
   - 제공된 이미지 URL을 \`<img src="...">\` 태그에 사용하여 적절한 위치에 배치하세요.
   - 이미지는 \`width: 100%; style="max-width: 800px; display: block; margin: 20px auto; border-radius: 12px;"\` 등의 스타일로 깔끔하게 처리하세요.
   - 이미지가 부족하면 섹션 배경색이나 타이포그래피(Typography)로 디자인을 보완하세요.

## 출력 형식
- \`<!DOCTYPE html>\`, \`<html>\`, \`<body>\` 태그는 **제외**하고, \`<div>\`로 시작하는 본문 내용만 작성하세요.
- 마크다운 코드 블록(\`\`\`html) 없이 **순수 HTML 코드만** 반환하세요.
`;

            let text = await this.generateWithFallback(prompt);

            // 마크다운 코드 블록 제거
            text = text.replace(/```html/g, '').replace(/```/g, '');

            return text;

        } catch (error: any) {
            console.error('Gemini Product HTML Error:', error);
            // 에러 메시지를 더 구체적으로 전달
            throw new Error(`AI 생성 오류: ${error.message || '알 수 없는 오류'}`);
        }
    }

    // Generate Recovery Case Simulation
    static async generateRecoveryCase(input: { symptom: string; age?: string; gender?: string }): Promise<any> {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        try {
            const prompt = `당신은 회복 습관 전문가입니다.
사용자가 입력한 고민을 바탕으로, **실제 사람이 실생활에서 습관을 바꿔 성공한 회복 스토리**를 시뮬레이션하여 작성해주세요.

## 중요한 원칙
1. **제품이 아닌 '습관'에 초점**: 이 사람이 구체적으로 어떤 습관을 바꿨는지 (예: "매일 밤 11시 이전 침대에 눕기", "점심 후 15분 산책")를 중심으로 써야 합니다.
2. **구체적인 일상 디테일**: 막연한 "운동을 시작했다"가 아니라, "퇴근 후 계단으로 집까지 올라가기 시작했다" 같은 현실적이고 따라 할 수 있는 이야기여야 합니다.
3. **시행착오 포함**: "처음엔 힘들었지만", "2주차에 포기하고 싶었지만" 같은 현실적인 어려움을 포함하세요.
4. **제품은 선택사항**: 습관이 핵심이고, 제품(영양제/키트 등)은 "도움이 된 도구" 정도로 언급하세요. 제품이 전혀 없어도 괜찮습니다.

## 사용자 고민
- 증상/고민: ${input.symptom}
${input.age ? `- 연령대: ${input.age}` : ''}
${input.gender ? `- 성별: ${input.gender}` : ''}

## 출력 형식 (JSON만 응답)
{
  "title": "공감 가는 제목 (예: 30대 직장인, 수면 루틴 3개월 바꿔보니)",
  "category": "만성피로 | 통증/붓기 | MENTAL | 다이어트 중 택1",
  "period": "소요 기간 (예: 3개월)",
  "emotion": "감정 변화 (예: 짜증 많던 나 → 웃음 많아진 나)",
  "summary": "**구체적인 습관 변화 중심**으로 1~2문장 (예: '저녁 9시 이후 핸드폰을 거실에 두고, 대신 책을 읽기 시작했어요. 3주 차부터 자연스럽게 잠이 오더라고요.')",
  "habitChanges": [
    "변화1 (예: 매일 점심 후 계단 5층 오르기)",
    "변화2 (예: 저녁 8시 이후 카페인 끊기)",
    "변화3 (예: 잠들기 전 감사일기 3줄 쓰기)"
  ],
  "graphData": [
    { "name": "1주", "score": 25 },
    { "name": "4주", "score": 50 },
    { "name": "8주", "score": 72 },
    { "name": "12주", "score": 88 }
  ],
  "tags": ["#해시태그1", "#해시태그2", "#해시태그3"],
  "productRecommendation": {
    "name": "보조 도구 이름 (선택, 없어도 OK. 예: 마그네슘 수면 키트 또는 '없음')",
    "price": "가격 (예: 39,000원 또는 '-')",
    "reason": "어떤 상황에서 도움이 됐는지 (예: '습관이 자리잡을 때까지 수면 보조로 사용')"
  }
}

**중요**: summary와 habitChanges가 이 스토리의 핵심입니다. 진짜 사람이 쓴 것처럼 솔직하고 현실적으로 작성하세요.`;

            const text = await this.generateWithFallback(prompt);
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Failed to parse case data');

        } catch (error: any) {
            console.error('Gemini Case Gen Error:', error);
            // Fallback Data
            return {
                title: "회복의 여정을 시작해보세요",
                category: "일반",
                period: "4주",
                emotion: "불안 → 안정",
                summary: "아직 데이터가 부족하지만, 작은 실천이 큰 변화를 만듭니다.",
                graphData: [
                    { name: 'Start', score: 30 },
                    { name: 'Now', score: 45 }
                ],
                tags: ["#시작이반", "#회복"],
                productRecommendation: {
                    name: "기초 회복 스타터 팩",
                    price: "29,000원",
                    reason: "가장 기본이 되는 회복 루틴입니다."
                }
            };
        }
    }

    static async planDetailPage(input: {
        name: string;
        category: string;
        price: number;
        promotion?: string;
        keywords: string;
        targetGender?: string[];
        targetAge?: string[];
        length: 5 | 7 | 9 | 'auto';
        isFunding?: boolean;
        referenceImage?: string; // Base64
    }): Promise<any> {
        const lengthCount = input.length === 'auto' ? '6' : String(input.length);
        const targetInfo = `타겟 고객: ${input.targetGender?.join(', ')} / 연령대: ${input.targetAge?.join(', ')}`;

        const prompt = `
당신은 대한민국 최고의 이커머스 상세페이지 기획 전문가이며, 유니클(Youniqle)의 브랜드 디렉터입니다.
당실의 임무는 유니클의 고유한 '회복(Recovery) 설계' 철학을 담은 상세페이지 기획안을 작성하는 것입니다.

**CRITICAL: 모든 결과물은 반드시 '한글'로만 작성하세요.**
**CRITICAL: 기존의 장점 나열 방식이 아닌, 아래의 [유니클 5단계 구조]를 엄격히 따르세요.**

[상품 정보]
- 상품명: ${input.name}
- 카테고리: ${input.category}
- 핵심 강조사항: ${input.keywords}
- ${targetInfo}

[유니클 5단계 구조 및 가이드]

1. **상단: 회복 키워드 선언 (Recovery_Keyword)**
   - 상품명은 노출하지 않습니다.
   - 예: "이 솔루션은 '세포 회복'을 돕기 위해 설계되었습니다."
   - 이미지 위 핵심 문구는 '회복 키워드' 형여야 합니다.

2. **회복 메커니즘 요약 (Mechanism)**
   - 제품이 어떻게 회복 환경을 만드는지 쉽게 설명합니다.
   - "얼마나 강한가"가 아닌 "얼마나 빨리 다시 살아나는가"의 관점을 유지하세요.
   - 예: "세포 회복은 자극이 아니라, 다시 살아날 조건을 만드는 일입니다."

3. **대표 솔루션 강조 (Main_Solution)**
   - UNIQLE 브랜드명을 붙인 고유 솔루션 명칭을 사용하세요 (예: UNIQLE ${input.name} Core™).
   - "단기 각성이 아닌 누적 회복"을 목표로 함을 강조합니다.

4. **보조 솔루션 제안 (Support_Solution)**
   - **CRITICAL**: 존재하지 않는 가상의 제품(예: 유니클 세럼, 크림 등)을 지어내지 마세요.
   - 대신, 일상에서 쉽게 접할 수 있는 **'실제 사물, 과일, 채소, 혹은 생활 습관'**을 제안하여 제품의 회복 효과를 보조하도록 합니다.
   - 예: "비타민 C가 풍부한 감귤류 섭취", "편안한 숙면을 돕는 면 소재의 안대", "미온수 한 잔" 등.
   - "필수"라는 단어는 절대 사용하지 마세요. "환경 보완", "지속성 강화" 등의 표현을 씁니다.

5. **회복 루틴 가이드 (Routine_Guide)**
   - 유니클의 신뢰 장치입니다.
   - 사용 타이밍, 피해야 할 습관, 최소 체감 기간 가이드를 포함합니다.
   - **엔딩 문구**: 반드시 "유니클은 효과를 약속하지 않습니다. 회복을 설계합니다." 문구를 이 섹션의 마지막 키 메시지로 포함하세요.

[기획 지침]
- 비주얼 프롬프트: 제품 스테이징(대리석, 신선한 식물, 깨끗한 빛)이 강조된 한글 묘사.
- 모든 섹션의 분위기는 '치유, 정돈됨, 프리미엄'이어야 함.

## 출력 형식 (JSON Array) - 설명 없이 JSON만 출력하세요.
[
  {
    "id": "section-1",
    "title": "회복 키워드 선언 (한글)",
    "logicalSections": ["Recovery_Keyword"],
    "keyMessage": "핵심 한글 카피",
    "visualPrompt": "제품이 돋보이는 한글 비주얼 설명",
    "productPosition": "center",
    "productSize": "medium"
  }
]`;

        const text = await this.generateWithFallback(prompt, "대한민국 상세페이지 전략가 모드 (한글 100% 필수)", 0.7);
        const jsonMatch = text.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error("Failed to parse JSON response", e);
                return [];
            }
        }
        throw new Error('상세페이지 기획안 생성에 실패했습니다.');
    }

    /**
     * Regenerate a single segment of the detail page
     */
    static async regenerateDetailSegment(input: {
        name: string;
        category: string;
        keywords: string;
        sectionId: string;
        logicalSection: string;
    }): Promise<any> {
        const prompt = `당신은 대한민국 최고의 이커머스 상세페이지 기획자입니다. 모든 응답은 반드시 '한글'로만 작성하세요.
상품명: "${input.name}"
카테고리: "${input.category}"
핵심 강조사항: "${input.keywords}"
현재 기획하려는 섹션 성격: [${input.logicalSection}]

위 정보를 바탕으로 해당 섹션에 최적화된 새로운 회복 설계 기획을 만들어주세요.

## 지침
- 유니클의 핵심 가치인 **'회복(Recovery)'**이 해당 섹션에 반드시 반영되어야 합니다.
- **보조 솔루션(Support_Solution)인 경우**: 절대 가상의 제품을 지어내지 말고, 회복을 돕는 '실제 사물, 과일, 채소, 습관'을 제안하세요.
- **성분 강조보다는 '회복 환경'과 '루틴'의 관점**에서 카피를 작성하세요.
- 비주얼 프롬프트(visualPrompt): 제품 스테이징이 강조되면서도 '치유와 회복'의 분위기가 느껴지는 한글 묘사.
- 키 메시지(keyMessage): '회복'의 가치를 담은 강력하고 직관적인 한글 카피.

## 출력 형식 (JSON Object)
{
  "id": "${input.sectionId}",
  "title": "${input.logicalSection} 섹션 (한글)",
  "logicalSections": ["${input.logicalSection}"],
  "keyMessage": "한글 카피",
  "visualPrompt": "제품 중심의 한글 묘사",
  "productPosition": "center",
  "productSize": "medium"
}`;

        const text = await this.generateWithFallback(prompt, "섹션 재생성 모드", 0.8);
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        try {
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No valid JSON found in response');
        } catch (e) {
            console.error('Segment regeneration parse error:', e);
            throw e;
        }
    }

    // AI Action Advice: Generate 3 specific actionable items
    static async generateActionAdvice(input: any): Promise<any> {
        try {
            const prompt = `당신은 회복(Recovery) 전문 코치입니다. 사용자의 회복 점수를 분석하고, 오늘 즉시 실천할 수 있는 **3가지 구체적인 행동 조언**을 제공해주세요.

## 사용자 회복 상태
- 회복 점수: ${input.todayScore}점
- 상세 지표: 피로도(${input.scores.q1}), 수면(${input.scores.q2}), 붓기(${input.scores.q3}), 감정(${input.scores.q4}), 집중력(${input.scores.q5})

## 요청
사용자의 가장 취약한 지표를 개선할 수 있는 행동 위주로 추천해주세요. 
아래 JSON 형식으로만 응답해주세요.

{
  "aiComment": "오늘의 상태에 대한 분석과 격려 (50자 이내)",
  "adviceItems": [
    {
      "id": "advice-1",
      "category": "PHYSICAL | MENTAL | LIFESTYLE | SLEEP | NUTRITION 중 택1",
      "content": "구체적인 실천 행동 (예: 미온수 200ml 마시기)"
    },
    ... (총 3개)
  ]
}`;

            const text = await this.generateWithFallback(prompt);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('JSON parsing failed');
        } catch (error) {
            console.error('Gemini Action Advice Error:', error);
            return {
                aiComment: "오늘도 당신의 회복을 응원합니다. 간단한 행동부터 시작해 보세요.",
                adviceItems: [
                    { id: 'def-1', category: 'PHYSICAL', content: '잠시 눈을 감고 크게 심호흡 5번 하기' },
                    { id: 'def-2', category: 'LIFESTYLE', content: '가벼운 스트레칭으로 몸의 긴장 풀기' },
                    { id: 'def-3', category: 'NUTRITION', content: '미온수 한 잔 천천히 들이키기' }
                ]
            };
        }
    }

    // AI Section Image Generation: Multimodal generation (Text + Reference Image)
    static async generateDetailImage(input: {
        prompt: string;
        keyMessage: string;
        referenceImage?: string; // Base64
        aspectRatio?: "9:16" | "1:1";
    }): Promise<string> {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
        }

        const models = [
            'gemini-3-pro-image-preview', // User's preferred model from AI Studio
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash'
        ];
        let lastError: any;

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    ]
                });

                const promptParts: any[] = [
                    {
                        text: `High quality e-commerce product photography. ${input.prompt}. 
CRITICAL: Please overlay the following Korean text clearly on the image in a stylish typography: "${input.keyMessage}".
The overall style should be premium, clean, and reflect a "Recovery" theme.
Aspect Ratio: ${input.aspectRatio || "9:16"}`
                    }
                ];

                if (input.referenceImage) {
                    const base64Content = input.referenceImage.split(',')[1] || input.referenceImage;
                    promptParts.push({
                        inlineData: {
                            data: base64Content,
                            mimeType: "image/png"
                        }
                    });
                }

                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: promptParts }],
                    generationConfig: {
                        // Include image config for models that support it
                        ...(modelName.includes('image') ? {
                            //@ts-ignore
                            imageConfig: {
                                aspectRatio: input.aspectRatio || "9:16",
                                imageSize: "1K"
                            }
                        } : {})
                    } as any
                });

                const response = await result.response;
                const parts = response.candidates?.[0]?.content?.parts;

                if (parts) {
                    for (const part of parts) {
                        if ((part as any).inlineData) {
                            return `data:image/png;base64,${(part as any).inlineData.data}`;
                        }
                    }
                }
                break;
            } catch (error: any) {
                console.warn(`[Gemini] Model ${modelName} failed:`, error.message);
                lastError = error;
                continue;
            }
        }

        console.log('[Gemini] All generation models failed or returned no data. Using simulation fallback.');
        const seed = Math.random().toString(36).substring(7);
        const w = input.aspectRatio === "1:1" ? 1000 : 900;
        const h = input.aspectRatio === "1:1" ? 1000 : 1600;
        return `https://picsum.photos/seed/${seed}/${w}/${h}`;
    }

    // AI Section Image Generation (Old prompt logic, kept for compatibility)
    static async generateSectionImageContent(section: any, referenceImage?: string): Promise<any> {
        return {
            prompt: section.visualPrompt,
            message: section.keyMessage,
            referenceImage: referenceImage ? 'provided' : 'none'
        };
    }

    // AI Feature Suggestion: Suggest 3 USPs for a product
    static async suggestProductFeatures(productName: string, category: string): Promise<string> {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
        }

        const prompt = `상품명 "${productName}" (카테고리: ${category})에 대해 유니클(Youniqle)의 브랜드 철학인 '회복(Recovery)' 관점에서 제안할 수 있는 핵심 회복 키워드와 가치 3가지를 한국어로 추천해줘.
단순한 성분 나열이 아니라, 이 제품이 사용자의 어떤 회복 리듬을 돕는지(예: 세포 재생, 깊은 휴식, 에너지 순환 등)를 중심으로 작성해줘.`;

        try {
            return await this.generateWithFallback(prompt, "유니클 브랜드 전략가 모드", 0.7);
        } catch (error: any) {
            console.error('Gemini Feature Suggestion Error:', error);
            return "1. 세포 단위의 깊은 회복\n2. 무너진 신체 리듬의 정상화\n3. 지속 가능한 에너지 순환 설계";
        }
    }

    // --- Webtoon Challenge Methods ---

    /**
     * 웹툰 주제 추천
     */
    static async suggestWebtoonTopics(input: { genre: string; userContext?: string }): Promise<string[]> {
        const { genre, userContext } = input;
        const prompt = `장르: ${genre}
${userContext ? `상황/맥락: ${userContext}` : ''}
이 장르에 어울리는 일상/회복 관련 4컷 웹툰 주제 5가지를 추천해주세요.
사용자의 공감을 얻을 수 있고 위트 있는 주제면 좋습니다.

JSON 형식으로 응답:
{ "ideas": ["주제1", "주제2", "주제3", "주제4", "주제5"] }`;

        try {
            const text = await this.generateWithFallback(prompt);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]).ideas || [];
            }
            return [];
        } catch (error) {
            console.error('Suggest topics error:', error);
            return [];
        }
    }

    /**
     * 웹툰 대본 생성
     */
    static async generateWebtoonScript(input: {
        recoveryData: any;
        prevSummary?: string;
        episodeNumber: number;
        genre: string;
        userName: string;
        panelCount: number; // 새로 추가
    }): Promise<any> {
        const { recoveryData, prevSummary, episodeNumber, genre, userName, panelCount } = input;

        const prompt = `
당신은 인기 웹툰 작가이자 회복 코치입니다.
사용자(${userName})의 오늘 회복 데이터를 바탕으로 공감을 자극하는 ${panelCount}컷 웹툰 대본을 작성해주세요.

## 데이터
- 회복 점수: ${recoveryData.totalScore}
- 장르: ${genre}
- 에피소드: ${episodeNumber}화
- 목표 분량: **정확히 ${panelCount}개**의 컷(Panel)
${prevSummary ? `- 이전 화 요약: ${prevSummary}` : ''}

## 요청
1. **정확히 ${panelCount}개**의 컷(Panel)에 들어갈 대본과 이미지 생성용 프롬프트를 작성하세요.
2. 주인공 캐릭터의 외형 묘사(characterPrompt)를 상세하게 작성하세요. (영어 권장)
3. 전체 줄거리를 나타내는 **한국어 제목(title)**과 **한국어 요약(summary)**을 반드시 포함하세요. (절대 영어를 섞지 마세요)
4. 각 컷의 script는 반드시 **한국어**로 작성하세요.

## 응답 형식 (JSON)
{
  "title": "에피소드 전체의 한국어 제목",
  "summary": "에피소드 전체의 한국어 요약 (한글만 사용)",
  "characterPrompt": "Detailed physical description of the main character (English)",
  "panels": [
    {
      "panelNumber": 1,
      "script": "해당 컷의 한국어 대사나 나레이션",
      "prompt": "Detailed image generation prompt (English)"
    },
    ... (총 ${panelCount}개)
  ]
}
`;

        const text = await this.generateWithFallback(prompt);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Webtoon script generation failed');
    }

    /**
     * 비주얼 스타일에 따른 상세 프롬프트 반환
     */
    private static getStylePrompt(style: string): string {
        const styleMap: Record<string, string> = {
            'premium': 'Korean Webtoon Style, Semi-realistic, Digital Cel-Shading, High Gloss, professional digital drawing',
            'romance': 'Shojo Manga Style, Sparkle Effect, Ornate Details, Pastel & Vivid Colors, Dreamy Lighting, romantic aesthetic',
            'noir': 'Film Noir, Chiaroscuro, High Contrast, Muted Colors, Gritty Texture, dramatic shadows',
            'anime': 'Anime Style, Cel-Shaded, Vibrant Colors, Clean Lineart, Japanese animation aesthetic',
            'retro-90s': '90s Anime Aesthetic, Retro City Pop Style, Lo-fi, Grainy Texture, VHS Effect, vintage nostalgic feel',
            'manga-bw': 'Manga Style, Black and White, Screen Tones, Halftone Pattern, Ink Wash, classic comic ink style',
            'watercolor': 'Watercolor Illustration, Wet-on-Wet, Soft Edges, Bleeding Effect, Paper Texture, emotional hand-painted feel',
            'oil': 'Oil Painting, Impasto, Thick Brushstrokes, Textured Canvas, Expressive, heavy paint texture',
            'fairytale': 'Children\'s Book Illustration, Flat Design, Warm Color Palette, Soft Shapes, storybook aesthetic',
            'american': 'American Comic Book Style, Thick Outlines, Bold Colors, Ben-Day Dots, Dynamic Action, Marvel/DC comic aesthetic',
            '3d': '3D Render Style, Pixar Style, Soft Lighting, Cute Character Design, Voxel, high-end 3D animation'
        };
        return styleMap[style] || `${style} style`;
    }

    /**
     * 웹툰 캐릭터 기준 시트 생성
     */
    static async generateCharacterSheet(input: {
        characterPrompt: string;
        visualStyle: string;
        referenceDescription?: string;
    }): Promise<string> {
        const stylePrompt = this.getStylePrompt(input.visualStyle);
        const refSubject = input.referenceDescription ? `based on these features: ${input.referenceDescription}` : '';
        const prompt = `Generate a character reference sheet.
1. Subject: A full body reference sheet of a character, ${input.characterPrompt}. ${refSubject}
2. Art Style: ${stylePrompt}
3. Requirements: Front view, neutral pose, white background, consistent character design
4. Quality Boosters: Masterpiece, High Quality, Highly Detailed, 8k resolution`;

        try {
            const result = await this.generateDetailImage({
                prompt,
                keyMessage: "Character Reference",
                aspectRatio: "1:1"
            });

            // 결과가 URL인 경우 (폴백) Base64 접두사 없이 반환
            if (result.startsWith('http')) {
                // URL을 그대로 반환하되, route.ts에서 처리
                return result;
            }
            // data: 접두사가 이미 있으면 Base64 부분만 추출
            if (result.startsWith('data:')) {
                return result.split(',')[1];
            }
            return result;
        } catch (error: any) {
            console.error('[GeminiAIEngine] Character sheet generation failed:', error);
            throw new Error(`캐릭터 시트 생성 실패: ${error.message}`);
        }
    }

    /**
     * 웹툰 패널 이미지 생성
     */
    static async generateWebtoonPanelImage(input: {
        panelPrompt: string;
        characterPrompt: string;
        visualStyle: string;
        genre: string;
    }): Promise<string> {
        const stylePrompt = this.getStylePrompt(input.visualStyle);
        const prompt = `Generate a scene for a webtoon.
1. Subject: ${input.panelPrompt}, ${input.characterPrompt}
2. Art Style: ${stylePrompt}
3. Atmosphere/Genre: ${input.genre} genre
4. Quality Boosters: Masterpiece, High Quality, Highly Detailed, 8k resolution
5. Constraints: NO TEXT on the image, Clean background where applicable`;

        const imageUrl = await this.generateDetailImage({
            prompt,
            keyMessage: "", // 텍스트 없이 생성 유도
            aspectRatio: "1:1"
        });

        // 만약 https://picsum.photos 등의 URL이면 base64로 변환이 필요할 수 있지만, 
        // generateDetailImage가 base64를 반환한다고 가정(시뮬레이션 제외)
        if (imageUrl.startsWith('data:')) {
            return imageUrl.split(',')[1];
        }

        // 시뮬레이션 URL인 경우 (개발 중) - 실제로는 base64 데이터여야 함
        return Buffer.from(imageUrl).toString('base64');
    }

    /**
     * 캐릭터 이미지 분석 (Vision)
     */
    static async analyzeCharacterImage(imageBase64: string): Promise<string> {
        const prompt = "Analyze this character image and describe its key visual features (species, colors, accessories, clothing, personality felt) in a concise English prompt format for an AI image generator. Focus on descriptors that help maintain consistency. Return the description only.";

        try {
            if (!process.env.GEMINI_API_KEY) {
                console.error('GEMINI_API_KEY is missing');
                throw new Error('API key is not configured');
            }

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: "image/png"
                    }
                }
            ]);
            const response = await result.response;
            const text = response.text();

            if (!text) throw new Error('Empty response from AI');
            return text;
        } catch (error: any) {
            console.error('Gemini Image analysis detail error:', error);
            throw new Error(`AI 분석 중 오류: ${error.message}`);
        }
    }

    /**
     * 인스타그램 캡션 및 해시태그 생성
     */
    static async generateInstagramCaption(input: {
        topic: string;
        panels: { panelNumber: number; script: string }[];
    }): Promise<any> {
        const prompt = `주제: ${input.topic}
위 주제로 만든 4컷 웹툰을 인스타그램에 올리려고 합니다.
MZ세대의 감성을 담은 위트 있고 공감 가는 캡션과 해시태그를 만들어주세요.

JSON 형식:
{
  "description": "인스타그램 캡션 내용 (이모지 포함)",
  "hashtags": "#해시태그1 #해시태그2 ..."
}`;

        try {
            const text = await this.generateWithFallback(prompt);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { description: "오늘의 회복 기록!", hashtags: "#유니클 #회복챌린지" };
        } catch (error) {
            return { description: "오늘의 회복 기록!", hashtags: "#유니클 #회복챌린지" };
        }
    }
}
