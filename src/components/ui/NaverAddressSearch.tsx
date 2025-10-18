'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, AlertCircle } from 'lucide-react';

interface NaverAddressSearchProps {
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
    naver: any;
  }
}

export default function NaverAddressSearch({ onAddressSelect, disabled = false }: NaverAddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 네이버 우편번호 서비스 로드
  useEffect(() => {
    const loadNaverPostcode = () => {
      if (window.naver && window.naver.maps && window.naver.maps.Service) {
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=YOUR_CLIENT_ID';
      script.async = true;
      script.onload = () => {
        console.log('네이버 우편번호 서비스 로드 완료');
      };
      script.onerror = () => {
        console.error('네이버 우편번호 서비스 로드 실패');
        setError('주소 검색 서비스를 불러올 수 없습니다.');
      };
      
      document.head.appendChild(script);
    };

    loadNaverPostcode();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('검색할 주소를 입력해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 네이버 주소 검색 API 사용
      await searchWithNaver();
    } catch (error) {
      console.error('주소 검색 오류:', error);
      setError('주소 검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const searchWithNaver = async () => {
    try {
      // 네이버 주소 검색 API 호출
      const response = await fetch(`/api/naver/address?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.success && data.addresses && data.addresses.length > 0) {
        const address = data.addresses[0];
        onAddressSelect({
          zonecode: address.zipcode || '',
          address: address.roadAddress || address.jibunAddress,
          addressEnglish: '',
          addressType: 'R',
          bname: address.bname || '',
          buildingName: address.buildingName || '',
        });
      } else {
        setError('검색 결과가 없습니다. 다른 검색어로 시도해보세요.');
      }
    } catch (error) {
      console.error('네이버 주소 검색 오류:', error);
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
      
      <div className="text-xs text-gray-500 space-y-1">
        <div>💡 주소 검색이 안 되면 우편번호를 직접 입력해주세요.</div>
        <div>🔧 네이버 주소 검색 서비스를 사용합니다.</div>
      </div>
    </div>
  );
}
