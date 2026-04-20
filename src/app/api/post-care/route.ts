import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import PostCareSurvey from '@/models/PostCareSurvey';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await req.json();
    
    // 1. 시술 후 경과 일수 계산 (기본값 제공 가능)
    const procedureDate = new Date(data.procedureInfo.date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - procedureDate.getTime());
    const daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const surveyData = {
      ...data,
      user: (session.user as any).id,
      procedureInfo: {
        ...data.procedureInfo,
        daysSince
      }
    };

    // 2. AI 로드맵 생성
    const aiRoadmap = await GeminiAIEngine.generatePostCareRoadmap(surveyData);

    // 3. DB 저장
    const newSurvey = new PostCareSurvey({
      ...surveyData,
      aiRoadmap
    });

    await newSurvey.save();

    return NextResponse.json({ 
      success: true, 
      reportId: newSurvey._id 
    });

  } catch (error) {
    console.error('Failed to save post-care survey:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // 일반 유저인 경우 본인의 데이터만 조회
    const surveys = await PostCareSurvey.find({ user: (session.user as any).id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ surveys });

  } catch (error) {
    console.error('Failed to fetch post-care surveys:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
