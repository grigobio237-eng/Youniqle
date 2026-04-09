'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BadgeCheck, 
  Quote, 
  Award, 
  BookOpen, 
  MessageCircle,
  ChevronRight,
  User,
  Info
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";

interface PrincipalLoungeLegacyProps {
    data: {
        name: string;
        role: string;
        bio: string;
        image: string;
        history: string[];
        philosophy: {
            emoji: string;
            title: string;
            desc: string;
        }[];
        faqs: {
            q: string;
            a: string;
        }[];
    };
}

export default function PrincipalLoungeLegacy({ data }: PrincipalLoungeLegacyProps) {
    return (
        <div className="w-full bg-white space-y-40 py-40">
            {/* 1. Principal Profile Section */}
            <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                <div className="relative aspect-[4/5] rounded-[60px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.12)] group">
                    <Image 
                        src={data.image} 
                        alt={data.name} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10]/60 via-transparent to-transparent" />
                    <div className="absolute bottom-12 left-12 right-12 text-white space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Master Architect</p>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic">{data.name}</h2>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="space-y-6">
                        <Quote className="w-12 h-12 text-[#D4AF37] opacity-20" />
                        <h3 className="text-3xl md:text-5xl font-black text-[#0B0D10] tracking-tighter leading-tight italic">
                            "{data.bio}"
                        </h3>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-[#0B0D10]/30 uppercase tracking-[0.4em]">Background</p>
                            <p className="text-lg font-bold text-[#0B0D10]/80 leading-relaxed">
                                정밀 의학과 데이터 분석을 기반으로, <br />
                                무너진 생체 리듬을 재구축하는 최고의 전문가입니다.
                            </p>
                        </div>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="h-16 px-10 bg-[#0B0D10] text-white rounded-[20px] font-black text-xs uppercase tracking-widest gap-4 group">
                                    원장 약력 및 커리어 보기
                                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-white border-none rounded-[40px] p-12">
                                <DialogHeader>
                                    <DialogTitle className="text-3xl font-black text-[#0B0D10] tracking-tighter italic mb-8">Career Detail</DialogTitle>
                                    <DialogDescription className="sr-only">원장 김미정의 상세 약력입니다.</DialogDescription>
                                </DialogHeader>
                                <ul className="space-y-6">
                                    {data.history.map((item, i) => (
                                        <li key={i} className="flex items-start gap-4 text-lg font-bold text-[#0B0D10]/70">
                                            <BadgeCheck className="w-6 h-6 text-[#D4AF37] shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </section>

            {/* 2. Philosophy Section */}
            <section className="bg-[#F9F7F2] py-40">
                <div className="max-w-7xl mx-auto px-6 space-y-20">
                    <div className="text-center space-y-4">
                        <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.5em] block">Core Philosophy</span>
                        <h2 className="text-3xl md:text-5xl font-black text-[#0B0D10] italic tracking-tighter">
                            Why <span className="text-[#D4AF37] tracking-normal">Recovery</span> First?
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {data.philosophy.map((card, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ y: -10 }}
                                className="bg-white p-12 rounded-[48px] shadow-[0_30px_80px_rgba(0,0,0,0.02)] border border-[#0B0D10]/5 space-y-8"
                            >
                                <div className="text-6xl">{card.emoji}</div>
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-[#0B0D10] tracking-tight leading-tight italic">{card.title}</h3>
                                    <p className="text-sm font-medium text-[#0B0D10]/50 leading-relaxed word-keep-all">{card.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. FAQ Section */}
            <section className="max-w-4xl mx-auto px-6 space-y-20">
                <div className="text-center space-y-4">
                    <span className="text-[10px] font-black text-[#0B0D10]/20 uppercase tracking-[0.5em] block">Resources</span>
                    <h2 className="text-4xl font-black text-[#0B0D10] italic tracking-tighter">자주 묻는 질문 (FAQ)</h2>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {data.faqs.map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border-none bg-[#F9F7F2]/50 rounded-[32px] overflow-hidden px-10 transition-all hover:bg-[#F9F7F2]">
                            <AccordionTrigger className="text-xl font-black text-[#0B0D10] hover:no-underline py-8">
                                {faq.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-[#0B0D10]/50 font-medium leading-relaxed pb-10 text-lg">
                                {faq.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>

            {/* 4. Chat CTA Section */}
            <section className="max-w-4xl mx-auto px-6 text-center space-y-12">
                <div className="space-y-6">
                    <div className="w-20 h-20 bg-[#F9F7F2] rounded-full flex items-center justify-center mx-auto">
                        <MessageCircle className="w-10 h-10 text-[#D4AF37]" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-4xl font-black text-[#0B0D10] tracking-tighter italic">Still have questions?</h3>
                        <p className="text-lg text-[#0B0D10]/40 font-bold">원장 김미정 혹은 AI 어시스턴트와 1:1로 직접 대화하세요.</p>
                    </div>
                </div>
                
                <Button className="h-24 px-16 bg-[#0B0D10] text-white rounded-full font-black text-xl uppercase tracking-widest shadow-[0_30px_60px_rgba(0,0,0,0.15)] hover:scale-105 transition-all gap-4">
                    <span className="text-[#D4AF37] opacity-60 text-xs mt-1">1:1 Consultation</span>
                    프라이빗 라운지 입장하기
                </Button>
            </section>
        </div>
    );
}
