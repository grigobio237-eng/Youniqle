import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'superadmin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const formData = await req.json();
        const { image, folder = 'video-assets' } = formData;

        if (!image) {
            return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
        }

        // Base64 data extraction
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // Use StorageService to optimize and upload
        const result = await StorageService.uploadImage(buffer, {
            folder,
            filename: `upload-${Date.now()}.webp`
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[Video Asset Upload Error]:', error);
        return NextResponse.json({ error: error.message || 'Failed to upload image' }, { status: 500 });
    }
}
