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
    await connectDB();
    
    // Ensure Product model is registered for populate
    // Dynamic import to avoid circular dependency
    await import('@/models/Product');

    const session = await getServerSession(authOptions);
    let user = null;

    if (session?.user?.email) {
      user = await User.findOne({ email: session.user.email });
    }

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

      // 타입 정의 및 안전성 확보
      const validItems = ((cart as any).items || []).filter((item: any) => item && item.productId);
      
      // Calculate totals with safety for NaN/undefined
      const totalItems = validItems.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0);
      const totalAmount = validItems.reduce((sum: number, item: any) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);

      const filteredCart = {
        ...cart,
        items: validItems,
        totalItems,
        totalAmount
      };

      return NextResponse.json({ cart: filteredCart });
    } else {
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
      return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
    }

    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Ensure Product model is loaded
    await import('@/models/Product');
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = new Cart({
        userId: user._id,
        items: [],
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
      if (cart.items[existingItemIndex].quantity > 99) {
        cart.items[existingItemIndex].quantity = 99;
      }
    } else {
      cart.items.push({
        productId: product._id,
        quantity,
        price: product.price,
        addedAt: new Date(),
      });
    }

    // Save changes
    await cart.save();

    // Fetch updated cart with population
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price images slug')
      .lean();

    if (!updatedCart) {
      return NextResponse.json({ error: '장바구니 갱신에 실패했습니다.' }, { status: 500 });
    }

    const validItems = ((updatedCart as any).items || []).filter((item: any) => item && item.productId);
    const totalItems = validItems.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0);
    const totalAmount = validItems.reduce((sum: number, item: any) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);

    const filteredCart = {
      ...updatedCart,
      items: validItems,
      totalItems,
      totalAmount
    };

    return NextResponse.json({
      message: '장바구니에 상품이 추가되었습니다.',
      cart: filteredCart,
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

    // NextAuth 세션으로 사용자 인증
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 사용자 확인
    const user = await User.findOne({ email: session.user.email });
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

    // 업데이트된 장바구니를 populate하여 반환
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price images slug')
      .lean();

    return NextResponse.json({
      message: '장바구니에서 상품이 제거되었습니다.',
      cart: updatedCart,
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