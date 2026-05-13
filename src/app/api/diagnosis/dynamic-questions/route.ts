import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import { getKSTDate } from '@/lib/date';
import { ALL_QUESTIONS } from '@/lib/data/diagnosis-questions';

// Simple in-memory cache for paraphrased questions/daily sets
const paraphrasedCache = (global as any)._paraphrasedCache || new Map<string, any>();
(global as any)._paraphrasedCache = paraphrasedCache;

// Concurrency lock
const dynamicQLock = (global as any)._dynamicQLock || new Map<string, Promise<any>>();
(global as any)._dynamicQLock = dynamicQLock;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { question, context, userName } = body;
        const today = getKSTDate();

        // CASE 1: Daily Diagnosis Generation (No specific question provided)
        if (!question) {
            const cacheKey = `daily-set-${today}-${userName || 'guest'}`;
            
            if (paraphrasedCache.has(cacheKey)) {
                return NextResponse.json(paraphrasedCache.get(cacheKey));
            }

            console.log(`[Gemini] Generating daily 16-question set for ${userName}...`);

            // Pick 16 questions (4 from each of the 4 categories)
            const categories = ['Mindset', 'Emotional', 'Social', 'Physical'];
            const selectedQuestions: any[] = [];

            categories.forEach(cat => {
                const catQuestions = ALL_QUESTIONS.filter(q => q.category === cat);
                // Shuffle and pick 4
                const shuffled = [...catQuestions].sort(() => 0.5 - Math.random());
                selectedQuestions.push(...shuffled.slice(0, 4));
            });

            // Randomize the final order
            const finalQuestions = selectedQuestions.sort(() => 0.5 - Math.random());

            // Use AI to generate a theme/greeting for the day
            const prompt = `
            사용자(${userName || '요원'})를 위한 오늘의 '회복 리듬 측정' 테마와 환영 메시지를 생성해주세요.
            오늘의 날짜는 ${today}입니다.
            
            [응답 형식 (JSON)]
            {
              "theme": "오늘의 테마 (예: 월요병 극복을 위한 에너지 충전)",
              "greeting": "친근한 인사말 (1~2문장)"
            }`;

            let themeData = { theme: '오늘의 회복 리듬체크', greeting: `${userName || '요원'}님, 오늘의 에너지를 확인해볼까요?` };
            try {
                const aiResponse = await GeminiAIEngine.generateText(prompt);
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) themeData = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error('Failed to generate theme with AI', e);
            }

            const result = {
                questions: finalQuestions,
                theme: themeData.theme,
                greeting: themeData.greeting
            };

            paraphrasedCache.set(cacheKey, result);
            return NextResponse.json(result);
        }

        // CASE 2: Specific Question Paraphrasing (Original behavior)
        const cacheKey = `${today}-${question}`;
        
        let resultData;
        if (dynamicQLock.has(cacheKey)) {
            console.log(`[Lock Hit] Waiting for in-progress dynamic question for ${cacheKey}`);
            resultData = await dynamicQLock.get(cacheKey);
        } else {
            const requestPromise = (async () => {
                // Check cache first
                if (paraphrasedCache.has(cacheKey)) {
                    return paraphrasedCache.get(cacheKey);
                }

                console.log(`[Gemini] Paraphrasing dynamic question: ${question.substring(0, 20)}...`);
                const paraphrased = await GeminiAIEngine.paraphraseQuestion({
                    question,
                    context
                });

                const result = { paraphrased };
                paraphrasedCache.set(cacheKey, result);
                return result;
            })();

            dynamicQLock.set(cacheKey, requestPromise);
            try {
                resultData = await requestPromise;
            } finally {
                dynamicQLock.delete(cacheKey);
            }
        }

        return NextResponse.json(resultData);

    } catch (error) {
        console.error('Dynamic Questions API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
