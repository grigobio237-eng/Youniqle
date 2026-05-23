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
        // 2. Diagnosis — 최신 및 최근 7일 진단/데일리체크(16문항)
        // ═══════════════════════════════════════════════════
        const latestDiagnosis = await Diagnosis.findOne({ userId })
            .sort({ createdAt: -1 }).lean() as any;

        // 이전 Diagnosis (변동 비교용)
        const prevDiagnosis = await Diagnosis.findOne({
            userId,
            _id: { $ne: latestDiagnosis?._id }
        }).sort({ createdAt: -1 }).lean() as any;

        // 최근 7일 내의 모든 Diagnosis (데일리 체크 16문항 분석용)
        const recentDiagnoses = await Diagnosis.find({
            userId,
            createdAt: { $gte: sevenDaysAgo }
        }).sort({ createdAt: -1 }).lean() as any[];

        // ═══════════════════════════════════════════════════
        // 3. Smart Scanner/LifeSnap — 최신 3건 및 최근 7일 데이터
        // ═══════════════════════════════════════════════════
        const latestScans = await LifeSnap.find({ userId })
            .sort({ createdAt: -1 }).limit(3).lean();

        // 최근 7일 간의 모든 스마트 스캔 내역 (실시간 밸런스 10% 반영용)
        const recentScans = await LifeSnap.find({
            userId,
            createdAt: { $gte: sevenDaysAgo }
        }).sort({ createdAt: -1 }).lean() as any[];

        // Also check user's scanTimeline for legacy data
        const userScanTimeline = (user.scanTimeline || [])
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);

        const scannerData = latestScans.length > 0 ? latestScans : userScanTimeline;

        // ═══════════════════════════════════════════════════
        // 4. 하이브리드 다이내믹 4대 밸런스 정교 산출 알고리즘
        // ═══════════════════════════════════════════════════
        
        // A. 베이스 점수 확립 (정밀 문진 FREE/PRECISION 기준, 60% 비중)
        let baseScores = { physical: 60, mental: 60, sleep: 60, lifestyle: 60 };
        const absoluteLatestPrecisionDiagnosis = await Diagnosis.findOne({
            userId,
            $or: [
                { type: { $in: ['FREE', 'PRECISION', 'PRECISE'] } },
                { 'answers.20': { $exists: true } }
            ]
        }).sort({ createdAt: -1 }).lean() as any;

        if (absoluteLatestPrecisionDiagnosis?.categoryScores) {
            baseScores = {
                physical: absoluteLatestPrecisionDiagnosis.categoryScores.physical ?? 60,
                mental: absoluteLatestPrecisionDiagnosis.categoryScores.mental ?? 60,
                sleep: absoluteLatestPrecisionDiagnosis.categoryScores.sleep ?? 60,
                lifestyle: absoluteLatestPrecisionDiagnosis.categoryScores.lifestyle ?? 60,
            };
        } else if (latestDiagnosis?.categoryScores) {
            baseScores = {
                physical: latestDiagnosis.categoryScores.physical ?? 60,
                mental: latestDiagnosis.categoryScores.mental ?? 60,
                sleep: latestDiagnosis.categoryScores.sleep ?? 60,
                lifestyle: latestDiagnosis.categoryScores.lifestyle ?? 60,
            };
        }

        // B. 데일리 체크 (16문항) 집계 (20% 비중)
        const daily16s = recentDiagnoses.filter(d => d.answers?.length === 16);
        const daily16Sums = { physical: 0, mental: 0, sleep: 0, lifestyle: 0, count: 0 };
        daily16s.forEach(d => {
            if (d.categoryScores) {
                daily16Sums.physical += d.categoryScores.physical || 0;
                daily16Sums.mental += d.categoryScores.mental || 0;
                daily16Sums.sleep += d.categoryScores.sleep || 0;
                daily16Sums.lifestyle += d.categoryScores.lifestyle || 0;
                daily16Sums.count++;
            }
        });
        const daily16Avgs = daily16Sums.count > 0 ? {
            physical: daily16Sums.physical / daily16Sums.count,
            mental: daily16Sums.mental / daily16Sums.count,
            sleep: daily16Sums.sleep / daily16Sums.count,
            lifestyle: daily16Sums.lifestyle / daily16Sums.count,
        } : null;

        // C. 60초 리듬체크 답변 집계 및 100점 환산 보간 (10% 비중)
        const rhythmSums = { 
            physical: 0, mental: 0, sleep: 0, lifestyle: 0, 
            counts: { physical: 0, mental: 0, sleep: 0, lifestyle: 0 } 
        };

        const normalizeCategory = (rawCat: string): 'physical' | 'mental' | 'sleep' | 'lifestyle' | null => {
            const cat = (rawCat || '').trim().toLowerCase();
            if ([
                'physical', 'body', 'condition', 'physical discomfort', 'physical comfort',
                '신체', '몸', '자세', '신체 긴장', '피로', '피로도', 'energy', '에너지', '에너지 레벨', '에너지 수준'
            ].includes(cat)) {
                return 'physical';
            }
            if ([
                'mental', 'psychological', 'psychological stability', 'mind',
                '심리', '감정', '불안 관리', '마음가짐', '집중력', '뇌 피로도', '집중', '업무 몰입'
            ].includes(cat)) {
                return 'mental';
            }
            if ([
                'sleep', '수면', '수면 리듬'
            ].includes(cat)) {
                return 'sleep';
            }
            if ([
                'lifestyle', 'nutrition', 'behavior', 'environment', 'drug', 'medication', 'general',
                '영양', '행동', '환경', '약물', '내일 준비', '생산성', '일반', 'general'
            ].includes(cat)) {
                return 'lifestyle';
            }
            return null;
        };

        recentScores.forEach(s => {
            if (Array.isArray(s.answers)) {
                s.answers.forEach((ans: any) => {
                    const normalizedCat = normalizeCategory(ans.category);
                    const score100 = (ans.score || 0) * 20; // 5점 만점 답변을 100점 스케일로 승격
                    if (normalizedCat) {
                        rhythmSums[normalizedCat] += score100;
                        rhythmSums.counts[normalizedCat]++;
                    }
                });
            }
        });
        const rhythmAvgs = {
            physical: rhythmSums.counts.physical > 0 ? rhythmSums.physical / rhythmSums.counts.physical : null,
            mental: rhythmSums.counts.mental > 0 ? rhythmSums.mental / rhythmSums.counts.mental : null,
            sleep: rhythmSums.counts.sleep > 0 ? rhythmSums.sleep / rhythmSums.counts.sleep : null,
            lifestyle: rhythmSums.counts.lifestyle > 0 ? rhythmSums.lifestyle / rhythmSums.counts.lifestyle : null,
        };

        // D. 스마트 스캐너 (LifeSnap) 카테고리 매핑 집계 (10% 비중)
        const scannerSums = { 
            physical: 0, mental: 0, sleep: 0, lifestyle: 0, 
            counts: { physical: 0, mental: 0, sleep: 0, lifestyle: 0 } 
        };
        recentScans.forEach(snap => {
            const cat = snap.category;
            const score = snap.score ?? 50;
            
            if (['ACTIVITY', 'BODY', 'SKIN', 'MEDICAL_DOC'].includes(cat)) {
                scannerSums.physical += score;
                scannerSums.counts.physical++;
            } else if (cat === 'SLEEP') {
                scannerSums.sleep += score;
                scannerSums.counts.sleep++;
            } else if (['MEAL', 'HYDRATION', 'ROUTINE'].includes(cat)) {
                scannerSums.lifestyle += score;
                scannerSums.counts.lifestyle++;
            }
            
            // 모든 스냅 점수는 정신적/전체적 에너지 수준에도 간접 기여
            scannerSums.mental += score;
            scannerSums.counts.mental++;
        });

        const scannerAvgs = {
            physical: scannerSums.counts.physical > 0 ? scannerSums.physical / scannerSums.counts.physical : null,
            mental: scannerSums.counts.mental > 0 ? scannerSums.mental / scannerSums.counts.mental : null,
            sleep: scannerSums.counts.sleep > 0 ? scannerSums.sleep / scannerSums.counts.sleep : null,
            lifestyle: scannerSums.counts.lifestyle > 0 ? scannerSums.lifestyle / scannerSums.counts.lifestyle : null,
        };

        // E. 4대 영역별 최종 dynamicScores 산출 (가중치 정규화 보간)
        const categories = ['physical', 'mental', 'sleep', 'lifestyle'] as const;
        const dynamicScores = { physical: 60, mental: 60, sleep: 60, lifestyle: 60 };

        categories.forEach(cat => {
            const baseVal = baseScores[cat];
            const daily16Val = daily16Avgs ? daily16Avgs[cat] : null;
            const rhythmVal = rhythmAvgs[cat];
            const scannerVal = scannerAvgs[cat];

            // 가중치 기본 매핑: base(0.6), daily16(0.2), rhythm(0.1), scanner(0.1)
            const sources = [
                { val: baseVal, weight: 0.6 },
                { val: daily16Val, weight: 0.2 },
                { val: rhythmVal, weight: 0.1 },
                { val: scannerVal, weight: 0.1 }
            ];

            let activeWeightSum = 0;
            let activeScoreSum = 0;

            sources.forEach(src => {
                if (src.val !== null && src.val !== undefined) {
                    activeScoreSum += src.val * src.weight;
                    activeWeightSum += src.weight;
                }
            });

            dynamicScores[cat] = activeWeightSum > 0
                ? Math.round(activeScoreSum / activeWeightSum)
                : Math.round(baseVal);
        });

        // ═══════════════════════════════════════════════════
        // 5. AI Insight
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
        // 6. Personality / Inner Data — user.diagnosisResults
        // ═══════════════════════════════════════════════════
        const personalityResults = (user.diagnosisResults || [])
            .filter((r: any) => ['PAID', 'DEEP', 'PERSONALITY', 'FREE'].includes(r.type?.toUpperCase()))
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const latestPersonality = personalityResults.length > 0 ? personalityResults[0] : null;

        // ═══════════════════════════════════════════════════
        // 7. AiRoutineLog — 루틴 이행률 (7일)
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
        // 8. 핵심 비율 산출
        // ═══════════════════════════════════════════════════

        // 8a. 회복 속도 (Recovery Velocity)
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

        // 8b. 컨디션 안정성 (Stability) — 표준편차 역수를 5점 만점으로 환산
        let stabilityScore: number | null = null;
        if (recentScores.length >= 2) {
            const scores = recentScores.map((s: any) => s.totalScore || 0);
            const sd = standardDeviation(scores);
            stabilityScore = Math.max(1, Math.min(5, Math.round((5 - (sd / 5)) * 10) / 10));
        }

        // 8c. 수면 효율 (Sleep Efficiency) - dynamicScores 기반으로 실시간 반영
        let sleepEfficiency: number | null = null;
        const totalDynamic = dynamicScores.physical + dynamicScores.mental + dynamicScores.sleep + dynamicScores.lifestyle;
        if (totalDynamic > 0) {
            sleepEfficiency = Math.round((dynamicScores.sleep / totalDynamic) * 1000) / 10;
        }

        // 8d. 측정 참여율 (7일 중 측정한 날)
        const uniqueDays = new Set(recentScores.map((s: any) => {
            const d = new Date(s.createdAt);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }));
        const participationRate = Math.round((uniqueDays.size / 7) * 100);

        // ═══════════════════════════════════════════════════
        // 9. 변동 분석 — dynamicScores vs prevDiagnosis 비교
        // ═══════════════════════════════════════════════════
        let categoryDiffs: Record<string, number> | null = null;
        if (prevDiagnosis?.categoryScores) {
            const prev = prevDiagnosis.categoryScores;
            categoryDiffs = {
                physical: dynamicScores.physical - (prev.physical || 0),
                mental: dynamicScores.mental - (prev.mental || 0),
                sleep: dynamicScores.sleep - (prev.sleep || 0),
                lifestyle: dynamicScores.lifestyle - (prev.lifestyle || 0),
            };
        }

        // totalScore diff (RecoveryScore 기반)
        let totalScoreDiff: number | null = null;
        if (thisWeekAvg !== null && prevWeekAvg !== null) {
            totalScoreDiff = Math.round((thisWeekAvg - prevWeekAvg) * 10) / 10;
        }

        // ═══════════════════════════════════════════════════
        // 10. 분석 기간 정보
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

            // 영역별 분석 - 동적 보정된 dynamicScores 바인딩
            categoryAnalysis: {
                scores: dynamicScores,
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
                weakestCategory: Object.entries(dynamicScores)
                    .sort(([, a]: any, [, b]: any) => a - b)[0]?.[0] || null,
                strongestCategory: Object.entries(dynamicScores)
                    .sort(([, a]: any, [, b]: any) => b - a)[0]?.[0] || null,
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
