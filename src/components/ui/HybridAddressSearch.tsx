'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface HybridAddressSearchProps {
  onAddressSelect: (data: {
    zonecode: string;
    address: string;
    addressEnglish: string;
    addressType: string;
    bname: string;
    buildingName: string;
  }) => void;
  disabled?: boolean;
}

export default function HybridAddressSearch({ onAddressSelect, disabled = false }: HybridAddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [searchMethod, setSearchMethod] = useState<'api' | 'local'>('api');

  // 온라인 상태 감지
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 실시간 검색 함수
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      setError('');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      let results: any[] = [];

      // 1. 온라인 상태이고 API 키가 있으면 외부 API 시도
      if (isOnline && process.env.NEXT_PUBLIC_PUBLIC_DATA_API_KEY) {
        try {
          const response = await fetch('/api/address/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.results && data.results.length > 0) {
              results = data.results;
              setSearchMethod('api');
            }
          }
        } catch (apiError) {
          console.warn('외부 API 호출 실패, 로컬 데이터베이스로 폴백:', apiError);
        }
      }

      // 2. 외부 API 실패 시 로컬 데이터베이스 사용
      if (results.length === 0) {
        results = searchLocalDatabase(query);
        setSearchMethod('local');
      }

      if (results.length > 0) {
        setSearchResults(results.slice(0, 10));
        setShowResults(true);
      } else {
        setError('검색 결과가 없습니다. 다른 검색어로 시도해보세요.');
      }
    } catch (error) {
      console.error('주소 검색 오류:', error);
      setError('주소 검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 로컬 데이터베이스 검색
  const searchLocalDatabase = (query: string): any[] => {
    const localDatabase = [
      // 서울 주요 지역 (용량 최적화)
      { zipcode: '05210', address: '서울특별시 강동구 명일동', bname: '명일동', region: '강동구' },
      { zipcode: '05211', address: '서울특별시 강동구 명일동', bname: '명일동', region: '강동구' },
      { zipcode: '05203', address: '서울특별시 강동구 고덕비즈밸리로', bname: '고덕동', region: '강동구' },
      { zipcode: '06292', address: '서울특별시 강남구 테헤란로', bname: '역삼동', region: '강남구' },
      { zipcode: '04066', address: '서울특별시 마포구 와우산로', bname: '상수동', region: '마포구' },
      { zipcode: '04524', address: '서울특별시 중구 세종대로', bname: '정동', region: '중구' },
      { zipcode: '05520', address: '서울특별시 송파구 잠실동', bname: '잠실동', region: '송파구' },
      { zipcode: '07300', address: '서울특별시 영등포구 여의도동', bname: '여의도동', region: '영등포구' },
      
      // 주요 도시 (용량 최적화)
      { zipcode: '12345', address: '경기도 성남시 분당구', bname: '분당구', region: '경기도' },
      { zipcode: '12346', address: '경기도 성남시 수정구', bname: '수정구', region: '경기도' },
      { zipcode: '12347', address: '경기도 성남시 중원구', bname: '중원구', region: '경기도' },
      { zipcode: '22345', address: '인천광역시 연수구', bname: '연수구', region: '인천광역시' },
      { zipcode: '22346', address: '인천광역시 남동구', bname: '남동구', region: '인천광역시' },
      { zipcode: '32345', address: '부산광역시 해운대구', bname: '해운대구', region: '부산광역시' },
      { zipcode: '32346', address: '부산광역시 사하구', bname: '사하구', region: '부산광역시' },
      { zipcode: '42345', address: '대구광역시 수성구', bname: '수성구', region: '대구광역시' },
      { zipcode: '42346', address: '대구광역시 달서구', bname: '달서구', region: '대구광역시' },
      { zipcode: '52345', address: '광주광역시 서구', bname: '서구', region: '광주광역시' },
      { zipcode: '52346', address: '광주광역시 남구', bname: '남구', region: '광주광역시' },
      { zipcode: '62345', address: '대전광역시 유성구', bname: '유성구', region: '대전광역시' },
      { zipcode: '62346', address: '대전광역시 서구', bname: '서구', region: '대전광역시' },
    ];

    const queryLower = query.toLowerCase().trim();
    
    return localDatabase
      .filter(addr => 
        addr.address.toLowerCase().includes(queryLower) ||
        addr.bname.toLowerCase().includes(queryLower) ||
        addr.region.toLowerCase().includes(queryLower)
      )
      .map(addr => ({
        zipCode: addr.zipcode,
        address: addr.address,
        bname: addr.bname,
        addressEnglish: '',
        buildingName: '',
        region: addr.region,
      }));
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setError('검색할 주소를 입력해주세요.');
      return;
    }
    performSearch(searchQuery);
  };

  // 실시간 검색 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      performSearch(value);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  const handleSelectAddress = (result: any) => {
    onAddressSelect({
      zonecode: result.zipCode,
      address: result.address,
      addressEnglish: result.addressEnglish || '',
      addressType: 'R',
      bname: result.bname || '',
      buildingName: result.buildingName || '',
    });

    setShowResults(false);
    setSearchQuery('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  React.useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="주소를 검색하세요 (예: 명일동, 강남구, 부산)"
          disabled={disabled || isLoading}
          className="flex-1"
        />
        <Button
          onClick={handleSearch}
          disabled={disabled || isLoading}
          className="px-4"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* 검색 결과 */}
      {showResults && searchResults.length > 0 && (
        <div className="border border-gray-200 rounded-lg shadow-lg bg-white max-h-60 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                검색 결과 ({searchResults.length}건)
              </h3>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {searchMethod === 'api' ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    <span>실시간 검색</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    <span>로컬 검색</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelectAddress(result)}
                className="w-full p-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
              >
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {result.address}
                    </p>
                    <p className="text-xs text-gray-500">
                      우편번호: {result.zipCode}
                    </p>
                    {result.bname && (
                      <p className="text-xs text-gray-400">
                        {result.bname}
                      </p>
                    )}
                    {result.region && (
                      <p className="text-xs text-blue-500">
                        {result.region}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-500 space-y-1">
        <div>💡 주소 검색이 안 되면 우편번호를 직접 입력해주세요.</div>
        <div className="flex items-center gap-1">
          {isOnline ? (
            <>
              <Wifi className="h-3 w-3" />
              <span>온라인: 실시간 검색 가능</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span>오프라인: 로컬 데이터베이스 사용</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
