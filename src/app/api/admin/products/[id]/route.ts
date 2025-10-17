import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { logServerError, getServerStatus } from '@/lib/serverErrorHandler';
import jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Fetching product with ID:', id);
    
    // JWT 토큰으로 인증 확인
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      console.log('No admin token found');
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // JWT 토큰 검증
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not found');
      return NextResponse.json({ error: '서버 설정 오류가 발생했습니다.' }, { status: 500 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    } catch (jwtError) {
      console.error('JWT token verification failed:', jwtError);
      return NextResponse.json({ error: '유효하지 않은 인증 토큰입니다.' }, { status: 401 });
    }

    if (decoded.type !== 'admin') {
      console.log('Token is not admin type:', decoded.type);
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    await connectDB();
    console.log('Database connected');
    
    // 관리자 권한 확인
    const user = await User.findById(decoded.id).maxTimeMS(5000);
    
    if (!user || user.role !== 'admin') {
      console.log('User not found or not admin:', user?.role);
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    console.log('Admin user verified, fetching product...');
    const product = await Product.findById(id).maxTimeMS(5000);
    
    if (!product) {
      console.log('Product not found for ID:', id);
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    console.log('Product found:', product.name);
    return NextResponse.json({ product });

  } catch (error) {
    console.error('Failed to fetch product:', error);
    
    // 상세 에러 로깅
    const detailedError = logServerError(error as Error, request, {
      productId: id,
      operation: 'GET_PRODUCT',
      serverStatus: getServerStatus(),
    });
    
    // MongoDB 연결 에러인 경우
    if (error instanceof Error && error.message.includes('buffering timed out')) {
      console.log('[API] MongoDB 타임아웃으로 인해 상품 조회 실패');
      return NextResponse.json(
        { 
          error: '데이터베이스 연결이 불안정합니다. 잠시 후 다시 시도해주세요.',
          details: process.env.NODE_ENV === 'development' ? detailedError : undefined,
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: '상품 정보를 불러오는데 실패했습니다.',
        details: process.env.NODE_ENV === 'development' ? detailedError : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // JWT 토큰으로 인증 확인
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // JWT 토큰 검증
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: '서버 설정 오류가 발생했습니다.' }, { status: 500 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    } catch (jwtError) {
      return NextResponse.json({ error: '유효하지 않은 인증 토큰입니다.' }, { status: 401 });
    }

    if (decoded.type !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    await connectDB();
    
    // 관리자 권한 확인
    const user = await User.findById(decoded.id);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      price,
      originalPrice,
      stock,
      category,
      status,
      featured,
      summary,
      description,
      images,
      nutritionInfo,
      originInfo,
      clothingInfo,
      electronicsInfo,
    } = body;

    // 필수 필드 검증
    if (!name || !slug || !price || !stock || !category || !summary || !description) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 슬러그 중복 확인 (자신 제외)
    const existingProduct = await Product.findOne({ 
      slug, 
      _id: { $ne: id } 
    });
    
    if (existingProduct) {
      return NextResponse.json(
        { error: '이미 사용 중인 URL 슬러그입니다.' },
        { status: 400 }
      );
    }

    // 상품 업데이트
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        price,
        originalPrice: originalPrice || undefined,
        stock,
        category,
        status,
        featured: featured || false,
        summary,
        description,
        images: images || [],
        // 카테고리별 특화 정보 (빈 값이 아닌 경우만 저장)
        nutritionInfo: nutritionInfo && Object.values(nutritionInfo).some(v => v) ? nutritionInfo : undefined,
        originInfo: originInfo && Object.values(originInfo).some(v => v) ? originInfo : undefined,
        clothingInfo: clothingInfo && Object.values(clothingInfo).some(v => v) ? clothingInfo : undefined,
        electronicsInfo: electronicsInfo && Object.values(electronicsInfo).some(v => v) ? electronicsInfo : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: '상품이 성공적으로 수정되었습니다.',
      product: updatedProduct 
    });

  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: '상품 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // JWT 토큰으로 인증 확인
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // JWT 토큰 검증
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: '서버 설정 오류가 발생했습니다.' }, { status: 500 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    } catch (jwtError) {
      return NextResponse.json({ error: '유효하지 않은 인증 토큰입니다.' }, { status: 401 });
    }

    if (decoded.type !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    await connectDB();
    
    // 관리자 권한 확인
    const user = await User.findById(decoded.id);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: '상품이 성공적으로 삭제되었습니다.' 
    });

  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { error: '상품 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
