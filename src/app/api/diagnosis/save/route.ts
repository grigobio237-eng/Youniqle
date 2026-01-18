
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Diagnosis from '@/models/Diagnosis';
import { ALL_QUESTIONS } from '@/lib/data/diagnosis-questions';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
            { email: session.user?.email },
            { $push: { diagnosisResults: diagnosisEntry } },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Diagnosis 모델에 추가 저장 (Recommendation API 연동용)
        if (type === 'free' && body.answers) {
            try {
                const s = result.convertedScores;
                const mentalScore = Math.round((s.Mindset + s.Emotional) / 2);

                await Diagnosis.create({
                    userId: user._id,
                    type: 'FREE',
                    totalScore: result.totalScore,
                    categoryScores: {
                        physical: s.Physical,
                        mental: mentalScore,
                        lifestyle: s.Social,
                        sleep: s.Physical // Fallback
                    },
                    answers: Object.entries(body.answers).map(([qId, score]) => {
                        const qData = ALL_QUESTIONS.find(q => q.id === qId);
                        return {
                            questionId: qId,
                            category: qData?.category || 'Unknown',
                            question: qData?.text || '',
                            answer: String(score),
                            score: Number(score)
                        };
                    }),
                    resultTitle: `간편 진단 결과: ${result.totalScore}점`,
                    resultDescription: `${result.lowestCategory} 영역의 케어가 시급합니다.`,
                    recommendations: [],
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
