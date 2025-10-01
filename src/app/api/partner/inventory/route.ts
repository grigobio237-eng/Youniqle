import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { InventoryManager } from '@/lib/inventoryManagement';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function GET(request: NextRequest) {
  try {
    // 파트너 토큰 검증
    const token = request.cookies.get('partner-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '파트너 토큰이 필요합니다.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string };
    
    // 파트너의 상품들만 조회
    const { connectDB } = await import('@/lib/db');
    await connectDB();
    
    const Product = (await import('@/models/Product')).default;
    const products = await Product.find({ partnerId: decoded.id })
      .select('name stock reservedStock minStock maxStock status category images')
      .sort({ createdAt: -1 });

    // 재고 현황 데이터 변환
    const inventoryData = products.map(product => {
      const availableStock = product.stock - (product.reservedStock || 0);
      const status = InventoryManager.getInventoryStatus(product);

      return {
        productId: product._id.toString(),
        productName: product.name,
        currentStock: product.stock,
        reservedStock: product.reservedStock || 0,
        availableStock,
        minStock: product.minStock || 10,
        maxStock: product.maxStock || 1000,
        status,
        productStatus: product.status,
        category: product.category,
        image: product.images?.[0]?.url || '/placeholder-product.jpg'
      };
    });

    // 재고 상태별 통계
    const stats = {
      totalProducts: products.length,
      inStock: inventoryData.filter(item => item.status === 'in_stock').length,
      lowStock: inventoryData.filter(item => item.status === 'low_stock').length,
      outOfStock: inventoryData.filter(item => item.status === 'out_of_stock').length,
      overstocked: inventoryData.filter(item => item.status === 'overstocked').length,
      totalValue: inventoryData.reduce((sum, item) => sum + (item.currentStock * 10000), 0) // 예상 재고 가치
    };

    return NextResponse.json({ 
      inventory: inventoryData,
      stats
    });

  } catch (error) {
    console.error('파트너 재고 현황 조회 오류:', error);
    return NextResponse.json(
      { error: '재고 현황 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


