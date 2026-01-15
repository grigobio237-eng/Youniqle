import { Metadata } from 'next';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { ReactNode } from 'react';

interface Props {
    params: Promise<{ id: string }>;
    children: ReactNode;
}

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params;

    try {
        await connectDB();

        // API 라우트와 동일한 로직으로 상품 검색
        const query: any = {
            status: 'active',
            approvalStatus: 'approved',
        };

        // ID가 MongoDB ObjectId 형식인지 확인하여 검색 조건 설정
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        if (isValidObjectId) {
            query.$or = [{ _id: id }, { slug: id }];
        } else {
            query.slug = id;
        }

        const product = await Product.findOne(query).lean() as any;

        if (!product) {
            return {
                title: '상품을 찾을 수 없습니다 - Youniqle',
            };
        }

        const title = `${product.name} - Youniqle`;
        const description = product.summary || product.description?.substring(0, 160);
        const imageUrl = product.images && product.images.length > 0
            ? product.images[0].url
            : 'https://grigobio.co.kr/character/youniqle-4.png'; // 기본 이미지

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: [
                    {
                        url: imageUrl,
                        width: 800,
                        height: 800,
                        alt: product.name,
                    },
                ],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [imageUrl],
            },
        };
    } catch (error) {
        console.error('Metadata generation error:', error);
        return {
            title: 'Youniqle',
        };
    }
}

export default function ProductLayout({ children }: Props) {
    return <>{children}</>;
}
