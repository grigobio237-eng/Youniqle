'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, AlertCircle, ExternalLink } from 'lucide-react';

interface PublicDataAddressSearchProps {
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

export default function PublicDataAddressSearch({ onAddressSelect, disabled = false }: PublicDataAddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('검색할 주소를 입력해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);
    setSearchResults([]);
    setShowResults(false);

    try {
      // 공공데이터포털 우체국 주소 API 호출
      const response = await fetch('/api/address/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('주소 검색에 실패했습니다.');
      }

      const data = await response.json();
      
      if (data.success && data.results && data.results.length > 0) {
        setSearchResults(data.results);
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

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="주소를 검색하세요 (예: 명일동, 강남구)"
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
            <h3 className="text-sm font-medium text-gray-700">
              검색 결과 ({searchResults.length}건)
            </h3>
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
          <ExternalLink className="h-3 w-3" />
          공공데이터포털 우체국 주소 API를 사용합니다.
        </div>
      </div>
    </div>
  );
}
