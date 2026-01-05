import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    await connectDB();

    // 검색 조건 구성 - 파트너 신청자 또는 승인된 파트너 조회
    const filter: any = {
      partnerStatus: { $in: ['pending', 'approved', 'rejected', 'suspended'] }
    };
    const totalUserCount = await User.countDocuments();
    console.log(`[DEBUG] Total User Count in DB: ${totalUserCount}`);

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'partnerApplication.businessName': { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      filter.partnerStatus = status;
    }

    console.log('🔍 파트너 관리 API 필터:', JSON.stringify(filter, null, 2));

    // 파트너 목록 조회
    const partners = await User.find(filter)
      .select('-passwordHash -emailVerificationToken')
      .sort({ createdAt: -1 })
      .limit(100);

    console.log(`📊 파트너 조회 결과: ${partners.length}명`);
    partners.forEach((partner: any, index: number) => {
      console.log(`${index + 1}. ${partner.email} - status: ${partner.partnerStatus}, name: ${partner.name}`);
    });

    // 만약 pending인 유저가 하나도 없다면, 전체 유저 중 pending인 유저가 있는지 별도로 확인 (디버깅용)
    if (partners.filter((p: any) => p.partnerStatus === 'pending').length === 0) {
      const allPendingCount = await User.countDocuments({ partnerStatus: 'pending' });
      console.log(`❗ [DEBUG] 필터링 제외 DB 전체의 pending 유저 수: ${allPendingCount}`);
    }

    const partnersData = partners.map((partner: any) => ({
      id: partner._id.toString(),
      name: partner.name,
      email: partner.email,
      phone: partner.phone,
      partnerStatus: partner.partnerStatus,
      partnerApplication: partner.partnerApplication ? {
        partnerType: partner.partnerApplication.partnerType,
        businessName: partner.partnerApplication.businessName,
        businessNumber: partner.partnerApplication.businessNumber,
        businessAddress: partner.partnerApplication.businessAddress,
        businessPhone: partner.partnerApplication.businessPhone,
        businessDescription: partner.partnerApplication.businessDescription,
        bankAccount: partner.partnerApplication.bankAccount,
        bankName: partner.partnerApplication.bankName,
        accountHolder: partner.partnerApplication.accountHolder,
        businessRegistrationImage: partner.partnerApplication.businessRegistrationImage,
        bankStatementImage: partner.partnerApplication.bankStatementImage,
        appliedAt: partner.partnerApplication.appliedAt,
        approvedAt: partner.partnerApplication.approvedAt,
        rejectedAt: partner.partnerApplication.rejectedAt,
        rejectedReason: partner.partnerApplication.rejectedReason
      } : undefined,
      partnerSettings: partner.partnerSettings ? {
        commissionRate: partner.partnerSettings.commissionRate
      } : undefined,
      partnerStats: partner.partnerStats,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt
    }));

    return NextResponse.json({ partners: partnersData });

  } catch (error) {
    console.error('Admin partners fetch error:', error);
    return NextResponse.json(
      { error: '파트너 목록을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}
