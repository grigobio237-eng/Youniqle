import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FootballTeam from '@/models/FootballTeam';
import FootballTeamMember from '@/models/FootballTeamMember';
import FootballSubscription from '@/models/FootballSubscription';
import WellnessCheck from '@/models/WellnessCheck';
import { getKSTDateString } from '@/lib/football/acwr';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminToken(req);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();

    const todayStr = getKSTDateString();

    const [
      totalTeams,
      activeTeams,
      pendingTeams,
      totalPlayers,
      totalCoaches,
      totalGuardians,
      activeSubscriptions,
      todayChecks,
      todayAlertChecks,
    ] = await Promise.all([
      FootballTeam.countDocuments(),
      FootballTeam.countDocuments({ status: 'approved', isActive: true }),
      FootballTeam.countDocuments({ status: 'pending' }),
      FootballTeamMember.countDocuments({ status: 'active', role: 'player' }),
      FootballTeamMember.countDocuments({ status: 'active', role: { $in: ['head_coach', 'coach'] } }),
      FootballTeamMember.countDocuments({ status: 'active', role: 'guardian' }),
      FootballSubscription.countDocuments({ status: { $in: ['trial', 'active'] } }),
      WellnessCheck.countDocuments({ date: todayStr }),
      WellnessCheck.countDocuments({ date: todayStr, wellnessScore: { $lt: 3 } }),
    ]);

    // 오늘 평균 웰니스 계산
    const todayChecksData = await WellnessCheck.find({ date: todayStr }).select('wellnessScore');
    const todayAvgWellness = todayChecksData.length > 0
      ? Math.round((todayChecksData.reduce((s, c) => s + c.wellnessScore, 0) / todayChecksData.length) * 10) / 10
      : 0;

    return NextResponse.json({
      totalTeams,
      activeTeams,
      pendingTeams,
      totalPlayers,
      totalCoaches,
      totalGuardians,
      activeSubscriptions,
      todayChecks,
      todayAvgWellness,
      todayAlerts: todayAlertChecks,
    });
  } catch (error: any) {
    console.error('[Admin Football Stats]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
