import { NextRequest, NextResponse } from 'next/server';
import { PersonalizationExperiment } from '@/models/Personalization';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 개인화 실험 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const experimentType = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (experimentType) {
      query.experimentType = experimentType;
    }

    const skip = (page - 1) * limit;
    
    const [experiments, total] = await Promise.all([
      PersonalizationExperiment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PersonalizationExperiment.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        experiments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Experiments fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 개인화 실험 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const experimentData = await request.json();

    const experiment = new PersonalizationExperiment({
      ...experimentData,
      metadata: {
        ...experimentData.metadata,
        createdBy: session.user.email
      }
    });

    await experiment.save();

    return NextResponse.json({
      success: true,
      data: experiment
    });

  } catch (error) {
    console.error('Experiment creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
