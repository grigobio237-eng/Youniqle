
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PavilionFloor from '@/models/PavilionFloor';
import { fetchExternalFloor1Data, INITIAL_DATA_INTERNAL_FLOORS } from '@/lib/pavilionData';

export async function GET() {
    try {
        await connectDB();

        // 1. Fetch Internal Data (Floors 2-5)
        let internalData: any[] = await PavilionFloor.find({ floor: { $ne: 1 } }).lean();

        // If internal DB is empty (first run), populate standard floors
        if (internalData.length === 0) {
            internalData = INITIAL_DATA_INTERNAL_FLOORS.filter(f => f.floor > 1);
        }

        // 2. Fetch External Data (Floor 1)
        let floor1Owners = await fetchExternalFloor1Data();

        // 3. Construct Final Response
        const pavilionData: Record<number, any[]> = {};

        // Floor 1
        pavilionData[1] = floor1Owners;

        // Floors 2-5
        internalData.forEach((f: any) => {
            pavilionData[f.floor] = f.owners;
        });

        // Ensure static Initial Data is used if DB misses them
        INITIAL_DATA_INTERNAL_FLOORS.forEach(f => {
            if (f.floor > 1 && !pavilionData[f.floor]) {
                pavilionData[f.floor] = f.owners;
            }
        });

        return NextResponse.json(pavilionData);
    } catch (error) {
        console.error('Fetch Pavilion error:', error);
        return NextResponse.json({ error: 'Failed to fetch pavilion data' }, { status: 500 });
    }
}
