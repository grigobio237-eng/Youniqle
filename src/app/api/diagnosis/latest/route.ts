import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const diagnosisResults = user.diagnosisResults || [];

        // Find latest 'daily' diagnosis
        const dailyResults = diagnosisResults
            .filter((r: any) => r.type === 'daily' || r.type === 'DAILY')
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Find latest 'deep', 'personality', 'paid', or 'free' diagnosis
        const personalityResults = diagnosisResults
            .filter((r: any) => r.type === 'deep' || r.type === 'DEEP' || r.type === 'paid' || r.type === 'personality' || r.type === 'free')
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
            daily: dailyResults.length > 0 ? dailyResults[0] : null,
            personality: personalityResults.length > 0 ? personalityResults[0] : null
        });

    } catch (error: any) {
        console.error('Latest Diagnosis Fetch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
