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

    let mealInsight = null;
    if (latestMealScan) {
      // Simplified logic for meal insights based on metrics
      // Expected metrics: { carbs: number, protein: number, fat: number }
      const nutrientData = latestMealScan.metrics || { carbs: 50, protein: 15, fat: 35 };
      let recKey = 'BALANCED';
      if (nutrientData.protein < 20) recKey = 'LOW_PROTEIN';
      else if (nutrientData.carbs > 60) recKey = 'HIGH_CARB';
      
      mealInsight = {
        ...MEAL_INSIGHTS[recKey as keyof typeof MEAL_INSIGHTS],
        nutrients: nutrientData,
        scanDate: latestMealScan.createdAt
      };
    }

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
