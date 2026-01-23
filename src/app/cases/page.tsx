'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Plus, Quote, ArrowRight, Trash2, EyeOff } from 'lucide-react';
import ChapterWrapper from '@/components/layout/ChapterWrapper';

// Mock Data for Cases - Enhanced Story Structure
const CASES = [
    {
        id: 1,
        title: '30대 직장인, 만성피로 탈출기',
        category: '만성피로',
        budget: '50~100만원',
        period: '3개월',
        oneLiner: '아침에 눈을 뜨는 게 고통이었지만, 이제는 알람 없이 일어납니다.',
        // 프로필 정보
        profile: {
            age: '30대 중반',
            gender: '남성',
            job: 'IT 회사 개발자',
            location: '서울'
        },
        // 스토리라인
        story: {
            before: '매일 아침 알람을 5번 이상 끄고, 커피 없이는 하루를 시작할 수 없었습니다. 주말엔 거의 하루 종일 누워있었고, 친구들 약속도 점점 줄어들었어요.',
            during: '첫 2주는 변화를 못 느꼈지만, 4주차부터 아침 기상이 조금씩 편해졌습니다. 수면 루틴을 지키는 게 처음엔 힘들었지만 익숙해지니 자연스러워졌어요.',
            after: '이제 알람 없이도 6시반에 눈이 떠져요. 주말에도 활동적으로 보내고, 오히려 친구들이 "요즘 왜 이렇게 에너지가 넘쳐?"라고 물어봅니다.'
        },
        // 상세 타임라인
        timeline: [
            { week: 1, score: 20, note: '진단 완료, 수면 패턴 분석 시작', emoji: '💀' },
            { week: 2, score: 25, note: '수면 루틴 설정, 카페인 줄이기 시작', emoji: '😵' },
            { week: 4, score: 45, note: '아침 기상 편해짐, 에너지 살짝 상승', emoji: '😐' },
            { week: 8, score: 70, note: '주변에서 얼굴 좋아졌다는 말 들음', emoji: '🙂' },
            { week: 12, score: 85, note: '알람 없이 기상, 운동 습관 형성', emoji: '😊' },
        ],
        graphData: [
            { name: '1주', score: 20 },
            { name: '4주', score: 45 },
            { name: '8주', score: 70 },
            { name: '12주', score: 85 },
        ],
        tags: ['#수면장애', '#번아웃', '#영양불균형'],
        // 검색 키워드 (제품 검색용)
        searchKeyword: '피로',
        // 사용한 제품 목록 (키워드 기반)
        usedProducts: [
            { name: '만성피로 삭제 팩', keyword: '피로', mainProduct: true },
            { name: '숙면 케어 세트', keyword: '수면' },
            { name: '에너지 부스터', keyword: '에너지' },
        ],
        product: { name: '만성피로 삭제 팩', keyword: '피로' },
        // AI 인사이트
        aiInsight: '수면 패턴 개선이 회복의 가장 결정적인 요인이었습니다. 특히 취침 2시간 전 스마트폰 사용 중단이 수면의 질을 48% 향상시켰습니다.'
    },
    {
        id: 2,
        title: '40대, 원인 모를 붓기와 통증',
        category: '통증/붓기',
        budget: '100만원 이상',
        period: '6개월',
        oneLiner: '다리가 코끼리 같았는데, 이제는 좋아하는 구두를 다시 신습니다.',
        profile: {
            age: '40대 초반',
            gender: '여성',
            job: '사무직',
            location: '경기'
        },
        story: {
            before: '하루 종일 앉아서 일하다 보니 저녁만 되면 다리가 퉁퉁 부었어요. 예쁜 구두는 꿈도 못 꾸고, 항상 편한 신발만 신어야 했습니다.',
            during: '처음엔 스트레칭이 귀찮았는데, 2주 정도 지나니 습관이 됐어요. 붓기 관리 차도 맛있어서 꾸준히 마실 수 있었습니다.',
            after: '이제 저녁에도 다리가 가벼워요! 지난주에 3년 만에 힐을 신고 약속에 나갔는데 정말 행복했습니다.'
        },
        timeline: [
            { week: 1, score: 30, note: '순환 상태 진단, 스트레칭 루틴 시작', emoji: '😣' },
            { week: 4, score: 40, note: '붓기 케어 티 시작, 조금씩 변화', emoji: '😐' },
            { week: 8, score: 50, note: '저녁 붓기 감소 체감', emoji: '🙂' },
            { week: 16, score: 75, note: '다리 라인 확연히 달라짐', emoji: '😊' },
            { week: 24, score: 90, note: '힐 착용 가능, 완벽한 회복', emoji: '🎉' },
        ],
        graphData: [
            { name: '1주', score: 30 },
            { name: '8주', score: 50 },
            { name: '16주', score: 75 },
            { name: '24주', score: 90 },
        ],
        tags: ['#하체비만', '#염증관리', '#순환장애'],
        searchKeyword: '붓기',
        usedProducts: [
            { name: '붓기 삭제 펌킨 티', keyword: '붓기', mainProduct: true },
            { name: '순환 부스터 패치', keyword: '순환' },
        ],
        product: { name: '붓기 삭제 펌킨 티', keyword: '붓기' },
        aiInsight: '염증 수치 감소와 순환 개선이 핵심이었습니다. 하루 30분 걷기와 스트레칭 병행이 붓기 감소에 65% 기여했습니다.'
    },
    {
        id: 3,
        title: '20대, 감정 기복과 집중력 저하',
        category: 'MENTAL',
        budget: '30만원 이하',
        period: '2개월',
        oneLiner: '작은 일에도 예민했는데, 마음의 중심이 잡힌 기분이에요.',
        profile: {
            age: '20대 후반',
            gender: '여성',
            job: '대학원생',
            location: '서울'
        },
        story: {
            before: '논문 스트레스로 잠도 못 자고, 사소한 일에 짜증이 폭발했어요. 남자친구한테도 자주 화를 내서 관계도 힘들어졌습니다.',
            during: '호흡 명상이 처음엔 어색했는데, 1주일 정도 하니까 확실히 마음이 차분해지는 게 느껴졌어요.',
            after: '이제 스트레스 받는 상황에서도 한 템포 쉬어갈 수 있어요. 남자친구가 "요즘 확실히 달라졌다"고 하더라고요.'
        },
        timeline: [
            { week: 1, score: 40, note: '스트레스 레벨 측정, 명상 시작', emoji: '😤' },
            { week: 2, score: 50, note: '호흡법 익숙해짐', emoji: '😐' },
            { week: 4, score: 60, note: '감정 조절 개선 체감', emoji: '🙂' },
            { week: 6, score: 70, note: '수면 질 향상', emoji: '😊' },
            { week: 8, score: 80, note: '관계 개선, 집중력 회복', emoji: '🌟' },
        ],
        graphData: [

            { name: '1주', score: 40 },
            { name: '3주', score: 55 },
            { name: '6주', score: 70 },
            { name: '8주', score: 80 },
        ],
        tags: ['#불면증', '#스트레스', '#루틴교정'],
        searchKeyword: '스트레스',
        usedProducts: [
            { name: '스트레스 번아웃 케어 키트', keyword: '스트레스', mainProduct: true },
            { name: '멘탈 밸런스 허브티', keyword: '멘탈' },
        ],
        product: { name: '스트레스 번아웃 케어 키트', keyword: '스트레스' },
        aiInsight: '규칙적인 수면 패턴과 아침 명상 루틴이 감정 안정에 75%의 영향을 미쳤습니다. 특히 카페인 섭취량 조절이 중요했습니다.'
    },
];


export default function CasesPage() {
    const { data: session } = useSession();
    const [filter, setFilter] = React.useState('ALL');
    const [activeTab, setActiveTab] = React.useState('OFFICIAL');

    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [aiCases, setAiCases] = React.useState<any[]>([]);
    const [userSymptom, setUserSymptom] = React.useState('');
    const [userAge, setUserAge] = React.useState('');

    // 웹툰 스토리 상태
    const [webtoons, setWebtoons] = React.useState<any[]>([]);
    const [isLoadingWebtoons, setIsLoadingWebtoons] = React.useState(false);
    const [selectedWebtoon, setSelectedWebtoon] = React.useState<any>(null);
    const [isManaging, setIsManaging] = React.useState(false);

    // 내 웹툰 상태
    const [myWebtoons, setMyWebtoons] = React.useState<any[]>([]);
    const [isLoadingMyWebtoons, setIsLoadingMyWebtoons] = React.useState(false);

    // 본인 웹툰인지 확인 (email 또는 myWebtoons에 포함 여부로 판단)
    const isOwner = selectedWebtoon && session?.user && (
        selectedWebtoon.userId?.email === session.user.email ||
        myWebtoons.some(w => w._id === selectedWebtoon._id)
    );

    // 웹툰 삭제
    const handleDeleteWebtoon = async () => {
        if (!selectedWebtoon || !confirm('정말 이 웹툰을 삭제하시겠습니까? Firebase에 저장된 이미지도 함께 삭제됩니다.')) return;
        setIsManaging(true);
        try {
            const res = await fetch(`/api/webtoon?id=${selectedWebtoon._id}`, { method: 'DELETE' });
            if (res.ok) {
                setWebtoons(prev => prev.filter(w => w._id !== selectedWebtoon._id));
                setMyWebtoons(prev => prev.filter(w => w._id !== selectedWebtoon._id));
                setSelectedWebtoon(null);
                alert('웹툰과 관련 이미지가 모두 삭제되었습니다.');
            } else {
                const err = await res.json();
                alert(err.error || '삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('삭제 중 오류가 발생했습니다.');
        } finally {
            setIsManaging(false);
        }
    };

    // 웹툰 비공개 전환
    const handleUnpublishWebtoon = async () => {
        if (!selectedWebtoon || !confirm('이 웹툰을 게시판에서 내리시겠습니까? (비공개로 전환)')) return;
        setIsManaging(true);
        try {
            const res = await fetch('/api/webtoon', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedWebtoon._id, isPublic: false })
            });
            if (res.ok) {
                setWebtoons(prev => prev.filter(w => w._id !== selectedWebtoon._id));
                setSelectedWebtoon(null);
                alert('웹툰이 비공개로 전환되었습니다.');
            } else {
                alert('비공개 전환에 실패했습니다.');
            }
        } catch (error) {
            console.error('Unpublish error:', error);
            alert('비공개 전환 중 오류가 발생했습니다.');
        } finally {
            setIsManaging(false);
        }
    };

    React.useEffect(() => {
        const savedCases = localStorage.getItem('youniqle_ai_cases');
        if (savedCases) {
            try {
                setAiCases(JSON.parse(savedCases));
            } catch (e) {
                console.error('Failed to parse saved AI cases:', e);
            }
        }
    }, []);

    // 웹툰 불러오기 (공개된 것만)
    React.useEffect(() => {
        const loadWebtoons = async () => {
            setIsLoadingWebtoons(true);
            try {
                const res = await fetch('/api/webtoon?public=true');
                if (res.ok) {
                    const data = await res.json();
                    setWebtoons(data.webtoons || []);
                }
            } catch (error) {
                console.error('Failed to load webtoons:', error);
            } finally {
                setIsLoadingWebtoons(false);
            }
        };
        loadWebtoons();
    }, []);


    // 내 웹툰 불러오기 (로그인 시에만)
    React.useEffect(() => {
        if (!session?.user) return;
        const loadMyWebtoons = async () => {
            setIsLoadingMyWebtoons(true);
            try {
                const res = await fetch('/api/webtoon?mine=true');
                if (res.ok) {
                    const data = await res.json();
                    setMyWebtoons(data.webtoons || []);
                }
            } catch (error) {
                console.error('Failed to load my webtoons:', error);
            } finally {
                setIsLoadingMyWebtoons(false);
            }
        };
        loadMyWebtoons();
    }, [session?.user]);

    const filteredCases = filter === 'ALL'
        ? CASES
        : CASES.filter(c => c.category === filter || c.budget.includes(filter));

    const handleGenerateCase = async () => {
        if (!userSymptom) return;
        setIsGenerating(true);
        try {
            const response = await fetch('/api/ai/generate-case', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptom: userSymptom, age: userAge })
            });

            if (response.ok) {
                const newCase = await response.json();
                const enhancedCase = { ...newCase, id: Date.now(), isAiGenerated: true, budget: '맞춤형' };
                const updated = [enhancedCase, ...aiCases];
                setAiCases(updated);
                localStorage.setItem('youniqle_ai_cases', JSON.stringify(updated));
                setActiveTab('AI_SIMULATION');
                setIsDialogOpen(false);
                setUserSymptom('');
                setUserAge('');
            }
        } catch (e) {
            console.error(e);
            alert('케이스 생성 중 오류가 발생했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <ChapterWrapper chapter="cases" className="container mx-auto px-4 py-20 min-h-screen">
            <div className="max-w-4xl mx-auto text-center mb-24 space-y-6">
                <div className="inline-flex items-center px-4 py-1.5 bg-chapter-accent/5 text-chapter-accent rounded-full text-[10px] font-black tracking-widest uppercase border border-chapter-accent/20">
                    Real Recovery Insights
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter">회복이 데이터가 되는 순간</h1>
                <p className="text-xl text-text-secondary leading-relaxed font-medium">
                    Youniqle에는 과장된 전후 사진이 존재하지 않습니다.<br />
                    오직 <b className="text-text-primary">진실된 변화의 기록</b>과 <b className="text-text-primary">검증된 수치</b>만이 당신의 회복을 증명합니다.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12 md:mb-20">
                <TabsList className="flex justify-center bg-transparent gap-2 md:gap-4 mb-8 md:mb-16 flex-wrap h-auto">
                    <TabsTrigger value="OFFICIAL" className="px-4 md:px-8 py-2 md:py-3 rounded-full border border-line text-text-secondary data-[state=active]:bg-chapter-accent data-[state=active]:text-background data-[state=active]:border-chapter-accent font-black transition-all text-xs md:text-sm">공식 인증 사례</TabsTrigger>
                    <TabsTrigger value="AI_SIMULATION" className="px-4 md:px-8 py-2 md:py-3 rounded-full border border-line text-text-secondary data-[state=active]:bg-chapter-accent data-[state=active]:text-background data-[state=active]:border-chapter-accent font-black transition-all text-xs md:text-sm">AI 가상 사례 (Beta)</TabsTrigger>
                    <TabsTrigger value="WEBTOON" className="px-4 md:px-8 py-2 md:py-3 rounded-full border border-line text-text-secondary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary font-black transition-all text-xs md:text-sm">📖 웹툰 스토리</TabsTrigger>
                    {session?.user && (
                        <TabsTrigger value="MY_WEBTOON" className="px-4 md:px-8 py-2 md:py-3 rounded-full border border-line text-text-secondary data-[state=active]:bg-obsidian data-[state=active]:text-white data-[state=active]:border-obsidian font-black transition-all text-xs md:text-sm">📁 내 웹툰</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="OFFICIAL" className="space-y-8 md:space-y-12">
                    <div className="flex justify-center flex-wrap gap-2 md:gap-3 px-2">
                        {['ALL', '만성피로', '통증/붓기', 'MENTAL'].map((f) => (
                            <Button
                                key={f}
                                variant="outline"
                                onClick={() => setFilter(f)}
                                className={`rounded-full px-4 md:px-6 h-10 md:h-12 text-xs md:text-sm font-bold transition-all ${filter === f ? 'bg-text-primary text-background border-text-primary' : 'bg-transparent text-text-secondary border-line'}`}
                            >
                                {f === 'ALL' ? '전체' : `#${f}`}
                            </Button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredCases.map((item) => (
                                <CaseCard key={item.id} item={item} />
                            ))}
                        </AnimatePresence>
                    </div>
                </TabsContent>

                <TabsContent value="AI_SIMULATION">
                    {aiCases.length === 0 ? (
                        <div className="text-center py-24 bg-surface/50 rounded-[40px] border-2 border-dashed border-line">
                            <Sparkles className="w-16 h-16 text-chapter-accent mx-auto mb-6 opacity-40" />
                            <h3 className="text-2xl font-black mb-4">시뮬레이션 데이터가 없습니다.</h3>
                            <p className="text-text-secondary mb-10 text-lg font-medium opacity-70">"내 조건에서 어떤 변화가 가능할까?"<br />AI에게 당신의 증상을 물려주세요.</p>
                            <Button onClick={() => setIsDialogOpen(true)} className="bg-chapter-accent hover:bg-chapter-accent/90 text-background font-black rounded-2xl h-14 px-10 shadow-xl">
                                <Plus className="w-5 h-5 mr-3" /> 첫 번째 사례 생성
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <AnimatePresence>
                                {aiCases.map((item) => (
                                    <CaseCard key={item.id} item={item} isAi={true} />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </TabsContent>

                {/* 웹툰 스토리 탭 */}
                <TabsContent value="WEBTOON">
                    {isLoadingWebtoons ? (
                        <div className="text-center py-24">
                            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-text-secondary font-medium">웹툰을 불러오는 중...</p>
                        </div>
                    ) : webtoons.length === 0 ? (
                        <div className="text-center py-24 bg-surface/50 rounded-[40px] border-2 border-dashed border-line">
                            <div className="text-6xl mb-6">📖</div>
                            <h3 className="text-2xl font-black mb-4">아직 게시된 웹툰이 없습니다.</h3>
                            <p className="text-text-secondary mb-10 text-lg font-medium opacity-70">
                                "일일 웹툰 챌린지"에서 웹툰을 만들고<br />전체 공개로 게시해보세요!
                            </p>
                            <Button asChild className="bg-primary hover:bg-primary/90 text-white font-black rounded-2xl h-14 px-10 shadow-xl">
                                <Link href="/">웹툰 만들러 가기</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <AnimatePresence>
                                {webtoons.map((webtoon) => (
                                    <WebtoonCard key={webtoon._id} webtoon={webtoon} onClick={() => setSelectedWebtoon(webtoon)} />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </TabsContent>

                {/* 내 웹툰 탭 */}
                {session?.user && (
                    <TabsContent value="MY_WEBTOON">
                        {isLoadingMyWebtoons ? (
                            <div className="text-center py-24">
                                <Loader2 className="w-12 h-12 animate-spin text-obsidian mx-auto mb-4" />
                                <p className="text-text-secondary font-medium">내 웹툰을 불러오는 중...</p>
                            </div>
                        ) : myWebtoons.length === 0 ? (
                            <div className="text-center py-24 bg-surface/50 rounded-[40px] border-2 border-dashed border-line">
                                <div className="text-6xl mb-6">📁</div>
                                <h3 className="text-2xl font-black mb-4">아직 만든 웹툰이 없습니다.</h3>
                                <p className="text-text-secondary mb-10 text-lg font-medium opacity-70">
                                    "일일 웹툰 챌린지"에서 첫 웹툰을 만들어보세요!
                                </p>
                                <Button asChild className="bg-obsidian hover:bg-obsidian/90 text-white font-black rounded-2xl h-14 px-10 shadow-xl">
                                    <Link href="/">웹툰 만들러 가기</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-sm text-text-secondary">
                                    <span className="font-bold">총 {myWebtoons.length}개</span>
                                    <span className="text-primary font-bold">
                                        🔓 공개 {myWebtoons.filter(w => w.isPublic).length}개
                                    </span>
                                    <span className="text-amber-600 font-bold">
                                        🔒 비공개 {myWebtoons.filter(w => !w.isPublic).length}개
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <AnimatePresence>
                                        {myWebtoons.map((webtoon) => (
                                            <div key={webtoon._id} className="relative">
                                                {/* 공개/비공개 배지 */}
                                                <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-[10px] font-black ${webtoon.isPublic ? 'bg-primary text-white' : 'bg-amber-500 text-white'}`}>
                                                    {webtoon.isPublic ? '🔓 공개' : '🔒 비공개'}
                                                </div>
                                                <WebtoonCard webtoon={webtoon} onClick={() => setSelectedWebtoon(webtoon)} />
                                            </div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                )}
            </Tabs>

            <div className="mt-20 py-16 px-8 rounded-[48px] bg-surface border border-line flex flex-col items-center text-center space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-chapter-accent/30"></div>
                <h3 className="text-3xl font-black tracking-tighter">당신도 '회복 데이터'의 주인공이 될 수 있습니다.</h3>
                <p className="text-text-secondary text-lg font-medium max-w-xl opacity-80 leading-relaxed">
                    수천 명의 데이터가 증명하는 최적의 회복 경로를 안내해드립니다. <br />
                    지금 바로 AI 전문가와 무료 진단을 시작해보세요.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Button size="lg" className="bg-chapter-accent hover:bg-chapter-accent/90 text-background font-black rounded-2xl h-16 px-10" asChild>
                        <Link href="/diagnosis">내 회복 점수 진단하기</Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="border-line font-black rounded-2xl h-16 px-10 hover:bg-white/5"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <Sparkles className="w-5 h-5 mr-3 text-chapter-accent" />
                        AI 시뮬레이션 돌려보기
                    </Button>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-surface border-line sm:max-w-lg rounded-[32px] overflow-hidden p-8 shadow-2xl">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="flex items-center gap-3 text-2xl font-black">
                            <Sparkles className="w-6 h-6 text-chapter-accent" />
                            AI 시뮬레이터
                        </DialogTitle>
                        <DialogDescription className="text-text-secondary font-medium leading-relaxed">
                            현재 겪고 있는 증상을 상세하게 입력해주세요. <br />AI가 가장 유사한 성공적인 <b>회복 로드맵</b>을 설계해드립니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-8">
                        <div className="space-y-3">
                            <Label htmlFor="symptom" className="text-xs font-black uppercase tracking-widest text-text-secondary ml-1">상태 기술</Label>
                            <Textarea
                                id="symptom"
                                placeholder="예: 30대 후반, 극심한 야근 후 아침에 몸이 붓고 기력이 없습니다."
                                value={userSymptom}
                                onChange={(e) => setUserSymptom(e.target.value)}
                                className="bg-background border-line min-h-[140px] rounded-2xl focus:border-chapter-accent transition-all p-5"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="age" className="text-xs font-black uppercase tracking-widest text-text-secondary ml-1">연령 및 성별</Label>
                            <Input
                                id="age"
                                placeholder="예: 40대 초반 남성"
                                value={userAge}
                                onChange={(e) => setUserAge(e.target.value)}
                                className="bg-background border-line h-14 rounded-2xl focus:border-chapter-accent transition-all px-5"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-3">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-14 font-bold text-text-secondary">취소</Button>
                        <Button onClick={handleGenerateCase} disabled={!userSymptom || isGenerating} className="bg-chapter-accent hover:bg-chapter-accent/90 text-background font-black h-14 px-8 rounded-2xl shadow-lg">
                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : '로드맵 설계 시작'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 웹툰 상세 보기 모달 */}
            <Dialog open={!!selectedWebtoon} onOpenChange={(open) => !open && setSelectedWebtoon(null)}>
                <DialogContent className="bg-surface border-line sm:max-w-3xl rounded-[32px] overflow-hidden p-0 shadow-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="flex items-center gap-3 text-xl font-black">
                            📖 {selectedWebtoon?.title || (selectedWebtoon?.summary?.length < 30 ? selectedWebtoon.summary : '오늘의 회복 웹툰')}
                        </DialogTitle>
                        <DialogDescription className="text-text-secondary font-medium">
                            {new Date(selectedWebtoon?.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} · {selectedWebtoon?.genre} · {selectedWebtoon?.panels?.length || 4}컷
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        {selectedWebtoon?.panels?.map((panel: any, idx: number) => (
                            <div key={idx} className="rounded-2xl overflow-hidden border border-line shadow-lg">
                                <img
                                    src={panel.imageUrl}
                                    alt={`Panel ${panel.panelNumber}`}
                                    className="w-full h-auto"
                                />
                                <div className="bg-background p-4">
                                    <span className="text-[10px] font-black text-chapter-accent uppercase tracking-widest">Panel {panel.panelNumber}</span>
                                    <p className="text-sm font-medium text-text-primary mt-1">{panel.script}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 pt-0 border-t border-line space-y-4">
                        {/* 본인 웹툰일 경우 관리 버튼 */}
                        {isOwner && (
                            <div className="flex flex-col sm:flex-row gap-2 p-4 bg-red-50 rounded-xl border border-red-100">
                                <Button
                                    variant="outline"
                                    onClick={handleUnpublishWebtoon}
                                    disabled={isManaging}
                                    className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 h-12"
                                >
                                    {isManaging ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                                    게시판에서 내리기
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteWebtoon}
                                    disabled={isManaging}
                                    className="flex-1 h-12"
                                >
                                    {isManaging ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                    완전 삭제
                                </Button>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-lg">👤</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-text-primary">
                                    {selectedWebtoon?.userId?.name || '익명 작가'}
                                </p>
                                <p className="text-xs text-text-secondary opacity-60">
                                    {selectedWebtoon?.visualStyle} 스타일
                                </p>
                            </div>
                            <Button variant="ghost" onClick={() => setSelectedWebtoon(null)} className="font-bold">
                                닫기
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </ChapterWrapper>
    );
}

function CaseCard({ item, isAi = false }: { item: any, isAi?: boolean }) {
    const [storyTab, setStoryTab] = useState<'before' | 'during' | 'after'>('before');
    const [showTimeline, setShowTimeline] = useState(false);

    const startScore = item.graphData?.[0]?.score || 0;
    const endScore = item.graphData?.[item.graphData.length - 1]?.score || 0;
    const improvement = endScore - startScore;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
        >
            <Card className="bg-surface border-line rounded-[32px] overflow-hidden group hover:border-chapter-accent transition-all duration-500 shadow-xl flex flex-col h-full">
                {/* 헤더 - 프로필 정보 추가 */}
                <CardHeader className="p-6 pb-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <Badge className={`bg-chapter-accent/10 text-chapter-accent border-none font-black text-[10px] tracking-widest rounded-md ${isAi ? 'bg-primary/10 text-primary' : ''}`}>
                            {isAi ? 'AI ANALYSIS' : item.category.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] font-black text-text-secondary opacity-40 uppercase tracking-widest">{item.period} Journey</span>
                    </div>
                    <h3 className="text-xl font-black text-text-primary leading-tight">{item.title}</h3>

                    {/* 프로필 정보 (공식 사례만) */}
                    {!isAi && item.profile && (
                        <div className="flex items-center gap-3 pt-2">
                            <div className="w-10 h-10 rounded-full bg-chapter-accent/10 flex items-center justify-center">
                                <span className="text-lg">{item.profile.gender === '남성' ? '👨' : '👩'}</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-text-primary">{item.profile.age} {item.profile.gender}</p>
                                <p className="text-xs text-text-secondary opacity-70">{item.profile.job} · {item.profile.location}</p>
                            </div>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-5 flex-1 flex flex-col">
                    {/* 점수 변화 요약 */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-chapter-accent/5 to-transparent rounded-2xl p-4 border border-chapter-accent/10">
                        <div className="text-center">
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-1">시작</p>
                            <p className="text-2xl font-black text-text-secondary">{startScore}<span className="text-xs ml-0.5">점</span></p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-0.5 w-12 bg-chapter-accent/30 rounded-full">
                                <div className="h-full w-full bg-chapter-accent rounded-full animate-pulse" />
                            </div>
                            <span className="text-xl">→</span>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-1">현재</p>
                            <p className="text-2xl font-black text-chapter-accent">{endScore}<span className="text-xs ml-0.5">점</span></p>
                        </div>
                        <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-black">
                            +{improvement}
                        </div>
                    </div>

                    {/* 스토리 탭 (공식 사례만) */}
                    {!isAi && item.story && (
                        <div className="space-y-3">
                            <div className="flex gap-1 bg-mist/50 p-1 rounded-xl">
                                {(['before', 'during', 'after'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setStoryTab(tab)}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${storyTab === tab
                                            ? 'bg-white text-chapter-accent shadow-sm'
                                            : 'text-text-secondary hover:text-text-primary'
                                            }`}
                                    >
                                        {tab === 'before' ? '😔 시작 전' : tab === 'during' ? '🔄 과정 중' : '🎉 현재'}
                                    </button>
                                ))}
                            </div>
                            <div className="bg-background p-4 rounded-xl border border-line min-h-[80px]">
                                <p className="text-sm text-text-primary leading-relaxed">
                                    {item.story[storyTab]}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* AI 케이스용 기존 원라이너 */}
                    {isAi && (
                        <div className="relative pl-8">
                            <Quote className="absolute left-0 top-0 w-6 h-6 text-chapter-accent opacity-20 rotate-180" />
                            <p className="text-lg font-bold text-text-primary leading-relaxed italic tracking-tight">
                                {item.oneLiner || item.summary}
                            </p>
                        </div>
                    )}

                    {/* 타임라인 토글 (공식 사례만) */}
                    {!isAi && item.timeline && (
                        <div>
                            <button
                                onClick={() => setShowTimeline(!showTimeline)}
                                className="w-full flex items-center justify-between py-2 px-3 bg-mist/30 rounded-xl text-sm font-bold text-text-secondary hover:bg-mist/50 transition-colors"
                            >
                                <span>📅 회복 타임라인 ({item.timeline.length}단계)</span>
                                <span className={`transition-transform ${showTimeline ? 'rotate-180' : ''}`}>▼</span>
                            </button>

                            {showTimeline && (
                                <div className="mt-3 space-y-2 pl-2 border-l-2 border-chapter-accent/20">
                                    {item.timeline.map((step: any, idx: number) => (
                                        <div key={idx} className="relative pl-4 pb-2">
                                            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-surface border-2 border-chapter-accent flex items-center justify-center text-[10px]">
                                                {step.emoji}
                                            </div>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-xs font-black text-chapter-accent">{step.week}주차</p>
                                                    <p className="text-xs text-text-secondary">{step.note}</p>
                                                </div>
                                                <span className="text-xs font-bold text-text-primary bg-chapter-accent/10 px-2 py-0.5 rounded-full">{step.score}점</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* AI 습관 변화 */}
                    {isAi && item.habitChanges && (
                        <div className="p-4 rounded-xl bg-background border border-line space-y-2">
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Key Habit Shifts</h4>
                            <ul className="space-y-1.5">
                                {item.habitChanges.slice(0, 3).map((h: string, i: number) => (
                                    <li key={i} className="text-sm font-medium text-text-secondary flex items-start gap-2">
                                        <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                                        {h}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* 사용 제품 (공식 사례만) */}
                    {!isAi && item.usedProducts && item.usedProducts.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">사용 제품</h4>
                            <div className="flex flex-wrap gap-2">
                                {item.usedProducts.slice(0, 3).map((product: any, idx: number) => (
                                    <Link
                                        key={idx}
                                        href={`/products?search=${encodeURIComponent(product.keyword || product.name)}`}
                                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${product.mainProduct
                                            ? 'bg-chapter-accent/10 border-chapter-accent text-chapter-accent font-bold'
                                            : 'bg-mist border-line text-text-secondary hover:border-chapter-accent'
                                            }`}
                                    >
                                        {product.mainProduct && '⭐'} {product.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI 인사이트 (공식 사례만) */}
                    {!isAi && item.aiInsight && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-chapter-accent/5 border border-primary/10">
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> AI 인사이트
                            </h4>
                            <p className="text-xs text-text-secondary leading-relaxed">{item.aiInsight}</p>
                        </div>
                    )}

                    {/* 태그 & 버튼 */}
                    <div className="pt-4 border-t border-line space-y-3 mt-auto">
                        <div className="flex flex-wrap gap-2">
                            {item.tags.map((tag: string) => (
                                <span key={tag} className="text-[10px] font-bold text-text-secondary opacity-60">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <Button className="w-full bg-chapter-accent hover:bg-chapter-accent/90 text-background font-black h-12 rounded-xl group transition-all" asChild>
                            <Link href={isAi ? "/products" : `/products?search=${encodeURIComponent(item.searchKeyword || item.product?.keyword || item.product?.name || '')}`}>
                                {isAi ? '추천 제품 보기' : `${item.product?.name} 자세히 보기`}
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// 웹툰 카드 컴포넌트
function WebtoonCard({ webtoon, onClick }: { webtoon: any; onClick?: () => void }) {
    const formattedDate = new Date(webtoon.date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
        >
            <Card
                className="bg-surface border-line rounded-[32px] overflow-hidden group hover:border-primary transition-all duration-500 shadow-xl flex flex-col h-full cursor-pointer"
                onClick={onClick}
            >
                {/* 대표 이미지 */}
                <div className="relative aspect-square overflow-hidden">
                    {webtoon.imageUrl ? (
                        <img
                            src={webtoon.imageUrl}
                            alt={webtoon.script || '웹툰'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : webtoon.panels?.[0]?.imageUrl ? (
                        <img
                            src={webtoon.panels[0].imageUrl}
                            alt={webtoon.script || '웹툰'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full bg-mist/20 flex items-center justify-center">
                            <span className="text-6xl">📖</span>
                        </div>
                    )}
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-primary/90 text-white font-black text-[10px] tracking-wide">
                            {webtoon.panels?.length || 4}컷 웹툰
                        </Badge>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-white text-xs font-bold opacity-80">{formattedDate}</p>
                    </div>
                </div>

                <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                    <div className="space-y-2 flex-1">
                        <h3 className="text-lg font-black text-text-primary leading-tight line-clamp-2">
                            {webtoon.title || (webtoon.summary?.length < 30 ? webtoon.summary : '오늘의 회복 웹툰')}
                        </h3>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-line">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm">👤</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-text-primary">
                                {webtoon.userId?.name || '익명 작가'}
                            </p>
                            <p className="text-[10px] text-text-secondary opacity-60">
                                {webtoon.genre} · {webtoon.visualStyle}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
