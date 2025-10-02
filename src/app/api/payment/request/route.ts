import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, productName, buyerName, buyerEmail, buyerTel } = body;

    // 입력값 검증
    if (!orderId || !amount || !productName || !buyerName || !buyerEmail) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 나이스페이 설정
    const merchantId = process.env.NICEPAY_MERCHANT_ID || 'grigobio1m';
    const merchantKey = process.env.NICEPAY_MERCHANT_KEY || '';
    const returnUrl = process.env.NICEPAY_RETURN_URL || '';
    const cancelUrl = process.env.NICEPAY_CANCEL_RETURN_URL || '';

    // 나이스페이 공식 문서 기준 파라미터 생성
    const ediDate = new Date().toISOString()
        .replace(/[-:T.]/g, '').substring(0, 14);
    
    // 서명 생성 (EdiDate + MID + Amt + MerchantKey)
    const signatureData = `${ediDate}${merchantId}${amount}${merchantKey}`;
    const signature = crypto.createHash('sha256')
        .update(signatureData).digest('hex');

    // 인증 요청 파라미터
    const authParams = {
      MID: merchantId,
      Moid: orderId,
      Amt: amount.toString(),
      GoodsName: productName,
      EdiDate: ediDate,
      SignData: signature,
      BuyerName: buyerName,
      BuyerEmail: buyerEmail,
      BuyerTel: buyerTel || '',
      ReturnURL: returnUrl,
      CancelURL: cancelUrl,
      PayMethod: 'CARD',
      CharSet: 'UTF-8',
      Language: 'KOREAN',
      Currency: 'KRW',
    };

    console.log('나이스페이 결제 요청:', {
      orderId,
      amount,
      productName,
      ediDate,
      signature: signature.substring(0, 10) + '...'
    });

    return NextResponse.json({
      success: true,
      authUrl: 'https://web.nicepay.co.kr/v3/v3Payment.jsp',
      formData: authParams,
      resultCode: '0000',
      resultMsg: '인증 요청 URL 생성 성공',
    });

  } catch (error) {
    console.error('나이스페이 인증 요청 에러:', error);
    return NextResponse.json(
      { error: '인증 요청 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}





