import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PavilionFloor from '@/models/PavilionFloor';

export async function GET() {
    try {
        await connectDB();
        // Cacheable data
        const data = await PavilionFloor.find().sort({ floor: 1 });

        // Convert to Record<number, FloorOwner[]> for compatibility with current frontend
        const pavilionData: Record<number, any[]> = {};
        data.forEach((f: any) => {
            pavilionData[f.floor] = f.owners;
        });

        return NextResponse.json(pavilionData);
    } catch (error) {
        console.error('Fetch Pavilion error:', error);
        return NextResponse.json({ error: 'Failed to fetch pavilion data' }, { status: 500 });
    }
}
