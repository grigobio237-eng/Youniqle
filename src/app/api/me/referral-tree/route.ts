import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email })
      .select('name email referralCode referredBy')
      .lean();

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (!user.referralCode) {
      return NextResponse.json({ level1: [], level2: [] });
    }

    // 1. 하위 1단계 조회
    const level1Users = await User.find({ referredBy: user.referralCode })
      .select('name email referralCode createdAt grade')
      .lean();

    const l1Codes = level1Users.map(u => u.referralCode);

    // 2. 하위 2단계 조회
    const level2Users = await User.find({ referredBy: { $in: l1Codes } })
      .select('name email referralCode referredBy createdAt grade')
      .lean();

    // 3. 포인트 기여도 집계
    const rewardTx = await PointTransaction.find({
      userId: user._id,
      description: { $regex: '추천보상', $options: 'i' },
      type: 'earned'
    }).lean();

    const getContribution = (name: string) => {
      return rewardTx
        .filter(tx => tx.description.includes(`(${name})`))
        .reduce((sum, tx) => sum + tx.amount, 0);
    };

    // 마스킹 유틸리티
    const maskName = (name: string) => {
      if (name.length <= 1) return name;
      if (name.length === 2) return name[0] + '*';
      return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
    };

    const maskEmail = (email: string) => {
      const [id, domain] = email.split('@');
      if (id.length <= 3) return '***@' + domain;
      return id.slice(0, 3) + '***@' + domain;
    };

    const l1Processed = level1Users.map(u => ({
      id: u._id,
      name: maskName(u.name),
      email: maskEmail(u.email),
      referralCode: u.referralCode,
      createdAt: u.createdAt,
      grade: u.grade,
      contribution: getContribution(u.name),
      level: 1
    }));

    const l2Processed = level2Users.map(u => ({
      id: u._id,
      name: maskName(u.name),
      email: maskEmail(u.email),
      referralCode: u.referralCode,
      referredBy: u.referredBy,
      createdAt: u.createdAt,
      grade: u.grade,
      contribution: getContribution(u.name),
      level: 2
    }));

    return NextResponse.json({
      level1: l1Processed,
      level2: l2Processed
    });

  } catch (error) {
    console.error('[Me Referral Tree Error]:', error);
    return NextResponse.json({ error: '데이터를 가져오는 데 실패했습니다.' }, { status: 500 });
  }
}
