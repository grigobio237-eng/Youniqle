import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

// GET: 파트너 설정 조회
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('partner-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.type !== 'partner') {
      return NextResponse.json(
        { error: '파트너 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const partnerId = decoded.id;
    await connectDB();

    const partner = await User.findById(partnerId);
    if (!partner || partner.partnerStatus !== 'approved') {
      return NextResponse.json(
        { error: '승인된 파트너가 아닙니다.' },
        { status: 403 }
      );
    }

    const settings = {
      // 기본 정보
      name: partner.name,
      email: partner.email,
      phone: partner.phone,

      // 사업자 정보
      businessName: partner.partnerApplication?.businessName,
      businessNumber: partner.partnerApplication?.businessNumber,
      businessAddress: partner.partnerApplication?.businessAddress,
      businessPhone: partner.partnerApplication?.businessPhone,
      businessDescription: partner.partnerApplication?.businessDescription,

      // 정산 정보
      bankName: partner.partnerApplication?.bankName,
      bankAccount: partner.partnerApplication?.bankAccount,
      accountHolder: partner.partnerApplication?.accountHolder,
      commissionRate: partner.partnerSettings?.commissionRate || 10,

      // 알림 설정
      notificationEmail: partner.partnerSettings?.notificationEmail || partner.email,
      notificationPhone: partner.partnerSettings?.notificationPhone || partner.phone,
      autoApproval: partner.partnerSettings?.autoApproval || false,

      // 알림 옵션
      emailNotifications: partner.partnerSettings?.emailNotifications || {
        newOrder: true,
        lowStock: true,
        paymentReceived: true,
        systemUpdates: true
      },

      // 운영 설정
      businessHours: partner.partnerSettings?.businessHours || {},
      autoReplyMessage: partner.partnerSettings?.autoReplyMessage || '',
      autoReplyEnabled: partner.partnerSettings?.autoReplyEnabled || false,

      // 브랜딩
      shopLogo: partner.partnerSettings?.shopLogo || '',
      shopBanner: partner.partnerSettings?.shopBanner || '',

      // 코치 프로필 (코치 파트너인 경우)
      partnerType: partner.partnerApplication?.partnerType,
      coachProfile: partner.coachProfile || {
        title: '',
        specialty: '',
        philosophy: '',
        description: '',
        certifications: [],
        programs: [],
        profileImage: ''
      }
    };

    return NextResponse.json(settings);

  } catch (error) {
    console.error('Partner settings fetch error:', error);
    return NextResponse.json(
      { error: '설정을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

// PATCH: 파트너 설정 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('partner-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.type !== 'partner') {
      return NextResponse.json(
        { error: '파트너 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const partnerId = decoded.id;
    const updates = await request.json();

    await connectDB();

    const partner = await User.findById(partnerId);
    if (!partner || partner.partnerStatus !== 'approved') {
      return NextResponse.json(
        { error: '승인된 파트너가 아닙니다.' },
        { status: 403 }
      );
    }

    // 기본 정보 업데이트
    if (updates.name) partner.name = updates.name;
    if (updates.phone !== undefined) partner.phone = updates.phone;

    // 사업자 정보 업데이트
    if (updates.businessName) {
      partner.partnerApplication = partner.partnerApplication || {};
      partner.partnerApplication.businessName = updates.businessName;
    }
    if (updates.businessNumber) {
      partner.partnerApplication = partner.partnerApplication || {};
      partner.partnerApplication.businessNumber = updates.businessNumber;
    }
    if (updates.businessAddress) {
      partner.partnerApplication = partner.partnerApplication || {};
      partner.partnerApplication.businessAddress = updates.businessAddress;
    }
    if (updates.businessPhone) {
      partner.partnerApplication = partner.partnerApplication || {};
      partner.partnerApplication.businessPhone = updates.businessPhone;
    }
    if (updates.businessDescription !== undefined) {
      partner.partnerApplication = partner.partnerApplication || {};
      partner.partnerApplication.businessDescription = updates.businessDescription;
    }

    // 정산 정보 업데이트
    if (updates.bankName) {
      partner.partnerApplication = partner.partnerApplication || {};
      partner.partnerApplication.bankName = updates.bankName;
    }
    if (updates.bankAccount) {
      partner.partnerApplication = partner.partnerApplication || {};
      partner.partnerApplication.bankAccount = updates.bankAccount;
    }
    if (updates.accountHolder) {
      partner.partnerApplication = partner.partnerApplication || {};
      partner.partnerApplication.accountHolder = updates.accountHolder;
    }

    // 알림 설정 업데이트
    if (updates.notificationEmail !== undefined) {
      partner.partnerSettings = partner.partnerSettings || {};
      partner.partnerSettings.notificationEmail = updates.notificationEmail;
    }
    if (updates.notificationPhone !== undefined) {
      partner.partnerSettings = partner.partnerSettings || {};
      partner.partnerSettings.notificationPhone = updates.notificationPhone;
    }
    if (updates.autoApproval !== undefined) {
      partner.partnerSettings = partner.partnerSettings || {};
      partner.partnerSettings.autoApproval = updates.autoApproval;
    }
    if (updates.emailNotifications) {
      partner.partnerSettings = partner.partnerSettings || {};
      partner.partnerSettings.emailNotifications = updates.emailNotifications;
    }
    if (updates.businessHours) {
      partner.partnerSettings = partner.partnerSettings || {};
      partner.partnerSettings.businessHours = updates.businessHours;
    }
    if (updates.autoReplyMessage !== undefined) {
      partner.partnerSettings = partner.partnerSettings || {};
      partner.partnerSettings.autoReplyMessage = updates.autoReplyMessage;
    }
    if (updates.autoReplyEnabled !== undefined) {
      partner.partnerSettings = partner.partnerSettings || {};
      partner.partnerSettings.autoReplyEnabled = updates.autoReplyEnabled;
    }
    if (updates.shopLogo !== undefined) {
      partner.partnerSettings = partner.partnerSettings || {};
      partner.partnerSettings.shopLogo = updates.shopLogo;
    }
    if (updates.shopBanner !== undefined) {
      partner.partnerSettings = partner.partnerSettings || {};
      partner.partnerSettings.shopBanner = updates.shopBanner;
    }

    // 코치 프로필 업데이트
    if (updates.coachProfile) {
      partner.coachProfile = partner.coachProfile || {};
      if (updates.coachProfile.title !== undefined) partner.coachProfile.title = updates.coachProfile.title;
      if (updates.coachProfile.specialty !== undefined) partner.coachProfile.specialty = updates.coachProfile.specialty;
      if (updates.coachProfile.philosophy !== undefined) partner.coachProfile.philosophy = updates.coachProfile.philosophy;
      if (updates.coachProfile.description !== undefined) partner.coachProfile.description = updates.coachProfile.description;
      if (updates.coachProfile.certifications !== undefined) partner.coachProfile.certifications = updates.coachProfile.certifications;
      if (updates.coachProfile.programs !== undefined) partner.coachProfile.programs = updates.coachProfile.programs;
      if (updates.coachProfile.profileImage !== undefined) partner.coachProfile.profileImage = updates.coachProfile.profileImage;
    }

    await partner.save();

    return NextResponse.json({
      message: '설정이 저장되었습니다.'
    });

  } catch (error) {
    console.error('Partner settings update error:', error);
    return NextResponse.json(
      { error: '설정 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}

