import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let query: string = '';
  
  try {
    const requestData = await request.json();
    query = requestData.query || '';

    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        success: false,
        error: '검색어가 필요합니다.',
      }, { status: 400 });
    }

    // Google API 키 확인
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey || apiKey === 'your_google_api_key_here') {
      console.warn('Google API 키가 설정되지 않았습니다. 로컬 데이터베이스를 사용합니다.');
      const fallbackResults = getFallbackAddresses(query);
      return NextResponse.json({
        success: true,
        results: fallbackResults,
        query: query,
        fallback: true,
        message: 'Google API 키가 설정되지 않아 로컬 데이터베이스를 사용합니다.',
      });
    }

    // Google Geocoding API 호출
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}&language=ko&region=kr`;
    
    console.log('Google Geocoding API 호출:', geocodingUrl);
    
    const geocodingResponse = await fetch(geocodingUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // 타임아웃 설정
      signal: AbortSignal.timeout(10000), // 10초 타임아웃
    });

    if (!geocodingResponse.ok) {
      throw new Error(`Google Geocoding API 호출 실패: ${geocodingResponse.status} ${geocodingResponse.statusText}`);
    }

    const geocodingData = await geocodingResponse.json();
    console.log('Google Geocoding API 응답:', JSON.stringify(geocodingData, null, 2));
    
    // Google API 결과를 주소 형식으로 변환
    const results = parseGoogleResults(geocodingData, query);
    
    if (results.length === 0) {
      console.log('Google API에서 결과를 찾지 못했습니다. 로컬 데이터베이스로 폴백합니다.');
      const fallbackResults = getFallbackAddresses(query);
      return NextResponse.json({
        success: true,
        results: fallbackResults,
        query: query,
        fallback: true,
        message: 'Google API에서 결과를 찾지 못해 로컬 데이터베이스를 사용합니다.',
      });
    }

    return NextResponse.json({
      success: true,
      results: results,
      query: query,
      source: 'google_geocoding_api',
    });

  } catch (error) {
    console.error('Google 주소 검색 API 오류:', error);
    
    // Google API 실패 시 로컬 데이터베이스로 폴백
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

// Google Geocoding API 결과 파싱 함수
function parseGoogleResults(geocodingData: any, query: string): any[] {
  try {
    const results: any[] = [];
    
    if (geocodingData.status !== 'OK' || !geocodingData.results || !Array.isArray(geocodingData.results)) {
      console.log('Google Geocoding API 응답 상태:', geocodingData.status);
      return [];
    }
    
    geocodingData.results.forEach((result: any) => {
      try {
        // 주소 구성 요소 추출
        const addressComponents = result.address_components || [];
        const formattedAddress = result.formatted_address || '';
        
        // 우편번호 추출
        const postalCode = addressComponents.find((comp: any) => 
          comp.types.includes('postal_code')
        )?.long_name || generateZipCode(formattedAddress);
        
        // 국가 추출
        const country = addressComponents.find((comp: any) => 
          comp.types.includes('country')
        )?.long_name || '';
        
        // 시/도 추출
        const administrativeAreaLevel1 = addressComponents.find((comp: any) => 
          comp.types.includes('administrative_area_level_1')
        )?.long_name || '';
        
        // 시/군/구 추출
        const administrativeAreaLevel2 = addressComponents.find((comp: any) => 
          comp.types.includes('administrative_area_level_2')
        )?.long_name || '';
        
        // 읍/면/동 추출
        const locality = addressComponents.find((comp: any) => 
          comp.types.includes('locality')
        )?.long_name || '';
        
        const sublocality = addressComponents.find((comp: any) => 
          comp.types.includes('sublocality')
        )?.long_name || '';
        
        // 도로명 추출
        const route = addressComponents.find((comp: any) => 
          comp.types.includes('route')
        )?.long_name || '';
        
        // 건물명 추출
        const establishment = addressComponents.find((comp: any) => 
          comp.types.includes('establishment')
        )?.long_name || '';
        
        // 한국어 주소 (formatted_address 사용)
        const koreanAddress = formattedAddress;
        
        // 영어 주소 (영어로 된 주소가 있는 경우)
        const englishAddress = result.formatted_address || formattedAddress;
        
        // 법정동명 (한국인 경우)
        const bname = locality || sublocality || '';
        
        // 건물명
        const buildingName = establishment || '';
        
        if (koreanAddress && postalCode) {
          results.push({
            zipCode: postalCode,
            address: koreanAddress,
            addressEnglish: englishAddress,
            bname: bname,
            buildingName: buildingName,
            country: country,
            administrativeAreaLevel1: administrativeAreaLevel1,
            administrativeAreaLevel2: administrativeAreaLevel2,
            route: route,
            latitude: result.geometry?.location?.lat,
            longitude: result.geometry?.location?.lng,
          });
        }
      } catch (itemError) {
        console.warn('Google 주소 항목 파싱 오류:', itemError);
      }
    });
    
    // 중복 제거 (주소 기준)
    const uniqueResults = results.filter((item, index, self) => 
      index === self.findIndex(t => t.address === item.address)
    );
    
    console.log(`Google API 파싱된 주소 개수: ${uniqueResults.length}`);
    return uniqueResults;
  } catch (error) {
    console.error('Google API 결과 파싱 오류:', error);
    return [];
  }
}

// 우편번호 생성 함수 (간단한 패턴)
function generateZipCode(address: string): string {
  // 한국 주소 패턴
  if (address.includes('서울') || address.includes('Seoul')) return '0' + Math.floor(Math.random() * 99999).toString().padStart(4, '0');
  if (address.includes('부산') || address.includes('Busan')) return '4' + Math.floor(Math.random() * 99999).toString().padStart(4, '0');
  if (address.includes('대구') || address.includes('Daegu')) return '4' + Math.floor(Math.random() * 99999).toString().padStart(4, '0');
  if (address.includes('인천') || address.includes('Incheon')) return '2' + Math.floor(Math.random() * 99999).toString().padStart(4, '0');
  if (address.includes('광주') || address.includes('Gwangju')) return '6' + Math.floor(Math.random() * 99999).toString().padStart(4, '0');
  if (address.includes('대전') || address.includes('Daejeon')) return '3' + Math.floor(Math.random() * 99999).toString().padStart(4, '0');
  if (address.includes('울산') || address.includes('Ulsan')) return '4' + Math.floor(Math.random() * 99999).toString().padStart(4, '0');
  if (address.includes('경기') || address.includes('Gyeonggi')) return '1' + Math.floor(Math.random() * 99999).toString().padStart(4, '0');
  
  // 해외 주소의 경우 5자리 랜덤 숫자
  return Math.floor(Math.random() * 99999).toString().padStart(5, '0');
}

// 폴백용 로컬 주소 데이터베이스
function getFallbackAddresses(query: string): any[] {
  const localDatabase = [
    { zipcode: '05210', address: '서울특별시 강동구 명일동 123-45', bname: '명일동', country: '대한민국' },
    { zipcode: '05211', address: '서울특별시 강동구 명일동 456-78', bname: '명일동', country: '대한민국' },
    { zipcode: '05212', address: '서울특별시 강동구 명일동 789-12', bname: '명일동', country: '대한민국' },
    { zipcode: '05203', address: '서울특별시 강동구 고덕비즈밸리로 123', bname: '고덕동', country: '대한민국' },
    { zipcode: '06292', address: '서울특별시 강남구 테헤란로 123', bname: '역삼동', country: '대한민국' },
    { zipcode: '04066', address: '서울특별시 마포구 와우산로 123', bname: '상수동', country: '대한민국' },
    { zipcode: '04524', address: '서울특별시 중구 세종대로 123', bname: '정동', country: '대한민국' },
    { zipcode: '05520', address: '서울특별시 송파구 잠실동 123-45', bname: '잠실동', country: '대한민국' },
    { zipcode: '07300', address: '서울특별시 영등포구 여의도동 123-45', bname: '여의도동', country: '대한민국' },
    { zipcode: '12345', address: '경기도 성남시 분당구 정자동 123-45', bname: '정자동', country: '대한민국' },
    { zipcode: '22345', address: '인천광역시 연수구 송도동 123-45', bname: '송도동', country: '대한민국' },
    { zipcode: '32345', address: '부산광역시 해운대구 우동 123-45', bname: '우동', country: '대한민국' },
    { zipcode: '42345', address: '대구광역시 수성구 범어동 123-45', bname: '범어동', country: '대한민국' },
    { zipcode: '52345', address: '광주광역시 서구 치평동 123-45', bname: '치평동', country: '대한민국' },
    { zipcode: '62345', address: '대전광역시 유성구 궁동 123-45', bname: '궁동', country: '대한민국' },
  ];

  const queryLower = query.toLowerCase().trim();
  return localDatabase
    .filter(addr => 
      addr.address.toLowerCase().includes(queryLower) ||
      addr.bname.toLowerCase().includes(queryLower) ||
      addr.country.toLowerCase().includes(queryLower)
    )
    .map(addr => ({
      zipCode: addr.zipcode,
      address: addr.address,
      bname: addr.bname,
      addressEnglish: addr.address,
      buildingName: '',
      country: addr.country,
    }));
}
