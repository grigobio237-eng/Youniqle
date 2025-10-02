import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // 기존 테스트 계정 삭제
    await User.deleteMany({
      email: { $in: ['admin@youniqle.com', 'partner@youniqle.com', 'user@youniqle.com'] }
    });

    // 비밀번호 해시화
    const adminPassword = await bcrypt.hash('admin123!', 12);
    const partnerPassword = await bcrypt.hash('partner123!', 12);
    const userPassword = await bcrypt.hash('user123!', 12);

    // 1. 관리자 계정 생성
    const admin = new User({
      email: 'admin@youniqle.com',
      name: '관리자',
      password: adminPassword,
      role: 'admin',
      phone: '010-1234-5678',
      address: {
        street: '서울특별시 강남구 테헤란로 123',
        city: '서울',
        state: '강남구',
        zipCode: '06292',
        country: '대한민국'
      },
      preferences: {
        newsletter: true,
        notifications: true
      },
      partnerStatus: 'none'
    });
    await admin.save();

    // 2. 파트너 계정 생성 (승인됨)
    const partner = new User({
      email: 'partner@youniqle.com',
      name: '김파트너',
      password: partnerPassword,
      role: 'user',
      phone: '010-2345-6789',
      address: {
        street: '부산광역시 해운대구 센텀중앙로 456',
        city: '부산',
        state: '해운대구',
        zipCode: '48099',
        country: '대한민국'
      },
      preferences: {
        newsletter: true,
        notifications: true
      },
      partnerStatus: 'approved',
      partnerApplication: {
        businessName: '파트너샵',
        businessNumber: '123-45-67890',
        businessAddress: '부산광역시 해운대구 센텀중앙로 456',
        businessPhone: '051-123-4567',
        businessDescription: '고품질 상품을 합리적인 가격으로 제공하는 파트너샵입니다.',
        bankAccount: '123456789012',
        bankName: '국민은행',
        accountHolder: '김파트너',
        appliedAt: new Date('2024-01-01'),
        approvedAt: new Date('2024-01-02'),
        approvedBy: admin._id
      },
      partnerSettings: {
        commissionRate: 12,
        autoApproval: true,
        notificationEmail: 'partner@youniqle.com',
        notificationPhone: '010-2345-6789'
      },
      partnerStats: {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCommission: 0
      }
    });
    await partner.save();

    // 3. 일반 사용자 계정 생성
    const user = new User({
      email: 'user@youniqle.com',
      name: '이유저',
      password: userPassword,
      role: 'user',
      phone: '010-3456-7890',
      address: {
        street: '대구광역시 수성구 동대구로 789',
        city: '대구',
        state: '수성구',
        zipCode: '42170',
        country: '대한민국'
      },
      preferences: {
        newsletter: true,
        notifications: false
      },
      partnerStatus: 'none'
    });
    await user.save();

    return NextResponse.json({
      success: true,
      message: '테스트 계정이 성공적으로 생성되었습니다.',
      accounts: {
        admin: {
          email: 'admin@youniqle.com',
          password: 'admin123!',
          role: 'admin'
        },
        partner: {
          email: 'partner@youniqle.com',
          password: 'partner123!',
          role: 'partner',
          status: 'approved'
        },
        user: {
          email: 'user@youniqle.com',
          password: 'user123!',
          role: 'user'
        }
      }
    });

  } catch (error) {
    console.error('테스트 계정 생성 오류:', error);
    return NextResponse.json(
      { error: '테스트 계정 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
















