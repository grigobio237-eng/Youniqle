'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, Filter, X, ArrowUpRight } from 'lucide-react';
import { PavilionItem } from '@/hooks/usePavilionState';
import { Badge } from '@/components/ui/badge';

interface ProductGridProps {
    items: PavilionItem[];
    onItemClick: (id: string) => void;
    onBack: () => void;
}

export default function ProductGrid({ items, onItemClick, onBack }: ProductGridProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Extract categories from items (assuming category is in subtitle or specs)
    const categories = useMemo(() => {
        const cats = new Set<string>();
        items.forEach(item => {
            if (item.subtitle) cats.add(item.subtitle);
        });
        return ['ALL', ...Array.from(cats)];
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesCategory = selectedCategory === 'ALL' || item.subtitle === selectedCategory;
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [items, selectedCategory, searchQuery]);

    return (
        <div className="absolute inset-0 z-30 bg-white flex flex-col pointer-events-auto overflow-hidden">
            {/* Shop Header & FilterBar */}
            <div className="w-full p-8 md:p-12 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/80 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onBack}
                        className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} className="text-slate-400" />
                    </button>
                    <div>
                        <h2 className="text-4xl font-black text-obsidian italic tracking-tighter uppercase">Prestige <span className="text-[#D4AF37]">Shop</span></h2>
                        <p className="text-[10px] font-black text-obsidian/30 uppercase tracking-widest">Floor 2 Selection</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#D4AF37] transition-colors" />
                        <input
                            type="text"
                            placeholder="Find your recovery..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-6 h-12 rounded-full bg-slate-50 border-none focus:ring-2 focus:ring-[#D4AF37]/20 w-full md:w-64 text-sm font-bold placeholder:text-slate-300 transition-all"
                        />
                    </div>
                    {/* Category Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 h-10 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-obsidian text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        {filteredItems.map((item) => (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 hover:border-[#D4AF37]/30 hover:shadow-2xl hover:shadow-[#D4AF37]/5 transition-all duration-500 flex flex-col h-full"
                            >
                                {/* Image Wrapper */}
                                <div
                                    className="relative aspect-square overflow-hidden bg-slate-50 cursor-pointer"
                                    onClick={() => onItemClick(item.id)}
                                >
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                                            <ShoppingCart size={48} strokeWidth={1} />
                                        </div>
                                    )}
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-obsidian/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center scale-75 group-hover:scale-100 transition-transform">
                                            <ArrowUpRight className="text-obsidian" size={24} />
                                        </div>
                                    </div>
                                    <Badge className="absolute top-6 right-6 bg-white/90 backdrop-blur-md text-obsidian border-none font-black px-4 py-1.5 rounded-full shadow-lg">
                                        {item.subtitle || 'Product'}
                                    </Badge>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex flex-col flex-1">
                                    <h4 className="text-xl font-black text-obsidian tracking-tighter mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-obsidian/40 font-medium line-clamp-2 leading-relaxed mb-6 flex-1">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center justify-between gap-4 mt-auto">
                                        <div>
                                            <p className="text-[8px] font-black text-obsidian/20 uppercase tracking-widest mb-1">Prestige Price</p>
                                            <p className="text-lg font-black text-obsidian tracking-tight italic">
                                                {Number(item.price).toLocaleString()} KRW
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onItemClick(item.id);
                                            }}
                                            className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-obsidian hover:bg-obsidian hover:text-white transition-all shadow-sm"
                                        >
                                            <ShoppingCart size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {filteredItems.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-black text-obsidian italic uppercase tracking-tight">No items found</h3>
                        <p className="text-sm font-medium text-obsidian/30 max-w-xs">다른 검색어나 카테고리를 선택해보세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
