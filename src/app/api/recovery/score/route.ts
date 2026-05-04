import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RecoveryScore from '@/models/RecoveryScore';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Find the user to get the correct ObjectId
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await req.json();
        const { rawScore, totalScore, metaphor, answers, date, userNote, snapData } = body;

        // 0. Handle Snap Image Upload (to Firebase as WebP)
        let processedSnapData = snapData;
        if (snapData && snapData.type === 'PHOTO' && snapData.content.startsWith('data:image')) {
            try {
                const { uploadImageToFirebase } = await import('@/lib/utils/firebase-storage');
                const timestamp = Date.now();
                const storagePath = `snaps/${user._id}/rhythm_${timestamp}.webp`;
                const imageUrl = await uploadImageToFirebase(snapData.content, storagePath);
                
                processedSnapData = {
                    ...snapData,
                    content: imageUrl
                };

                // Archive in LifeSnap for future reference
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
                // Fallback to base64 if upload fails (not ideal, but prevents crash)
            }
        }

        // Use provided date or today (normalized to start of day)
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        // 1. Save to RecoveryScore (Daily log)
        const score = await RecoveryScore.findOneAndUpdate(
            {
                userId: user._id,
                date: targetDate
            },
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

        // 2. Update User Profile (Medication History) - 영구 저장
        const medAnswer = answers?.find((a: any) => a.category === '약물' && a.detail);
        if (medAnswer?.detail) {
            // 기존 히스토리에 새로운 약물이 있다면 추가하거나 업데이트
            const currentMeds = user.medicationHistory || [];
            const newMeds = medAnswer.detail.split(',').map((m: string) => m.trim()).filter((m: string) => m !== "");
            
            // 중복을 제거한 새로운 리스트 생성
            const updatedMeds = Array.from(new Set([...currentMeds, ...newMeds]));
            
            await User.findByIdAndUpdate(user._id, {
                $set: { medicationHistory: updatedMeds }
            });
            console.log(`[API/Recovery] Updated medicationHistory for ${user.email}: ${updatedMeds.join(', ')}`);
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

        // Find the user to get the correct ObjectId
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get('date');

        const query: any = { userId: user._id };

        if (dateParam) {
            const targetDate = new Date(dateParam);
            targetDate.setHours(0, 0, 0, 0);
            query.date = targetDate;

            const score = await RecoveryScore.findOne(query);
            return NextResponse.json({ score });
        } else {
            // If no date, maybe return recent 7 days? or just all?
            // Let's return recent 30 days for charts
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            query.date = { $gte: thirtyDaysAgo };

            const scores = await RecoveryScore.find(query).sort({ date: 1 });
            return NextResponse.json({ scores });
        }

    } catch (error) {
        console.error('Error fetching recovery score:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
