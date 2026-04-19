import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Shop from '@/models/Shop';
import SurveyResponse from '@/models/SurveyResponse';
import { authOptions } from '@/lib/auth';

// 고유한 ShopCode 생성 (예: YQ4X9)
function generateShopCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.isNavigator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();

    // @ts-ignore
    const navigatorId = session.user.id || session.user._id;

    const shops = await Shop.find({ navigatorId }).sort({ createdAt: -1 }).lean();

    // 각 샵의 리드(설문 응답) 수 집계
    const shopsWithLeads = await Promise.all(shops.map(async (shop) => {
      const leadCount = await SurveyResponse.countDocuments({ shopId: shop._id });
      return {
        ...shop,
        leadCount
      };
    }));

    return NextResponse.json({ success: true, shops: shopsWithLeads });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.isNavigator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, category } = body;

    if (!name) {
      return NextResponse.json({ error: 'Shop name is required' }, { status: 400 });
    }

    await dbConnect();

    // @ts-ignore
    const navigatorId = session.user.id || session.user._id;

    // 고유한 코드가 생성될 때까지 시도
    let shopCode = generateShopCode();
    let codeExists = await Shop.findOne({ shopCode });
    while (codeExists) {
      shopCode = generateShopCode();
      codeExists = await Shop.findOne({ shopCode });
    }

    const newShop = new Shop({
      name,
      category: category || 'medical',
      shopCode,
      navigatorId,
      isActive: true
    });

    await newShop.save();

    return NextResponse.json({ success: true, shop: newShop });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
