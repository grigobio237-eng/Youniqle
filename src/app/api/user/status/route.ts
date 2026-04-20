import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import SurveyResponse from '@/models/SurveyResponse';
import PreConsultation from '@/models/PreConsultation';
import PostCareSurvey from '@/models/PostCareSurvey';
import { calculateUnifiedScore } from '@/lib/score-engine';
import { POSTURE_RECOMMENDATIONS, MEAL_INSIGHTS } from '@/constants/scan-recommendations';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 1. Calculate Unified Score
    const scoreData = calculateUnifiedScore(user);

    // 2. Generate Actionable Insights based on latest scans
    const latestPostureScan = user.scanTimeline
      ?.filter((s: any) => s.type === 'POSTURE')
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    const latestMealScan = user.scanTimeline
      ?.filter((s: any) => s.type === 'MEAL')
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    let postureInsight = null;
    if (latestPostureScan) {
      // Logic to determine recommendation key
      // Simplified: if score < 60, high turtleneck
      const recKey = latestPostureScan.score < 70 ? 'TURTLE_NECK_HIGH' : 'NORMAL';
      postureInsight = {
        ...POSTURE_RECOMMENDATIONS[recKey],
        metrics: latestPostureScan.metrics,
        scanDate: latestPostureScan.createdAt
      };
    }

    const mealInsight = latestMealScan ? {
      title: '영양 균형 분석',
      description: MEAL_INSIGHTS[latestMealScan.metrics?.recommendationKey as keyof typeof MEAL_INSIGHTS]?.advice || '분석 중...',
      suggestion: MEAL_INSIGHTS[latestMealScan.metrics?.recommendationKey as keyof typeof MEAL_INSIGHTS]?.suggestion || '단백질 섭취를 늘려보세요.',
      nutrients: latestMealScan.metrics?.nutrition,
      habits: [
        '식전 물 한 잔 마시기',
        '식이섬유(채소) 먼저 섭취하기',
        '천천히 20분 이상 식사하기'
      ]
    } : null;

    // 3. Fetch latest Survey/Analysis Report
    const latestSurvey = await SurveyResponse.findOne({ userId: user._id })
      .sort({ createdAt: -1 })
      .select('status answers createdAt')
      .lean();

    // 4. Fetch latest Specialized AI Reports
    const latestPreConsultation = await PreConsultation.findOne({ userId: user._id })
      .sort({ createdAt: -1 })
      .select('medicalCategory aiGuide createdAt')
      .lean();

    const latestPostCare = await PostCareSurvey.findOne({ userId: user._id })
      .sort({ createdAt: -1 })
      .select('procedureType lastStatus aiRoadmap createdAt')
      .lean();

    return NextResponse.json({
      success: true,
      score: scoreData,
      insights: {
        posture: postureInsight,
        meal: mealInsight
      },
      surveyReport: latestSurvey || null,
      activeMedicalGuide: latestPreConsultation || null,
      activeRecoveryPlan: latestPostCare || null,
      recentActivity: user.scanTimeline?.slice(-5).reverse() || [],
      user: {
        name: user.name,
        grade: user.grade,
        passInfo: user.passInfo
      }
    });

  } catch (error: any) {
    console.error('User status fetch error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
