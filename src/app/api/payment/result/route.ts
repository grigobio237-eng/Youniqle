import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';

export async function POST(request: NextRequest) {
  try {
    // 나이스페이는 form-data 형식으로 데이터를 전송
    const formData = await request.formData();
    
    // 나이스페이 결과 파라미터 추출
    const authResultCode = formData.get('AuthResultCode') as string;
    const authResultMsg = formData.get('AuthResultMsg') as string;
    const authToken = formData.get('AuthToken') as string;
    const payMethod = formData.get('PayMethod') as string;
    const mid = formData.get('MID') as string;
    const moid = formData.get('Moid') as string;
    const amt = formData.get('Amt') as string;
    const txTid = formData.get('TxTid') as string;
    const nextAppURL = formData.get('NextAppURL') as string;
    
    console.log('나이스페이 결과 수신:', {
      authResultCode,
      authResultMsg,
      moid,
      amt
    });

    // 인증 성공 여부 확인
    const isAuthSuccess = authResultCode === '0000';
    
    if (isAuthSuccess && nextAppURL) {
      try {
        // 승인 요청 로직
        const now = new Date();
        const ediDate = now.getFullYear().toString() +
          (now.getMonth() + 1).toString().padStart(2, '0') +
          now.getDate().toString().padStart(2, '0') +
          now.getHours().toString().padStart(2, '0') +
          now.getMinutes().toString().padStart(2, '0') +
          now.getSeconds().toString().padStart(2, '0');
        
        // 승인 서명 생성 (AuthToken + MID + Amt + EdiDate + MerchantKey)
        const merchantKey = process.env.NICEPAY_MERCHANT_KEY || '';
        const signData = crypto.createHash('sha256')
          .update(authToken + mid + amt + ediDate + merchantKey)
          .digest('hex');
        
        // 승인 요청 데이터 생성
        const approvalData = new URLSearchParams();
        approvalData.append('TID', txTid);
        approvalData.append('AuthToken', authToken);
        approvalData.append('MID', mid);
        approvalData.append('Amt', amt);
        approvalData.append('EdiDate', ediDate);
        approvalData.append('CharSet', 'utf-8');
        approvalData.append('SignData', signData);
        
        console.log('나이스페이 승인 요청:', {
          TID: txTid,
          MID: mid,
          Amt: amt,
          nextAppURL
        });

        // 승인 요청 전송
        const response = await fetch(nextAppURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: approvalData.toString(),
        });
        
        const approvalResult = await response.text();
        
        // 승인 결과 파싱
        let approvalDataObj: any = {};
        try {
          approvalDataObj = JSON.parse(approvalResult);
        } catch (error) {
          const params = new URLSearchParams(approvalResult);
          approvalDataObj = Object.fromEntries(params);
        }
        
        const resultCode = approvalDataObj.ResultCode || approvalDataObj.resultCode;
        const resultMsg = approvalDataObj.ResultMsg || approvalDataObj.resultMsg;
        const payMethodResult = approvalDataObj.PayMethod || approvalDataObj.payMethod;
        
        console.log('나이스페이 승인 결과:', {
          resultCode,
          resultMsg,
          payMethodResult
        });

        // 결제 성공 여부 확인
        let isPaymentSuccess = false;
        if (payMethodResult === 'CARD' && resultCode === '3001') {
          isPaymentSuccess = true; // 신용카드
        } else if (payMethodResult === 'BANK' && resultCode === '4000') {
          isPaymentSuccess = true; // 계좌이체
        } else if (payMethodResult === 'CELLPHONE' && resultCode === 'A000') {
          isPaymentSuccess = true; // 휴대폰
        } else if (payMethodResult === 'VBANK' && resultCode === '4100') {
          isPaymentSuccess = true; // 가상계좌
        }
        
        if (isPaymentSuccess) {
          // DB 연결 및 주문 상태 업데이트
          await connectDB();
          
          // 주문번호로 주문 찾기
          const order = await Order.findOne({ orderNumber: moid });
          
          if (order) {
            // 주문 상태 업데이트
            order.paymentStatus = 'completed';
            order.status = 'confirmed';
            order.updatedAt = new Date();
            await order.save();
            
            console.log('주문 상태 업데이트 완료:', moid);

            // 결제 완료 후 주문한 상품만 장바구니에서 제거
            const Cart = (await import('@/models/Cart')).default;
            const cart = await Cart.findOne({ userId: order.userId });
            
            if (cart) {
              // 주문한 상품 ID 목록
              const orderedProductIds = order.items.map((item: any) => item.productId.toString());
              
              // 주문하지 않은 상품만 남기기
              const remainingItems = cart.items.filter((item: any) => 
                !orderedProductIds.includes(item.productId.toString())
              );
              
              cart.items = remainingItems;
              cart.totalItems = remainingItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
              cart.totalAmount = remainingItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
              
              await cart.save();
              
              console.log('장바구니에서 주문한 상품 제거 완료:', orderedProductIds);
            }
          }

          // 결제 성공 시 HTML 응답으로 리다이렉트
          const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/order-success?orderId=${moid}&amount=${amt}&tid=${txTid}`;
          
          const htmlResponse = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>결제 완료</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 400px;
        }
        h2 {
            color: #10b981;
            margin-bottom: 10px;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>✓ 결제가 성공적으로 완료되었습니다!</h2>
        <div class="spinner"></div>
        <p>잠시 후 주문 완료 페이지로 이동합니다...</p>
    </div>
    <script>
        setTimeout(function() {
            window.location.href = '${redirectUrl}';
        }, 2000);
    </script>
</body>
</html>`;
          
          return new Response(htmlResponse, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        } else {
          // 결제 실패 시 처리
          const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/order-failed?orderId=${moid}&error=${encodeURIComponent(resultMsg)}`;
          
          const htmlResponse = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>결제 실패</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 400px;
        }
        h2 {
            color: #ef4444;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>✗ 결제가 실패했습니다</h2>
        <p>잠시 후 주문 페이지로 이동합니다...</p>
    </div>
    <script>
        setTimeout(function() {
            window.location.href = '${redirectUrl}';
        }, 2000);
    </script>
</body>
</html>`;
          
          return new Response(htmlResponse, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }
        
      } catch (approvalError) {
        console.error('승인 요청 오류:', approvalError);
        
        const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/order-failed?orderId=${moid}&error=${encodeURIComponent('승인 처리 중 오류가 발생했습니다.')}`;
        
        const htmlResponse = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>결제 오류</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div style="text-align: center; padding: 50px;">
        <h2>결제 처리 중 오류가 발생했습니다</h2>
        <p>잠시 후 주문 페이지로 이동합니다...</p>
        <script>
            setTimeout(function() {
                window.location.href = '${redirectUrl}';
            }, 2000);
        </script>
    </div>
</body>
</html>`;
        
        return new Response(htmlResponse, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
    } else {
      // 인증 실패 시 처리
      const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/order-cancelled?orderId=${moid}&error=${encodeURIComponent(authResultMsg)}`;
      
      const htmlResponse = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>결제 취소</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #ffa500 0%, #ff6347 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 400px;
        }
        h2 {
            color: #f59e0b;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>⚠ 결제가 취소되었습니다</h2>
        <p>잠시 후 주문 페이지로 이동합니다...</p>
    </div>
    <script>
        setTimeout(function() {
            window.location.href = '${redirectUrl}';
        }, 2000);
    </script>
</body>
</html>`;
      
      return new Response(htmlResponse, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    
  } catch (error) {
    console.error('결제 결과 처리 오류:', error);
    return NextResponse.json(
      { success: false, message: '결제 결과 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


