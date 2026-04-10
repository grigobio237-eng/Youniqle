import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

// 간단한 AdminSettings 스키마 정의
const AdminSettingsSchema = new mongoose.Schema({
  type: { type: String, required: true, default: 'system' },
  settings: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedBy: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const AdminSettings = mongoose.models.AdminSettings || mongoose.model('AdminSettings', AdminSettingsSchema);

// 기본 설정값
const defaultSettings = {
  general: {
    // 사이트 기본 정보
    siteName: 'Youniqle',
    siteDescription: 'AI 기반 개인화 이커머스 플랫폼',
    siteUrl: 'https://youniqle.com',
    adminEmail: 'admin@youniqle.com',
    timezone: 'Asia/Seoul',
    language: 'ko',

    // 회사 정보
    companyInfo: {
      companyName: '주식회사 사피에넷',
      businessNumber: '000-00-00000',
      ceoName: '',
      establishmentDate: '',
      businessType: '통신판매업',
      businessStatus: '영업중'
    },

    // 사업자등록증 정보
    businessRegistration: {
      registrationNumber: '000-00-00000',
      registrationDate: '',
      businessAddress: '',
      businessAddressDetail: '',
      businessPostalCode: '',
      businessPhone: '',
      businessFax: '',
      businessEmail: 'admin@youniqle.com'
    },

    // 통신판매업 신고 정보
    ecommerceRegistration: {
      reportNumber: '제2024-서울강남-0000호',
      reportDate: '',
      reportAuthority: '서울특별시 강남구청',
      reportStatus: '신고완료'
    },

    // 연락처 정보
    contactInfo: {
      customerServicePhone: '1588-0000',
      customerServiceEmail: 'cs@youniqle.com',
      businessInquiryPhone: '02-0000-0000',
      businessInquiryEmail: 'business@youniqle.com',
      address: '서울특별시 강남구 테헤란로 123',
      addressDetail: '그리고바이오 빌딩 10층',
      postalCode: '06292',
      fax: '02-0000-0001'
    },

    // 법적 고지사항
    legalInfo: {
      privacyPolicyUrl: '/privacy',
      termsOfServiceUrl: '/terms',
      refundPolicyUrl: '/refund',
      shippingPolicyUrl: '/shipping',
      returnPolicyUrl: '/return'
    }
  }
};

// 공개 설정 조회 (인증 불필요)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // 설정 조회 또는 기본값 반환
    let settings = await AdminSettings.findOne({ type: 'system' });

    if (!settings) {
      // 기본 설정 생성
      settings = new AdminSettings({
        type: 'system',
        settings: defaultSettings,
        updatedBy: 'system',
        updatedAt: new Date()
      });
      await settings.save();
    }

    // 공개적으로 노출해도 되는 정보만 반환
    const generalSettings = settings.settings?.general || defaultSettings.general;

    const publicSettings = {
      siteName: generalSettings.siteName || defaultSettings.general.siteName,
      siteDescription: generalSettings.siteDescription || defaultSettings.general.siteDescription,
      companyInfo: {
        companyName: generalSettings.companyInfo?.companyName || defaultSettings.general.companyInfo.companyName,
        businessNumber: generalSettings.companyInfo?.businessNumber || defaultSettings.general.companyInfo.businessNumber,
        ceoName: generalSettings.companyInfo?.ceoName || defaultSettings.general.companyInfo.ceoName,
        businessType: generalSettings.companyInfo?.businessType || defaultSettings.general.companyInfo.businessType,
        businessStatus: generalSettings.companyInfo?.businessStatus || defaultSettings.general.companyInfo.businessStatus
      },
      businessRegistration: {
        registrationNumber: generalSettings.businessRegistration?.registrationNumber || defaultSettings.general.businessRegistration.registrationNumber,
        businessAddress: generalSettings.businessRegistration?.businessAddress || defaultSettings.general.businessRegistration.businessAddress,
        businessAddressDetail: generalSettings.businessRegistration?.businessAddressDetail || defaultSettings.general.businessRegistration.businessAddressDetail,
        businessPhone: generalSettings.businessRegistration?.businessPhone || defaultSettings.general.businessRegistration.businessPhone,
        businessEmail: generalSettings.businessRegistration?.businessEmail || defaultSettings.general.businessRegistration.businessEmail
      },
      ecommerceRegistration: {
        reportNumber: generalSettings.ecommerceRegistration?.reportNumber || defaultSettings.general.ecommerceRegistration.reportNumber,
        reportAuthority: generalSettings.ecommerceRegistration?.reportAuthority || defaultSettings.general.ecommerceRegistration.reportAuthority
      },
      contactInfo: {
        customerServicePhone: generalSettings.contactInfo?.customerServicePhone || defaultSettings.general.contactInfo.customerServicePhone,
        customerServiceEmail: generalSettings.contactInfo?.customerServiceEmail || defaultSettings.general.contactInfo.customerServiceEmail,
        address: generalSettings.contactInfo?.address || defaultSettings.general.contactInfo.address,
        addressDetail: generalSettings.contactInfo?.addressDetail || defaultSettings.general.contactInfo.addressDetail,
        postalCode: generalSettings.contactInfo?.postalCode || defaultSettings.general.contactInfo.postalCode
      },
      legalInfo: {
        privacyPolicyUrl: generalSettings.legalInfo?.privacyPolicyUrl || defaultSettings.general.legalInfo.privacyPolicyUrl,
        termsOfServiceUrl: generalSettings.legalInfo?.termsOfServiceUrl || defaultSettings.general.legalInfo.termsOfServiceUrl
      }
    };

    return NextResponse.json({
      success: true,
      settings: publicSettings
    });

  } catch (error) {
    console.error('공개 설정 조회 오류:', error);
    return NextResponse.json(
      {
        error: '설정을 불러올 수 없습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
