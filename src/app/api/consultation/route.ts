import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import PreConsultation from '@/models/PreConsultation';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await req.json();
    
    // 유저의 recentNavigator 값이 세션에 있다면 (네비게이터 추천으로 온 유저), 이를 기록
    const navigatorCode = (session.user as any)?.recentNavigator || '';

    const newConsultation = new PreConsultation({
      user: (session.user as any).id,
      navigator: navigatorCode,
      expectation: data.expectation,
      medicalHistory: data.medicalHistory,
      anxiety: data.anxiety,
      visitPlan: data.visitPlan,
      investment: data.investment,
    });

    await newConsultation.save();

    return NextResponse.json({ 
      success: true, 
      consultationId: newConsultation._id 
    });

  } catch (error) {
    console.error('Failed to save pre-consultation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(req.url);
    const mode = url.searchParams.get('mode'); // 'admin' 혹은 'navigator'

    let query = {};

    // 1. 관리자인 경우 모든 데이터를 볼 수 있음
    if ((session.user as any).role === 'admin') {
      // no filter needed
    } 
    // 2. 네비게이터 권한인 경우 본인을 거쳐간 유저의 데이터만 볼 수 있게 제한
    else if ((session.user as any).isNavigator || mode === 'navigator') {
      // session.user.email 이나 고유 추천 코드로 검색해야 함. 
      // (auth.ts 기준 네비게이터의 추천 코드가 recentNavigator 에 들어감. 추천 코드는 referralCode 이거나 email 앞단)
      // 정확한 조회를 위해 토큰의 email로 User.findOne 을 해 referralCode 조회
      // 편의상 이 API 호출 전 클라이언트에서 navigatorCode를 넘기거나 여기서 조회
      const { default: User } = await import('@/models/User');
      const me = await User.findById((session.user as any).id);
      if (!me || (!me.isNavigator && me.role !== 'admin')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      query = { navigator: me.referralCode };
    } 
    // 3. 일반 유저인 경우 본인의 데이터만 조회
    else {
      query = { user: (session.user as any).id };
    }

    const consultations = await PreConsultation.find(query)
      .populate('user', 'name email image')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ consultations });

  } catch (error) {
    console.error('Failed to fetch pre-consultations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
