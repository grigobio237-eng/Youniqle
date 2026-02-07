import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PavilionFloor from '@/models/PavilionFloor';
import mongoose from 'mongoose';

// External DB Configuration
const EXTERNAL_URI = process.env.EXTERNAL_MONGODB_URI;
const FIREBASE_BUCKET = process.env.EXTERNAL_FIREBASE_BUCKET || 'artfactory-482402.firebasestorage.app';

// Helper to construct Firebase URL
function getFirebaseUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Encoding path segments to handle slashes correctly
    const encodedPath = encodeURIComponent(path);
    return `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET}/o/${encodedPath}?alt=media`;
}

async function fetchExternalFloor1Data() {
    if (!EXTERNAL_URI) {
        console.warn('EXTERNAL_MONGODB_URI is missing. Skipping external sync.');
        return [];
    }

    let conn;
    try {
        // Create a separate connection for external DB
        conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();

        // Fetch approved artworks
        const artworks = await conn.collection('artworks').find({ status: 'approved' }).toArray();
        if (artworks.length === 0) return [];

        // Group artworks by artist_id (using 'authorId' or 'artist_id' or 'userId' based on previous inspection, assuming schema uses one of these, let's prioritize 'artist_id' if available, otherwise check others)
        // Based on inspection, keys were: _id, title, description, artist_id...
        const artistMap = new Map();

        // Fetch related users (artists)
        // Collect all unique artist IDs
        const artistIds = [...new Set(artworks.map(a => a.artist_id).filter(Boolean))];

        // ⚠️ converting string IDs to ObjectId if needed, but assuming they match string/ObjectId format in query
        // The external User collection use _id as ObjectId usually.
        // Let's try to fetch users.
        const users = await conn.collection('users').find({
            _id: { $in: artistIds.map(id => new mongoose.Types.ObjectId(id)) }
        }).toArray();

        users.forEach(u => artistMap.set(u._id.toString(), u));

        // Group items by artist
        const ownersMap = new Map();

        artworks.forEach(art => {
            const artistId = art.artist_id?.toString();
            if (!artistId || !artistMap.has(artistId)) return;

            const artist = artistMap.get(artistId);

            if (!ownersMap.has(artistId)) {
                ownersMap.set(artistId, {
                    id: `ext-${artistId}`, // Prefix to avoid collision
                    name: artist.username || artist.name || 'Unknown Artist',
                    role: artist.role || 'Artist',
                    bio: artist.introduction || artist.bio || 'No biography available.',
                    image: getFirebaseUrl(artist.profile_image || artist.avatar_url),
                    items: []
                });
            }

            const owner = ownersMap.get(artistId);
            owner.items.push({
                id: `ext-art-${art._id}`,
                type: 'ARTWORK',
                title: art.title,
                description: art.description || '',
                price: art.price ? `${art.price.toLocaleString()}` : 'Price on Request', // Removed '₩' here if component adds it, or keep consistent. Component adds it? parsing logic exists. Let's keep raw number or formatted? Component uses parsePrice. Let's provide string.
                // Actually ItemDetailModal uses parsePrice which strips non-digits. So '₩' is fine.
                // But let's check parsePrice logic: priceStr.replace(/[^0-9]/g, '').
                // So "4,500,000" becomes 4500000.

                rental: art.rental_price ? `${art.rental_price.toLocaleString()}` : undefined,
                image: getFirebaseUrl(art.firebase_storage_path || art.image_url),
                specs: {
                    material: art.material || art.category || 'Mixed Media',
                    year: art.year || (art.createdAt ? new Date(art.createdAt).getFullYear().toString() : '2025')
                },
                canvasSize: art.size // Map ONLY to canvasSize to avoid duplication
            });
        });

        const owners = Array.from(ownersMap.values());

        // Add backup dummy if empty (optional)
        if (owners.length === 0) return [];

        return owners;

    } catch (error) {
        console.error('External DB Fetch Error:', error);
        return [];
    } finally {
        if (conn) {
            await conn.close();
        }
    }
}

const INITIAL_DATA_INTERNAL_FLOORS = [
    {
        floor: 1, // Fallback if external fails or for structure
        owners: []
    },
    {
        floor: 2,
        owners: [
            {
                id: 'shop-a', name: 'Elena Vance', role: 'Luxury Curator', bio: '전 세계 최상위 1%를 위한 회복 솔루션 아이템을 큐레이션합니다.',
                items: [
                    { id: 'shop-p1', type: 'PRODUCT', title: 'Nano-Ceramic Kit', description: '스위스 연구소의 기술력이 집약된 세포 재생 홈케어 시스템입니다.', specs: { tech: 'Nano-Cell' }, price: '₩3,500,000' },
                ]
            }
        ]
    },
    {
        floor: 3,
        owners: [
            {
                id: 'coach-a', name: 'Coach Leon', role: 'Performance specialist', bio: '국가대표 선수들의 컨디셔닝을 담당하는 신체 회복 전문가입니다.',
                items: [
                    { id: 'coach-c1', type: 'COACHING', title: 'Neuro-Muscle Reset', description: '신경계와 근육의 조화를 되찾아주는 1:1 리셋 프로그램입니다.', specs: { duration: '90min' }, price: '₩450,000' },
                ]
            }
        ]
    },
    {
        floor: 4,
        owners: [
            {
                id: 'med-a', name: 'Dr. Sarah', role: 'Medical Director', bio: '유전자 분석 기반의 정밀 의료 솔루션을 제공하는 의학 박사입니다.',
                items: [
                    { id: 'med-m1', type: 'MEDICAL', title: 'Genome Recovery Plan', description: '유전자 분석을 통해 설계된 개인맞춤형 재생 치료 플랜입니다.', specs: { analysis: 'Whole Genome' }, price: '₩12,000,000' },
                ]
            }
        ]
    },
    {
        floor: 5,
        owners: [
            {
                id: 'omakase-master',
                name: '김미정 원장',
                role: 'Representative Director',
                bio: '"시술은 기적이 아닙니다. 회복된 몸 위에 놓일 때 비로소 완성되는 도구일 뿐입니다."',
                image: '/images/kim-mijeong-profile.jpg',
                items: [],
                specs: {
                    totalSlots: '50',
                    occupiedSlots: '47',
                    welcomeMessage: '이곳은 검증된 소수만을 위한 비밀 회복 연구소입니다.',
                    introTitle: 'Secret Recovery Lab'
                }
            }
        ]
    }
];

export async function GET() {
    try {
        await connectDB();

        // 1. Fetch Internal Data (Floors 2-5)
        let internalData = await PavilionFloor.find({ floor: { $ne: 1 } }).lean();

        // If internal DB is empty (first run), populate standard floors
        if (internalData.length === 0) {
            // We can just use memory constant for now or seed.
            // Let's filter INITIAL_DATA for >1
            internalData = INITIAL_DATA_INTERNAL_FLOORS.filter(f => f.floor > 1);
        }

        // 2. Fetch External Data (Floor 1)
        let floor1Owners = await fetchExternalFloor1Data();

        // If external failed or empty, maybe fallback to internal floor 1 if exists?
        // But requested behavior is direct sync.

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
