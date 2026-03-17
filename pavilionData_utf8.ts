
import mongoose from 'mongoose';

// External DB Configuration
const EXTERNAL_URI = process.env.EXTERNAL_MONGODB_URI;
const FIREBASE_BUCKET = process.env.EXTERNAL_FIREBASE_BUCKET || 'artfactory-482402.firebasestorage.app';

// Helper to construct Firebase URL
export function getFirebaseUrl(path: string | undefined): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    // Encoding path segments to handle slashes correctly
    const encodedPath = encodeURIComponent(path);
    return `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET}/o/${encodedPath}?alt=media`;
}

export const INITIAL_DATA_INTERNAL_FLOORS = [
    {
        floor: 1, // Fallback if external fails or for structure
        owners: [] as any[]
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

export async function fetchExternalFloor1Data() {
    if (!EXTERNAL_URI) {
        console.warn('EXTERNAL_MONGODB_URI is missing. Skipping external sync.');
        return [];
    }

    let conn;
    try {
        console.log('Connecting to External DB:', EXTERNAL_URI.replace(/:([^:@]+)@/, ':****@'));
        // Create a separate connection for external DB
        conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();
        console.log('Connected to External DB. Fetching artworks...');

        // Fetch approved artworks
        const artworks = await conn.collection('artworks').find({ status: 'approved' }).toArray();
        console.log(`Found ${artworks.length} approved artworks in External DB.`);

        if (artworks.length === 0) return [];

        // Group artworks by artist_id
        const artistMap = new Map();

        // Fetch related users (artists)
        // Collect all unique artist IDs
        const artistIds = [...new Set(artworks.map(a => a.artist_id).filter(Boolean))];
        console.log(`Found ${artistIds.length} unique artist IDs.`);

        // ⚠️ converting string IDs to ObjectId if needed
        const objectIds = artistIds.map(id => {
            try {
                return new mongoose.Types.ObjectId(id);
            } catch (e) {
                console.warn(`Invalid ObjectId: ${id}`);
                return null;
            }
        }).filter(Boolean) as mongoose.Types.ObjectId[];

        const users = await conn.collection('users').find({
            _id: { $in: objectIds }
        }).toArray();

        console.log(`Found ${users.length} users (artists) in External DB.`);

        users.forEach(u => artistMap.set(u._id.toString(), u));

        // Group items by artist
        const ownersMap = new Map();

        artworks.forEach(art => {
            const artistId = art.artist_id?.toString();
            if (!artistId || !artistMap.has(artistId)) return;

            const artist = artistMap.get(artistId);

            if (!ownersMap.has(artistId)) {
                ownersMap.set(artistId, {
                    id: artistId, // Use simpler ID for matching
                    name: artist.username || artist.name || 'Unknown Artist',
                    role: 'Artist', // Default role
                    bio: artist.artist_bio || artist.introduction || artist.bio || 'No biography available.',
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
                price: art.price ? `${art.price.toLocaleString()}` : 'Price on Request',
                rental: (art.rental_price !== undefined && art.rental_price !== null) ? `${art.rental_price.toLocaleString()}` : undefined,
                image: getFirebaseUrl(art.firebase_storage_path || art.image_url),
                specs: {
                    material: art.material || art.category || 'Mixed Media',
                    year: art.year || (art.createdAt ? new Date(art.createdAt).getFullYear().toString() : '2025')
                },
                canvasSize: art.size,
                rentalStatus: (art.rental_status && art.rental_status !== 'undefined') ? art.rental_status : 'available',
                artistId: artistId // Ensure artistId is set for inquiries
            });
        });

        const owners = Array.from(ownersMap.values());
        console.log(`Constructed ${owners.length} owners from External DB.`);

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
