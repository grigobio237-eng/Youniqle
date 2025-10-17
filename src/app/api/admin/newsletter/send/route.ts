import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import { sendNewsletterEmail } from '@/lib/email';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '관리자 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.type !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    await connectDB();

    const { 
      subject, 
      content, 
      targetAudience = 'all',
      tags = [],
      testMode = false 
    } = await request.json();

    if (!subject || !content) {
      return NextResponse.json(
        { error: '제목과 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 대상 구독자 조회
    let filter: any = { 
      status: 'active',
      isVerified: true 
    };

    if (targetAudience === 'tagged' && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    const subscribers = await Newsletter.find(filter).limit(testMode ? 5 : 1000);

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: '발송할 구독자가 없습니다.' },
        { status: 400 }
      );
    }

    // 테스트 모드가 아닌 경우에만 실제 발송
    if (!testMode) {
      const results = [];
      
      for (const subscriber of subscribers) {
        try {
          const result = await sendNewsletterEmail(
            subscriber.email,
            subscriber.name || '고객',
            subject,
            content,
            subscriber.verificationToken
          );

          if (result.success) {
            // 발송 성공 시 통계 업데이트
            await Newsletter.updateOne(
              { _id: subscriber._id },
              { 
                $inc: { emailCount: 1 },
                $set: { lastEmailSent: new Date() }
              }
            );
          }

          results.push({
            email: subscriber.email,
            success: result.success,
            error: result.error
          });
        } catch (error) {
          console.error(`Newsletter send error for ${subscriber.email}:`, error);
          results.push({
            email: subscriber.email,
            success: false,
            error: '발송 실패'
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      return NextResponse.json({
        success: true,
        message: `뉴스레터 발송이 완료되었습니다. (성공: ${successCount}, 실패: ${failCount})`,
        results: {
          total: results.length,
          success: successCount,
          failed: failCount,
          details: results
        }
      });
    } else {
      // 테스트 모드 - 첫 5명에게만 발송
      const testResults = [];
      
      for (const subscriber of subscribers.slice(0, 5)) {
        try {
          const result = await sendNewsletterEmail(
            subscriber.email,
            subscriber.name || '고객',
            `[테스트] ${subject}`,
            content,
            subscriber.verificationToken
          );

          testResults.push({
            email: subscriber.email,
            success: result.success,
            error: result.error
          });
        } catch (error) {
          console.error(`Test newsletter send error for ${subscriber.email}:`, error);
          testResults.push({
            email: subscriber.email,
            success: false,
            error: '발송 실패'
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: '테스트 발송이 완료되었습니다.',
        testMode: true,
        results: {
          total: testResults.length,
          success: testResults.filter(r => r.success).length,
          failed: testResults.filter(r => !r.success).length,
          details: testResults
        }
      });
    }

  } catch (error) {
    console.error('Newsletter send error:', error);
    return NextResponse.json(
      { error: '뉴스레터 발송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
