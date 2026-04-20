import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import PreConsultation from '@/models/PreConsultation';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const consultation = await PreConsultation.findById(id)
      .populate('user', 'name email image referralCode isNavigator')
      .lean();

    if (!consultation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // 권한 검사: 작성자 본인, 어드민, 또는 문진 시 지정된 네비게이터만 열람 가능
    const currentUserId = (session.user as any).id;
    const currentUserRole = (session.user as any).role;
    let isAllowed = false;

    if (currentUserRole === 'admin') {
      isAllowed = true;
    } else if (consultation.user._id.toString() === currentUserId) {
      isAllowed = true;
    } else {
      // 네비게이터 본인의 추천 코드로 들어온 유저인지 확인
      const { default: User } = await import('@/models/User');
      const me = await User.findById(currentUserId);
      if (me && me.isNavigator && consultation.navigator === me.referralCode) {
        isAllowed = true;
      }
    }

    if (!isAllowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // AI 면담 가이드가 없으면 생성 (Lazy Generation)
    if (!consultation.aiGuide) {
      const { GeminiAIEngine } = await import('@/lib/ai/gemini-engine');
      const aiGuide = await GeminiAIEngine.generateMedicalInterviewGuide(consultation);
      
      // DB 업데이트
      await connectDB();
      const { default: PreConsultationModel } = await import('@/models/PreConsultation');
      await PreConsultationModel.findByIdAndUpdate(id, { aiGuide });
      consultation.aiGuide = aiGuide;
    }

    return NextResponse.json({ consultation });

  } catch (error) {
    console.error('Failed to fetch pre-consultation detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
