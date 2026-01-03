'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, User } from 'lucide-react';

interface Artist {
    id: string;
    name: string;
    role: string;
    bio: string;
    image?: string;
}

interface ArtGalleryUIProps {
    viewMode: 'GRID' | 'BIO';
    artists: Artist[];
    selectedArtistId: string | null;
    onArtistSelect: (id: string) => void;
    onEnterGallery: () => void;
    onBack?: () => void;
}

export default function ArtGalleryUI({
    viewMode,
    artists,
    selectedArtistId,
    onArtistSelect,
    onEnterGallery,
    onBack
}: ArtGalleryUIProps) {
    const selectedArtist = artists.find(a => a.id === selectedArtistId);

    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/95 backdrop-blur-sm pointer-events-auto">
            <AnimatePresence mode="wait">
                {viewMode === 'GRID' && (
                    <motion.div
                        key="artist-grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-6xl px-6"
                    >
                        <div className="mb-12 text-center">
                            <motion.h2
                                initial={{ opacity: 0, letterSpacing: '0.5em' }}
                                animate={{ opacity: 1, letterSpacing: '1em' }}
                                className="text-sm font-black text-obsidian uppercase tracking-[1em] mb-4"
                            >
                                Art Gallery
                            </motion.h2>
                            <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-obsidian uppercase italic">
                                Visionaries of Recovery
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {artists.map((artist) => (
                                <motion.button
                                    key={artist.id}
                                    whileHover={{ y: -10 }}
                                    onClick={() => onArtistSelect(artist.id)}
                                    className="group relative aspect-[3/4] bg-mist overflow-hidden rounded-2xl"
                                >
                                    {artist.image ? (
                                        <img
                                            src={artist.image}
                                            alt={artist.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-mist text-obsidian/20">
                                            <User size={80} strokeWidth={0.5} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest mb-1">{artist.role}</p>
                                        <h4 className="text-white text-2xl font-black tracking-tighter uppercase">{artist.name}</h4>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {viewMode === 'BIO' && selectedArtist && (
                    <motion.div
                        key="artist-bio"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full flex flex-col md:flex-row items-center justify-center bg-white"
                    >
                        {/* Background Spline/Graphic or Artist Image */}
                        <div className="relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden">
                            {selectedArtist.image ? (
                                <motion.img
                                    layoutId={`artist-image-${selectedArtist.id}`}
                                    src={selectedArtist.image}
                                    alt={selectedArtist.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-mist flex items-center justify-center">
                                    <User size={120} className="text-obsidian/10" />
                                </div>
                            )}
                            <button
                                onClick={onBack}
                                className="absolute top-8 left-8 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white text-obsidian transition-colors z-30"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center">
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <p className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.3em] mb-4">
                                    {selectedArtist.role}
                                </p>
                                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-obsidian uppercase mb-8 italic">
                                    {selectedArtist.name}
                                </h2>
                                <div className="w-24 h-1 bg-obsidian/10 mb-8" />
                                <p className="text-xl text-obsidian/60 font-medium leading-relaxed mb-12 max-w-lg">
                                    {selectedArtist.bio}
                                </p>

                                <button
                                    onClick={onEnterGallery}
                                    className="group flex items-center gap-6 px-10 py-5 bg-obsidian text-white rounded-full overflow-hidden relative"
                                >
                                    <span className="relative z-10 text-sm font-black uppercase tracking-widest">갤러리 입장하기</span>
                                    <ArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform" size={20} />
                                    <motion.div
                                        className="absolute inset-0 bg-[#D4AF37]"
                                        initial={{ x: '-100%' }}
                                        whileHover={{ x: 0 }}
                                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                                    />
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
