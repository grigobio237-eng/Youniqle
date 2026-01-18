/**
 * 진단 기반 회복 프로토콜 추천 매핑 유틸리티
 * 60초 진단 결과(categoryScores)를 분석하여 개인화된 추천을 생성합니다.
 */

// 추천 아이템 타입
export interface RecommendationItem {
    id: string;
    type: 'product' | 'protocol' | 'content';
    title: string;
    description: string;
    link: string;
    icon?: string;
    tag?: string;
    priority: number;
    category: string;
    // 상품 전용 필드
    price?: string;
    productId?: string;
    imageUrl?: string;
    isExternal?: boolean;
}

// 진단 카테고리 점수
export interface CategoryScores {
    physical: number;
    mental: number;
    lifestyle: number;
    sleep: number;
}

// 점수 레벨 (각 카테고리 최대 40점 기준)
type ScoreLevel = 'critical' | 'low' | 'mid' | 'high';

const getScoreLevel = (score: number, maxScore: number = 40): ScoreLevel => {
    const percentage = (score / maxScore) * 100;
    if (percentage < 25) return 'critical';
    if (percentage < 50) return 'low';
    if (percentage < 75) return 'mid';
    return 'high';
};

// 카테고리별 프로토콜 매핑
const PROTOCOL_MAPPINGS: Record<string, Record<ScoreLevel, RecommendationItem[]>> = {
    physical: {
        critical: [
            {
                id: 'proto-stretch-intensive',
                type: 'protocol',
                title: '긴급 신체 리셋 스트레칭',
                description: '경직된 근육을 즉시 풀어주는 집중 스트레칭',
                link: '/utils?tool=stretch',
                icon: '🧘',
                tag: 'URGENT',
                priority: 100,
                category: 'physical'
            },
            {
                id: 'proto-breathing-calm',
                type: 'protocol',
                title: '자율신경 회복 호흡법',
                description: '4-7-8 호흡으로 신체 긴장 해소',
                link: '/utils/breathing',
                icon: '🌬️',
                tag: 'RECOVERY',
                priority: 95,
                category: 'physical'
            }
        ],
        low: [
            {
                id: 'proto-stretch-basic',
                type: 'protocol',
                title: '오피스 리셋 스트레칭',
                description: '5분 만에 완료하는 간단 스트레칭',
                link: '/utils?tool=stretch',
                icon: '🧘',
                tag: 'DAILY',
                priority: 80,
                category: 'physical'
            }
        ],
        mid: [
            {
                id: 'proto-stretch-maintain',
                type: 'protocol',
                title: '유연성 유지 루틴',
                description: '현재 상태를 유지하는 가벼운 스트레칭',
                link: '/utils?tool=stretch',
                icon: '🧘',
                priority: 60,
                category: 'physical'
            }
        ],
        high: []
    },
    mental: {
        critical: [
            {
                id: 'proto-ai-advice',
                type: 'protocol',
                title: 'AI 긴급 멘탈 케어',
                description: '지금 바로 AI 코치의 맞춤 조언 받기',
                link: '/ai-advice',
                icon: '🤖',
                tag: 'URGENT',
                priority: 100,
                category: 'mental'
            },
            {
                id: 'proto-breathing-478',
                type: 'protocol',
                title: '3분 마음 챙김 호흡',
                description: '불안과 스트레스를 즉시 완화',
                link: '/utils/breathing',
                icon: '🌬️',
                tag: 'CALM',
                priority: 95,
                category: 'mental'
            }
        ],
        low: [
            {
                id: 'proto-ai-navigator',
                type: 'protocol',
                title: 'AI 리커버리 리포트',
                description: '데이터 기반 정밀 분석과 행동 지침',
                link: '/ai-navigator',
                icon: '🤖',
                tag: 'ANALYSIS',
                priority: 85,
                category: 'mental'
            },
            {
                id: 'proto-breathing-stress',
                type: 'protocol',
                title: '스트레스 해소 호흡',
                description: '긴장된 마음을 풀어주는 호흡법',
                link: '/utils/breathing',
                icon: '🌬️',
                priority: 80,
                category: 'mental'
            }
        ],
        mid: [
            {
                id: 'proto-mindfulness',
                type: 'protocol',
                title: '일상 마음 챙김',
                description: '균형 잡힌 정서 유지를 위한 가이드',
                link: '/utils/breathing',
                icon: '🧘',
                priority: 60,
                category: 'mental'
            }
        ],
        high: []
    },
    sleep: {
        critical: [
            {
                id: 'proto-sleep-emergency',
                type: 'protocol',
                title: '수면 환경 긴급 체크',
                description: '수면 품질을 떨어뜨리는 요소 점검',
                link: '/utils?tool=sleep',
                icon: '🌙',
                tag: 'URGENT',
                priority: 100,
                category: 'sleep'
            },
            {
                id: 'proto-breathing-sleep',
                type: 'protocol',
                title: '숙면 유도 호흡법',
                description: '수면 전 10분 릴렉스 호흡',
                link: '/utils/breathing',
                icon: '🌬️',
                tag: 'SLEEP',
                priority: 95,
                category: 'sleep'
            }
        ],
        low: [
            {
                id: 'proto-sleep-routine',
                type: 'protocol',
                title: '수면 루틴 설계',
                description: '최적의 수면 패턴 만들기',
                link: '/utils?tool=sleep',
                icon: '🌙',
                tag: 'ROUTINE',
                priority: 80,
                category: 'sleep'
            }
        ],
        mid: [
            {
                id: 'proto-sleep-optimize',
                type: 'protocol',
                title: '수면 효율 최적화',
                description: '더 깊은 수면을 위한 팁',
                link: '/utils?tool=sleep',
                icon: '🌙',
                priority: 60,
                category: 'sleep'
            }
        ],
        high: []
    },
    lifestyle: {
        critical: [
            {
                id: 'proto-water-check',
                type: 'protocol',
                title: '수분 밸런스 긴급 체크',
                description: '탈수가 피로의 원인일 수 있습니다',
                link: '/utils?tool=water',
                icon: '💧',
                tag: 'URGENT',
                priority: 100,
                category: 'lifestyle'
            },
            {
                id: 'proto-digital-detox',
                type: 'protocol',
                title: '디지털 디톡스 시작',
                description: '스크린 타임을 줄이고 회복하세요',
                link: '/utils?tool=screen',
                icon: '📵',
                tag: 'DETOX',
                priority: 90,
                category: 'lifestyle'
            }
        ],
        low: [
            {
                id: 'proto-water-daily',
                type: 'protocol',
                title: '일일 수분 섭취 트래커',
                description: '오늘 충분히 물을 마셨나요?',
                link: '/utils?tool=water',
                icon: '💧',
                tag: 'DAILY',
                priority: 80,
                category: 'lifestyle'
            },
            {
                id: 'proto-bmi-check',
                type: 'protocol',
                title: 'BMI 건강 체크',
                description: '체중과 건강 상태 점검',
                link: '/utils/bmi',
                icon: '⚖️',
                priority: 75,
                category: 'lifestyle'
            }
        ],
        mid: [
            {
                id: 'proto-lifestyle-balance',
                type: 'protocol',
                title: '생활 밸런스 점검',
                description: '일과 휴식의 균형 찾기',
                link: '/utils',
                icon: '⚖️',
                priority: 60,
                category: 'lifestyle'
            }
        ],
        high: []
    }
};

// 카테고리별 콘텐츠 매핑
const CONTENT_MAPPINGS: Record<string, Record<ScoreLevel, RecommendationItem[]>> = {
    physical: {
        critical: [
            {
                id: 'content-cases-physical',
                type: 'content',
                title: '신체 회복 성공 사례',
                description: '비슷한 상태에서 회복한 실제 이야기',
                link: '/cases?category=physical',
                icon: '📖',
                tag: 'CASE',
                priority: 85,
                category: 'physical'
            }
        ],
        low: [
            {
                id: 'content-cases-physical-low',
                type: 'content',
                title: '피로 극복 사례 분석',
                description: '만성 피로를 이겨낸 회원들의 비결',
                link: '/cases?category=fatigue',
                icon: '📖',
                priority: 70,
                category: 'physical'
            }
        ],
        mid: [],
        high: []
    },
    mental: {
        critical: [
            {
                id: 'content-cases-mental',
                type: 'content',
                title: '번아웃 극복 실제 사례',
                description: '정신적 한계를 넘어선 회복 스토리',
                link: '/cases?category=burnout',
                icon: '📖',
                tag: 'STORY',
                priority: 85,
                category: 'mental'
            }
        ],
        low: [
            {
                id: 'content-stress-management',
                type: 'content',
                title: '스트레스 관리 가이드',
                description: '일상 속 스트레스 해소법',
                link: '/cases?category=stress',
                icon: '📖',
                priority: 70,
                category: 'mental'
            }
        ],
        mid: [],
        high: []
    },
    sleep: {
        critical: [
            {
                id: 'content-cases-sleep',
                type: 'content',
                title: '불면증 극복 사례',
                description: '수면 장애를 이겨낸 실제 경험담',
                link: '/cases?category=sleep',
                icon: '📖',
                tag: 'CASE',
                priority: 85,
                category: 'sleep'
            }
        ],
        low: [
            {
                id: 'content-sleep-tips',
                type: 'content',
                title: '숙면을 위한 과학적 팁',
                description: '연구로 검증된 수면 개선법',
                link: '/cases?category=sleep',
                icon: '📖',
                priority: 70,
                category: 'sleep'
            }
        ],
        mid: [],
        high: []
    },
    lifestyle: {
        critical: [
            {
                id: 'content-lifestyle-reset',
                type: 'content',
                title: '생활 패턴 리셋 사례',
                description: '라이프스타일을 바꾼 회복 여정',
                link: '/cases?category=lifestyle',
                icon: '📖',
                tag: 'CASE',
                priority: 85,
                category: 'lifestyle'
            }
        ],
        low: [],
        mid: [],
        high: []
    }
};

// 카테고리별 상품 키워드 매핑 (DB 검색용)
export const PRODUCT_KEYWORDS: Record<string, Record<ScoreLevel, string[]>> = {
    physical: {
        critical: ['스트레칭', '마사지', '근육', '통증', '자세'],
        low: ['운동', '피트니스', '건강'],
        mid: ['유지', '관리'],
        high: []
    },
    mental: {
        critical: ['명상', '스트레스', '불안', '안정', '힐링'],
        low: ['집중', '마음', '정서'],
        mid: ['밸런스'],
        high: []
    },
    sleep: {
        critical: ['수면', '불면', '숙면', '베개', '매트리스', '아로마'],
        low: ['휴식', '릴렉스'],
        mid: ['숙면'],
        high: []
    },
    lifestyle: {
        critical: ['디톡스', '생활', '습관', '건강'],
        low: ['라이프', '웰빙'],
        mid: ['밸런스'],
        high: []
    }
};

/**
 * 진단 결과를 기반으로 추천 아이템 생성
 */
export function generateRecommendations(
    categoryScores: CategoryScores,
    options: {
        includeProducts?: boolean;
        includeProtocols?: boolean;
        includeContent?: boolean;
        limit?: number;
    } = {}
): RecommendationItem[] {
    const {
        includeProducts = true,
        includeProtocols = true,
        includeContent = true,
        limit = 6
    } = options;

    const recommendations: RecommendationItem[] = [];

    // 카테고리별 점수 레벨 분석
    const categoryLevels: Record<string, ScoreLevel> = {
        physical: getScoreLevel(categoryScores.physical),
        mental: getScoreLevel(categoryScores.mental),
        lifestyle: getScoreLevel(categoryScores.lifestyle),
        sleep: getScoreLevel(categoryScores.sleep)
    };

    // 가장 낮은 점수의 카테고리 우선 정렬
    const sortedCategories = Object.entries(categoryScores)
        .sort(([, a], [, b]) => a - b)
        .map(([category]) => category);

    // 각 카테고리별 추천 수집
    for (const category of sortedCategories) {
        const level = categoryLevels[category];

        // 프로토콜 추천
        if (includeProtocols && PROTOCOL_MAPPINGS[category]?.[level]) {
            recommendations.push(...PROTOCOL_MAPPINGS[category][level]);
        }

        // 콘텐츠 추천
        if (includeContent && CONTENT_MAPPINGS[category]?.[level]) {
            recommendations.push(...CONTENT_MAPPINGS[category][level]);
        }
    }

    // 우선순위로 정렬 후 제한
    const sortedRecommendations = recommendations
        .sort((a, b) => b.priority - a.priority)
        .slice(0, limit);

    return sortedRecommendations;
}

/**
 * 가장 집중해야 할 카테고리 반환
 */
export function getWeakestCategory(categoryScores: CategoryScores): {
    category: string;
    score: number;
    level: ScoreLevel;
} {
    const entries = Object.entries(categoryScores) as [string, number][];
    const [weakest] = entries.sort(([, a], [, b]) => a - b);

    return {
        category: weakest[0],
        score: weakest[1],
        level: getScoreLevel(weakest[1])
    };
}

/**
 * 카테고리별 상태 요약
 */
export function getCategoryStatusSummary(categoryScores: CategoryScores): Record<string, {
    score: number;
    level: ScoreLevel;
    message: string;
}> {
    const messages: Record<ScoreLevel, Record<string, string>> = {
        critical: {
            physical: '신체 피로가 심각한 수준입니다. 즉각적인 휴식이 필요합니다.',
            mental: '정신적 스트레스가 한계에 도달했습니다.',
            sleep: '수면 부족이 건강을 위협하고 있습니다.',
            lifestyle: '생활 패턴의 전면적인 재정립이 필요합니다.'
        },
        low: {
            physical: '신체 피로가 누적되고 있습니다.',
            mental: '스트레스 관리가 필요한 상태입니다.',
            sleep: '수면 패턴 개선이 필요합니다.',
            lifestyle: '생활 습관을 점검해 보세요.'
        },
        mid: {
            physical: '신체 상태는 양호하지만 관리가 필요합니다.',
            mental: '정서적으로 안정적인 편입니다.',
            sleep: '수면 품질은 괜찮은 편입니다.',
            lifestyle: '생활 패턴이 비교적 규칙적입니다.'
        },
        high: {
            physical: '신체 상태가 매우 좋습니다!',
            mental: '멘탈이 매우 건강합니다!',
            sleep: '수면 품질이 우수합니다!',
            lifestyle: '생활 습관이 이상적입니다!'
        }
    };

    const result: Record<string, { score: number; level: ScoreLevel; message: string }> = {};

    for (const [category, score] of Object.entries(categoryScores)) {
        const level = getScoreLevel(score);
        result[category] = {
            score,
            level,
            message: messages[level][category] || ''
        };
    }

    return result;
}

export default {
    generateRecommendations,
    getWeakestCategory,
    getCategoryStatusSummary,
    PRODUCT_KEYWORDS
};
