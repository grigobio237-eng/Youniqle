import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Shop from '@/models/Shop';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
    }

    await dbConnect();
    const shop = await Shop.findOne({ shopCode: code.toUpperCase() }).select('name').lean();

    if (!shop) {
      return NextResponse.json({ success: false, error: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, shopName: shop.name });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
