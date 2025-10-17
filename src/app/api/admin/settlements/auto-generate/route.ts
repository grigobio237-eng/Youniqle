import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Settlement from '@/models/Settlement';
import Order from '@/models/Order';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

// 자동 정산 생성 (관리자)
// 매월 1일 자동 실행 또는 수동 실행
export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const user = await verifyAuth(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { year, month, minAmount = 10000 } = body; // 최소 정산 금액 (기본 10,000원)

    // 기본값: 지난달
    const targetDate = year && month
      ? new Date(year, month - 1, 1)
      : new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);

    const periodStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const periodEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

    // 승인된 모든 파트너 조회
    const partners = await User.find({
      role: 'partner',
      partnerStatus: 'approved',
    }).select('_id name email partnerSettings partnerApplication');

    if (partners.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_PARTNERS', message: '승인된 파트너가 없습니다.' } },
        { status: 400 }
      );
    }

    const results: {
      success: any[];
      failed: any[];
      skipped: any[];
    } = {
      success: [],
      failed: [],
      skipped: [],
    };

    // 각 파트너별로 정산 생성
    for (const partner of partners) {
      try {
        // 이미 해당 기간 정산이 존재하는지 확인
        const existingSettlement = await Settlement.findOne({
          partnerId: partner._id,
          periodStart,
          periodEnd,
        });

        if (existingSettlement) {
          results.skipped.push({
            partnerId: partner._id,
            partnerName: partner.name,
            reason: '이미 정산이 존재합니다',
            settlementId: existingSettlement._id,
          });
          continue;
        }

        // 해당 기간의 배송 완료된 주문 조회
        const orders = await Order.find({
          partnerId: partner._id,
          status: 'delivered',
          deliveredAt: {
            $gte: periodStart,
            $lte: periodEnd,
          },
        }).populate('items.productId');

        if (orders.length === 0) {
          results.skipped.push({
            partnerId: partner._id,
            partnerName: partner.name,
            reason: '배송 완료된 주문이 없습니다',
          });
          continue;
        }

        // 정산 항목 계산
        const items = orders.map((order: any) => {
          const orderAmount = order.totalAmount;
          const commissionRate = partner.partnerSettings?.commissionRate || 12;
          const commissionAmount = Math.floor(orderAmount * (commissionRate / 100));
          const settlementAmount = orderAmount - commissionAmount;

          return {
            orderId: order._id,
            orderNumber: order.orderNumber || order._id.toString(),
            productName: order.items.map((item: any) => item.name || item.productId?.name).join(', '),
            quantity: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
            orderAmount,
            commissionRate,
            commissionAmount,
            settlementAmount,
            orderDate: order.createdAt,
            orderStatus: order.status,
          };
        });

        // 합계 계산
        const totalOrders = items.length;
        const totalOrderAmount = items.reduce((sum, item) => sum + item.orderAmount, 0);
        const totalCommissionAmount = items.reduce((sum, item) => sum + item.commissionAmount, 0);
        const totalSettlementAmount = items.reduce((sum, item) => sum + item.settlementAmount, 0);

        // 최소 정산 금액 체크
        if (totalSettlementAmount < minAmount) {
          results.skipped.push({
            partnerId: partner._id,
            partnerName: partner.name,
            reason: `정산 금액이 최소 금액(${minAmount.toLocaleString()}원) 미만입니다`,
            settlementAmount: totalSettlementAmount,
          });
          continue;
        }

        // 정산 번호 생성
        const settlementNumber = await Settlement.generateSettlementNumber();

        // 정산 생성
        const settlement = await Settlement.create({
          partnerId: partner._id,
          partnerName: partner.name,
          partnerEmail: partner.email,
          settlementNumber,
          type: 'monthly',
          status: 'pending',
          periodStart,
          periodEnd,
          items,
          totalOrders,
          totalOrderAmount,
          totalCommissionAmount,
          totalSettlementAmount,
          bankAccount: {
            bankName: partner.partnerApplication?.bankName || '',
            accountNumber: partner.partnerApplication?.bankAccount || '',
            accountHolder: partner.partnerApplication?.accountHolder || '',
          },
          requestedAt: new Date(),
        });

        results.success.push({
          partnerId: partner._id,
          partnerName: partner.name,
          settlementId: settlement._id,
          settlementNumber: settlement.settlementNumber,
          totalOrders,
          totalSettlementAmount,
        });
      } catch (error: any) {
        results.failed.push({
          partnerId: partner._id,
          partnerName: partner.name,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        period: {
          start: periodStart,
          end: periodEnd,
        },
        results,
        summary: {
          total: partners.length,
          success: results.success.length,
          failed: results.failed.length,
          skipped: results.skipped.length,
        },
      },
      message: `${results.success.length}개의 정산이 생성되었습니다.`,
    });
  } catch (error: any) {
    console.error('Error auto-generating settlements:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '자동 정산 생성 실패' } },
      { status: 500 }
    );
  }
}

