import { NextRequest, NextResponse } from 'next/server';
import { searchSimilarDocuments } from '@/lib/ai/chroma-client';

/**
 * POST /api/ai/search-context
 * 
 * 임베딩 벡터를 받아서 Chroma DB에서 관련 컨텍스트를 검색합니다.
 * 
 * Request Body:
 * {
 *   "embedding": [0.1, 0.2, ...],
 *   "inquiryId": "문의 ID",
 *   "content": "문의 내용" (선택),
 *   "type": "문의 유형" (선택),
 *   "subject": "문의 제목" (선택),
 *   "context": { "userInfo": {...} } (선택),
 *   "topK": 5 (선택, 기본값: 5)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "context": [...],
 *   "inquiryId": "문의 ID",
 *   "content": "문의 내용",
 *   "type": "문의 유형",
 *   "subject": "문의 제목",
 *   "userInfo": {...},
 *   "count": 5
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Search Context API] 요청 수신');

    // Request Body 파싱
    const body = await request.json();
    const { 
      embedding, 
      inquiryId, 
      content, 
      type, 
      subject, 
      context: inquiryContext 
    } = body;
    const topK = parseInt(body.topK) || 5; // topK를 숫자로 변환

    // 입력 검증
    if (!embedding || !Array.isArray(embedding)) {
      return NextResponse.json(
        {
          success: false,
          error: 'embedding 필드가 필요합니다 (배열 형태)'
        },
        { status: 400 }
      );
    }

    if (!inquiryId) {
      return NextResponse.json(
        {
          success: false,
          error: 'inquiryId 필드가 필요합니다'
        },
        { status: 400 }
      );
    }

    console.log(`[Search Context API] 문의 ID: ${inquiryId}, 임베딩 차원: ${embedding.length}`);

    // 벡터 검색
    const searchResults = await searchSimilarDocuments(embedding, topK);

    console.log(`[Search Context API] 검색 결과: ${searchResults.length}개 문서`);

    // 응답 반환 (원본 문의 데이터 포함)
    return NextResponse.json({
      success: true,
      context: searchResults,  // 검색된 관련 컨텍스트
      inquiryId,
      content: content || '',  // 문의 내용
      type: type || '',        // 문의 유형
      subject: subject || '',  // 문의 제목
      inquiryContext: inquiryContext || {},  // 원본 문의 컨텍스트 (userInfo 포함)
      count: searchResults.length
    });

  } catch (error) {
    console.error('[Search Context API] 오류:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '내부 서버 오류가 발생했습니다',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/search-context
 * 
 * API 상태 확인
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Search Context API is running',
    endpoint: '/api/ai/search-context',
    method: 'POST',
    requiredFields: ['embedding', 'inquiryId']
  });
}

