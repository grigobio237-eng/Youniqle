import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // 추가: 데이터 갱신 누락 방지를 위한 캐시 비활성화

async function getUsersHandler(request: NextRequest) {
  try {
    await connectDB();

    // 관리자 권한 검증 (통합 유틸리티 사용)
    const auth = await verifyAdminToken(request);
    if (!auth.success) {
      console.error('❌ 관리자 권한 검증 실패:', auth.error);
      return NextResponse.json({ error: auth.error }, { status: 401 });
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
      if (role === 'navigator') {
        filter.isNavigator = true;
      } else {
        filter.role = role;
      }
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

    // 각 사용자의 주문 통계 및 활동 데이터 조회
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ userId: user._id });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        // 최신 진단 결과 추출
        const latestDiagnosis = user.diagnosisResults?.length > 0 
          ? user.diagnosisResults[user.diagnosisResults.length - 1] 
          : null;

        // 최근 활동 유형 추출
        const latestActivity = user.scanTimeline?.length > 0
          ? user.scanTimeline[user.scanTimeline.length - 1]
          : null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          grade: user.grade || 'cedar',
          tier: user.tier || 'RESET',
          points: user.points,
          isNavigator: user.isNavigator,
          provider: user.provider,
          emailVerified: user.emailVerified,
          marketingConsent: user.marketingConsent,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLoginAt: user.updatedAt,
          totalOrders,
          totalSpent, // 누적 결제 금액
          recoveryStats: {
            lastScore: latestDiagnosis?.totalScore || 0,
            lastDiagnosisDate: latestDiagnosis?.createdAt || null,
            diagnosisCount: user.diagnosisResults?.length || 0,
            latestActivityType: latestActivity?.type || '없음',
            lastActivityDate: latestActivity?.createdAt || null,
            scannerCount: user.scanTimeline?.length || 0
          }
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















