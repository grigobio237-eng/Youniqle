import { GeminiCore } from '../engine/core';
import { OmakaseInput, OmakaseOutput, RecoveryCaseInput, RecoveryCaseOutput } from '../types';

export class ContentService {
    static async generateDetailImage(prompt: string, options: any = {}): Promise<string | null> {
        const imageModels = await GeminiCore.getTieredModels('image');
        const modelName = imageModels[0] || 'imagen-3.0-generate-001';
        
        try {
            // Placeholder for Imagen implementation logic
            // Since the existing engine used it as a static property, we'll keep the logic consistent
            return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000"; // Fallback URL for now
        } catch (error) {
            console.error('Image Generation Error:', error);
            return null;
        }
    }

    static async generateOmakasePlans(input: OmakaseInput): Promise<OmakaseOutput> {
        const prompt = `사용자의 페인포인트(${input.painPoint})에 맞는 3가지 회복 오마카세 플랜을 제안하세요. JSON Only.`;
        try {
            const response = await GeminiCore.generateWithFallback(prompt, "유니클 리커버리 셰프 모드", 0.7);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
        } catch (error) {}
        throw new Error("Omakase generation failed");
    }

    static async generateRecoveryWebtoonScript(input: RecoveryCaseInput): Promise<RecoveryCaseOutput> {
        const prompt = `유저의 증상("${input.symptom}")을 바탕으로 회복 여정 웹툰 스크립트를 작성하세요. JSON Only.`;
        try {
            const response = await GeminiCore.generateWithFallback(prompt, "회복 스토리텔러 모드", 0.8);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
        } catch (error) {}
        throw new Error("Webtoon script failed");
    }

    static async generateManagerResponse(input: any): Promise<{ response: string }> {
        const systemInstruction = `당신은 유니클의 AI 매니저 '유니'입니다. 유저 정보: ${input.userContext.name}`;
        const prompt = `유저 질문: "${input.message}"`;
        try {
            const text = await GeminiCore.generateWithFallback(prompt, systemInstruction, 0.7);
            return { response: text };
        } catch (error) {
            return { response: "잠시 후 다시 시도해주세요." };
        }
    }
}
