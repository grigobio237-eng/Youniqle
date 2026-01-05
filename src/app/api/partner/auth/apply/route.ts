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
      partnerType,
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

    // 입력 데이터 로그 (디버깅용)
    console.log('Partner application data:', {
      email, name, phone, partnerType,
      businessName, businessNumber,
      businessAddress, businessPhone,
      businessDescription, bankAccount, bankName, accountHolder
    });

    // 기본 필수 필드 검증 (모든 유형 공통)
    if (!email || !name || !phone) {
      return NextResponse.json(
        { error: '기본 정보를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 파트너 유형별 필수 필드 검증
    const type = partnerType || 'business'; // 기본값은 business

    if (type === 'shopper') {
      // 쇼퍼는 추가 필수 필드 없음 (은행 정보도 선택 사항일 수 있으나, 정산을 위해 받는 것이 좋음 - 여기서는 일단 통장 사본만 제외하고 계좌 정보는 받도록 함)
      if (!bankAccount || !bankName || !accountHolder) {
        return NextResponse.json(
          { error: '정산 계좌 정보를 입력해주세요.' },
          { status: 400 }
        );
      }
    } else if (type === 'business') {
      // 사업장회원: 모든 필드 필수
      if (!businessName || !businessNumber || !businessAddress || !businessPhone || !businessDescription || !bankAccount || !bankName || !accountHolder || !businessRegistrationImage || !bankStatementImage) {
        return NextResponse.json(
          { error: '모든 필수 필드를 입력해주세요.' },
          { status: 400 }
        );
      }
    } else if (type === 'coach') {
      // 코치 회원: 상호명(샵 이름), 계좌 정보 필수. 사업자 번호, 자격증, 통장사본은 선택.
      if (!businessName || !businessPhone || !businessDescription || !bankAccount || !bankName || !accountHolder) {
        return NextResponse.json(
          { error: '필수 정보를 모두 입력해주세요. (샵 이름, 연락처, 소개, 계좌 정보)' },
          { status: 400 }
        );
      }
    } else if (type === 'artist') {
      // 작가 회원: 상호명(갤러리 이름), 계좌 정보 필수. 사업자 번호, 포트폴리오, 통장사본은 선택.
      if (!businessName || !businessPhone || !businessDescription || !bankAccount || !bankName || !accountHolder) {
        return NextResponse.json(
          { error: '필수 정보를 모두 입력해주세요. (갤러리 이름, 연락처, 소개, 계좌 정보)' },
          { status: 400 }
        );
      }
    }

    await connectDB();

    // 기존 사용자 찾기
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      // 이미 파트너 승인이 되었거나 검토 중인 경우 제외 (rejected인 경우 재신청 가능하도록)
      if (['approved', 'pending', 'suspended'].includes(existingUser.partnerStatus)) {
        const msg = existingUser.partnerStatus === 'approved' ? '이미 파트너입니다.' :
          existingUser.partnerStatus === 'pending' ? '이미 파트너 신청이 진행 중입니다.' : '정지된 파트너 계정입니다.';

        console.log(`[PARTNER_APPLY_BLOCK] Email: ${email}, Status: ${existingUser.partnerStatus}, UserID: ${existingUser._id}`);

        return NextResponse.json(
          { error: `${msg} (Debug: ${email} is ${existingUser.partnerStatus})` },
          { status: 400 }
        );
      }

      // 기존 사용자에게 파트너 신청 정보 추가 (pending으로 변경 및 정보 업데이트)
      existingUser.partnerStatus = 'pending';
      existingUser.partnerApplication = {
        partnerType: partnerType || 'business',
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
        partnerType: partnerType || 'business',
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
