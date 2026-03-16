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

export async function fetchGalleryData() {
    if (!EXTERNAL_URI) {
        console.warn('EXTERNAL_MONGODB_URI is missing. Skipping external sync.');
        return [];
    }

    let conn;
    try {
        console.log('Connecting to External Gallery DB:', EXTERNAL_URI.replace(/:([^:@]+)@/, ':****@'));
        // Create a separate connection for external DB
        conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();
        console.log('Connected to External Gallery DB. Fetching artworks...');

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
                canvasSize: art.width && art.height ? `${art.width} x ${art.height} cm` : (art.size ? `${art.size}호` : 'Various Sizes'),
                hoSize: art.ho || art.size,
                width: art.width,
                height: art.height,
                rentalStatus: (art.rental_status && art.rental_status !== 'undefined') ? art.rental_status : 'available',
                artistId: artistId // Ensure artistId is set for inquiries
            });
        });

        const owners = Array.from(ownersMap.values());
        console.log(`Constructed ${owners.length} owners from External DB.`);

        return owners;

    } catch (error) {
        console.error('External Gallery DB Fetch Error:', error);
        return [];
    } finally {
        if (conn) {
            await conn.close();
        }
    }
}
