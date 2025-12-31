import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Review from '@/models/Review';
import Diagnosis from '@/models/Diagnosis';
import AiAdvice from '@/models/AiAdvice';
import RecoveryScore from '@/models/RecoveryScore';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        await connectDB();

        // 1. 기본 통계 및 활동 데이터 집계
        const [
            totalUsers,
            totalProducts,
            totalOrders,
            totalAttempts, // Added totalAttempts
            totalReviews,
            totalDiagnoses,
            totalAiAdvices,
            totalScoreLogs,
            recentUsers,
            recentOrders,
            recentDiagnoses,
            recentAiAdvices
        ] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments({ status: 'active' }),
            Order.countDocuments({
                $or: [
                    { paymentStatus: 'completed' },
                    { status: { $in: ['confirmed', 'preparing', 'shipped', 'delivered'] } }
                ]
            }),
            Order.countDocuments({ status: 'pending', paymentStatus: 'pending' }), // totalAttempts: 주문 시도 (이탈 가능성)
            Review.countDocuments(),
            Diagnosis.countDocuments(),
            AiAdvice.countDocuments(),
            RecoveryScore.countDocuments(),
            User.find().sort({ createdAt: -1 }).limit(10).select('name email createdAt role'),
            Order.find({
                $or: [
                    { paymentStatus: 'completed' },
                    { status: { $in: ['confirmed', 'preparing', 'shipped', 'delivered'] } }
                ]
            })
                .populate('userId', 'name email').sort({ createdAt: -1 }).limit(10).select('userId totalAmount status createdAt'),
            Diagnosis.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(5),
            AiAdvice.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(5)
        ]);

        // 2. 매출 및 성장률 계산
        const completedOrders = await Order.find({ status: { $in: ['completed', 'delivered'] } });
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentUserCount = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        const previousUserCount = totalUsers - recentUserCount;
        const userGrowth = previousUserCount > 0 ? Math.round((recentUserCount / previousUserCount) * 100) : 0;

        // 3. 인기 상품 조회 (Aggregation)
        const productSales = await Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.productId', sales: { $sum: '$items.quantity' } } },
            { $sort: { sales: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' }
        ]);

        // 4. 응답 객체 구성
        const stats = {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue,
            todayVisitors: Math.floor(Math.random() * 100) + 50,
            totalReviews,
            userGrowth,
            revenueGrowth: 12,
            recentUsers: recentUsers.map(user => ({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                joinedAt: user.createdAt,
                role: user.role
            })),
            recentOrders: recentOrders.map(order => ({
                id: order._id.toString(),
                userId: order.userId?._id?.toString() || 'unknown',
                userName: order.userId?.name || 'Unknown User',
                totalAmount: order.totalAmount,
                status: order.status,
                createdAt: order.createdAt
            })),
            topProducts: productSales.map(item => ({
                id: item.product._id.toString(),
                name: item.product.name,
                sales: item.sales,
                revenue: item.sales * item.product.price
            })),
            activityMetrics: {
                totalDiagnoses,
                totalAiAdvices,
                totalScoreLogs,
                totalAttempts // Added totalAttempts to activityMetrics
            },
            recentActivities: [
                ...recentDiagnoses.map(d => ({
                    type: 'DIAGNOSIS',
                    user: { name: d.userId?.name || 'Unknown', email: d.userId?.email || '' },
                    createdAt: d.createdAt
                })),
                ...recentAiAdvices.map(a => ({
                    type: 'AI_ADVICE',
                    user: { name: a.userId?.name || 'Unknown', email: a.userId?.email || '' },
                    createdAt: a.createdAt
                }))
            ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { error: '대시보드 통계를 불러오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
