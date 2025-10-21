import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { processExpiredPoints } from '@/lib/pointManager';

export async function POST(request: NextRequest) {
  try {
    const secretHeader = request.headers.get('x-cron-secret');
    const expected = process.env.CRON_SECRET;
    if (!expected || secretHeader !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const result = await processExpiredPoints();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('포인트 만료 처리 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}





