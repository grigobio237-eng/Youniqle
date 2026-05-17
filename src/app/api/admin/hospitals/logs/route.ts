import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import HospitalVisitLog from '@/models/HospitalVisitLog';
import Hospital from '@/models/Hospital';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure models are registered
    Hospital.init();
    User.init();

    const logs = await HospitalVisitLog.find({})
      .populate('hospitalId', 'name code')
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(200);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Failed to fetch visit logs:', error);
    return NextResponse.json({ error: '방문 기록을 가져오는데 실패했습니다.' }, { status: 500 });
  }
}
