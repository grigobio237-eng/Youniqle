import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

/**
 * GET /api/pavilion/products
 * 파빌리온 전시 상품 조회
 * Query params: floorId (예: "floor-2")
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const floorId = searchParams.get('floorId');

        if (!floorId) {
            return NextResponse.json(
                { error: 'floorId parameter is required' },
                { status: 400 }
            );
        }

        // 파빌리온에 전시된 상품 조회 (승인된 상품만)
        const products = await Product.find({
            pavilionFloorId: floorId,
            approvalStatus: 'approved',
            status: 'active'
        })
            .sort({ pavilionPosition: 1, createdAt: -1 }) // 전시 순서대로, 없으면 최신순
            .lean();

        // Product를 PavilionItem 형식으로 변환
        const items = products.map((product: any) => {
            // 카테고리별 specs 생성
            const specs: Record<string, string> = {};

            // 카테고리 정보
            specs['CATEGORY'] = getCategoryLabel(product.category);

            // 재고 정보
            if (product.stock !== undefined) {
                specs['STOCK'] = `${product.stock}개`;
            }

            // 카테고리별 특화 정보 추가
            if (product.nutritionInfo && Object.values(product.nutritionInfo).some(v => v)) {
                if (product.nutritionInfo.calories) specs['CALORIES'] = product.nutritionInfo.calories;
                if (product.nutritionInfo.protein) specs['PROTEIN'] = product.nutritionInfo.protein;
            }

            if (product.originInfo && Object.values(product.originInfo).some(v => v)) {
                if (product.originInfo.origin) specs['ORIGIN'] = product.originInfo.origin;
                if (product.originInfo.storageMethod) specs['STORAGE'] = product.originInfo.storageMethod;
            }

            if (product.clothingInfo && Object.values(product.clothingInfo).some(v => v)) {
                if (product.clothingInfo.material) specs['MATERIAL'] = product.clothingInfo.material;
                if (product.clothingInfo.sizeGuide) specs['SIZE'] = product.clothingInfo.sizeGuide.split(',')[0].trim(); // 첫 사이즈만
            }

            if (product.electronicsInfo && Object.values(product.electronicsInfo).some(v => v)) {
                if (product.electronicsInfo.warranty) specs['WARRANTY'] = product.electronicsInfo.warranty.split('\n')[0]; // 첫 줄만
            }

            return {
                id: product._id.toString(),
                type: 'PRODUCT' as const,
                title: product.name,
                description: product.summary,
                specs,
                price: product.price.toLocaleString(),
                rental: undefined, // 상품은 렌탈 없음
                image: product.images[0]?.url || undefined,
                canvasSize: undefined,
                // 상품 상세 페이지 연동을 위한 productId 추가
                productId: product._id.toString(),
                slug: product.slug
            };
        });

        return NextResponse.json({ items });

    } catch (error) {
        console.error('파빌리온 상품 조회 오류:', error);
        return NextResponse.json(
            { error: '상품 조회에 실패했습니다.' },
            { status: 500 }
        );
    }
}

/**
 * 카테고리 값을 한글 레이블로 변환
 */
function getCategoryLabel(category: string): string {
    const categoryMap: Record<string, string> = {
        'fresh-food': '신선식품',
        'processed-food': '가공식품',
        'health-functional': '건강기능식품',
        'household': '생활용품',
        'beauty': '뷰티/화장품',
        'baby': '유아/아동',
        'pet': '반려동물',
        'fashion': '패션/의류',
        'digital': '디지털/가전',
        'sports': '스포츠/레저',
        'book': '도서',
        'hobby': '취미/문구',
        'other': '기타'
    };

    return categoryMap[category] || category;
}
