import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Diagnosis from '@/models/Diagnosis';
import RecoveryScore from '@/models/RecoveryScore';
import User from '@/models/User';

export async function POST(request: NextRequest) {
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

        const data = await request.json();

        const newDiagnosis = new Diagnosis({
            userId: user._id,
            ...data
        });

        await newDiagnosis.save();

        return NextResponse.json({
            success: true,
            id: newDiagnosis._id,
            message: '정밀 진단 결과가 성공적으로 저장되었습니다.'
        });
    } catch (error: any) {
        console.error('Diagnosis Save Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
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

        // Fetch both diagnoses and recovery scores
        const [diagnoses, recoveryScores] = await Promise.all([
            Diagnosis.find({ userId: user._id }).lean(),
            RecoveryScore.find({ userId: user._id }).lean()
        ]);

        // Map recovery scores to match diagnosis format for timeline compatibility
        const mappedRecoveryScores = recoveryScores.map((score: any) => ({
            ...score,
            type: 'RECOVERY_RHYTHM',
            resultTitle: '60초 리듬체크',
            answers: score.answers || []
        }));

        // Merge and sort by createdAt descending
        const allRecords = [...diagnoses, ...mappedRecoveryScores].sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({ diagnoses: allRecords });
    } catch (error: any) {
        console.error('Diagnosis Fetch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
