import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hospital from '@/models/Hospital';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    await connectDB();
    const hospital = await Hospital.findByIdAndUpdate(id, body, { new: true });

    if (!hospital) {
      return NextResponse.json({ error: '병원을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ hospital });
  } catch (error) {
    console.error('Failed to update hospital:', error);
    return NextResponse.json({ error: '병원 정보 수정에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectDB();
    const hospital = await Hospital.findByIdAndDelete(id);

    if (!hospital) {
      return NextResponse.json({ error: '병원을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '병원이 삭제되었습니다.' });
  } catch (error) {
    console.error('Failed to delete hospital:', error);
    return NextResponse.json({ error: '병원 삭제에 실패했습니다.' }, { status: 500 });
  }
}
