import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PavilionFloor from '@/models/PavilionFloor';
import { withAdminAuth } from '@/lib/authMiddleware';

// GET: 층별 데이터 리스트 조회
async function getPavilionHandler() {
    try {
        await connectDB();
        const data = await PavilionFloor.find().sort({ floor: 1 });
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch pavilion data' }, { status: 500 });
    }
}

// POST: 특정 층 데이터 업데이트 (전체 교체 형식)
async function updatePavilionHandler(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { floor, owners } = body;

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
