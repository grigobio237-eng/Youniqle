'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2, Layers, Box, X, Check } from 'lucide-react';

interface OnboardingGuideProps {
    show: boolean;
    onClose: () => void;
}

const STEPS = [
    {
        icon: <Layers className="w-8 h-8 text-[#D4AF37]" />,
        title: "Floor Navigation",
        desc: "왼쪽의 엘리베이터 메뉴를 통해 갤러리, 상점, 코칭 센터 등 각 층을 자유롭게 이동할 수 있습니다."
    },
    {
        icon: <MousePointer2 className="w-8 h-8 text-[#D4AF37]" />,
        title: "Explore Details",
        desc: "각 층의 아티스트나 상품 카드를 클릭하면 상세 정보와 함께 특별한 스토리를 확인할 수 있습니다."
    },
    {
        icon: <Box className="w-8 h-8 text-[#D4AF37]" />,
        title: "3D Experience",
        desc: "'입장하기' 버튼을 누르면 각 층의 고유한 3D 가상 공간으로 들어가 더 깊은 회복의 세계를 경험하게 됩니다."
    }
];

export default function OnboardingGuide({ show, onClose }: OnboardingGuideProps) {
    const [currentStep, setCurrentStep] = useState(0);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[600] bg-obsidian/80 backdrop-blur-md flex items-center justify-center p-6"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="max-w-xl w-full bg-white rounded-[40px] shadow-2xl overflow-hidden"
                    >
                        <div className="p-12 space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">Guide</span>
                                    <h2 className="text-3xl font-black text-obsidian italic tracking-tighter uppercase leading-none">
                                        HOW TO <span className="text-[#D4AF37]">ENJOY</span>
                                    </h2>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-slate-300" />
                                </button>
                            </div>

                            <div className="space-y-12 py-4">
                                {STEPS.map((step, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex gap-6 items-start"
                                    >
                                        <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center flex-shrink-0">
                                            {step.icon}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-black text-obsidian uppercase italic tracking-tight">{step.title}</h3>
                                            <p className="text-sm font-medium text-obsidian/40 leading-relaxed break-keep">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full h-20 bg-obsidian text-white rounded-[24px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 text-lg"
                            >
                                <Check size={20} />
                                Start Experience
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
