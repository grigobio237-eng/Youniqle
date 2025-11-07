import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

// 카드번호 마스킹 (마지막 4자리만 표시)
const maskCardNumber = (cardNumber: string): string => {
  const last4 = cardNumber.slice(-4);
  return `****-****-****-${last4}`;
};

// 카드번호 암호화 (간단한 예시, 실제로는 더 강력한 암호화 필요)
const encryptCardNumber = (cardNumber: string): string => {
  // 실제 프로덕션에서는 더 강력한 암호화 알고리즘 사용 (AES-256 등)
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-chars-long!!!', 'utf8');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(cardNumber, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

// 카드번호 복호화
const decryptCardNumber = (encrypted: string): string => {
  try {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-chars-long!!!', 'utf8');
    const parts = encrypted.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('카드번호 복호화 오류:', error);
    return '';
  }
};

// 결제 수단 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 결제 수단 목록 반환 (마스킹된 카드번호)
    const paymentMethods = (user.paymentMethods || []).map((method: any) => ({
      _id: method._id,
      cardType: method.cardType,
      cardHolder: method.cardHolder,
      expiryMonth: method.expiryMonth,
      expiryYear: method.expiryYear,
      isDefault: method.isDefault,
      cardNumber: maskCardNumber(decryptCardNumber(method.encryptedCardNumber || '')),
      last4: method.last4,
    }));

    return NextResponse.json({
      success: true,
      paymentMethods,
    });
  } catch (error: any) {
    console.error('결제 수단 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '결제 수단 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 결제 수단 추가
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { cardNumber, cardHolder, expiryMonth, expiryYear, cardType, isDefault, last4 } = await request.json();

    if (!cardNumber || !cardHolder || !expiryMonth || !expiryYear) {
      return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 카드번호 암호화
    const encryptedCardNumber = encryptCardNumber(cardNumber);

    const newPaymentMethod = {
      cardType: cardType || 'other',
      cardHolder,
      expiryMonth,
      expiryYear,
      encryptedCardNumber,
      last4: last4 || cardNumber.slice(-4),
      isDefault: isDefault || false,
    };

    // 기본 결제 수단으로 설정하는 경우, 기존 기본 결제 수단 해제
    if (isDefault && user.paymentMethods && user.paymentMethods.length > 0) {
      user.paymentMethods.forEach((method: any) => {
        method.isDefault = false;
      });
    } else if (!user.paymentMethods || user.paymentMethods.length === 0) {
      // 첫 번째 결제 수단은 자동으로 기본 결제 수단
      newPaymentMethod.isDefault = true;
    }

    if (!user.paymentMethods) {
      user.paymentMethods = [];
    }

    user.paymentMethods.push(newPaymentMethod);
    await user.save();

    return NextResponse.json({
      success: true,
      message: '결제 수단이 추가되었습니다.',
      paymentMethod: {
        ...newPaymentMethod,
        cardNumber: maskCardNumber(cardNumber),
        encryptedCardNumber: undefined, // 클라이언트에 반환하지 않음
      },
    });
  } catch (error: any) {
    console.error('결제 수단 추가 오류:', error);
    return NextResponse.json(
      { error: error.message || '결제 수단 추가에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 결제 수단 삭제
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { paymentMethodId } = await request.json();

    if (!paymentMethodId) {
      return NextResponse.json({ error: '결제 수단 ID가 필요합니다.' }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user || !user.paymentMethods) {
      return NextResponse.json({ error: '사용자 또는 결제 수단을 찾을 수 없습니다.' }, { status: 404 });
    }

    const index = user.paymentMethods.findIndex((method: any) => 
      method._id?.toString() === paymentMethodId
    );

    if (index === -1) {
      return NextResponse.json({ error: '결제 수단을 찾을 수 없습니다.' }, { status: 404 });
    }

    const wasDefault = user.paymentMethods[index].isDefault;

    user.paymentMethods.splice(index, 1);

    // 기본 결제 수단이 삭제된 경우, 첫 번째 결제 수단을 기본으로 설정
    if (wasDefault && user.paymentMethods.length > 0) {
      user.paymentMethods[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: '결제 수단이 삭제되었습니다.',
    });
  } catch (error: any) {
    console.error('결제 수단 삭제 오류:', error);
    return NextResponse.json(
      { error: error.message || '결제 수단 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

