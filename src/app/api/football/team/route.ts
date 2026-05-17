import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import FootballTeam from '@/models/FootballTeam';
import FootballTeamMember, { DEFAULT_PERMISSIONS } from '@/models/FootballTeamMember';
import User from '@/models/User';
import crypto from 'crypto';

// 팀 코드 생성 유틸리티
function generateTeamCode(teamName: string): string {
  const prefix = teamName
    .replace(/[^a-zA-Z0-9가-힣]/g, '')
    .slice(0, 3)
    .toUpperCase();
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 4);
  return `FC${prefix}${suffix}`;
}

// GET: 내가 속한 팀 목록 조회
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const view = searchParams.get('view'); // 'my' | 'admin'

    // 관리자용: 모든 팀 조회 (승인 대기열 포함)
    if (view === 'admin') {
      const user = await User.findById(session.user.id);
      if (!user || !['admin', 'superadmin'].includes(user.role)) {
        return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
      }

      const teams = await FootballTeam.find()
        .populate('createdBy', 'name email avatar')
        .populate('approvedBy', 'name')
        .sort({ createdAt: -1 });

      // 각 팀의 멤버 수 집계
      const teamsWithCounts = await Promise.all(
        teams.map(async (team) => {
          const memberCount = await FootballTeamMember.countDocuments({
            teamId: team._id,
            status: 'active',
          });
          const playerCount = await FootballTeamMember.countDocuments({
            teamId: team._id,
            status: 'active',
            role: 'player',
          });
          return {
            ...team.toObject(),
            memberCount,
            playerCount,
          };
        })
      );

      return NextResponse.json({ teams: teamsWithCounts });
    }

    // 일반 유저: 내가 속한 팀 목록
    const memberships = await FootballTeamMember.find({
      userId: session.user.id,
      status: 'active',
    }).populate({
      path: 'teamId',
      match: { isActive: true },
      populate: { path: 'createdBy', select: 'name' },
    });

    const teams = memberships
      .filter((m) => m.teamId)
      .map((m) => ({
        membership: {
          _id: m._id,
          role: m.role,
          position: m.position,
          playerNumber: m.playerNumber,
          joinedAt: m.joinedAt,
          permissions: m.permissions,
        },
        team: m.teamId,
      }));

    return NextResponse.json({ teams });
  } catch (error: any) {
    console.error('[Football Team GET]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: 팀 등록 요청 (코치가 관리자에게 신청)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await req.json();
    const { teamName, category, ageGroup, region, description } = body;

    if (!teamName || !category) {
      return NextResponse.json(
        { error: '팀 이름과 카테고리는 필수입니다' },
        { status: 400 }
      );
    }

    // 팀 코드 생성 (중복 확인)
    let teamCode = generateTeamCode(teamName);
    let attempts = 0;
    while (await FootballTeam.findOne({ teamCode }) && attempts < 10) {
      teamCode = generateTeamCode(teamName);
      attempts++;
    }

    const inviteLink = `/football/join/${teamCode}`;

    const team = await FootballTeam.create({
      teamName,
      teamCode,
      category,
      ageGroup,
      region,
      description,
      inviteLink,
      isActive: false,
      status: 'pending',
      createdBy: session.user.id,
    });

    // 요청자를 head_coach로 자동 등록 (팀 승인 전이라도)
    await FootballTeamMember.create({
      teamId: team._id,
      userId: session.user.id,
      role: 'head_coach',
      status: 'active',
      permissions: DEFAULT_PERMISSIONS.head_coach,
      joinedAt: new Date(),
    });

    // User의 footballRole 업데이트
    await User.findByIdAndUpdate(session.user.id, {
      footballRole: 'coach',
      activeTeamId: team._id,
    });

    return NextResponse.json({
      success: true,
      team: {
        _id: team._id,
        teamName: team.teamName,
        teamCode: team.teamCode,
        inviteLink: team.inviteLink,
        status: team.status,
      },
      message: '팀 등록이 요청되었습니다. 관리자 승인 후 활성화됩니다.',
    });
  } catch (error: any) {
    console.error('[Football Team POST]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: 팀 승인/거절/수정 (관리자용)
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const user = await User.findById(session.user.id);
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const body = await req.json();
    const { teamId, action, rejectedReason } = body;

    if (!teamId || !action) {
      return NextResponse.json({ error: 'teamId와 action은 필수입니다' }, { status: 400 });
    }

    const team = await FootballTeam.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: '팀을 찾을 수 없습니다' }, { status: 404 });
    }

    if (action === 'approve') {
      team.status = 'approved';
      team.approvedBy = user._id;
      team.approvedAt = new Date();
      await team.save();

      return NextResponse.json({
        success: true,
        message: `${team.teamName} 팀이 승인되었습니다.`,
        team,
      });
    }

    if (action === 'reject') {
      team.status = 'rejected';
      team.rejectedReason = rejectedReason || '승인 요건 미충족';
      await team.save();

      return NextResponse.json({
        success: true,
        message: `${team.teamName} 팀이 거절되었습니다.`,
      });
    }

    if (action === 'suspend') {
      team.status = 'suspended';
      await team.save();

      return NextResponse.json({
        success: true,
        message: `${team.teamName} 팀이 정지되었습니다.`,
      });
    }

    return NextResponse.json({ error: '올바르지 않은 action입니다' }, { status: 400 });
  } catch (error: any) {
    console.error('[Football Team PATCH]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
