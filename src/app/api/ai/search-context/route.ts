import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ai/search-context
 * 
 * AI 챗봇 API - 현재 비활성화됨 (Vercel 배포 크기 제한)
 * ChromaDB 벡터 검색 기능은 추후 외부 서비스로 이전 예정
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inquiryId, content } = body;

    // AI 챗봇 기능은 현재 비활성화됨
    // 기본 응답만 반환
    return NextResponse.json({
      success: true,
      context: [],
      inquiryId,
      content: content || '',
      count: 0,
      message: 'AI 챗봇 기능은 현재 개발 중입니다. 관리자가 직접 답변드리겠습니다.'
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

