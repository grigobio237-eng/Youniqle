'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import MinigameGrid from '@/components/utils/MinigameGrid';


export default function MinigamesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-10">
                    <Link href="/utils">
                        <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-obsidian -ml-2 mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            돌아가기
                        </Button>
                    </Link>

                    <div className="text-center max-w-2xl mx-auto">
                        <Badge variant="outline" className="mb-3 text-secondary border-secondary/30 bg-indigo-50">
                            Play Ground
                        </Badge>
                        <h1 className="font-bold text-obsidian mb-4 text-4xl">휴식용 미니게임 라운지</h1>
                        <p className="text-obsidian text-lg">
                            잠시 머리를 식히고 동료들과 함께 즐길 수 있는 작고 재미있는 게임들을 모았습니다.
                        </p>
                    </div>
                </div>

                {/* Game Grid */}
                <MinigameGrid />

                {/* Suggestion Box */}
                <div className="mt-16 text-center bg-white p-8 rounded-2xl border border-dashed border-gray-300">
                    <h3 className="text-lg font-semibold text-obsidian mb-2">원하는 게임이 있으신가요?</h3>
                    <p className="text-foreground/70 mb-4">새로운 아이디어가 있다면 언제든 말씀해주세요!</p>
                    <Button variant="outline">의견 보내기</Button>
                </div>
            </div>
        </div>
    );
}
