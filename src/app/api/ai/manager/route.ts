import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';
import connectDB from '@/lib/db';
import User from '@/models/User';
import AdminSettings from '@/models/AdminSettings';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const body = await request.json();
        const { message } = body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return NextResponse.json({ error: '메시지를 입력해주세요.' }, { status: 400 });
        }

        await connectDB();

        // Fetch current user data
        const user = await User.findOne({ email: session.user.email }).lean();
        if (!user) {
            return NextResponse.json({ error: '사용자 정보를 찾을 수 없습니다.' }, { status: 404 });
        }

        // Fetch site settings dynamically
        let siteSettings = null;
        try {
            const settings = await AdminSettings.findOne().lean() as any;
            if (settings) {
                siteSettings = {
                    freeShippingThreshold: settings.business?.freeShippingThreshold ?? 50000,
                    refundPeriod: settings.payment?.refundPeriod ?? 7,
                    commissionRate: settings.business?.commissionRate ?? 5,
                };
            }
        } catch (e) {
            console.warn('AdminSettings fetch failed, using defaults:', e);
        }

        // Generate response
        const result = await GeminiAIEngine.generateManagerResponse({
            message: message.trim(),
            userContext: {
                name: session.user.name || '고객',
                email: session.user.email,
                grade: (user as any).grade || 'cedar',
                points: (user as any).points || 0,
            },
            siteSettings: siteSettings || undefined,
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('AI Manager API Error:', error);
        return NextResponse.json(
            { error: 'AI 응답 생성 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
