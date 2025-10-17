import { NextRequest, NextResponse } from 'next/server';
import { PersonalizationRule } from '@/models/Personalization';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 개인화 규칙 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ruleType = searchParams.get('type');
    const isActive = searchParams.get('active');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};
    
    if (ruleType) {
      query.ruleType = ruleType;
    }
    
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    
    if (category) {
      query['metadata.category'] = category;
    }

    const skip = (page - 1) * limit;
    
    const [rules, total] = await Promise.all([
      PersonalizationRule.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PersonalizationRule.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        rules,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Rules fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 개인화 규칙 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ruleData = await request.json();

    const rule = new PersonalizationRule({
      ...ruleData,
      metadata: {
        ...ruleData.metadata,
        createdBy: session.user.email
      }
    });

    await rule.save();

    return NextResponse.json({
      success: true,
      data: rule
    });

  } catch (error) {
    console.error('Rule creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
