import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import User from '@/models/User';

// 장바구니 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    await connectDB();

    // 사용자 ID를 이메일로 조회
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const cart = await Cart.findOne({ userId: user._id })
      .populate('items.productId', 'name price images slug')
      .lean();

    if (!cart) {
      return NextResponse.json({
        cart: {
          items: [],
          totalItems: 0,
          totalAmount: 0,
        }
      });
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 장바구니에 상품 추가
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: '상품 ID가 필요합니다.' },
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

    if (product.status !== 'active') {
      return NextResponse.json(
        { error: '판매 중이 아닌 상품입니다.' },
        { status: 400 }
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

    // 장바구니 조회 또는 생성
    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = new Cart({
        userId: user._id,
        items: [],
      });
    }

    // 기존 상품이 있는지 확인
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // 기존 상품 수량 업데이트
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > 99) {
        return NextResponse.json(
          { error: '장바구니에 최대 99개까지 담을 수 있습니다.' },
          { status: 400 }
        );
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // 새 상품 추가
      cart.items.push({
        productId: product._id,
        quantity,
        price: product.price,
        addedAt: new Date(),
      });
    }

    await cart.save();

    // 업데이트된 장바구니 반환
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price images slug')
      .lean();

    return NextResponse.json({
      message: '장바구니에 상품이 추가되었습니다.',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 장바구니에서 상품 제거
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: '상품 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    await connectDB();

    // 사용자 ID를 이메일로 조회
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return NextResponse.json(
        { error: '장바구니가 비어있습니다.' },
        { status: 404 }
      );
    }

    // 상품 제거
    cart.items = cart.items.filter(
      (item: any) => item.productId.toString() !== productId
    );

    await cart.save();

    // 업데이트된 장바구니 반환
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price images slug')
      .lean();

    return NextResponse.json({
      message: '상품이 장바구니에서 제거되었습니다.',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
