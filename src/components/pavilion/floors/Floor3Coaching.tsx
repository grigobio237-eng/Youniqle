'use client';

import React from 'react';
import ArtGalleryUI from '../ArtGalleryUI';
import { FloorOwner, ViewMode } from '@/hooks/usePavilionState';

interface Floor3CoachingProps {
    viewMode: ViewMode;
    owners: FloorOwner[];
    selectedArtistId: string | null;
    onArtistSelect: (id: string) => void;
    onEnterGallery: () => void;
    onBack: () => void;
    onViewSchedule: () => void;
}

export default function Floor3Coaching({
    viewMode,
    owners,
    selectedArtistId,
    onArtistSelect,
    onEnterGallery,
    onBack,
    onViewSchedule
}: Floor3CoachingProps) {
    if (viewMode === 'STANDARD') return null;

    return (
        <ArtGalleryUI
            viewMode={viewMode === 'ART_GRID' ? 'GRID' : 'BIO'}
            artists={owners.map((o) => ({
                id: o.id,
                name: o.name,
                role: o.role,
                bio: o.bio,
                image: o.image
            }))}
            selectedArtistId={selectedArtistId}
            onArtistSelect={onArtistSelect}
            onEnterGallery={onEnterGallery}
            onBack={onBack}
            onViewSchedule={onViewSchedule}
            title="Dynamic Coaching"
            subtitle="Empowering Performance"
            enterButtonText="코칭 센터 입장하기"
            showReviews={true}
        />
    );
}
