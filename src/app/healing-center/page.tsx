'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  LayoutGrid
} from 'lucide-react';
import SecretRecoveryLab from '@/components/healing/SecretRecoveryLab';
import PrincipalLoungeLegacy from '@/components/healing/PrincipalLoungeLegacy';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Image from 'next/image';

const PRINCIPAL_DATA = {
    name: '김미정 원장',
    role: 'Representative Director',
    bio: '회복 설계는 기적이 아닙니다. 회복된 몸 위에 놓일 때 비로소 완성되는 도구일 뿐입니다.',
    image: '/images/kim-mijeong-profile.jpg',
    history: [
        'Re&CLE의원 대표원장 (현)',
        '더 웰셈 양,한방병원 대표원장 (현)',
        '고려대학교 의과대학 외래교수 역임',
        '대한 밀란스의학회 부회장',
        '세계얼굴 학회 상임회장',
        '춘사 영화제 운영위원',
        '국제 항노화 협회장 역임',
        '미스코리아 심사위원',
        '일본 중입자 크리닉 대표원장 역임',
        '사랑의 크리닉 대원장 역임',
        '독일 프리덴바일 병원 연수',
        '독일 웨셀브 면역병원 연수'
    ],
    philosophy: [
        { emoji: '🧱', title: '기초 없는 건축은 위험합니다', desc: '기초가 없는 상태에서의 집중 케어는 위험합니다. 유니클은 근본적인 회복을 최우선으로 합니다.' },
        { emoji: '🌱', title: '몸은 스스로 낫고 싶어 합니다', desc: '우리의 몸은 이미 회복할 능력을 가지고 있습니다. 그 능력을 방해하는 요소(나쁜 루틴)만 제거해도 놀라운 변화가 시작됩니다.' },
        { emoji: '🤝', title: '평생의 동행을 약속합니다', desc: '한 번의 케어로 끝나는 관계가 아닙니다. 안티그레비티 클리닉은 당신이 홀로서기 할 때까지 매일의 루틴을 함께 고민합니다.' }
    ],
    faqs: [
        { q: 'Q. 회복 솔루션은 언제 받는 것이 좋은가요?', a: '회복 점수가 "MID" 단계 이상으로 안정되었을 때 솔루션 효과가 극대화됩니다. 몸이 너무 지쳐있는 상태에서는 무리한 과정보다 수면과 영양 밸런스를 먼저 잡는 것을 권장합니다.' },
        { q: 'Q. 컨시어지 프로그램은 누구나 신청 가능한가요?', a: '아니요, 컨시어지는 1:1 맞춤 설계의 밀도가 높기 때문에 매월 한정된 인원만 초대제로 운영됩니다. 신청 폼을 작성해 주시면, 현재 상태와 시급성을 원장이 직접 검토하여 초대를 드립니다.' },
        { q: 'Q. 전용 프로그램 진행 기간은 어떻게 되나요?', a: '상태에 따라 3일 집중 정화부터 30일 프리미엄 설계까지 다양하게 구성됩니다. 진단 결과에 따라 최적의 기간을 제안해 드립니다.' }
    ]
};

export default function HealingCenterPage() {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<any[]>([]);
    
    // UI States
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

    // Fetch Data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Products for Floor 5 (Signature Floor)
            const productRes = await fetch(`/api/products?pavilionFloorId=floor-5`);
            const productData = await productRes.json();
            const floorProducts = productData.products || [];

            setProducts(floorProducts);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#F9F7F2]">
            {/* Main Content Layer */}
            <div className="relative z-10 w-full h-full flex flex-col overflow-hidden">
                {/* Top Status Bar (Sticky) */}
                <div className="sticky top-0 z-50 w-full h-20 px-10 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-[#0B0D10]/5 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#0B0D10] rounded-xl shadow-lg shadow-[#0B0D10]/20">
                            <LayoutGrid size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-[#0B0D10] tracking-tight">프라이빗 라운지</h2>
                            <p className="text-[10px] font-bold text-[#0B0D10]/40 uppercase tracking-widest">Ultimate Suite - Recovery Architecture</p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full flex flex-col"
                    >
                        {/* Section 1: Secret Recovery Lab (Diagnosis) */}
                        <SecretRecoveryLab />
                        
                        {/* Section 2: Principal Lounge Legacy (Info) */}
                        <PrincipalLoungeLegacy data={PRINCIPAL_DATA} />

                        {/* Footer Decoration */}
                        <div className="py-20 text-center bg-white border-t border-[#0B0D10]/5">
                            <p className="text-[10px] font-black text-[#0B0D10]/20 uppercase tracking-[1em]">Youniqle Ultimate Suite</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modals & Overlays (Pointer Events Active) */}
            <AnimatePresence>
                {/* Product Detail Modal */}
                {selectedProduct && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-20 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-[#0B0D10] border border-white/10 rounded-[48px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
                        >
                            <button 
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-8 right-8 z-10 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/40 transition-all"
                                aria-label="닫기"
                            >
                                <X size={20} />
                            </button>

                            <div className="md:w-1/2 aspect-square relative bg-white/5">
                                <Image 
                                    src={selectedProduct.images?.[0]?.url || '/images/placeholders/product.png'} 
                                    alt={selectedProduct.name} 
                                    fill 
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] to-transparent opacity-60" />
                                <div className="absolute bottom-10 left-10">
                                    <Badge className="bg-[#D4AF37] text-black border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                        Ultimate Edition
                                    </Badge>
                                    <h2 className="text-4xl font-serif text-white tracking-tighter leading-tight">{selectedProduct.name}</h2>
                                </div>
                            </div>

                            <div className="md:w-1/2 p-12 lg:p-16 space-y-12 overflow-y-auto max-h-[85vh]">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">제품 내러티브</p>
                                        <p className="text-white/70 text-sm leading-relaxed font-medium">
                                            {selectedProduct.summary}
                                        </p>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">과학적 가치</p>
                                        <p className="text-white/60 text-xs leading-relaxed">
                                            본 솔루션은 마스터의 정밀한 회복 프로토콜에 따라 생체 데이터 최적화를 목표로 설계되었습니다.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end border-t border-white/10 pt-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">독점 제공가</p>
                                        <p className="text-3xl font-serif text-white tracking-tighter">{selectedProduct.price?.toLocaleString()}₩</p>
                                    </div>
                                    <Button className="h-16 px-12 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-[#D4AF37] transition-all">
                                        솔루션 획득하기
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
