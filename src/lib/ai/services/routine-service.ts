import { GeminiCore } from '../engine/core';
import { DailyCheckInInput, DailyCheckInOutput, NavigatorInput, NavigatorOutput } from '../types';

export class RoutineService {
    private static questionCache: Record<string, any[]> = {};

    static async generateDailyCheckInQuestion(input: DailyCheckInInput): Promise<DailyCheckInOutput> {
        const prompt = `
당신은 '유니클(Youniqle)'의 친근하고 세심한 **퍼스널 회복 코치**입니다.
사용자(${input.userName})에게 하루를 시작하는(또는 하루 중) 인사를 건네고, 컨디션을 체크하는 질문을 하나 던져주세요.

## 상황 정보
- 요일/시간: ${input.dayOfWeek} ${input.timeOfDay}
- 최근 컨텍스트: ${input.recentContext || '특이사항 없음'}

## 코칭 원칙
1. **따뜻하고 개인화된 인사**: 요일이나 시간대, 최근 컨텍스트를 반영해 자연스럽게 인사를 건네세요.
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

        try {
            const text = await GeminiCore.generateWithFallback(prompt);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            throw new Error('Parsing failed');
        } catch (error) {
            console.error('Check-in error:', error);
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

    static async generateDailyRoutines(input: {
        score: number;
        slotName: string;
        slotCode: string;
    }): Promise<any> {
        const isDaily = input.slotCode === 'DAILY';
        const prompt = isDaily 
            ? `사용자의 회복 점수(${input.score})를 바탕으로 오늘 하루 동안 실천하면 좋은 '생활 습관 미션' 3가지를 추천해주세요. 
               이는 홈페이지 도구 사용이 아닌, 실제 오프라인 생활(물 마시기, 산책 등) 위주여야 합니다.
               [응답 형식 (JSON)]
               {
                 "slot": "DAILY",
                 "title": "오늘의 회복 미션",
                 "tasks": [
                   { "id": "d1", "title": "미션 제목", "desc": "설명", "icon": "이모지" },
                   ... (3개)
                 ]
               }`
            : `사용자의 회복 점수(${input.score})와 시간대(${input.slotName})에 맞는 3가지 회복 루틴을 추천해주세요.
               [응답 형식 (JSON)]
               {
                 "slot": "${input.slotCode}",
                 "title": "${input.slotName} 회복 루틴",
                 "tasks": [
                   { "id": "t1", "title": "태스크 제목", "desc": "설명", "icon": "이모지" },
                   ... (3개)
                 ]
               }`;

        try {
            const response = await GeminiCore.generateWithFallback(prompt, "AI 루틴 큐레이터 모드", 0.7);
            const startIdx = response.indexOf('{');
            const endIdx = response.lastIndexOf('}');
            
            if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
                const jsonStr = response.substring(startIdx, endIdx + 1);
                try {
                    return JSON.parse(jsonStr);
                } catch (parseError) {
                    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
                    if (jsonMatch) return JSON.parse(jsonMatch[0]);
                }
            }
            throw new Error("Invalid JSON");
        } catch (error) {
            console.error("Daily Routines error:", error);
            return {
                slot: input.slotCode,
                title: `${input.slotName} 회복 루틴`,
                tasks: [
                    { id: "f1", title: "가벼운 스트레칭", desc: "몸을 깨우는 동작", icon: "Zap" },
                    { id: "f2", title: "미온수 마시기", desc: "수분 보충", icon: "Droplet" },
                    { id: "f3", title: "심호흡 5회", desc: "안정 찾기", icon: "Wind" }
                ]
            };
        }
    }

    static async generateNavigatorAdvice(input: NavigatorInput): Promise<NavigatorOutput> {
        const prompt = `
당신은 유니클(Youniqle)의 수석 리커버리 네비게이터입니다.
사용자의 오늘의 회복 점수를 분석하여 개인화된 어드바이스를 제공하세요.

[오늘의 점수]
- 신체: ${input.scores.physical}, 멘탈: ${input.scores.mental}, 생활: ${input.scores.lifestyle}, 수면: ${input.scores.sleep}
- 어제 점수: ${input.yesterdayScore || '정보 없음'}

[응답 형식 (JSON)]
{
  "comment": "오늘의 한 줄 코멘트",
  "actionItem": "오늘 실천할 구체적인 행동 팁",
  "recoveryScore": 0,
  "tomorrowForecast": {
    "status": "맑음|흐림|주의",
    "description": "내일의 회복 상태 예측 설명 (1~2문장)",
    "energyLevel": 70
  }
}`;
        try {
            const response = await GeminiCore.generateWithFallback(prompt, "AI 네비게이터 모드", 0.7);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                // tomorrowForecast가 문자열이면 객체로 변환
                if (typeof parsed.tomorrowForecast === 'string') {
                    parsed.tomorrowForecast = {
                        status: '안정',
                        description: parsed.tomorrowForecast,
                        energyLevel: parsed.recoveryScore || 70
                    };
                }
                // 필수 필드 누락 방어
                if (parsed.tomorrowForecast && !parsed.tomorrowForecast.status) parsed.tomorrowForecast.status = '안정';
                if (parsed.tomorrowForecast && !parsed.tomorrowForecast.description) parsed.tomorrowForecast.description = '내일의 회복 흐름을 지켜보겠습니다.';
                if (parsed.tomorrowForecast && parsed.tomorrowForecast.energyLevel == null) parsed.tomorrowForecast.energyLevel = parsed.recoveryScore || 70;
                return parsed;
            }
            throw new Error("Parsing failed");
        } catch (error) {
            return {
                comment: "오늘 하루도 당신의 회복을 응원합니다.",
                actionItem: "가벼운 스트레칭으로 몸을 깨워보세요.",
                recoveryScore: 70,
                tomorrowForecast: {
                    status: "안정",
                    description: "꾸준한 리듬 유지가 회복의 핵심입니다.",
                    energyLevel: 70
                }
            };
        }
    }

    static async paraphrasePrecisionQuestions(
        baseQuestions: any[],
        dayOfWeek: string,
        theme: string
    ): Promise<any[]> {
        const cacheKey = `${dayOfWeek}_${theme}`;
        if (this.questionCache[cacheKey]) return this.questionCache[cacheKey];

        const prompt = `
당신은 유니클(Youniqle)의 전문 회복 네비게이터입니다.
제공된 ${baseQuestions.length}개의 정밀 진단 문항을 [${dayOfWeek}: ${theme}] 테마에 맞춰 재구성하세요.
JSON 배열만 반환하세요.`;

        try {
            const response = await GeminiCore.generateWithFallback(prompt, "AI 리커버리 네비게이터 모드", 0.7);
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const paraphrased = JSON.parse(jsonMatch[0]);
                this.questionCache[cacheKey] = paraphrased;
                return paraphrased;
            }
        } catch (error) {
            console.error("Paraphrasing failed:", error);
        }
        return baseQuestions;
    }

    static async analyzeRecoveryTrend(input: { userName: string; scores: any[] }): Promise<any> {
        const prompt = `주간 회복 데이터를 분석하여 종합 리포트를 작성하세요. 데이터: ${JSON.stringify(input.scores)}`;
        try {
            const response = await GeminiCore.generateWithFallback(prompt, "AI 데이터 분석가 모드", 0.6);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
        } catch (error) {
            return { summary: "데이터 분석 중입니다.", status: "안정", recommendations: ["규칙적인 생활 유지"], insight: "조금씩 나아지는 모습이 보입니다." };
        }
    }
}
