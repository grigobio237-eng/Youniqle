import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { InventoryManager } from '@/lib/inventoryManagement';
import { AutomationRuleManager } from '@/lib/automationRules';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // NextAuth 세션으로 사용자 인증
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 사용자 확인
    const User = require('@/models/User').default;
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 사용자의 주문 내역 조회
    const orders = await Order.find({ userId: user._id })
      .populate({
        path: 'items.productId',
        select: 'name images price category'
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('주문 내역 조회 오류:', error);
    return NextResponse.json(
      {
        error: '주문 내역 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // MongoDB 세션 변수
  let mongoSession = null;

  try {
    const body = await request.json();
    const { items, shippingAddress, paymentMethod, totalAmount, usedPoints, couponDiscount, couponCode } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: '주문 상품이 없습니다.' }, { status: 400 });
    }

    if (!shippingAddress || !paymentMethod || !totalAmount) {
      return NextResponse.json({ error: '필수 주문 정보가 누락되었습니다.' }, { status: 400 });
    }

    await connectDB();

    // MongoDB 트랜잭션 시작 (replica set이 구성된 경우에만 작동)
    const mongoose = (await import('mongoose')).default;
    try {
      mongoSession = await mongoose.startSession();
      mongoSession.startTransaction();
      console.log('🔄 트랜잭션 시작');
    } catch (sessionError) {
      console.warn('⚠️  트랜잭션을 시작할 수 없습니다 (replica set 미구성). 일반 모드로 진행합니다.');
      mongoSession = null;
    }

    // NextAuth 세션으로 사용자 인증
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 사용자 확인
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 재고 확인 (단순화)
    // 유효성 검사 및 데이터 백업을 거친 새로운 아이템 배열
    const validatedItems = [];
    const Product = (await import('@/models/Product')).default;

    for (const item of items) {
      // Founder Pass 등 가상 상품은 예외 처리
      if (typeof item.productId === 'string' && item.productId.startsWith('founder-')) {
        validatedItems.push(item);
        continue;
      }

      // productId가 객체(ObjectId)일 경우 문자열로 변환하여 처리
      const productIdStr = typeof item.productId === 'object' ? item.productId.toString() : item.productId;

      const product = await Product.findById(productIdStr);

      if (!product) {
        return NextResponse.json({
          error: `상품을 찾을 수 없습니다: ${productIdStr}`
        }, { status: 400 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({
          error: `재고가 부족합니다. (가능: ${product.stock}개, 요청: ${item.quantity}개)`
        }, { status: 400 });
      }

      // 💥 핵심: 상품 정보 백업 (이미지, 이름, 파트너ID)
      validatedItems.push({
        productId: product._id, // 문자열일 수 있으므로 ID 객체로 변환
        quantity: item.quantity,
        price: product.price, // 가격 변조 방지: DB 가격 사용
        name: product.name,   // 이름 백업
        imageUrl: product.images?.[0]?.url || product.images?.[0] || '', // 이미지 URL 백업
        partnerId: product.partnerId
      });
    }

    // 쿠폰 재검증 (주문 생성 시점에 다시 확인)
    let validatedCouponDiscount = 0;
    let validatedCouponCode: string | undefined = undefined;

    if (couponCode && couponDiscount && couponDiscount > 0) {
      try {
        const { validateCoupon } = await import('@/lib/couponValidator');

        // 장바구니 항목을 검증용 형식으로 변환
        const cartItemsForValidation = await Promise.all(items.map(async (item: any) => {
          const product = await Product.findById(item.productId);
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            category: product?.category
          };
        }));

        // 쿠폰 재검증
        const couponValidation = await validateCoupon({
          code: couponCode,
          userId: user._id.toString(),
          cartItems: cartItemsForValidation,
          totalAmount: totalAmount + couponDiscount // 할인 전 금액으로 검증
        });

        if (!couponValidation.isValid) {
          return NextResponse.json(
            { error: `쿠폰 검증 실패: ${couponValidation.error}` },
            { status: 400 }
          );
        }

        // 클라이언트에서 보낸 할인 금액과 서버에서 계산한 할인 금액 비교
        if (couponValidation.discountAmount !== couponDiscount) {
          console.warn(
            `쿠폰 할인 금액 불일치: 클라이언트=${couponDiscount}, 서버=${couponValidation.discountAmount}`
          );
          // 서버에서 계산한 값을 사용
          validatedCouponDiscount = couponValidation.discountAmount || 0;
        } else {
          validatedCouponDiscount = couponDiscount;
        }

        validatedCouponCode = couponCode;

        console.log(`쿠폰 재검증 완료: ${couponCode}, 할인 ${validatedCouponDiscount}원`);
      } catch (error) {
        console.error('쿠폰 재검증 오류:', error);
        return NextResponse.json(
          { error: '쿠폰 검증 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
    }

    // 주문번호 생성 (YYYYMMDD + 랜덤 6자리)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `${dateStr}${randomStr}`;

    // 주문 생성
    const order = new Order({
      userId: user._id,
      orderNumber,
      items: validatedItems,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress,
      paymentMethod,
      usedPoints: usedPoints || 0,
      couponDiscount: validatedCouponDiscount,
      couponCode: validatedCouponCode
    });

    // 트랜잭션 세션과 함께 저장
    await order.save(mongoSession ? { session: mongoSession } : {});
    console.log(`✅ 주문 생성 완료: ${orderNumber}`);

    // 포인트 사용 처리
    if (usedPoints && usedPoints > 0) {
      try {
        const { deductPoints } = await import('@/lib/pointManager');
        const pointResult = await deductPoints(
          user._id,
          usedPoints,
          `주문 사용 (주문번호: ${orderNumber})`,
          order._id
        );

        if (!pointResult.success) {
          console.error('포인트 사용 실패:', pointResult.error);
          // 트랜잭션 롤백
          if (mongoSession) {
            await mongoSession.abortTransaction();
            console.log('❌ 트랜잭션 롤백 (포인트 사용 실패)');
          } else {
            // 트랜잭션이 없는 경우 수동으로 주문 삭제
            await Order.findByIdAndDelete(order._id);
          }
          return NextResponse.json(
            { error: pointResult.error },
            { status: 400 }
          );
        }

        console.log(`✅ 포인트 사용 완료: ${pointResult.usedPoints}P 사용, 잔액 ${pointResult.newBalance}P`);
      } catch (error) {
        console.error('포인트 사용 처리 오류:', error);
        // 트랜잭션 롤백
        if (mongoSession) {
          await mongoSession.abortTransaction();
          console.log('❌ 트랜잭션 롤백 (포인트 처리 오류)');
        } else {
          // 트랜잭션이 없는 경우 수동으로 주문 삭제
          await Order.findByIdAndDelete(order._id);
        }
        return NextResponse.json(
          { error: '포인트 사용 처리 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
    }

    // 트랜잭션 커밋
    if (mongoSession) {
      await mongoSession.commitTransaction();
      console.log('✅ 트랜잭션 커밋 완료');
    }

    // 자동화 규칙 실행 (트랜잭션 밖에서)
    try {
      await AutomationRuleManager.executeOrderRules(order);
    } catch (error) {
      console.error('자동화 규칙 실행 오류:', error);
      // 자동화 규칙 실패는 주문 생성을 막지 않음
    }

    // 생성된 주문을 상품 정보와 함께 조회
    const savedOrder = await Order.findById(order._id)
      .populate({
        path: 'items.productId',
        select: 'name images price category'
      });

    return NextResponse.json({
      message: '주문이 성공적으로 생성되었습니다.',
      order: savedOrder
    }, { status: 201 });

  } catch (error) {
    console.error('주문 생성 오류:', error);

    // 트랜잭션 롤백
    if (mongoSession) {
      try {
        await mongoSession.abortTransaction();
        console.log('❌ 트랜잭션 롤백 (주문 생성 오류)');
      } catch (abortError) {
        console.error('트랜잭션 롤백 오류:', abortError);
      }
    }

    return NextResponse.json(
      {
        error: '주문 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  } finally {
    // 트랜잭션 세션 종료
    if (mongoSession) {
      try {
        await mongoSession.endSession();
        console.log('🔚 트랜잭션 세션 종료');
      } catch (endError) {
        console.error('세션 종료 오류:', endError);
      }
    }
  }
}
