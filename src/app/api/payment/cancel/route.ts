import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import iconv from 'iconv-lite';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, tid, amount, reason, partialCancelCode } = body;

    // 입력값 검증
    if (!tid || !amount) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 나이스페이 설정
    const merchantId = process.env.NICEPAY_MERCHANT_ID || 'grigobio1m';
    const merchantKey = process.env.NICEPAY_MERCHANT_KEY || '';

    // 취소 요청 파라미터 생성
    const now = new Date();
    const ediDate = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');

    // 취소 서명 생성 (MID + CancelAmt + EdiDate + MerchantKey)
    const signatureData = `${merchantId}${amount}${ediDate}${merchantKey}`;
    const signature = crypto.createHash('sha256')
      .update(signatureData).digest('hex');

    const cancelMessage = reason && reason.trim() ? reason.trim() : '사용자 요청 취소';
    const partialCode = partialCancelCode === '1' || partialCancelCode === 1 ? '1' : '0';

    const encodeEucKr = (value: string) => {
      const buffer = iconv.encode(value, 'euc-kr');
      let result = '';
      for (const byte of buffer) {
        const char = String.fromCharCode(byte);
        if (
          (byte >= 0x30 && byte <= 0x39) || // 0-9
          (byte >= 0x41 && byte <= 0x5a) || // A-Z
          (byte >= 0x61 && byte <= 0x7a) || // a-z
          char === '-' ||
          char === '_' ||
          char === '.' ||
          char === '~'
        ) {
          result += char;
        } else {
          result += `%${byte.toString(16).toUpperCase().padStart(2, '0')}`;
        }
      }
      return result;
    };

    const cancelPayload = [
      `TID=${encodeURIComponent(tid)}`,
      `MID=${encodeURIComponent(merchantId)}`,
      `Moid=${encodeURIComponent(orderId || '')}`,
      `CancelAmt=${encodeURIComponent(amount.toString())}`,
      `CancelMsg=${encodeEucKr(cancelMessage)}`,
      `PartialCancelCode=${encodeURIComponent(partialCode)}`,
      `EdiDate=${encodeURIComponent(ediDate)}`,
      `CharSet=${encodeURIComponent('utf-8')}`,
      `SignData=${encodeURIComponent(signature)}`,
    ].join('&');

    console.log('나이스페이 취소 요청:', {
      TID: tid,
      MID: merchantId,
      CancelAmt: amount,
      reason
    });

    // 나이스페이 취소 API 호출
    const response = await fetch('https://webapi.nicepay.co.kr/webapi/cancel_process.jsp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: cancelPayload,
    });

    const cancelResult = await response.text();
    
    // 취소 결과 파싱
    let cancelDataObj: any = {};
    try {
      cancelDataObj = JSON.parse(cancelResult);
    } catch (error) {
      const params = new URLSearchParams(cancelResult);
      cancelDataObj = Object.fromEntries(params);
    }

    const resultCode = cancelDataObj.ResultCode || cancelDataObj.resultCode;
    const resultMsg = cancelDataObj.ResultMsg || cancelDataObj.resultMsg;

    console.log('나이스페이 취소 결과:', {
      resultCode,
      resultMsg
    });

    if (resultCode === '2001') {
      // 취소 성공 - 주문 상태 업데이트
      if (orderId) {
        await connectDB();
        const order = await Order.findOne({ orderNumber: orderId });
        
        if (order) {
          if (partialCode === '1') {
            order.paymentStatus = 'completed';
            console.log('부분 취소 처리 완료:', orderId);
          } else {
            order.paymentStatus = 'failed';
            order.status = 'cancelled';
            console.log('주문 취소 완료:', orderId);
          }
          order.updatedAt = new Date();
          await order.save();
        }
      }

      return NextResponse.json({
        success: true,
        message:
          partialCode === '1'
            ? '결제가 부분 취소되었습니다.'
            : '결제가 성공적으로 취소되었습니다.',
        resultCode,
        resultMsg,
        partialCancel: partialCode === '1',
      });
    } else {
      // 취소 실패
      return NextResponse.json({
        success: false,
        message: '결제 취소에 실패했습니다.',
        resultCode,
        resultMsg,
      }, { status: 400 });
    }

  } catch (error) {
    console.error('결제 취소 오류:', error);
    return NextResponse.json(
      { error: '결제 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}






