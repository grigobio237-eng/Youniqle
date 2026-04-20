import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Shop from '@/models/Shop';
import { authOptions } from '@/lib/auth';

// 제안서 조회 (GET)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.isNavigator && session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { shopId } = await params;
    await dbConnect();

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      proposal: shop.metadata?.proposal || {
        lite: { title: '', price: '', desc: '' },
        signature: { title: '', price: '', desc: '' },
        black: { title: '', price: '', desc: '' },
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 제안서 저장 (POST)
export async function POST(
    request: Request,
    { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.isNavigator && session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { shopId } = await params;
    const { proposal } = await request.json();

    await dbConnect();

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // 권한 체크: 어드민이거나 해당 업소의 담당 네비게이터여야 함
    // @ts-ignore
    if (session?.user?.role !== 'admin' && shop.navigatorId.toString() !== session?.user?.id) {
       return NextResponse.json({ error: '작성 권한이 없습니다.' }, { status: 403 });
    }

    // metadata 에 proposal 저장
    if (!shop.metadata) shop.metadata = {};
    shop.metadata.proposal = proposal;
    shop.metadata.lastUpdatedBy = session?.user?.email;
    shop.metadata.lastUpdatedAt = new Date();

    // Mixed 타입 변경 알림 (Mongoose)
    shop.markModified('metadata');
    await shop.save();

    return NextResponse.json({ success: true, message: '맞춤 상품 설계가 저장되었습니다.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
