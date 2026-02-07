import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import PavilionFloor, { IPavilionFloor, IFloorOwner } from '@/models/PavilionFloor';
import dbConnect from '@/lib/db';

// Define the expected payload structure
interface ExternalArtwork {
    title: string;
    description: string;
    imageUrl: string;
    price: string;
    type?: 'ARTWORK' | 'PRODUCT' | 'COACHING' | 'MEDICAL' | 'OMAKASE';
    canvasSize?: string;
    year?: string;
}

interface ExternalArtistPayload {
    artist: {
        id: string; // External ID
        name: string;
        bio: string;
        imageUrl?: string;
        role?: string;
    };
    artworks: ExternalArtwork[];
}

export async function POST(req: NextRequest) {
    try {
        // 1. Authentication Check
        const apiKey = req.headers.get('x-api-key');
        const envApiKey = process.env.EXTERNAL_SYNC_API_KEY;

        if (!envApiKey || apiKey !== envApiKey) {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid or missing API Key' },
                { status: 401 }
            );
        }

        // 2. Parse Body
        const body: ExternalArtistPayload = await req.json();
        const { artist, artworks } = body;

        if (!artist?.id || !artist?.name) {
            return NextResponse.json(
                { error: 'Missing required artist fields (id, name)' },
                { status: 400 }
            );
        }

        await dbConnect();

        // 3. Find Pavilion Floor 1
        // Using explicit cast or lean() if needed, but Mongoose model should handle it.
        let pavilionFloor = await PavilionFloor.findOne({ floor: 1 });

        if (!pavilionFloor) {
            // Create if not exists (though typically seeded)
            pavilionFloor = new PavilionFloor({
                floor: 1,
                owners: []
            });
        }

        // 4. Map External Data to Internal Model
        const ownerId = `ext-${artist.id}`; // Prefix to avoid collisions

        // Transform artworks to PavilionItems
        const newItems = artworks.map((art, index) => ({
            id: `${ownerId}-item-${Date.now()}-${index}`,
            type: art.type || 'ARTWORK',
            title: art.title,
            description: art.description,
            price: art.price,
            image: art.imageUrl,
            specs: {
                year: art.year || new Date().getFullYear().toString(),
                material: 'Mixed Media', // Default or add to payload if available
            },
            canvasSize: art.canvasSize
        }));

        // 5. Update or Add Owner
        const existingOwnerIndex = pavilionFloor.owners.findIndex(
            (owner: IFloorOwner) => owner.id === ownerId || owner.name === artist.name
        );

        const ownerData: IFloorOwner = {
            id: ownerId,
            name: artist.name,
            role: artist.role || 'Partner Artist',
            bio: artist.bio,
            image: artist.imageUrl,
            items: newItems,
            schedule: [] // No scheduling for external artists for now
        };

        if (existingOwnerIndex > -1) {
            // Update existing
            pavilionFloor.owners[existingOwnerIndex] = ownerData;
        } else {
            // Add new
            pavilionFloor.owners.push(ownerData);
        }

        // 6. Save
        await pavilionFloor.save();

        return NextResponse.json({
            success: true,
            message: existingOwnerIndex > -1 ? 'Artist updated' : 'Artist created',
            data: { ownerId }
        });

    } catch (error: any) {
        console.error('External Pavilion Sync Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
