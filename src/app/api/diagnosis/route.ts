import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Diagnosis from '@/models/Diagnosis';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        // Find user by email to get valid MongoDB ObjectId
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

        const diagnoses = await Diagnosis.find({ userId: user._id }).sort({ createdAt: -1 });

        return NextResponse.json({ diagnoses });
    } catch (error: any) {
        console.error('Diagnosis Fetch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
