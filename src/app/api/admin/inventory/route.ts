import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { InventoryManager } from '@/lib/inventoryManagement';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 관리자 권한 확인
    const { connectDB } = await import('@/lib/db');
    await connectDB();
    
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const result = await InventoryManager.getAllInventoryStatus();
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ inventory: result.data });

  } catch (error) {
    console.error('재고 현황 조회 오류:', error);
    return NextResponse.json(
      { error: '재고 현황 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


