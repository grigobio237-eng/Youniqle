
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Diagnosis from '@/models/Diagnosis';
import { ALL_QUESTIONS } from '@/lib/data/diagnosis-questions';
import { FULL_DIAGNOSIS_QUESTIONS } from '@/lib/data/full-diagnosis-questions';
import { SimcheungDiagnosisEngine } from '@/lib/logic/simcheung-diagnosis';
import { IPIP60_QUESTIONS } from '@/lib/data/ipip60-questions';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // For development/testing without real auth, use the test user
        const TEST_USER_EMAIL = 'sin93101190@gmail.com';
        const userEmail = session?.user?.email || TEST_USER_EMAIL;

        // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { type, result } = body;

        if (!type || !result) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 진단 타입별 권한 체크
        const { AccessControl, FEATURE_COSTS } = await import('@/lib/logic/access-control');
        
        if (!AccessControl.canUseDiagnosisType(user, type)) {
            return NextResponse.json({ 
                error: '현재 멤버십 등급에서는 사용할 수 없는 진단 타입입니다.',
                code: 'TIER_RESTRICTED'
            }, { status: 403 });
        }

        // RESET 유저의 24문항(free) 1회 체험 체크
        if (type === 'free' && AccessControl.getUserGroup(user) === 'RESET') {
            const freeCount = user.diagnosisResults?.filter((r: any) => r.type === 'free').length || 0;
            if (freeCount >= 1) {
                return NextResponse.json({ 
                    error: '무료 체험 횟수를 초과했습니다. 리본 등급으로 업그레이드 후 무제한으로 이용하세요.',
                    code: 'TRIAL_EXCEEDED'
                }, { status: 403 });
            }
        }

        // 2. 사용량 체크 및 포인트 소진 (60초 진단 전용)
        await AccessControl.checkAndResetDailyStats(user);

        if (type === 'daily' || type === 'DAILY') {
            const canUse = AccessControl.canUseFeature(user, 'diagnosis');
            const { usePoints } = body;
            const cost = FEATURE_COSTS.diagnosis;

            if (!canUse) {
                if (usePoints && user.points >= cost) {
                    user.points -= cost;
                    console.log(`[Diagnosis Save] User ${user._id} used ${cost} points for extra diagnosis.`);
                } else {
                    return NextResponse.json({ 
                        error: '일일 무료 사용량을 초과했습니다.',
                        code: 'LIMIT_EXCEEDED',
                        pointsRequired: cost,
                        currentPoints: user.points
                    }, { status: 403 });
                }
            } else {
                if (!user.dailyStats) {
                    user.dailyStats = { scannerCount: 0, diagnosisCount: 0, webtoonCount: 0, lastResetDate: new Date() };
                }
                user.dailyStats.diagnosisCount += 1;
            }
        }

        let scores = {};
        let totalScore = 0;
        let metadata = {};

        if (type === 'free') {
            // FreeDiagnosisResult structure
            scores = result.convertedScores; // 0-100 scores
            totalScore = result.totalScore;
            metadata = {
                rawScores: result.rawScores,
                lowestCategory: result.lowestCategory
            };
        } else if (type === 'daily' || type === 'DAILY') {
            // 60-second Landing Diagnosis
            scores = result.convertedScores;
            totalScore = result.totalScore;
            metadata = {
                source: '60s-diagnosis',
                originalRawScore: body.rawScore
            };
        } else if (type === 'paid' || type === 'deep' || type === 'DEEP' || type === 'personality') {
            // Deep Diagnosis
            scores = result.tScores.domains;
            totalScore = Math.round(Object.values(result.tScores.domains as Record<string, number>).reduce((a, b) => a + b, 0) / 5);
            metadata = {
                tScores: result.tScores,
                validity: result.validity,
                interpretations: result.interpretations || []
            };
        }

        const diagnosisEntry = {
            type,
            scores,
            totalScore,
            metadata,
            createdAt: new Date()
        };

        user.diagnosisResults.push(diagnosisEntry);
        await user.save({ validateBeforeSave: false });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Diagnosis 모델에 추가 저장 (Recommendation API 연동용)
        if ((type === 'free' || type === 'paid' || type === 'daily' || type === 'DAILY') && body.answers) {
            try {
                let categoryScores = {
                    physical: 0,
                    mental: 0,
                    lifestyle: 0,
                    sleep: 0
                };
                let resultTitle = '';
                let resultDescription = '';
                let totalScoreVal = 0;

                if (type === 'free') {
                    // Use Shared Mapping Logic
                    categoryScores = SimcheungDiagnosisEngine.mapFreeToStandard(result);
                    totalScoreVal = result.totalScore;
                    resultTitle = `간편 진단 결과: ${result.totalScore}점`;
                    resultDescription = `${result.lowestCategory} 영역의 케어가 시급합니다.`;
                } else if (type === 'paid' || type === 'DEEP' || type === 'deep' || type === 'personality') {
                    // Use Shared Mapping Logic
                    categoryScores = SimcheungDiagnosisEngine.mapPaidToStandard({ domains: result.tScores.domains });
                    const t = result.tScores.domains;
                    totalScoreVal = Math.round((t.N + t.E + t.O + t.A + t.C) / 5); // Average T-score
                    resultTitle = (type.toUpperCase() === 'DEEP' || type === 'personality') ? `심층 심리 진단 (IPIP-60)` : `심층 심리 진단 (Premium)`;
                    resultDescription = `5대 요인 및 30개 국면 정밀 분석 완료`;
                } else if (type === 'daily' || type === 'DAILY') {
                    totalScoreVal = result.totalScore;
                    resultTitle = `60초 진단 결과: ${totalScoreVal}점`;
                    resultDescription = `오늘의 상태를 기반으로 한 맞춤 케어 분석 완료`;
                    categoryScores = result.convertedScores || {
                        physical: totalScoreVal,
                        mental: totalScoreVal,
                        lifestyle: totalScoreVal,
                        sleep: totalScoreVal
                    };
                }

                await Diagnosis.create({
                    userId: user._id,
                    type: type.toUpperCase(),
                    totalScore: totalScoreVal,
                    categoryScores,
                    answers: Object.entries(body.answers).map(([qId, score]) => {
                        let qData: any = null;

                        if (type === 'paid') {
                            // Paid: ID is number (1-60)
                            qData = FULL_DIAGNOSIS_QUESTIONS.find(q => q.id === Number(qId));
                        } else if (type.toUpperCase() === 'DEEP') {
                            qData = IPIP60_QUESTIONS.find(q => q.id === Number(qId));
                        } else if (type === 'daily' || type === 'DAILY') {
                            // Search in ALL_QUESTIONS or handle as generic
                            qData = ALL_QUESTIONS.find(q => q.id === qId);
                        } else {
                            // Free: ID is string (M1-1 etc)
                            qData = ALL_QUESTIONS.find(q => q.id === qId);
                        }

                        qData = qData || { text: 'Unknown', category: 'Unknown' };

                        return {
                            questionId: qId,
                            category: qData.domain || qData.category || 'Unknown',
                            question: qData.text || '',
                            answer: String(score),
                            score: Number(score)
                        };
                    }),
                    resultTitle,
                    resultDescription,
                    recommendations: [],
                    metadata: type === 'paid' ? { tScores: result.tScores, validity: result.validity } : undefined,
                    createdAt: new Date()
                });
                console.log('✅ Diagnosis document created successfully');
            } catch (diagError) {
                console.error('Failed to create Diagnosis document:', diagError);
                // 메인 로직(User 저장)은 성공했으므로 에러를 던지지 않음
            }
        }

        return NextResponse.json({ success: true, diagnosisResults: user.diagnosisResults });

    } catch (error) {
        console.error('Diagnosis Save API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
