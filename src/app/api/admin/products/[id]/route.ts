import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    await connectDB();
    
    // 관리자 권한 확인
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ product });

  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json(
      { error: '상품 정보를 불러오는데 실패했습니다.' },
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    await connectDB();
    
    // 관리자 권한 확인
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    await connectDB();
    
    // 관리자 권한 확인
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    
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
