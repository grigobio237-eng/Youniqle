'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, AlertCircle } from 'lucide-react';

interface SimpleAddressSearchProps {
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

declare global {
  interface Window {
    daum: any;
  }
}

export default function SimpleAddressSearch({ onAddressSelect, disabled = false }: SimpleAddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Daum 우편번호 서비스 로드 (Key 발급 불필요)
  useEffect(() => {
    const loadDaumPostcode = () => {
      if (window.daum && window.daum.Postcode) {
        return;
      }

      const script = document.createElement('script');
      // 공식 가이드에 따른 올바른 스크립트 URL
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      script.onload = () => {
        console.log('Daum 우편번호 서비스 로드 완료');
      };
      script.onerror = () => {
        console.error('Daum 우편번호 서비스 로드 실패');
        setError('주소 검색 서비스를 불러올 수 없습니다.');
      };
      
      document.head.appendChild(script);
    };

    loadDaumPostcode();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('검색할 주소를 입력해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 먼저 Daum 우편번호 서비스 시도
      if (window.daum && window.daum.Postcode) {
        await searchWithDaum();
      } else {
        // Daum 서비스가 없으면 우체국 API 시도
        await searchWithPostOffice();
      }
    } catch (error) {
      console.error('주소 검색 오류:', error);
      setError('주소 검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const searchWithDaum = () => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Daum 우편번호 서비스가 로드되지 않은 경우
        if (!window.daum || !window.daum.Postcode) {
          console.log('Daum 우편번호 서비스를 사용할 수 없습니다. 우체국 검색으로 대체합니다.');
          searchWithPostOffice().then(resolve).catch(reject);
          return;
        }

        // 공식 가이드에 따른 올바른 사용법
        const postcode = new window.daum.Postcode({
          oncomplete: function(data: any) {
            console.log('Daum 주소 선택 완료:', data);
            
            // 주소 정보를 부모 컴포넌트로 전달
            onAddressSelect({
              zonecode: data.zonecode,
              address: data.address,
              addressEnglish: data.addressEnglish || '',
              addressType: data.addressType,
              bname: data.bname || '',
              buildingName: data.buildingName || '',
            });
            resolve();
          },
          onclose: function(state: string) {
            console.log('Daum 우편번호 팝업 닫힘:', state);
            if (state === 'FORCE_CLOSE') {
              console.log('Daum 우편번호 검색이 강제로 닫혔습니다. 우체국 검색으로 대체합니다.');
              // 강제로 닫힌 경우 우체국 검색으로 대체
              searchWithPostOffice().then(resolve).catch(reject);
            } else {
              resolve();
            }
          },
          onresize: function(size: any) {
            console.log('Daum 팝업 크기 조정:', size);
          },
          width: '100%',
          height: '100%',
          maxSuggestItems: 5,
          showMoreHName: true,
          hideMapBtn: false,
          hideEngBtn: false,
          alwaysShowEngAddr: false,
          submitMode: false,
          useBanner: true,
          useSuggest: true,
          theme: {
            bgColor: '#ffffff',
            searchBgColor: '#ffffff',
            contentBgColor: '#ffffff',
            pageBgColor: '#ffffff',
            textColor: '#333333',
            queryTextColor: '#222222',
            postcodeTextColor: '#fa4256',
            emphTextColor: '#008bd3',
            outlineColor: '#e0e0e0'
          }
        });

        // 팝업 열기 시도
        try {
          postcode.open({
            q: searchQuery,
            popupTitle: '우편번호 검색',
            popupKey: 'postcodePopup',
            autoClose: true,
          });
        } catch (popupError) {
          console.error('팝업 열기 실패:', popupError);
          // 팝업 실패 시 레이어 모드로 대체 시도
          const targetElement = document.getElementById('postcode-layer') || document.body;
          postcode.embed(targetElement, {
            q: searchQuery,
            autoClose: true,
          });
        }
      } catch (error) {
        console.error('Daum 우편번호 서비스 오류:', error);
        // Daum 실패 시 우체국 검색으로 대체
        searchWithPostOffice().then(resolve).catch(reject);
      }
    });
  };

  const searchWithPostOffice = async () => {
    try {
      const response = await fetch('/api/postcode/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('우체국 주소 검색에 실패했습니다.');
      }

      const data = await response.json();
      
      if (data.success && data.results && data.results.length > 0) {
        // 첫 번째 결과를 자동으로 선택
        const result = data.results[0];
        onAddressSelect({
          zonecode: result.zipCode,
          address: result.address,
          addressEnglish: '',
          addressType: 'R',
          bname: result.addressDetail || '',
          buildingName: '',
        });
      } else {
        setError('검색 결과가 없습니다. 다른 검색어로 시도해보세요.');
      }
    } catch (error) {
      console.error('우체국 주소 검색 오류:', error);
      throw error;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="주소를 검색하세요 (예: 고덕비즈밸리로)"
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
      
      {/* 레이어 모드를 위한 숨겨진 컨테이너 */}
      <div id="postcode-layer" className="hidden"></div>
      
      <div className="text-xs text-gray-500 space-y-1">
        <div>💡 주소 검색이 안 되면 우편번호를 직접 입력해주세요.</div>
        <div>🔧 팝업이 차단되면 자동으로 레이어 모드로 전환됩니다.</div>
      </div>
    </div>
  );
}
