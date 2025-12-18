import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NavigatorInput, NavigatorOutput, OmakaseInput, OmakaseOutput } from './types';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Real Gemini AI Engine for Recovery OS
export class GeminiAIEngine {

    // AI Navigator: Generate daily advice based on recovery scores
    static async generateNavigatorAdvice(input: NavigatorInput): Promise<NavigatorOutput> {
        try {
            // Using gemini-flash-latest (Verified working)
            const model = genAI.getGenerativeModel({
                model: 'gemini-flash-latest',
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                ]
            });

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
  "actionItem": "오늘 딱 하나만 실천할 수 있는 회복 행동 추천 (50자 이내)"
}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    comment: parsed.comment || '오늘도 회복하는 하루 되세요!',
                    actionItem: parsed.actionItem || '자기 전 10분 스트레칭을 해보세요.',
                    recoveryScore: totalScore
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
            // Using gemini-flash-latest (Verified working)
            const model = genAI.getGenerativeModel({
                model: 'gemini-flash-latest',
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                ]
            });

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

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

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
    // Daily Question Generator
    static async generateDailyQuestions(theme: string, keywords: string): Promise<any[]> {
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is missing');
            throw new Error('GEMINI_API_KEY is not set');
        }

        try {
            // Updated to use gemini-2.0-flash as it is confirmed available
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

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
}
