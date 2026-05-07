'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Calendar, ChevronRight, Share2, Sparkles, Trophy } from 'lucide-react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function CertificateArchivePage() {
    const { data: session } = useSession();
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCertificates() {
            try {
                const res = await fetch('/api/user/status');
                if (res.ok) {
                    const data = await res.json();
                    setCertificates(data.certificateStatus?.issuedCertificates || []);
                }
            } catch (err) {
                console.error('Failed to fetch certificates:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchCertificates();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-mist flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <ChapterWrapper chapter="archive" className="container mx-auto px-4 py-20 pb-40 min-h-screen max-w-5xl">
            <header className="mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1 bg-chapter-accent/10 text-chapter-accent rounded-full text-[10px] font-black tracking-widest uppercase border border-chapter-accent/20">
                    <Trophy className="w-3 h-3" />
                    My Achievement Collection
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-obsidian tracking-tighter">완주 증명서 보관함</h1>
                <p className="text-lg text-slate/60 font-bold max-w-xl break-keep">
                    차곡차곡 쌓아온 당신의 성실함이<br />
                    변하지 않는 데이터 자산으로 기록되었습니다.
                </p>
            </header>

            {certificates.length === 0 ? (
                <div className="bg-white/50 border border-line/50 rounded-[40px] p-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-mist rounded-[32px] flex items-center justify-center mx-auto text-slate/20">
                        <Award className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-obsidian">아직 수집된 증명서가 없습니다</h3>
                        <p className="text-slate/40 font-bold">7일간의 리듬체크를 완주하고 첫 번째 증명서를 받아보세요!</p>
                    </div>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest hover:gap-3 transition-all pt-4">
                        대시보드로 돌아가기 <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {certificates.map((cert, i) => (
                        <motion.div
                            key={cert.cycleNumber}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href={`/certificate?cycle=${cert.cycleNumber}`}>
                                <Card className="group relative overflow-hidden rounded-[40px] border-line/50 hover:border-chapter-accent hover:shadow-2xl transition-all h-full bg-white">
                                    <CardContent className="p-8 space-y-6">
                                        {/* Certificate Preview Mask */}
                                        <div className="aspect-[3/4] bg-obsidian rounded-[24px] relative overflow-hidden flex flex-col items-center justify-center p-6 text-center border border-white/10">
                                            <div className="absolute inset-0 bg-gradient-to-br from-reward-gold/20 via-transparent to-chapter-accent/20 opacity-50" />
                                            <div className="relative z-10 space-y-4">
                                                <div className="w-12 h-12 bg-reward-gold/20 rounded-full flex items-center justify-center mx-auto border border-reward-gold/30">
                                                    <Sparkles className="w-6 h-6 text-reward-gold" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-reward-gold uppercase tracking-[0.3em]">Recovery Complete</p>
                                                    <h4 className="text-white font-black text-xl italic font-serif">Certificate</h4>
                                                    <p className="text-white/40 text-[10px] font-bold">#{cert.cycleNumber} Cycle</p>
                                                </div>
                                            </div>
                                            
                                            {/* Stamp Effect */}
                                            <div className="absolute bottom-6 right-6 w-12 h-12 border-2 border-chapter-accent/30 rounded-full flex items-center justify-center transform -rotate-12 opacity-50">
                                                <Award className="w-6 h-6 text-chapter-accent" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className="text-[10px] font-black border-chapter-accent/20 text-chapter-accent">
                                                    {cert.cycleNumber}회차 완주
                                                </Badge>
                                                <div className="flex items-center gap-1 text-slate/30 text-[10px] font-bold">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(cert.issuedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-black text-obsidian tracking-tight group-hover:text-chapter-accent transition-colors">
                                                7일간의 여정 증명서
                                            </h3>
                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-[10px] font-black text-slate/30 uppercase tracking-widest group-hover:text-primary transition-colors">View Certificate</span>
                                                <Share2 className="w-4 h-4 text-slate/20 group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </ChapterWrapper>
    );
}
