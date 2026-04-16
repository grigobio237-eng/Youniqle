import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NavigatorInput, NavigatorOutput, OmakaseInput, OmakaseOutput } from './types';

// Initialize Gemini AI (Lazy initialization to avoid env loading issues)
let _genAI: GoogleGenerativeAI | null = null;
let _studioGenAI: GoogleGenerativeAI | null = null;

const getGenAI = () => {
    if (!_genAI) _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    return _genAI;
};

const getStudioGenAI = () => {
    if (!_studioGenAI) {
        const key = process.env.GEMINI_STUDIO_API_KEY || process.env.GEMINI_API_KEY || '';
        _studioGenAI = new GoogleGenerativeAI(key);
    }
    return _studioGenAI;
};

// Real Gemini AI Engine for Recovery OS
export class GeminiAIEngine {

    // AI Model Configuration
    // Primary: gemini-2.0-flash-exp (Smartest, Experimental)
    // Secondary: gemini-1.5-flash (Stable, Reliable fallback)
    // Generate image and save to file with multimodal support (Supports multiple reference images)
    public static async generateImageAndSave(
        prompt: string,
        outputPath: string,
        referenceImages?: string | string[],
        aspectRatio: "9:16" | "4:3" | "1:1" = "9:16"
    ): Promise<string> {
        console.log(`[Gemini] Generating image for technical prompt: ${prompt.substring(0, 100)}...`);

        let failureReason = '';
        let lastError: any;

        const images = Array.isArray(referenceImages) ? referenceImages : referenceImages ? [referenceImages] : [];

        // 1. Try Gemini Native Image Generation (Multimodal if referenceImages provided)
        try {
            const models = [
                'nano-banana-pro-preview',
                'gemini-2.5-flash-image',
                'gemini-3-pro-image-preview',
                'gemini-2.0-flash',
                'gemini-flash-latest'
            ];

            for (const modelName of models) {
                try {
                    const engines = [getGenAI()];
                    if (process.env.GEMINI_STUDIO_API_KEY && process.env.GEMINI_STUDIO_API_KEY !== process.env.GEMINI_API_KEY) {
                        engines.push(getStudioGenAI());
                    }

                    for (const engine of engines) {
                        try {
                            const model = engine.getGenerativeModel({
                                model: modelName,
                                safetySettings: [
                                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                                ]
                            });

                            const promptParts: any[] = [{
                                text: `
                            [SYSTEM INSTRUCTION: VISUAL REPLICATION MODE]
                            1. BRAND INTEGRITY: Provided reference images contain the "GRICO" logo and specific design. DUPLICATE THE LOGO EXACTLY. NEVER imagine new brands like "L'ECLAT". 
                            2. CHARACTER INTEGRITY: DUPLICATE the provided model's facial features and hair 1:1. 
                            3. TASK: Generate a photorealistic image mirroring the provided reference images as the SOLE SOURCE OF TRUTH. 
                            4. USER PROMPT: ${prompt}`
                            }];

                            for (const imgBase64 of images) {
                                const base64Content = imgBase64.split(',')[1] || imgBase64;
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
                                    ...(modelName.includes('image') ? {
                                        //@ts-ignore
                                        imageConfig: {
                                            aspectRatio: aspectRatio,
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
                                        const base64Data = (part as any).inlineData.data;
                                        const buffer = Buffer.from(base64Data, 'base64');
                                        require('fs').writeFileSync(outputPath, buffer);
                                        console.log(`[Gemini] Image generated via ${modelName} (Multimodal: ${images.length > 0})`);
                                        return outputPath;
                                    }
                                }
                            }
                        } catch (innerE: any) {
                            console.warn(`[Gemini] Model ${modelName} fail: ${innerE.message}`);
                            lastError = innerE;
                            continue;
                        }
                    }
                } catch (e: any) {
                    console.warn(`[Gemini] Global error for ${modelName}: ${e.message}`);
                    failureReason = e.message;
                }
            }
        } catch (err: any) {
            console.warn('[Gemini] Native generation loop failed.', err.message);
        }

        // 2. Fallback to Pollinations AI (Text-only)
        try {
            console.log('[Gemini] Falling back to Pollinations AI...');
            const safePrompt = prompt.replace(/\[.*?\]/g, '').replace(/[^\w\s]/g, ' ').trim().substring(0, 150);
            const seed = Math.floor(Math.random() * 100000);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}?width=1080&height=1920&nologo=true&seed=${seed}`;

            const response = await fetch(imageUrl);
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                require('fs').writeFileSync(outputPath, Buffer.from(buffer));
                return outputPath;
            }
        } catch (error: any) {
            console.warn('[Gemini] Pollinations fallback failed:', error.message);
        }

        // 3. Final Resort: Placeholder
        const color = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        const placeholderUrl = `https://placehold.co/1080x1920/${color}/ffffff.png?text=Generation+Error`;
        console.error(`[Gemini] ALL image generation methods failed for prompt. Last error: ${failureReason}. Creating placeholder: ${placeholderUrl}`);

        try {
            const res = await fetch(placeholderUrl);
            if (res.ok) {
                const buf = await res.arrayBuffer();
                require('fs').writeFileSync(outputPath, Buffer.from(buf));
            }
        } catch (phError: any) {
            console.error('[Gemini] Placeholder fallback also failed:', phError.message);
        }
        return outputPath;
    }

    // AI Model Configuration
    // Primary: gemini-2.0-flash-exp (Smartest, Experimental)
    // Secondary: gemini-1.5-flash (Stable, Reliable fallback)
    public static async generateWithFallback(
        prompt: string,
        systemInstruction?: string,
        temperature: number = 0.7
    ): Promise<string> {
        // Optimized model list for stability and availability
        const models = [
            'gemini-2.0-flash',
            'gemini-1.5-flash',
            'gemini-2.0-flash-exp',
            'gemini-1.5-pro'
        ];
        let lastError: any;

        for (const modelName of models) {
            try {
                // Try with both genAI and studioGenAI
                const engines = [getGenAI(), getStudioGenAI()];

                for (const engine of engines) {
                    try {
                        const model = engine.getGenerativeModel({
                            model: modelName,
                            safetySettings: [
                                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                            ],
                            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }], role: "system" } : undefined
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
                    } catch (innerError: any) {
                        // If specific engine fails, try next engine for same model
                        lastError = innerError;
                        continue;
                    }
                }

            } catch (error: any) {
                // Only log non-404 errors as warnings to reduce noise
                const isNotFoundError = error.message?.includes('404') || error.message?.includes('not found');
                if (!isNotFoundError) {
                    console.warn(`[Gemini] Model ${modelName} failed:`, error.message);
                } else {
                    console.log(`[Gemini] Model ${modelName} not available, trying next...`);
                }
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
    static async generateDailyQuestions(
        theme: string, 
        keywords: string, 
        journey: 'WELLNESS' | 'CLINICAL_PRE' | 'CLINICAL_POST' = 'WELLNESS',
        medicalCategory: string | null = null
    ): Promise<any[]> {
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is missing');
            throw new Error('GEMINI_API_KEY is not set');
        }

        try {
            let contextInstruction = "";
            let categorySpecificInstruction = "";

            // 1. Basic Journey Instruction
            if (journey === 'CLINICAL_PRE') {
                contextInstruction = `사용자는 현재 '시술/수술 전' 단계입니다. 
중요 목표: 시술 성공을 위한 최상의 컨디션 유지 및 의사 상담 준비.`;
            } else if (journey === 'CLINICAL_POST') {
                contextInstruction = `사용자는 현재 '시술/수술 후' 관리 단계입니다. 
중요 목표: 이상 증상 조기 발견 및 안정적 회복 가이드.`;
            } else {
                contextInstruction = `사용자는 '일상 회복(Wellness)' 단계입니다. 
중요 목표: 일상의 리듬 회복 및 에너지 최적화.`;
            }

            // 2. Medical Category Specific Instruction (Option B)
            if (medicalCategory === 'PLASTIC') {
                categorySpecificInstruction = `진료 분야: [성형외과/피부과]
집중 사항: 피부 상태, 붓기, 멍, 수술 전 금식 및 주의사항 준수 여부, 프라이버시 고민.`;
            } else if (medicalCategory === 'ORTHOPEDIC') {
                categorySpecificInstruction = `진료 분야: [정형외과/재활의학과]
집중 사항: 통증 수치(NRS), 관절 가동 범위, 무리한 운동 여부, 깁스/부목 상태, 신체 밸런스.`;
            } else if (medicalCategory === 'INTERNAL') {
                categorySpecificInstruction = `진료 분야: [내과/건강검진]
집중 사항: 공복 유지, 복용 약물(혈압/당뇨 등) 조절, 식단 관리, 컨디션 난조 여부, 수치 변화 우려.`;
            } else if (medicalCategory === 'GENERAL') {
                categorySpecificInstruction = `진료 분야: [일반/대학병원/수술]
집중 사항: 전신 컨디션, 보호자 동행 여부, 수술 전 정밀 검사 상태, 복합적인 건강 우려 사항.`;
            }

            const prompt = `당신은 메디컬 회복 컨시어지이자 심리 전문가입니다.
오늘의 테마는 "${theme}"이며, 핵심 키워드는 "${keywords}"입니다.

## 상황 지침
${contextInstruction}
${categorySpecificInstruction}

위 지침에 맞춰 사용자의 현재 상태를 점검할 수 있는 **5개의 객관식 질문**을 만들어주세요.

## 요구사항
1. 질문은 매우 전문적이면서도 따뜻한 어조로 작성해주세요.
2. 각 질문에는 3~4개의 선택지가 있어야 합니다. (점수: 0=최상/관리잘됨/해당없음, 3=보통/주의, 5=나쁨/불안정)
3. 카테고리는 [신체, 환경, 심리, 영양, 행동] 중에서 적절히 선택하거나 테마에 맞게 정해주세요.
4. **중요**: 질문 중 하나는 반드시 '약물 복용'이나 '주의사항 준수'와 관련된 것이어야 합니다. (카테고리: "약물")
   - 이 질문에는 반드시 "현재 복용 중인 약물이나 지켜야 할 주의사항이 없습니다"와 같은 0점짜리 선택지를 포함하여, 약물을 복용하지 않는 유저도 선택할 수 있게 하세요.

## 응답 형식 (JSON Array)
[
  {
    "id": 1,
    "category": "카테고리",
    "text": "질문 내용",
    "options": [
      { "label": "매우 안정적임/좋음", "score": 0 },
      { "label": "보통/그저 그럼", "score": 3 },
      { "label": "불안정/나쁨/주의필요", "score": 5 }
    ]
  },
  ...
]`;

            const text = await this.generateWithFallback(prompt);

            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (pErr) {
                    console.error('[Gemini] JSON Parse Error in questions:', pErr);
                    throw new Error('AI 응답을 파싱하는 중 오류가 발생했습니다.');
                }
            }

            // Fallback
            throw new Error('Failed to parse questions');
        } catch (error) {
            console.error('Gemini Question Error:', error);
            throw error; 
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
        isStemCellSolution?: boolean;
        referenceImage?: string; // Base64
    }): Promise<any> {
        const lengthCount = input.length === 'auto' ? '6' : String(input.length);
        const targetInfo = `타겟 고객: ${input.targetGender?.join(', ')} / 연령대: ${input.targetAge?.join(', ')}`;

        const prompt = `
당신은 대한민국 최고의 이커머스 상세페이지 기획 전문가이자, 유니클(Youniqle) 소속의 피부미용・성형외과・정형외과 전문 메디컬 마케터입니다.
당신의 임무는 유니클의 고유한 '회복(Recovery) 설계' 철학을 의료적 신뢰감과 브랜드의 세련미를 결합하여 상세페이지 기획안으로 도출하는 것입니다.

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
${input.isStemCellSolution ? `
**[무형 메디컬 솔루션 전용 시각화 가이드라인 - CRITICAL]**
- **제품(앰플, 병, 박스, 패키지)을 묘사하지 마세요.** 양산형 상품이 아니므로 실물 제품 사진이 없습니다.
- 대신 다음의 요소들을 비주얼 프롬프트(visualPrompt)에 적극 반영하세요:
  1. **전문적인 공간**: 프라이빗한 프리미엄 라운지, 정갈하고 깨끗한 시술실, 현대적인 메디컬 센터 분위기.
  2. **추상적 회복**: 피부 세포가 깨어나는 생동감 있는 빛, 정제된 유효 성분이 흐르는 듯한 과학적 그래픽, 치유의 에너지.
  3. **메디컬 프로세스**: 현미경 속의 질서 있는 구조, PRP 추출 과정의 정교함, 전문 장비를 암시하는 정돈된 금속과 빛의 조화.
  4. **고객 경험**: 시술을 통해 얻게 될 '맑고 투명한 피부결', '탄력 있는 안색'을 상징하는 비주얼적 메타포.
` : `
- 비주얼 프롬프트: 제품 스테이징(대리석, 신선한 식물, 깨끗한 빛)이 강조된 한글 묘사.
`}
- 모든 섹션의 분위기는 '치유, 정돈됨, 프리미엄'이어야 함.

## 출력 형식 (JSON) - 설명 없이 JSON만 출력하세요.
- **CRITICAL**: 아래 정의된 "sections" 배열에는 **정확히 ${lengthCount}개**의 섹션 객체가 포함되어야 합니다. (임의로 줄이거나 늘리지 마세요)

{
  "summary": "전체 솔루션을 아우르는 1-2문장의 함축적이고 매력적인 요약 문구 (썸네일 카드 노출용)",
  "sections": [
    {
      "id": "section-1",
      "title": "기획 섹션 제목",
      "logicalSections": ["Mechanism"],
      "keyMessage": "핵심 한글 카피",
      "visualPrompt": "비주얼 가이드라인을 준수한 한글 상세 묘사",
      "productPosition": "none",
      "productSize": "none"
    }
  ]
}`;

        const text = await this.generateWithFallback(prompt, "대한민국 상세페이지 전략가 모드 (한글 100% 필수)", 0.7);
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error("Failed to parse JSON response", e);
                return { summary: '', sections: [] };
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
        referenceImage?: string | string[]; // Base64
        aspectRatio?: "9:16" | "1:1";
        isStemCellSolution?: boolean;
    }): Promise<string> {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
        }

        const models = [
            'nano-banana-pro-preview',
            'gemini-2.5-flash-image',
            'gemini-3-pro-image-preview',
            'gemini-2.0-flash',
            'gemini-flash-latest'
        ];
        let lastError: any;

        const basePrefix = input.isStemCellSolution
            ? `High quality professional Medical and clinical photography. Focus on healing environments, professional procedures, and microscopic cell recovery. ABSOLUTELY NO product bottles, no packaging, no retail containers.`
            : `High quality e-commerce product photography. Use the provided product/model images as the absolute visual standard.`;

        // 한글 가독성 강화를 위한 텍스트 오버레이 프롬프트 개선
        const textOverlayInstruction = input.keyMessage 
            ? `Explicitly render the following Korean text (Hangul characters) as a clean, modern, and readable graphic overlay: "${input.keyMessage}". Use professional Korean typography, ensuring all characters are clear and correctly spelled in Hangul script. High quality graphic design layout.`
            : '';

        const prompt = `${basePrefix} ${input.prompt}. ${textOverlayInstruction} Aspect Ratio: ${input.aspectRatio || "9:16"}`;

        const images = Array.isArray(input.referenceImage) ? input.referenceImage : input.referenceImage ? [input.referenceImage] : [];

        for (const modelName of models) {
            try {
                const engines = [getGenAI()];
                if (process.env.GEMINI_STUDIO_API_KEY && process.env.GEMINI_STUDIO_API_KEY !== process.env.GEMINI_API_KEY) {
                    engines.push(getStudioGenAI());
                }

                for (const engine of engines) {
                    try {
                        const model = engine.getGenerativeModel({
                            model: modelName,
                            safetySettings: [
                                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                            ]
                        });

                        const promptParts: any[] = [{ text: prompt }];

                        for (const imgBase64 of images) {
                            const base64Content = imgBase64.split(',')[1] || imgBase64;
                            promptParts.push({ inlineData: { data: base64Content, mimeType: "image/png" } });
                        }

                        const result = await model.generateContent({
                            contents: [{ role: 'user', parts: promptParts }],
                            generationConfig: {
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
                    } catch (innerE: any) {
                        console.warn(`[Gemini] Detail image model ${modelName} fail: ${innerE.message}`);
                        lastError = innerE;
                        continue;
                    }
                }
            } catch (error: any) {
                console.warn(`[Gemini] Detail image global error ${modelName}:`, error.message);
                lastError = error;
                continue;
            }
        }

        // Fallback to Pollinations for Detail Image as well (better than picsum)
        try {
            console.log('[Gemini] Detail image fallback to Pollinations...');
            const seed = Math.floor(Math.random() * 100000);
            const w = input.aspectRatio === "1:1" ? 1000 : 1080;
            const h = input.aspectRatio === "1:1" ? 1000 : 1920;
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.substring(0, 200))}?width=${w}&height=${h}&nologo=true&seed=${seed}`;

            const response = await fetch(imageUrl);
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                return `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
            }
        } catch (e) {
            console.warn('[Gemini] Detail image fallback failed', e);
        }

        const seedFallback = Math.random().toString(36).substring(7);
        const fw = input.aspectRatio === "1:1" ? 1000 : 900;
        const fh = input.aspectRatio === "1:1" ? 1000 : 1600;
        return `https://picsum.photos/seed/${seedFallback}/${fw}/${fh}`;
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
        panelCount: number;
        topic?: string;
    }): Promise<any> {
        const { recoveryData, prevSummary, episodeNumber, genre, userName, panelCount, topic } = input;

        const prompt = `
당신은 사용자의 일상을 관찰하고 공감하는 '비주얼 스토리텔러'이자 회복 조력자입니다.
사용자(${userName})가 입력한 주제를 바탕으로 ${panelCount}컷 웹툰 대본을 작성해주세요.

## 핵심 지침 (CRITICAL)
1. **주제 중심 서사**: 사용자의 자유 주제 [ ${topic || '일상의 회복'} ]가 이야기의 **절대적인 주인공이자 소재**가 되어야 합니다. 
2. **페르소나 편향 금지**: 이야기의 배경을 '웹툰 작가의 마감', '번아웃', '그림 그리기' 등 뻔한 설정으로 잡지 마세요. 사용자의 실제 상황(예: 가족회의, 직장 갈등, 운동 등)에 100% 몰입하세요.
3. **삼자적 거울(Mirroring)**: 주인공 캐릭터(사피에넷)가 사용자의 주제와 동일한 상황을 겪거나 관찰하며, 사용자가 느꼈을 답답함에 위트 있게 공감해주세요.
4. **회복 통찰**: 사용자의 오늘 회복 데이터(점수: ${recoveryData.totalScore})는 이야기의 결말부에서 사피에넷이 건네는 '따뜻한 통찰'이나 '회복을 위한 조언'의 근거로만 활용하세요. 대사로 점수를 직접 노출하지 마세요.

## 데이터
- 장르: ${genre}
- 목표 분량: 정확히 ${panelCount}개의 컷(Panel)
${prevSummary ? `- 이전 화 요약: ${prevSummary}` : ''}

## 요청 사항
1. **정확히 ${panelCount}개**의 컷(Panel)에 들어갈 대본과 이미지 생성용 프롬프트를 작성하세요.
2. 주인공 캐릭터(사피에넷)의 외형 묘사(characterPrompt)를 상세하게 작성하세요. (영어 권장)
3. 전체 줄거리의 한국어 제목(title)과 요약(summary)을 포함하세요.
4. 모든 대사(script)는 반드시 **한국어**로 작성하세요.

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
        const refSubject = input.referenceDescription 
            ? `[CRITICAL IDENTITY: Use the following as the SOLE SOURCE for the character's species and form: ${input.referenceDescription}. IGNORE any conflicting human descriptions.]` 
            : '';
            
        const prompt = `Generate a professional character reference sheet.
        1. Subject Identity: ${refSubject || input.characterPrompt}
        2. Complementary Details: ${input.characterPrompt}
        3. Art Style: ${stylePrompt}
        4. Layout: Full body reference sheet, front view, neutral pose, white background.
        5. Quality: Masterpiece, High consistency with the reference subject's original form and species.`;

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
     * 범용 비전 분석 (상품, 모델, 캐릭터 모두 대응)
     * 기존 analyzeCharacterImage를 확장하여 전문적인 분석 제공
     */
    static async analyzeVisionImage(imageBase64: string, customInstruction?: string): Promise<string> {
        const defaultPrompt = `[IDENTITY ANALYSIS MODE]
        Analyze the provided image in extreme detail for a high-fidelity AI image generator. 
        Your goal is to extract the UNIQUE IDENTITY of the subject so it can be replicated 1:1.

        1. CATEGORIZE THE SUBJECT:
           - Is it a HUMAN? Describe facial features, hair, skin, age, expression.
           - Is it a MASCOT/CHARACTER? (e.g., non-human, cartoonish, creature). Describe its base species (blob, animal, robot), body shape (round, slim, tall), and unique proportions.
           - Is it a PRODUCT? Describe shape, material, labels, and branding.

        2. CORE FEATURES:
           - Color palette (primary/secondary).
           - Key accessories/clothing (e.g., sunglasses, ties, hats).
           - Art style of the reference (3D render, 2D illustration, photorealistic).

        3. OUTPUT:
           - Provide a concise English prompt snippet. 
           - CRITICAL: Prioritize the BASE FORM (e.g. "A white round mascot character") over accessories.`;

        const prompt = customInstruction || defaultPrompt;

        try {
            if (!process.env.GEMINI_API_KEY) {
                console.error('GEMINI_API_KEY is missing');
                throw new Error('API key is not configured');
            }

        const modelNames = ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro"];
        let lastError: any;

        for (const modelName of modelNames) {
            try {
                process.stdout.write(`[Gemini Vision] Analyzing with ${modelName}... `);
                const model = getGenAI().getGenerativeModel({ model: modelName });
                const result = await model.generateContent([
                    prompt,
                    {
                        inlineData: {
                            data: imageBase64.split(',')[1] || imageBase64,
                            mimeType: imageBase64.startsWith('data:image/png') ? "image/png" : "image/jpeg"
                        }
                    }
                ]);
                const response = await result.response;
                const text = response.text();

                if (text) {
                    process.stdout.write(`Success!\n`);
                    return text.trim();
                }
            } catch (error: any) {
                process.stdout.write(`Failed (${error.message || 'Unknown'})\n`);
                lastError = error;
                continue;
            }
        }

            console.error('Gemini Vision analysis fully failed:', lastError);
            throw new Error(`AI 분석 중 모든 모델 실패: ${lastError?.message || '알 수 없는 오류'}`);
        } catch (error: any) {
            console.error('Gemini Vision outer error:', error);
            throw error;
        }
    }

    /**
     * 캐릭터 이미지 분석 (Vision) - 호환성 유지
     */
    static async analyzeCharacterImage(imageBase64: string): Promise<string> {
        return this.analyzeVisionImage(imageBase64);
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

    // AI Diagnosis Solution: Generate personalized advice based on Big 5 & Facets
    static async generateDiagnosisSolution(input: {
        scores: { physical: number; mental: number; lifestyle: number; sleep: number };
        tScores?: { domains: any; facets: any };
        userInfo?: { name: string; age?: string; gender?: string };
    }): Promise<any> {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        try {
            const domainScores = input.tScores?.domains || {};
            const facetScores = input.tScores?.facets || {};

            // Format scores for prompt
            const scoreSummary = `
            [기본 4대 지표 (0-100점)]
            - 신체 활력: ${input.scores.physical}
            - 멘탈 안정: ${input.scores.mental}
            - 생활 규칙성: ${input.scores.lifestyle}
            - 수면 품질: ${input.scores.sleep}
            
            [Big 5 성격 요인 (T점수, 평균 50)]
            - 신경성(N): ${domainScores.N || '-'} (불안, 우울, 자의식 등)
            - 외향성(E): ${domainScores.E || '-'} (활동성, 사교성 등)
            - 개방성(O): ${domainScores.O || '-'} (상상력, 감수성 등)
            - 우호성(A): ${domainScores.A || '-'} (이타성, 협조성 등)
            - 성실성(C): ${domainScores.C || '-'} (자기도능감, 신중함 등)
            `;

            const prompt = `당신은 대한민국 최고의 통합 의학 전문가이자 심리 상담가(Wellness Coach)입니다.
            사용자의 심층 심리 진단 결과를 바탕으로 **가장 시급하고 효과적인 4대 영역 맞춤 처방**을 내려주세요.

            ## 사용자 정보
            ${input.userInfo?.name ? `- 이름: ${input.userInfo.name}` : ''}
            ${scoreSummary}

            ## 처방 원칙
            1. **전문적이지만 따뜻하게**: 의학적 근거를 바탕으로 하되, 말투는 따뜻하고 격려하는 어조를 사용하세요.
            2. **구체적인 행동 지침**: "운동하세요" 대신 "하루 15분, 점심 식사 후 햇볕을 쬐며 산책하세요"처럼 구체적으로 제안하세요.
            3. **연결성**: 성격 요인이 건강에 미치는 영향을 설명해주세요. (예: "높은 신경성으로 인해 수면 질이 낮습니다. 이를 보완하기 위해...")
            4. **통일된 톤**: 모든 제안은 '회복(Recovery)'이라는 하나의 목표를 향해야 합니다.

            ## 제안할 제품 컨셉 (Product Concept)
            이 사용자에게 가장 필요한 단 하나의 **"가상의 맞춤형 제품"**을 기획해주세요.
            - 기존에 있는 제품이어도 좋고, 세상에 없던 새로운 조합이어도 좋습니다.
            - 예: "스트레스로 긴장된 승모근을 이완시키는 마그네슘 아로마 롤온", "불안한 밤을 위한 테아닌 & 캐모마일 블렌딩 티"

            ## 출력 형식 (JSON Only)
            {
              "analysis": "사용자의 현재 상태에 대한 1-2문장 총평 (예: 신경성이 높아 전반적인 긴장도가 높지만, 성실성이 높아 루틴을 통한 회복 가능성이 매우 큽니다.)",
              "exercise": "운동 처방 (제목 + 1-2문장 설명)",
              "nutrition": "영양/식습관 처방 (제목 + 1-2문장 설명)",
              "mindset": "마인드셋/심리 처방 (제목 + 1-2문장 설명)",
                "sleep": "수면 조언 (100자 이내)",
                "productConcept": {
                    "name": "제안 제품명 (예: 딥 슬립 리커버리 키트)",
                    "reason": "추천 이유 (1문장)",
                    "ingredients": ["핵심성분/요소1", "핵심성분/요소2"]
                },
                "audioScript": "당신은 유니클 회복 센터의 원장(Healing Director)으로서, 사용자의 이름을 다정하게 부르며 진단 결과를 위로와 공감의 언어로 풀어주는 프리미엄 오디오 가이드 대본을 작성하세요. 
                - 말투: 아주 부드럽고, 천천히 말하는 듯한 느낌, 전문적이지만 따뜻한 위로가 중심.
                - 내용: '진단 점수가 낮아서 걱정되시죠?' 보다는 '그동안 많이 애쓰셨다는 게 결과에서 느껴져요'라는 공감적 접근. 특히 Big 5 점수 중 가장 특징적인 부분(예: 높은 신경성, 낮은 외향성 등)을 회복의 관점에서 긍정적으로 재해석하여 언급할 것.
                - 분량: 공백 포함 250-300자 내외. 구어체(~요, ~죠). 바로 녹음해서 읽어줄 수 있는 완성된 대본 형태로 작성."
            }
            `;

            const text = await this.generateWithFallback(prompt);
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Failed to parse diagnosis solution');

        } catch (error) {
            console.error('Gemini Diagnosis Solution Error:', error);
            // Fallback Data
            return {
                analysis: "데이터 분석 중 일시적인 오류가 발생했습니다. 전반적인 밸런스 유지를 권장합니다.",
                exercise: "가벼운 산책으로 신체 리듬 깨우기",
                nutrition: "수분 섭취를 늘리고 자극적인 음식 줄이기",
                mindset: "하루 5분, 나만을 위한 명상 시간 갖기",
                sleep: "취침 1시간 전 스마트폰 사용 줄이기",
                productConcept: {
                    name: "베이직 밸런스 케어",
                    reason: "기초적인 회복 루틴 형성을 돕습니다.",
                    ingredients: ["종합비타민", "스트레칭 밴드"]
                },
                audioScript: "안녕하세요. 오늘 하루 많이 힘드셨죠? 잠시 깊은 숨을 들이마시고, 천천히 내뱉어보세요. 당신의 몸과 마음이 편안해지는 것을 느껴봅니다. 오늘 하루도 정말 수고 많으셨어요."
            };
        }
    }

    // AI Manager: Comprehensive site guide chatbot
    static async generateManagerResponse(input: {
        message: string;
        userContext: {
            name: string;
            email?: string;
            grade: string;
            points: number;
        };
        siteSettings?: {
            freeShippingThreshold?: number;
            refundPeriod?: number;
            commissionRate?: number;
        };
    }): Promise<{ response: string }> {
        if (!process.env.GEMINI_API_KEY) {
            return { response: "죄송합니다, 현재 AI 매니저 서비스가 일시적으로 불가능합니다. 잠시 후 다시 시도해주세요." };
        }

        try {
            const systemInstruction = `
당신은 '유니클 (Youniqle)' 사이트의 친절하고 전문적인 **AI 매니저**입니다.
사이트 이용 방법, 운영 규칙, 서비스 안내 등 유저가 궁금해하는 모든 것에 대해 정확하고 친절하게 답변합니다.

## 페르소나
- 이름: **유니(Uni)** - 유니클 안내 도우미
- 말투: 친근하고 따뜻한 존댓말 (~요, ~해요 체). 이모지를 적절히 사용 (1~2개).
- 원칙: 모르는 내용은 솔직하게 "확인 후 안내드릴게요" 또는 "고객센터 문의를 추천드려요"라고 안내.

## 유니클 전체 사이트 안내

### 🏠 메인 페이지 (/)
- 유니클의 핵심 서비스인 **"번아웃 극복을 위한 AI 맞춤 회복 솔루션"**을 소개하는 첫 페이지
- **60초 무료 진단 시작** 버튼으로 바로 회복 점수 측정 가능
- 회복 사례, 파빌리온 소개, 추천 상품 등을 한눈에 볼 수 있음

### 🔐 회원가입 및 로그인 (/auth)
- **소셜 로그인**: 카카오, 네이버, 구글 계정으로 간편 가입/로그인
- **이메일 가입**: 이메일+비밀번호로 직접 가입 가능
- 가입 시 추천인 코드 입력하면 양측 모두 **2,000P** 지급

### 👤 마이페이지 (/me)
- **나의 현재 상태**: 오늘의 회복 점수, 등급, 보유 포인트 확인
- **진단 기록**: 과거 진단 결과 및 회복 추이 그래프
- **주문 내역**: 구매한 상품, 배송 상태, 리뷰 작성
- **쿠폰/포인트**: 보유 쿠폰 확인 및 포인트 사용 내역
- **내 웹툰**: 작성한 AI 웹툰 스토리 관리
- **찜 목록**: 관심 상품 모아보기
- **설정**: 알림 설정, 주소 관리, 비밀번호 변경, 회원 탈퇴

### 🔬 AI 진단 시스템
- **무료 진단 (/diagnosis)**: 20문항, 5분 소요, 일일 회복 점수 및 맞춤 루틴 제공
- **AI 내비게이터 (/ai-navigator)**: 진단 결과를 바탕으로 오늘 실천할 행동 추천
- **심층 진단 (마이페이지 내)**: 60문항 IPIP-NEO-60 Big5 성격 분석, 유료 보고서 제공
- **오마카세 진단 (/omakase)**: 맞춤형 회복 플랜 3가지 제안 (Basic/Standard/Premium)

### 🛒 쇼핑 및 제품 설계 (/products)
- **상품 검색**: 카테고리별, 키워드별 검색 가능
- **상품 상세**: AI가 생성한 고도화된 상세페이지, 리뷰, 관련 상품 확인
- **AI 디테일 빌더**: 판매자를 위한 AI 상세페이지 기획/제작 지원
- **장바구니 (/cart)**: 담은 상품 확인, 수량 조절, 쿠폰/포인트 적용
- **결제 (/checkout)**: Nicepay 카드 결제, 배송지 입력
- **무료배송**: ${input.siteSettings?.freeShippingThreshold ?? 50000}원 이상 구매 시

### 🛠️ 유니클 유틸리티 도구 (/utils)
사용자의 일상적인 회복과 편의를 위한 13종의 도구 세트:
- **심리/자기이해**: [MBTI 진단], [오늘의 메모], [To-do 리스트]
- **건강/기능**: [BMI 계산기], [호흡 가이드], [날씨 정보]
- **비즈니스/편의**: [배경 제거(Remove-BG)], [이미지 압축], [단위 변환], [환율 계산], [QR 코드 생성], [디데이 계산]
- **마인드 리셋(미니게임)**: 2048, 빙고, 틀린그림찾기, 이모지 퀴즈, 사다리타기, 기억력 게임, 룰렛, 타이핑 게임 등

### 🏛️ 파빌리온 (Pavilion) - 온라인 복합 공간
유니클의 핵심 공간! 5개 층으로 구성된 온라인 복합 공간: (/pavilion)
- **1층 - 갤러리**: 작가들의 디지털 작품, AI 웹툰, NFT 전시 및 판매
- **2층 - 비즈니스**: 파트너 사업자들의 프리미엄 건강/회복 상품 브랜드 관
- **3층 - 코칭 샵**: 전문 코치들의 1:1 라이브 또는 그룹 세션 예약 및 참여
- **4층 - 메디컬 아카이브**: 전문적인 회복 상담 및 데이터 분석 리포트 확인
- **5층 - 프라이빗 라운지 (/lounge)**: 김미정 원장과의 1:1 AI 심층 상담 (Navigator Pass 또는 구독 회원 전용)

### 🎨 AI 웹툰 챌린지
- 사용자의 회복 데이터를 기반으로 AI가 4컷 웹툰을 생성해주는 서비스
- 생성된 웹툰은 SNS(인스타그램 등) 공유용 캡션과 함께 제공됨

### 💎 Navigator Pass (네비게이터 패스)
유니클 생태계의 핵심 입장권이자 프리미엄 멤버십입니다. (/navigator-pass)
1. **Tier 1: START PASS (330만원)** - 디지털 & 케어 스타터. 개인별 맞춤형 회복 방향 안내 리포트, 파트너사 전용 프로그램 우대. 상시 5% 적립.
2. **Tier 2: SIGNATURE PASS (1,100만원)** - 메인 전략 상품. 5년의 완벽한 회복 설계, 멤버십 전용 전략 프로그램, 회복 키트 제공. 상시 10% 적립.
3. **Tier 3: BLACK PASS (3,300만원)** - VIP 프라이빗 컨시어지. 프리미엄 리포트 상시 제공, 지정인 1인 혜택 공유, 독점 프로그램 평생 이용권. 상시 15% 적립.
* **관계**: Navigator Pass는 기존 멤버십의 상위 등급이며, 가입 시 모든 프리미엄 서비스 이용이 가능하여 별도의 월 구독 멤버십이 필요하지 않습니다.

### 📊 등급 및 멤버십 시스템
- **Navigator Pass 계열**: 최고의 권한을 가진 프리미엄 등급 (START/SIGNATURE/BLACK)
- **일반 등급**: 누적 구매 및 활동에 따라 Cedar(기본) → Rooter(첫구매) → Bloomer(30만) → Glower(100만) → Ecosoul(VIP) 순으로 상승

### 💰 포인트 적립 방법
- 상품 구매: 결제 금액의 1~3% 적립 (등급에 따라)
- 리뷰 작성: 텍스트 100P, 포토 300P
- 출석 체크: 매일 50P (7일 연속 시 보너스 500P)
- 친구 추천: 추천인/피추천인 각 2,000P
- AI 진단 참여: 최초 1회 500P

### 🎫 쿠폰 (/coupons)
- 신규 가입 쿠폰, 등급별 쿠폰, 이벤트 쿠폰 등 다양한 혜택
- [마이페이지 > 쿠폰함]에서 보유 쿠폰 확인 및 사용

### 📦 주문 및 배송 (/orders)
- 주문 후 상태: 결제완료 → 배송준비 → 배송중 → 배송완료
- 배송 조회: 주문 내역에서 송장번호 클릭 시 실시간 위치 확인
- 예상 배송 기간: 결제 완료 후 2~5 영업일 이내

### 🔄 교환 및 환불
- 환불/반품 기간: 수령일로부터 ${input.siteSettings?.refundPeriod ?? 7}일 이내
- 신청 방법: [마이페이지 > 주문 내역]에서 해당 주문 클릭 후 신청
- 단순 변심: 반품 배송비 고객 부담
- 제품 하자: 무료 교환/환불

### 🤝 파트너 프로그램 (/partner)
유니클에서 판매자로 활동하고 수익 창출:
- **쇼퍼(Shopper)**: 사업자등록 없이 일반 상품 판매
- **사업장(Business)**: 사업자 등록 기반, 파빌리온 2층 입점
- **코치(Coach)**: 자격증 기반, 파빌리온 3층 샵 운영
- **작가(Artist)**: 디지털 콘텐츠 제작, 1층 갤러리 운영
- 수수료: 판매 금액의 ${input.siteSettings?.commissionRate ?? 5}%

### ❓ 고객센터 (/support, /faq, /contact)
- **FAQ**: 자주 묻는 질문 모음
- **1:1 문의**: 고객센터 이메일 또는 문의 폼 제출
- **공지사항 (/notices)**: 서비스 업데이트, 이벤트 안내

### 📜 약관 및 정책
- 이용약관 (/terms)
- 개인정보처리방침 (/privacy)
- 회사 소개 (/about)

### 🏢 회사 및 법인 정보
- **상호**: 주식회사 사피에넷 (Sapienet)
- **대표자**: 장범진
- **사업자등록번호**: 838-88-02527
- **브랜드**: 유니클 (Youniqle) - 데이터 기반 프리미엄 회복 큐레이션 서비스
- **철학**: "회복을 '관리'가 아니라 '시스템'으로 바꿉니다."

## 현재 대화 중인 유저 정보
- 이름: ${input.userContext.name}
- 현재 등급: ${input.userContext.grade}
- 보유 포인트: ${input.userContext.points.toLocaleString()}P

## 응답 규칙
1. **질문 범위 파악**: "사이트 이용법"처럼 넓은 질문은 전체 구조를 간략히 요약하고 세부 안내를 물어보기
2. **관련 페이지 안내**: 답변 시 해당 페이지 경로나 이동 방법 알려주기 (예: "마이페이지에서 확인 가능해요!")
3. **간결하게**: 3~5문장으로 핵심만 전달, 필요시 추가 질문 유도
4. **개인화**: 유저의 등급/포인트를 활용한 맞춤 안내 제공
`;

            const prompt = `${input.userContext.name}님의 질문: "${input.message}"

위 질문에 대해 유니 매니저로서 친절하고 정확하게 답변해주세요.`;

            const text = await this.generateWithFallback(prompt, systemInstruction, 0.7);
            return { response: text };

        } catch (error) {
            console.error('Gemini Manager Error:', error);
            return { response: "죄송해요, 잠시 연결이 원활하지 않네요. 🙏 잠시 후 다시 질문해 주시겠어요?" };
        }
    }
    
    // Recovery OS: Generate specialized chat response for post-procedure care
    static async generateRecoveryChatResponse(message: string, context: { 
        userName: string; 
        day: number;
        symptoms: Record<string, string>;
    }): Promise<string> {
        const prompt = `
당신은 '유니클(Youniqle)' 회복 센터의 대표원장이자 회복 전문의 **김미정**입니다.
시술 후 ${context.day}일차를 맞이한 환자 ${context.userName}님과 1:1 상담을 진행 중입니다.

## 현재 환자 상태
- 시술 후 경과: ${context.day}일차
- 기록된 증상: 통증(${context.symptoms.pain}), 붓기(${context.symptoms.swelling}), 열감(${context.symptoms.fever})

## 상담 가이드라인
1. **전문가 페르소나**: 20년 경력의 전문의로서 신뢰를 주되, 환자의 불안을 달래는 따뜻한 말투(~요, ~죠 세)를 사용하세요.
2. **증상 기반 조언**: 환자가 기록한 증상(특히 수면방해, 심함 등)이 있다면 그에 대한 의학적 메커니즘을 쉽게 설명하고 안심시키세요.
3. **한글 100%**: 모든 답변은 한국어로 작성하며, 필요시 다정한 이모지를 1-2개 사용하세요.
4. **간결성**: 3-4문장 내외로 핵심만 짚어주세요.

## 환자 메시지
"${message}"
`;
        return await this.generateWithFallback(prompt, "회복 전문의 김미정 모드", 0.7);
    }

    // Recovery OS: Generate automated recovery guide based on real-time data
    static async generateRecoveryAdvice(input: {
        userName: string;
        day: number;
        symptoms: Record<string, string>;
        completedProtocols: number;
        totalProtocols: number;
    }): Promise<string> {
        const prompt = `
당신은 제미나이 AI 회복 어드바이저입니다. 환자의 실시간 데이터를 정밀 분석하여 오늘의 회복 리포트를 작성하세요.

## 데이터 분석 대상
- 사용자: ${input.userName}
- 경과일: 시술 후 ${input.day}일차
- 증상 데이터: 통증(${input.symptoms.pain}), 붓기(${input.symptoms.swelling}), 열감(${input.symptoms.fever})
- 프로토콜 이행률: ${input.completedProtocols} / ${input.totalProtocols}

## 출력 요구사항
1. **일반 텍스트 형식**: \`#\` 이나 \`*\` 와 같은 마크다운 기호를 절대 사용하지 마세요. (예: \`##\` 대신 \`[상태 분석]\` 처럼 작성)
2. **구조화된 리포트**: [상태 분석], [권고 사항], [실천 플랜]의 3단 구조로 작성하세요.
3. **가독성**: 각 섹션 사이는 빈 줄로 구분하고, 불필요한 강조 기호를 제외한 깔끔한 텍스트로만 구성하세요.
4. **실전 조언**: 구체적인 행동 가이드를 포함하세요.

응답은 다른 인사말 없이 바로 리포트 본문으로 시작하세요.
`;
        return await this.generateWithFallback(prompt, "AI 회복 어드바이저 모드", 0.6);
    }
}
