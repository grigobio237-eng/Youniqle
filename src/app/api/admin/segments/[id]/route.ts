import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CustomerSegment from '@/models/CustomerSegment';
import SegmentMembership from '@/models/SegmentMembership';
import { SegmentationEngine } from '@/lib/segmentationEngine';
import jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 인증 확인
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '관리자 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.type !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    const segment = await CustomerSegment.findById(id).populate('createdBy', 'name email');
    
    if (!segment) {
      return NextResponse.json(
        { error: '세그먼트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 멤버십 통계 조회
    const membershipStats = await SegmentMembership.aggregate([
      { $match: { segmentId: segment._id, status: 'active' } },
      {
        $group: {
          _id: null,
          totalMembers: { $sum: 1 },
          avgScore: { $avg: '$score' },
          highEngagement: {
            $sum: {
              $cond: [{ $eq: ['$metadata.characteristics.engagementLevel', 'high'] }, 1, 0]
            }
          },
          mediumEngagement: {
            $sum: {
              $cond: [{ $eq: ['$metadata.characteristics.engagementLevel', 'medium'] }, 1, 0]
            }
          },
          lowEngagement: {
            $sum: {
              $cond: [{ $eq: ['$metadata.characteristics.engagementLevel', 'low'] }, 1, 0]
            }
          },
          platinumLoyalty: {
            $sum: {
              $cond: [{ $eq: ['$metadata.characteristics.loyaltyLevel', 'platinum'] }, 1, 0]
            }
          },
          goldLoyalty: {
            $sum: {
              $cond: [{ $eq: ['$metadata.characteristics.loyaltyLevel', 'gold'] }, 1, 0]
            }
          },
          silverLoyalty: {
            $sum: {
              $cond: [{ $eq: ['$metadata.characteristics.loyaltyLevel', 'silver'] }, 1, 0]
            }
          },
          bronzeLoyalty: {
            $sum: {
              $cond: [{ $eq: ['$metadata.characteristics.loyaltyLevel', 'bronze'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // 최근 멤버십 조회
    const recentMemberships = await SegmentMembership.find({ 
      segmentId: segment._id, 
      status: 'active' 
    })
      .populate('userId', 'name email')
      .sort({ joinedAt: -1 })
      .limit(10);

    // 성장률 계산
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldMemberships = await SegmentMembership.countDocuments({
      segmentId: segment._id,
      status: 'active',
      joinedAt: { $lt: thirtyDaysAgo }
    });

    const currentMembers = membershipStats[0]?.totalMembers || 0;
    const growthRate = oldMemberships > 0 ? 
      ((currentMembers - oldMemberships) / oldMemberships) * 100 : 0;

    return NextResponse.json({
      segment,
      membershipStats: membershipStats[0] || {
        totalMembers: 0,
        avgScore: 0,
        highEngagement: 0,
        mediumEngagement: 0,
        lowEngagement: 0,
        platinumLoyalty: 0,
        goldLoyalty: 0,
        silverLoyalty: 0,
        bronzeLoyalty: 0
      },
      recentMemberships,
      growthRate: Math.round(growthRate * 100) / 100
    });

  } catch (error) {
    console.error('Segment fetch error:', error);
    return NextResponse.json(
      { error: '세그먼트 정보를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 인증 확인
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '관리자 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.type !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    const data = await request.json();
    const { action, ...updateData } = data;

    const segment = await CustomerSegment.findById(id);
    
    if (!segment) {
      return NextResponse.json(
        { error: '세그먼트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 액션별 처리
    switch (action) {
      case 'calculate':
        // 세그먼트 재계산
        try {
          const result = await SegmentationEngine.calculateSegment(id);
          return NextResponse.json({
            success: true,
            message: '세그먼트가 재계산되었습니다.',
            result
          });
        } catch (error) {
          return NextResponse.json(
            { error: '세그먼트 계산에 실패했습니다.' },
            { status: 500 }
          );
        }

      case 'activate':
        segment.status = 'active';
        break;

      case 'deactivate':
        segment.status = 'inactive';
        break;

      case 'archive':
        segment.status = 'archived';
        break;

      case 'update':
        // 일반 업데이트
        Object.assign(segment, updateData);
        break;

      default:
        return NextResponse.json(
          { error: '유효하지 않은 액션입니다.' },
          { status: 400 }
        );
    }

    segment.updatedAt = new Date();
    await segment.save();

    return NextResponse.json({
      success: true,
      message: '세그먼트가 업데이트되었습니다.',
      segment
    });

  } catch (error) {
    console.error('Segment update error:', error);
    return NextResponse.json(
      { error: '세그먼트 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 인증 확인
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '관리자 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.type !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    const segment = await CustomerSegment.findById(id);
    
    if (!segment) {
      return NextResponse.json(
        { error: '세그먼트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 관련 멤버십도 삭제
    await SegmentMembership.deleteMany({ segmentId: id });
    await CustomerSegment.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: '세그먼트가 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Segment deletion error:', error);
    return NextResponse.json(
      { error: '세그먼트 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
