'use client';

import Link from 'next/link';
import CharacterImage from '@/components/ui/CharacterImage';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

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

