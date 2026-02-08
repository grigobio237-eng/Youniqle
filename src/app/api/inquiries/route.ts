import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

const ALLOWED_TYPES = new Set([
  'general',
  'delivery',
  'payment',
  'product',
  'technical',
  'refund',
  'partnership',
]);

const ALLOWED_PRIORITIES = new Set(['low', 'medium', 'high', 'urgent']);
const ALLOWED_STATUSES = new Set(['pending', 'in_progress', 'resolved', 'closed']);

const generateInquiryId = async () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  let sequence = 1;

  const latest = await Inquiry.findOne({ inquiryId: new RegExp(`^INQ-${date}`) })
    .sort({ inquiryId: -1 })
    .lean()
    .exec() as { inquiryId?: string } | null;

  if (latest?.inquiryId) {
    const parts = latest.inquiryId.split('-');
    const lastSeq = Number(parts[parts.length - 1]);
    if (!Number.isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }

  return `INQ-${date}-${sequence.toString().padStart(4, '0')}`;
};

const normalizeAttachments = (raw: any): Array<{
  filename: string;
  url: string;
  size: number;
  type: string;
}> => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => ({
      filename: typeof item?.filename === 'string' ? item.filename : undefined,
      url: typeof item?.url === 'string' ? item.url : undefined,
      size: typeof item?.size === 'number' ? item.size : undefined,
      type: typeof item?.type === 'string' ? item.type : undefined,
    }))
    .filter(
      (item) => item.filename && item.url && typeof item.size === 'number' && item.type
    ) as Array<{ filename: string; url: string; size: number; type: string }>;
};

// 사용자 문의 등록
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const body = await request.json();
    const {
      type = 'general',
      subject,
      content,
      priority = 'medium',
      attachments,
      tags,
      source = 'website',
      // Guest fields
      email,
      name,
      phoneNumber,
      floor,
      artistId
    } = body;

    // Validate Auth or Guest Info
    let finalUserEmail = session?.user?.email;
    let finalUserName = session?.user?.name;
    let finalUserId = undefined;

    if (session?.user?.email) {
      // Logged in
      finalUserEmail = session.user.email;
      finalUserName = session.user.name || '고객';
      // Try to find user ID
      const user = await User.findOne({ email: session.user.email }).lean().exec() as { _id: any } | null;
      finalUserId = user?._id;
    } else {
      // Guest
      if (!email || !name) {
        return NextResponse.json(
          { success: false, error: { code: 'AUTH_OR_CONTACT_REQUIRED', message: '로그인하거나 이름과 이메일을 입력해주세요.' } },
          { status: 400 }
        );
      }
      finalUserEmail = email;
      finalUserName = name;
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '제목을 입력해주세요.' } },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '문의 내용을 입력해주세요.' } },
        { status: 400 }
      );
    }

    await connectDB();

    const inquiryId = await generateInquiryId();

    if (Array.isArray(attachments) && attachments.length > 5) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ATTACHMENT_LIMIT_EXCEEDED',
            message: '첨부 파일은 최대 5개까지 업로드할 수 있습니다.',
          },
        },
        { status: 400 }
      );
    }

    const normalizedTags = Array.isArray(tags)
      ? tags.filter((tag) => typeof tag === 'string')
      : [];

    const inquiry = await Inquiry.create({
      inquiryId,
      userId: finalUserId,
      userEmail: finalUserEmail,
      userName: finalUserName,
      phoneNumber: phoneNumber || undefined,
      floor: floor,
      artistId: artistId,
      type: ALLOWED_TYPES.has(type) ? type : 'general',
      subject: subject.trim(),
      content: content.trim(),
      status: 'pending',
      priority: ALLOWED_PRIORITIES.has(priority) ? priority : 'medium',
      source,
      attachments: normalizeAttachments(attachments),
      tags: [...new Set([...normalizedTags, 'web-submitted'])],
    });

    return NextResponse.json({
      success: true,
      message: '문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.',
      data: inquiry,
    });
  } catch (error: any) {
    console.error('문의 생성 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error?.message || '문의 접수 중 문제가 발생했습니다.',
        },
      },
      { status: 500 }
    );
  }
}

// 사용자 문의 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.email) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    await connectDB();

    // 사용자 정보 조회 (userId를 얻기 위해)
    const user = await User.findOne({ email: session.user.email }).lean().exec() as { _id?: any } | null;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 50);

    const filter: Record<string, any> = {
      $or: user?._id
        ? [{ userId: user._id }, { userEmail: session.user.email }]
        : [{ userEmail: session.user.email }],
    };

    if (status && ALLOWED_STATUSES.has(status)) {
      filter.status = status;
    }

    if (type && ALLOWED_TYPES.has(type)) {
      filter.type = type;
    }

    const skip = (page - 1) * limit;

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inquiry.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        inquiries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('문의 목록 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error?.message || '문의 내역을 불러오는 중 문제가 발생했습니다.',
        },
      },
      { status: 500 }
    );
  }
}
