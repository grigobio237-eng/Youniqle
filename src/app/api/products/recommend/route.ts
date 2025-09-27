import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '6');

    if (!productId) {
      return NextResponse.json({ error: '상품 ID가 필요합니다.' }, { status: 400 });
    }

    await connectDB();

    // 현재 상품 정보 조회
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 추천 알고리즘 구현
    const recommendations = await getRecommendations(currentProduct, limit);

    return NextResponse.json({ 
      recommendations,
      currentProduct: {
        _id: currentProduct._id,
        name: currentProduct.name,
        category: currentProduct.category,
      }
    });

  } catch (error) {
    console.error('상품 추천 오류:', error);
    return NextResponse.json(
      { error: '상품 추천 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

async function getRecommendations(currentProduct: any, limit: number) {
  const { _id, category, price, featured } = currentProduct;
  
  // 1. 같은 카테고리의 인기 상품 (현재 상품 제외)
  const sameCategoryProducts = await Product.find({
    _id: { $ne: _id },
    category: category,
    status: 'active',
  })
  .sort({ featured: -1, createdAt: -1 }) // 인기 상품 우선, 최신순
  .limit(Math.ceil(limit * 0.4)) // 40% 할당
  .lean();

  // 2. 비슷한 가격대의 상품 (현재 상품 제외)
  const priceRange = price * 0.5; // 가격의 50% 범위
  const similarPriceProducts = await Product.find({
    _id: { $ne: _id },
    price: { 
      $gte: price - priceRange, 
      $lte: price + priceRange 
    },
    status: 'active',
  })
  .sort({ featured: -1, createdAt: -1 })
  .limit(Math.ceil(limit * 0.3)) // 30% 할당
  .lean();

  // 3. 인기 상품 (전체에서)
  const popularProducts = await Product.find({
    _id: { $ne: _id },
    featured: true,
    status: 'active',
  })
  .sort({ createdAt: -1 })
  .limit(Math.ceil(limit * 0.2)) // 20% 할당
  .lean();

  // 4. 최신 상품 (부족한 경우 보충)
  const remainingLimit = limit - sameCategoryProducts.length - similarPriceProducts.length - popularProducts.length;
  let latestProducts: any[] = [];
  
  if (remainingLimit > 0) {
    latestProducts = await Product.find({
      _id: { 
        $ne: _id,
        $nin: [
          ...sameCategoryProducts.map(p => p._id),
          ...similarPriceProducts.map(p => p._id),
          ...popularProducts.map(p => p._id)
        ]
      },
      status: 'active',
    })
    .sort({ createdAt: -1 })
    .limit(remainingLimit)
    .lean();
  }

  // 추천 상품들을 합치고 중복 제거
  const allRecommendations = [
    ...sameCategoryProducts,
    ...similarPriceProducts,
    ...popularProducts,
    ...latestProducts
  ];

  // 중복 제거 (ID 기준)
  const uniqueRecommendations = allRecommendations.filter((product, index, self) =>
    index === self.findIndex(p => p._id.toString() === product._id.toString())
  );

  // 추천 이유 추가
  return uniqueRecommendations.slice(0, limit).map(product => ({
    ...product,
    recommendationReason: getRecommendationReason(product, currentProduct)
  }));
}

function getRecommendationReason(product: any, currentProduct: any) {
  if (product.category === currentProduct.category) {
    return '같은 카테고리';
  }
  
  const priceDiff = Math.abs(product.price - currentProduct.price);
  const priceRange = currentProduct.price * 0.5;
  
  if (priceDiff <= priceRange) {
    return '비슷한 가격대';
  }
  
  if (product.featured) {
    return '인기 상품';
  }
  
  return '추천 상품';
}
