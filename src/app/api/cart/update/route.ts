import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import User from '@/models/User';

// 장바구니 상품 수량 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: '상품 ID와 수량이 필요합니다.' },
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 99) {
      return NextResponse.json(
        { error: '수량은 1개 이상 99개 이하여야 합니다.' },
        { status: 400 }
      );
    }

    await connectDB();

    // 상품 정보 조회
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: '재고가 부족합니다.' },
        { status: 400 }
      );
    }

    // 사용자 ID를 이메일로 조회
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 장바구니 조회
    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return NextResponse.json(
        { error: '장바구니가 비어있습니다.' },
        { status: 404 }
      );
    }

    // 상품 수량 업데이트
    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: '장바구니에 해당 상품이 없습니다.' },
        { status: 404 }
      );
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // 업데이트된 장바구니 반환
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price images slug')
      .lean();

    return NextResponse.json({
      message: '수량이 업데이트되었습니다.',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Update cart quantity error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
