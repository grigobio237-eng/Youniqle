import { NextResponse } from 'next/server';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

export async function GET() {
    try {
        console.log("Testing Gemini API...");
        const response = await GeminiAIEngine.generateChatResponse("안녕하세요, 원장님. 요즘 뱃살이 너무 늘어서 고민이에요.", { userName: "테스트유저", grade: "Premium" });
        console.log("Gemini Response:", response);
        return NextResponse.json({ success: true, response });
    } catch (error: any) {
        console.error("Gemini Test Error:", error);
        return NextResponse.json({ success: false, error: error.message || String(error) });
    }
}
