import { GeminiCore } from '../engine/core';
import { DiagnosisInput, DiagnosisOutput, MedicalInterviewGuideOutput, PostCareRoadmapOutput } from '../types';

export class MedicalService {
    static async generateDiagnosisSolution(input: DiagnosisInput): Promise<DiagnosisOutput> {
        const userName = input.userInfo?.name || '회원';
        const scoreSummary = `
        - 사용자 이름: ${userName}
        - 신체 활력: ${input.scores.physical}, 멘탈 안정: ${input.scores.mental}, 생활 규칙성: ${input.scores.lifestyle}, 수면 품질: ${input.scores.sleep}
        - Big 5 T점수: ${JSON.stringify(input.tScores || {})}
        `;

        const prompt = `
        당신은 대한민국 최고의 통합 의학 전문가이자 유니클(YOUNIQLE)의 수석 리커버리 디렉터입니다. 
        사용자의 심층 진단 결과(${scoreSummary})를 정밀 분석하여 맞춤형 회복 솔루션을 제공해주세요.

        [응답 지침]
        1. 모든 응답은 반드시 지정된 JSON 형식으로만 출력하세요.
        2. 'audioScript'는 사용자의 성격과 점수 결과를 바탕으로 원장님이 직접 들려주는 듯한 따뜻하고 전문적인 위로와 조언을 담아 4~5문장으로 작성하세요.
        3. 'analysis'는 전체적인 상태를 한 문장으로 정의하세요.

        [JSON Schema]
        {
          "analysis": "문자열",
          "exercise": "문자열 (추천 운동)",
          "nutrition": "문자열 (추천 영양)",
          "mindset": "문자열 (추천 마인드셋)",
          "sleep": "문자열 (추천 수면법)",
          "productConcept": {
            "name": "문자열 (추천 제품명)",
            "reason": "문자열 (추천 이유)",
            "ingredients": ["성분1", "성분2"]
          },
          "audioScript": "사용자에게 들려줄 음성 가이드 텍스트 (공백 포함 200자 내외)"
        }
        `;

        try {
            const text = await GeminiCore.generateWithFallback(prompt, "유니클 수석 리커버리 디렉터 모드", 0.7);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                // 필드 누락 방지 보완
                return {
                    analysis: parsed.analysis || "밸런스 유지를 권장합니다.",
                    exercise: parsed.exercise || "가벼운 산책",
                    nutrition: parsed.nutrition || "수분 섭취 늘리기",
                    mindset: parsed.mindset || "5분 명상",
                    sleep: parsed.sleep || "취침 전 스마트폰 자제",
                    productConcept: parsed.productConcept || { name: "베이직 밸런스", reason: "기초 형성", ingredients: ["비타민"] },
                    audioScript: parsed.audioScript || `${userName}님, 현재 상태를 바탕으로 맞춤 회복 플랜을 준비했습니다. 규칙적인 생활이 가장 중요합니다.`
                };
            }
            throw new Error('Parsing failed');
        } catch (error) {
            console.error('Gemini Solution Generation Failed:', error);
            return {
                analysis: "밸런스 유지를 권장합니다.",
                exercise: "가벼운 산책",
                nutrition: "수분 섭취 늘리기",
                mindset: "5분 명상",
                sleep: "취침 전 스마트폰 자제",
                productConcept: { name: "베이직 밸런스", reason: "기초 형성", ingredients: ["비타민"] },
                audioScript: `${userName}님, 분석 결과 전반적인 에너지 밸런스 조절이 필요해 보입니다. 유니클이 제안하는 루틴을 따라보세요.`
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
