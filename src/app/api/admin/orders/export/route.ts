import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 주문 내역 다운로드 (CSV)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv'; // csv or excel
    const statusFilter = searchParams.get('status');
    const paymentStatusFilter = searchParams.get('paymentStatus');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const orderIds = searchParams.get('orderIds'); // 선택된 주문 ID (쉼표로 구분)

    const filter: any = {};
    if (statusFilter && statusFilter !== 'all') filter.status = statusFilter;
    if (paymentStatusFilter && paymentStatusFilter !== 'all') filter.paymentStatus = paymentStatusFilter;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (orderIds) {
      const ids = orderIds.split(',').filter(Boolean);
      filter._id = { $in: ids };
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone')
      .lean();

    if (format === 'csv') {
      // CSV 형식으로 변환
      const csvHeaders = [
        '주문번호',
        '주문일',
        '고객명',
        '고객이메일',
        '고객전화',
        '상품명',
        '수량',
        '단가',
        '총액',
        '주문상태',
        '결제상태',
        '결제방법',
        '배송지',
        '배송연락처',
        '택배사',
        '송장번호',
        '배송일',
      ];

      const csvRows = orders.flatMap((order: any) => {
        const orderDate = new Date(order.createdAt).toLocaleString('ko-KR');
        const customerName = order.userId?.name || 'N/A';
        const customerEmail = order.userId?.email || 'N/A';
        const customerPhone = order.userId?.phone || 'N/A';
        const shippingAddress = order.shippingAddress 
          ? `${order.shippingAddress.addr1 || order.shippingAddress.address1 || ''} ${order.shippingAddress.addr2 || order.shippingAddress.address2 || ''}`
          : 'N/A';
        const shippingPhone = order.shippingAddress?.phone || 'N/A';

        return order.items.map((item: any) => [
          order.orderNumber || order._id.toString(),
          orderDate,
          customerName,
          customerEmail,
          customerPhone,
          item.name || item.productName || 'N/A',
          item.quantity || 0,
          item.price || 0,
          (item.quantity || 0) * (item.price || 0),
          order.status || 'N/A',
          order.paymentStatus || 'N/A',
          order.paymentMethod || 'N/A',
          shippingAddress,
          shippingPhone,
          order.courierCompany || '',
          order.trackingNumber || '',
          order.shippedAt ? new Date(order.shippedAt).toLocaleDateString('ko-KR') : '',
        ]);
      });

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // BOM을 추가하여 Excel에서 한글이 깨지지 않도록 함
      const BOM = '\uFEFF';
      return new NextResponse(BOM + csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="orders_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // Excel 형식 (JSON으로 반환, 클라이언트에서 처리)
      const excelData = orders.map((order: any) => ({
        주문번호: order.orderNumber || order._id.toString(),
        주문일: new Date(order.createdAt).toLocaleString('ko-KR'),
        고객명: order.userId?.name || 'N/A',
        고객이메일: order.userId?.email || 'N/A',
        고객전화: order.userId?.phone || 'N/A',
        총액: order.totalAmount || 0,
        주문상태: order.status || 'N/A',
        결제상태: order.paymentStatus || 'N/A',
        결제방법: order.paymentMethod || 'N/A',
        택배사: order.courierCompany || '',
        송장번호: order.trackingNumber || '',
        배송일: order.shippedAt ? new Date(order.shippedAt).toLocaleDateString('ko-KR') : '',
      }));

      return NextResponse.json({
        success: true,
        data: excelData,
      });
    }
  } catch (error: any) {
    console.error('주문 내역 다운로드 오류:', error);
    return NextResponse.json(
      { error: error.message || '주문 내역 다운로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}

