import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AdminSettings from '@/models/AdminSettings';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // 기본 설정값
    const defaultSettings = {
      general: {
        siteName: 'Youniqle',
        siteDescription: '프리미엄 온라인 쇼핑 플랫폼',
        siteLogo: '',
        siteFavicon: '',
        defaultLanguage: 'ko',
        timezone: 'Asia/Seoul',
        dateFormat: 'YYYY-MM-DD',
        currency: 'KRW',
        currencySymbol: '₩',
        maintenanceMode: false,
        maintenanceMessage: '현재 시스템 점검 중입니다. 잠시 후 다시 방문해 주세요.'
      },
      security: {
        enableTwoFactor: false,
        sessionTimeout: 60,
        maxLoginAttempts: 5,
        lockoutDuration: 30,
        requireStrongPassword: true,
        passwordMinLength: 8,
        enableCaptcha: false,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
        maxFileSize: 10,
        enableRateLimiting: true,
        rateLimitWindow: 15,
        rateLimitMax: 100
      },
      notifications: {
        emailNotifications: true,
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        smtpSecure: true,
        fromEmail: 'noreply@youniqle.com',
        fromName: 'Youniqle',
        adminEmails: ['admin@youniqle.com'],
        orderNotifications: true,
        userNotifications: true,
        systemNotifications: true,
        pushNotifications: false,
        smsNotifications: false
      },
      payment: {
        defaultPaymentMethod: 'card',
        enablePaypal: false,
        paypalClientId: '',
        paypalClientSecret: '',
        enableStripe: false,
        stripePublishableKey: '',
        stripeSecretKey: '',
        enableNicepay: true,
        nicepayMid: '',
        nicepaySecretKey: '',
        enableEscrow: true,
        escrowCommission: 3.5,
        enableRefund: true,
        refundPeriod: 7
      },
      business: {
        companyName: '그리고바이오',
        businessNumber: '000-00-00000',
        ceoName: '',
        address: '',
        phone: '',
        email: 'admin@youniqle.com',
        taxRate: 10,
        shippingCost: 3000,
        freeShippingThreshold: 50000,
        returnPolicy: '',
        privacyPolicy: '',
        termsOfService: '',
        commissionRate: 5,
        partnerApprovalRequired: true,
        autoApprovePartners: false
      },
      seo: {
        metaTitle: 'Youniqle - 프리미엄 온라인 쇼핑',
        metaDescription: '최고 품질의 상품을 합리적인 가격에 만나보세요',
        metaKeywords: '쇼핑, 온라인, 프리미엄, 상품',
        googleAnalyticsId: '',
        googleTagManagerId: '',
        facebookPixelId: '',
        enableSitemap: true,
        enableRobotsTxt: true,
        canonicalUrl: 'https://youniqle.com'
      },
      performance: {
        enableCaching: true,
        cacheDuration: 3600,
        enableImageOptimization: true,
        enableLazyLoading: true,
        enableCompression: true,
        maxConcurrentRequests: 100,
        enableCdn: false,
        cdnUrl: ''
      },
      backup: {
        enableAutoBackup: true,
        backupFrequency: 'daily',
        backupRetention: 30,
        backupLocation: '/backup',
        enableDatabaseBackup: true,
        enableFileBackup: true,
        backupNotifications: true
      }
    };

    // 기존 설정 조회
    let settings = await AdminSettings.findOne();
    
    if (!settings) {
      // 기본 설정으로 새 문서 생성
      settings = new AdminSettings({
        ...defaultSettings,
        lastUpdated: new Date()
      });
      await settings.save();
    }

    return NextResponse.json(settings);

  } catch (error) {
    console.error('Admin settings fetch error:', error);
    return NextResponse.json(
      { error: '설정을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const updatedSettings = await request.json();

    // 설정 업데이트
    const settings = await AdminSettings.findOneAndUpdate(
      {},
      {
        ...updatedSettings,
        lastUpdated: new Date()
      },
      { 
        upsert: true, 
        new: true 
      }
    );

    return NextResponse.json({
      message: '설정이 저장되었습니다.',
      settings
    });

  } catch (error) {
    console.error('Admin settings update error:', error);
    return NextResponse.json(
      { error: '설정 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    // 설정 초기화
    await AdminSettings.deleteMany({});

    return NextResponse.json({
      message: '설정이 초기화되었습니다.'
    });

  } catch (error) {
    console.error('Admin settings reset error:', error);
    return NextResponse.json(
      { error: '설정 초기화에 실패했습니다.' },
      { status: 500 }
    );
  }
}
