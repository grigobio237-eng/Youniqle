import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// 파트너 주문 내역 다운로드 (CSV/JSON)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // 파트너 토큰 검증
    const token = request.cookies.get('partner-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '파트너 토큰이 필요합니다.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const partnerId = decoded.id;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv'; // csv or json
    const statusFilter = searchParams.get('status');
    const paymentStatusFilter = searchParams.get('paymentStatus');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 파트너의 상품이 포함된 주문만 조회
    const filter: any = {
      'items.partnerId': partnerId
    };
    
    if (statusFilter && statusFilter !== 'all') filter.status = statusFilter;
    if (paymentStatusFilter && paymentStatusFilter !== 'all') filter.paymentStatus = paymentStatusFilter;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name images')
      .lean();

    // 파트너의 상품만 필터링
    const partnerOrders = orders.map((order: any) => {
      const partnerItems = order.items.filter((item: any) => 
        item.partnerId?.toString() === partnerId
      );
      
      const partnerTotalAmount = partnerItems.reduce(
        (sum: number, item: any) => sum + (item.quantity * item.price),
        0
      );

      return {
        ...order,
        items: partnerItems,
        totalAmount: partnerTotalAmount,
      };
    }).filter((order: any) => order.items.length > 0);

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
        '배송지명',
        '배송지전화',
        '배송지주소',
        '배송지상세',
        '우편번호',
        '택배사',
        '송장번호',
        '배송시작일',
      ];

      const csvRows = partnerOrders.flatMap((order: any) => {
        const orderDate = new Date(order.createdAt).toLocaleString('ko-KR');
        const customerName = order.userId?.name || 'N/A';
        const customerEmail = order.userId?.email || 'N/A';
        const customerPhone = order.userId?.phone || 'N/A';
        const shippingName = order.shippingAddress?.name || 'N/A';
        const shippingPhone = order.shippingAddress?.phone || 'N/A';
        const shippingAddress = order.shippingAddress?.address || 'N/A';
        const shippingDetail = order.shippingAddress?.detail || 'N/A';
        const shippingZipCode = order.shippingAddress?.zipCode || 'N/A';

        return order.items.map((item: any) => {
          const productName = item.productId?.name || item.productName || 'N/A';
          
          return [
            order.orderNumber || order._id.toString(),
            orderDate,
            customerName,
            customerEmail,
            customerPhone,
            productName,
            item.quantity || 0,
            item.price || 0,
            (item.quantity || 0) * (item.price || 0),
            order.status || 'N/A',
            order.paymentStatus || 'N/A',
            shippingName,
            shippingPhone,
            shippingAddress,
            shippingDetail,
            shippingZipCode,
            order.courierCompany || '',
            order.trackingNumber || '',
            order.shippedAt ? new Date(order.shippedAt).toLocaleDateString('ko-KR') : '',
          ];
        });
      });

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((row: any[]) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // BOM을 추가하여 Excel에서 한글이 깨지지 않도록 함
      const BOM = '\uFEFF';
      return new NextResponse(BOM + csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="partner_orders_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // JSON 형식으로 변환
      const jsonData = partnerOrders.map((order: any) => {
        const customer = order.userId;
        return {
          주문번호: order.orderNumber || order._id.toString(),
          주문일: new Date(order.createdAt).toLocaleString('ko-KR'),
          고객명: customer?.name || 'N/A',
          고객이메일: customer?.email || 'N/A',
          고객전화: customer?.phone || 'N/A',
          총액: order.totalAmount || 0,
          주문상태: order.status || 'N/A',
          결제상태: order.paymentStatus || 'N/A',
          배송지명: order.shippingAddress?.name || 'N/A',
          배송지전화: order.shippingAddress?.phone || 'N/A',
          배송지주소: order.shippingAddress?.address || 'N/A',
          배송지상세: order.shippingAddress?.detail || 'N/A',
          우편번호: order.shippingAddress?.zipCode || 'N/A',
          택배사: order.courierCompany || '',
          송장번호: order.trackingNumber || '',
          배송시작일: order.shippedAt ? new Date(order.shippedAt).toLocaleDateString('ko-KR') : '',
          상품목록: order.items.map((item: any) => ({
            상품명: item.productId?.name || item.productName || 'N/A',
            수량: item.quantity || 0,
            단가: item.price || 0,
            총액: (item.quantity || 0) * (item.price || 0),
          })),
        };
      });

      return NextResponse.json({
        success: true,
        data: jsonData,
      });
    }
  } catch (error: any) {
    console.error('파트너 주문 내역 다운로드 오류:', error);
    return NextResponse.json(
      { error: error.message || '주문 내역 다운로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}

