import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import RecoveryScore from '@/models/RecoveryScore';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 1. Calculate the current eligible cycle number
        // We count total recovery scores recorded
        const totalScoreEntries = await RecoveryScore.countDocuments({ userId: user._id });
        const currentCycle = Math.floor(totalScoreEntries / 7);

        if (currentCycle === 0) {
            return NextResponse.json({ error: 'No cycles completed yet' }, { status: 400 });
        }

        const body = await req.json();
        const cycleToClaim = body.cycleNumber || currentCycle;

        // 2. Check if already claimed
        const alreadyClaimed = user.issuedCertificates?.some((c: any) => c.cycleNumber === cycleToClaim);
        if (alreadyClaimed) {
            return NextResponse.json({ message: 'Certificate already claimed', cycleNumber: cycleToClaim });
        }

        // 3. Add to issuedCertificates
        await User.findByIdAndUpdate(user._id, {
            $push: {
                issuedCertificates: {
                    cycleNumber: cycleToClaim,
                    issuedAt: new Date(),
                    metadata: {
                        totalEntriesAtIssuance: totalScoreEntries
                    }
                }
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: `Certificate for cycle ${cycleToClaim} claimed successfully`,
            cycleNumber: cycleToClaim
        });

    } catch (error) {
        console.error('[API/Certificate/Claim] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
