import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PavilionFloor from '@/models/PavilionFloor';
import { withAdminAuth } from '@/lib/authMiddleware';

// GET: 층별 데이터 리스트 조회
async function getPavilionHandler() {
    try {
        await connectDB();
        // 1. Fetch Internal Data
        let data: any[] = await PavilionFloor.find().sort({ floor: 1 }).lean();

        // 2. Fetch External Data for Floor 1
        const { fetchExternalFloor1Data } = await import('@/lib/pavilionData');
        const externalFloor1Owners = await fetchExternalFloor1Data();

        // 3. Merge External Data
        // If external data exists, override or add Floor 1
        if (externalFloor1Owners.length > 0) {
            const floor1Index = data.findIndex((f: any) => f.floor === 1);
            if (floor1Index !== -1) {
                data[floor1Index].owners = externalFloor1Owners;
            } else {
                // Add as first element if missing and sort by floor just in case
                data.push({ floor: 1, owners: externalFloor1Owners });
                data.sort((a: any, b: any) => a.floor - b.floor);
            }
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin Pavilion Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch pavilion data' }, { status: 500 });
    }
}

// POST: 특정 층 데이터 업데이트 (전체 교체 형식)
async function updatePavilionHandler(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { floor, owners } = body;

        console.log(`[API] Updating Floor ${floor} with ${owners?.length} owners`);
        owners?.forEach((o: any) => {
            console.log(` - Owner: ${o.name}, Image Path: ${o.image || 'EMPTY'}`);
        });

        if (!floor || !owners) {
            return NextResponse.json({ error: 'Floor and owners data are required' }, { status: 400 });
        }

        const updatedFloor = await PavilionFloor.findOneAndUpdate(
            { floor },
            { owners },
            { new: true, upsert: true }
        );

        return NextResponse.json(updatedFloor);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update pavilion data' }, { status: 500 });
    }
}

export const GET = withAdminAuth(getPavilionHandler);
export const POST = withAdminAuth(updatePavilionHandler);
