import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // 승인된 파트너 중 'coach' 유형만 필터링
    const coaches = await User.find({
      partnerStatus: 'approved',
      'partnerApplication.partnerType': 'coach'
    })
    .select('name email coachProfile pavilionInfo partnerApplication.businessName')
    .lean();

    const formattedCoaches = coaches.map(coach => {
      const profile = coach.coachProfile || {};
      const pavilion = coach.pavilionInfo || {};
      
      return {
        id: coach._id,
        name: coach.name,
        // Top level fields for card compatibility
        title: profile.title || 'Recovery Curator',
        specialty: profile.specialty || '',
        description: profile.description || pavilion.roomDescription || '',
        philosophy: profile.philosophy || '',
        image: pavilion.characterImage || profile.profileImage || '/images/trainers/master_1.png',
        pavilionInfo: pavilion,
        // Nested coachProfile for the detail modal
        coachProfile: {
          ...profile,
          title: profile.title || 'Recovery Curator',
          specialty: profile.specialty || '',
          description: profile.description || '',
          philosophy: profile.philosophy || '',
          certifications: profile.certifications || [],
          programs: profile.programs || [],
          availability: (profile.availability || []).map((avail: any) => ({
            date: avail.date,
            slots: avail.slots || [],
            isAllDay: avail.isAllDay || false
          })),
          rating: profile.rating || 5.0,
          reviews: profile.reviews || 0,
          profileImage: profile.profileImage || '/images/trainers/master_1.png',
          socialMedia: profile.socialMedia || {}
        }
      };
    });

    console.log(`Fetched ${formattedCoaches.length} coaches. Example availability:`, JSON.stringify(formattedCoaches[0]?.coachProfile?.availability));
    return NextResponse.json({ coaches: formattedCoaches });
  } catch (error) {
    console.error('Coaches fetch error:', error);
    return NextResponse.json(
      { error: '코치 목록을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}
