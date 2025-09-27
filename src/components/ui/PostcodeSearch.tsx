'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';

interface PostcodeSearchProps {
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

export default function PostcodeSearch({ onAddressSelect, disabled = false }: PostcodeSearchProps) {
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // 카카오 우편번호 서비스 스크립트 로드
    const loadScript = () => {
      if (window.daum && window.daum.Postcode) {
        return;
      }

      if (scriptRef.current) {
        return;
      }

      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      script.onload = () => {
        console.log('카카오 우편번호 서비스 로드 완료');
      };
      script.onerror = () => {
        console.error('카카오 우편번호 서비스 로드 실패');
      };
      
      document.head.appendChild(script);
      scriptRef.current = script;
    };

    loadScript();

    return () => {
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, []);

  const handleSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('우편번호 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function(data: any) {
        // 주소 정보를 부모 컴포넌트로 전달
        onAddressSelect({
          zonecode: data.zonecode,
          address: data.address,
          addressEnglish: data.addressEnglish || '',
          addressType: data.addressType,
          bname: data.bname || '',
          buildingName: data.buildingName || '',
        });
      },
      width: '100%',
      height: '100%',
    }).open();
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSearch}
      disabled={disabled}
      className="flex items-center justify-center space-x-2 whitespace-nowrap"
    >
      <Search className="h-4 w-4" />
      <span>검색</span>
    </Button>
  );
}
