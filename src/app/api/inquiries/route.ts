import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Inquiry from '@/models/Inquiry';

/**
 * POST /api/inquiries
 * 
 * 새로운 문의를 생성합니다.
 * 
 * Request Body:
 * {
 *   "inquiryId": "문의 ID",
 *   "userEmail": "사용자 이메일",
 *   "userName": "사용자 이름",
 *   "type": "문의 유형",
 *   "subject": "문의 제목",
 *   "content": "문의 내용",
 *   "source": "문의 출처"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {...},
 *   "message": "문의가 성공적으로 생성되었습니다."
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Create Inquiry API] 요청 수신');

    // Request Body 파싱
    const body = await request.json();
    const { 
      inquiryId, 
      userEmail, 
      userName, 
      type, 
      subject, 
      content, 
      source = 'api' 
    } = body;

    // 입력 검증
    if (!inquiryId) {
      return NextResponse.json(
        {
          success: false,
          error: 'inquiryId 필드가 필요합니다.'
        },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'userEmail 필드가 필요합니다.'
        },
        { status: 400 }
      );
    }

    if (!userName) {
      return NextResponse.json(
        {
          success: false,
          error: 'userName 필드가 필요합니다.'
        },
        { status: 400 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        {
          success: false,
          error: 'subject 필드가 필요합니다.'
        },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error: 'content 필드가 필요합니다.'
        },
        { status: 400 }
      );
    }

    console.log(`[Create Inquiry API] 문의 생성 시작: ${inquiryId}`);

    // 데이터베이스 연결
    await connectDB();

    // 중복 문의 확인
    const existingInquiry = await Inquiry.findOne({ inquiryId });
    if (existingInquiry) {
      console.log(`[Create Inquiry API] 문의가 이미 존재함: ${inquiryId}`);
      return NextResponse.json({
        success: true,
        data: existingInquiry,
        message: '문의가 이미 존재합니다.',
        isExisting: true
      });
    }

    // 새 문의 생성
    const inquiry = new Inquiry({
      inquiryId,
      userEmail,
      userName,
      type: type || 'general',
      subject,
      content,
      status: 'pending',
      priority: 'medium',
      source: source || 'api',
      tags: ['api-created']
    });

    await inquiry.save();

    console.log(`[Create Inquiry API] 문의 생성 완료: ${inquiryId}`);

    return NextResponse.json({
      success: true,
      data: {
        inquiryId: inquiry.inquiryId,
        userEmail: inquiry.userEmail,
        userName: inquiry.userName,
        type: inquiry.type,
        subject: inquiry.subject,
        content: inquiry.content,
        status: inquiry.status,
        priority: inquiry.priority,
        source: inquiry.source,
        createdAt: inquiry.createdAt
      },
      message: '문의가 성공적으로 생성되었습니다.'
    });

  } catch (error) {
    console.error('[Create Inquiry API] 오류:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '내부 서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/inquiries
 * 
 * API 상태 확인
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Create Inquiry API is running',
    endpoint: '/api/inquiries',
    method: 'POST',
    requiredFields: ['inquiryId', 'userEmail', 'userName', 'subject', 'content']
  });
}



