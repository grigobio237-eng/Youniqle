import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';

async function getUsersHandler(request: NextRequest) {
  try {
    await connectDB();

    // 관리자 토큰 검증 (쿠키 방식)
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다.' }, { status: 401 });
    }

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);

      if (!decoded || decoded.type !== 'admin') {
        return NextResponse.json({ error: '유효하지 않은 관리자 토큰입니다.' }, { status: 401 });
      }

      // 관리자 권한 확인
      const user = await User.findById(decoded.id);

      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const grade = searchParams.get('grade') || 'all';
    const tier = searchParams.get('tier') || 'all';
    const sort = searchParams.get('sort') || 'newest';

    // 검색 조건 구성
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role !== 'all') {
      filter.role = role;
    }

    if (grade !== 'all') {
      filter.grade = grade;
    }

    if (tier !== 'all') {
      filter.tier = tier;
    }

    // 정렬 조건 구성
    let sortCondition: any = {};
    switch (sort) {
      case 'newest':
        sortCondition = { createdAt: -1 };
        break;
      case 'oldest':
        sortCondition = { createdAt: 1 };
        break;
      case 'points':
        sortCondition = { points: -1 };
        break;
      case 'name':
        sortCondition = { name: 1 };
        break;
      default:
        sortCondition = { createdAt: -1 };
    }

    // 사용자 목록 조회
    const users = await User.find(filter)
      .select('-passwordHash -emailVerificationToken')
      .sort(sortCondition)
      .limit(100);

    // 각 사용자의 주문 통계 조회
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ userId: user._id });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          grade: user.grade || 'cedar',
          tier: user.tier || 'RESET',
          points: user.points,
          provider: user.provider,
          emailVerified: user.emailVerified,
          marketingConsent: user.marketingConsent,
          addresses: user.addresses,
          wishlist: user.wishlist,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLoginAt: user.updatedAt, // 실제로는 별도 필드 필요
          totalOrders,
          totalSpent
        };
      })
    );

    return NextResponse.json({ users: usersWithStats });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: '사용자 목록을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export const GET = getUsersHandler;















