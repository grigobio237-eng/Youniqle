import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hospital from '@/models/Hospital';

// GET all hospitals
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const hospitals = await Hospital.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ hospitals });
  } catch (error) {
    console.error('Failed to fetch hospitals:', error);
    return NextResponse.json({ error: '병원 목록을 가져오는데 실패했습니다.' }, { status: 500 });
  }
}

// POST create new hospital
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, description, address, phone } = body;

    if (!name || !code) {
      return NextResponse.json({ error: '병원 이름과 고유코드는 필수입니다.' }, { status: 400 });
    }

    await connectDB();

    // Check if code already exists
    const existing = await Hospital.findOne({ code });
    if (existing) {
      return NextResponse.json({ error: '이미 사용 중인 고유코드입니다.' }, { status: 400 });
    }

    const hospital = await Hospital.create({
      name,
      code,
      description,
      address,
      phone,
      isActive: true
    });

    return NextResponse.json({ hospital }, { status: 201 });
  } catch (error) {
    console.error('Failed to create hospital:', error);
    return NextResponse.json({ error: '병원 추가에 실패했습니다.' }, { status: 500 });
  }
}
