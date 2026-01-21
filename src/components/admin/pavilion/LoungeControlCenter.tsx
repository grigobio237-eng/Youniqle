'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    Users,
    Settings,
    Clock,
    CheckCircle2,
    XCircle,
    MessageSquare,
    Crown,
    ShieldCheck,
    ArrowRight,
    Loader2,
    Save,
    Search,
    User,
    Mail,
    Phone,
    HelpCircle,
    Check
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface LoungeControlCenterProps {
    floorData: any;
    onSave: (data: any) => void;
}

export default function LoungeControlCenter({ floorData, onSave }: LoungeControlCenterProps) {
    const [config, setConfig] = useState({
        totalSlots: 50,
        occupiedSlots: 47,
        welcomeMessage: '이곳은 검증된 소수만을 위한 비밀 회복 연구소입니다.',
        introTitle: 'Secret Recovery Lab',
        directorName: '김미정 원장',
        directorRole: 'Representative Director',
        directorBio: '"시술은 기적이 아닙니다. 회복된 몸 위에 놓일 때 비로소 완성되는 도구일 뿐입니다."'
    });
    const [requests, setRequests] = useState<any[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoadingRequests(true);
            const res = await fetch('/api/admin/concierge/requests');
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoadingRequests(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // In a real app, this would save to the 5F PavilionFloor owner or a dedicated config
            await onSave({
                ...floorData,
                owners: [{
                    ...floorData.owners[0],
                    name: config.directorName,
                    role: config.directorRole,
                    bio: config.directorBio,
                    specs: {
                        ...floorData.owners[0].specs,
                        totalSlots: config.totalSlots,
                        occupiedSlots: config.occupiedSlots,
                        welcomeMessage: config.welcomeMessage,
                        introTitle: config.introTitle
                    }
                }]
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* 1. Header Hero section */}
            <div className="relative overflow-hidden rounded-[40px] luxury-gradient luxury-border luxury-shadow p-12">
                <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-luxury-gold/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Crown className="w-6 h-6 text-luxury-gold" />
                            <span className="text-[10px] font-black luxury-gold-text uppercase tracking-[0.4em]">라운지 마스터 모드</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-luxury-navy tracking-tighter italic">
                            Lounge <span className="luxury-gold-text tracking-normal">Control Center</span>
                        </h2>
                        <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
                            매월 한정된 소수에게만 허락되는 유니클의 정점, 김미정 원장의 라운지를 관리합니다.
                            슬롯 수량과 웰컴 메시지를 통해 고객의 첫인상을 설계하세요.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-luxury-gold/20 shadow-xl min-w-[200px]">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">월간 수용량 (Monthly Capacity)</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-luxury-navy">{config.occupiedSlots}</span>
                                <span className="text-sm font-bold text-luxury-gold">/ {config.totalSlots}</span>
                            </div>
                            <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-luxury-gold h-full transition-all duration-1000 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                                    style={{ width: `${(config.occupiedSlots / config.totalSlots) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. Slot & Logic Settings */}
                <Card className="lg:col-span-1 border-none shadow-2xl rounded-[40px] overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center gap-3 mb-2">
                            <Settings className="w-5 h-5 text-luxury-gold" />
                            <CardTitle className="text-lg font-black tracking-tight text-luxury-navy">슬롯 관리 (Slot Master)</CardTitle>
                        </div>
                        <CardDescription className="text-xs">컨시어지 서비스 수용 인원을 제어합니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">이번 달 총 슬롯</label>
                            <Input
                                type="number"
                                className="h-12 font-bold border-slate-100 bg-slate-50 focus:bg-white focus:border-luxury-gold transition-all"
                                value={config.totalSlots}
                                onChange={(e) => setConfig({ ...config, totalSlots: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">현재 사용 중인 슬롯</label>
                            <Input
                                type="number"
                                className="h-12 font-bold border-slate-100 bg-slate-50 focus:bg-white transition-all"
                                value={config.occupiedSlots}
                                onChange={(e) => setConfig({ ...config, occupiedSlots: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-luxury-gold/5 rounded-2xl border border-luxury-gold/10">
                                <span className="text-xs font-bold text-luxury-navy">대기열 모드</span>
                                <Badge className="bg-luxury-navy text-white text-[10px] font-black">자동 활성화됨</Badge>
                            </div>
                            <p className="text-[10px] text-slate-400 italic">슬롯이 가득 차면 자동으로 대기열로 전환됩니다.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Branding & Welcome Content */}
                <Card className="lg:col-span-2 border-none shadow-2xl rounded-[40px] overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-5 h-5 text-luxury-gold" />
                            <CardTitle className="text-lg font-black tracking-tight text-luxury-navy">라운지 콘텐츠 설정</CardTitle>
                        </div>
                        <CardDescription className="text-xs">5층 라운지 입장 시 표시되는 메시지와 브랜딩을 관리합니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">라운지 타이틀</label>
                                <Input
                                    className="h-12 font-bold border-slate-100"
                                    value={config.introTitle}
                                    onChange={(e) => setConfig({ ...config, introTitle: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">원장 성함</label>
                                <Input
                                    className="h-12 font-bold border-slate-100"
                                    value={config.directorName}
                                    onChange={(e) => setConfig({ ...config, directorName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">라운지 웰컴 메시지 (Intro Pitch)</label>
                            <Textarea
                                className="min-h-[100px] font-medium border-slate-100 p-4"
                                value={config.welcomeMessage}
                                onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-luxury-navy hover:bg-black text-white px-10 h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-luxury-navy/20 transition-all hover:scale-105"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                5층 라인구 설정 저장하기
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 4. Concierge Requests list */}
            <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden">
                <CardHeader className="p-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5 text-luxury-gold" />
                                <CardTitle className="text-xl font-black tracking-tight text-luxury-navy">최근 컨시어지 신청 현황</CardTitle>
                            </div>
                            <p className="text-xs text-slate-500 ml-8">AI 설문을 통해 접수된 고객의 회복 의뢰서 목록입니다.</p>
                        </div>
                        <Button variant="ghost" className="text-slate-400 hover:text-luxury-gold font-black text-[10px] uppercase tracking-widest">
                            전체 보기 <ArrowRight className="ml-2 w-3 h-3" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="border-t border-slate-50">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-50">
                                    <TableHead className="w-[200px] text-[10px] font-black uppercase text-slate-400 pl-8">신청자</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase text-slate-400">핵심 고민</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase text-slate-400">상태</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase text-slate-400">신청 일시</TableHead>
                                    <TableHead className="text-right text-[10px] font-black uppercase text-slate-400 pr-8">관리</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.length > 0 ? requests.map((req) => (
                                    <TableRow key={req._id} className="hover:bg-luxury-gold/5 group transition-all border-slate-50">
                                        <TableCell className="pl-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-mist flex items-center justify-center border border-slate-100">
                                                    <Users className="w-4 h-4 text-slate-300" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-luxury-navy">{req.userName}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">{req.userEmail}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase border-slate-200 text-slate-500 bg-white">
                                                {req.painPoint}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {req.status === 'pending' ? (
                                                <div className="flex items-center gap-2 text-amber-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase">대기 중</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-emerald-600">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase">승인됨</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-slate-100 hover:border-luxury-gold hover:text-luxury-gold transition-all"
                                                onClick={() => {
                                                    console.log('Detail Review Clicked for:', req._id);
                                                    setSelectedRequest(req);
                                                }}
                                            >
                                                상세 검토
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-20 text-center">
                                            {loadingRequests ? (
                                                <div className="flex flex-col items-center gap-4">
                                                    <Loader2 className="w-8 h-8 animate-spin text-luxury-gold" />
                                                    <p className="text-[10px] font-black uppercase text-slate-300">신청 내역 동기화 중...</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2 opacity-20">
                                                    <ShieldCheck className="w-12 h-12 mx-auto text-slate-300" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">검토 대기 중인 신청 건이 없습니다</p>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Request Detail Modal */}
            <Dialog
                open={!!selectedRequest}
                onOpenChange={(open) => {
                    if (!open) setSelectedRequest(null);
                }}
            >
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-[40px] border-none shadow-2xl p-0 z-[10000]">
                    {selectedRequest && (
                        <div className="flex flex-col h-full">
                            <DialogHeader className="sr-only">
                                <DialogTitle>{selectedRequest.userName}님의 회복 의뢰서 상세</DialogTitle>
                                <DialogDescription>
                                    고객의 통증 영역, 목표, 가용 예산 및 AI 분석 결과를 상세히 검토합니다.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="bg-luxury-navy p-10 text-white relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <Crown className="w-6 h-6 text-luxury-gold" />
                                    <span className="text-[10px] font-black luxury-gold-text uppercase tracking-[0.4em]">Personal Recovery Request</span>
                                </div>
                                <h2 className="text-3xl font-black italic tracking-tighter mb-2">
                                    {selectedRequest.userName || 'Unknown User'}
                                </h2>
                                <div className="flex flex-wrap gap-4 text-xs font-bold opacity-60">
                                    <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {selectedRequest.userEmail}</span>
                                    <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {new Date(selectedRequest.createdAt).toLocaleString()}</span>
                                </div>
                                <Badge className="absolute top-10 right-10 bg-luxury-gold text-luxury-navy border-none font-black px-4 py-2 rounded-full text-[10px] tracking-widest uppercase">
                                    {selectedRequest.status}
                                </Badge>
                            </div>

                            <div className="p-10 space-y-12">
                                {/* Section 1: User's Input */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-luxury-gold rounded-full" />
                                        <h3 className="text-lg font-black text-luxury-navy uppercase tracking-tight">의뢰서 상세 질문 답변</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">핵심 통증 영역</p>
                                                <p className="text-sm font-bold text-luxury-navy bg-slate-50 p-3 rounded-xl">{selectedRequest.painPoint}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">목표 컨디션</p>
                                                <p className="text-sm font-bold text-luxury-navy bg-slate-50 p-3 rounded-xl">{selectedRequest.goal}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">가용 예산</p>
                                                <p className="text-sm font-bold text-luxury-navy bg-slate-50 p-3 rounded-xl">{selectedRequest.budget}만원 대</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">현재 생활 습관 및 특이 사항</p>
                                            <div className="bg-slate-50 p-4 rounded-xl min-h-[120px]">
                                                {selectedRequest.symptoms?.map((s: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2 last:mb-0">
                                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                                        {s}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 2: AI Analysis Result */}
                                <section className="space-y-6 bg-mist/30 p-8 rounded-[32px] border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="w-5 h-5 text-luxury-gold" />
                                        <h3 className="text-lg font-black text-luxury-navy uppercase tracking-tight">AI 회복 전략 및 솔루션</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">종합 분석 및 프로토콜 추천</p>
                                            <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                {selectedRequest.aiAnalysis}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {selectedRequest.suggestedPlans && Object.entries(selectedRequest.suggestedPlans.plans || {}).map(([key, plan]: [string, any]) => (
                                                <div key={key} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <Badge variant="outline" className="border-luxury-gold/30 text-luxury-gold text-[9px] font-black px-2">{key.toUpperCase()}</Badge>
                                                        {selectedRequest.selectedPlanId === plan.planId && <Check className="w-4 h-4 text-emerald-500" />}
                                                    </div>
                                                    <h4 className="text-sm font-black text-luxury-navy leading-tight">{plan.title}</h4>
                                                    <p className="text-[11px] font-bold text-luxury-gold">{plan.priceEstimate}</p>
                                                    <div className="h-[1px] bg-slate-50 w-full" />
                                                    <ul className="space-y-1.5">
                                                        {plan.routine?.slice(0, 3).map((r: string, idx: number) => (
                                                            <li key={idx} className="text-[10px] font-medium text-slate-400 truncate flex items-center gap-1.5">
                                                                <div className="w-1 h-1 bg-slate-200 rounded-full" /> {r}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* Actions */}
                                <div className="flex gap-4 pt-6 border-t border-slate-100">
                                    <Button className="flex-1 h-14 bg-luxury-navy text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all">
                                        승인 처리 및 마스터 알림
                                    </Button>
                                    <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-black text-xs text-slate-400" onClick={() => setSelectedRequest(null)}>
                                        상세 닫기
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
