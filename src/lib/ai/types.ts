export interface NavigatorInput {
    userId: string;
    date: string;
    scores: {
        q1: number; // fatigue
        q2: number; // sleep
        q3: number; // swelling
        q4: number; // mood
        q5: number; // focus
    };
    yesterdayScore?: number;
}

export interface NavigatorOutput {
    comment: string;
    actionItem: string;
    recoveryScore: number;
}

export interface OmakaseInput {
    userId: string;
    painPoint: string;
    goal: string;
    budget: '30' | '50' | '100+' | string;
    symptoms: string[];
}

export interface OmakasePlan {
    planId: string;
    title: string;
    description: string;
    duration: string;
    priceEstimate: string;
    focusArea: string;
    routine: string[];
}

export interface OmakaseOutput {
    analysis: string;
    plans: {
        planA: OmakasePlan; // Basic/Essential
        planB: OmakasePlan; // Standard/Balanced
        planC: OmakasePlan; // Premium/Intensive
    };
}

export interface RecoveryCaseInput {
    symptom: string;
    age?: string;
    gender?: string;
}

export interface RecoveryCaseOutput {
    title: string;
    category: string;
    period: string;
    emotion: string; // "Before -> After"
    summary: string;
    graphData: { name: string; score: number }[];
    tags: string[];
    productRecommendation: {
        name: string;
        price: string;
        reason: string;
    };
}
