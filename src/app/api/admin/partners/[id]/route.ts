import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnerId } = await params;
    const { action, data } = await request.json();

    await connectDB();

    const partner = await User.findById(partnerId);
    if (!partner) {
      return NextResponse.json(
        { error: '파트너를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'approve':
        // 파트너 승인 (role은 user로 유지)
        partner.partnerStatus = 'approved';
        // partner.role = 'partner'; // role 변경하지 않음 - user로 유지
        if (partner.partnerApplication) {
          partner.partnerApplication.approvedAt = new Date();
        }
        break;

      case 'reject':
        // 파트너 거부
        partner.partnerStatus = 'rejected';
        if (partner.partnerApplication) {
          partner.partnerApplication.rejectedAt = new Date();
          partner.partnerApplication.rejectedReason = data.reason || '승인 기준에 맞지 않습니다.';
        }
        break;

      case 'suspend':
        // 파트너 정지
        partner.partnerStatus = 'suspended';
        break;

      case 'update-commission':
        // 수수료율 변경
        if (!partner.partnerSettings) {
          partner.partnerSettings = {
            commissionRate: 10,
            autoApproval: false,
            notificationEmail: partner.email,
            notificationPhone: partner.phone || ''
          };
        }
        partner.partnerSettings.commissionRate = data.commissionRate || 10;
        break;

      default:
        return NextResponse.json(
          { error: '알 수 없는 작업입니다.' },
          { status: 400 }
        );
    }

    await partner.save();

    return NextResponse.json({
      message: '파트너 정보가 업데이트되었습니다.',
      partner: {
        id: partner._id.toString(),
        name: partner.name,
        email: partner.email,
        partnerStatus: partner.partnerStatus,
        businessName: partner.partnerApplication?.businessName,
        commissionRate: partner.partnerSettings?.commissionRate || 10
      }
    });

  } catch (error) {
    console.error('Admin partner update error:', error);
    return NextResponse.json(
      { error: '파트너 정보 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}
