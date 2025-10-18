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

    // 우체국 우편번호 검색 API 호출
    const postOfficeUrl = 'https://epost.go.kr/search.RetrieveIntegrationNewZipCdList.comm';
    
    const formData = new URLSearchParams();
    formData.append('searchType', '1');
    formData.append('searchWord', query);
    formData.append('currentPage', '1');
    formData.append('countPerPage', '20');

    const response = await fetch(postOfficeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://epost.go.kr/search.RetrieveIntegrationNewZipCdList.comm',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`우체국 API 호출 실패: ${response.status}`);
    }

    const html = await response.text();
    
    // HTML에서 주소 정보 파싱 (실제 구현에서는 더 정교한 파싱 필요)
    const results = parsePostOfficeResults(html);

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

function parsePostOfficeResults(html: string) {
  const results: Array<{
    zipCode: string;
    address: string;
    addressDetail: string;
  }> = [];

  try {
    // HTML에서 주소 정보를 파싱하는 로직
    // 실제 구현에서는 cheerio나 다른 HTML 파서를 사용하는 것이 좋습니다
    
    // 임시로 샘플 데이터 반환 (실제로는 HTML 파싱 결과)
    if (html.includes('검색결과')) {
      // 실제 파싱 로직이 필요하지만, 여기서는 샘플 데이터 반환
      results.push({
        zipCode: '05203',
        address: '서울특별시 강동구 고덕비즈밸리로 123',
        addressDetail: '고덕동'
      });
    }
  } catch (error) {
    console.error('HTML 파싱 오류:', error);
  }

  return results;
}
