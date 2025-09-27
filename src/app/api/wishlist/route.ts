import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    await connectDB();

    // 사용자 정보 조회 (위시리스트 포함)
    const user = await User.findOne({ email: session.user.email })
      .populate({
        path: 'wishlist.productId',
        select: 'name price images category stock status'
      });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ wishlist: user.wishlist || [] });
  } catch (error) {
    console.error('위시리스트 조회 오류:', error);
    return NextResponse.json(
      { error: '위시리스트 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
    }

    await connectDB();

    // 상품 존재 확인
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 사용자 정보 조회
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 이미 위시리스트에 있는지 확인
    const existingItem = user.wishlist?.find(
      (item: any) => item.productId.toString() === productId
    );

    if (existingItem) {
      return NextResponse.json({ error: '이미 위시리스트에 추가된 상품입니다.' }, { status: 400 });
    }

    // 위시리스트에 추가
    if (!user.wishlist) {
      user.wishlist = [];
    }

    user.wishlist.push({
      productId,
      addedAt: new Date()
    });

    await user.save();

    return NextResponse.json({ 
      message: '위시리스트에 추가되었습니다.',
      wishlist: user.wishlist 
    }, { status: 201 });

  } catch (error) {
    console.error('위시리스트 추가 오류:', error);
    return NextResponse.json(
      { error: '위시리스트 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
    }

    await connectDB();

    // 사용자 정보 조회
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 위시리스트에서 제거
    if (user.wishlist) {
      user.wishlist = user.wishlist.filter(
        (item: any) => item.productId.toString() !== productId
      );
      await user.save();
    }

    return NextResponse.json({ 
      message: '위시리스트에서 제거되었습니다.',
      wishlist: user.wishlist || [] 
    });

  } catch (error) {
    console.error('위시리스트 제거 오류:', error);
    return NextResponse.json(
      { error: '위시리스트 제거 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
