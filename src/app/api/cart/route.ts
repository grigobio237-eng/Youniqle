import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import User from '@/models/User';

// 장바구니 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // JWT 토큰으로 사용자 인증 (선택적)
    const authHeader = request.headers.get('authorization');
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        userId = decoded.userId;
        console.log('JWT 디코딩 성공, userId:', userId);
      } catch (error) {
        console.log('JWT 토큰 검증 실패:', error);
        // 토큰이 유효하지 않아도 계속 진행 (익명 사용자로 처리)
      }
    }

    // 사용자 확인 (선택적)
    let user = null;
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        console.log('사용자를 찾을 수 없음, 익명 사용자로 처리');
      }
    }

    // 장바구니 조회
    if (user) {
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
    } else {
      // 익명 사용자의 경우 빈 장바구니 반환
      return NextResponse.json({
        cart: {
          items: [],
          totalItems: 0,
          totalAmount: 0,
        }
      });
    }
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다.', 
        details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

// 장바구니에 상품 추가
export async function POST(request: NextRequest) {
  try {
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

    // JWT 토큰으로 사용자 인증
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userId = null;

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      userId = decoded.userId;
      console.log('JWT 디코딩 성공, userId:', userId);
    } catch (error) {
      console.log('JWT 토큰 검증 실패:', error);
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    // 사용자 확인
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

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
      { 
        error: '서버 오류가 발생했습니다.', 
        details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

// 장바구니에서 상품 제거
export async function DELETE(request: NextRequest) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: '상품 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    await connectDB();

    // JWT 토큰으로 사용자 인증
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userId = null;

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    // 사용자 확인
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 장바구니에서 상품 제거
    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return NextResponse.json(
        { error: '장바구니가 비어있습니다.' },
        { status: 404 }
      );
    }

    cart.items = cart.items.filter(
      (item: any) => item.productId.toString() !== productId
    );

    await cart.save();

    return NextResponse.json({
      message: '장바구니에서 상품이 제거되었습니다.',
      cart,
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다.', 
        details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}