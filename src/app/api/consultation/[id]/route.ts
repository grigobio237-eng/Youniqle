import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import PreConsultation from '@/models/PreConsultation';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    const clinicPassword = req.headers.get('x-clinic-password');
    
    await connectDB();

    let isTempClinicAuthorized = false;
    let authorizedHospitalId = null;

    // Check against dynamic Hospital codes
    if (clinicPassword) {
      const { default: Hospital } = await import('@/models/Hospital');
      const hospital = await Hospital.findOne({ code: clinicPassword, isActive: true });
      if (hospital) {
        isTempClinicAuthorized = true;
        authorizedHospitalId = hospital._id;
      }
    }

    let consultation;
    if (id === 'latest') {
      if (!session?.user && !isTempClinicAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const query = isTempClinicAuthorized ? {} : { user: (session?.user as any)?.id };
      
      consultation = await PreConsultation.findOne(query)
        .populate('user', 'name email image referralCode isNavigator')
        .sort({ createdAt: -1 })
        .lean() as any;
    } else {
      // Validate ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
      }
      consultation = await PreConsultation.findById(id)
        .populate('user', 'name email image referralCode isNavigator')
        .lean() as any;
    }

    if (!consultation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // 권한 검사: 작성자 본인, 어드민, 의료진, 또는 지정된 네비게이터만 열람 가능
    const currentUserId = (session?.user as any)?.id;
    let isAllowed = false;

    const { AccessControl } = await import('@/lib/logic/access-control');
    
    if (isTempClinicAuthorized || AccessControl.isClinicStaff(session?.user)) {
      isAllowed = true;
    } else if (currentUserId && consultation.user._id.toString() === currentUserId) {
      isAllowed = true;
    } else if (currentUserId) {
      // 네비게이터 본인의 추천 코드로 들어온 유저인지 확인
      const { default: User } = await import('@/models/User');
      const me = await User.findById(currentUserId);
      if (me && me.isNavigator && consultation.navigator === me.referralCode) {
        isAllowed = true;
      }
    }

    if (!isAllowed) {
      return NextResponse.json({ error: 'Forbidden', message: '비밀번호가 틀렸거나 권한이 없습니다.' }, { status: 403 });
    }

    // Log the visit if authorized via hospital code
    if (isTempClinicAuthorized && authorizedHospitalId && consultation) {
      const { default: HospitalVisitLog } = await import('@/models/HospitalVisitLog');
      await HospitalVisitLog.create({
        hospitalId: authorizedHospitalId,
        userId: consultation.user._id,
        accessType: 'pre-consultation',
        timestamp: new Date()
      });
    }

    // AI 면담 가이드가 없으면 생성 (Lazy Generation)
    if (!consultation.aiGuide) {
      const { GeminiAIEngine } = await import('@/lib/ai/gemini-engine');
      const aiGuide = await GeminiAIEngine.generateMedicalInterviewGuide(consultation);
      
      // DB 업데이트
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
