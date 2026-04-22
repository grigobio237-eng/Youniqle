import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import Review from '@/models/Review';
import PointTransaction from '@/models/PointTransaction';
import Diagnosis from '@/models/Diagnosis';
import Shop from '@/models/Shop';
import { verifyAdminToken } from '@/lib/auth';
import { isValidObjectId } from 'mongoose';
import { logAdminAction } from '@/lib/admin-logger';

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

    // 유효한 ID 형식인지 확인
    if (!isValidObjectId(userId)) {
      return NextResponse.json({ error: '유효하지 않은 사용자 ID 형식입니다.' }, { status: 400 });
    }

    await connectDB();

    // 사용자 상세 정보 조회
    const user = await User.findById(userId)
      .select('-passwordHash -emailVerificationToken');

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자 활동 통계 조회 (shops 포함)
    const [orders, reviews, pointTransactions, diagnosisHistories, shops] = await Promise.all([
      Order.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('items.productId', 'name price images'),
      Review.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('productId', 'name images'),
      PointTransaction.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(20),
      Diagnosis.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(10),
      user.isNavigator ? Shop.find({ navigatorId: user._id }).lean() : Promise.resolve([])
    ]);

    const totalOrders = await Order.countDocuments({ userId: user._id });
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalReviews = await Review.countDocuments({ userId: user._id });

    const userDetail = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      grade: user.grade,
      points: user.points,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      isNavigator: user.isNavigator,
      recentNavigator: user.recentNavigator,
      provider: user.provider,
      emailVerified: user.emailVerified,
      marketingConsent: user.marketingConsent,
      addresses: user.addresses,
      wishlist: user.wishlist,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        totalOrders,
        totalSpent,
        totalReviews,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0
      },
      recentOrders: orders.map(order => ({
        id: order._id.toString(),
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items.map((item: any) => ({
          name: item.productId.name,
          price: item.productId.price,
          quantity: item.quantity,
          image: item.productId.images[0]?.url
        }))
      })),
      recentReviews: reviews.map(review => ({
        id: review._id.toString(),
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt,
        product: {
          name: review.productId.name,
          image: review.productId.images[0]?.url
        }
      })),
      pointHistories: pointTransactions.map(tx => ({
        id: tx._id.toString(),
        type: tx.type,
        amount: tx.amount,
        balance: tx.balance,
        description: tx.description,
        createdAt: tx.createdAt
      })),
      diagnosisHistories: diagnosisHistories.map(diag => ({
        id: diag._id.toString(),
        type: diag.type,
        totalScore: diag.totalScore,
        categoryScores: diag.categoryScores,
        resultTitle: diag.resultTitle,
        createdAt: diag.createdAt
      })),
      shops: user.isNavigator ? (shops as any[] || []).map(shop => ({
        id: shop._id.toString(),
        name: shop.name,
        shopCode: shop.shopCode,
        category: shop.category,
        isActive: shop.isActive,
        createdAt: shop.createdAt
      })) : []
    };

    return NextResponse.json(userDetail);

  } catch (error) {
    console.error('Admin user detail error:', error);
    return NextResponse.json(
      { error: '사용자 정보를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
      return NextResponse.json({ error: '유효하지 않은 사용자 ID 형식입니다.' }, { status: 400 });
    }

    const { action, data, amount } = await request.json();

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const adjustAmount = amount || (data && data.amount) || (data && data.points) || 0;

    const prevUser = JSON.parse(JSON.stringify(user));
    const ip = request.headers.get('x-forwarded-for') || '';
    const userAgent = request.headers.get('user-agent') || '';

    switch (action) {
      case 'update':
        // 사용자 정보 업데이트 (개인정보 제외, 오퍼레이션 필드만 허용)
        if (data.role) {
          // 권한 변경은 오직 superadmin만 가능
          if (auth.user.role !== 'superadmin') {
            return NextResponse.json({ error: '권한 변경은 최상위 관리자만 가능합니다.' }, { status: 403 });
          }
          user.role = data.role;
        }
        if (data.grade) user.grade = data.grade;
        if (data.tier) user.tier = data.tier;
        if (data.points !== undefined) user.points = data.points;
        break;

      case 'suspend':
        user.emailVerified = false;
        break;

      case 'toggleNavigator':
        user.isNavigator = !user.isNavigator;
        break;

      case 'promote':
        const grades = ['cedar', 'rooter', 'bloomer', 'glower', 'ecosoul'];
        const currentIndex = grades.indexOf(user.grade);
        if (currentIndex < grades.length - 1) {
          user.grade = grades[currentIndex + 1];
        }
        break;

      case 'promoteTier':
        const tiers = ['RESET', 'REBORN', 'RESTART'];
        const currentTierIndex = tiers.indexOf(user.tier || 'RESET');
        if (currentTierIndex < tiers.length - 1) {
          user.tier = tiers[currentTierIndex + 1];
        }
        break;

      case 'addPoints':
      case 'grantPoints':
        user.points += adjustAmount;
        break;

      case 'deductPoints':
        user.points = Math.max(0, user.points - adjustAmount);
        break;

      default:
        return NextResponse.json({ error: '알 수 없는 작업입니다.' }, { status: 400 });
    }

    // 기존 데이터의 스키마 오류 무시를 위해 전체 검증 우회
    await user.save({ validateBeforeSave: false });

    // 활동 로그 기록
    await logAdminAction({
      admin: {
        id: auth.user.id,
        email: auth.user.email,
        name: auth.user.name
      },
      action: action === 'update' ? (data.role ? 'ROLE_CHANGE' : 'USER_UPDATE') : action.toUpperCase(),
      targetId: user._id,
      targetModel: 'User',
      details: `${user.email} 사용자의 정보를 수정함 (${action})`,
      prevData: prevUser,
      newData: JSON.parse(JSON.stringify(user)),
      ip,
      userAgent
    });

    return NextResponse.json({
      message: '사용자 정보가 업데이트되었습니다.',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        grade: user.grade,
        tier: user.tier,
        points: user.points,
        isNavigator: user.isNavigator
      }
    });

  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { error: '사용자 정보 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // 유효한 ID 형식인지 확인
    if (!isValidObjectId(userId)) {
      return NextResponse.json({ error: '유효하지 않은 사용자 ID 형식입니다.' }, { status: 400 });
    }

    await connectDB();

    // 관리자 계정은 삭제 불가
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (user.role === 'admin' || user.role === 'superadmin') {
      return NextResponse.json(
        { error: '관리자 계정은 삭제할 수 없습니다.' },
        { status: 403 }
      );
    }

    const prevUser = JSON.parse(JSON.stringify(user));
    const ip = request.headers.get('x-forwarded-for') || '';
    const userAgent = request.headers.get('user-agent') || '';

    // 관련 데이터도 함께 삭제 (실제로는 soft delete 권장)
    await Promise.all([
      User.findByIdAndDelete(userId),
      Order.deleteMany({ userId }),
      Review.deleteMany({ userId })
    ]);

    // 활동 로그 기록
    await logAdminAction({
      admin: {
        id: auth.user.id,
        email: auth.user.email,
        name: auth.user.name
      },
      action: 'USER_DELETE',
      targetId: userId,
      targetModel: 'User',
      details: `${prevUser.email} 사용자를 삭제함`,
      prevData: prevUser,
      ip,
      userAgent
    });

    return NextResponse.json({
      message: '사용자가 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Admin user delete error:', error);
    return NextResponse.json(
      { error: '사용자 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
