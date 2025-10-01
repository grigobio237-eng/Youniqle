'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';

interface AddressSearchProps {
  onAddressSelect: (address: string, detailAddress?: string) => void;
  value?: string;
  detailValue?: string;
  placeholder?: string;
  detailPlaceholder?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    daum: any;
  }
}

export default function AddressSearch({ 
  onAddressSelect, 
  value = '', 
  detailValue = '',
  placeholder = '주소를 검색하세요',
  detailPlaceholder = '상세주소를 입력하세요',
  disabled = false 
}: AddressSearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [detailAddress, setDetailAddress] = useState(detailValue);

  const loadDaumPostcode = () => {
    return new Promise((resolve, reject) => {
      if (window.daum) {
        resolve(window.daum);
        return;
      }

      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.onload = () => {
        if (window.daum) {
          resolve(window.daum);
        } else {
          reject(new Error('Daum Postcode API failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Daum Postcode API'));
      document.head.appendChild(script);
    });
  };

  const openAddressSearch = async () => {
    if (disabled) return;

    try {
      setIsLoading(true);
      await loadDaumPostcode();

      new window.daum.Postcode({
        oncomplete: function(data: any) {
          let addr = '';
          let extraAddr = '';

          // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
          if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
            addr = data.roadAddress;
          } else { // 사용자가 지번 주소를 선택했을 경우(J)
            addr = data.jibunAddress;
          }

          // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
          if(data.userSelectedType === 'R'){
            // 법정동명이 있을 경우 추가한다. (법정리는 제외)
            // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
            if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
              extraAddr += data.bname;
            }
            // 건물명이 있고, 공동주택일 경우 추가한다.
            if(data.buildingName !== '' && data.apartment === 'Y'){
              extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
            if(extraAddr !== ''){
              extraAddr = ' (' + extraAddr + ')';
            }
          }

          // 우편번호와 주소 정보를 해당 필드에 넣는다.
          const fullAddress = addr + extraAddr;
          onAddressSelect(fullAddress, detailAddress);
          setIsLoading(false);
        },
        onresize: function(size: any) {
          // 팝업 크기 조정
        }
      }).open();
    } catch (error) {
      console.error('주소 검색 오류:', error);
      alert('주소 검색 서비스를 불러올 수 없습니다. 직접 입력해주세요.');
      setIsLoading(false);
    }
  };

  const handleDetailAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDetailAddress = e.target.value;
    setDetailAddress(newDetailAddress);
    onAddressSelect(value, newDetailAddress);
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <Input
          value={value}
          onChange={(e) => onAddressSelect(e.target.value, detailAddress)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={openAddressSearch}
          disabled={disabled || isLoading}
          className="flex items-center space-x-2"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">주소 검색</span>
        </Button>
      </div>
      <Input
        value={detailAddress}
        onChange={handleDetailAddressChange}
        placeholder={detailPlaceholder}
        disabled={disabled}
        className="w-full"
      />
      <p className="text-xs text-gray-500 flex items-center">
        <MapPin className="h-3 w-3 mr-1" />
        주소 검색 버튼을 클릭하여 정확한 주소를 찾아보세요
      </p>
    </div>
  );
}
