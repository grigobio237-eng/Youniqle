import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // 파트너 토큰 검증 (하이픈으로 통일)
    const token = request.cookies.get('partner-token')?.value;

    if (!token) {
      return NextResponse.json({ error: '파트너 토큰이 필요합니다.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, name: string };

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
      isFunding,
      fundingGoal,
      fundingEndDate,
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

    // 상품 조회 및 권한 확인
    const product = await Product.findOne({
      _id: productId,
      partnerId: decoded.id
    });

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없거나 수정 권한이 없습니다.' },
        { status: 404 }
      );
    }

    // 슬러그 중복 확인 (자신의 상품 제외)
    const existingProduct = await Product.findOne({
      slug,
      _id: { $ne: productId }
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: '이미 존재하는 상품 슬러그입니다.' },
        { status: 400 }
      );
    }

    // 상품 수정 (승인 상태 초기화 - 재검토 필요)
    product.name = name;
    product.slug = slug;
    product.price = price;
    product.originalPrice = originalPrice;
    product.stock = stock || 0;
    product.category = category;
    product.summary = summary;
    product.description = description;
    product.images = (images || []).map((img: any) => typeof img === 'string' ? { url: img } : img);
    product.featured = featured || false;
    // 펀딩 정보 업데이트
    product.isFunding = isFunding || false;
    product.fundingGoal = fundingGoal || undefined;
    product.fundingEndDate = fundingEndDate || undefined;

    // 상품 수정 시 다시 승인 대기 상태로 변경
    product.approvalStatus = 'pending';
    product.rejectionReason = undefined;
    // 카테고리별 특화 정보 (빈 값이 아닌 경우만 저장)
    product.nutritionInfo = nutritionInfo && Object.values(nutritionInfo).some(v => v) ? nutritionInfo : undefined;
    product.originInfo = originInfo && Object.values(originInfo).some(v => v) ? originInfo : undefined;
    product.clothingInfo = clothingInfo && Object.values(clothingInfo).some(v => v) ? clothingInfo : undefined;
    product.electronicsInfo = electronicsInfo && Object.values(electronicsInfo).some(v => v) ? electronicsInfo : undefined;

    await product.save();

    // 캐시 무효화
    const { cache } = await import('@/lib/cache');
    await cache.delPattern('products:*');
    await cache.del(`product:${productId}`);
    console.log(`🗑️ 파트너 상품 수정으로 인한 캐시 무효화 완료: ${productId}`);

    return NextResponse.json({
      message: '상품이 성공적으로 수정되었습니다.',
      product: {
        id: product._id.toString(),
        name: product.name,
        slug: product.slug,
        price: product.price,
        category: product.category
      }
    });

  } catch (error) {
    console.error('파트너 상품 수정 오류:', error);
    return NextResponse.json(
      { error: '상품 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // 파트너 토큰 검증 (하이픈으로 통일)
    const token = request.cookies.get('partner-token')?.value;

    if (!token) {
      return NextResponse.json({ error: '파트너 토큰이 필요합니다.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    await connectDB();

    // 상품 조회 및 권한 확인 (파트너는 자신의 상품만 삭제 가능)
    const product = await Product.findOne({
      _id: productId,
      partnerId: decoded.id
    });

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없거나 삭제 권한이 없습니다.' },
        { status: 404 }
      );
    }

    // 이미지 파일들 삭제 (Firebase Storage 및 Vercel Blob)
    if (product.images && product.images.length > 0) {
      try {
        const { StorageService } = await import('@/lib/storage');
        const deletePromises = product.images.map(async (img: any) => {
          if (img.url) {
            await StorageService.deleteFile(img.url);
          }
        });

        // 상세 설명 HTML 이미지 삭제
        if (product.description && product.description.includes('<img')) {
          const imgRegex = /<img[^>]+src="([^">]+)"/g;
          let match;
          while ((match = imgRegex.exec(product.description)) !== null) {
            const imgSrc = match[1];
            deletePromises.push(StorageService.deleteFile(imgSrc));
          }
        }

        await Promise.all(deletePromises);
        console.log(`✅ 파트너 상품 삭제: 관련 이미지 파일들 정리 완료`);
      } catch (error) {
        console.error('이미지 삭제 오류:', error);
      }
    }

    // 상품 삭제
    await Product.findByIdAndDelete(productId);

    // 캐시 무효화
    const { cache } = await import('@/lib/cache');
    await cache.delPattern('products:*');
    await cache.del(`product:${productId}`);
    console.log(`🗑️ 파트너 상품 삭제로 인한 캐시 무효화 완료: ${productId}`);

    return NextResponse.json({
      message: '상품이 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('파트너 상품 삭제 오류:', error);
    return NextResponse.json(
      { error: '상품 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
