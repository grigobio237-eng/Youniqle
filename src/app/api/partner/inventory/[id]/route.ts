import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { InventoryManager } from '@/lib/inventoryManagement';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    
    // 파트너 토큰 검증
    const token = request.cookies.get('partner-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '파트너 토큰이 필요합니다.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string };

    // 상품이 해당 파트너의 것인지 확인
    const { connectDB } = await import('@/lib/db');
    await connectDB();
    
    const Product = (await import('@/models/Product')).default;
    const product = await Product.findOne({ 
      _id: productId, 
      partnerId: decoded.id 
    });

    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없거나 권한이 없습니다.' }, { status: 404 });
    }

    const result = await InventoryManager.getProductInventoryStatus(productId);
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ inventory: result.data });

  } catch (error) {
    console.error('파트너 상품 재고 현황 조회 오류:', error);
    return NextResponse.json(
      { error: '상품 재고 현황 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    
    // 파트너 토큰 검증
    const token = request.cookies.get('partner-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '파트너 토큰이 필요합니다.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string };

    // 상품이 해당 파트너의 것인지 확인
    const { connectDB } = await import('@/lib/db');
    await connectDB();
    
    const Product = (await import('@/models/Product')).default;
    const product = await Product.findOne({ 
      _id: productId, 
      partnerId: decoded.id 
    });

    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없거나 권한이 없습니다.' }, { status: 404 });
    }

    const { adjustment, reason, minStock, maxStock } = await request.json();

    // 재고 조정
    if (typeof adjustment === 'number') {
      const result = await InventoryManager.adjustStock(
        productId, 
        adjustment, 
        reason || `파트너 조정 (${decoded.name})`
      );
      
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
    }

    // 최소/최대 재고 설정 업데이트
    if (typeof minStock === 'number' || typeof maxStock === 'number') {
      const updateData: any = {};
      if (typeof minStock === 'number') updateData.minStock = minStock;
      if (typeof maxStock === 'number') updateData.maxStock = maxStock;
      
      await Product.findByIdAndUpdate(productId, updateData);
    }

    // 업데이트된 재고 현황 반환
    const updatedResult = await InventoryManager.getProductInventoryStatus(productId);
    
    if (!updatedResult.success) {
      return NextResponse.json({ error: updatedResult.message }, { status: 400 });
    }

    return NextResponse.json({ 
      message: '재고가 성공적으로 업데이트되었습니다.',
      inventory: updatedResult.data
    });

  } catch (error) {
    console.error('파트너 재고 조정 오류:', error);
    return NextResponse.json(
      { error: '재고 조정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


