export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import ConciergeRequest from '@/models/ConciergeRequest';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Pending inquiries count grouped by floor
        const floorStats = await Inquiry.aggregate([
            { $match: { status: 'pending', floor: { $exists: true } } },
            { $group: { _id: '$floor', count: { $sum: 1 } } }
        ]);

        // Pending Concierge requests (Always Floor 5)
        const conciergeCount = await ConciergeRequest.countDocuments({ status: 'pending' });

        // Pending inquiries count grouped by artistId
        const artistStats = await Inquiry.aggregate([
            { $match: { status: 'pending', artistId: { $exists: true } } },
            { $group: { _id: '$artistId', count: { $sum: 1 } } }
        ]);

        // Convert array to map/object for easier lookup on frontend
        // floorStats: { 1: 5, 2: 0, ... }
        const floorCounts: Record<string, number> = {};
        floorStats.forEach((item: any) => {
            if (item._id) floorCounts[item._id] = item.count;
        });

        // Add Concierge requests to Floor 5
        floorCounts['5'] = (floorCounts['5'] || 0) + conciergeCount;

        const artistCounts: Record<string, number> = {};
        artistStats.forEach((item: any) => {
            if (item._id) artistCounts[item._id] = item.count;
        });

        return NextResponse.json({
            floorCounts,
            artistCounts
        });
    } catch (error) {
        console.error('Pavilion stats error:', error);
        return NextResponse.json({ floorCounts: {}, artistCounts: {} }, { status: 500 });
    }
}
