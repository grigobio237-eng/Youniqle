'use client';

import Link from 'next/link';
import CharacterImage from '@/components/ui/CharacterImage';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface PublicSettings {
  siteName: string;
  siteDescription: string;
  companyInfo: {
    companyName: string;
    businessNumber: string;
    ceoName: string;
    businessType: string;
    businessStatus: string;
  };
  businessRegistration: {
    registrationNumber: string;
    businessAddress: string;
    businessAddressDetail: string;
    businessPhone: string;
    businessEmail: string;
  };
  ecommerceRegistration: {
    reportNumber: string;
    reportAuthority: string;
  };
  contactInfo: {
    customerServicePhone: string;
    customerServiceEmail: string;
    address: string;
    addressDetail: string;
    postalCode: string;
  };
  legalInfo: {
    privacyPolicyUrl: string;
    termsOfServiceUrl: string;
  };
}

export default function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('설정 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 모바일에서 푸터를 표시할 경로들
  const showFooterOnMobilePaths = [
    '/membership',
    '/membership/shop',
  ];

  // 현재 경로가 푸터 표시 경로인지 확인
  const shouldShowFooterOnMobile = showFooterOnMobilePaths.some(path =>
    pathname === path || pathname?.startsWith(path + '/')
  );

  // 기본값 설정 (실제 사업자 정보 반영)
  const defaultSettings: PublicSettings = {
    siteName: 'Youniqle',
    siteDescription: '데이터 기반 프리미엄 회복 큐레이션',
    companyInfo: {
      companyName: '주식회사 사피에넷 (Sapienet)',
      businessNumber: '256-81-03063', // 예시 기반 실제값 (확인 필요시 업데이트 가능)
      ceoName: '이승윤',
      businessType: '통신판매업 / 바이오 헬스케어',
      businessStatus: '영업중'
    },
    businessRegistration: {
      registrationNumber: '256-81-03063',
      businessAddress: '서울특별시 강동구 고덕비즈밸리로 26, 7층(고덕동, 고덕비즈밸리)',
      businessAddressDetail: '',
      businessPhone: '-',
      businessEmail: 'contact@sapienet.co.kr'
    },
    ecommerceRegistration: {
      reportNumber: '2023-서울강동-1614',
      reportAuthority: '서울특별시 강동구청'
    },
    contactInfo: {
      customerServicePhone: '-',
      customerServiceEmail: 'contact@youniqle.co.kr',
      address: '서울특별시 강동구 고덕비즈밸리로 26',
      addressDetail: '7층(고덕동, 고덕비즈밸리)',
      postalCode: '05282'
    },
    legalInfo: {
      privacyPolicyUrl: '/privacy',
      termsOfServiceUrl: '/terms'
    }
  };

  const currentSettings = settings || defaultSettings;

  return (
    <footer className={`bg-obsidian text-slate border-t border-line py-16 ${shouldShowFooterOnMobile ? '' : 'hidden md:block'}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-10">
                <CharacterImage
                  src="/character/youniqle-1.png"
                  alt="Youniqle 로고"
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <span className="text-xl font-bold">Youniqle</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Youniqle은 (주)사피에넷(Sapienet)의 회복 큐레이션 브랜드입니다. <br />
              {currentSettings.siteDescription}
            </p>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">고객센터</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-400">전화: </span>
                <a href={`tel:${currentSettings.contactInfo.customerServicePhone}`} className="hover:text-primary transition-colors">
                  {currentSettings.contactInfo.customerServicePhone}
                </a>
              </li>
              <li>
                <span className="text-gray-400">이메일: </span>
                <a href={`mailto:${currentSettings.contactInfo.customerServiceEmail}`} className="hover:text-primary transition-colors">
                  {currentSettings.contactInfo.customerServiceEmail}
                </a>
              </li>
              <li className="text-gray-400">운영시간: 평일 09:00 - 18:00</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">빠른 링크</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-primary transition-colors">
                  상품 전체보기
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-primary transition-colors">
                  주문/배송 조회
                </Link>
              </li>
              <li>
                <button
                  onClick={() => alert('문의하기 기능은 준비 중입니다. 고객센터 이메일을 이용해 주세요.')}
                  className="text-gray-400 hover:text-primary transition-colors cursor-pointer opacity-60"
                >
                  1:1 문의하기
                </button>
              </li>
            </ul>
          </div>

          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">기업 정보</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>상호명: {currentSettings.companyInfo.companyName}</li>
              {currentSettings.companyInfo.ceoName && <li>대표이사: {currentSettings.companyInfo.ceoName}</li>}
              <li>사업자등록번호: {currentSettings.businessRegistration.registrationNumber}</li>
              <li>통신판매업신고: {currentSettings.ecommerceRegistration.reportNumber}</li>
              {(currentSettings.businessRegistration.businessAddress || currentSettings.contactInfo.address) && (
                <li>주소: {currentSettings.businessRegistration.businessAddress || currentSettings.contactInfo.address}</li>
              )}
            </ul>
          </div>
        </div>

        {/* Trust Badges Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap justify-center md:justify-start gap-6 items-center">
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs font-medium">안전한 결제</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs font-medium">SSL 보안 인증</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5 text-reward-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="text-xs font-medium">개인정보 보호 인증</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 {currentSettings.siteName}. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href={currentSettings.legalInfo.privacyPolicyUrl} className="text-gray-400 hover:text-primary transition-colors text-sm">
              개인정보처리방침
            </Link>
            <Link href={currentSettings.legalInfo.termsOfServiceUrl} className="text-gray-400 hover:text-primary transition-colors text-sm">
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

