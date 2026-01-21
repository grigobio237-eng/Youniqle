'use client';

import React from 'react';
import ArtGalleryUI from '../ArtGalleryUI';
import { FloorOwner, ViewMode } from '@/hooks/usePavilionState';

interface Floor1GalleryProps {
    viewMode: ViewMode;
    owners: FloorOwner[];
    selectedArtistId: string | null;
    onArtistSelect: (id: string) => void;
    onEnterGallery: () => void;
    onBack: () => void;
}

export default function Floor1Gallery({
    viewMode,
    owners,
    selectedArtistId,
    onArtistSelect,
    onEnterGallery,
    onBack
}: Floor1GalleryProps) {
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
            title="Art Gallery"
            subtitle="Visionaries of Recovery"
            enterButtonText="갤러리 입장하기"
        />
    );
}
