import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let query: string;
  
  try {
    const requestData = await request.json();
    query = requestData.query;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        success: false,
        error: '검색어가 필요합니다.',
      }, { status: 400 });
    }

    // API 키 확인
    const apiKey = process.env.PUBLIC_DATA_API_KEY;
    if (!apiKey || apiKey === 'your_public_data_api_key_here') {
      console.warn('공공데이터포털 API 키가 설정되지 않았습니다. 로컬 데이터베이스를 사용합니다.');
      const fallbackResults = getFallbackAddresses(query);
      return NextResponse.json({
        success: true,
        results: fallbackResults,
        query: query,
        fallback: true,
        message: 'API 키가 설정되지 않아 로컬 데이터베이스를 사용합니다.',
      });
    }

    // 공공데이터포털 우체국 주소 API 호출
    const apiUrl = `http://openapi.epost.go.kr/postal/retrieveNewAdressAreaCdService/retrieveNewAdressAreaCdService/getNewAddressListAreaCd?ServiceKey=${apiKey}&searchSe=dong&srchwrd=${encodeURIComponent(query)}&numOfRows=20&pageSize=20&pageNo=1&startPage=1`;
    
    console.log('공공데이터포털 API 호출:', apiUrl);
    
    const publicDataResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
      },
      // 타임아웃 설정
      signal: AbortSignal.timeout(10000), // 10초 타임아웃
    });

    if (!publicDataResponse.ok) {
      throw new Error(`공공데이터포털 API 호출 실패: ${publicDataResponse.status} ${publicDataResponse.statusText}`);
    }

    const xmlData = await publicDataResponse.text();
    console.log('API 응답 (일부):', xmlData.substring(0, 500));
    
    // XML을 JSON으로 파싱
    const results = parseAddressXML(xmlData);
    
    if (results.length === 0) {
      console.log('API에서 결과를 찾지 못했습니다. 로컬 데이터베이스로 폴백합니다.');
      const fallbackResults = getFallbackAddresses(query);
      return NextResponse.json({
        success: true,
        results: fallbackResults,
        query: query,
        fallback: true,
        message: 'API에서 결과를 찾지 못해 로컬 데이터베이스를 사용합니다.',
      });
    }

    return NextResponse.json({
      success: true,
      results: results,
      query: query,
      source: 'public_data_api',
    });

  } catch (error) {
    console.error('주소 검색 API 오류:', error);
    
    // 공공데이터포털 API 실패 시 로컬 데이터베이스로 폴백
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

// XML 파싱 함수 (개선된 구현)
function parseAddressXML(xml: string): any[] {
  try {
    const results: any[] = [];
    
    // 에러 체크
    if (xml.includes('<error>') || xml.includes('<resultCode>')) {
      console.error('API 에러 응답:', xml);
      return [];
    }
    
    // XML에서 주소 정보 추출
    const addressMatches = xml.match(/<newAddressListAreaCd>[\s\S]*?<\/newAddressListAreaCd>/g);
    
    if (addressMatches) {
      addressMatches.forEach(match => {
        try {
          // 우편번호
          const zipCode = match.match(/<zipNo>([^<]*)<\/zipNo>/)?.[1]?.trim() || '';
          
          // 도로명주소
          const roadAddress = match.match(/<lnmAdres>([^<]*)<\/lnmAdres>/)?.[1]?.trim() || '';
          
          // 지번주소
          const jibunAddress = match.match(/<rnAdres>([^<]*)<\/rnAdres>/)?.[1]?.trim() || '';
          
          // 법정동명
          const bname = match.match(/<bdMgtSn>([^<]*)<\/bdMgtSn>/)?.[1]?.trim() || '';
          
          // 건물명
          const buildingName = match.match(/<bdNm>([^<]*)<\/bdNm>/)?.[1]?.trim() || '';
          
          // 시도명
          const sido = match.match(/<sido>([^<]*)<\/sido>/)?.[1]?.trim() || '';
          
          // 시군구명
          const sigungu = match.match(/<sigungu>([^<]*)<\/sigungu>/)?.[1]?.trim() || '';
          
          // 읍면동명
          const dong = match.match(/<dong>([^<]*)<\/dong>/)?.[1]?.trim() || '';
          
          // 우편번호와 주소가 있는 경우만 추가
          if (zipCode && (roadAddress || jibunAddress)) {
            const address = roadAddress || jibunAddress;
            const fullAddress = `${sido} ${sigungu} ${dong} ${address}`.replace(/\s+/g, ' ').trim();
            
            results.push({
              zipCode,
              address: fullAddress,
              roadAddress: roadAddress,
              jibunAddress: jibunAddress,
              bname: bname || dong,
              buildingName: buildingName,
              sido: sido,
              sigungu: sigungu,
              dong: dong,
              addressEnglish: '',
            });
          }
        } catch (itemError) {
          console.warn('주소 항목 파싱 오류:', itemError);
        }
      });
    }
    
    // 중복 제거 (우편번호 기준)
    const uniqueResults = results.filter((item, index, self) => 
      index === self.findIndex(t => t.zipCode === item.zipCode)
    );
    
    console.log(`파싱된 주소 개수: ${uniqueResults.length}`);
    return uniqueResults;
  } catch (error) {
    console.error('XML 파싱 오류:', error);
    return [];
  }
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
  ];

  const queryLower = query.toLowerCase();
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
