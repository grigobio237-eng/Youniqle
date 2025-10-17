import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Settlement from '@/models/Settlement';
import { verifyAuth } from '@/lib/auth';

// 정산 내역 CSV 다운로드 (관리자)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    await connectDB();
    const params = await context.params;

    const settlement = await Settlement.findById(params.id)
      .populate('partnerId', 'name email')
      .lean();

    if (!settlement) {
      return NextResponse.json(
        { success: false, error: { code: 'SETTLEMENT_NOT_FOUND', message: '정산을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // CSV 생성
    const csvRows = [];
    
    // 헤더
    csvRows.push([
      '정산번호',
      '파트너명',
      '정산기간 시작',
      '정산기간 종료',
      '총 주문건수',
      '주문 금액',
      '수수료 금액',
      '정산 금액',
      '상태',
      '은행명',
      '계좌번호',
      '예금주',
    ].join(','));

    // 정산 기본 정보
    csvRows.push([
      settlement.settlementNumber,
      settlement.partnerName,
      new Date(settlement.periodStart).toLocaleDateString('ko-KR'),
      new Date(settlement.periodEnd).toLocaleDateString('ko-KR'),
      settlement.totalOrders,
      settlement.totalOrderAmount,
      settlement.totalCommissionAmount,
      settlement.totalSettlementAmount,
      settlement.status,
      settlement.bankAccount.bankName,
      settlement.bankAccount.accountNumber,
      settlement.bankAccount.accountHolder,
    ].join(','));

    // 공백 행
    csvRows.push('');

    // 주문 내역 헤더
    csvRows.push([
      '주문일',
      '주문번호',
      '상품명',
      '수량',
      '주문금액',
      '수수료율',
      '수수료금액',
      '정산금액',
      '주문상태',
    ].join(','));

    // 주문 내역
    if (settlement.items && settlement.items.length > 0) {
      for (const item of settlement.items) {
        csvRows.push([
          new Date(item.orderDate).toLocaleDateString('ko-KR'),
          item.orderNumber,
          `"${item.productName}"`, // 쉼표 포함 가능성 있어 따옴표로 감쌈
          item.quantity,
          item.orderAmount,
          `${item.commissionRate}%`,
          item.commissionAmount,
          item.settlementAmount,
          item.orderStatus,
        ].join(','));
      }
    }

    const csvContent = csvRows.join('\n');
    
    // UTF-8 BOM 추가 (엑셀에서 한글 깨짐 방지)
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    return new NextResponse(csvWithBOM, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="settlement_${settlement.settlementNumber}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error downloading settlement:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '다운로드 실패' } },
      { status: 500 }
    );
  }
}
