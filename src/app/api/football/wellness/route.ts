import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import WellnessCheck from '@/models/WellnessCheck';
import FootballTeamMember from '@/models/FootballTeamMember';
import { calculateACWR, getKSTDateString } from '@/lib/football/acwr';

// POST: 웰니스 체크 기록
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await req.json();
    const { sleep, sleepDuration, soreness, fatigue, stress, mood, notes, rpe, sessionType, sessionDuration, injuryNote, source = 'quick' } = body;

    // 필수값 검증
    if (!sleep || !soreness || !fatigue || !stress || !mood) {
      return NextResponse.json({ error: '웰니스 항목 5개를 모두 입력해 주세요' }, { status: 400 });
    }

    // 오늘의 운동 정보(훈련 부하) 검증
    if (!sessionType) {
      return NextResponse.json({ error: '오늘의 활동(훈련/경기/휴식)을 선택해 주세요' }, { status: 400 });
    }

    if (sessionType !== 'rest') {
      if (rpe === undefined || rpe === null || rpe < 1 || rpe > 10) {
        return NextResponse.json({ error: '오늘의 운동 강도(RPE 1-10)를 선택해 주세요' }, { status: 400 });
      }
      if (sessionDuration === undefined || sessionDuration === null || sessionDuration <= 0) {
        return NextResponse.json({ error: '오늘의 운동 시간(분 단위)을 정확히 기입해 주세요' }, { status: 400 });
      }
    }

    // 유저의 활성 팀 확인
    const membership = await FootballTeamMember.findOne({
      userId: session.user.id,
      status: 'active',
      role: { $in: ['player', 'head_coach', 'coach'] },
    });

    if (!membership) {
      return NextResponse.json({ error: '활성 팀 소속이 없습니다' }, { status: 400 });
    }

    const today = getKSTDateString();
    const wellnessScore = Math.round(((sleep + soreness + fatigue + stress + mood) / 5) * 10) / 10;
    const sessionLoad = rpe && sessionDuration ? rpe * sessionDuration : undefined;

    // upsert: 같은 날짜에 재입력하면 업데이트
    const check = await WellnessCheck.findOneAndUpdate(
      { userId: session.user.id, date: today },
      {
        userId: session.user.id,
        teamId: membership.teamId,
        date: today,
        sleep, sleepDuration, soreness, fatigue, stress, mood,
        wellnessScore,
        notes,
        rpe, sessionType, sessionDuration, sessionLoad,
        injuryNote,
        source,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      check,
      message: `오늘의 컨디션이 기록되었습니다! (점수: ${wellnessScore}/5)`,
    });
  } catch (error: any) {
    console.error('[Wellness POST]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: 웰니스 기록 조회 (개인 또는 팀)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const view = searchParams.get('view');         // 'my' | 'team'
    const days = parseInt(searchParams.get('days') || '28');
    const teamId = searchParams.get('teamId');
    const playerId = searchParams.get('playerId'); // 코치가 특정 선수 조회

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = getKSTDateString(startDate);

    // 개인 기록 조회
    if (view !== 'team') {
      const targetUserId = playerId || session.user.id;

      const checks = await WellnessCheck.find({
        userId: targetUserId,
        date: { $gte: startDateStr },
      }).sort({ date: -1 });

      // ACWR 계산
      const loads = checks
        .filter((c) => c.sessionLoad)
        .map((c) => ({ date: c.date, sessionLoad: c.sessionLoad! }));

      const acwr = calculateACWR(loads);

      // 오늘 체크 여부
      const todayStr = getKSTDateString();
      const todayCheck = checks.find((c) => c.date === todayStr);

      return NextResponse.json({
        checks,
        acwr,
        todayCheck: todayCheck || null,
        stats: {
          totalDays: checks.length,
          avgWellness: checks.length > 0
            ? Math.round((checks.reduce((s, c) => s + c.wellnessScore, 0) / checks.length) * 10) / 10
            : 0,
          avgLoad: loads.length > 0
            ? Math.round(loads.reduce((s, l) => s + l.sessionLoad, 0) / loads.length)
            : 0,
        },
      });
    }

    // 팀 전체 기록 조회 (코치용)
    if (view === 'team' && teamId) {
      // 권한 확인
      const coachMembership = await FootballTeamMember.findOne({
        userId: session.user.id,
        teamId,
        status: 'active',
        role: { $in: ['head_coach', 'coach', 'trainer', 'medical'] },
      });

      if (!coachMembership) {
        return NextResponse.json({ error: '팀 데이터 열람 권한이 없습니다' }, { status: 403 });
      }

      // 팀의 모든 선수 가져오기
      const players = await FootballTeamMember.find({
        teamId,
        status: 'active',
        role: 'player',
      }).populate('userId', 'name avatar');

      const todayStr = getKSTDateString();

      // 각 선수의 오늘 웰니스 체크
      const todayChecks = await WellnessCheck.find({
        teamId,
        date: todayStr,
      });

      const squad = players.map((p) => {
        const check = todayChecks.find(
          (c) => c.userId.toString() === (p.userId as any)?._id?.toString()
        );
        return {
          memberId: p._id,
          userId: (p.userId as any)?._id,
          name: (p.userId as any)?.name || '알 수 없음',
          avatar: (p.userId as any)?.avatar,
          position: p.position,
          playerNumber: p.playerNumber,
           todayCheck: check
            ? {
                wellnessScore: check.wellnessScore,
                sleep: check.sleep,
                sleepDuration: check.sleepDuration,
                soreness: check.soreness,
                fatigue: check.fatigue,
                stress: check.stress,
                mood: check.mood,
                notes: check.notes,
                rpe: check.rpe,
                sessionLoad: check.sessionLoad,
              }
            : null,
          checkedIn: !!check,
        };
      });

      return NextResponse.json({
        squad,
        summary: {
          total: players.length,
          checkedIn: squad.filter((s) => s.checkedIn).length,
          avgWellness: todayChecks.length > 0
            ? Math.round(
                (todayChecks.reduce((s, c) => s + c.wellnessScore, 0) / todayChecks.length) * 10
              ) / 10
            : 0,
        },
      });
    }

    return NextResponse.json({ error: 'view 파라미터가 필요합니다' }, { status: 400 });
  } catch (error: any) {
    console.error('[Wellness GET]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
