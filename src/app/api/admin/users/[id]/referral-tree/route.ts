import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';
import { verifyAdminToken } from '@/lib/auth';
import { isValidObjectId } from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // 관리자 권한 검증
    const auth = await verifyAdminToken(request);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    if (!isValidObjectId(userId)) {
      return NextResponse.json({ error: '유효하지 않은 사용자 ID' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(userId).select('name email referralCode referredBy image avatar').lean();
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 1. 상위 추천인(Level 0) 정보
    let referrer = null;
    if (user.referredBy) {
      referrer = await User.findOne({ referralCode: user.referredBy })
        .select('name email referralCode image avatar')
        .lean();
    }

    // 2. 하위 1단계(Level 1) 조회
    const level1Users = await User.find({ referredBy: user.referralCode })
      .select('name email referralCode createdAt image avatar grade')
      .lean();

    const l1Codes = level1Users.map(u => u.referralCode);

    // 3. 하위 2단계(Level 2) 조회
    const level2Users = await User.find({ referredBy: { $in: l1Codes } })
      .select('name email referralCode referredBy createdAt image avatar grade')
      .lean();

    // 4. 포인트 기여도 집계
    // 적립 내역 중 "추천보상"이 포함된 내역을 가져옵니다.
    const rewardTx = await PointTransaction.find({
      userId: user._id,
      description: { $regex: '추천보상', $options: 'i' },
      type: 'earned'
    }).lean();

    // 포인트 매핑 가공 (이름 기반 매핑이라 한계가 있을 수 있으나 현재 description 구조상 최선)
    const getContribution = (name: string) => {
      return rewardTx
        .filter(tx => tx.description.includes(`(${name})`))
        .reduce((sum, tx) => sum + tx.amount, 0);
    };

    const l1Processed = level1Users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      referralCode: u.referralCode,
      createdAt: u.createdAt,
      avatar: u.avatar || u.image,
      grade: u.grade,
      contribution: getContribution(u.name),
      level: 1
    }));

    const l2Processed = level2Users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      referralCode: u.referralCode,
      referredBy: u.referredBy,
      createdAt: u.createdAt,
      avatar: u.avatar || u.image,
      grade: u.grade,
      contribution: getContribution(u.name),
      level: 2
    }));

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        avatar: user.avatar || user.image
      },
      referrer,
      level1: l1Processed,
      level2: l2Processed
    });

  } catch (error) {
    console.error('[Admin Referral Tree Error]:', error);
    return NextResponse.json({ error: '조직 데이터를 가져오는 데 실패했습니다.' }, { status: 500 });
  }
}
