
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Diagnosis from '@/models/Diagnosis';
import { ALL_QUESTIONS } from '@/lib/data/diagnosis-questions';
import { FULL_DIAGNOSIS_QUESTIONS } from '@/lib/data/full-diagnosis-questions';
import { SimcheungDiagnosisEngine } from '@/lib/logic/simcheung-diagnosis';

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
        } else {
            // Deep Diagnosis (Future)
            scores = result.tScores.domains;
            totalScore = 0; // Not a single score concept usually, maybe average?
            metadata = {
                tScores: result.tScores,
                validity: result.validity
            };
        }

        const diagnosisEntry = {
            type,
            scores,
            totalScore,
            metadata,
            createdAt: new Date()
        };

        const user = await User.findOneAndUpdate(
            { email: userEmail },
            { $push: { diagnosisResults: diagnosisEntry } },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Diagnosis 모델에 추가 저장 (Recommendation API 연동용)
        if ((type === 'free' || type === 'paid') && body.answers) {
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
                } else if (type === 'paid') {
                    // Use Shared Mapping Logic
                    categoryScores = SimcheungDiagnosisEngine.mapPaidToStandard({ domains: result.tScores.domains });
                    const t = result.tScores.domains;
                    totalScoreVal = Math.round((t.N + t.E + t.O + t.A + t.C) / 5); // Average T-score
                    resultTitle = `심층 심리 진단 (Premium)`;
                    resultDescription = `5대 요인 및 30개 국면 정밀 분석 완료`;
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
