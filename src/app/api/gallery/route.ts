import { NextResponse } from 'next/server';
import { fetchGalleryData } from '@/lib/galleryData';

export async function GET() {
    try {
        const artists = await fetchGalleryData();
        return NextResponse.json(artists);
    } catch (error) {
        console.error('Error fetching gallery API:', error);
        return NextResponse.json({ error: 'Failed to fetch gallery data' }, { status: 500 });
    }
}
