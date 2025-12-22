'use client';

import Link from 'next/link';
import CharacterImage from '@/components/ui/CharacterImage';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
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

  // 기본값 설정
  const defaultSettings: PublicSettings = {
    siteName: 'Youniqle',
    siteDescription: '라이프스타일 큐레이션 & 회복 솔루션',
    companyInfo: {
      companyName: 'SAPIENET',
      businessNumber: '123-45-67890',
      ceoName: '이승윤',
      businessType: '통신판매업 / 바이오 헬스케어',
      businessStatus: '영업중'
    },
    businessRegistration: {
      registrationNumber: '123-45-67890',
      businessAddress: '서울특별시 강남구 테헤란로 123, 그리고타워 10층',
      businessAddressDetail: '',
      businessPhone: '02-1234-5678',
      businessEmail: 'support@sapienet.com'
    },
    ecommerceRegistration: {
      reportNumber: '2024-서울강남-01234',
      reportAuthority: '서울특별시 강남구청'
    },
    contactInfo: {
      customerServicePhone: '02-1234-5678',
      customerServiceEmail: 'help@youniqle.com',
      address: '서울특별시 강남구 테헤란로 123',
      addressDetail: '그리고타워 10층',
      postalCode: '06234'
    },
    legalInfo: {
      privacyPolicyUrl: '/privacy',
      termsOfServiceUrl: '/terms'
    }
  };

  const currentSettings = settings || defaultSettings;

  return (
    <footer className={`bg-gray-900 text-white ${shouldShowFooterOnMobile ? '' : 'hidden md:block'}`}>
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
              <span className="text-xl font-bold">Youniqle <span className="text-sm font-normal text-gray-400 ml-1">by SAPIENET</span></span>
            </div>
            <p className="text-gray-400 text-sm">
              {currentSettings.siteDescription}
            </p>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('footer.customerCenter')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-400">{t('footer.phone')}: </span>
                <a href={`tel:${currentSettings.contactInfo.customerServicePhone}`} className="hover:text-primary transition-colors">
                  {currentSettings.contactInfo.customerServicePhone}
                </a>
              </li>
              <li>
                <span className="text-gray-400">{t('footer.email')}: </span>
                <a href={`mailto:${currentSettings.contactInfo.customerServiceEmail}`} className="hover:text-primary transition-colors">
                  {currentSettings.contactInfo.customerServiceEmail}
                </a>
              </li>
              <li className="text-gray-400">{t('footer.operatingHours')}: {t('footer.operatingHoursDetail')}</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-primary transition-colors">
                  {t('footer.viewProducts')}
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-primary transition-colors">
                  {t('footer.orderHistory')}
                </Link>
              </li>
              <li>
                <button
                  onClick={() => alert(t('footer.contactAlert'))}
                  className="text-gray-400 hover:text-primary transition-colors cursor-pointer opacity-60"
                >
                  {t('footer.contactUs')}
                </button>
              </li>
            </ul>
          </div>

          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('footer.companyInfo')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>{t('footer.companyName')}: {currentSettings.companyInfo.companyName}</li>
              {currentSettings.companyInfo.ceoName && <li>{t('footer.ceo')}: {currentSettings.companyInfo.ceoName}</li>}
              <li>{t('footer.businessNumber')}: {currentSettings.businessRegistration.registrationNumber}</li>
              <li>{t('footer.ecommerceReport')}: {currentSettings.ecommerceRegistration.reportNumber}</li>
              {(currentSettings.businessRegistration.businessAddress || currentSettings.contactInfo.address) && (
                <li>{t('footer.address')}: {currentSettings.businessRegistration.businessAddress || currentSettings.contactInfo.address}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 {currentSettings.siteName}. {t('footer.copyright')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href={currentSettings.legalInfo.privacyPolicyUrl} className="text-gray-400 hover:text-primary transition-colors text-sm">
              {t('footer.privacyPolicy')}
            </Link>
            <Link href={currentSettings.legalInfo.termsOfServiceUrl} className="text-gray-400 hover:text-primary transition-colors text-sm">
              {t('footer.termsOfService')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

