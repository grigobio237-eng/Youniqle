import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import SurveyResponse from '@/models/SurveyResponse';
import PreConsultation from '@/models/PreConsultation';
import PostCareSurvey from '@/models/PostCareSurvey';
import { calculateUnifiedScore } from '@/lib/score-engine';
import { generateUnifiedInsight } from '@/lib/ai/ai-insight';

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

    // 2. Fetch latest Survey/Analysis Report
    const latestSurvey = await SurveyResponse.findOne({ userId: user._id })
      .sort({ createdAt: -1 })
      .select('status answers createdAt')
      .lean();

    // 3. Fetch latest Specialized AI Reports
    const latestPreConsultation = await PreConsultation.findOne({ userId: user._id })
      .sort({ createdAt: -1 })
      .select('medicalCategory aiGuide createdAt')
      .lean();

    const latestPostCare = await PostCareSurvey.findOne({ userId: user._id })
      .sort({ createdAt: -1 })
      .select('procedureType lastStatus aiRoadmap createdAt')
      .lean();

    // 4. Conditional Caching for Unified Actionable Insight
    const scans = user.scanTimeline?.slice(-5) || [];
    
    const latestScanDate = scans.length > 0 ? Math.max(...scans.map((s: any) => new Date(s.createdAt).getTime())) : 0;
    const latestSurveyDate = latestSurvey ? new Date((latestSurvey as any).createdAt).getTime() : 0;
    const latestPreDate = latestPreConsultation ? new Date((latestPreConsultation as any).createdAt).getTime() : 0;
    const latestPostDate = latestPostCare ? new Date((latestPostCare as any).createdAt).getTime() : 0;

    const latestUpdateTimestamp = Math.max(latestScanDate, latestSurveyDate, latestPreDate, latestPostDate);
    const cache = user.cachedUnifiedInsight;
    let unifiedInsight = cache;

    console.log(`[Cache Diagnostic] User: ${user.email} | Latest Data Time: ${latestUpdateTimestamp ? new Date(latestUpdateTimestamp).toISOString() : 'No Data'} | Cache Time: ${cache?.updatedAt ? new Date(cache.updatedAt).toISOString() : 'Empty Cache'}`);

    if (!cache || !cache.updatedAt || new Date(cache.updatedAt).getTime() < latestUpdateTimestamp) {
      console.log(`[Cache Miss] Regenerating unified insight for ${user.email}`);
      const freshInsight = await generateUnifiedInsight({
        scans,
        survey: latestSurvey,
        preConsultation: latestPreConsultation,
        postCare: latestPostCare
      });
      
      // Cache back onto User document via direct update to bypass legacy validation errors
      const cachedData = {
        title: freshInsight.title,
        description: freshInsight.description,
        suggestion: freshInsight.suggestion,
        habits: freshInsight.habits,
        updatedAt: new Date()
      };

      await User.updateOne(
        { _id: user._id },
        { $set: { cachedUnifiedInsight: cachedData } }
      );
      
      unifiedInsight = cachedData;
    } else {
      console.log(`[Cache Hit] Using stored unified insight for ${user.email}`);
    }

    return NextResponse.json({
      success: true,
      score: scoreData,
      insights: {
        posture: unifiedInsight, 
        meal: null
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
