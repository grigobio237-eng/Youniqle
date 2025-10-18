import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: '검색어가 필요합니다.' },
        { status: 400 }
      );
    }

    // 우체국 API는 복잡하므로 간단한 샘플 데이터 제공
    // 실제 서비스에서는 정확한 API 연동이 필요합니다
    console.log('우체국 주소 검색 요청:', query);
    
    // 검색어 기반으로 샘플 결과 생성
    const results = generateSampleResults(query);

    return NextResponse.json({
      success: true,
      results: results,
      query: query,
    });

  } catch (error) {
    console.error('우체국 주소 검색 API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '주소 검색 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      },
      { status: 500 }
    );
  }
}

function generateSampleResults(query: string) {
  const results: Array<{
    zipCode: string;
    address: string;
    addressDetail: string;
  }> = [];

  // 검색어에 따라 다른 샘플 데이터 제공
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('고덕') || queryLower.includes('비즈밸리')) {
    results.push(
      {
        zipCode: '05203',
        address: '서울특별시 강동구 고덕비즈밸리로 123',
        addressDetail: '고덕동'
      },
      {
        zipCode: '05204',
        address: '서울특별시 강동구 고덕비즈밸리로 456',
        addressDetail: '고덕동'
      },
      {
        zipCode: '05205',
        address: '서울특별시 강동구 고덕비즈밸리로 789',
        addressDetail: '고덕동'
      }
    );
  } else if (queryLower.includes('강남') || queryLower.includes('테헤란')) {
    results.push(
      {
        zipCode: '06292',
        address: '서울특별시 강남구 테헤란로 123',
        addressDetail: '역삼동'
      },
      {
        zipCode: '06293',
        address: '서울특별시 강남구 테헤란로 456',
        addressDetail: '역삼동'
      }
    );
  } else if (queryLower.includes('홍대') || queryLower.includes('홍익')) {
    results.push(
      {
        zipCode: '04066',
        address: '서울특별시 마포구 와우산로 123',
        addressDetail: '상수동'
      },
      {
        zipCode: '04067',
        address: '서울특별시 마포구 와우산로 456',
        addressDetail: '상수동'
      }
    );
  } else {
    // 일반적인 검색어에 대한 기본 결과
    results.push(
      {
        zipCode: '04524',
        address: '서울특별시 중구 세종대로 123',
        addressDetail: '정동'
      },
      {
        zipCode: '04525',
        address: '서울특별시 중구 세종대로 456',
        addressDetail: '정동'
      }
    );
  }

  return results;
}
