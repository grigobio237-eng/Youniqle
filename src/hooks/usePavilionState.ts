'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getUserProgress, getMembershipLevel, TierType } from '@/lib/progress';

// --- Types ---
export interface PavilionItem {
    id: string;
    type: 'ARTWORK' | 'PRODUCT' | 'COACHING' | 'MEDICAL' | 'OMAKASE';
    title: string;
    subtitle?: string;
    description: string;
    specs: Record<string, string>;
    price: string;
    rental?: string;
    image?: string;
    canvasSize?: string;
    productId?: string; // 2층 상품 연결용
    artistId?: string; // 문의 연결용 파트너 ID
}

export interface IScheduleSlot {
    time: string;
    isBooked: boolean;
    bookedBy?: string;
}

export interface IScheduleDay {
    date: string;
    type: 'FULL_DAY' | 'HOURLY';
    slots?: IScheduleSlot[];
    isAvailable: boolean;
}

export interface FloorOwner {
    id: string;
    name: string;
    role: string;
    bio: string;
    image?: string;
    items: PavilionItem[];
    schedule?: IScheduleDay[];
}

export type ViewMode = 'STANDARD' | 'ART_GRID' | 'ART_BIO';

// Artist portraits fallback
const ARTIST_PORTRAITS: Record<string, string> = {
    'artist-a': '/artist_master_a.png',
    'artist-b': '/artist_master_b.png'
};

export function usePavilionState() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialFloor = parseInt(searchParams?.get('floor') || '1', 10);

    // Core state
    const [activeFloor, setActiveFloor] = useState(initialFloor >= 1 && initialFloor <= 5 ? initialFloor : 1);
    const [mounted, setMounted] = useState(false);
    const [showIntro, setShowIntro] = useState(initialFloor !== 5);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // DB Data
    const [pavilionData, setPavilionData] = useState<Record<number, FloorOwner[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    // Selection state
    const [selectedOwner, setSelectedOwner] = useState<FloorOwner | null>(null);
    const [isInsideRoom, setIsInsideRoom] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PavilionItem | null>(null);
    const [isImageZoomed, setIsImageZoomed] = useState(false);
    const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>(initialFloor === 5 ? 'STANDARD' : 'STANDARD');
    const [galleryOffset, setGalleryOffset] = useState(0);

    // Booking state
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [bookingDate, setBookingDate] = useState<string | null>(null);
    const [bookingSlot, setBookingSlot] = useState<string | null>(null);
    const [isBooking, setIsBooking] = useState(false);

    // Coaching program state
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
    const [selectedProgramTitle, setSelectedProgramTitle] = useState<string | null>(null);
    const [selectedProgramPrice, setSelectedProgramPrice] = useState<string | null>(null);

    // Omakase state (5F)
    const [omakaseSelection, setOmakaseSelection] = useState<PavilionItem[]>([]);
    const [budget, setBudget] = useState(50000000);
    const [omakaseFilterFloor, setOmakaseFilterFloor] = useState<number | null>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    // Access state
    const [showLoungeNudge, setShowLoungeNudge] = useState(false);
    const [dbUserTier, setDbUserTier] = useState<TierType | null>(null);

    // Initialize
    useEffect(() => {
        setMounted(true);
        fetchPavilionData();
        fetchUserTier();
    }, []);

    const fetchUserTier = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (data.user?.tier) {
                    setDbUserTier(data.user.tier as TierType);
                }
            }
        } catch (error) {
            console.error('Failed to fetch user tier for access control:', error);
        }
    };

    // Set initial view mode when data loads
    useEffect(() => {
        if (mounted && !isLoading && Object.keys(pavilionData).length > 0 && activeFloor !== 5) {
            setViewMode('ART_GRID');
        }
    }, [mounted, isLoading, pavilionData, activeFloor]);

    const fetchPavilionData = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/pavilion');
            if (res.ok) {
                const data = await res.json();

                // Load 2F products separately
                const floor2Res = await fetch('/api/pavilion/products?floorId=floor-2');
                if (floor2Res.ok) {
                    const productsData = await floor2Res.json();
                    data[2] = [{
                        id: 'shop-products',
                        name: 'Recovery Shop',
                        role: '상품 전시',
                        bio: '회복을 위한 다양한 상품을 만나보세요',
                        image: '/artist_master_a.png',
                        items: productsData.items || []
                    }];
                }

                setPavilionData(data);
            }
        } catch (error) {
            console.error('Failed to load pavilion data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentFloorOwners = useMemo(() => pavilionData[activeFloor] || [], [pavilionData, activeFloor]);

    const filteredOwners = useMemo(() => {
        if (!searchQuery.trim()) return currentFloorOwners;

        const query = searchQuery.toLowerCase();
        return currentFloorOwners.map(owner => {
            // Check if owner matches
            const nameMatch = owner.name.toLowerCase().includes(query);
            const roleMatch = owner.role.toLowerCase().includes(query);
            const bioMatch = owner.bio.toLowerCase().includes(query);

            // Filter items that match
            const matchingItems = owner.items.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.subtitle?.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );

            if (nameMatch || roleMatch || bioMatch || matchingItems.length > 0) {
                return {
                    ...owner,
                    items: matchingItems.length > 0 ? matchingItems : owner.items
                };
            }
            return null;
        }).filter(Boolean) as FloorOwner[];
    }, [currentFloorOwners, searchQuery]);

    const checkAccess = useCallback((floor: number) => {
        if (floor === 5) {
            const p = getUserProgress();
            const m = getMembershipLevel(p.totalPoints, p.currentStreak);

            // Check: 1) Points-based tier, 2) DB tier (manual upgrade), 3) Session tier (fallback)
            const sessionTier = (session?.user as any)?.tier as TierType | undefined;

            // Reborn 등급 이상인 경우 하나라도 만족하면 접속 허용 (DB값이 RESET이라도 세션이 REBORN이면 허용)
            const isRebornBase = m.level === 'REBORN' || m.level === 'RESTART';
            const isRebornDB = dbUserTier === 'REBORN' || dbUserTier === 'RESTART';
            const isRebornSession = sessionTier === 'REBORN' || sessionTier === 'RESTART';

            const isRebornOrHigher = isRebornBase || isRebornDB || isRebornSession;

            if (!isRebornOrHigher) {
                setShowLoungeNudge(true);
                return false;
            }
        }
        return true;
    }, [dbUserTier, session]);

    // URL 직접 접근이나 탭 변경 시 접근 권한 다시 확인
    useEffect(() => {
        if (mounted && activeFloor === 5) {
            if (!checkAccess(5)) {
                setActiveFloor(1); // 권한 없으면 1층으로 강제 이동
            }
        }
    }, [activeFloor, checkAccess, mounted]);

    // Handlers
    const handleArtistClick = useCallback((id: string) => {
        setSelectedArtistId(id);
        if (activeFloor <= 3) {
            setViewMode('ART_BIO');
        }
        const owner = (pavilionData[activeFloor] || []).find(o => o.id === id);
        if (owner) {
            setSelectedOwner(owner);
        }
    }, [activeFloor, pavilionData]);

    const handleArtworkClick = useCallback((itemId: string) => {
        if (selectedOwner) {
            const item = selectedOwner.items.find(i => i.id === itemId);
            if (item) {
                if (activeFloor === 2 && (item as PavilionItem).productId) {
                    router.push(`/products/${(item as PavilionItem).productId}`);
                } else {
                    setSelectedItem(item);
                }
            }
        }
    }, [selectedOwner, activeFloor, router]);

    const handleFloorChange = useCallback((floor: number) => {
        if (!checkAccess(floor)) return;

        setActiveFloor(floor);
        setSelectedOwner(null);
        setIsInsideRoom(false);
        setSelectedItem(null);
        setSelectedArtistId(null);
        setViewMode(floor === 5 ? 'STANDARD' : 'ART_GRID');
        setShowLoungeNudge(false);
    }, [checkAccess]);

    const enterRoom = useCallback(() => {
        setIsInsideRoom(true);
        setViewMode('STANDARD');
    }, []);

    const exitRoom = useCallback(() => {
        setIsInsideRoom(false);
        if (activeFloor <= 4) {
            setViewMode('ART_GRID');
        }
    }, [activeFloor]);

    const closeItem = useCallback(() => {
        setSelectedItem(null);
        setIsImageZoomed(false);
    }, []);

    const dismissIntro = useCallback(() => {
        setShowIntro(false);
        // 인트로 종료 후 온보딩 표시 (실제로는 localStorage 체크 권장)
        const hasSeenOnboarding = localStorage.getItem('pavilion_onboarding_seen');
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
        }
    }, []);

    const dismissOnboarding = useCallback(() => {
        setShowOnboarding(false);
        localStorage.setItem('pavilion_onboarding_seen', 'true');
    }, []);

    const getArtistImage = useCallback((owner: FloorOwner) => {
        return (owner.image && owner.image.trim() !== '')
            ? owner.image
            : (ARTIST_PORTRAITS[owner.id] || ARTIST_PORTRAITS['artist-a']);
    }, []);

    return {
        // Core state
        activeFloor,
        mounted,
        showIntro,
        showOnboarding,
        isLoading,
        pavilionData,
        currentFloorOwners,

        // Selection state
        selectedOwner,
        isInsideRoom,
        selectedItem,
        isImageZoomed,
        selectedArtistId,
        viewMode,
        galleryOffset,

        // Booking state
        showScheduleModal,
        bookingDate,
        bookingSlot,
        isBooking,
        selectedProgramId,
        selectedProgramTitle,
        selectedProgramPrice,

        // Omakase state
        omakaseSelection,
        budget,
        omakaseFilterFloor,
        searchQuery,
        filteredOwners,
        showLoungeNudge,

        // Setters
        setActiveFloor,
        setShowIntro,
        setShowOnboarding,
        setSelectedOwner,
        setIsInsideRoom,
        setSelectedItem,
        setIsImageZoomed,
        setSelectedArtistId,
        setViewMode,
        setGalleryOffset,
        setShowScheduleModal,
        setBookingDate,
        setBookingSlot,
        setIsBooking,
        setSelectedProgramId,
        setSelectedProgramTitle,
        setSelectedProgramPrice,
        setOmakaseSelection,
        setBudget,
        setOmakaseFilterFloor,
        setSearchQuery,
        setShowLoungeNudge,

        // Handlers
        handleArtistClick,
        handleArtworkClick,
        handleFloorChange,
        enterRoom,
        exitRoom,
        closeItem,
        dismissIntro,
        dismissOnboarding,
        getArtistImage,

        // Utils
        ARTIST_PORTRAITS,
        router
    };
}
