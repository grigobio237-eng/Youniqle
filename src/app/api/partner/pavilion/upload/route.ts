import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';
import { withPartnerAuth } from '@/lib/authMiddleware';

async function uploadPartnerPavilionImageHandler(request: NextRequest, user: any) {
    try {
        // 작가, 상점, 코치 권한 확인
        const partnerType = user.partnerApplication?.partnerType;
        const isEligible = ['artist', 'business', 'shopper', 'coach'].includes(partnerType);

        if (!isEligible && user.role !== 'admin') {
            return NextResponse.json({ error: '전시 이미지 업로드 권한이 필요합니다.' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || `pavilion/artists/${user._id}`;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Use StorageService to optimize and upload
        const result = await StorageService.uploadImage(buffer, {
            folder,
            filename: `${Date.now()}-${file.name.split('.')[0]}.webp`
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[Partner Pavilion Upload API Error]:', error);
        return NextResponse.json({ error: error.message || 'Failed to upload image' }, { status: 500 });
    }
}

export const POST = withPartnerAuth(uploadPartnerPavilionImageHandler);
