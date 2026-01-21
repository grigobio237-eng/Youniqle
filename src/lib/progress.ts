// Streak and Checklist Management
export interface DailyChecklist {
    diagnosis: boolean;      // 진단 완료
    aiAdvice: boolean;       // AI 조언 확인
    content: boolean;        // 콘텐츠 읽기
    utility: boolean;        // 유틸리티 사용
}

export interface UserProgress {
    lastCheckDate: string;
    currentStreak: number;
    longestStreak: number;
    totalPoints: number;
    todayChecklist: DailyChecklist;
}

const STORAGE_KEY = 'youniqle_user_progress';

export function getUserProgress(): UserProgress {
    if (typeof window === 'undefined') {
        return getDefaultProgress();
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return getDefaultProgress();
    }

    try {
        const progress: UserProgress = JSON.parse(stored);

        // Check if it's a new day
        const today = new Date().toISOString().split('T')[0];
        if (progress.lastCheckDate !== today) {
            // New day - check streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (progress.lastCheckDate === yesterdayStr) {
                // Consecutive day - increment streak
                progress.currentStreak += 1;
                if (progress.currentStreak > progress.longestStreak) {
                    progress.longestStreak = progress.currentStreak;
                }
            } else if (progress.lastCheckDate < yesterdayStr) {
                // Streak broken
                progress.currentStreak = 1;
            }

            // Reset daily checklist
            progress.todayChecklist = {
                diagnosis: false,
                aiAdvice: false,
                content: false,
                utility: false
            };

            progress.lastCheckDate = today;
            saveUserProgress(progress);
        }

        return progress;
    } catch (e) {
        console.error('Failed to parse user progress:', e);
        return getDefaultProgress();
    }
}

export function saveUserProgress(progress: UserProgress): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function updateChecklist(item: keyof DailyChecklist, points: number = 0): UserProgress {
    const progress = getUserProgress();
    progress.todayChecklist[item] = true;
    progress.totalPoints += points;
    saveUserProgress(progress);
    return progress;
}

export function getChecklistProgress(): { completed: number; total: number; percentage: number } {
    const checklist = getUserProgress().todayChecklist;
    const items = Object.values(checklist);
    const completed = items.filter(Boolean).length;
    const total = items.length;
    return {
        completed,
        total,
        percentage: Math.round((completed / total) * 100)
    };
}

export type TierType = 'RESET' | 'REBORN' | 'RESTART';

export function getMembershipLevel(points: number, streak: number): {
    level: TierType;
    nextLevel: TierType | 'MAX';
    pointsToNext: number;
    streakToNext: number;
    progress: number;
} {
    // RESTART: 1500 points + 60 days streak
    if (points >= 1500 && streak >= 60) {
        return {
            level: 'RESTART',
            nextLevel: 'MAX',
            pointsToNext: 0,
            streakToNext: 0,
            progress: 100
        };
    }

    // REBORN: 500 points + 30 days streak
    if (points >= 500 && streak >= 30) {
        const pointsProgress = Math.min((points - 500) / (1500 - 500) * 100, 100);
        const streakProgress = Math.min((streak - 30) / (60 - 30) * 100, 100);
        return {
            level: 'REBORN',
            nextLevel: 'RESTART',
            pointsToNext: Math.max(1500 - points, 0),
            streakToNext: Math.max(60 - streak, 0),
            progress: Math.round((pointsProgress + streakProgress) / 2)
        };
    }

    // RESET: Initial tier
    const pointsProgress = Math.min(points / 500 * 100, 100);
    const streakProgress = Math.min(streak / 30 * 100, 100);
    return {
        level: 'RESET',
        nextLevel: 'REBORN',
        pointsToNext: Math.max(500 - points, 0),
        streakToNext: Math.max(30 - streak, 0),
        progress: Math.round((pointsProgress + streakProgress) / 2)
    };
}

function getDefaultProgress(): UserProgress {
    const today = new Date().toISOString().split('T')[0];
    return {
        lastCheckDate: today,
        currentStreak: 1,
        longestStreak: 1,
        totalPoints: 0,
        todayChecklist: {
            diagnosis: false,
            aiAdvice: false,
            content: false,
            utility: false
        }
    };
}
