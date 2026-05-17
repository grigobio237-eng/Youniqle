import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import FootballTeamMember from '@/models/FootballTeamMember';
import WellnessCheck from '@/models/WellnessCheck';
import User from '@/models/User';
import { getKSTDateString } from '@/lib/football/acwr';

// POST: 보호자-자녀 연결
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await req.json();
    const { action, childEmail, childId, teamId } = body;

    // 보호자 확인
    const guardianMember = await FootballTeamMember.findOne({
      userId: session.user.id,
      status: 'active',
      role: 'guardian',
    });

    if (!guardianMember && action !== 'link') {
      return NextResponse.json({ error: '보호자 권한이 필요합니다' }, { status: 403 });
    }

    if (action === 'link') {
      // 이메일로 자녀(선수) 검색
      if (!childEmail) {
        return NextResponse.json({ error: '자녀의 이메일을 입력해 주세요' }, { status: 400 });
      }

      const childUser = await User.findOne({ email: childEmail });
      if (!childUser) {
        return NextResponse.json({ error: '해당 이메일로 가입된 유저를 찾을 수 없습니다' }, { status: 404 });
      }

      // 자녀가 팀 소속 선수인지 확인
      const childMember = await FootballTeamMember.findOne({
        userId: childUser._id,
        status: 'active',
        role: 'player',
      });

      if (!childMember) {
        return NextResponse.json({ error: '해당 유저는 팀에 소속된 선수가 아닙니다' }, { status: 400 });
      }

      // 보호자의 멤버십에 자녀 연결
      if (guardianMember) {
        // 이미 보호자 멤버십이 있으면 자녀 추가
        if (!guardianMember.linkedPlayerId) {
          guardianMember.linkedPlayerId = childUser._id;
          await guardianMember.save();
        }
      } else {
        // 보호자 멤버십 자동 생성
        await FootballTeamMember.create({
          teamId: childMember.teamId,
          userId: session.user.id,
          role: 'guardian',
          status: 'active',
          linkedPlayerId: childUser._id,
          permissions: {
            viewPlayerData: true,
            viewTeamData: false,
            manageTeam: false,
            manageMembers: false,
            postAnnouncements: false,
          },
          joinedAt: new Date(),
        });

        // User footballRole 업데이트
        await User.findByIdAndUpdate(session.user.id, {
          footballRole: 'guardian',
          activeTeamId: childMember.teamId,
        });
      }

      return NextResponse.json({
        success: true,
        message: `${childUser.name}님과 보호자 연결이 완료되었습니다`,
        child: { id: childUser._id, name: childUser.name, email: childUser.email },
      });
    }

    return NextResponse.json({ error: '올바르지 않은 action입니다' }, { status: 400 });
  } catch (error: any) {
    console.error('[Guardian POST]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: 보호자의 자녀 데이터 조회
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 보호자 멤버십 확인
    const guardianMember = await FootballTeamMember.findOne({
      userId: session.user.id,
      status: 'active',
      role: 'guardian',
    }).populate('linkedPlayerId', 'name email avatar');

    if (!guardianMember || !guardianMember.linkedPlayerId) {
      return NextResponse.json({
        linked: false,
        message: '연결된 자녀가 없습니다. 자녀의 이메일로 연결해 주세요.',
      });
    }

    const child = guardianMember.linkedPlayerId as any;
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '14');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = getKSTDateString(startDate);

    // 자녀의 웰니스 체크 이력 (보호자에게는 점수만 공개, 부상 메모 제외)
    const checks = await WellnessCheck.find({
      userId: child._id,
      date: { $gte: startDateStr },
    }).sort({ date: -1 }).select('date wellnessScore sleep soreness fatigue stress mood sessionType source');

    // 자녀의 팀 멤버 정보
    const childMember = await FootballTeamMember.findOne({
      userId: child._id,
      teamId: guardianMember.teamId,
      status: 'active',
    });

    const todayStr = getKSTDateString();
    const todayCheck = checks.find((c) => c.date === todayStr);

    return NextResponse.json({
      linked: true,
      child: {
        id: child._id,
        name: child.name,
        avatar: child.avatar,
        position: childMember?.position,
        playerNumber: childMember?.playerNumber,
      },
      todayCheck: todayCheck || null,
      checks,
      stats: {
        totalDays: checks.length,
        avgWellness: checks.length > 0
          ? Math.round((checks.reduce((s, c) => s + c.wellnessScore, 0) / checks.length) * 10) / 10
          : 0,
        checkedToday: !!todayCheck,
      },
    });
  } catch (error: any) {
    console.error('[Guardian GET]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
