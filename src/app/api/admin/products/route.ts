import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Review from '@/models/Review';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const status = searchParams.get('status') || 'all';
    const sort = searchParams.get('sort') || 'newest';

    await connectDB();

    // 검색 조건 구성
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category !== 'all') {
      filter.category = category;
    }
    
    if (status !== 'all') {
      filter.status = status;
    }

    // 정렬 조건 구성
    let sortCondition: any = {};
    switch (sort) {
      case 'newest':
        sortCondition = { createdAt: -1 };
        break;
      case 'oldest':
        sortCondition = { createdAt: 1 };
        break;
      case 'price-high':
        sortCondition = { price: -1 };
        break;
      case 'price-low':
        sortCondition = { price: 1 };
        break;
      case 'sales':
        sortCondition = { createdAt: -1 }; // 실제로는 판매량 기준 정렬 필요
        break;
      case 'name':
        sortCondition = { name: 1 };
        break;
      default:
        sortCondition = { createdAt: -1 };
    }

    // 상품 목록 조회
    const products = await Product.find(filter)
      .sort(sortCondition)
      .limit(100);

    // 각 상품의 판매 통계 및 리뷰 통계 조회
    const productsWithStats = await Promise.all(
      products.map(async (product) => {
        // 판매량 계산
        const orders = await Order.find({
          'items.productId': product._id
        });
        const sales = orders.reduce((sum, order) => {
          const item = order.items.find((item: any) =>
            item.productId.toString() === product._id.toString()
          );
          return sum + (item?.quantity || 0);
        }, 0);

        // 리뷰 통계 계산
        const reviews = await Review.find({ productId: product._id });
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
          : 0;

        return {
          id: product._id.toString(),
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice,
          stock: product.stock,
          category: product.category,
          status: product.status,
          featured: product.featured,
          images: product.images,
          summary: product.summary,
          description: product.description,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          sales,
          reviews: totalReviews,
          averageRating
        };
      })
    );

    // 판매량 기준 정렬 (필요한 경우)
    if (sort === 'sales') {
      productsWithStats.sort((a, b) => b.sales - a.sales);
    }

    return NextResponse.json({ products: productsWithStats });

  } catch (error) {
    console.error('Admin products fetch error:', error);
    return NextResponse.json(
      { error: '상품 목록을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      slug,
      price,
      originalPrice,
      stock,
      category,
      summary,
      description,
      images,
      featured
    } = await request.json();

    // 필수 필드 검증
    if (!name || !price || !category || !summary || !description) {
      return NextResponse.json(
        { error: '필수 필드를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    await connectDB();

    // 슬러그 중복 확인
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json(
        { error: '이미 존재하는 상품 슬러그입니다.' },
        { status: 400 }
      );
    }

    // 새 상품 생성
    const product = new Product({
      name,
      slug,
      price,
      originalPrice,
      stock: stock || 0,
      category,
      summary,
      description,
      images: images || [],
      featured: featured || false,
      status: 'active'
    });

    await product.save();

    return NextResponse.json({
      message: '상품이 성공적으로 생성되었습니다.',
      product: {
        id: product._id.toString(),
        name: product.name,
        slug: product.slug,
        price: product.price,
        category: product.category
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Admin product create error:', error);
    return NextResponse.json(
      { error: '상품 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
