import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';
import { withAdminAuth } from '@/lib/authMiddleware';

async function uploadPavilionImageHandler(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'pavilion';

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
        console.error('[Pavilion Upload API Error]:', error);
        return NextResponse.json({ error: error.message || 'Failed to upload image' }, { status: 500 });
    }
}

export const POST = withAdminAuth(uploadPavilionImageHandler);
