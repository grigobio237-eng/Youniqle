import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PartnerInquiry from '@/models/PartnerInquiry';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { companyName, contactName, email, phoneNumber, content } = body;

    // 필수 필드 검증
    if (!companyName || !contactName || !email || !phoneNumber || !content) {
      return NextResponse.json(
        { error: '모든 필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    const inquiry = await PartnerInquiry.create({
      companyName,
      contactName,
      email,
      phoneNumber,
      content,
      status: 'pending'
    });

    return NextResponse.json(
      { message: '제휴 문의가 성공적으로 접수되었습니다.', id: inquiry._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Partner inquiry error:', error);
    return NextResponse.json(
      { error: '문의 접수 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
