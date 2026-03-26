import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

// GET: 파트너의 파빌리온 설정 조회
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

    return NextResponse.json({
      partnerType: partner.partnerApplication?.partnerType || 'trainer',
      pavilionInfo: {
        characterImage: '',
        roomDescription: '',
        roomMusic: '',
        roomTheme: 'premium',
        isActive: true,
        ...(partner.pavilionInfo || {})
      },
      coachProfile: partner.coachProfile
    });

  } catch (error) {
    console.error('Pavilion settings fetch error:', error);
    return NextResponse.json(
      { error: '설정을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

// PATCH: 파트너의 파빌리온 설정 업데이트
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
    const { pavilionInfo, coachProfile } = await request.json();
    
    console.log('--- RECEIVED DATA ---');
    console.log('pavilionInfo:', JSON.stringify(pavilionInfo, null, 2));
    console.log('coachProfile availability count:', coachProfile?.availability?.length || 0);

    await connectDB();

    const partner = await User.findById(partnerId);
    if (!partner || partner.partnerStatus !== 'approved') {
      return NextResponse.json(
        { error: '승인된 파트너가 아닙니다.' },
        { status: 403 }
      );
    }

    if (pavilionInfo) {
      const currentPavilion = partner.pavilionInfo?.toObject ? partner.pavilionInfo.toObject() : (partner.pavilionInfo || {});
      partner.pavilionInfo = {
        ...currentPavilion,
        ...pavilionInfo
      };
    }

    if (coachProfile) {
      console.log('--- COACH PROFILE UPDATE ---');
      console.log('Incoming availability:', JSON.stringify(coachProfile.availability, null, 2));
      
      if (!partner.coachProfile) partner.coachProfile = {};
      
      // Update simple fields
      if (coachProfile.title !== undefined) partner.coachProfile.title = coachProfile.title;
      if (coachProfile.specialty !== undefined) partner.coachProfile.specialty = coachProfile.specialty;
      if (coachProfile.philosophy !== undefined) partner.coachProfile.philosophy = coachProfile.philosophy;
      if (coachProfile.description !== undefined) partner.coachProfile.description = coachProfile.description;
      if (coachProfile.profileImage !== undefined) partner.coachProfile.profileImage = coachProfile.profileImage;

      // Update arrays (Explicit re-assignment for Mongoose)
      if (coachProfile.availability) {
        console.log('Explicitly setting availability, count:', coachProfile.availability.length);
        partner.coachProfile.availability = coachProfile.availability;
      }
      if (coachProfile.programs) {
        partner.coachProfile.programs = coachProfile.programs;
      }
      if (coachProfile.socialMedia) {
        partner.coachProfile.socialMedia = {
          ...(partner.coachProfile.socialMedia || {}),
          ...coachProfile.socialMedia
        };
      }

      // Mark fields as modified
      partner.markModified('coachProfile');
      if (coachProfile.availability) partner.markModified('coachProfile.availability');
      if (coachProfile.programs) partner.markModified('coachProfile.programs');
    }

    console.log('Saving partner document for:', partner.email);
    await partner.save();
    console.log('Save successful. Saved availability count:', partner.coachProfile?.availability?.length || 0);

    return NextResponse.json({
      message: '설정이 저장되었습니다.',
      pavilionInfo: partner.pavilionInfo,
      coachProfile: partner.coachProfile
    });

  } catch (error) {
    console.error('Pavilion settings update error:', error);
    return NextResponse.json(
      { error: '설정 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}
