import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'newest';
    const rating = searchParams.get('rating');
    const hasImages = searchParams.get('hasImages');

    await connectDB();

    let query: any = { status: 'approved' };
    
    if (productId) {
      query.productId = productId;
    }

    if (rating) {
      query.rating = parseInt(rating);
    }

    if (hasImages === 'true') {
      query.images = { $exists: true, $ne: [] };
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'rating') {
      sortOption = { rating: -1, createdAt: -1 };
    } else if (sort === 'helpful') {
      sortOption = { helpfulCount: -1, createdAt: -1 };
    }

    const reviews = await Review.find(query)
      .populate('userId', 'name avatar')
      .populate('replies.userId', 'name avatar role')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments(query);

    // 평균 별점 계산
    const avgRating = await Review.aggregate([
      { $match: { ...query, rating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const ratingStats = await Review.aggregate([
      { $match: query },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      averageRating: avgRating[0]?.avgRating || 0,
      ratingStats: ratingStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<number, number>),
    });

  } catch (error) {
    console.error('리뷰 조회 오류:', error);
    return NextResponse.json(
      { error: '리뷰 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, rating, title, content, images, orderId } = body;

    if (!productId || !rating || !content) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: '별점은 1-5점 사이여야 합니다.' }, { status: 400 });
    }

    await connectDB();

    // 상품 존재 확인
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 사용자 정보 조회
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 이미 리뷰를 작성했는지 확인
    const existingReview = await Review.findOne({
      productId,
      userId: user._id,
    });

    if (existingReview) {
      return NextResponse.json({ error: '이미 리뷰를 작성하셨습니다.' }, { status: 400 });
    }

    // 리뷰 생성
    const review = new Review({
      productId,
      userId: user._id,
      orderId,
      rating,
      title,
      content,
      images: images || [],
      isVerified: !!orderId,
      status: 'pending', // 관리자 승인 대기
    });

    await review.save();

    // 생성된 리뷰를 사용자 정보와 함께 조회
    const savedReview = await Review.findById(review._id)
      .populate('userId', 'name avatar')
      .populate('replies.userId', 'name avatar role');

    return NextResponse.json({ 
      message: '리뷰가 작성되었습니다. 관리자 승인 후 게시됩니다.',
      review: savedReview 
    }, { status: 201 });

  } catch (error) {
    console.error('리뷰 작성 오류:', error);
    return NextResponse.json(
      { error: '리뷰 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
