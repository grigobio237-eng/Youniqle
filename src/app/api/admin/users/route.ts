import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const grade = searchParams.get('grade') || 'all';
    const sort = searchParams.get('sort') || 'newest';

    await connectDB();

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
          grade: user.grade || 'cedar', // 기본값으로 cedar 설정
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















