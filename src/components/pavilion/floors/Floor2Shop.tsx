'use client';

import React from 'react';
import ArtGalleryUI from '../ArtGalleryUI';
import ProductGrid from '../ProductGrid';
import { FloorOwner, ViewMode } from '@/hooks/usePavilionState';

interface Floor2ShopProps {
    viewMode: ViewMode;
    owners: FloorOwner[];
    selectedArtistId: string | null;
    onArtistSelect: (id: string) => void;
    onEnterGallery: () => void;
    onBack: () => void;
    onItemClick: (id: string) => void;
}

export default function Floor2Shop({
    viewMode,
    owners,
    selectedArtistId,
    onArtistSelect,
    onEnterGallery,
    onBack,
    onItemClick
}: Floor2ShopProps) {
    if (viewMode === 'STANDARD') return null;

    const selectedOwner = owners.find(o => o.id === selectedArtistId);

    if (viewMode === 'ART_BIO' && selectedOwner) {
        return (
            <ProductGrid
                items={selectedOwner.items}
                onItemClick={onItemClick}
                onBack={onBack}
            />
        );
    }

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
            title="Prestige Shop"
            subtitle="Curated for Recovery"
            enterButtonText="상점 입장하기"
        />
    );
}
