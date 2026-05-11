import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import { getKSTDate } from '@/lib/date';

// Simple in-memory cache for paraphrased questions
const paraphrasedCache = (global as any)._paraphrasedCache || new Map<string, any>();
(global as any)._paraphrasedCache = paraphrasedCache;

// Concurrency lock
const dynamicQLock = (global as any)._dynamicQLock || new Map<string, Promise<any>>();
(global as any)._dynamicQLock = dynamicQLock;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { question, context } = body;

        if (!question) {
            return NextResponse.json({ error: 'Question is required' }, { status: 400 });
        }

        const today = getKSTDate();
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
