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
import { getKSTDate } from '@/lib/date';

// Global request lock for unified insight
const statusLock = (global as any)._statusLock || new Map<string, Promise<any>>();
(global as any)._statusLock = statusLock;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isMinimal = searchParams.get('minimal') === 'true';

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

    // 2. Fetch latest Survey/Analysis Report & Specialized AI Reports in parallel
    const [latestSurvey, latestPreConsultation, latestPostCare] = await Promise.all([
      SurveyResponse.findOne({ userId: user._id })
        .sort({ createdAt: -1 })
        .select('status answers createdAt')
        .lean(),
      PreConsultation.findOne({ userId: user._id })
        .sort({ createdAt: -1 })
        .select('medicalCategory aiGuide createdAt')
        .lean(),
      PostCareSurvey.findOne({ userId: user._id })
        .sort({ createdAt: -1 })
        .select('procedureType lastStatus aiRoadmap createdAt')
        .lean()
    ]);

    // 4. Conditional Caching for Unified Actionable Insight
    let unifiedInsight = user.cachedUnifiedInsight;
    
    if (!isMinimal) {
      const scans = user.scanTimeline?.slice(-5) || [];
      
      const latestScanDate = scans.length > 0 ? Math.max(...scans.map((s: any) => new Date(s.createdAt).getTime())) : 0;
      const latestSurveyDate = latestSurvey ? new Date((latestSurvey as any).createdAt).getTime() : 0;
      const latestPreDate = latestPreConsultation ? new Date((latestPreConsultation as any).createdAt).getTime() : 0;
      const latestPostDate = latestPostCare ? new Date((latestPostCare as any).createdAt).getTime() : 0;

      const latestUpdateTimestamp = Math.max(latestScanDate, latestSurveyDate, latestPreDate, latestPostDate);
      const cache = user.cachedUnifiedInsight;

      // Lock check to prevent concurrent AI insight generations
      const lockKey = user._id.toString();
      
      if (!cache || !cache.updatedAt || new Date(cache.updatedAt).getTime() < latestUpdateTimestamp) {
        if (statusLock.has(lockKey)) {
          unifiedInsight = await statusLock.get(lockKey);
        } else {
          const requestPromise = (async () => {
            const freshInsight = await generateUnifiedInsight({
              scans,
              survey: latestSurvey,
              preConsultation: latestPreConsultation,
              postCare: latestPostCare
            });
            
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
            return cachedData;
          })();

          statusLock.set(lockKey, requestPromise);
          try {
            unifiedInsight = await requestPromise;
          } finally {
            statusLock.delete(lockKey);
          }
        }
      }
    }

    // 5. Calculate Daily Checklist Status (Automated & KST-aware)
    const todayStr = getKSTDate();
    
    const checklistStatus = {
      diagnosis: user.dailyStats?.diagnosisCount > 0,
      aiAdvice: user.cachedUnifiedInsight?.updatedAt && getKSTDate(new Date(user.cachedUnifiedInsight.updatedAt)) === todayStr,
      routine: user.dailyStats?.completedRoutines?.length >= 3,
      content: user.dailyStats?.webtoonCount > 0,
      utility: user.dailyStats?.scannerCount > 0
    };

    // 6. Calculate Asset Statistics
    let assetStats = null;
    let enhancedCertificates = [];
    let dailyLogCount = 0;

    const RecoveryScore = (await import('@/models/RecoveryScore')).default;
    const [diagnosisCount, dailyCount] = await Promise.all([
      user.diagnosisResults?.filter((d: any) => d.type === 'deep' || d.type === 'free').length || 0,
      RecoveryScore.countDocuments({ userId: user._id })
    ]);
    dailyLogCount = dailyCount;
    const scannerCount = user.scanTimeline?.filter((s: any) => ['MEAL', 'SPACE', 'POSTURE'].includes(s.type)).length || 0;
    const toolkitCount = user.scanTimeline?.filter((s: any) => ['STATE', 'POST_OP'].includes(s.type)).length || 0;
    
    const [consultationCount, surveyCount] = await Promise.all([
      Promise.all([
        PreConsultation.countDocuments({ userId: user._id }),
        PostCareSurvey.countDocuments({ userId: user._id })
      ]).then(([c1, c2]) => c1 + c2),
      SurveyResponse.countDocuments({ userId: user._id })
    ]);

    assetStats = {
      precisionDiagnosis: diagnosisCount,
      dailyRhythmLog: dailyLogCount,
      scannerAnalysis: scannerCount,
      toolkitUsage: toolkitCount,
      consultations: consultationCount,
      reports: surveyCount,
      totalInsights: (diagnosisCount * 10) + (dailyLogCount * 2) + (scannerCount * 5) + (toolkitCount * 5) + (consultationCount * 20)
    };

    if (!isMinimal) {
      // 7. Enhance Certificate Data
      const allLogs = await RecoveryScore.find({ userId: user._id }).sort({ date: 1 }).select('date').limit(100).lean();
      enhancedCertificates = user.issuedCertificates?.map((cert: any) => {
        const startIndex = (cert.cycleNumber - 1) * 7;
        const endIndex = startIndex + 6;
        const startLog = allLogs[startIndex];
        const endLog = allLogs[Math.min(endIndex, allLogs.length - 1)];
        return {
          ...cert,
          startDate: startLog?.date,
          endDate: endLog?.date
        };
      }) || [];
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
      checklistStatus,
      assetStats,
      completedRoutines: user.dailyStats?.completedRoutines || [],
      user: {
        name: user.name,
        grade: user.grade,
        role: user.role,
        passInfo: user.passInfo
      },
      certificateStatus: {
        totalDailyLogs: dailyLogCount,
        eligibleCycleCount: Math.floor(dailyLogCount / 7),
        nextCycleToClaim: (() => {
          const eligibleCount = Math.floor(dailyLogCount / 7);
          const claimedNumbers = user.issuedCertificates?.map((c: any) => c.cycleNumber) || [];
          for (let i = 1; i <= eligibleCount; i++) {
            if (!claimedNumbers.includes(i)) return i;
          }
          return null;
        })(),
        issuedCertificates: enhancedCertificates
      }
    });

  } catch (error: any) {
    console.error('User status fetch error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
