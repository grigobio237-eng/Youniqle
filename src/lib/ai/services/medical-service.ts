import { GeminiCore } from '../engine/core';
import { DiagnosisInput, DiagnosisOutput, MedicalInterviewGuideOutput, PostCareRoadmapOutput } from '../types';

export class MedicalService {
    static async generateDiagnosisSolution(input: DiagnosisInput): Promise<DiagnosisOutput> {
        const scoreSummary = `
        - 신체 활력: ${input.scores.physical}, 멘탈 안정: ${input.scores.mental}, 생활 규칙성: ${input.scores.lifestyle}, 수면 품질: ${input.scores.sleep}
        - Big 5 T점수: ${JSON.stringify(input.tScores || {})}
        `;

        const prompt = `당신은 대한민국 최고의 통합 의학 전문가이자 심리 상담가입니다. 사용자 심층 진단 결과(${scoreSummary})를 바탕으로 4대 영역 맞춤 처방을 내려주세요. JSON Only.`;

        try {
            const text = await GeminiCore.generateWithFallback(prompt);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            throw new Error('Parsing failed');
        } catch (error) {
            return {
                analysis: "밸런스 유지를 권장합니다.",
                exercise: "가벼운 산책", nutrition: "수분 섭취 늘리기", mindset: "5분 명상", sleep: "취침 전 스마트폰 자제",
                productConcept: { name: "베이직 밸런스", reason: "기초 형성", ingredients: ["비타민"] },
                audioScript: "수고 많으셨습니다."
            };
        }
    }

    static async generateMedicalInterviewGuide(data: any): Promise<MedicalInterviewGuideOutput> {
        const prompt = `유니클 수석 코디네이터로서 사용자의 사전 문진 데이터를 정밀 분석하여 면담 가이드를 작성하세요. 데이터: ${JSON.stringify(data)}`;
        try {
            const text = await GeminiCore.generateWithFallback(prompt, "유니클 수석 코디네이터 모드", 0.7);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            throw new Error('Parsing failed');
        } catch (error) {
            return {
                analysis: "필수 면담 항목을 정리해 드립니다.",
                mustAskQuestions: [{ question: "예상되는 통증과 관리법은?", rationale: "안전한 관리 필수" }],
                hospitalTips: ["사소한 병력도 말씀하세요"]
            };
        }
    }

    static async generatePostCareRoadmap(data: any): Promise<PostCareRoadmapOutput> {
        const prompt = `유니클 수석 리커버리 전문가로서 시술 후 로드맵을 작성하세요. 데이터: ${JSON.stringify(data)}`;
        try {
            const text = await GeminiCore.generateWithFallback(prompt, "유니클 리커버리 전문가 모드", 0.7);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            throw new Error('Parsing failed');
        } catch (error) {
            return {
                statusAnalysis: "표준 가이드를 제공합니다.", isEmergency: false, recoveryPhase: "초기 집중 관리기",
                timeline: [{ period: "초기", goal: "붓기 억제", instructions: ["냉찜질"] }],
                expertAdvice: ["특이사항 발생 시 병원 연락"]
            };
        }
    }

    static async analyzeSymptom(symptom: string): Promise<{ category: string; reason: string }> {
        const prompt = `증상("${symptom}")에 맞는 진료 분야(ORTHOPEDIC, INTERNAL, PLASTIC, GENERAL)를 추천하세요. JSON {category, reason}`;
        try {
            const text = await GeminiCore.generateWithFallback(prompt);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
        } catch (error) {}
        return { category: 'GENERAL', reason: '일반 상담 연결' };
    }

    static async generateRecoveryAdvice(input: any): Promise<string> {
        const prompt = `환자의 실시간 데이터 분석 리포트를 작성하세요. 데이터: ${JSON.stringify(input)}`;
        return await GeminiCore.generateWithFallback(prompt, "AI 회복 어드바이저 모드", 0.6);
    }
}
