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
        console.error('⚠️ 나이스페이 인증 응답 서명 검증 실패');
        const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/order-failed?orderId=${moid}&error=${encodeURIComponent(
          '인증 응답 무결성 검증에 실패했습니다.'
        )}`;
        return new Response(createRedirectHtml(redirectUrl, '결제 무결성 검증 실패'), {
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

        const signData = crypto.createHash('sha256')
          .update(authToken + mid + amt + ediDate + merchantKey)
          .digest('hex');

        const approvalData = new URLSearchParams();
        approvalData.append('TID', txTid);
        approvalData.append('AuthToken', authToken);
        approvalData.append('MID', mid);
        approvalData.append('Amt', amt);
        approvalData.append('EdiDate', ediDate);
        approvalData.append('CharSet', 'utf-8');
        approvalData.append('SignData', signData);

        const response = await fetch(nextAppURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: approvalData.toString(),
        });

        const approvalResult = await response.text();
        if (!response.ok || approvalResult.trim() === '9999' || !approvalResult.trim()) {
          // 망취소 처리 (생략 가능하나 일단 유지)
          throw new Error('나이스페이 승인 요청에 실패했습니다.');
        }

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
        const resultTid = approvalDataObj.TID || approvalDataObj.tid || txTid;
        const resultAmt = approvalDataObj.Amt || approvalDataObj.amt || amt;

        let isPaymentSuccess = false;
        switch (payMethodResult) {
          case 'CARD': isPaymentSuccess = resultCode === '3001'; break;
          case 'BANK': isPaymentSuccess = resultCode === '4000'; break;
          case 'CELLPHONE': isPaymentSuccess = resultCode === 'A000'; break;
          case 'VBANK': isPaymentSuccess = resultCode === '4100'; break;
          default: isPaymentSuccess = resultCode === '0000';
        }

        if (isPaymentSuccess) {
          await connectDB();
          const mongoose = await import('mongoose');
          let mongoSession = null;

          try {
            mongoSession = await mongoose.default.startSession();
            mongoSession.startTransaction();
          } catch (e) { mongoSession = null; }

          try {
            const order = await Order.findOne({ orderNumber: moid });
            if (order) {
              order.paymentStatus = 'completed';
              order.status = 'confirmed';
              await order.save(mongoSession ? { session: mongoSession } : {});

              // 장바구니 정리
              const Cart = (await import('@/models/Cart')).default;
              const cart = await Cart.findOne({ userId: order.userId });
              if (cart) {
                const orderedProductIds = order.items.map((item: any) => item.productId.toString());
                cart.items = cart.items.filter((item: any) => !orderedProductIds.includes(item.productId.toString()));
                cart.totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
                cart.totalAmount = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
                await cart.save(mongoSession ? { session: mongoSession } : {});
              }

              // 포인트 및 등급 처리
              try {
                await earnPoints(order.userId, order.totalAmount + (order.usedPoints || 0), `구매 적립 (${order.orderNumber})`, order._id);

                const User = (await import('@/models/User')).default;
                const buyer = await User.findById(order.userId);

                if (buyer) {
                  // Founder Pass 등급 상향
                  const founderItem = order.items.find((item: any) => typeof item.productId === 'string' && item.productId.startsWith('founder-'));
                  if (founderItem) {
                    const gradeType = founderItem.productId.split('-')[1];
                    if (['essence', 'balance', 'miracle'].includes(gradeType)) {
                      buyer.grade = gradeType;
                      await buyer.save(mongoSession ? { session: mongoSession } : {});
                      console.log(`🎊 등급 상향 완료: ${buyer.email} -> ${gradeType}`);
                    }
                  }

                  // 추천인 보상
                  if (buyer.referredBy) {
                    const referrerLv1 = await User.findOne({ referralCode: buyer.referredBy });
                    if (referrerLv1) {
                      const reward1 = Math.floor(order.totalAmount * 0.02);
                      if (reward1 > 0) {
                        referrerLv1.points = (referrerLv1.points || 0) + reward1;
                        await referrerLv1.save(mongoSession ? { session: mongoSession } : {});
                        const PT = (await import('@/models/PointTransaction')).default;
                        await PT.create([{
                          userId: referrerLv1._id, type: 'earned', amount: reward1, description: `추천보상1단계 (${buyer.name})`,
                          orderId: order._id, balance: referrerLv1.points, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                        }], mongoSession ? { session: mongoSession } : {});
                      }
                      if (referrerLv1.referredBy) {
                        const referrerLv2 = await User.findOne({ referralCode: referrerLv1.referredBy });
                        if (referrerLv2) {
                          const reward2 = Math.floor(order.totalAmount * 0.01);
                          if (reward2 > 0) {
                            referrerLv2.points = (referrerLv2.points || 0) + reward2;
                            await referrerLv2.save(mongoSession ? { session: mongoSession } : {});
                            const PT = (await import('@/models/PointTransaction')).default;
                            await PT.create([{
                              userId: referrerLv2._id, type: 'earned', amount: reward2, description: `추천보상2단계 (${buyer.name})`,
                              orderId: order._id, balance: referrerLv2.points, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                            }], mongoSession ? { session: mongoSession } : {});
                          }
                        }
                      }
                    }
                  }
                }
              } catch (e) { console.error('Reward error:', e); }

              // 쿠폰 처리
              if (order.couponCode && order.couponDiscount) {
                try {
                  const { markCouponAsUsed, recordCouponUsage } = await import('@/lib/couponValidator');
                  const Coupon = (await import('@/models/Coupon')).default;
                  const c = await Coupon.findOne({ code: order.couponCode.toUpperCase() });
                  if (c) {
                    await recordCouponUsage(c._id.toString(), order.userId.toString(), order._id.toString(), order.couponCode, order.couponDiscount, order.totalAmount + order.couponDiscount, order.totalAmount);
                    await markCouponAsUsed(order.userId.toString(), order.couponCode, order._id.toString());
                  }
                } catch (e) { console.error('Coupon error:', e); }
              }

              if (mongoSession) await mongoSession.commitTransaction();
            }
          } catch (error) {
            if (mongoSession) await mongoSession.abortTransaction();
            throw error;
          } finally {
            if (mongoSession) await mongoSession.endSession();
          }

          const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/order-success?orderId=${moid}&amount=${amt}&tid=${txTid}`;
          return new Response(createSuccessHtml(redirectUrl), {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        } else {
          const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/order-failed?orderId=${moid}&error=${encodeURIComponent(resultMsg)}`;
          return new Response(createRedirectHtml(redirectUrl, '결제 실패'), {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }
      } catch (error) {
        console.error('Approval error:', error);
        const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/order-failed?orderId=${moid}&error=ApprovalError`;
        return new Response(createRedirectHtml(redirectUrl, '결제 오류'), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
    } else {
      const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/order-cancelled?orderId=${moid}&error=${encodeURIComponent(authResultMsg)}`;
      return new Response(createRedirectHtml(redirectUrl, '결제 취소'), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
  } catch (error) {
    console.error('Core error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

function createRedirectHtml(url: string, title: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
  <body><div style="text-align:center;padding:50px;"><h2>${title}</h2><p>잠시 후 이동합니다...</p><script>setTimeout(function(){window.location.href='${url}';},2000);</script></div></body></html>`;
}

function createSuccessHtml(url: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>결제 완료</title><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>body{font-family:sans-serif;background:#f3f4f6;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}.container{background:white;padding:40px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.1);text-align:center;max-width:400px;}h2{color:#10b981;}</style></head>
  <body><div class="container"><h2>✓ 결제 성공!</h2><p>잠시 후 주문 완료 페이지로 이동합니다...</p></div><script>setTimeout(function(){window.location.href='${url}';},2000);</script></body></html>`;
}
