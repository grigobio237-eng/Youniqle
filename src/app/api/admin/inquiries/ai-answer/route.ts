import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Inquiry from '@/models/Inquiry';

/**
 * POST /api/admin/inquiries/ai-answer
 * 
 * AI가 생성한 답변을 문의에 저장합니다.
 * 
 * Request Body:
 * {
 *   "inquiryId": "문의 ID",
 *   "answer": "AI 답변 내용",
 *   "aiModel": "gemini-2.5-flash",
 *   "confidence": 0.95,
 *   "needsReview": true,
 *   "metadata": {...}
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {...},
 *   "message": "AI 답변이 성공적으로 저장되었습니다."
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[AI Answer API] 요청 수신');

    // API 키 검증
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.N8N_API_KEY || 'test-api-key-12345';
    
    console.log('[AI Answer API] API 키 검증:', { 
      provided: apiKey,
      expected: validApiKey,
      match: apiKey === validApiKey,
      providedLength: apiKey ? apiKey.length : 0,
      expectedLength: validApiKey.length
    });
    
    if (!apiKey || apiKey !== validApiKey) {
      console.log('[AI Answer API] 인증 실패:', { 
        apiKey: apiKey ? 'provided' : 'missing',
        expected: validApiKey 
      });
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 API 키입니다.'
        },
        { status: 401 }
      );
    }

    // Request Body 파싱
    const body = await request.json();
    const { inquiryId, answer, aiModel, confidence, needsReview, metadata } = body;

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

    if (!answer) {
      return NextResponse.json(
        {
          success: false,
          error: 'answer 필드가 필요합니다.'
        },
        { status: 400 }
      );
    }

    console.log(`[AI Answer API] 문의 ID: ${inquiryId}, 답변 길이: ${answer.length}`);

    // 데이터베이스 연결
    await connectDB();

    // 문의 찾기
    const inquiry = await Inquiry.findOne({ inquiryId });
    if (!inquiry) {
      console.log(`[AI Answer API] 문의를 찾을 수 없음: ${inquiryId}`);
      return NextResponse.json(
        {
          success: false,
          error: '해당 문의를 찾을 수 없습니다.'
        },
        { status: 404 }
      );
    }

    // AI 답변 업데이트
    inquiry.aiAnswer = answer;
    inquiry.aiGeneratedAt = new Date();
    inquiry.aiModel = aiModel || 'gemini-2.5-flash';
    inquiry.aiConfidence = confidence || 0.5;
    inquiry.aiNeedsReview = needsReview !== undefined ? needsReview : true;
    
    // 상태 업데이트 (AI 답변이 있으면 in_progress로 변경)
    if (inquiry.status === 'pending') {
      inquiry.status = 'in_progress';
    }

    // 메타데이터 추가
    if (metadata) {
      inquiry.tags = [...(inquiry.tags || []), 'ai-generated'];
      if (metadata.responseLength) {
        inquiry.tags.push(`response-length-${metadata.responseLength}`);
      }
      if (metadata.geminiResponse) {
        inquiry.tags.push('gemini-response');
      }
    }

    await inquiry.save();

    console.log(`[AI Answer API] AI 답변 저장 완료: ${inquiryId}`);

    return NextResponse.json({
      success: true,
      data: {
        inquiryId: inquiry.inquiryId,
        status: inquiry.status,
        aiAnswer: inquiry.aiAnswer,
        aiGeneratedAt: inquiry.aiGeneratedAt,
        aiModel: inquiry.aiModel,
        aiConfidence: inquiry.aiConfidence,
        aiNeedsReview: inquiry.aiNeedsReview
      },
      message: 'AI 답변이 성공적으로 저장되었습니다.'
    });

  } catch (error) {
    console.error('[AI Answer API] 오류:', error);
    
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
 * GET /api/admin/inquiries/ai-answer
 * 
 * API 상태 확인
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'AI Answer API is running',
    endpoint: '/api/admin/inquiries/ai-answer',
    method: 'POST',
    requiredFields: ['inquiryId', 'answer'],
    requiredHeaders: ['x-api-key']
  });
}
