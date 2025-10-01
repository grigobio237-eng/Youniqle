import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      name,
      phone,
      businessName,
      businessNumber,
      businessAddress,
      businessPhone,
      businessDescription,
      bankAccount,
      bankName,
      accountHolder,
      businessRegistrationImage,
      bankStatementImage
    } = await request.json();

    // 필수 필드 검증
    if (!email || !name || !businessName || !businessNumber || !businessAddress || !businessPhone || !businessDescription || !bankAccount || !bankName || !accountHolder || !businessRegistrationImage || !bankStatementImage) {
      return NextResponse.json(
        { error: '모든 필수 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    await connectDB();

    // 기존 사용자 찾기
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      // 이미 파트너 신청을 한 경우
      if (existingUser.partnerStatus !== 'none') {
        return NextResponse.json(
          { error: '이미 파트너 신청을 하셨거나 파트너입니다.' },
          { status: 400 }
        );
      }

      // 기존 사용자에게 파트너 신청 정보 추가
      existingUser.partnerStatus = 'pending';
      existingUser.partnerApplication = {
        businessName,
        businessNumber,
        businessAddress,
        businessPhone,
        businessDescription,
        bankAccount,
        bankName,
        accountHolder,
        businessRegistrationImage,
        bankStatementImage,
        appliedAt: new Date()
      };
      existingUser.partnerSettings = {
        commissionRate: 10,
        autoApproval: false,
        notificationEmail: email,
        notificationPhone: phone || ''
      };
      existingUser.partnerStats = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCommission: 0
      };

      await existingUser.save();

      return NextResponse.json({
        message: '파트너 신청이 완료되었습니다.',
        partner: {
          id: existingUser._id,
          email: existingUser.email,
          name: existingUser.name,
          businessName: existingUser.partnerApplication?.businessName,
          partnerStatus: existingUser.partnerStatus
        }
      }, { status: 201 });
    }

    // 사업자등록번호 중복 확인
    const existingPartner = await User.findOne({
      'partnerApplication.businessNumber': businessNumber,
      partnerStatus: { $in: ['pending', 'approved'] }
    });
    if (existingPartner) {
      return NextResponse.json(
        { error: '이미 등록된 사업자등록번호입니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 해싱
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 새 사용자 생성 (파트너 신청 상태)
    const newPartner = new User({
      email: email.toLowerCase(),
      passwordHash,
      name,
      phone,
      role: 'user', // 파트너도 일반 사용자 역할 유지
      grade: 'cedar',
      points: 0,
      emailVerified: false,
      partnerStatus: 'pending',
      partnerApplication: {
        businessName,
        businessNumber,
        businessAddress,
        businessPhone,
        businessDescription,
        bankAccount,
        bankName,
        accountHolder,
        appliedAt: new Date()
      },
      partnerSettings: {
        commissionRate: 10, // 기본 수수료율 10%
        autoApproval: false,
        notificationEmail: email,
        notificationPhone: phone
      },
      partnerStats: {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCommission: 0
      },
      addresses: [],
      wishlist: []
    });

    await newPartner.save();

    // TODO: 관리자에게 파트너 신청 알림 이메일 발송
    // TODO: 신청자에게 신청 완료 이메일 발송

    return NextResponse.json({
      message: '파트너 신청이 완료되었습니다.',
      partner: {
        id: newPartner._id,
        email: newPartner.email,
        name: newPartner.name,
        businessName: newPartner.partnerApplication?.businessName,
        partnerStatus: newPartner.partnerStatus
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Partner application error:', error);
    return NextResponse.json(
      { error: '파트너 신청에 실패했습니다.' },
      { status: 500 }
    );
  }
}
