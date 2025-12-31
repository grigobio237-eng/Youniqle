import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import AiAdvice from '@/models/AiAdvice';
import User from '@/models/User';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();

        // Find user by email to get valid MongoDB ObjectId
        const user = await User.findOne({ email: session.user?.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const date = new Date().toISOString().split('T')[0];
        const advice = await AiAdvice.findOne({ userId: user._id, date });

        return NextResponse.json({ advice });
    } catch (error) {
        console.error('AI Advice GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { scores, todayScore } = body;

        await connectDB();

        // Find user by email to get valid MongoDB ObjectId
        const user = await User.findOne({ email: session.user?.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        const userId = user._id;

        const date = new Date().toISOString().split('T')[0];

        // Check if exists
        let advice = await AiAdvice.findOne({ userId, date });
        if (advice) {
            return NextResponse.json({ advice });
        }

        // Generate with Gemini
        console.log('🤖 Gemini 행동 조언 생성 시작...', { todayScore });
        const result = await GeminiAIEngine.generateActionAdvice({ scores, todayScore });

        if (!result || !result.adviceItems) {
            throw new Error('AI가 조언을 생성하지 못했습니다.');
        }

        // Save to DB
        advice = await AiAdvice.create({
            userId,
            date,
            totalScore: todayScore,
            aiComment: result.aiComment || '오늘도 당신의 회복을 응원합니다.',
            adviceItems: result.adviceItems.slice(0, 3).map((item: any, idx: number) => ({
                id: item.id || `advice-${idx + 1}`,
                category: item.category || 'PHYSICAL',
                content: item.content || '잠시 휴식을 취해보세요.',
                isCompleted: false
            }))
        });

        console.log('✅ AI 행동 조언 DB 저장 완료');
        return NextResponse.json({ advice });
    } catch (error: any) {
        console.error('AI Advice POST Error:', error);

        // Handle race condition (Duplicate Key Error E11000)
        if (error.code === 11000) {
            console.log('🔄 중복 생성 감지 - 데이터 다시 조회 중...');
            try {
                const session = await getServerSession(authOptions);
                const user = await User.findOne({ email: session?.user?.email });
                const date = new Date().toISOString().split('T')[0];
                const advice = await AiAdvice.findOne({ userId: user?._id, date });
                if (advice) return NextResponse.json({ advice });
            } catch (innerError) {
                console.error('Retry error:', innerError);
            }
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { adviceId, itemId, isCompleted } = body;

        await connectDB();

        // Find user by email to get valid MongoDB ObjectId
        const user = await User.findOne({ email: session.user?.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const advice = await AiAdvice.findOne({ _id: adviceId, userId: user._id });

        if (!advice) return NextResponse.json({ error: 'Advice not found' }, { status: 404 });

        const itemIndex = advice.adviceItems.findIndex((item: any) => item.id === itemId || item._id.toString() === itemId);
        if (itemIndex > -1) {
            advice.adviceItems[itemIndex].isCompleted = isCompleted;
            advice.adviceItems[itemIndex].completedAt = isCompleted ? new Date() : undefined;
            await advice.save();
        }

        return NextResponse.json({ advice });
    } catch (error) {
        console.error('AI Advice PATCH Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
