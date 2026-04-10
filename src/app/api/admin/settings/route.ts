import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
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
  },
  security: {
    enableTwoFactor: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPassword: true
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    adminAlerts: true
  },
  performance: {
    enableCaching: true,
    cacheTimeout: 3600,
    enableCompression: true,
    maxFileSize: 10
  },
  maintenance: {
    maintenanceMode: false,
    maintenanceMessage: '시스템 점검 중입니다. 잠시 후 다시 방문해주세요.',
    allowAdminAccess: true
  }
};

// 설정 조회
export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }

    await connectDB();

    // 설정 조회 또는 기본값 반환
    let settings = await AdminSettings.findOne({ type: 'system' });

    if (!settings) {
      // 기본 설정 생성
      settings = new AdminSettings({
        type: 'system',
        settings: defaultSettings,
        updatedBy: authResult.userId,
        updatedAt: new Date()
      });
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      settings: settings.settings,
      lastUpdated: settings.updatedAt,
      updatedBy: settings.updatedBy
    });

  } catch (error) {
    console.error('설정 조회 오류:', error);
    return NextResponse.json(
      {
        error: '설정을 불러올 수 없습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// 설정 업데이트
export async function PUT(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }

    const { settings } = await request.json();

    if (!settings) {
      return NextResponse.json(
        { error: '설정 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    await connectDB();

    // 설정 검증
    const validatedSettings = validateSettings(settings);

    // 설정 업데이트 또는 생성
    const existingSettings = await AdminSettings.findOne({ type: 'system' });

    if (existingSettings) {
      existingSettings.settings = validatedSettings;
      existingSettings.updatedBy = authResult.userId;
      existingSettings.updatedAt = new Date();
      await existingSettings.save();
    } else {
      const newSettings = new AdminSettings({
        type: 'system',
        settings: validatedSettings,
        updatedBy: authResult.userId,
        updatedAt: new Date()
      });
      await newSettings.save();
    }

    // 설정 변경 로그 기록
    console.log(`🔧 관리자 설정 업데이트: ${authResult.userId}`, {
      timestamp: new Date().toISOString(),
      changes: Object.keys(validatedSettings)
    });

    return NextResponse.json({
      success: true,
      message: '설정이 성공적으로 저장되었습니다.',
      settings: validatedSettings,
      updatedAt: new Date()
    });

  } catch (error) {
    console.error('설정 업데이트 오류:', error);
    return NextResponse.json(
      {
        error: '설정 저장에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// 설정 초기화
export async function DELETE(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }

    await connectDB();

    // 설정을 기본값으로 초기화
    const existingSettings = await AdminSettings.findOne({ type: 'system' });

    if (existingSettings) {
      existingSettings.settings = defaultSettings;
      existingSettings.updatedBy = authResult.userId;
      existingSettings.updatedAt = new Date();
      await existingSettings.save();
    } else {
      const newSettings = new AdminSettings({
        type: 'system',
        settings: defaultSettings,
        updatedBy: authResult.userId,
        updatedAt: new Date()
      });
      await newSettings.save();
    }

    console.log(`🔄 관리자 설정 초기화: ${authResult.userId}`);

    return NextResponse.json({
      success: true,
      message: '설정이 기본값으로 초기화되었습니다.',
      settings: defaultSettings
    });

  } catch (error) {
    console.error('설정 초기화 오류:', error);
    return NextResponse.json(
      {
        error: '설정 초기화에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// 설정 검증 함수
function validateSettings(settings: any) {
  const validated = { ...defaultSettings };

  // 일반 설정 검증
  if (settings.general) {
    validated.general = {
      // 사이트 기본 정보
      siteName: typeof settings.general.siteName === 'string' ? settings.general.siteName : defaultSettings.general.siteName,
      siteDescription: typeof settings.general.siteDescription === 'string' ? settings.general.siteDescription : defaultSettings.general.siteDescription,
      siteUrl: typeof settings.general.siteUrl === 'string' ? settings.general.siteUrl : defaultSettings.general.siteUrl,
      adminEmail: typeof settings.general.adminEmail === 'string' ? settings.general.adminEmail : defaultSettings.general.adminEmail,
      timezone: typeof settings.general.timezone === 'string' ? settings.general.timezone : defaultSettings.general.timezone,
      language: typeof settings.general.language === 'string' ? settings.general.language : defaultSettings.general.language,

      // 회사 정보
      companyInfo: {
        companyName: typeof settings.general.companyInfo?.companyName === 'string' ? settings.general.companyInfo.companyName : defaultSettings.general.companyInfo.companyName,
        businessNumber: typeof settings.general.companyInfo?.businessNumber === 'string' ? settings.general.companyInfo.businessNumber : defaultSettings.general.companyInfo.businessNumber,
        ceoName: typeof settings.general.companyInfo?.ceoName === 'string' ? settings.general.companyInfo.ceoName : defaultSettings.general.companyInfo.ceoName,
        establishmentDate: typeof settings.general.companyInfo?.establishmentDate === 'string' ? settings.general.companyInfo.establishmentDate : defaultSettings.general.companyInfo.establishmentDate,
        businessType: typeof settings.general.companyInfo?.businessType === 'string' ? settings.general.companyInfo.businessType : defaultSettings.general.companyInfo.businessType,
        businessStatus: typeof settings.general.companyInfo?.businessStatus === 'string' ? settings.general.companyInfo.businessStatus : defaultSettings.general.companyInfo.businessStatus
      },

      // 사업자등록증 정보
      businessRegistration: {
        registrationNumber: typeof settings.general.businessRegistration?.registrationNumber === 'string' ? settings.general.businessRegistration.registrationNumber : defaultSettings.general.businessRegistration.registrationNumber,
        registrationDate: typeof settings.general.businessRegistration?.registrationDate === 'string' ? settings.general.businessRegistration.registrationDate : defaultSettings.general.businessRegistration.registrationDate,
        businessAddress: typeof settings.general.businessRegistration?.businessAddress === 'string' ? settings.general.businessRegistration.businessAddress : defaultSettings.general.businessRegistration.businessAddress,
        businessAddressDetail: typeof settings.general.businessRegistration?.businessAddressDetail === 'string' ? settings.general.businessRegistration.businessAddressDetail : defaultSettings.general.businessRegistration.businessAddressDetail,
        businessPostalCode: typeof settings.general.businessRegistration?.businessPostalCode === 'string' ? settings.general.businessRegistration.businessPostalCode : defaultSettings.general.businessRegistration.businessPostalCode,
        businessPhone: typeof settings.general.businessRegistration?.businessPhone === 'string' ? settings.general.businessRegistration.businessPhone : defaultSettings.general.businessRegistration.businessPhone,
        businessFax: typeof settings.general.businessRegistration?.businessFax === 'string' ? settings.general.businessRegistration.businessFax : defaultSettings.general.businessRegistration.businessFax,
        businessEmail: typeof settings.general.businessRegistration?.businessEmail === 'string' ? settings.general.businessRegistration.businessEmail : defaultSettings.general.businessRegistration.businessEmail
      },

      // 통신판매업 신고 정보
      ecommerceRegistration: {
        reportNumber: typeof settings.general.ecommerceRegistration?.reportNumber === 'string' ? settings.general.ecommerceRegistration.reportNumber : defaultSettings.general.ecommerceRegistration.reportNumber,
        reportDate: typeof settings.general.ecommerceRegistration?.reportDate === 'string' ? settings.general.ecommerceRegistration.reportDate : defaultSettings.general.ecommerceRegistration.reportDate,
        reportAuthority: typeof settings.general.ecommerceRegistration?.reportAuthority === 'string' ? settings.general.ecommerceRegistration.reportAuthority : defaultSettings.general.ecommerceRegistration.reportAuthority,
        reportStatus: typeof settings.general.ecommerceRegistration?.reportStatus === 'string' ? settings.general.ecommerceRegistration.reportStatus : defaultSettings.general.ecommerceRegistration.reportStatus
      },

      // 연락처 정보
      contactInfo: {
        customerServicePhone: typeof settings.general.contactInfo?.customerServicePhone === 'string' ? settings.general.contactInfo.customerServicePhone : defaultSettings.general.contactInfo.customerServicePhone,
        customerServiceEmail: typeof settings.general.contactInfo?.customerServiceEmail === 'string' ? settings.general.contactInfo.customerServiceEmail : defaultSettings.general.contactInfo.customerServiceEmail,
        businessInquiryPhone: typeof settings.general.contactInfo?.businessInquiryPhone === 'string' ? settings.general.contactInfo.businessInquiryPhone : defaultSettings.general.contactInfo.businessInquiryPhone,
        businessInquiryEmail: typeof settings.general.contactInfo?.businessInquiryEmail === 'string' ? settings.general.contactInfo.businessInquiryEmail : defaultSettings.general.contactInfo.businessInquiryEmail,
        address: typeof settings.general.contactInfo?.address === 'string' ? settings.general.contactInfo.address : defaultSettings.general.contactInfo.address,
        addressDetail: typeof settings.general.contactInfo?.addressDetail === 'string' ? settings.general.contactInfo.addressDetail : defaultSettings.general.contactInfo.addressDetail,
        postalCode: typeof settings.general.contactInfo?.postalCode === 'string' ? settings.general.contactInfo.postalCode : defaultSettings.general.contactInfo.postalCode,
        fax: typeof settings.general.contactInfo?.fax === 'string' ? settings.general.contactInfo.fax : defaultSettings.general.contactInfo.fax
      },

      // 법적 고지사항
      legalInfo: {
        privacyPolicyUrl: typeof settings.general.legalInfo?.privacyPolicyUrl === 'string' ? settings.general.legalInfo.privacyPolicyUrl : defaultSettings.general.legalInfo.privacyPolicyUrl,
        termsOfServiceUrl: typeof settings.general.legalInfo?.termsOfServiceUrl === 'string' ? settings.general.legalInfo.termsOfServiceUrl : defaultSettings.general.legalInfo.termsOfServiceUrl,
        refundPolicyUrl: typeof settings.general.legalInfo?.refundPolicyUrl === 'string' ? settings.general.legalInfo.refundPolicyUrl : defaultSettings.general.legalInfo.refundPolicyUrl,
        shippingPolicyUrl: typeof settings.general.legalInfo?.shippingPolicyUrl === 'string' ? settings.general.legalInfo.shippingPolicyUrl : defaultSettings.general.legalInfo.shippingPolicyUrl,
        returnPolicyUrl: typeof settings.general.legalInfo?.returnPolicyUrl === 'string' ? settings.general.legalInfo.returnPolicyUrl : defaultSettings.general.legalInfo.returnPolicyUrl
      }
    };
  }

  // 보안 설정 검증
  if (settings.security) {
    validated.security = {
      enableTwoFactor: typeof settings.security.enableTwoFactor === 'boolean' ? settings.security.enableTwoFactor : defaultSettings.security.enableTwoFactor,
      sessionTimeout: typeof settings.security.sessionTimeout === 'number' ? Math.max(1, Math.min(168, settings.security.sessionTimeout)) : defaultSettings.security.sessionTimeout,
      maxLoginAttempts: typeof settings.security.maxLoginAttempts === 'number' ? Math.max(1, Math.min(10, settings.security.maxLoginAttempts)) : defaultSettings.security.maxLoginAttempts,
      passwordMinLength: typeof settings.security.passwordMinLength === 'number' ? Math.max(6, Math.min(32, settings.security.passwordMinLength)) : defaultSettings.security.passwordMinLength,
      requireStrongPassword: typeof settings.security.requireStrongPassword === 'boolean' ? settings.security.requireStrongPassword : defaultSettings.security.requireStrongPassword
    };
  }

  // 알림 설정 검증
  if (settings.notifications) {
    validated.notifications = {
      emailNotifications: typeof settings.notifications.emailNotifications === 'boolean' ? settings.notifications.emailNotifications : defaultSettings.notifications.emailNotifications,
      smsNotifications: typeof settings.notifications.smsNotifications === 'boolean' ? settings.notifications.smsNotifications : defaultSettings.notifications.smsNotifications,
      pushNotifications: typeof settings.notifications.pushNotifications === 'boolean' ? settings.notifications.pushNotifications : defaultSettings.notifications.pushNotifications,
      adminAlerts: typeof settings.notifications.adminAlerts === 'boolean' ? settings.notifications.adminAlerts : defaultSettings.notifications.adminAlerts
    };
  }

  // 성능 설정 검증
  if (settings.performance) {
    validated.performance = {
      enableCaching: typeof settings.performance.enableCaching === 'boolean' ? settings.performance.enableCaching : defaultSettings.performance.enableCaching,
      cacheTimeout: typeof settings.performance.cacheTimeout === 'number' ? Math.max(60, Math.min(86400, settings.performance.cacheTimeout)) : defaultSettings.performance.cacheTimeout,
      enableCompression: typeof settings.performance.enableCompression === 'boolean' ? settings.performance.enableCompression : defaultSettings.performance.enableCompression,
      maxFileSize: typeof settings.performance.maxFileSize === 'number' ? Math.max(1, Math.min(100, settings.performance.maxFileSize)) : defaultSettings.performance.maxFileSize
    };
  }

  // 유지보수 설정 검증
  if (settings.maintenance) {
    validated.maintenance = {
      maintenanceMode: typeof settings.maintenance.maintenanceMode === 'boolean' ? settings.maintenance.maintenanceMode : defaultSettings.maintenance.maintenanceMode,
      maintenanceMessage: typeof settings.maintenance.maintenanceMessage === 'string' ? settings.maintenance.maintenanceMessage : defaultSettings.maintenance.maintenanceMessage,
      allowAdminAccess: typeof settings.maintenance.allowAdminAccess === 'boolean' ? settings.maintenance.allowAdminAccess : defaultSettings.maintenance.allowAdminAccess
    };
  }

  return validated;
}