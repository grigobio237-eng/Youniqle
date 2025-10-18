'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, AlertCircle } from 'lucide-react';

interface SimplePostcodeSearchProps {
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

export default function SimplePostcodeSearch({ onAddressSelect, disabled = false }: SimplePostcodeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // 간단한 주소 데이터베이스 (실제로는 더 많은 데이터 필요)
  const addressDatabase = [
    { zipcode: '05203', address: '서울특별시 강동구 고덕비즈밸리로 123', bname: '고덕동' },
    { zipcode: '05204', address: '서울특별시 강동구 고덕비즈밸리로 456', bname: '고덕동' },
    { zipcode: '06292', address: '서울특별시 강남구 테헤란로 123', bname: '역삼동' },
    { zipcode: '06293', address: '서울특별시 강남구 테헤란로 456', bname: '역삼동' },
    { zipcode: '04066', address: '서울특별시 마포구 와우산로 123', bname: '상수동' },
    { zipcode: '04067', address: '서울특별시 마포구 와우산로 456', bname: '상수동' },
    { zipcode: '04524', address: '서울특별시 중구 세종대로 123', bname: '정동' },
    { zipcode: '04525', address: '서울특별시 중구 세종대로 456', bname: '정동' },
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setError('검색할 주소를 입력해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);
    setSearchResults([]);
    setShowResults(false);

    // 간단한 검색 로직
    setTimeout(() => {
      const results = addressDatabase.filter(addr => 
        addr.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addr.bname.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (results.length > 0) {
        setSearchResults(results);
        setShowResults(true);
      } else {
        setError('검색 결과가 없습니다. 다른 검색어로 시도해보세요.');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleSelectAddress = (result: any) => {
    onAddressSelect({
      zonecode: result.zipcode,
      address: result.address,
      addressEnglish: '',
      addressType: 'R',
      bname: result.bname,
      buildingName: '',
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
                      우편번호: {result.zipcode}
                    </p>
                    <p className="text-xs text-gray-400">
                      {result.bname}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-500 space-y-1">
        <div>💡 주소 검색이 안 되면 우편번호를 직접 입력해주세요.</div>
        <div>🔧 간단한 주소 검색 서비스를 사용합니다.</div>
      </div>
    </div>
  );
}
