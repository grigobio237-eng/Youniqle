import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      email,
      phone,
      company,
      position,
      businessType,
      website,
      message
    } = await request.json();

    // 필수 필드 검증
    if (!name || !email || !phone || !company || !businessType || !message) {
      return NextResponse.json(
        { error: '모든 필수 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 전화번호 형식 검증 (간단한 검증)
    const phoneRegex = /^[0-9-+\s()]+$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '올바른 전화번호 형식을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 실제 운영 환경에서는 여기서 다음과 같은 작업을 수행합니다:
    // 1. 데이터베이스에 문의 저장
    // 2. 이메일 알림 발송 (관리자에게)
    // 3. 자동 응답 이메일 발송 (문의자에게)
    // 4. n8n 워크플로우 트리거 (선택사항)

    // 현재는 시뮬레이션 데이터로 응답
    const inquiryData = {
      id: `partner-inquiry-${Date.now()}`,
      timestamp: new Date().toISOString(),
      name,
      email,
      phone,
      company,
      position: position || '',
      businessType,
      website: website || '',
      message,
      status: 'received',
      source: 'partner-inquiry-form'
    };

    // 로그 출력 (개발 환경에서 확인용)
    console.log('📧 파트너십 문의 접수:', {
      id: inquiryData.id,
      company,
      name,
      email,
      businessType,
      message: message.substring(0, 100) + '...'
    });

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '파트너십 문의가 성공적으로 접수되었습니다.',
      data: {
        id: inquiryData.id,
        timestamp: inquiryData.timestamp
      }
    }, { status: 201 });

  } catch (error) {
    console.error('파트너십 문의 처리 오류:', error);
    
    return NextResponse.json(
      { 
        error: '문의 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// OPTIONS 메서드 (CORS 지원)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}


