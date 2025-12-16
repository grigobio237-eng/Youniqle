import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { earnPoints } from '@/lib/pointManager';

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
    const netCancelURL = formData.get('NetCancelURL') as string;
    const responseSignature = formData.get('Signature') as string;

    console.log('나이스페이 결과 수신:', {
      authResultCode,
      authResultMsg,
      moid,
      amt
    });

    // 인증 성공 여부 확인
    const isAuthSuccess = authResultCode === '0000';

    const merchantKey = process.env.NICEPAY_MERCHANT_KEY || '';

    if (isAuthSuccess && responseSignature) {
      const authSignature = crypto
        .createHash('sha256')
        .update(authToken + mid + amt + merchantKey)
        .digest('hex');

      if (authSignature !== responseSignature) {
        console.error('⚠️ 나이스페이 인증 응답 서명 검증 실패', {
          expected: authSignature,
          received: responseSignature,
        });

        const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/order-failed?orderId=${moid}&error=${encodeURIComponent(
          '인증 응답 무결성 검증에 실패했습니다.'
        )}`;

        const htmlResponse = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>결제 실패</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div style="text-align: center; padding: 50px;">
        <h2>결제 무결성 검증에 실패했습니다</h2>
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
    }

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
        const approvalRequestBody = approvalData.toString();
        let approvalResult = '';
        let approvalResponseOk = true;

        try {
          const response = await fetch(nextAppURL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: approvalRequestBody,
          });

          approvalResponseOk = response.ok;
          approvalResult = await response.text();
        } catch (networkError) {
          approvalResponseOk = false;
          console.error('나이스페이 승인 요청 네트워크 오류:', networkError);
        }

        if (!approvalResponseOk || approvalResult.trim() === '9999' || !approvalResult.trim()) {
          console.error('나이스페이 승인 요청 실패, 망취소 시도', {
            approvalResponseOk,
            approvalResult,
          });

          if (netCancelURL) {
            try {
              const netCancelData = new URLSearchParams(approvalData);
              netCancelData.append('NetCancel', '1');

              const netCancelResponse = await fetch(netCancelURL, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: netCancelData.toString(),
              });

              const netCancelResult = await netCancelResponse.text();
              console.log('나이스페이 망취소 결과:', netCancelResult);
            } catch (netCancelError) {
              console.error('망취소 요청 실패:', netCancelError);
            }
          } else {
            console.warn('망취소 URL이 제공되지 않았습니다.');
          }

          throw new Error('나이스페이 승인 요청에 실패했습니다.');
        }

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
        const resultSignature = approvalDataObj.Signature || approvalDataObj.signature;
        const resultTid = approvalDataObj.TID || approvalDataObj.tid || txTid;
        const resultAmt = approvalDataObj.Amt || approvalDataObj.amt || amt;

        console.log('나이스페이 승인 결과:', {
          resultCode,
          resultMsg,
          payMethodResult
        });

        if (resultSignature) {
          const approvalSignature = crypto
            .createHash('sha256')
            .update(`${resultTid}${mid}${resultAmt}${merchantKey}`)
            .digest('hex');

          if (approvalSignature !== resultSignature) {
            console.error('⚠️ 나이스페이 승인 응답 서명 검증 실패', {
              expected: approvalSignature,
              received: resultSignature,
            });
            throw new Error('승인 응답 무결성 검증에 실패했습니다.');
          }
        }

        // 결제 성공 여부 확인
        let isPaymentSuccess = false;
        switch (payMethodResult) {
          case 'CARD':
            isPaymentSuccess = resultCode === '3001';
            break;
          case 'BANK':
            isPaymentSuccess = resultCode === '4000';
            break;
          case 'CELLPHONE':
            isPaymentSuccess = resultCode === 'A000';
            break;
          case 'VBANK':
            isPaymentSuccess = resultCode === '4100';
            break;
          case 'SSG_BANK':
          case 'CMS_BANK':
            isPaymentSuccess = resultCode === '0000';
            break;
          default:
            isPaymentSuccess = false;
        }

        if (isPaymentSuccess) {
          // DB 연결
          await connectDB();

          // MongoDB 트랜잭션 시작
          const mongoose = await import('mongoose');
          let mongoSession = null;

          try {
            mongoSession = await mongoose.default.startSession();
            mongoSession.startTransaction();
            console.log('🔄 결제 완료 처리 트랜잭션 시작');
          } catch (sessionError) {
            console.warn('⚠️  트랜잭션을 시작할 수 없습니다. 일반 모드로 진행합니다.');
            mongoSession = null;
          }

          try {
            // 주문번호로 주문 찾기
            const order = await Order.findOne({ orderNumber: moid });

            if (order) {
              // 주문 상태 업데이트
              order.paymentStatus = 'completed';
              order.status = 'confirmed';
              order.updatedAt = new Date();
              await order.save(mongoSession ? { session: mongoSession } : {});

              console.log('✅ 주문 상태 업데이트 완료:', moid);

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

                await cart.save(mongoSession ? { session: mongoSession } : {});

                console.log('✅ 장바구니에서 주문한 상품 제거 완료:', orderedProductIds);
              }

              // 포인트 적립 처리 (구매자)
              try {
                const pointResult = await earnPoints(
                  order.userId,
                  order.totalAmount + (order.usedPoints || 0), // 사용한 포인트를 다시 더해서 원래 금액으로 계산
                  `구매 적립 (주문번호: ${order.orderNumber})`,
                  order._id
                );

                if (pointResult.success) {
                  console.log(`✅ 포인트 적립 완료: ${pointResult.earnedPoints}P 적립, 잔액 ${pointResult.newBalance}P`);
                } else {
                  console.error('포인트 적립 실패:', pointResult.error);
                }

                // [추천인 리워드 지급 로직] (2단계: 2% -> 1%)
                // 1. 구매자 정보 조회 (referredBy 확인)
                const User = (await import('@/models/User')).default;
                const buyer = await User.findById(order.userId);

                if (buyer && buyer.referredBy) {
                  // 2. 1단계 추천인 (직접 추천) 찾기
                  const referrerLv1 = await User.findOne({ referralCode: buyer.referredBy });

                  if (referrerLv1) {
                    // 2-1. 1단계 리워드 계산 (결제 금액의 2%)
                    const rewardLv1 = Math.floor(order.totalAmount * 0.02);

                    if (rewardLv1 > 0) {
                      referrerLv1.points = (referrerLv1.points || 0) + rewardLv1;
                      await referrerLv1.save(mongoSession ? { session: mongoSession } : {});
                      console.log(`🎁 1단계 추천인 리워드 지급: ${referrerLv1.email}에게 ${rewardLv1}P 지급 (구매자: ${buyer.name})`);

                      // [FIX] 포인트 내역 기록 (PointTransaction)
                      const PointTransaction = (await import('@/models/PointTransaction')).default;
                      const expiresAt = new Date();
                      expiresAt.setDate(expiresAt.getDate() + 365); // 1년 유효기간

                      await PointTransaction.create([{
                        userId: referrerLv1._id,
                        type: 'earned',
                        amount: rewardLv1,
                        description: `1단계 추천인 리워드 (${buyer.name}님 구매)`,
                        orderId: order._id,
                        balance: referrerLv1.points,
                        expiresAt
                      }], mongoSession ? { session: mongoSession } : {});
                    }

                    // 3. 2단계 추천인 (1단계 추천인의 추천인) 찾기
                    if (referrerLv1.referredBy) {
                      const referrerLv2 = await User.findOne({ referralCode: referrerLv1.referredBy });

                      if (referrerLv2) {
                        // 3-1. 2단계 리워드 계산 (결제 금액의 1%)
                        const rewardLv2 = Math.floor(order.totalAmount * 0.01);

                        if (rewardLv2 > 0) {
                          referrerLv2.points = (referrerLv2.points || 0) + rewardLv2;
                          await referrerLv2.save(mongoSession ? { session: mongoSession } : {});
                          console.log(`🎁 2단계 추천인 리워드 지급: ${referrerLv2.email}에게 ${rewardLv2}P 지급 (1단계: ${referrerLv1.name}, 구매자: ${buyer.name})`);

                          // [FIX] 포인트 내역 기록 (PointTransaction)
                          const PointTransaction = (await import('@/models/PointTransaction')).default;
                          const expiresAt = new Date();
                          expiresAt.setDate(expiresAt.getDate() + 365); // 1년 유효기간

                          await PointTransaction.create([{
                            userId: referrerLv2._id,
                            type: 'earned',
                            amount: rewardLv2,
                            description: `2단계 추천인 리워드 (1단계: ${referrerLv1.name}, 구매자: ${buyer.name})`,
                            orderId: order._id,
                            balance: referrerLv2.points,
                            expiresAt
                          }], mongoSession ? { session: mongoSession } : {});
                        }
                      }
                    }
                  }
                }

              } catch (error) {
                console.error('포인트/리워드 적립 처리 오류:', error);
                // 포인트 적립 실패는 결제 완료를 막지 않음
              }

              // 쿠폰 사용 처리
              if (order.couponCode && order.couponDiscount) {
                try {
                  const { markCouponAsUsed, recordCouponUsage } = await import('@/lib/couponValidator');
                  const Coupon = (await import('@/models/Coupon')).default;

                  // 쿠폰 정보 조회
                  const coupon = await Coupon.findOne({ code: order.couponCode.toUpperCase() });

                  if (coupon) {
                    // 1. CouponUsage 기록 생성
                    const usageRecorded = await recordCouponUsage(
                      coupon._id.toString(),
                      order.userId.toString(),
                      order._id.toString(),
                      order.couponCode,
                      order.couponDiscount,
                      order.totalAmount + order.couponDiscount,
                      order.totalAmount
                    );

                    if (usageRecorded) {
                      console.log(`✅ 쿠폰 사용 기록 생성 완료: ${order.couponCode}`);
                    } else {
                      console.error('쿠폰 사용 기록 생성 실패');
                    }

                    // 2. UserCoupon 상태 업데이트
                    const couponResult = await markCouponAsUsed(
                      order.userId.toString(),
                      order.couponCode,
                      order._id.toString()
                    );

                    if (couponResult.success) {
                      console.log(`✅ 쿠폰 상태 업데이트 완료: ${order.couponCode}`);
                    } else {
                      console.error('쿠폰 상태 업데이트 실패:', couponResult.error);
                    }
                  } else {
                    console.error('쿠폰을 찾을 수 없습니다:', order.couponCode);
                  }
                } catch (error) {
                  console.error('쿠폰 사용 처리 오류:', error);
                  // 쿠폰 사용 처리 실패는 결제 완료를 막지 않음
                }
              }

              // 트랜잭션 커밋
              if (mongoSession) {
                await mongoSession.commitTransaction();
                console.log('✅ 결제 완료 처리 트랜잭션 커밋 완료');
              }
            }
          } catch (paymentProcessError) {
            console.error('결제 처리 중 오류:', paymentProcessError);

            // 트랜잭션 롤백
            if (mongoSession) {
              try {
                await mongoSession.abortTransaction();
                console.log('❌ 결제 처리 트랜잭션 롤백');
              } catch (abortError) {
                console.error('트랜잭션 롤백 오류:', abortError);
              }
            }

            throw paymentProcessError;
          } finally {
            // 트랜잭션 세션 종료
            if (mongoSession) {
              try {
                await mongoSession.endSession();
                console.log('🔚 결제 처리 트랜잭션 세션 종료');
              } catch (endError) {
                console.error('세션 종료 오류:', endError);
              }
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


