'use client';

import Link from 'next/link';
import CharacterImage from '@/components/ui/CharacterImage';
import { useState, useEffect } from 'react';

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

  // 기본값 설정
  const defaultSettings: PublicSettings = {
    siteName: 'Youniqle',
    siteDescription: '고품질 상품을 합리적인 가격으로 제공하는 온라인 쇼핑몰입니다.',
    companyInfo: {
      companyName: '그리고바이오',
      businessNumber: '000-00-00000',
      ceoName: '',
      businessType: '통신판매업',
      businessStatus: '영업중'
    },
    businessRegistration: {
      registrationNumber: '000-00-00000',
      businessAddress: '',
      businessAddressDetail: '',
      businessPhone: '',
      businessEmail: 'admin@youniqle.com'
    },
    ecommerceRegistration: {
      reportNumber: '제2024-서울강남-0000호',
      reportAuthority: '서울특별시 강남구청'
    },
    contactInfo: {
      customerServicePhone: '1588-0000',
      customerServiceEmail: 'cs@youniqle.com',
      address: '서울특별시 강남구 테헤란로 123',
      addressDetail: '그리고바이오 빌딩 10층',
      postalCode: '06292'
    },
    legalInfo: {
      privacyPolicyUrl: '/privacy',
      termsOfServiceUrl: '/terms'
    }
  };

  const currentSettings = settings || defaultSettings;
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
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
              <span className="text-xl font-bold">{currentSettings.siteName}</span>
            </div>
            <p className="text-gray-400 text-sm">
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
                  상품 보기
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-primary transition-colors">
                  주문 내역
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => alert('문의하기 기능은 현재 준비 중입니다. 곧 서비스할 예정입니다.')}
                  className="text-gray-400 hover:text-primary transition-colors cursor-pointer opacity-60"
                >
                  문의하기
                </button>
              </li>
            </ul>
          </div>

          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">회사 정보</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>상호: {currentSettings.companyInfo.companyName}</li>
              {currentSettings.companyInfo.ceoName && <li>대표: {currentSettings.companyInfo.ceoName}</li>}
              <li>사업자등록번호: {currentSettings.businessRegistration.registrationNumber}</li>
              <li>통신판매업신고: {currentSettings.ecommerceRegistration.reportNumber}</li>
              {(currentSettings.businessRegistration.businessAddress || currentSettings.contactInfo.address) && (
                <li>주소: {currentSettings.businessRegistration.businessAddress || currentSettings.contactInfo.address}</li>
              )}
            </ul>
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

