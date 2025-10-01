import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import Review from '@/models/Review';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
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

    // 사용자 활동 통계 조회
    const [orders, reviews] = await Promise.all([
      Order.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('items.productId', 'name price images'),
      Review.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('productId', 'name images')
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
      }))
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
    const { action, data } = await request.json();

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'update':
        // 사용자 정보 업데이트
        if (data.name) user.name = data.name;
        if (data.email) user.email = data.email;
        if (data.phone) user.phone = data.phone;
        if (data.role) user.role = data.role;
        if (data.grade) user.grade = data.grade;
        if (data.points !== undefined) user.points = data.points;
        break;

      case 'suspend':
        // 계정 정지 (임시 구현)
        user.emailVerified = false;
        break;

      case 'promote':
        // 등급 상승
        const grades = ['cedar', 'rooter', 'bloomer', 'glower', 'ecosoul'];
        const currentIndex = grades.indexOf(user.grade);
        if (currentIndex < grades.length - 1) {
          user.grade = grades[currentIndex + 1];
        }
        break;

      case 'addPoints':
        // 포인트 추가
        user.points += data.points || 0;
        break;

      default:
        return NextResponse.json(
          { error: '알 수 없는 작업입니다.' },
          { status: 400 }
        );
    }

    await user.save();

    return NextResponse.json({
      message: '사용자 정보가 업데이트되었습니다.',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        grade: user.grade,
        points: user.points
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
    await connectDB();

    // 관리자 계정은 삭제 불가
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (user.role === 'admin') {
      return NextResponse.json(
        { error: '관리자 계정은 삭제할 수 없습니다.' },
        { status: 403 }
      );
    }

    // 관련 데이터도 함께 삭제 (실제로는 soft delete 권장)
    await Promise.all([
      User.findByIdAndDelete(userId),
      Order.deleteMany({ userId }),
      Review.deleteMany({ userId })
    ]);

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
