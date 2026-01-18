import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import Diagnosis from '@/models/Diagnosis';
import {
    getKeywordsFromTags,
    getRecommendedTagsByScore,
    getTagByName
} from '@/lib/recoveryTagMapping';
import {
    searchMultipleKeywords,
    ExternalProduct
} from '@/lib/externalShoppingApi';

interface ExternalRecommendationsRequest {
    recoveryScore?: number;
    tags?: string[];  // 태그 ID 또는 태그 이름
    limit?: number;
    includeInternal?: boolean;
}

/**
 * 외부 상품 추천 API
 * GET /api/recommendations/external?tags=sleep_lack,chronic_fatigue&limit=6
 * POST /api/recommendations/external { recoveryScore, tags, limit }
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const tagsParam = searchParams.get('tags');
        const limitParam = searchParams.get('limit');
        const includeInternalParam = searchParams.get('includeInternal');
        const scoreParam = searchParams.get('score');
        const shuffleParam = searchParams.get('shuffle');

        const tags = tagsParam ? tagsParam.split(',').map(t => t.trim()) : [];
        const limit = parseInt(limitParam || '6', 10);
        const includeInternal = includeInternalParam !== 'false';
        const recoveryScore = scoreParam ? parseInt(scoreParam, 10) : undefined;
        const shuffle = shuffleParam === 'true';

        return handleRecommendations({
            recoveryScore,
            tags,
            limit,
            includeInternal,
            shuffle
        });

    } catch (error: any) {
        console.error('External Recommendations Error:', error);
        return NextResponse.json(
            { error: error.message || '외부 상품 추천을 가져오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: ExternalRecommendationsRequest = await request.json();
        return handleRecommendations(body);
    } catch (error: any) {
        console.error('External Recommendations Error:', error);
        return NextResponse.json(
            { error: error.message || '외부 상품 추천을 가져오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

async function handleRecommendations(params: ExternalRecommendationsRequest & { shuffle?: boolean }) {
    const {
        recoveryScore,
        tags = [],
        limit = 6,
        includeInternal = true,
        shuffle = false
    } = params;

    await connectDB();

    // 태그 처리: 태그 이름을 태그 ID로 변환
    let processedTags = tags.map(tag => {
        const byName = getTagByName(tag);
        return byName ? byName.id : tag;
    });

    // 태그가 없고 점수가 있으면 점수 기반 추천 태그 사용
    if (processedTags.length === 0 && recoveryScore !== undefined) {
        processedTags = getRecommendedTagsByScore(recoveryScore);
    }

    // 태그에서 키워드 추출
    const keywords = getKeywordsFromTags(processedTags);

    if (keywords.length === 0) {
        // 기본 키워드 사용
        keywords.push('피로회복', '수면', '스트레스해소');
    }

    // 1. 내부 상품 검색 (우선 노출)
    let internalProducts: any[] = [];
    let internalCount = 0;
    // 셔플 모드일 때 더 많이 가져와서 랜덤 선택
    const internalFetchLimit = shuffle ? Math.ceil(limit * 2) : Math.ceil(limit / 2);

    if (includeInternal) {
        try {
            const allInternalProducts = await Product.find({
                isActive: true,
                $or: keywords.map(keyword => ({
                    $or: [
                        { name: { $regex: keyword, $options: 'i' } },
                        { description: { $regex: keyword, $options: 'i' } },
                        { category: { $regex: keyword, $options: 'i' } },
                        { tags: { $in: [new RegExp(keyword, 'i')] } }
                    ]
                }))
            })
                .limit(internalFetchLimit)
                .sort({ salesCount: -1, createdAt: -1 })
                .lean();

            // 셔플 모드면 랜덤하게 섞어서 선택
            if (shuffle && allInternalProducts.length > 0) {
                for (let i = allInternalProducts.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allInternalProducts[i], allInternalProducts[j]] = [allInternalProducts[j], allInternalProducts[i]];
                }
                internalProducts = allInternalProducts.slice(0, Math.ceil(limit / 2));
            } else {
                internalProducts = allInternalProducts;
            }

            internalCount = internalProducts.length;
        } catch (err) {
            console.error('Internal product search error:', err);
        }
    }

    // 2. 외부 상품 검색 (부족분 보충)
    const externalLimit = limit - internalCount;
    let externalProducts: ExternalProduct[] = [];

    if (externalLimit > 0) {
        // 셔플 모드일 때 랜덤 시작 위치와 셔플 활성화
        const randomStart = shuffle ? Math.floor(Math.random() * 20) + 1 : 1;
        externalProducts = await searchMultipleKeywords(keywords, {
            displayPerKeyword: shuffle ? 5 : 3,  // 셔플 모드일 때 더 많이 가져옴
            totalLimit: externalLimit,
            sort: 'sim',
            start: randomStart,
            shuffle: shuffle
        });
    }

    // 3. 응답 구성
    const response = {
        success: true,
        internalProducts: internalProducts.map((p: any) => ({
            id: p._id.toString(),
            title: p.name,
            description: p.shortDescription || p.description?.substring(0, 100) || '',
            price: p.price,
            priceFormatted: p.price ? `${p.price.toLocaleString()}원` : null,
            image: p.images?.[0]?.url || null,
            link: `/products/${p._id}`,
            category: p.category,
            isInternal: true
        })),
        externalProducts: externalProducts.map(p => ({
            id: p.id,
            title: p.title,
            price: p.lprice,
            priceFormatted: p.lprice ? `${p.lprice.toLocaleString()}원` : null,
            image: p.image,
            link: p.link,
            mallName: p.mallName,
            brand: p.brand,
            category: p.category1,
            source: p.source,
            isExternal: true
        })),
        metadata: {
            requestedTags: processedTags,
            usedKeywords: keywords,
            internalCount,
            externalCount: externalProducts.length,
            totalCount: internalCount + externalProducts.length
        }
    };

    return NextResponse.json(response);
}
