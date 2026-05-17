import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import PostCareSurvey from '@/models/PostCareSurvey';
import User from '@/models/User';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 [GET /api/event/post-care/latest] Starting request...');
        await connectDB();
        console.log('✅ [GET /api/event/post-care/latest] DB connected');
        
        const session = await getServerSession(authOptions);
        console.log('👤 [GET /api/event/post-care/latest] Session:', !!session);

        if (!session?.user) {
            console.log('⚠️ [GET /api/event/post-care/latest] Unauthorized');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('📧 [GET /api/event/post-care/latest] Finding user:', session.user.email);
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            console.log('⚠️ [GET /api/event/post-care/latest] User not found');
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('📊 [GET /api/event/post-care/latest] Finding latest survey for user:', user._id);
        // Find latest post-care survey document
        const latestPostCare = await PostCareSurvey.findOne({ user: user._id })
            .sort({ createdAt: -1 })
            .lean();

        console.log('🎁 [GET /api/event/post-care/latest] Found:', !!latestPostCare);
        
        if (!latestPostCare) {
            return NextResponse.json(null);
        }

        return NextResponse.json(latestPostCare);

    } catch (error: any) {
        console.error('❌ [GET /api/event/post-care/latest] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
