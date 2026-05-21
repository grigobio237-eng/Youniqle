import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Diagnosis from '@/models/Diagnosis';
import RecoveryScore from '@/models/RecoveryScore';
import RecoveryInsight from '@/models/RecoveryInsight';
import LifeSnap from '@/models/LifeSnap';
import AiRoutineLog from '@/models/AiRoutineLog';

// Standard deviation helper
function standardDeviation(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
        }

        const userId = user._id;
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        const fourteenDaysAgo = new Date(now);
        fourteenDaysAgo.setDate(now.getDate() - 14);

        // ═══════════════════════════════════════════════════
        // 1. RecoveryScore — 최신 + 7일 + 14일 히스토리
        // ═══════════════════════════════════════════════════
        const [recentScores, prevWeekScores] = await Promise.all([
            RecoveryScore.find({ userId, createdAt: { $gte: sevenDaysAgo } })
                .sort({ createdAt: -1 }).lean(),
            RecoveryScore.find({ userId, createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } })
                .sort({ createdAt: -1 }).lean()
        ]);

        const latestScore = recentScores.length > 0 ? recentScores[0] : null;

        // ═══════════════════════════════════════════════════
        // 2. Diagnosis — 최신 정밀 문진
        // ═══════════════════════════════════════════════════
        const latestDiagnosis = await Diagnosis.findOne({ userId })
            .sort({ createdAt: -1 }).lean() as any;

        // 이전 Diagnosis (변동 비교용)
        const prevDiagnosis = await Diagnosis.findOne({
            userId,
            _id: { $ne: latestDiagnosis?._id }
        }).sort({ createdAt: -1 }).lean() as any;

        // ═══════════════════════════════════════════════════
        // 3. AI Insight
        // ═══════════════════════════════════════════════════
        const aiInsight = await RecoveryInsight.findOne({
            userId,
            type: 'daily'
        }).sort({ createdAt: -1 }).lean() as any;

        let parsedInsight = null;
        if (aiInsight?.content) {
            try {
                parsedInsight = typeof aiInsight.content === 'string'
                    ? JSON.parse(aiInsight.content)
                    : aiInsight.content;
            } catch {
                parsedInsight = { summary: aiInsight.content };
            }
        }

        // ═══════════════════════════════════════════════════
        // 4. Scanner/LifeSnap — 최신 3건
        // ═══════════════════════════════════════════════════
        const latestScans = await LifeSnap.find({ userId })
            .sort({ createdAt: -1 }).limit(3).lean();

        // Also check user's scanTimeline for legacy data
        const userScanTimeline = (user.scanTimeline || [])
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);

        const scannerData = latestScans.length > 0 ? latestScans : userScanTimeline;

        // ═══════════════════════════════════════════════════
        // 5. Personality / Inner Data — user.diagnosisResults
        // ═══════════════════════════════════════════════════
        const personalityResults = (user.diagnosisResults || [])
            .filter((r: any) => ['PAID', 'DEEP', 'PERSONALITY', 'FREE'].includes(r.type?.toUpperCase()))
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const latestPersonality = personalityResults.length > 0 ? personalityResults[0] : null;

        // ═══════════════════════════════════════════════════
        // 6. AiRoutineLog — 루틴 이행률 (7일)
        // ═══════════════════════════════════════════════════
        const routineLogs = await AiRoutineLog.find({
            userId,
            createdAt: { $gte: sevenDaysAgo }
        }).lean() as any[];

        let routineCompletionRate: number | null = null;
        let totalRoutineTasks = 0;
        let completedRoutineTasks = 0;

        if (routineLogs.length > 0) {
            routineLogs.forEach((log: any) => {
                (log.routines || []).forEach((routine: any) => {
                    const taskCount = routine.tasks?.length || 0;
                    const completedCount = routine.completedTasks?.length || 0;
                    totalRoutineTasks += taskCount;
                    completedRoutineTasks += completedCount;
                });
            });
            routineCompletionRate = totalRoutineTasks > 0
                ? Math.round((completedRoutineTasks / totalRoutineTasks) * 100)
                : null;
        }

        // ═══════════════════════════════════════════════════
        // 7. 핵심 비율 산출
        // ═══════════════════════════════════════════════════

        // 7a. 회복 속도 (Recovery Velocity)
        const thisWeekAvg = recentScores.length > 0
            ? recentScores.reduce((sum: number, s: any) => sum + (s.totalScore || 0), 0) / recentScores.length
            : null;
        const prevWeekAvg = prevWeekScores.length > 0
            ? prevWeekScores.reduce((sum: number, s: any) => sum + (s.totalScore || 0), 0) / prevWeekScores.length
            : null;

        let recoveryVelocity: number | null = null;
        if (thisWeekAvg !== null && prevWeekAvg !== null && prevWeekAvg > 0) {
            recoveryVelocity = Math.round(((thisWeekAvg - prevWeekAvg) / prevWeekAvg) * 1000) / 10;
        }

        // 7b. 컨디션 안정성 (Stability) — 표준편차 역수를 5점 만점으로 환산
        let stabilityScore: number | null = null;
        if (recentScores.length >= 2) {
            const scores = recentScores.map((s: any) => s.totalScore || 0);
            const sd = standardDeviation(scores);
            // SD 0 = 5점, SD 20+ = 1점
            stabilityScore = Math.max(1, Math.min(5, Math.round((5 - (sd / 5)) * 10) / 10));
        }

        // 7c. 수면 효율 (Sleep Efficiency)
        let sleepEfficiency: number | null = null;
        if (latestDiagnosis?.categoryScores) {
            const cs = latestDiagnosis.categoryScores;
            const total = (cs.physical || 0) + (cs.mental || 0) + (cs.sleep || 0) + (cs.lifestyle || 0);
            if (total > 0) {
                sleepEfficiency = Math.round(((cs.sleep || 0) / total) * 1000) / 10;
            }
        }

        // 7d. 측정 참여율 (7일 중 측정한 날)
        const uniqueDays = new Set(recentScores.map((s: any) => {
            const d = new Date(s.createdAt);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }));
        const participationRate = Math.round((uniqueDays.size / 7) * 100);

        // ═══════════════════════════════════════════════════
        // 8. 변동 분석 — categoryScores diff
        // ═══════════════════════════════════════════════════
        let categoryDiffs: Record<string, number> | null = null;
        if (latestDiagnosis?.categoryScores && prevDiagnosis?.categoryScores) {
            const curr = latestDiagnosis.categoryScores;
            const prev = prevDiagnosis.categoryScores;
            categoryDiffs = {
                physical: (curr.physical || 0) - (prev.physical || 0),
                mental: (curr.mental || 0) - (prev.mental || 0),
                sleep: (curr.sleep || 0) - (prev.sleep || 0),
                lifestyle: (curr.lifestyle || 0) - (prev.lifestyle || 0),
            };
        }

        // totalScore diff (RecoveryScore 기반)
        let totalScoreDiff: number | null = null;
        if (thisWeekAvg !== null && prevWeekAvg !== null) {
            totalScoreDiff = Math.round((thisWeekAvg - prevWeekAvg) * 10) / 10;
        }

        // ═══════════════════════════════════════════════════
        // 9. 분석 기간 정보
        // ═══════════════════════════════════════════════════
        const allScores = await RecoveryScore.find({ userId }).sort({ createdAt: 1 }).lean();
        const allDiagnoses = await Diagnosis.find({ userId }).sort({ createdAt: 1 }).lean();

        const firstRecordDate = (() => {
            const dates = [
                ...allScores.map((s: any) => new Date(s.createdAt)),
                ...allDiagnoses.map((d: any) => new Date(d.createdAt))
            ];
            return dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
        })();

        // ═══════════════════════════════════════════════════
        // Response Assembly
        // ═══════════════════════════════════════════════════
        return NextResponse.json({
            // 표지 정보
            cover: {
                userName: user.name || '유저',
                analysisFrom: firstRecordDate?.toISOString() || null,
                analysisTo: now.toISOString(),
                totalRecoveryChecks: allScores.length,
                totalDiagnoses: allDiagnoses.length,
                totalScans: (latestScans.length || 0) + (userScanTimeline.length || 0),
                generatedAt: now.toISOString(),
            },

            // 회복 하이라이트
            highlights: {
                latestScore: latestScore ? {
                    totalScore: (latestScore as any).totalScore,
                    date: (latestScore as any).createdAt,
                    metaphor: (latestScore as any).metaphor,
                } : null,
                thisWeekAvg: thisWeekAvg !== null ? Math.round(thisWeekAvg) : null,
                prevWeekAvg: prevWeekAvg !== null ? Math.round(prevWeekAvg) : null,
                totalScoreDiff,
                statusBadge: parsedInsight?.statusBadge || null,
                headline: parsedInsight?.headline || null,
            },

            // 영역별 분석
            categoryAnalysis: {
                scores: latestDiagnosis?.categoryScores || null,
                diffs: categoryDiffs,
                radarData: parsedInsight?.radarData || null,
                categoryComments: parsedInsight?.detailedAnalysis || null,
                diagnosisDate: latestDiagnosis?.createdAt || null,
            },

            // 핵심 비율
            keyRatios: {
                recoveryVelocity,
                stabilityScore,
                routineCompletionRate,
                sleepEfficiency,
                participationRate,
                routineDetails: routineLogs.length > 0 ? {
                    totalTasks: totalRoutineTasks,
                    completedTasks: completedRoutineTasks,
                    daysWithRoutine: routineLogs.length,
                } : null,
            },

            // 변동 원인 데이터
            variance: {
                categoryDiffs,
                aiSummary: parsedInsight?.summary || null,
                detailedAnalysis: parsedInsight?.detailedAnalysis || null,
                weakestCategory: latestDiagnosis?.categoryScores
                    ? Object.entries(latestDiagnosis.categoryScores)
                        .sort(([, a]: any, [, b]: any) => a - b)[0]?.[0]
                    : null,
                strongestCategory: latestDiagnosis?.categoryScores
                    ? Object.entries(latestDiagnosis.categoryScores)
                        .sort(([, a]: any, [, b]: any) => b - a)[0]?.[0]
                    : null,
            },

            // 종합 평가 및 처방
            conclusion: {
                missions: parsedInsight?.missions || [],
                aiSolution: latestDiagnosis?.aiSolution || null,
                recommendations: latestDiagnosis?.recommendations || [],
                resultDescription: latestDiagnosis?.resultDescription || null,
            },

            // 부가 데이터
            scannerData: scannerData.slice(0, 3),
            personalityData: latestPersonality,

            // 7일 추세 차트 데이터
            trendData: recentScores.map((s: any) => ({
                date: new Date(s.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
                score: s.totalScore,
                metaphor: s.metaphor,
            })).reverse(),

            // 데이터 존재 여부 플래그 (빈 상태 처리용)
            dataAvailability: {
                hasRecoveryScores: allScores.length > 0,
                hasDiagnosis: allDiagnoses.length > 0,
                hasAiInsight: !!parsedInsight,
                hasScanner: scannerData.length > 0,
                hasPersonality: !!latestPersonality,
                hasRoutineLogs: routineLogs.length > 0,
                hasAiSolution: !!latestDiagnosis?.aiSolution,
            },
        });

    } catch (error: any) {
        console.error('Report Dashboard API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
