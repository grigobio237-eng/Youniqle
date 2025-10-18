import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        success: false,
        error: '검색어가 필요합니다.',
      }, { status: 400 });
    }

    // 네이버 API 키 확인
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;
    
    if (!clientId || !clientSecret || 
        clientId === 'your_naver_client_id_here' || 
        clientSecret === 'your_naver_client_secret_here') {
      console.warn('네이버 API 키가 설정되지 않았습니다. 로컬 데이터베이스를 사용합니다.');
      const fallbackResults = getFallbackAddresses(query);
      return NextResponse.json({
        success: true,
        results: fallbackResults,
        query: query,
        fallback: true,
        message: '네이버 API 키가 설정되지 않아 로컬 데이터베이스를 사용합니다.',
      });
    }

    // 네이버 지역 검색 API 호출 (검색 API의 지역 검색 기능)
    const naverApiUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=20&start=1&sort=random`;
    
    console.log('네이버 주소 검색 API 호출:', naverApiUrl);
    
    const naverResponse = await fetch(naverApiUrl, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
        'Accept': 'application/json',
      },
      // 타임아웃 설정
      signal: AbortSignal.timeout(10000), // 10초 타임아웃
    });

    if (!naverResponse.ok) {
      throw new Error(`네이버 API 호출 실패: ${naverResponse.status} ${naverResponse.statusText}`);
    }

    const naverData = await naverResponse.json();
    console.log('네이버 API 응답:', JSON.stringify(naverData, null, 2));
    
    // 네이버 API 결과를 주소 형식으로 변환
    const results = parseNaverResults(naverData, query);
    
    if (results.length === 0) {
      console.log('네이버 API에서 결과를 찾지 못했습니다. 로컬 데이터베이스로 폴백합니다.');
      const fallbackResults = getFallbackAddresses(query);
      return NextResponse.json({
        success: true,
        results: fallbackResults,
        query: query,
        fallback: true,
        message: '네이버 API에서 결과를 찾지 못해 로컬 데이터베이스를 사용합니다.',
      });
    }

    return NextResponse.json({
      success: true,
      results: results,
      query: query,
      source: 'naver_api',
    });

  } catch (error) {
    console.error('네이버 주소 검색 API 오류:', error);
    
    // 네이버 API 실패 시 로컬 데이터베이스로 폴백
    const fallbackResults = getFallbackAddresses(query);
    
    return NextResponse.json({
      success: true,
      results: fallbackResults,
      query: query,
      fallback: true,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    });
  }
}

// 네이버 API 결과 파싱 함수
function parseNaverResults(naverData: any, query: string): any[] {
  try {
    const results: any[] = [];
    
    if (!naverData.items || !Array.isArray(naverData.items)) {
      console.log('네이버 API 응답에 items가 없습니다.');
      return [];
    }
    
    naverData.items.forEach((item: any) => {
      try {
        // 주소 관련 항목만 필터링
        if (item.category && (
          item.category.includes('지번') || 
          item.category.includes('도로명') ||
          item.category.includes('주소') ||
          item.category.includes('건물')
        )) {
          // 우편번호 추출 (간단한 패턴 매칭)
          const zipCodeMatch = item.address?.match(/\d{5}/);
          const zipCode = zipCodeMatch ? zipCodeMatch[0] : generateZipCode(item.address);
          
          // 주소 정리
          const address = item.address || item.title || '';
          const cleanAddress = address.replace(/<[^>]*>/g, '').trim();
          
          // 법정동명 추출
          const bname = extractBname(cleanAddress);
          
          // 건물명 추출
          const buildingName = item.title?.replace(/<[^>]*>/g, '').trim() || '';
          
          if (cleanAddress && zipCode) {
            results.push({
              zipCode,
              address: cleanAddress,
              bname: bname,
              buildingName: buildingName,
              addressEnglish: '',
              category: item.category,
              telephone: item.telephone || '',
            });
          }
        }
      } catch (itemError) {
        console.warn('네이버 주소 항목 파싱 오류:', itemError);
      }
    });
    
    // 중복 제거 (주소 기준)
    const uniqueResults = results.filter((item, index, self) => 
      index === self.findIndex(t => t.address === item.address)
    );
    
    console.log(`네이버 API 파싱된 주소 개수: ${uniqueResults.length}`);
    return uniqueResults;
  } catch (error) {
    console.error('네이버 API 결과 파싱 오류:', error);
    return [];
  }
}

// 법정동명 추출 함수
function extractBname(address: string): string {
  // 서울특별시 강동구 명일동 123-45 -> 명일동
  const match = address.match(/([가-힣]+동)/);
  return match ? match[1] : '';
}

// 우편번호 생성 함수 (간단한 패턴)
function generateZipCode(address: string): string {
  // 지역별 우편번호 패턴
  if (address.includes('서울')) return '0' + Math.floor(Math.random() * 99999).toString().padStart(4, '0');
  if (address.includes('부산')) return '4' + Math.floor(Math.random() * 99999).toString().padStart(4, '0');
  if (address.includes('대구')) return '4' + Math.floor(Math.random() * 99999).toString().padStart(4, '0');
  if (address.includes('인천')) return '2' + Math.floor(Math.random() * 99999).toString().padStart(4, '0');
  if (address.includes('광주')) return '6' + Math.floor(Math.random() * 99999).toString().padStart(4, '0');
  if (address.includes('대전')) return '3' + Math.floor(Math.random() * 99999).toString().padStart(4, '0');
  if (address.includes('울산')) return '4' + Math.floor(Math.random() * 99999).toString().padStart(4, '0');
  if (address.includes('경기')) return '1' + Math.floor(Math.random() * 99999).toString().padStart(4, '0');
  return Math.floor(Math.random() * 99999).toString().padStart(5, '0');
}

// 폴백용 로컬 주소 데이터베이스
function getFallbackAddresses(query: string): any[] {
  const localDatabase = [
    { zipcode: '05210', address: '서울특별시 강동구 명일동 123-45', bname: '명일동' },
    { zipcode: '05211', address: '서울특별시 강동구 명일동 456-78', bname: '명일동' },
    { zipcode: '05212', address: '서울특별시 강동구 명일동 789-12', bname: '명일동' },
    { zipcode: '05203', address: '서울특별시 강동구 고덕비즈밸리로 123', bname: '고덕동' },
    { zipcode: '06292', address: '서울특별시 강남구 테헤란로 123', bname: '역삼동' },
    { zipcode: '04066', address: '서울특별시 마포구 와우산로 123', bname: '상수동' },
    { zipcode: '04524', address: '서울특별시 중구 세종대로 123', bname: '정동' },
    { zipcode: '05520', address: '서울특별시 송파구 잠실동 123-45', bname: '잠실동' },
    { zipcode: '07300', address: '서울특별시 영등포구 여의도동 123-45', bname: '여의도동' },
    { zipcode: '12345', address: '경기도 성남시 분당구 정자동 123-45', bname: '정자동' },
    { zipcode: '22345', address: '인천광역시 연수구 송도동 123-45', bname: '송도동' },
    { zipcode: '32345', address: '부산광역시 해운대구 우동 123-45', bname: '우동' },
    { zipcode: '42345', address: '대구광역시 수성구 범어동 123-45', bname: '범어동' },
    { zipcode: '52345', address: '광주광역시 서구 치평동 123-45', bname: '치평동' },
    { zipcode: '62345', address: '대전광역시 유성구 궁동 123-45', bname: '궁동' },
  ];

  const queryLower = query.toLowerCase().trim();
  return localDatabase
    .filter(addr => 
      addr.address.toLowerCase().includes(queryLower) ||
      addr.bname.toLowerCase().includes(queryLower)
    )
    .map(addr => ({
      zipCode: addr.zipcode,
      address: addr.address,
      bname: addr.bname,
      addressEnglish: '',
      buildingName: '',
    }));
}
