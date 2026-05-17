import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import FootballTeam from '@/models/FootballTeam';
import FootballTeamMember, { DEFAULT_PERMISSIONS } from '@/models/FootballTeamMember';
import User from '@/models/User';

// POST: 팀 합류 처리
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await req.json();
    const { teamCode, role = 'player', position, playerNumber, weight, height, birthDate, pastDataConsent } = body;

    if (!teamCode) {
      return NextResponse.json({ error: '팀 코드는 필수입니다' }, { status: 400 });
    }

    // 팀 조회
    const team = await FootballTeam.findOne({ teamCode: teamCode.toUpperCase(), isActive: true });
    if (!team) {
      return NextResponse.json(
        { error: '유효하지 않은 팀 코드이거나, 아직 승인되지 않은 팀입니다' },
        { status: 404 }
      );
    }

    // 이미 해당 팀에 active 멤버인지 확인
    const existingMember = await FootballTeamMember.findOne({
      teamId: team._id,
      userId: session.user.id,
      status: 'active',
    });

    if (existingMember) {
      return NextResponse.json(
        { error: '이미 이 팀에 소속되어 있습니다', membership: existingMember },
        { status: 409 }
      );
    }

    // 팀 인원 제한 확인
    const currentCount = await FootballTeamMember.countDocuments({
      teamId: team._id,
      status: 'active',
    });

    if (currentCount >= team.maxMembers) {
      return NextResponse.json(
        { error: '팀 최대 인원에 도달했습니다' },
        { status: 400 }
      );
    }

    // 멤버 역할 유효성 검증 (head_coach는 팀 생성 시에만 부여)
    const allowedRoles = ['player', 'guardian'];
    const finalRole = allowedRoles.includes(role) ? role : 'player';

    // 멤버 생성
    const member = await FootballTeamMember.create({
      teamId: team._id,
      userId: session.user.id,
      role: finalRole,
      position: finalRole === 'player' ? position : undefined,
      playerNumber: finalRole === 'player' ? playerNumber : undefined,
      weight: finalRole === 'player' ? weight : undefined,
      height: finalRole === 'player' ? height : undefined,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      status: 'active',
      pastDataConsent: pastDataConsent || false,
      permissions: DEFAULT_PERMISSIONS[finalRole],
      joinedAt: new Date(),
    });

    // User의 footballRole 및 activeTeamId 업데이트
    const footballRole = finalRole === 'guardian' ? 'guardian' : 'player';
    await User.findByIdAndUpdate(session.user.id, {
      footballRole,
      activeTeamId: team._id,
    });

    return NextResponse.json({
      success: true,
      message: `${team.teamName} 팀에 합류했습니다!`,
      membership: {
        _id: member._id,
        role: member.role,
        position: member.position,
        teamName: team.teamName,
        teamCode: team.teamCode,
      },
    });
  } catch (error: any) {
    // 중복 키 에러 처리
    if (error.code === 11000) {
      return NextResponse.json(
        { error: '이미 이 팀에 등록되어 있습니다' },
        { status: 409 }
      );
    }
    console.error('[Football Team Join]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: 팀 코드로 팀 정보 미리보기 (합류 전 확인용)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const teamCode = searchParams.get('teamCode');

    if (!teamCode) {
      return NextResponse.json({ error: '팀 코드가 필요합니다' }, { status: 400 });
    }

    const team = await FootballTeam.findOne({
      teamCode: teamCode.toUpperCase(),
      isActive: true,
    })
      .populate('createdBy', 'name avatar')
      .select('teamName teamCode category ageGroup region logoUrl createdBy');

    if (!team) {
      return NextResponse.json(
        { error: '유효하지 않은 팀 코드이거나, 아직 승인되지 않은 팀입니다' },
        { status: 404 }
      );
    }

    const memberCount = await FootballTeamMember.countDocuments({
      teamId: team._id,
      status: 'active',
      role: 'player',
    });

    return NextResponse.json({
      team: {
        ...team.toObject(),
        memberCount,
      },
    });
  } catch (error: any) {
    console.error('[Football Team Join GET]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
