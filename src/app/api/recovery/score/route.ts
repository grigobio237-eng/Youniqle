import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RecoveryScore from '@/models/RecoveryScore';
import User from '@/models/User';
import { getKSTDate } from '@/lib/date';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const body = await req.json();
        const { rawScore, totalScore, metaphor, answers, date, userNote, snapData } = body;

        let processedSnapData = snapData;
        if (snapData && snapData.type === 'PHOTO' && snapData.content.startsWith('data:image')) {
            try {
                const { uploadImageToFirebase } = await import('@/lib/utils/firebase-storage');
                const timestamp = Date.now();
                const storagePath = `snaps/${user._id}/rhythm_${timestamp}.webp`;
                const imageUrl = await uploadImageToFirebase(snapData.content, storagePath);
                
                processedSnapData = { ...snapData, content: imageUrl };

                const LifeSnap = (await import('@/models/LifeSnap')).default;
                await LifeSnap.create({
                    userId: user._id,
                    category: 'ROUTINE',
                    imageUrl: imageUrl,
                    summary: `리듬체크 스냅: ${metaphor}`,
                    score: totalScore
                });
            } catch (err) {
                console.error('[Recovery Score API] Image upload failed:', err);
            }
        }

        // Use getKSTDate for the date string identifier
        const targetDate = date ? (typeof date === 'string' && date.includes('-') ? date : getKSTDate(new Date(date))) : getKSTDate();

        // 1. Save to RecoveryScore (Daily log) using the YYYY-MM-DD string key
        const score = await RecoveryScore.findOneAndUpdate(
            { userId: user._id, date: targetDate },
            {
                userId: user._id,
                date: targetDate,
                rawScore,
                totalScore,
                metaphor,
                answers,
                userNote,
                snapData: processedSnapData
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // 2. Update User Profile (Medication History)
        const medAnswer = answers?.find((a: any) => a.category === '약물' && a.detail);
        if (medAnswer?.detail) {
            const currentMeds = user.medicationHistory || [];
            const newMeds = medAnswer.detail.split(',').map((m: string) => m.trim()).filter((m: string) => m !== "");
            const updatedMeds = Array.from(new Set([...currentMeds, ...newMeds]));
            await User.findByIdAndUpdate(user._id, { $set: { medicationHistory: updatedMeds } });
        }

        return NextResponse.json({ success: true, score });
    } catch (error) {
        console.error('Error saving recovery score:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const claimedCycles = user.issuedCertificates?.length || 0;
        const skipCount = claimedCycles * 7;
        const totalLogs = await RecoveryScore.countDocuments({ userId: user._id });

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get('date');

        if (dateParam) {
            const targetDate = dateParam.includes('-') ? dateParam : getKSTDate(new Date(dateParam));
            const score = await RecoveryScore.findOne({ userId: user._id, date: targetDate });
            return NextResponse.json({ score });
        } else {
            const scores = await RecoveryScore.find({ userId: user._id })
                .sort({ date: 1 })
                .skip(skipCount)
                .limit(7);

            return NextResponse.json({ 
                scores,
                debug: { claimedCycles, skipCount, totalLogs, currentCycleProgress: scores.length }
            });
        }
    } catch (error) {
        console.error('Error fetching recovery score:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
