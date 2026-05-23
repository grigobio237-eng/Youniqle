import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import RecoveryScore from '@/models/RecoveryScore';
import Diagnosis from '@/models/Diagnosis';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    await dbConnect();
    
    // 1. 기존 User 테이블에 임베딩된 과거 타임라인 가져오기
    const user = await User.findById((session.user as any).id)
      .select('scanTimeline')
      .lean();

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 2. 새로운 RecoveryScore 전용 컬렉션에서 최근 점수 타임라인 가져오기
    const recoveryScores = await RecoveryScore.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(30)
      .lean();
      
    // 포맷팅 (프론트엔드가 요구하는 실제 백분율 점수)
    const formattedScores = recoveryScores.map((rs: any) => ({
       score: rs.totalScore,
       rawScore: rs.rawScore,
       createdAt: rs.date || rs.createdAt,
       type: 'RECOVERY_SCORE',
       metaphor: rs.metaphor,
       _id: rs._id
    }));

    // 2b. Diagnosis 컬렉션에서 최근 DAILY 진단 점수 타임라인 가져오기 (누락 복구!)
    const dailyDiagnoses = await Diagnosis.find({ 
      userId: user._id,
      type: 'DAILY'
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const formattedDiagnoses = dailyDiagnoses.map((d: any) => ({
      score: d.totalScore || d.score,
      createdAt: d.createdAt,
      type: 'DIAGNOSIS_DAILY',
      metaphor: d.resultDescription || '오늘의 리듬 진단',
      _id: d._id
    }));

    // 3. 모든 데이터 소스를 병합하고 최신순(내림차순) 정렬
    const combinedTimeline = [
      ...(user.scanTimeline || []), 
      ...formattedScores,
      ...formattedDiagnoses
    ].sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ timeline: combinedTimeline });

  } catch (error: any) {
    console.error('[User Timeline API Error]:', error);
    return NextResponse.json({ error: '데이터를 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

