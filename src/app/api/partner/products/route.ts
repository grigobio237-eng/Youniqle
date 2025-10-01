import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function GET(request: NextRequest) {
  try {
    // 파트너 토큰 검증
    const token = request.cookies.get('partner-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '파트너 토큰이 필요합니다.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    await connectDB();

    // 파트너의 상품만 조회
    const products = await Product.find({ partnerId: decoded.id })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      products: products.map(product => ({
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        originalPrice: product.originalPrice,
        stock: product.stock,
        category: product.category,
        summary: product.summary,
        description: product.description,
        images: product.images, // 전체 이미지 객체 반환
        status: product.status,
        featured: product.featured,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        // 카테고리별 특화 정보
        nutritionInfo: product.nutritionInfo,
        originInfo: product.originInfo,
        clothingInfo: product.clothingInfo,
        electronicsInfo: product.electronicsInfo,
      }))
    });

  } catch (error) {
    console.error('파트너 상품 조회 오류:', error);
    return NextResponse.json(
      { error: '상품 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 파트너 토큰 검증
    const token = request.cookies.get('partner-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '파트너 토큰이 필요합니다.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, email: string, name: string };

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
      featured,
      nutritionInfo,
      originInfo,
      clothingInfo,
      electronicsInfo
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
    // 파트너 이메일 조회
    const User = (await import('@/models/User')).default;
    const partner = await User.findById(decoded.id);
    const partnerEmail = partner?.email || '';

    const product = new Product({
      name,
      slug,
      price,
      originalPrice,
      stock: stock || 0,
      category,
      summary,
      description,
      images: (images || []).map((img: any) => typeof img === 'string' ? { url: img } : img),
      featured: featured || false,
      status: 'active',
      partnerId: decoded.id,
      partnerName: decoded.name,
      partnerEmail,
      // 카테고리별 특화 정보 (빈 값이 아닌 경우만 저장)
      nutritionInfo: nutritionInfo && Object.values(nutritionInfo).some(v => v) ? nutritionInfo : undefined,
      originInfo: originInfo && Object.values(originInfo).some(v => v) ? originInfo : undefined,
      clothingInfo: clothingInfo && Object.values(clothingInfo).some(v => v) ? clothingInfo : undefined,
      electronicsInfo: electronicsInfo && Object.values(electronicsInfo).some(v => v) ? electronicsInfo : undefined,
    });

    await product.save();

    return NextResponse.json({
      message: '상품이 성공적으로 등록되었습니다.',
      product: {
        id: product._id.toString(),
        name: product.name,
        slug: product.slug,
        price: product.price,
        category: product.category
      }
    }, { status: 201 });

  } catch (error) {
    console.error('파트너 상품 등록 오류:', error);
    return NextResponse.json(
      { error: '상품 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}

